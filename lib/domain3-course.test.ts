import {test} from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,readdirSync,readFileSync,rmSync,existsSync} from "node:fs";
import {tmpdir} from "node:os";
import path from "node:path";
import {domain3} from "./domain3-course.ts";
import {lessonGlossary,glossaryMap} from "./course-glossary.ts";

test("Domain 3: all six lessons have detailed matching VI/EN content",()=>{
 assert.deepEqual(Object.keys(domain3).map(Number),[1,2,3,4,5,6]);
 for(const [id,lesson] of Object.entries(domain3)){
  assert.equal(lesson.number,Number(id));
  assert.match(lesson.source,/^https:\/\/claudecertificationguide\.com\/learn\/3-claude-code-config\/3-[1-6]-/);
  for(const lang of ["vi","en"] as const){
   const c=lesson[lang];
   assert.ok(c.title&&c.scenario.length>100);
   assert.ok(c.sections.length>=6,"missing sections: "+id+lang);
   assert.equal(c.summary.length,c.sections.length);
   assert.equal(c.quiz.length,8,"need 8 questions: "+id+lang);
   assert.ok(c.vocabulary.length>=8);
   assert.ok(c.lab.steps.length>=5);
   assert.ok(c.lab.commands.includes("lab:domain3"));
   for(const s of c.sections){assert.ok(s.explanation.join(" ").length>130,s.title);assert.ok(s.code.length>40);}
   for(const q of c.quiz){assert.equal(q.choices.length,4);assert.ok(q.correct>=0&&q.correct<4);assert.ok(q.explanation.length>30);}
  }
  assert.equal(lesson.vi.sections.length,lesson.en.sections.length);
  assert.equal(lesson.vi.quiz.length,lesson.en.quiz.length);
  lesson.vi.quiz.forEach((q,i)=>assert.equal(q.correct,lesson.en.quiz[i].correct));
  assert.equal(lessonGlossary[30+Number(id)].length,lesson.vi.vocabulary.length);
  for(const term of lessonGlossary[30+Number(id)])assert.ok(glossaryMap.has(term.toLowerCase()),term);
 }
});

test("Domain 3 lab is valid JavaScript and scaffolds each sandbox without API",()=>{
 const syntax=spawnSync(process.execPath,["--check","scripts/domain3-labs.mjs"],{encoding:"utf8"});
 assert.equal(syntax.status,0,syntax.stderr);
 const temp=mkdtempSync(path.join(tmpdir(),"domain3-course-"));
 const script=path.resolve("scripts/domain3-labs.mjs");
 try{
  for(let i=1;i<=6;i++){
   const result=spawnSync(process.execPath,[script,String(i)],{cwd:temp,encoding:"utf8"});
   assert.equal(result.status,0,"3."+i+": "+result.stderr);
   const dir=path.join(temp,"domain3-workspaces","lesson3"+i);
   assert.ok(existsSync(path.join(dir,"README.md")));
   const duplicate=spawnSync(process.execPath,[script,String(i)],{cwd:temp,encoding:"utf8"});
   assert.notEqual(duplicate.status,0,"must refuse to overwrite student work");
  }
  const l1=path.join(temp,"domain3-workspaces","lesson31");
  assert.match(readFileSync(path.join(l1,"CLAUDE.md"),"utf8"),/@\.\/standards\/testing.md/);
  assert.ok(existsSync(path.join(l1,"CLAUDE.local.md")));
  const l2=path.join(temp,"domain3-workspaces","lesson32");
  assert.match(readFileSync(path.join(l2,".claude/skills/analyse-feature/SKILL.md"),"utf8"),/context: fork/);
  const l3=path.join(temp,"domain3-workspaces","lesson33");
  assert.match(readFileSync(path.join(l3,".claude/rules/testing.md"),"utf8"),/\*\*\/\*\.test\.tsx/);
  const l5=path.join(temp,"domain3-workspaces","lesson35");
  const buggy=readFileSync(path.join(l5,"src/normalise.js"),"utf8");
  const redTest=readFileSync(path.join(l5,"src/normalise.test.js"),"utf8");
  assert.match(buggy,/normalise=x=>x==null/);
  assert.match(redTest,/assert\.equal\(normalise\(null\),null\)/);
  const red=spawnSync(process.execPath,["src/normalise.test.js"],{cwd:l5,encoding:"utf8"});
  assert.notEqual(red.status,0,"TDD fixture should start red. stdout="+red.stdout+" stderr="+red.stderr+" source="+buggy);
  assert.match(red.stdout,/not ok/);
  const l6=path.join(temp,"domain3-workspaces","lesson36");
  const output=spawnSync(process.execPath,["scripts/check-review.mjs"],{cwd:l6,encoding:"utf8"});
  assert.equal(output.status,0,output.stderr);
  const findings=JSON.parse(output.stdout).newFindings;
  assert.equal(findings.length,1);
  assert.equal(findings[0].rule,"MISSING_AUDIT");
  assert.ok(existsSync(path.join(l6,".github/workflows/claude-review.example.yml")));
 }finally{rmSync(temp,{recursive:true,force:true});}
});
