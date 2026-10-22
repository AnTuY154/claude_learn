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

const domain4Topics = [
  ["4.1","System Prompts","explicit criteria, severity, false positives"],
  ["4.2","Few-Shot Prompting","worked examples, routing, extraction"],
  ["4.3","Structured Output","JSON Schema, tool_choice, nullable fields"],
  ["4.4","Validation & Retry","semantic checks, feedback, escalation"],
  ["4.5","Batch Processing","latency, 24h window, custom_id"],
  ["4.6","Multi-Pass Review","independent reviewer, cross-file checks"],
];

const domain3Topics = [
  ["3.1","CLAUDE.md Hierarchy","user / project / directory / imports"],
  ["3.2","Slash Commands & Skills","SKILL.md, context: fork, frontmatter"],
  ["3.3","Path-Specific Rules","YAML paths, glob patterns, /context"],
  ["3.4","Plan Mode & Direct Execution","ambiguity, hybrid, Explore"],
  ["3.5","Iterative Refinement","examples, tests, interview feedback"],
  ["3.6","CI/CD Integration","claude -p, JSON, separate review"]
];

export default function Home() {
  return <main className="lesson-page course-home">
    <div className="lesson-hero">
      <p>Claude Certified Architect · Domains 01 + 02 + 03 + 04</p>
      <h1>Claude Certified Architect<br/>Domains 1–4</h1>
      <h2>24 bài học song ngữ: kiến thức nền tảng, ví dụ JavaScript thực tế, từ vựng, trắc nghiệm và Build Exercise theo giáo trình.</h2>
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
    <div className="section-heading domain2-home-heading"><span>Domain 03 · Claude Code Configuration &amp; Workflows</span><h2>Claude Code Configuration — Chọn bài học</h2></div>
    <div className="course-home-grid">
      {domain3Topics.map(([label,title,subtitle],index)=>(
        <Link href={`/domain3/lesson${index+1}`} key={label} className="course-home-item">
          <span>{label}</span><h3>{title}</h3><p>{subtitle}</p><b>Đọc bài →</b>
        </Link>
      ))}
    </div>
    <div className="section-heading domain2-home-heading"><span>Domain 04 · Prompt Engineering &amp; Structured Output</span><h2>Prompt Engineering — Chọn bài học</h2></div>
    <div className="course-home-grid">
      {domain4Topics.map(([label,title,subtitle],index)=>(
        <Link href={`/domain4/lesson${index+1}`} key={label} className="course-home-item">
          <span>{label}</span><h3>{title}</h3><p>{subtitle}</p><b>Đọc bài →</b>
        </Link>
      ))}
    </div>
  </main>;
}
