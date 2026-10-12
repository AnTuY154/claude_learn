import { test } from "node:test";
import assert from "node:assert/strict";
import { glossary, glossaryMap, lessonGlossary } from "./course-glossary.ts";

test("All seven lessons have contextual vocabulary", () => {
  assert.deepEqual(Object.keys(lessonGlossary).map(Number),[1,2,3,4,5,6,7]);
  for (const [lesson,terms] of Object.entries(lessonGlossary)) {
    assert.ok(terms.length>=10,`Lesson ${lesson} should explain at least 10 terms`);
    assert.equal(new Set(terms.map(t=>t.toLowerCase())).size,terms.length);
    for(const name of terms) assert.ok(glossaryMap.has(name.toLowerCase()),`Missing definition: ${name}`);
  }
});

test("Terms contain meaningful Vietnamese explanations", () => {
  assert.ok(glossary.length>=75);
  for (const entry of glossary){
    assert.ok(entry.term && entry.vi.length>=6,entry.term);
    assert.ok(entry.explanation.length>=40,entry.term);
  }
  assert.match(glossaryMap.get("findings")?.vi??"",/phát hiện/);
  assert.match(glossaryMap.get("findings")?.explanation??"",/agent/);
});
