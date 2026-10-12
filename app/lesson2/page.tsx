"use client";

import Link from "next/link";
import { ExamDecisionBoard } from "@/app/components/ExamDecisionBoard";
import { FoundationTheory, FoundationQuiz } from "@/app/components/FoundationStudy";
import { FormEvent, useState } from "react";

type ResearchTask = {
  id: string;
  title: string;
  goal: string;
  agent: "web" | "document";
};

type ResearchPlan = {
  researchGoal: string;
  tasks: ResearchTask[];
};

type CoverageItem = {
  subtopic: string;
  status: "well-covered" | "partial" | "missing";
  reason: string;
};

type TraceEvent = {
  stage: string;
  actor: "coordinator" | "web" | "document";
  note: string;
  detail?: object;
};

const defaultTopic = "Nghiên cứu toàn diện các công nghệ năng lượng tái tạo";
const defaultDocument = `Tài liệu nội bộ mẫu — chiến lược năng lượng
Phạm vi cần đánh giá: solar, wind, geothermal, tidal, biomass và fusion.
Tiêu chí: nguyên lý, mức độ trưởng thành, ưu điểm, hạn chế và khả năng triển khai.`;

const fiveS = [
  ["Select", "Chọn đúng specialist theo task, không gọi tất cả agent."],
  ["Split", "Chia scope đủ rộng để không bỏ sót category."],
  ["Supply", "Truyền explicit goal, task và findings cho mỗi invocation."],
  ["Synthesize", "Coordinator gom kết quả thành một câu trả lời."],
  ["Scan / refine", "Kiểm tra coverage, giao lại đúng gap và dừng khi đủ."],
];

const diagnostics = [
  ["Thiếu cả một scope/category", "Coordinator decomposition"],
  ["Có scope nhưng phân tích quá nông", "Prompt / context của subagent"],
  ["Invocation sau quên kết quả lần trước", "Missing prior context"],
  ["Nhiều agent nghiên cứu trùng nhau", "Bad scope partition"],
  ["Evidence đủ nhưng report sai", "Aggregation / synthesis"],
  ["One-shot vẫn còn khoảng trống", "Missing refinement loop"],
  ["Luôn gọi tất cả agents", "Bad dynamic selection"],
  ["Agents gọi trực tiếp lẫn nhau", "Architecture violation"],
];

const examTraps = [
  "Đổ lỗi cho subagent khi report thiếu cả category — hãy kiểm tra coordinator đã giao category đó chưa.",
  "Giả định subagent kế thừa history hoặc shared memory — mỗi invocation bắt đầu với context được truyền explicit.",
  "Cho subagents nói chuyện trực tiếp để nhanh hơn — đáp án thi đúng luôn định tuyến qua coordinator.",
  "Thêm nhiều agents để sửa decomposition hẹp — nhiều agents vẫn nhận những assignment hẹp như cũ.",
];

const buildSteps = [
  "researchCoordinator(topic) nhận một chủ đề rộng và trả structured report.",
  "Decompose thành ít nhất 5 subtopics bao phủ toàn bộ breadth.",
  "Gọi web/document agents với goal, assigned task và context explicit.",
  "Aggregate và chấm từng phần: well-covered / partial / missing.",
  "Refine đúng gap cho tới threshold hoặc chạm max iterations.",
  "Test renewable energy đủ solar, wind, geothermal, tidal, biomass và fusion — coverage 100%.",
];

