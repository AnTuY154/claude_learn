import Anthropic from "@anthropic-ai/sdk";
import {
  WEB_SEARCH_LIMITATION,
  buildCoordinatorPrompt,
  buildRefinementTasks,
  buildSubagentPrompt,
  coveragePercent,
  extractJson,
  normalizeCoverage,
  normalizePlan,
  type AgentKind,
  type CoverageItem,
  type Finding,
  type ResearchTask,
} from "@/lib/research";

const client = new Anthropic();
const model = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";
const MAX_REFINEMENT_ROUNDS = 2;
const COVERAGE_TARGET = 100;

// Sonnet 5.5 dùng "between_tools"; Haiku 5.5 và các model hỗ trợ tắt thinking dùng "disabled".
const thinking = model.includes("sonnet-5-5")
  ? { type: "between_tools" as const }
  : { type: "disabled" as const };

type TraceEvent = {
  stage: string;
  actor: "coordinator" | AgentKind;
  note: string;
  detail?: object;
};

const agentSystems: Record<AgentKind, string> = {
  web: "Bạn là web research subagent độc lập. Không được giao tiếp trực tiếp với agent khác. Live browsing chưa bật, vì vậy phải đánh dấu thông tin cần xác minh.",
  document: "Bạn là document analysis subagent độc lập. Chỉ dùng tài liệu coordinator cung cấp và nói rõ khi tài liệu chưa đủ.",
};

// PHẦN 1 — GỌI CLAUDE: mọi lời gọi dùng chung hàm này và giữ lại raw response để hiển thị trong debug trace.
async function askClaude(system: string, prompt: string, maxTokens = 1200) {
  const request = {
    model,
    max_tokens: maxTokens,
    // Lab ưu tiên output ngắn, rẻ và dễ quan sát nên không dùng up-front thinking.
    thinking,
    system,
    messages: [{ role: "user" as const, content: prompt }],
  };
  const response = await client.messages.create(request);
  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");
  if (!text) {
    const blockTypes = response.content.map((block) => block.type).join(", ") || "none";
    throw new Error(`Claude không trả text (stop_reason: ${response.stop_reason}, blocks: ${blockTypes}).`);
  }
  return { request, response, text };
}

// PHẦN 1.1 — STRUCTURED OUTPUT: JSON sai được sửa tối đa 1 lần, không lặp vô hạn.
async function askStructured<T>(
  system: string,
  prompt: string,
  validate: (value: unknown) => T,
) {
  const calls: Awaited<ReturnType<typeof askClaude>>[] = [];
  let correction = "";
  let lastError = "JSON không hợp lệ";

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const call = await askClaude(system, prompt + correction, 1600);
    calls.push(call);
    try {
      return { value: validate(extractJson(call.text)), calls };
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
      correction = `\n\nLần trước không hợp lệ: ${lastError}. Hãy sửa và chỉ trả lại JSON hoàn chỉnh.\nRESPONSE CŨ\n${call.text}`;
    }
  }
  throw new Error(`Claude không tạo được structured output: ${lastError}`);
}

// PHẦN 2 — ĐÁNH GIÁ COVERAGE: coordinator yêu cầu Claude chấm từng subtopic, không tự chấm bằng UI.
function buildCoveragePrompt(topic: string, goal: string, tasks: ResearchTask[], findings: Finding[]) {
  return `ORIGINAL TOPIC\n${topic}\n\nRESEARCH GOAL\n${goal}\n\nPLANNED SUBTOPICS\n${JSON.stringify(tasks)}\n\nFINDINGS\n${JSON.stringify(findings)}\n\nAssess breadth against the ORIGINAL TOPIC, not only the planned tasks. Add an item with status "missing" for every important category the coordinator failed to plan. For renewable energy, explicitly assess solar, wind, geothermal, tidal, biomass, and fusion. Return JSON only:\n{"coverage":[{"subtopic":"...","status":"well-covered|partial|missing","reason":"...","suggested_agent":"web|document"}]}`;
}

