import { test } from "node:test";
import assert from "node:assert/strict";
import { lessons } from "./agentic-course.ts";

test("Bốn lesson đầy đủ cho ôn thi", () => {
  assert.deepEqual(Object.keys(lessons).map(Number), [4,5,6,7]);
  for (const lesson of Object.values(lessons)) {
    assert.ok(lesson.related.includes("1."), "Bài cần liên hệ bài trước");
    assert.ok(lesson.sections.length >= 5, "Đủ khái niệm chính");
    assert.ok(lesson.questions.length >= 8, "Đủ câu hỏi tình huống");
    assert.ok(lesson.traps.length >= 4, "Có exam traps");
    assert.ok(lesson.exerciseSteps.length >= 5, "Có build exercise");
    assert.ok(lesson.source.startsWith("https://"), "Có nguồn gốc");
    for (const q of lesson.questions) {
      assert.equal(q.choices.length, 4);
      assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4);
      assert.ok(q.explanation.length > 25, "Phải giải thích đáp án");
      assert.ok(q.question.length >= 20);
    }
    for (const s of lesson.sections) {
      assert.ok(s.body.length >= 60 && s.keywords.length > 0);
    }
  }
});

test("Bài 1.4-1.7 chứa core exam concepts", () => {
  const flatten = (n) => JSON.stringify(lessons[n]).toLowerCase();
  for(const value of ["prerequisite", "handoff", "verified"]) assert.ok(flatten(4).includes(value));
  for(const value of ["pretooluse", "posttooluse", "updatedtooloutput"]) assert.ok(flatten(5).includes(value));
  for(const value of ["attention dilution", "cross-file", "dynamic"]) assert.ok(flatten(6).includes(value));
  for(const value of ["resume", "fork", "stale", "summary"]) assert.ok(flatten(7).includes(value));
});
