import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {domain3} from "./domain3-course.ts";
import {domain4} from "./domain4-course.ts";
import {domain5} from "./domain5-course.ts";

test("Domain 3–5 explanation data does not regenerate the final two sentences as a second paragraph",()=>{
 for(const [domain,lessons] of [[3,domain3],[4,domain4],[5,domain5]] as const){
  for(const entry of Object.values(lessons))for(const locale of ["vi","en"] as const)for(const section of entry[locale].sections){
   assert.equal(section.explanation.length,1,`Duplicated paragraph at ${domain}.${entry.number} ${locale} ${section.title}`);
  }
 }
});
test("No lesson component stacks overlapping editorial lecture and summary sections",()=>{
 for(const file of ["BilingualLesson","Domain2Lesson","Domain3Lesson","Domain4Lesson","Domain5Lesson"]){
  const text=readFileSync("app/components/"+file+".tsx","utf8");
  assert.doesNotMatch(text,/<SourceVerifiedLecture/);
  assert.doesNotMatch(text,/<SourceDetailChapters/);
  assert.doesNotMatch(text,/className="lesson-summary bilingual-summary"/);
  assert.match(text,/<CurriculumExamTraps/);
  assert.match(text,/What You Need to Know/);
  assert.ok(text.indexOf("live-lab bilingual-lab")<text.indexOf("course-quiz bilingual-quiz"));
 }
});
test("Iterative refinement follows the source's five practical steps and still has a test-first lab",()=>{
 const lesson=domain3[5];
 for(const lang of ["vi","en"] as const){
  assert.equal(lesson[lang].lab.steps.length,5);
  assert.match(lesson[lang].lab.steps[0].instruction,/ba lần|three attempts/i);
  assert.match(lesson[lang].lab.steps[1].instruction,/2–3|two or three/i);
  assert.match(lesson[lang].lab.steps[2].instruction,/null/);
  assert.match(lesson[lang].lab.steps[4].instruction,/error/);
 }
 const start=readFileSync("scripts/domain3-labs.mjs","utf8");
 assert.match(start,/rejected fetch/);
 assert.match(start,/empty list/);
});
