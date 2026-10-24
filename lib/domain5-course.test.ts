import {test} from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,readFileSync,existsSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import path from "node:path";
import {domain5} from "./domain5-course.ts";
import {lessonGlossary,glossaryMap} from "./course-glossary.ts";
import {parseLessonSelection} from "./course-review-core.mjs";

test("All six Domain 5 lessons contain detailed bilingual theory and original MCQs",()=>{
 assert.deepEqual(Object.keys(domain5).map(Number),[1,2,3,4,5,6]);
 for(const [id,entry] of Object.entries(domain5)){
  assert.equal(entry.number,Number(id));
  assert.match(entry.source,/^https:\/\/claudecertificationguide\.com\/learn\/5-context-management\/5-[1-6]-/);
  for(const lang of ["vi","en"] as const){
   const c=entry[lang];
   assert.ok(c.scenario.length>100,id+" "+lang);
   assert.equal(c.sections.length,7);
   assert.equal(c.quiz.length,8);
   assert.equal(c.summary.length,c.sections.length);
   assert.equal(c.vocabulary.length,8);
   assert.ok(c.lab.steps.length>=5);
   assert.ok(c.lab.commands.includes("lab:domain5"));
   assert.equal(c.lab.source,"scripts/domain5-labs.mjs");
   for(const s of c.sections){
    assert.ok(s.explanation.join(" ").length>150,s.title);
    assert.ok((s.code||"").length>45,s.title);
    assert.ok(s.keyPoint.length>20,s.title);
   }
   for(const q of c.quiz){
    assert.equal(q.choices.length,4);
    assert.equal(new Set(q.choices.map(x=>x.toLowerCase())).size,4);
    assert.ok(q.correct>=0&&q.correct<=3);
    assert.ok(q.explanation.length>35);
   }
  }
  entry.vi.quiz.forEach((q,i)=>assert.equal(q.correct,entry.en.quiz[i].correct));
  assert.equal(lessonGlossary[50+Number(id)].length,8);
  for(const [term] of entry.vi.vocabulary)assert.ok(glossaryMap.has(term.toLowerCase()),term);
 }
 assert.equal(parseLessonSelection("all").length,30);
 assert.deepEqual(parseLessonSelection("5.6"),["5.6"]);
});

test("Domain 5 offline labs run, have assertions, and refuse to overwrite",()=>{
 const script=path.resolve("scripts/domain5-labs.mjs");
 const check=spawnSync(process.execPath,["--check",script],{encoding:"utf8"});
 assert.equal(check.status,0,check.stderr);
 const tmp=mkdtempSync(path.join(tmpdir(),"domain5-tests-"));
 try{
  for(let i=1;i<=6;i++){
   const first=spawnSync(process.execPath,[script,String(i)],{cwd:tmp,encoding:"utf8"});
   assert.equal(first.status,0,first.stderr);
   const folder=path.join(tmp,"domain5-workspaces","lesson5"+i);
   assert.ok(existsSync(path.join(folder,"fixture.json")));
   const run=spawnSync(process.execPath,["check.mjs"],{cwd:folder,encoding:"utf8"});
   assert.equal(run.status,0,run.stderr);
   assert.match(run.stdout,/PASS/);
   const second=spawnSync(process.execPath,[script,String(i)],{cwd:tmp,encoding:"utf8"});
   assert.notEqual(second.status,0,"must not overwrite learner files");
  }
 }finally{rmSync(tmp,{recursive:true,force:true});}
});
