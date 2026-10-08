"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type CoverageItem = {
  subtopic: string;
  status: "well-covered" | "partial" | "missing";
  reason: string;
};

type TraceEvent = {
  stage: string;
  iteration?: number;
  agent?: "web" | "document";
  task?: { title?: string };
  request?: unknown;
  response?: unknown;
  note?: string;
  error?: string;
};

const defaultTopic = "Lập kế hoạch mở cửa hàng nước ép hoa quả theo mùa tại Hà Nội";
const defaultDocument = `Tài liệu nội bộ mẫu — báo giá nhà cung cấp tháng này
Cam sành: 28.000 VND/kg · Xoài: 42.000 VND/kg · Dứa: 18.000 VND/quả
Mặt bằng dự kiến: 18.000.000 VND/tháng
Ly, nắp và ống hút: 2.200 VND/sản phẩm
Ngân sách thiết bị ban đầu: 85.000.000 VND`;

const fiveS = [
  ["Select", "Chọn đúng specialist theo task, không gọi tất cả agent."],
  ["Split", "Chia scope thành các phần rộng, không để rơi cả category."],
  ["Supply", "Truyền explicit topic, goal, task, document và prior findings."],
  ["Synthesize", "Coordinator gom evidence thành một báo cáo thống nhất."],
  ["Scan / refine", "Chấm coverage, giao follow-up đúng gap rồi mới dừng."],
];

const diagnostics = [
  ["Thiếu cả một scope/category", "Coordinator decomposition"],
  ["Có scope nhưng phân tích quá nông", "Prompt / context của subagent"],
  ["Gọi lại agent nhưng quên kết quả cũ", "Missing prior context"],
  ["Nhiều agent nghiên cứu trùng nhau", "Bad task partition"],
  ["Evidence đủ nhưng report kết luận sai", "Aggregation / synthesis"],
  ["One-shot vẫn còn khoảng trống", "Missing refinement loop"],
  ["Luôn gọi toàn bộ agent", "Bad dynamic selection"],
  ["Các agent gọi trực tiếp lẫn nhau", "Architecture violation"],
];

const examTraps = [
  "Cho subagent tự đọc toàn bộ conversation history — isolation nghĩa là context phải được coordinator truyền rõ.",
  "Sửa prompt specialist khi thiếu hẳn một category — lỗi nằm ở decomposition của coordinator.",
  "Gọi tất cả agent để “chắc chắn” — orchestration tốt phải select động theo nhu cầu.",
  "Dừng sau lượt đầu dù coverage còn partial/missing — cần refinement có threshold và max rounds.",
];

const buildChecklist = [
  "researchCoordinator(topic) hoạt động với mọi domain, không hardcode ví dụ.",
  "Coordinator tạo ít nhất 5 subtopics rộng và không chồng lặp.",
  "Có tối thiểu hai agent cô lập; không agent nào gọi agent khác.",
  "Mỗi invocation nhận explicit goal, task, document context và prior findings.",
  "Coverage dùng đúng ba trạng thái: well-covered / partial / missing.",
  "Refinement có threshold dừng và giới hạn số vòng.",
  "Test chủ đề renewable energy bao phủ đủ 6 categories và đạt 100% coverage.",
];

