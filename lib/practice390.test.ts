import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {restoreProgress, resultStatus, sameAnswerSet, selectionIsValid, summary} from "./practice390/core.ts";
import type {QuestionData, SourceQuestion} from "./practice390/core.ts";
const data = JSON.parse(readFileSync("lib/practice390/questions-en.json", "utf8")) as QuestionData;
const questions = data.questions;

test("The exact original 390-question bank has sequential Q1–Q390 and five accurate domain counts", () => {
  assert.equal(data.totalQuestions, 390);
  assert.equal(questions.length, 390);
  assert.deepEqual(data.domains.map(d => d.count), [102, 71, 91, 68, 58]);
  for (const [index, q] of questions.entries()) {
    assert.equal(q.id, `Q${index + 1}`);
    assert.equal(q.number, index + 1);
    assert.equal(q.options.length, 4);
    assert.deepEqual(q.options.map(o => o.id), ["A", "B", "C", "D"]);
    assert.ok(q.question.length > 20);
    assert.ok(q.options.every(o => o.text.length > 0));
    assert.ok(data.domains.some(d => d.id === q.domain && d.name === q.domainName));
    assert.equal(q.type === "multiple-select", q.selectCount === 2);
    if (q.correctAnswers !== null) {
      assert.equal(q.correctAnswers.length, q.selectCount);
      assert.equal(new Set(q.correctAnswers).size, q.selectCount);
      assert.ok(q.correctAnswers.every(k => q.options.some(o => o.id === k)));
    }
  }
  assert.equal(questions.filter(q => q.selectCount === 2).length, 77);
  assert.equal(questions.filter(q => q.correctAnswers !== null).length, 389);
  assert.equal(data.domains.reduce((total, d) => total + d.count, 0), 390);
});

test("Q123 has no scorable key; all other questions have unverified AI keys", () => {
  const q = questions[122];
  assert.equal(q.id, "Q123");
  assert.equal(q.correctAnswers, null);
  assert.equal(q.requiresReview, true);
  assert.equal(resultStatus(q, ["A"]), "ungraded");
  assert.equal(resultStatus(q, undefined), "unanswered");
  assert.equal(data.answersVerified, false);
});

test("Multi-select is graded by an exact order-independent set", () => {
  const q = questions.find(q => q.selectCount === 2 && q.correctAnswers)!;
  assert.ok(sameAnswerSet(q.correctAnswers!, [...q.correctAnswers!].reverse()));
  assert.ok(!sameAnswerSet([q.correctAnswers![0]], q.correctAnswers));
  assert.ok(!sameAnswerSet([q.correctAnswers![0], q.correctAnswers![0]], q.correctAnswers));
  assert.ok(selectionIsValid(q.correctAnswers, q, true));
  assert.ok(!selectionIsValid([q.correctAnswers![0]], q, true));
  assert.ok(selectionIsValid([q.correctAnswers![0]], q, false));
});

test("Progress restores valid submissions and fully selected but unsubmitted drafts", () => {
  const q = questions.find(q => q.selectCount === 2 && q.correctAnswers)!;
  const result = restoreProgress({current: 390, language: "en", answers: {Q123: ["A"], Q1: ["X"]}, drafts: {[q.id]: q.correctAnswers}}, questions);
  assert.equal(result?.language, "en");
  assert.equal(result?.current, 0);
  assert.deepEqual(result?.answers.Q123, ["A"]);
  assert.equal(result?.answers.Q1, undefined);
  assert.deepEqual(result?.drafts[q.id], q.correctAnswers);
});

test("Score excludes unresolved question from correct and incorrect counts", () => {
  const first = questions[0], unknown = questions[122];
  const grade = summary([first, unknown], {[first.id]: [...first.correctAnswers!], [unknown.id]: ["A"]});
  assert.deepEqual(grade, {answered: 2, graded: 1, correct: 1, incorrect: 0, ungraded: 1, remaining: 0});
});

test("/390 uses the supplied original data and a separate localStorage key", () => {
  const component = readFileSync("app/components/Practice390.tsx", "utf8");
  assert.match(component, /@\/lib\/practice390\/questions-en\.json/);
  assert.doesNotMatch(component, /question-bank\/exams-en/);
  assert.match(component, /ccarf-codingnconcepts-390-source-bank-v1/);
  assert.match(component, /localStorage\.setItem/);
  assert.match(component, /setLanguage\("vi"\)/);
  assert.match(component, /setLanguage\("en"\)/);
  assert.match(component, /question\.selectCount === 2/);
  assert.match(component, /selectionIsValid\(selection, question, true\)/);
});