// PHẦN 3 — COORDINATOR: đây là hub trung tâm; subagents không gọi hoặc gửi dữ liệu trực tiếp cho nhau.
async function researchCoordinator(topic: string, documentContext: string) {
  const trace: TraceEvent[] = [{
    stage: "received",
    actor: "coordinator",
    note: "Coordinator nhận topic và document context.",
    detail: { topic, documentContext },
  }];

  // BƯỚC 3.1 — CHIA VIỆC: tạo ít nhất 5 subtopics đủ rộng và chọn web/document agent cho từng task.
  const planPrompt = buildCoordinatorPrompt(topic, documentContext);
  const planResult = await askStructured(
    "Bạn là research coordinator trong kiến trúc hub-and-spoke. Chia scope rộng, chọn agent phù hợp và chỉ trả JSON hợp lệ.",
    planPrompt,
    (value) => normalizePlan(value, Boolean(documentContext)),
  );
  const plan = planResult.value;
  trace.push({
    stage: "decomposition",
    actor: "coordinator",
    note: `Coordinator đã chia thành ${plan.tasks.length} task.`,
    detail: { calls: planResult.calls.map(({ request, response }) => ({ request, response })), plan },
  });

  const findings: Finding[] = [];

  // BƯỚC 3.2 — AGENT NHẬN TASK: mỗi invocation nhận explicit topic, goal, task, document và prior findings.
  async function runTasks(tasks: ResearchTask[], iteration: number) {
    // Các agent trong cùng một vòng chạy song song và cùng nhận snapshot context từ coordinator.
    const priorFindings = findings.map((finding) => ({
      ...finding,
      content: finding.content.slice(0, 800),
    }));
    const batch = await Promise.all(tasks.map(async (task): Promise<Finding> => {
      const prompt = buildSubagentPrompt({
        topic,
        researchGoal: plan.researchGoal,
        task,
        documentContext,
        priorFindings,
      });
      const agentCall = await askClaude(agentSystems[task.agent], prompt);
      const finding = { task, content: agentCall.text, iteration };
      trace.push({
        stage: "subagent",
        actor: task.agent,
        note: `${task.agent} agent hoàn tất “${task.title}” ở vòng ${iteration}.`,
        detail: { assignedTask: task, request: agentCall.request, response: agentCall.response },
      });
      return finding;
    }));
    findings.push(...batch);
  }

  // BƯỚC 3.3 — NHẬN VÀ CHẤM KẾT QUẢ: coordinator gom findings rồi tìm phần partial/missing.
  async function evaluateCoverage(iteration: number): Promise<CoverageItem[]> {
    const coverageResult = await askStructured(
      "Bạn là coverage evaluator của coordinator. Chấm độ đầy đủ theo evidence và chỉ trả JSON hợp lệ.",
      buildCoveragePrompt(topic, plan.researchGoal, plan.tasks, findings),
      normalizeCoverage,
    );
    const coverage = coverageResult.value;
    trace.push({
      stage: "coverage",
      actor: "coordinator",
      note: `Coverage vòng ${iteration}: ${coveragePercent(coverage)}%.`,
      detail: { calls: coverageResult.calls.map(({ request, response }) => ({ request, response })), coverage },
    });
    return coverage;
  }

  await runTasks(plan.tasks, 0);
  let coverage = await evaluateCoverage(0);
  let iterations = 0;

  // BƯỚC 3.4 — REFINEMENT LOOP: chỉ giao lại gap; dừng khi đạt 100% hoặc chạm tối đa 2 vòng.
  while (coveragePercent(coverage) < COVERAGE_TARGET && iterations < MAX_REFINEMENT_ROUNDS) {
    const followUpTasks = buildRefinementTasks(coverage, Boolean(documentContext)).slice(0, 3);
    if (!followUpTasks.length) break;
    iterations += 1;
    trace.push({
      stage: "refinement",
      actor: "coordinator",
      note: `Coordinator giao lại ${followUpTasks.length} coverage gap ở vòng ${iterations}.`,
      detail: { tasks: followUpTasks },
    });
    await runTasks(followUpTasks, iterations);
    coverage = await evaluateCoverage(iterations);
  }

  // BƯỚC 3.5 — TỔNG HỢP: coordinator nhận toàn bộ findings + coverage và tạo report cuối.
  const synthesisPrompt = `ORIGINAL TOPIC\n${topic}\n\nRESEARCH GOAL\n${plan.researchGoal}\n\nFINDINGS\n${JSON.stringify(findings)}\n\nFINAL COVERAGE\n${JSON.stringify(coverage)}\n\nViết báo cáo tiếng Việt gồm: Tóm tắt, Kết quả theo subtopic, Nội dung cần xác minh, Khoảng trống còn lại và Hành động đề xuất. Không bịa nguồn.`;
  const synthesisCall = await askClaude(
    "Bạn là coordinator. Chỉ tổng hợp dữ liệu subagents đã trả về; giữ nguyên uncertainty và không tuyên bố đã duyệt web.",
    synthesisPrompt,
    2000,
  );
  trace.push({
    stage: "synthesis",
    actor: "coordinator",
    note: "Coordinator đã tổng hợp báo cáo cuối và kết thúc.",
    detail: { request: synthesisCall.request, response: synthesisCall.response },
  });

  return {
    plan,
    report: synthesisCall.text,
    coverage,
    coveragePercent: coveragePercent(coverage),
    iterations,
    limitation: WEB_SEARCH_LIMITATION,
    trace,
  };
}

// PHẦN 4 — API ROUTE: validate dữ liệu ở trust boundary rồi mới chuyển cho coordinator.
export async function POST(request: Request) {
  let body: { topic?: unknown; documentContext?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body phải là JSON.", trace: [] }, { status: 400 });
  }

  if (typeof body.topic !== "string" || !body.topic.trim() || body.topic.length > 500) {
    return Response.json({ error: "Topic phải có từ 1 đến 500 ký tự.", trace: [] }, { status: 400 });
  }
  if (body.documentContext !== undefined && typeof body.documentContext !== "string") {
    return Response.json({ error: "documentContext phải là chuỗi.", trace: [] }, { status: 400 });
  }
  const documentContext = String(body.documentContext ?? "").trim();
  if (documentContext.length > 12_000) {
    return Response.json({ error: "Document context tối đa 12.000 ký tự.", trace: [] }, { status: 400 });
  }

  try {
    return Response.json(await researchCoordinator(body.topic.trim(), documentContext));
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "Research coordinator gặp lỗi.";
    const message = rawMessage.startsWith("429")
      ? "Đã chạm rate limit của Claude API. Hãy đợi khoảng một phút rồi chạy lại."
      : rawMessage;
    return Response.json(
      { error: message, trace: [{ stage: "error", actor: "coordinator", note: message }] },
      { status: 500 },
    );
  }
}
