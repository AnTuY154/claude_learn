import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCoordinatorPrompt,
  buildRefinementTasks,
  buildSubagentPrompt,
  coveragePercent,
  normalizePlan,
  type Finding,
  type ResearchTask,
} from "./research.ts";

test("subagent prompt contains every explicit context boundary", () => {
  const task: ResearchTask = { id: "t1", title: "Policy", goal: "Map current rules", agent: "document" };
  const priorFindings: Finding[] = [{ task, content: "Earlier evidence", iteration: 0 }];
  const prompt = buildSubagentPrompt({
    topic: "Urban transport",
    researchGoal: "Assess feasibility",
    task,
    documentContext: "Internal policy memo",
    priorFindings,
  });
  for (const expected of ["Urban transport", "Assess feasibility", "Policy", "Internal policy memo", "Earlier evidence"]) {
    assert.match(prompt, new RegExp(expected));
  }
});

test("routes tasks by requested agent and available document context", () => {
  const raw = {
    research_goal: "Test",
    tasks: Array.from({ length: 5 }, (_, index) => ({
      id: `t${index}`,
      title: `Topic ${index}`,
      goal: `Goal ${index}`,
      agent: index === 0 ? "document" : "web",
    })),
  };
  assert.equal(normalizePlan(raw, true).tasks[0].agent, "document");
  assert.equal(normalizePlan(raw, false).tasks[0].agent, "web");
  assert.equal(normalizePlan(raw, true).tasks[1].agent, "web");
});

test("coverage gaps create targeted refinement tasks", () => {
  const coverage = [
    { subtopic: "A", status: "well-covered" as const, reason: "Complete", suggested_agent: "web" as const },
    { subtopic: "B", status: "partial" as const, reason: "Missing costs", suggested_agent: "document" as const },
    { subtopic: "C", status: "missing" as const, reason: "No evidence", suggested_agent: "web" as const },
  ];
  assert.equal(coveragePercent(coverage), 50);
  assert.deepEqual(buildRefinementTasks(coverage, true).map(({ title, agent }) => ({ title, agent })), [
    { title: "B", agent: "document" },
    { title: "C", agent: "web" },
  ]);
});

test("coordinator prompt is domain-general and accepts arbitrary topics", () => {
  const prompt = buildCoordinatorPrompt("Bảo tồn thiên văn vô tuyến", "Tài liệu trạm quan sát");
  assert.match(prompt, /Bảo tồn thiên văn vô tuyến/);
  assert.match(prompt, /at least 5 distinct subtopics/);
  assert.doesNotMatch(prompt.toLocaleLowerCase("vi"), /nước ép|hoa quả|hà nội/);
});
