import {test} from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,readFileSync,rmSync,existsSync} from "node:fs";
import {tmpdir} from "node:os";
import path from "node:path";
import {domain4} from "./domain4-course.ts";
import {lessonGlossary,glossaryMap} from "./course-glossary.ts";

test("Domain 4 has six complete bilingual lessons and eight quizzes each",()=>{
 assert.deepEqual(Object.keys(domain4).map(Number),[1,2,3,4,5,6]);
 for(const [id,entry] of Object.entries(domain4)){
  assert.equal(entry.number,Number(id));
  assert.match(entry.source,/^https:\/\/claudecertificationguide\.com\/learn\/4-prompt-engineering\/4-[1-6]-/);
  for(const lang of ["vi","en"] as const){
   const c=entry[lang];
   assert.ok(c.scenario.length>110);
   assert.ok(c.sections.length>=6);
   assert.equal(c.sections.length,c.summary.length);
   assert.equal(c.quiz.length,8);
   assert.ok(c.vocabulary.length>=8);
   assert.ok(c.lab.steps.length>=5);
   assert.ok(c.lab.commands.includes("lab:domain4"));
   assert.equal(c.lab.source,"scripts/domain4-labs.mjs");
   for(const sec of c.sections){
    assert.ok(sec.explanation.join(" ").length>150,sec.title);
    assert.ok((sec.code??"").length>35,sec.title);
   }
   for(const q of c.quiz){
    assert.equal(q.choices.length,4);
    assert.ok(q.correct>=0&&q.correct<=3);
    assert.ok(q.explanation.length>35);
   }
  }
  entry.vi.quiz.forEach((question,i)=>assert.equal(question.correct,entry.en.quiz[i].correct));
  assert.equal(lessonGlossary[40+Number(id)].length,entry.vi.vocabulary.length);
  for(const [term] of entry.vi.vocabulary)assert.ok(glossaryMap.has(term.toLowerCase()),term);
 }
});
test("Domain 4 local labs run and do not overwrite student work",()=>{
 const script=path.resolve("scripts/domain4-labs.mjs");
 const syntax=spawnSync(process.execPath,["--check",script],{encoding:"utf8"});
 assert.equal(syntax.status,0,syntax.stderr);
 const temp=mkdtempSync(path.join(tmpdir(),"domain4-labs-"));
 try{
  for(let id=1;id<=6;id++){
   const create=spawnSync(process.execPath,[script,String(id)],{cwd:temp,encoding:"utf8"});
   assert.equal(create.status,0,create.stderr);
   const dir=path.join(temp,"domain4-workspaces","lesson4"+id);
   assert.ok(existsSync(path.join(dir,"README.md")));
   const check=spawnSync(process.execPath,["check.mjs"],{cwd:dir,encoding:"utf8"});
   assert.equal(check.status,0,"4."+id+": "+check.stderr);
   assert.ok(JSON.parse(check.stdout));
   const overwrite=spawnSync(process.execPath,[script,String(id)],{cwd:temp,encoding:"utf8"});
   assert.notEqual(overwrite.status,0,"must protect existing student work");
  }
 }finally{rmSync(temp,{recursive:true,force:true});}
});