export default function Lesson2Page() {
  const [topic, setTopic] = useState(defaultTopic);
  const [documentContext, setDocumentContext] = useState(defaultDocument);
  const [report, setReport] = useState("");
  const [coverage, setCoverage] = useState<CoverageItem[]>([]);
  const [coverageScore, setCoverageScore] = useState(0);
  const [iterations, setIterations] = useState(0);
  const [trace, setTrace] = useState<TraceEvent[]>([]);
  const [limitation, setLimitation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runResearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!topic.trim() || loading) return;
    setLoading(true);
    setReport("");
    setCoverage([]);
    setTrace([]);
    setError("");
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, documentContext }),
      });
      const data = await response.json() as {
        report?: string;
        coverage?: CoverageItem[];
        coveragePercent?: number;
        iterations?: number;
        trace?: TraceEvent[];
        limitation?: string;
        error?: string;
      };
      setTrace(data.trace ?? []);
      setLimitation(data.limitation ?? "");
      if (!response.ok) throw new Error(data.error || "Coordinator không hoàn tất nghiên cứu.");
      setReport(data.report ?? "");
      setCoverage(data.coverage ?? []);
      setCoverageScore(data.coveragePercent ?? 0);
      setIterations(data.iterations ?? 0);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể chạy coordinator.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="lesson-page">
      <nav className="lesson-nav" aria-label="Điều hướng bài học">
        <Link href="/lesson1">← Bài 01</Link>
        <span>Agentic Architecture</span>
        <Link href="/lesson2">Claude Lab / Bài 02</Link>
      </nav>

      <div className="lesson-shell">
        <aside className="lesson-index" aria-label="Số bài học">
          <span>Lesson</span><strong>02</strong><i /><small>1.2</small>
        </aside>

        <article className="lesson-body">
          <header className="lesson-hero">
            <p>Agentic Architecture · 1.2</p>
            <h1>Multi-Agent<br />Orchestration</h1>
            <h2>Một coordinator phân rã công việc, gọi đúng specialist, rồi gom kết quả thành câu trả lời thống nhất.</h2>
          </header>

          <section className="lesson-summary quick-recall">
            <span>Nhớ trong 20 giây</span>
            <ul>
              <li><strong>Mọi giao tiếp</strong> đều đi qua coordinator.</li>
              <li><strong>Subagents cô lập</strong>, không tự chia sẻ history hay memory.</li>
              <li><strong>Context phải explicit</strong> trong từng invocation.</li>
              <li><strong>Thiếu cả category</strong> là lỗi decomposition của coordinator.</li>
            </ul>
          </section>

          <section className="role-grid" aria-label="Vai trò coordinator và subagent">
            <article><span>Coordinator</span><h2>Rộng & điều phối</h2><p>Chọn agent, chia scope, truyền context, theo dõi coverage, refinement và tổng hợp kết quả.</p></article>
            <article><span>Subagent</span><h2>Hẹp & chuyên sâu</h2><p>Giải đúng assigned task bằng context được cấp; trả evidence và uncertainty về coordinator.</p></article>
          </section>

          <section className="mnemonic-section">
            <div className="section-heading"><span>Mnemonic</span><h2>Nhớ orchestration bằng 5S</h2></div>
            <ol className="five-s">
              {fiveS.map(([name, explanation], index) => <li key={name}><b>{index + 1}</b><div><strong>{name}</strong><p>{explanation}</p></div></li>)}
            </ol>
          </section>

          <section className="diagnostic-section">
            <div className="section-heading"><span>Exam diagnostic matrix</span><h2>Nhìn triệu chứng, tìm đúng tầng lỗi</h2></div>
            <div className="diagnostic-table-wrap">
              <table className="diagnostic-table">
                <thead><tr><th>Triệu chứng</th><th>Chẩn đoán đúng</th></tr></thead>
                <tbody>{diagnostics.map(([symptom, diagnosis]) => <tr key={symptom}><td>{symptom}</td><td>{diagnosis}</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section className="trap-section">
            <span>4 exam traps</span><h3>Đừng sửa sai tầng kiến trúc</h3>
            <ol>{examTraps.map((trap) => <li key={trap}>{trap}</li>)}</ol>
          </section>

          <section className="practice-card">
            <span>Practice scenario · Renewable energy</span>
            <h2>Một report đã có thị trường, công nghệ, lưới điện, tài chính và môi trường — nhưng thiếu hoàn toàn chính sách/pháp lý. Nên sửa ở đâu?</h2>
            <ol type="A">
              <li>Viết prompt subagent dài hơn</li><li>Tăng context window</li><li>Cho agents trao đổi trực tiếp</li><li>Coordinator bổ sung category còn thiếu vào decomposition</li>
            </ol>
            <details><summary>Xem đáp án</summary><p><strong>D.</strong> Thiếu nguyên một category nghĩa là coordinator chưa chia đủ scope. Prompt specialist chỉ giúp tăng depth trong task đã được giao; nó không tự sinh ra phần việc mà coordinator bỏ sót.</p></details>
          </section>

          <section className="build-checklist">
            <div className="section-heading"><span>Build exercise</span><h2>Definition of done</h2></div>
            <ul>{buildChecklist.map((item, index) => <li key={item}><input id={`check-${index}`} type="checkbox" /><label htmlFor={`check-${index}`}>{item}</label></li>)}</ul>
          </section>

          <section className="application-note">
            <span>Exam strictness vs product demo</span>
            <p><strong>Trong bài thi:</strong> hub-and-spoke nghiêm ngặt — subagents không giao tiếp trực tiếp. <strong>Trong product hiện tại:</strong> prior findings vẫn chỉ được coordinator truyền explicit vào invocation kế tiếp, nên boundary này được giữ nguyên. Ví dụ cửa hàng nước ép bên dưới chỉ là topic mặc định dễ hiểu của UI, không phải logic hardcode trong <code>researchCoordinator(topic)</code>.</p>
          </section>

          <section className="live-lab research-lab">
            <div className="lab-heading">
              <div><span>Live orchestration lab</span><h2>Quan sát coordinator chia việc</h2></div>
              <b>POST /api/research</b>
            </div>
            <p className="research-warning"><strong>Giới hạn thật:</strong> live web search chưa được bật. “Web agent” dùng kiến thức model và đánh dấu claim cần xác minh, không giả vờ đã duyệt web. Một lần chạy có thể gọi Claude nhiều lần.</p>

            <form className="research-form" onSubmit={runResearch} aria-busy={loading}>
              <div className="research-form-grid">
                <div className="field">
                  <label htmlFor="research-topic">Chủ đề nghiên cứu</label>
                  <textarea id="research-topic" value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={500} />
                  <small>Đổi sang bất kỳ domain nào để thử tính tổng quát.</small>
                </div>
                <div className="field">
                  <label htmlFor="document-context">Document context</label>
                  <textarea id="document-context" value={documentContext} onChange={(event) => setDocumentContext(event.target.value)} maxLength={12000} />
                  <small>Không bắt buộc. Document agent chỉ dùng nội dung tại đây.</small>
                </div>
              </div>
              <div className="form-foot"><span>≥5 subtopics · tối đa 2 refinement rounds</span><button disabled={loading || !topic.trim()}>{loading ? "Đang điều phối…" : "Chạy research"}<b>→</b></button></div>
            </form>

            {error && <div className="receipt receipt-error" role="alert"><span>Lỗi coordinator</span><p>{error}</p></div>}

            {report && <section className="research-results" aria-live="polite">
              <div className="research-meta">
                <div><span>Coverage</span><strong>{coverageScore}%</strong></div>
                <div><span>Refinement</span><strong>{iterations} vòng</strong></div>
                <div><span>Subtopics</span><strong>{coverage.length}</strong></div>
              </div>
              <div className="coverage-meter" aria-label={`Coverage ${coverageScore}%`}><i style={{ width: `${coverageScore}%` }} /></div>
              <div className="coverage-list">
                {coverage.map((item) => <article key={item.subtopic}>
                  <span className={`coverage-pill coverage-${item.status}`}>{item.status}</span>
                  <h3>{item.subtopic}</h3><p>{item.reason}</p>
                </article>)}
              </div>
              <div className="research-report"><span>Final synthesis</span><p>{report}</p></div>
              {limitation && <p className="research-limit">{limitation}</p>}
            </section>}

            <section className="trace-panel research-trace" aria-live="polite">
              <div className="trace-heading"><div><span>Orchestration trace</span><h2>Plan → agents → coverage → synthesis</h2></div><b>{trace.length} events</b></div>
              {trace.length === 0 && <div className="trace-empty">Chạy research để xem prompt, context, routing và response của từng agent.</div>}
              {trace.map((event, index) => <details key={`${event.stage}-${index}`} open={event.stage === "error"}>
                <summary><span>{index + 1}. {event.stage}</span><code>{event.agent ?? "coordinator"} · vòng {event.iteration ?? 0}</code></summary>
                <div className="trace-content">
                  {event.task && <><label>Assigned task</label><pre>{JSON.stringify(event.task, null, 2)}</pre></>}
                  {event.note && <><label>Capability / decision</label><pre>{event.note}</pre></>}
                  {event.request !== undefined && <><label>Request và explicit context</label><pre>{JSON.stringify(event.request, null, 2)}</pre></>}
                  {event.response !== undefined && <><label>Full Claude response</label><pre>{JSON.stringify(event.response, null, 2)}</pre></>}
                  {event.error && <><label>Error</label><pre>{event.error}</pre></>}
                </div>
              </details>)}
            </section>
          </section>

          <footer className="lesson-footer">
            <Link href="/lesson1">← Agentic Loops</Link><span>02 / 02</span>
            <a href="https://claudecertificationguide.com/learn/1-agentic-architecture/1-2-orchestration-patterns" target="_blank" rel="noreferrer">Nguồn bài học ↗</a>
          </footer>
        </article>
      </div>
    </main>
  );
}
