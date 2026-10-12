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


test("Citations and spawn variants are explained in the relevant lessons", () => {
  const required = ["citation", "citations", "cite", "spawn", "spawning", "spawned", "parallel spawning", "sequential spawning", "evidence", "retrieval"];
  for (const word of required) {
    const definition = glossaryMap.get(word);
    assert.ok(definition, "Missing definition: " + word);
    assert.ok(definition.vi.length >= 6);
    assert.ok(definition.explanation.length >= 40);
  }
  for (const word of ["citations", "spawn", "spawning", "parallel spawning", "sequential spawning"]) {
    assert.ok(lessonGlossary[3].includes(word), "Lesson 1.3 should explain " + word);
  }
});

test("Technical vocabulary does not contain missing or duplicate glossary records", () => {
  const seen = new Set<string>();
  for (const entry of glossary) {
    const key = entry.term.toLowerCase();
    assert.ok(!seen.has(key), "Duplicate glossary entry: " + entry.term);
    seen.add(key);
  }
  for (const terms of Object.values(lessonGlossary)) {
    for (const term of terms) {
      assert.ok(glossaryMap.has(term.toLowerCase()), "Unknown lesson glossary term: " + term);
    }
  }
});
