"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { Finding } from "@/lib/context-passing";
import { Lesson3Theory } from "./Lesson3Theory";
import { Lesson3Quiz } from "./Lesson3Quiz";

type Result = {
  mode: "good" | "bad";
  findings: Finding[];
  passedContext: unknown;
  report: string;
  trace: { step: string; actor: string; note: string; durationMs?: number }[];
  limitation: string;
};

const examTraps = [
  "Subagent tự có toàn bộ history của coordinator — sai: context phải được truyền explicit.",
  "Research có citation nhưng synthesis không có → kiểm tra coordinator có bỏ source metadata hay không.",
  "Hai research task độc lập mà gọi nối tiếp → tăng latency không cần thiết.",
  "Nghĩ Promise.all là Agent tool → đây chỉ là cơ chế concurrency ở application layer.",
  "Có URL nghĩa là evidence đã được xác minh → metadata không thay thế source verification.",
];

const buildSteps = [
  "Coordinator xác định mục tiêu và chia thành web/document research độc lập.",
  "Hai research calls chạy parallel qua Promise.all.",
  "Validate findings có claim, analysis và source metadata.",
  "Coordinator chuyển toàn bộ findings cho synthesis sau khi research hoàn thành.",
  "GOOD giữ metadata; BAD cố ý lược bỏ và cho thấy citation failure.",
  "Xem trace và đối chiếu báo cáo; không tự bịa citation khi thiếu nguồn.",
];

