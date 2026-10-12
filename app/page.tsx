import Link from "next/link";

const topics = [
  ["1.1", "Agentic Loops", "tool_use, end_turn, tool_result"],
  ["1.2", "Multi-Agent Orchestration", "coordinator, scope, refinement"],
  ["1.3", "Subagent Context Passing", "isolated context, metadata, parallel"],
  ["1.4", "Workflow Enforcement & Handoff", "prerequisite gate, human escalation"],
  ["1.5", "Agent SDK Hooks", "PreToolUse, PostToolUse, normalizer"],
  ["1.6", "Task Decomposition", "fixed vs dynamic, multi-pass"],
  ["1.7", "Session State & Resumption", "resume, fork, fresh summary"],
];

export default function Home() {
  return <main className="lesson-page course-home">
    <div className="lesson-hero">
      <p>Claude Certified Architect · Domain 01</p>
      <h1>Agentic<br/>Architecture</h1>
      <h2>Học từng bài bằng ví dụ TypeScript, decision rules, bẫy thi và trắc nghiệm tình huống.</h2>
    </div>
    <div className="section-heading"><span>Curriculum</span><h2>Chọn bài học</h2></div>
    <div className="course-home-grid">
      {topics.map(([label, title, subtitle], index) => (
        <Link href={`/lesson${index+1}`} key={label} className="course-home-item">
          <span>{label}</span><h3>{title}</h3><p>{subtitle}</p><b>Đọc bài →</b>
        </Link>
      ))}
    </div>
  </main>;
}
