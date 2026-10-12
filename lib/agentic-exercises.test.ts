import { test } from "node:test";
import assert from "node:assert/strict";
import { runLessonSimulation } from "./agentic-exercises.ts";

test("All four lessons have safe local simulations", () => {
  for (const n of [4, 5, 6, 7]) {
    const result = runLessonSimulation(n);
    assert.ok(result.title && result.steps.length >= 3);
    assert.ok(result.steps.every(x => x.stage && x.outcome && x.explanation));
  }
});
test("Refund gate blocks before verification", () => {
  const result = runLessonSimulation(4);
  assert.equal(result.steps[0].outcome, "BLOCKED");
  assert.equal(result.steps[2].outcome, "APPROVED_IN_DEMO");
});
test("Hook simulation normalizes 3 different tool formats", () => {
  const result = runLessonSimulation(5);
  assert.equal(result.steps[0].outcome, "DENY");
  assert.equal(result.steps.length, 4);
  assert.match(result.steps[3].outcome, /2026-06-14T00:00:00.000Z.*pending/);
});
test("Session choices distinguish three purposes", () => {
  assert.deepEqual(runLessonSimulation(7).steps.map(s => s.outcome), ["RESUME","FORK","FRESH + SUMMARY"]);
});