export default function Lesson3Page() {
  const [topic, setTopic] = useState("Next.js và SEO");
  const [webSource, setWebSource] = useState(
    "Source URL: https://nextjs.org/docs/app/building-your-application/rendering\n" +
    "Demo excerpt (not a verified quotation): Next.js supports server rendering and pre-rendering."
  );
  const [documentSource, setDocumentSource] = useState(
    "Document: internal-seo-report.md\nPage 1\n" +
    "Demo internal note: team plans to measure Core Web Vitals and improve metadata. No measured SEO uplift is available."
  );
  const [mode, setMode] = useState<"good" | "bad">("good");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const staticSite = process.env.NEXT_PUBLIC_STATIC_HOSTING === "true";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (staticSite || loading || !topic.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/context-passing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, webSource, documentSource, mode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Research thất bại.");
      setResult(data as Result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="lesson-page lesson3-page">
      <nav className="lesson-nav" aria-label="Điều hướng bài học">
        <Link href="/lesson2">← Bài 02</Link>
        <span>Agentic Architecture</span>
        <a href="#lesson3-quiz">Làm bài kiểm tra →</a>
      </nav>

      <div className="lesson-shell">
        <aside className="lesson-index" aria-label="Số bài học">
          <span>Lesson</span><strong>03</strong><i /><small>1.3</small>
        </aside>

        <article className="lesson-body">
          <header className="lesson-hero">
            <p>Agentic Architecture · 1.3</p>
            <h1>Subagent<br />Context Passing</h1>
            <h2>Gọi đúng specialist chưa đủ. Coordinator phải chuyển đúng nội dung và nguồn để agent tiếp theo trả lời có căn cứ.</h2>
          </header>

          <section className="lesson-summary quick-recall">
            <span>Nhớ trong 20 giây</span>
            <ul>
              <li><strong>Isolated context:</strong> subagent không tự đọc history agent khác.</li>
              <li><strong>Explicit passing:</strong> coordinator đưa context cần thiết vào invocation.</li>
              <li><strong>Keep metadata:</strong> claim phải đi cùng URL, tài liệu và trang nếu có.</li>
              <li><strong>Schedule correctly:</strong> independent → parallel, dependent → sequential.</li>
            </ul>
          </section>

          <section className="takeaway-grid" aria-label="Ba mục tiêu bài 1.3">
            <div><b>01 / INVOKE</b><p>Định nghĩa đúng role, description, prompt và tools cho mỗi specialist.</p></div>
            <div><b>02 / PASS</b><p>Structured findings qua coordinator mà không rơi rớt attribution.</p></div>
            <div><b>03 / PROVE</b><p>Phân tích lỗi thiếu citation và nhận diện đúng exam trap.</p></div>
          </section>

          <section className="pattern-code">
            <div><span>Core mental model</span><h3>Coordinator là bộ định tuyến context</h3></div>
            <pre>{`                       COORDINATOR
                         /      \\
                 Web Research   Document Research
                    (parallel · independent)
                         \\      /
                     Findings + Metadata
                             ↓
                        COORDINATOR
                             ↓
                      Synthesis Agent
                   (dependent · sequential)`}</pre>
          </section>

          <Lesson3Theory />

          <section className="trap-section">
            <span>Certification traps</span>
            <h3>Nhận diện nguyên nhân gốc, không đoán theo triệu chứng</h3>
            <ol>{examTraps.map((trap) => <li key={trap}>{trap}</li>)}</ol>
          </section>

          <section className="application-note">
            <span>Phân biệt kiến trúc và sản phẩm</span>
            <p><strong>Trong bài thi:</strong> hiểu Task/Agent invocation, isolated context và explicit handoff. <strong>Trong repository:</strong> bài lab dùng nhiều Messages API calls với <code>Promise.all</code>, không phải Agent tool của Claude Agent SDK. Cả hai minh họa đúng nguyên lý truyền context nhưng khác cách triển khai.</p>
          </section>

          {/* QUIZ đứng trước lab: học lý thuyết → tự kiểm tra → thực hành. */}
          <Lesson3Quiz />

          <section className="build-checklist">
            <div className="section-heading"><span>Build exercise · checklist</span><h2>6 tiêu chí hoàn thành bài tập</h2></div>
            <ul>{buildSteps.map((step, index) => (
              <li key={step}>
                <input type="checkbox" id={`lesson3-step-${index}`} />
                <label htmlFor={`lesson3-step-${index}`}>{step}</label>
              </li>
            ))}</ul>
          </section>

          <section className="live-lab research-lab" id="build-exercise">
            <div className="lab-heading">
              <div><span>Build exercise · context routing</span><h2>GOOD vs BAD Context Passing</h2></div>
              <b>POST /api/context-passing</b>
            </div>
            <p className="research-warning"><strong>Mục tiêu:</strong> quan sát hai research agent chạy song song, sau đó nhìn rõ coordinator truyền gì sang synthesis. Chạy GOOD rồi BAD để hiểu vì sao bỏ metadata dẫn đến thiếu citations.</p>
            {staticSite && <div className="application-note lesson3-static-note" role="status">
              <span>GitHub Pages · static demo</span>
              <p>Phần lý thuyết và Quiz hoạt động bình thường. Lab gọi Claude API cần backend Node.js riêng; nút chạy được vô hiệu hóa để tránh báo lỗi. Không đưa API key vào client.</p>
            </div>}
            <form className="research-form" onSubmit={submit} aria-busy={loading}>
              <div className="field">
                <label htmlFor="context-topic">Research topic</label>
                <textarea id="context-topic" value={topic} onChange={e => setTopic(e.target.value)} maxLength={500} required className="lesson3-short-input" />
                <small>Chủ đề coordinator giao cho cả hai nguồn nghiên cứu.</small>
              </div>
              <div className="research-form-grid lesson3-sources">
                <div className="field">
                  <label htmlFor="context-web">Web source · có URL</label>
                  <textarea id="context-web" value={webSource} onChange={e => setWebSource(e.target.value)} maxLength={8000} required />
                  <small>Chỉ là đoạn nguồn nhập tay, không duyệt web trực tiếp.</small>
                </div>
                <div className="field">
                  <label htmlFor="context-document">Document source · có tên/trang</label>
                  <textarea id="context-document" value={documentSource} onChange={e => setDocumentSource(e.target.value)} maxLength={8000} required />
                  <small>Subagent không tự biết tài liệu nếu coordinator không cung cấp.</small>
                </div>
              </div>
              <fieldset className="lesson3-mode">
                <legend>Chế độ context passing</legend>
                <label><input type="radio" name="lesson3-mode" checked={mode === "good"} onChange={() => setMode("good")} /> GOOD — Giữ metadata</label>
                <label><input type="radio" name="lesson3-mode" checked={mode === "bad"} onChange={() => setMode("bad")} /> BAD — Bỏ metadata cố ý</label>
              </fieldset>
              <div className="form-foot">
                <span>2 research calls → 1 synthesis · API có thể phát sinh phí</span>
                <button disabled={loading || staticSite || !topic.trim() || !webSource.trim() || !documentSource.trim()}>{loading ? "Đang nghiên cứu…" : "Chạy Build Exercise"} <b>→</b></button>
              </div>
            </form>
            {error && <div className="receipt receipt-error" role="alert"><span>Research error</span><p>{error}</p></div>}
            {result && <section className="research-results" aria-live="polite">
              <div className="research-meta lesson3-metrics">
                <div><span>Research findings</span><strong>{result.findings.length}</strong></div>
                <div><span>Mode</span><strong>{result.mode.toUpperCase()}</strong></div>
                <div><span>Handoff</span><strong>1</strong></div>
              </div>
              <div className="research-report"><span>Final synthesis</span><p>{result.report}</p></div>
              <p className="research-limit">{result.limitation}</p>
              <div className="section-heading research-subheading"><span>Structured metadata</span><h2>Dữ liệu đã thu thập</h2></div>
              <div className="lesson3-json"><pre>{JSON.stringify(result.findings, null, 2)}</pre></div>
              <div className="section-heading research-subheading"><span>Explicit handoff</span><h2>Context thực gửi sang synthesis</h2></div>
              <div className="lesson3-json"><pre>{JSON.stringify(result.passedContext, null, 2)}</pre></div>
            </section>}
            <section className="trace-panel research-trace" aria-live="polite">
              <div className="trace-heading">
                <div><span>Coordinator trace</span><h2>Parallel → handoff → synthesis</h2></div>
                <b>{result?.trace.length ?? 0} events</b>
              </div>
              {!result && <div className="trace-empty">Khi chạy lab trên server, các bước điều phối sẽ xuất hiện tại đây.</div>}
              {result?.trace.map((event, index) => (
                <details key={index} open>
                  <summary><span>{index + 1}. {event.step}</span><code>{event.actor}</code></summary>
                  <div className="trace-content"><label>Ý nghĩa bước này</label><pre>{event.note}{event.durationMs === undefined ? "" : ` · ${event.durationMs} ms`}</pre></div>
                </details>
              ))}
            </section>
          </section>

          <footer className="lesson-footer">
            <Link href="/lesson2">← Multi-Agent Orchestration</Link>
            <span>03 / 03</span>
            <a href="https://claudecertificationguide.com/learn/1-agentic-architecture/1-3-subagent-invocation-context" target="_blank" rel="noreferrer">Nguồn bài học ↗</a>
          </footer>
        </article>
      </div>
    </main>
  );
}
