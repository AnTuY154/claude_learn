"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type TraceStep = {
  turn: number;
  request: unknown;
  response: { stop_reason?: string | null; [key: string]: unknown };
  toolResultMessage?: unknown;
};

const traps = [
  "Kết thúc khi thấy text block — text có thể xuất hiện cùng tool_use.",
  "Tìm câu “đã xong” trong nội dung — natural language không phải control signal.",
  "Dùng số lượt làm điều kiện hoàn tất — max loop chỉ là safety cap.",
  "Ép tool_choice = any — model có thể bị buộc gọi tool dù đã đủ dữ liệu.",
];

export default function Lesson1Page() {
  const [prompt, setPrompt] = useState("Tính tiền 2kg táo và 10 bông hoa hồng");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [trace, setTrace] = useState<TraceStep[]>([]);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setAnswer("");
    setError("");
    setTrace([]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = (await response.json()) as {
        answer?: string;
        error?: string;
        trace?: TraceStep[];
      };
      setTrace(data.trace ?? []);
      if (!response.ok) throw new Error(data.error || "Yêu cầu thất bại.");
      setAnswer(data.answer || "Claude không trả về text.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="lesson-page">
      <nav className="lesson-nav" aria-label="Điều hướng bài học">
        <Link href="/lesson1">Claude Lab / Bài 01</Link>
        <span>Agentic Architecture</span>
        <Link href="/lesson2">Bài tiếp theo →</Link>
      </nav>

      <div className="lesson-shell">
        <aside className="lesson-index" aria-label="Số bài học">
          <span>Lesson</span><strong>01</strong><i /><small>1.1</small>
        </aside>

        <article className="lesson-body">
          <header className="lesson-hero">
            <p>Agentic Architecture · 1.1</p>
            <h1>Agentic<br />Loops</h1>
            <h2>Một vòng lặp đúng không chạy đủ số lần. Nó chạy cho tới khi Claude phát tín hiệu kết thúc — hoặc chạm giới hạn an toàn.</h2>
          </header>

          <section className="lesson-summary">
            <span>Ý chính trong 30 giây</span>
            <p><code>stop_reason</code> là tín hiệu điều khiển đáng tin cậy: <code>tool_use</code> thì chạy tool và tiếp tục; <code>end_turn</code> thì trả lời người dùng và dừng.</p>
          </section>

          <section className="takeaway-grid" aria-label="Ba điểm cần nhớ">
            <div><b>01 / SIGNAL</b><p>Đọc <code>stop_reason</code>, không đoán ý từ đoạn text.</p></div>
            <div><b>02 / HISTORY</b><p>Ghi assistant response và <code>tool_result</code> vào lịch sử.</p></div>
            <div><b>03 / SAFETY</b><p><code>maxTurns = 5</code> là trần; xong ở lượt 2 thì dừng ở lượt 2.</p></div>
          </section>

          <div className="lesson-columns">
            <div className="lesson-sections">
              <section>
                <h3>Vòng lặp vận hành thế nào?</h3>
                <p>Mỗi lượt gửi toàn bộ lịch sử cho Claude. Nếu Claude yêu cầu tool, code thực thi tool, tạo một user message chứa <code>tool_result</code>, rồi gọi Claude lần nữa. Khi Claude trả <code>end_turn</code>, vòng lặp hoàn tất.</p>
              </section>
              <section>
                <h3>Ai làm việc gì?</h3>
                <ul>
                  <li><strong>Claude</strong> quyết định cần gọi tool nào và tạo câu trả lời.</li>
                  <li><strong>Code của bạn</strong> thực thi tool, quản lý history, giới hạn lượt và kiểm tra lỗi.</li>
                  <li><strong>Tool</strong> chỉ nhận input có cấu trúc và trả dữ liệu về cho Claude.</li>
                </ul>
              </section>
            </div>
            <aside className="exam-card">
              <span>Certification lens</span>
              <p>Loop termination là protocol-level control, không phải content-level guessing.</p>
            </aside>
          </div>

          <section className="pattern-code">
            <div><span>Core pattern</span><h3>Safety cap, không phải số lượt bắt buộc</h3></div>
            <pre>{`for (let turn = 0; turn < maxTurns; turn++) {
  const response = await claude(messages)

  if (response.stop_reason === "end_turn") return finalText(response)
  if (response.stop_reason !== "tool_use") throw new Error("Unexpected stop")

  messages.push(response)
  messages.push(runRequestedTools(response))
}`}</pre>
          </section>

          <section className="trap-section">
            <span>Các bẫy thường gặp</span><h3>Bốn cách làm khiến agent loop sai</h3>
            <ol>{traps.map((trap) => <li key={trap}>{trap}</li>)}</ol>
          </section>

          <section className="live-lab">
            <div className="lab-heading">
              <div><span>Live example</span><h2>Chat và xem protocol chạy thật</h2></div>
              <b>POST /api/chat</b>
            </div>

            <div className="chat-card">
              <div className="card-top"><span>Prompt gửi đến Claude</span><small>Max 5 turns</small></div>
              <form onSubmit={submit}>
                <label htmlFor="lesson-prompt">Bạn muốn Claude làm gì?</label>
                <textarea id="lesson-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={2000} />
                <div className="form-foot"><span>{prompt.length}/2000 ký tự</span><button disabled={loading || !prompt.trim()}>{loading ? "Đang chạy…" : "Chạy agent"}<b>→</b></button></div>
              </form>
              {(answer || error) && <div className={`receipt ${error ? "receipt-error" : ""}`}><span>{error ? "Lỗi" : "Kết quả cuối"}</span><p>{error || answer}</p></div>}
            </div>

            <section className="trace-panel" aria-live="polite">
              <div className="trace-heading"><div><span>Debug trace</span><h2>Request → AI response → code</h2></div><b>{trace.length} lượt</b></div>
              {trace.length === 0 && <div className="trace-empty">Chạy ví dụ để xem toàn bộ dữ liệu trao đổi ở từng lượt.</div>}
              {trace.map((step) => (
                <details key={step.turn} open>
                  <summary><span>Lượt {step.turn}</span><code>stop_reason: {step.response.stop_reason ?? "—"}</code></summary>
                  <div className="trace-content">
                    <label>1 · Request code gửi tới Claude API</label><pre>{JSON.stringify(step.request, null, 2)}</pre>
                    <label>2 · Toàn bộ response Claude trả về</label><pre>{JSON.stringify(step.response, null, 2)}</pre>
                    {step.toolResultMessage !== undefined && <div className="tool-run"><label>3 · Code chạy tool và gửi kết quả lại Claude</label><pre>{JSON.stringify(step.toolResultMessage, null, 2)}</pre></div>}
                  </div>
                </details>
              ))}
            </section>
          </section>

          <footer className="lesson-footer">
            <a href="https://claudecertificationguide.com/learn/1-agentic-architecture/1-1-agentic-loops" target="_blank" rel="noreferrer">Nguồn bài học ↗</a>
            <span>01 / 02</span>
            <Link href="/lesson2">Multi-Agent Orchestration →</Link>
          </footer>
        </article>
      </div>
    </main>
  );
}
