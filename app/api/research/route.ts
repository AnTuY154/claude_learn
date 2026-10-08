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

type TraceEvent = {
  stage: string;
  iteration?: number;
  agent?: AgentKind;
  task?: ResearchTask;
  request?: unknown;
  response?: unknown;
  note?: string;
  error?: string;
};

const systems: Record<AgentKind, string> = {
  document: "You are a document-analysis subagent. Work only from context supplied by the coordinator, distinguish facts from assumptions, and never communicate with other subagents.",
  web: "You are an external-research reasoning subagent. Live browsing is unavailable, so never claim that you searched the web. Mark claims that require current-source verification. Never communicate with other subagents.",
};

async function callClaude(
  stage: string,
  system: string,
  prompt: string,
  trace: TraceEvent[],
  meta: Pick<TraceEvent, "iteration" | "agent" | "task"> = {},
) {
  const request = { model, max_tokens: 1600, system, messages: [{ role: "user" as const, content: prompt }] };
  const event: TraceEvent = { stage, ...meta, request };
  trace.push(event);
  try {
    const response = await client.messages.create(request);
    event.response = response;
    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");
    if (!text) throw new Error("Claude không trả về text");
    return text;
  } catch (error) {
    event.error = error instanceof Error ? error.message : "Claude request thất bại";
    throw error;
  }
}

function coveragePrompt(topic: string, goal: string, tasks: ResearchTask[], findings: Finding[]) {
  return `ORIGINAL TOPIC\n${topic}\n\nRESEARCH GOAL\n${goal}\n\nPLANNED SUBTOPICS\n${JSON.stringify(tasks)}\n\nFINDINGS\n${JSON.stringify(findings)}\n\nAssess every planned subtopic. Return JSON only:\n{\"coverage\":[{\"subtopic\":\"...\",\"status\":\"well-covered|partial|missing\",\"reason\":\"...\",\"suggested_agent\":\"web|document\"}]}`;
}

async function researchCoordinator(topic: string, documentContext: string) {
  const trace: TraceEvent[] = [{ stage: "runtime_capability", note: WEB_SEARCH_LIMITATION }];
  try {
    let plan: ReturnType<typeof normalizePlan> | undefined;
    let planError = "";
    for (let attempt = 1; attempt <= 2 && !plan; attempt += 1) {
      const correction = planError ? `\n\nYour previous plan was invalid: ${planError}. Return a corrected plan.` : "";
      const text = await callClaude(
        "decomposition",
        "You are a domain-general research coordinator. Decompose dynamically, route work, and return only valid JSON. Do not solve the research tasks yourself.",
        buildCoordinatorPrompt(topic, documentContext) + correction,
        trace,
        { iteration: attempt },
      );
      try {
        plan = normalizePlan(extractJson(text), Boolean(documentContext));
      } catch (error) {
        planError = error instanceof Error ? error.message : "Kế hoạch không hợp lệ";
        trace.push({ stage: "decomposition_validation", iteration: attempt, error: planError });
      }
    }
    if (!plan) throw new Error(planError || "Không tạo được research plan");

    trace.push({ stage: "agent_selection", note: `${plan.tasks.length} tasks`, response: plan.tasks });
    const findings: Finding[] = [];

    async function runTasks(tasks: ResearchTask[], iteration: number) {
      for (const task of tasks) {
        const prompt = buildSubagentPrompt({
          topic,
          researchGoal: plan!.researchGoal,
          task,
          documentContext,
          priorFindings: findings,
        });
        const content = await callClaude("subagent", systems[task.agent], prompt, trace, { iteration, agent: task.agent, task });
        findings.push({ task, content, iteration });
      }
    }

    async function evaluateCoverage(iteration: number): Promise<CoverageItem[]> {
      const text = await callClaude(
        "coverage",
        "You are a strict research coverage evaluator. Judge evidence completeness, not writing quality, and return only valid JSON.",
        coveragePrompt(topic, plan!.researchGoal, plan!.tasks, findings),
        trace,
        { iteration },
      );
      return normalizeCoverage(extractJson(text));
    }

    await runTasks(plan.tasks, 0);
    let coverage = await evaluateCoverage(0);
    let iterations = 0;

    while (iterations < MAX_REFINEMENT_ROUNDS) {
      const gaps = buildRefinementTasks(coverage, Boolean(documentContext));
      if (!gaps.length) break;
      iterations += 1;
      const targetedTasks = gaps.slice(0, 3);
      trace.push({ stage: "refinement_plan", iteration: iterations, response: targetedTasks, note: `${gaps.length} gap(s) detected` });
      await runTasks(targetedTasks, iterations);
      coverage = await evaluateCoverage(iterations);
    }

    const synthesisPrompt = `ORIGINAL TOPIC\n${topic}\n\nRESEARCH GOAL\n${plan.researchGoal}\n\nFINDINGS\n${JSON.stringify(findings)}\n\nFINAL COVERAGE\n${JSON.stringify(coverage)}\n\nWrite a structured Markdown report with: Executive summary, Findings by subtopic, Document-derived evidence, Claims requiring current web verification, Remaining gaps, and Recommended next steps. Do not invent citations or claim live web browsing.`;
    const report = await callClaude(
      "final_synthesis",
      "You are the coordinator. Synthesize only the supplied subagent findings, preserve uncertainty, and never imply direct communication between subagents.",
      synthesisPrompt,
      trace,
      { iteration: iterations },
    );

    return { ok: true as const, data: {
      report,
      coverage,
      coveragePercent: coveragePercent(coverage),
      iterations,
      plan,
      limitation: WEB_SEARCH_LIMITATION,
      trace,
    } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Research coordinator gặp lỗi";
    trace.push({ stage: "error", error: message });
    return { ok: false as const, data: { error: message, trace, limitation: WEB_SEARCH_LIMITATION } };
  }
}

export async function POST(request: Request) {
  const validationTrace: TraceEvent[] = [{ stage: "runtime_capability", note: WEB_SEARCH_LIMITATION }];
  let body: { topic?: unknown; documentContext?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body phải là JSON.", trace: validationTrace }, { status: 400 });
  }
  if (typeof body.topic !== "string" || !body.topic.trim() || body.topic.length > 500) {
    return Response.json({ error: "Topic phải có từ 1 đến 500 ký tự.", trace: validationTrace }, { status: 400 });
  }
  if (body.documentContext !== undefined && typeof body.documentContext !== "string") {
    return Response.json({ error: "documentContext phải là chuỗi.", trace: validationTrace }, { status: 400 });
  }
  const topic = body.topic.trim();
  const documentContext = String(body.documentContext ?? "").trim();
  if (documentContext.length > 12_000) {
    return Response.json({ error: "Document context tối đa 12.000 ký tự.", trace: validationTrace }, { status: 400 });
  }
  const result = await researchCoordinator(topic, documentContext);
  return Response.json(result.data, { status: result.ok ? 200 : 500 });
}