export default function Lesson2Page() {
  // UI PHẦN 1 — INPUT: topic rộng và tài liệu mà coordinator sẽ truyền explicit cho document agent.
  const [topic, setTopic] = useState(defaultTopic);
  const [documentContext, setDocumentContext] = useState(defaultDocument);
  const [plan, setPlan] = useState<ResearchPlan | null>(null);
  const [report, setReport] = useState("");
  const [coverage, setCoverage] = useState<CoverageItem[]>([]);
  const [coverageScore, setCoverageScore] = useState(0);
  const [iterations, setIterations] = useState(0);
  const [limitation, setLimitation] = useState("");
  const [trace, setTrace] = useState<TraceEvent[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // UI PHẦN 2 — GỌI COORDINATOR: gửi topic + document context tới hub trung tâm.
  async function runResearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!topic.trim() || loading) return;
    setLoading(true);
    setPlan(null);
    setReport("");
    setCoverage([]);
    setCoverageScore(0);
    setIterations(0);
    setLimitation("");
    setTrace([]);
    setError("");
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, documentContext }),
      });
      const data = await response.json() as {
        plan?: ResearchPlan;
        report?: string;
        coverage?: CoverageItem[];
        coveragePercent?: number;
        iterations?: number;
        limitation?: string;
        trace?: TraceEvent[];
        error?: string;
      };
      setTrace(data.trace ?? []);
      if (!response.ok) throw new Error(data.error || "Coordinator không thể chia task.");
      setPlan(data.plan ?? null);
      setReport(data.report ?? "");
      setCoverage(data.coverage ?? []);
      setCoverageScore(data.coveragePercent ?? 0);
      setIterations(data.iterations ?? 0);
      setLimitation(data.limitation ?? "");
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
        <Link href="/lesson3">Bài 03 →</Link>
      </nav>

      <div className="lesson-shell">
        <aside className="lesson-index" aria-label="Số bài học"><span>Lesson</span><strong>02</strong><i /><small>1.2</small></aside>
        <article className="lesson-body">
          <header className="lesson-hero">
            <p>Agentic Architecture · 1.2</p>
            <h1>Multi-Agent<br />Orchestration</h1>
            <h2>Một coordinator phân rã công việc, gọi đúng specialist và giữ mọi giao tiếp ở trung tâm.</h2>
          </header>

          <section className="lesson-summary quick-recall">
            <span>Nhớ trong 20 giây</span>
            <ul>
              <li><strong>Mọi giao tiếp</strong> đi qua coordinator.</li>
              <li><strong>Subagents cô lập</strong>, không tự chia sẻ history.</li>
              <li><strong>Context phải explicit</strong> trong mỗi invocation.</li>
              <li><strong>Thiếu category</strong> là lỗi decomposition.</li>
            </ul>
          </section>

          <section className="role-grid" aria-label="Vai trò coordinator và subagent">
            <article><span>Coordinator</span><h2>Điều phối</h2><p>Hiểu yêu cầu, chia scope, chọn agent, truyền context, kiểm tra coverage và tổng hợp.</p></article>
            <article><span>Subagent</span><h2>Chuyên sâu</h2><p>Chỉ giải assigned task bằng context được cấp rồi trả kết quả về coordinator.</p></article>
          </section>

          <section className="takeaway-grid" aria-label="Lợi ích của coordinator trung tâm">
            <div><b>OBSERVABILITY</b><p>Mọi message đi qua một điểm nên có thể log và theo dõi toàn bộ luồng.</p></div>
            <div><b>ERROR HANDLING</b><p>Coordinator áp dụng cùng một chính sách retry, fallback và báo lỗi.</p></div>
            <div><b>CONTROLLED CONTEXT</b><p>Coordinator quyết định agent nào được biết dữ liệu nào.</p></div>
          </section>

          <FoundationTheory lessonNumber={2} />

          <section className="pattern-code">
            <div><span>Critical isolation principle</span><h3>Subagent không biết gì ngoài prompt hiện tại</h3></div>
            <pre>{`Coordinator conversation history
        │
        ├── explicit prompt ──▶ Subagent A ──▶ result
        │                            ✕ không shared memory
        └── result A + task B ─▶ Subagent B ──▶ result

Không tự kế thừa: system prompt · messages cũ · result agent khác
Gọi cùng một agent lần 2 = một invocation độc lập mới.`}</pre>
          </section>

          <div className="lesson-columns orchestration-responsibilities">
            <div className="lesson-sections">
              <section><h3>1. Select động</h3><p>Phân tích query rồi chỉ gọi agents cần thiết. Câu hỏi đơn giản không phải chạy toàn bộ pipeline.</p></section>
              <section><h3>2. Partition scope</h3><p>Chia các phần khác nhau theo subtopic hoặc source type để giảm trùng lặp nghiên cứu.</p></section>
              <section><h3>3. Refine lặp</h3><p>Đánh giá synthesis, phát hiện gap rồi giao targeted follow-up. Coordinator không phải dispatcher one-shot.</p></section>
              <section><h3>4. Route tập trung</h3><p>Mọi dữ liệu, lỗi và handoff đều quay về coordinator trước khi đi tiếp.</p></section>
            </div>
            <aside className="exam-card"><span>Quy tắc thi</span><p>Thiếu breadth → sửa decomposition. Thiếu depth → sửa prompt/context của task đã có.</p></aside>
          </div>

          <section className="mnemonic-section">
            <div className="section-heading"><span>Mnemonic</span><h2>Nhớ orchestration bằng 5S</h2></div>
            <ol className="five-s">{fiveS.map(([name, explanation], index) => <li key={name}><b>{index + 1}</b><div><strong>{name}</strong><p>{explanation}</p></div></li>)}</ol>
          </section>

          <section className="diagnostic-section">
            <div className="section-heading"><span>Diagnostic matrix</span><h2>Nhìn triệu chứng, tìm đúng tầng lỗi</h2></div>
            <div className="diagnostic-table-wrap"><table className="diagnostic-table"><thead><tr><th>Triệu chứng</th><th>Chẩn đoán</th></tr></thead><tbody>{diagnostics.map(([symptom, diagnosis]) => <tr key={symptom}><td>{symptom}</td><td>{diagnosis}</td></tr>)}</tbody></table></div>
          </section>

          <section className="trap-section">
            <span>4 exam traps</span><h3>Nhận diện đáp án nghe hợp lý nhưng sai kiến trúc</h3>
            <ol>{examTraps.map((trap) => <li key={trap}>{trap}</li>)}</ol>
          </section>

          <section className="practice-card">
            <span>Practice scenario · Renewable energy</span>
            <h2>Report chỉ có solar và wind. Mỗi agent đều nghiên cứu tốt phần được giao. Root cause là gì?</h2>
            <ol type="A">
              <li>Document agent thiếu nguồn</li>
              <li>Synthesis agent không tự yêu cầu thêm dữ liệu</li>
              <li>Web agent dùng query quá hẹp</li>
              <li>Coordinator chưa giao geothermal, tidal, biomass và fusion</li>
            </ol>
            <details><summary>Xem đáp án và lý do</summary><p><strong>D.</strong> Các downstream agents đều hoàn thành đúng assignment. Phần bị thiếu chưa từng được giao, nên root cause nằm ở decomposition của coordinator. Sửa search, synthesis hoặc thêm agent đều không tạo lại scope đã bị bỏ quên.</p></details>
          </section>

          <ExamDecisionBoard number={2} />

          <FoundationQuiz lessonNumber={2} />

          <section className="build-checklist">
            <div className="section-heading"><span>Build exercise</span><h2>Tự kiểm tra implementation</h2></div>
            <ul>{buildSteps.map((step, index) => <li key={step}><input id={`build-step-${index}`} type="checkbox" /><label htmlFor={`build-step-${index}`}>{step}</label></li>)}</ul>
          </section>

          <section className="application-note">
            <span>Exam model vs product hiện tại</span>
            <p><strong>Trong bài thi:</strong> chọn strict hub-and-spoke; direct subagent-to-subagent communication là sai. Claude Code hiện có thể nested delegation, nhưng đó là khả năng product, không phải đáp án mà bài thi 1.2 kiểm tra. Build Exercise bên dưới giữ mọi context đi qua coordinator. <a href="https://claudecertificationguide.com/learn/1-agentic-architecture/1-2-orchestration-patterns" target="_blank" rel="noreferrer">Đọc bài nguồn ↗</a></p>
          </section>

          {/* UI PHẦN 3 — BUILD EXERCISE: form chạy coordinator với topic và document context thật. */}
          <section className="live-lab research-lab">
            <div className="lab-heading"><div><span>Build Exercise · 60 phút</span><h2>Hub-and-Spoke Research Coordinator</h2></div><b>POST /api/research</b></div>
            <p className="research-warning"><strong>Mục tiêu:</strong> tạo ≥5 subtopics, gọi web/document agents với context explicit, chấm coverage, refine phần còn thiếu rồi tổng hợp. Live web search chưa bật nên các claim hiện tại phải được đánh dấu cần xác minh.</p>
            <form className="research-form" onSubmit={runResearch} aria-busy={loading}>
              <div className="research-form-grid">
                <div className="field"><label htmlFor="research-topic">Chủ đề nghiên cứu rộng</label><textarea id="research-topic" value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={500} /><small>Case mặc định kiểm tra đủ solar, wind, geothermal, tidal, biomass và fusion.</small></div>
                <div className="field"><label htmlFor="document-context">Document context</label><textarea id="document-context" value={documentContext} onChange={(event) => setDocumentContext(event.target.value)} maxLength={12000} /><small>Document agent chỉ biết đúng nội dung được coordinator truyền vào đây.</small></div>
              </div>
              <div className="form-foot"><span>≥5 subtopics · 2 agent types · tối đa 2 refinement</span><button disabled={loading || !topic.trim() || process.env.NEXT_PUBLIC_STATIC_HOSTING === "true"}>{loading ? "Coordinator đang điều phối…" : "Chạy Build Exercise"}<b>→</b></button></div>
            </form>

            {error && <div className="receipt receipt-error" role="alert"><span>Lỗi coordinator</span><p>{error}</p></div>}
            {/* UI PHẦN 4 — KẾT QUẢ: hiển thị coverage, report cuối và kế hoạch coordinator đã tạo. */}
            {plan && report && <section className="research-results" aria-live="polite">
              <div className="research-meta">
                <div><span>Coverage</span><strong>{coverageScore}%</strong></div>
                <div><span>Refinement</span><strong>{iterations} vòng</strong></div>
                <div><span>Subtopics</span><strong>{plan.tasks.length}</strong></div>
              </div>
              <div className="coverage-meter" aria-label={`Coverage ${coverageScore}%`}><i style={{ width: `${coverageScore}%` }} /></div><p className="research-limit"><strong>Lưu ý:</strong> Coverage % là ước lượng từ Claude trên các subtopics đã liệt kê, không phải chứng nhận nguồn chính xác hay nghiên cứu thực tế đầy đủ. Web agent trong lab này chưa có live browsing.</p>
              <div className="research-report"><span>Final synthesis</span><p>{report}</p></div>
              {limitation && <p className="research-limit">{limitation}</p>}
              <div className="section-heading research-subheading"><span>Coverage audit</span><h2>Phần nào đã đủ?</h2></div>
              <div className="coverage-list">{coverage.map((item) => <article key={item.subtopic}><span className={`coverage-pill coverage-${item.status}`}>{item.status}</span><h3>{item.subtopic}</h3><p>{item.reason}</p></article>)}</div>
              <div className="section-heading research-subheading"><span>Execution plan</span><h2>{plan.researchGoal}</h2></div>
              <div className="coverage-list">{plan.tasks.map((task) => <article key={task.id}><span className="coverage-pill coverage-well-covered">{task.agent}</span><h3>{task.title}</h3><p>{task.goal}</p></article>)}</div>
            </section>}

            {/* UI PHẦN 5 — DEBUG TRACE: xem request, raw Claude response và actor ở từng bước. */}
            <section className="trace-panel research-trace" aria-live="polite">
              <div className="trace-heading"><div><span>Orchestration trace</span><h2>Decompose → agents → coverage → refine → synthesis</h2></div><b>{trace.length} events</b></div>
              {trace.length === 0 && <div className="trace-empty">Chạy bài tập để xem request, context và toàn bộ Claude response ở từng bước.</div>}
              {trace.map((event, index) => <details key={`${event.stage}-${index}`} open><summary><span>{index + 1}. {event.stage}</span><code>{event.actor}</code></summary><div className="trace-content"><label>Action</label><pre>{event.note}</pre>{event.detail && <><label>Data</label><pre>{JSON.stringify(event.detail, null, 2)}</pre></>}</div></details>)}
            </section>
          </section>

          <footer className="lesson-footer"><Link href="/lesson1">← Agentic Loops</Link><span>02 / 07</span><Link href="/lesson3">Subagent Context Passing →</Link></footer>
        </article>
      </div>
    </main>
  );
}
