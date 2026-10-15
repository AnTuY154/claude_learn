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

const domain2Topics = [
  ["2.1","Tool Interface Design","descriptions, JSON Schema, misrouting"],
  ["2.2","Structured Error Responses","isError, isRetryable, recovery"],
  ["2.3","Tool Distribution & Choice","role scope, tool_choice, least privilege"],
  ["2.4","MCP Server Integration",".mcp.json, env, resources"],
  ["2.5","Built-in Tools","Grep, Glob, Read, Edit, Bash"],
];

export default function Home() {
  return <main className="lesson-page course-home">
    <div className="lesson-hero">
      <p>Claude Certified Architect · Domains 01 + 02</p>
      <h1>Agentic Architecture<br/>+ Tool Design &amp; MCP</h1>
      <h2>12 bài học song ngữ: kiến thức nền tảng, ví dụ JavaScript thực tế, từ vựng, trắc nghiệm và Build Exercise theo giáo trình.</h2>
    </div>
    <div className="section-heading"><span>Curriculum</span><h2>Chọn bài học</h2></div>
    <div className="course-home-grid">
      {topics.map(([label, title, subtitle], index) => (
        <Link href={`/lesson${index+1}`} key={label} className="course-home-item">
          <span>{label}</span><h3>{title}</h3><p>{subtitle}</p><b>Đọc bài →</b>
        </Link>
      ))}
    </div>
    <div className="section-heading domain2-home-heading"><span>Domain 02 · Tool Design &amp; MCP Integration</span><h2>Tool Design &amp; MCP — Chọn bài học</h2></div>
    <div className="course-home-grid">
      {domain2Topics.map(([label,title,subtitle],index)=>(
        <Link href={`/domain2/lesson${index+1}`} key={label} className="course-home-item">
          <span>{label}</span><h3>{title}</h3><p>{subtitle}</p><b>Đọc bài →</b>
        </Link>
      ))}
    </div>
  </main>;
}
