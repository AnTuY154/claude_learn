// Simulation dùng dữ liệu giả để học quyết định kiến trúc mà không cần API/chi phí.
// Không có giao dịch thật, không có live Agent SDK hooks hay Claude session.
export type SimulationResult = {
  title: string;
  steps: { stage: string; outcome: string; explanation: string }[];
};

function refundGate(verifiedId: string | null, targetId: string, amount: number) {
  // PREREQUISITE: application phải từ chối thao tác nếu session chưa verify đúng customer.
  if (verifiedId !== targetId) return { ok: false, status: "BLOCKED" };
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, status: "INVALID_AMOUNT" };
  return { ok: true, status: "APPROVED_IN_DEMO" };
}

function dateFromDDMMYYYY(raw: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
  if (!match) throw Error("Invalid DD/MM/YYYY");
  const [, d, m, y] = match;
  const iso = `${y}-${m}-${d}T00:00:00.000Z`;
  const date = new Date(iso);
  if (!Number.isFinite(date.valueOf()) || date.toISOString() !== iso) throw Error("Invalid calendar date");
  return iso;
}

export function runLessonSimulation(lesson: number): SimulationResult {
  if (lesson === 4) {
    const before = refundGate(null, "C-101", 250000);
    const after = refundGate("C-101", "C-101", 250000);
    return { title: "Refund prerequisite gate — mock only", steps: [
      { stage: "Model requests process_refund", outcome: before.status, explanation: "Không có verifiedCustomerId; handler từ chối trước execution." },
      { stage: "Trusted get_customer completes verification", outcome: "VERIFIED C-101", explanation: "Chỉ lớp code đáng tin cập nhật session, không lấy lời Claude tự khai." },
      { stage: "Retry process_refund", outcome: after.status, explanation: "Đây là trạng thái giả lập, không có refund thật." },
    ] };
  }
  if (lesson === 5) {
    // 3 mock tool contracts khác nhau: numeric epoch, ISO, DD/MM/YYYY.
    const raw = [
      { tool: "A", time: 1781395200, status: 200 },
      { tool: "B", time: "2026-06-14T00:00:00.000Z", status: "active" },
      { tool: "C", time: "14/06/2026", status: "P" },
    ] as const;
    const normalized = raw.map(item => {
      const date = item.tool === "A" ? new Date(Number(item.time) * 1000).toISOString()
        : item.tool === "C" ? dateFromDDMMYYYY(String(item.time)) : String(item.time);
      const status = item.tool === "A" ? "active" : item.tool === "C" ? "pending" : item.status;
      return { tool: item.tool, date, status };
    });
    return { title: "Hook boundaries — mock only", steps: [
      { stage: "PreToolUse: transfer before AML", outcome: "DENY", explanation: "Chặn trước side effect, không phải PostToolUse." },
      ...normalized.map(x => ({ stage: `PostToolUse: Tool ${x.tool}`, outcome: `${x.date} · ${x.status}`, explanation: "Normalize output của công cụ trước khi Claude xử lý." })),
    ] };
  }
  if (lesson === 6) {
    return { title: "Multi-pass review architecture — synthetic case", steps: [
      { stage: "Single pass / simulated 14 files", outcome: "Files 10–14: shallow", explanation: "Dữ liệu minh họa attention dilution, không phải kết quả review AI thật." },
      { stage: "Local passes", outcome: "14/14 files analyzed individually", explanation: "Mỗi file có lượt riêng, các lượt độc lập có thể parallel." },
      { stage: "Cross-file integration", outcome: "compare imports, API usage and repeated patterns", explanation: "Bước integration phát hiện vấn đề giữa các files mà local passes có thể bỏ sót." },
    ] };
  }
  if (lesson === 7) {
    return { title: "Choose session strategy — decision demo", steps: [
      { stage: "No changed files, continue", outcome: "RESUME", explanation: "Giữ history khi raw tool results còn đúng." },
      { stage: "Two refactor alternatives", outcome: "FORK", explanation: "Tách branch từ shared baseline; không làm mới stale results." },
      { stage: "3/50 changed files", outcome: "FRESH + SUMMARY", explanation: "Bỏ raw stale tool results, re-read changed files và dependency cần thiết." },
    ] };
  }
  throw Error("Unknown lesson: " + lesson);
}
