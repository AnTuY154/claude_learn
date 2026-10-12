// LESSON 3 — Hợp đồng dữ liệu giữa các agent.
// Quan trọng: subagent độc lập, không có shared conversation history.
export type AgentName = "web" | "document";
export type Finding = {
  claim: string;
  analysis: string;
  source_url: string | null;
  document_name: string | null;
  page_number: number | null;
  confidence: "high" | "medium" | "low";
  retrieved_by: AgentName;
};
export type ResearchResult = { findings: Finding[] };

// Trust boundary: JSON từ LLM không mặc nhiên an toàn/đúng cấu trúc.
// Chỉ giữ finding có metadata truy xuất nguồn; không tự bịa citation.
export function normalizeFindings(value: unknown, agent: AgentName): Finding[] {
  if (!value || typeof value !== "object" || !("findings" in value) || !Array.isArray(value.findings)) {
    throw new Error(agent + " không trả về findings array.");
  }
  return value.findings.map((raw: unknown, index: number) => {
    if (!raw || typeof raw !== "object") throw new Error("Finding " + index + " không hợp lệ.");
    const row = raw as Record<string, unknown>;
    const claim = typeof row.claim === "string" ? row.claim.trim() : "";
    const analysis = typeof row.analysis === "string" ? row.analysis.trim() : "";
    const source_url = typeof row.source_url === "string" && /^https?:\/\//i.test(row.source_url) ? row.source_url : null;
    const document_name = typeof row.document_name === "string" && row.document_name.trim() ? row.document_name.trim() : null;
    const page_number = Number.isInteger(row.page_number) && (row.page_number as number) > 0 ? row.page_number as number : null;
    const confidence = row.confidence === "high" || row.confidence === "medium" ? row.confidence : "low";
    if (!claim || !analysis) throw new Error("Finding " + index + " thiếu claim hoặc analysis.");
    // Web findings bắt buộc có URL, document findings bắt buộc có tên tài liệu.
    if (agent === "web" && !source_url) throw new Error("Web finding thiếu source_url.");
    if (agent === "document" && !document_name) throw new Error("Document finding thiếu document_name.");
    return { claim, analysis, source_url: agent === "web" ? source_url : null,
      document_name: agent === "document" ? document_name : null,
      page_number: agent === "document" ? page_number : null, confidence, retrieved_by: agent };
  });
}

// Cố tình cho phép 'bad' để so sánh mất metadata với 'good'.
// Tuyệt đối KHÔNG dùng 'bad' để tạo báo cáo thật.
export function buildSynthesisContext(findings: Finding[], mode: "good" | "bad") {
  if (mode === "bad") return JSON.stringify(findings.map(({ claim, analysis }) => ({ claim, analysis })));
  return JSON.stringify(findings, null, 2);
}

export function extractJson(text: string): unknown {
  const cleaned = text.trim().replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/, "");
  return JSON.parse(cleaned);
}
