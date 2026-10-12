/**
 * 3 independent review agents in parallel, then one synthesizer.
 * Chạy bằng npm run review:lessons; cần Anthropic API credits.
 * KHÔNG đưa API key vào source hoặc trình duyệt.
 */
import fs from "node:fs/promises";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { lessons } from "../lib/agentic-course.ts";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY chưa được cung cấp. Không chạy review để tránh yêu cầu API không hợp lệ.");
  process.exit(1);
}

const client = new Anthropic();
const model = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";
const compact = Object.values(lessons).map(({ number, title, summary, related, pillars, sections, traps, questions, exerciseSteps, source }) => ({
  number, title, summary, related, pillars, sections, traps, questions, exerciseSteps, source,
}));
const input = JSON.stringify(compact);

const roles = [
  {
    role: "Source fidelity reviewer",
    rule: `Audit factual consistency and coverage. Required source-derived concepts:
1.4 prompt vs programmatic gates, refund verification, multi-concern, structured handoff, SubagentStart/Stop beyond exam scope;
1.5 PreToolUse vs PostToolUse, updatedToolOutput, before/after side effects, normalization and PreCompact beyond guide;
1.6 fixed vs adaptive, attention dilution, per-file + cross-file integration;
1.7 resume/fork/fresh summary, stale tool results, targeted reanalysis.
No source HTML is fetched by this script: do NOT claim direct source verification.
Flag potentially overconfident absolutes and distinguish guide exam rules from SDK details.`,
  },
  {
    role: "Exam-readiness reviewer",
    rule: `Audit scenario-based decisions and distractors: 8 questions/lesson, correct answers unambiguous and explanations helpful.
Check links to preceding lessons, traps, core keywords and exercise coverage. Flag omissions, ambiguity, shallow questions.`,
  },
  {
    role: "TypeScript and pedagogy reviewer",
    rule: `Check JS/TS examples for conceptual correctness and safe financial-demo boundaries.
Check static GitHub Pages limitations, session safety, realistic tests and Vietnamese learner clarity.
The hook snippets are pseudocode; do not claim fully executable Agent SDK code.`,
  },
];

// THỰC THI SONG SONG: 3 reviewers độc lập nhận cùng snapshot, không chia sẻ history.
async function review({ role, rule }) {
  const response = await client.messages.create({
    model,
    max_tokens: 1800,
    system: `You are an independent ${role}. ${rule} Return Vietnamese Markdown with sections: Strengths, Problems (severity), Specific fixes. Do not fabricate having visited URLs.`,
    messages: [{ role: "user", content: input }],
  });
  return {
    role,
    review: response.content.filter(b => b.type === "text").map(b => b.text).join("\n"),
    usage: response.usage,
  };
}

const reviews = await Promise.all(roles.map(review));

// SYNTHESIS PHỤ THUỘC KẾT QUẢ 3 AGENTS → chạy SAU Promise.all.
// Đây là explicit context passing giống Lesson 1.3.
const synthesis = await client.messages.create({
  model,
  max_tokens: 2200,
  system: "You are the coordinator. Synthesize review reports, prioritize blockers/high/medium, identify conflicts, propose a file-by-file remediation plan in Vietnamese. Do not mark concerns fixed unless code changes actually exist.",
  messages: [{ role: "user", content: JSON.stringify(reviews.map(({ role, review }) => ({ role, review }))) }],
});

const report = [
  "# Three-agent course review",
  "Generated: " + new Date().toISOString(),
  "",
  "Reviews are model judgments, not proof of external source verification.",
  ...reviews.flatMap(({ role, review }) => ["", "## " + role, review]),
  "",
  "## Coordinator synthesis",
  synthesis.content.filter(b => b.type === "text").map(b => b.text).join("\n"),
].join("\n");

const outputPath = path.resolve("artifacts/lesson-review.md");
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, report, "utf8");
console.log("3 independent reviewers completed, followed by 1 synthesis.");
console.log("Review report:", outputPath);
