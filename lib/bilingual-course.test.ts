import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { course } from "./bilingual-course.ts";

test("Seven lessons have the same bilingual topic and quiz structure", () => {
  assert.deepEqual(Object.keys(course).map(Number), [1,2,3,4,5,6,7]);
  for(const [id,lesson] of Object.entries(course)){
    assert.equal(lesson.number, Number(id));
    assert.match(lesson.source,/^https:\/\/claudecertificationguide\.com\/learn\/1-agentic-architecture\/1-[1-7]-/);
    for(const loc of ["vi","en"] as const){
      const data=lesson[loc];
      assert.ok(data.intro.length >= 90, id+" "+loc+" intro");
      assert.ok(data.bridge.length >= 50, id+" "+loc+" bridge");
      assert.ok(data.topics.length >= 5, id+" "+loc+" theory");
      assert.ok(data.summary.length >= 5, id+" "+loc+" summary");
      assert.ok(data.quiz.length >= 7, id+" "+loc+" quiz");
      assert.ok(data.steps.length >= 5, id+" "+loc+" lab steps");
      for(const t of data.topics){
        assert.ok(t.body.length >= 90,t.title+" "+loc+" incomplete lesson");
        assert.ok(t.keywords && t.note.length > 25);
      }
      for(const q of data.quiz){
        assert.equal(q.choices.length,4);
        assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4);
        assert.ok(q.explanation.length >= 35,q.question+" "+loc+" explanation");
      }
    }
    assert.equal(lesson.vi.topics.length,lesson.en.topics.length,id+" topic translation parity");
    assert.equal(lesson.vi.quiz.length,lesson.en.quiz.length,id+" question translation parity");
    lesson.vi.quiz.forEach((q,i)=>assert.equal(q.correct,lesson.en.quiz[i].correct,id+" answer parity question "+i));
  }
});

test("Lab script parses and refuses to run without an API key", () => {
  const syntax=spawnSync(process.execPath,["--check","scripts/live-labs.mjs"],{encoding:"utf8"});
  assert.equal(syntax.status,0,syntax.stderr);
  const env={...process.env};
  delete env.ANTHROPIC_API_KEY;
  const noKey=spawnSync(process.execPath,["scripts/live-labs.mjs","1"],{encoding:"utf8",env});
  assert.notEqual(noKey.status,0);
  assert.match(noKey.stderr,/Missing ANTHROPIC_API_KEY/);
});


test("Optional real Agent SDK hook/session examples pass JS syntax validation", () => {
  for(const file of ["scripts/sdk-hooks-lab.mjs","scripts/sdk-sessions-lab.mjs"]) {
    const result=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});
    assert.equal(result.status,0,file+": "+result.stderr);
  }
});
