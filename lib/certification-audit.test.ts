import { test } from "node:test";
import assert from "node:assert/strict";
import { foundationLessons } from "./foundation-study.ts";
import { lessons } from "./agentic-course.ts";
import { examDecisions } from "./exam-decisions.ts";

test("7 bài đều có decision matrix phản ánh tình huống thi", () => {
  assert.deepEqual(Object.keys(examDecisions).map(Number), [1, 2, 3, 4, 5, 6, 7]);
  for (const [number, rules] of Object.entries(examDecisions)) {
    assert.ok(rules.length >= 4, `Lesson ${number} cần >=4 decision cases`);
    for (const rule of rules) {
      assert.ok(rule.symptom.length > 30 && rule.action.length > 12 && rule.because.length > 30);
    }
  }
});

test("Lesson 1–2 đủ lifecycle/orchestration topics, câu hỏi và nguồn", () => {
  for (const number of [1, 2] as const) {
    const lesson = foundationLessons[number];
    assert.equal(lesson.number, number);
    assert.ok(lesson.goal.length > 100);
    assert.ok(lesson.bridge.includes("Lesson") || lesson.bridge.includes("Bài"));
    assert.ok(lesson.source.includes(`1-${number}-`));
    assert.ok(lesson.topics.length >= 7);
    assert.ok(lesson.quiz.length >= 10);
    const seen = new Set<string>();
    for (const topic of lesson.topics) {
      assert.ok(topic.explanation.length > 100 && topic.english && topic.examRule.length > 20);
    }
    for (const q of lesson.quiz) {
      assert.equal(q.choices.length, 4);
      assert.ok(q.correct >= 0 && q.correct <= 3);
      assert.ok(q.explanation.length >= 50 && q.concept);
      assert.ok(!seen.has(q.question), "Câu hỏi bị trùng: " + q.question);
      seen.add(q.question);
    }
  }
});

test("Lộ trình 1.1–1.7 liên kết nhau và phân biệt API demo", () => {
  assert.match(JSON.stringify(foundationLessons[1]), /tool_use/);
  assert.match(JSON.stringify(foundationLessons[2]), /hub|coordinator/i);
  assert.match(JSON.stringify(examDecisions[3]), /source|metadata/);
  assert.match(JSON.stringify(lessons[4]), /programmatic|gate/i);
  assert.match(JSON.stringify(lessons[5]), /PreToolUse|PostToolUse/);
  assert.match(JSON.stringify(lessons[6]), /attention dilution/i);
  assert.match(JSON.stringify(lessons[7]), /stale|fresh/i);
});
