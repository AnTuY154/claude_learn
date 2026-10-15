import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { domain2 } from "./domain2-course.ts";
import { glossaryMap, lessonGlossary } from "./course-glossary.ts";

test("All five Domain 2 lessons have full, structurally equivalent bilingual lessons",()=>{
  assert.deepEqual(Object.keys(domain2).map(Number),[1,2,3,4,5]);
  for(const [num,lesson] of Object.entries(domain2)){
    assert.equal(lesson.number,Number(num));
    assert.match(lesson.source,/^https:\/\/claudecertificationguide\.com\/learn\/2-tool-design-mcp\/2-[1-5]-/);
    for(const lang of ["vi","en"] as const){
      const data=lesson[lang];
      assert.ok(data.subtitle.length>=70,num+lang+" subtitle");
      assert.ok(data.scenario.length>=120,num+lang+" scenario");
      assert.ok(data.sections.length>=6,num+lang+" sections");
      assert.ok(data.summary.length>=5,num+lang+" summary");
      assert.ok(data.quiz.length>=8,num+lang+" quizzes");
      assert.ok(data.lab.steps.length>=5,num+lang+" lab steps");
      assert.ok(data.vocabulary.length>=8,num+lang+" vocabulary");
      for(const section of data.sections){
        assert.ok(section.explanation.length>=2,num+lang+" two explanations");
        assert.ok(section.explanation.join(" ").length>=130,num+lang+" section long explanation");
        assert.ok(section.keyPoint.length>=45,num+lang+" exam takeaway");
      }
      for(const q of data.quiz){
        assert.equal(q.choices.length,4);
        assert.ok(q.correct>=0&&q.correct<=3);
        assert.ok(q.explanation.length>=35);
      }
    }
    assert.equal(lesson.vi.sections.length,lesson.en.sections.length,"section count parity "+num);
    assert.equal(lesson.vi.quiz.length,lesson.en.quiz.length,"quiz count parity "+num);
    lesson.vi.quiz.forEach((q,i)=>assert.equal(q.correct,lesson.en.quiz[i].correct,"answer parity "+num+"-"+i));
    const vocabulary=lessonGlossary[Number(num)+20];
    assert.equal(vocabulary.length,lesson.vi.vocabulary.length,"inline glossary parity");
    for(const term of vocabulary)assert.ok(glossaryMap.has(term.toLowerCase()),"missing glossary definition: "+term);
  }
});

const script=path.resolve("scripts/domain2-labs.mjs");
function run(arg:string,cwd=process.cwd()){return spawnSync(process.execPath,[script,arg],{cwd,encoding:"utf8"});}

test("Domain 2 scripts have correct JS syntax and real MCP server/client source files",()=>{
  for(const file of ["scripts/domain2-core.mjs","scripts/domain2-labs.mjs","scripts/domain2-mcp-server.mjs","scripts/domain2-mcp-client.mjs"]){
    const r=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});
    assert.equal(r.status,0,file+": "+r.stderr);
  }
});

test("Domain 2 local exercises 2–4 do not need an API key",()=>{
  for(const id of ["2","3","4"]){
    const p=run(id);
    assert.equal(p.status,0,"exercise 2."+id+" failed: "+p.stderr);
    assert.match(p.stdout,new RegExp("2\\."+id));
  }
});

test("Lesson 2.1 live API measurement fails closed without both credentials",()=>{
  const env={...process.env};delete env.ANTHROPIC_API_KEY;delete env.ANTHROPIC_MODEL;
  const p=spawnSync(process.execPath,[script,"1"],{encoding:"utf8",env});
  assert.notEqual(p.status,0);
  assert.match(p.stderr,/ANTHROPIC_API_KEY/);
});

test("Lesson 2.5 fixture never overwrites, traces aliases and has runnable Node tests",()=>{
  const temp=mkdtempSync(path.join(tmpdir(),"domain2-fixture-"));
  try{
    const setup=run("5",temp);
    assert.equal(setup.status,0,setup.stderr);
    const workspace=path.join(temp,"domain2-builtins-workspace");
    const files=readdirSync(path.join(workspace,"src"));
    assert.ok(files.includes("Checkout.test.js"));
    assert.ok(files.includes("OrderProcessor.test.js"));
    const barrel=readFileSync(path.join(workspace,"src/utils/index.js"),"utf8");
    assert.match(barrel,/processLegacyOrder as submitOrder/);
    const alias=readFileSync(path.join(workspace,"src/Cart.js"),"utf8");
    assert.match(alias,/submitOrder/);
    assert.doesNotMatch(alias,/processLegacyOrder/);
    const tests=spawnSync(process.execPath,["--test"],{cwd:workspace,encoding:"utf8"});
    assert.equal(tests.status,0,tests.stderr);
    assert.notEqual(run("5",temp).status,0,"setup refuses to overwrite");
  }finally{rmSync(temp,{recursive:true,force:true});}
});
