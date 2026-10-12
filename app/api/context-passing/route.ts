import Anthropic from "@anthropic-ai/sdk";
import {
  buildSynthesisContext, extractJson, normalizeFindings,
  type AgentName, type Finding,
} from "@/lib/context-passing";

export const runtime = "nodejs";

const client = new Anthropic();
const model = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";
type Trace = { step: string; actor: string; note: string; durationMs?: number };

// BÀI 1.3: tách lời gọi Claude riêng biệt => mỗi subagent có messages riêng,
// KHÔNG tự kế thừa cuộc hội thoại hay kết quả của agent còn lại.
async function callAgent(system: string, prompt: string, max_tokens = 1300) {
  const response = await client.messages.create({
    model, max_tokens, system, messages: [{ role: "user", content: prompt }],
  });
  const text = response.content.filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map(b => b.text).join("\n");
  if (!text) throw new Error("Agent không trả nội dung (stop_reason: " + response.stop_reason + ").");
  return text;
}

// Chạy 1 research agent với input explicit: topic + nguồn được cấp.
// Đây là source-review lab: KHÔNG có live web browsing; chỉ phân tích trích đoạn user đưa.
async function researchAgent(agent: AgentName, topic: string, source: string) {
  const sourceRule = agent === "web"
    ? "Input là trích đoạn web. Mọi finding phải có source_url chính xác được cung cấp trong input. Nếu không có URL, trả findings rỗng."
    : "Input là tài liệu nội bộ. Mọi finding phải có document_name; page_number chỉ ghi khi có nhãn trang rõ ràng, nếu không null.";
  const prompt = `TOPIC: ${topic}\nSOURCE:\n${source}\n\nTrả JSON object với findings array (tối đa 3 items). Mỗi item có claim, analysis, source_url, document_name, page_number, confidence. Chỉ trích thông tin được hỗ trợ trong SOURCE. Không tưởng tượng link/trang. Nếu thiếu dữ liệu thì trả findings: [].`;
  const text = await callAgent(
    `Bạn là ${agent} research subagent riêng biệt. ${sourceRule} Chỉ trả JSON hợp lệ, không Markdown.`,
    prompt,
  );
  return normalizeFindings(extractJson(text), agent);
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return Response.json({ error: "JSON request không hợp lệ." }, { status: 400 }); }
  const input = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const topic = typeof input.topic === "string" ? input.topic.trim() : "";
  const webSource = typeof input.webSource === "string" ? input.webSource.trim() : "";
  const documentSource = typeof input.documentSource === "string" ? input.documentSource.trim() : "";
  const mode = input.mode === "bad" ? "bad" : "good";
  if (!topic || topic.length > 500 || !webSource || !documentSource ||
      webSource.length > 8000 || documentSource.length > 8000) {
    return Response.json({ error: "Cần topic (1–500 ký tự), webSource và documentSource (1–8000 ký tự mỗi trường)." }, { status: 400 });
  }
  const trace: Trace[] = [];
  try {
    // PARALLEL: Hai agent không có dependency nên chạy cùng lúc.
    // Promise.all chờ cả hai hoàn tất; nếu một agent lỗi thì request trả lỗi.
    const started = Date.now();
    const [webFindings, documentFindings] = await Promise.all([
      researchAgent("web", topic, webSource),
      researchAgent("document", topic, documentSource),
    ]);
    trace.push({ step: "parallel", actor: "coordinator", note: "Đã hoàn thành hai research calls độc lập qua Promise.all.", durationMs: Date.now() - started });
    const findings: Finding[] = [...webFindings, ...documentFindings];
    if (!findings.length) {
      return Response.json({ error: "Không có findings đủ chứng cứ. Kiểm tra dữ liệu nguồn và URL.", trace }, { status: 422 });
    }

    // CONTEXT PASSING: Coordinator phải tự đóng gói kết quả của CẢ HAI agent.
    // Chế độ bad là lỗi cố ý: loại metadata để quan sát attribution failure.
    const context = buildSynthesisContext(findings, mode);
    trace.push({ step: "context", actor: "coordinator", note: mode === "good"
      ? "Chuyển đầy đủ claim + URL + document + page + confidence."
      : "DEMO LỖI: chỉ gửi claim + analysis; metadata bị loại bỏ." });

    // SEQUENTIAL DEPENDENCY: synthesis chỉ có thể chạy SAU research.
    // LLM không được tự tìm nguồn khác để che lỗi context bị mất.
    const report = await callAgent(
      "Bạn là synthesis subagent. Chỉ sử dụng findings được truyền trong prompt hiện tại. Mỗi kết luận cần citation từ source_url hoặc document_name + page_number (nếu có). Nếu không có metadata nguồn, đánh dấu [KHÔNG CÓ NGUỒN], không tự bịa citation. Viết tiếng Việt.",
      `TOPIC: ${topic}\nFINDINGS: ${context}\nViết báo cáo ngắn gồm kết luận theo findings, citation tương ứng và mục thông tin cần xác minh.`,
      1600,
    );
    trace.push({ step: "synthesis", actor: "synthesis", note: "Tổng hợp từ context coordinator truyền." });
    return Response.json({ mode, findings, passedContext: JSON.parse(context), report, trace,
      limitation: "Lab chỉ phân tích nguồn do người dùng nhập; không duyệt web hoặc kiểm chứng URL thực tế. Citation có metadata không đồng nghĩa nguồn đã được xác minh." });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error", trace }, { status: 500 });
  }
}
