import {test} from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import path from "node:path";
import {sourceUrlAllowed,readableSource,parseLessonSelection,inspectLesson,checkModelAssessment,markdownReport} from "./course-review-core.mjs";

test("only direct HTTPS /learn URLs on the trusted origin",()=>{
 assert.equal(sourceUrlAllowed("https://claudecertificationguide.com/learn/4-prompt-engineering/4-5-batch-processing"),true);
 for(const url of ["http://claudecertificationguide.com/learn/a","https://claudecertificationguide.com.evil.test/learn/a",
   "https://claudecertificationguide.com/other","https://evil.test/learn/a",
   "https://claudecertificationguide.com/learn/a?redirect=x",
   "https://user:pass@claudecertificationguide.com/learn/a"]){
   assert.equal(sourceUrlAllowed(url),false,url);
 }
});
test("exact 30-lesson scope",()=>{
 assert.equal(parseLessonSelection("all").length,30);
 assert.deepEqual(parseLessonSelection("3.3"),["3.3"]);
 assert.deepEqual(parseLessonSelection("5.1"),["5.1"]);
 assert.throws(()=>parseLessonSelection("6.1"),/Choose --lesson/);
 assert.throws(()=>parseLessonSelection(undefined),/Choose --lesson/);
});
test("HTML source extraction requires curriculum headings",()=>{
 assert.throws(()=>readableSource("<html>Unknown</html>"),/missing critical headings/);
 const page="<main><h2>What You Need to Know</h2><p>"+
 ("The agentic loop is controlled by stop_reason and application tool results. ".repeat(40))+
 "</p><h2>Exam Traps</h2><p>Never stop merely because text is present.</p><h2>Build Exercise</h2><p>Build a loop.</p></main>";
 const txt=readableSource(page);
 assert.ok(txt.length>1800);
 assert.ok(txt.includes("What You Need to Know")&&txt.includes("Exam Traps")&&txt.includes("Build Exercise"));
});
test("structural checks catch duplicate quiz options and VI/EN key mismatches",()=>{
 const content={sections:Array.from({length:5},()=>({title:"Topic"})),
   quiz:Array.from({length:8},()=>({choices:["A","B","C","D"],correct:1,explanation:"Full explanation of why this answer is correct."})),
   lab:{steps:[1,2,3]}};
 const url="https://claudecertificationguide.com/learn/4-prompt-engineering/4-3-structured-output";
 const row={id:"4.3",source:url,objectives:[1,2,3,4,5],editorial:{source:url},
   vi:structuredClone(content),en:structuredClone(content)};
 row.en.quiz[0].correct=2;
 row.vi.quiz[1].choices=["Duplicate","Duplicate","Other","Another"];
 const errors=inspectLesson(row);
 assert.ok(errors.some(x=>x.criterion==="answer_parity"));
 assert.ok(errors.some(x=>x.criterion==="quiz_duplicate_options"));
});
test("unsupported source or website quotations are rejected",()=>{
 const source="Use stop_reason for termination; do not parse the first text block.";
 const website="The website incorrectly checks response.content[0] for completion.";
 const make=(src,web)=>({summary:"Review",findings:[{criterion:"fidelity",severity:"high",
   location:"1.1",issue:"Incorrect loop termination",source_quote:src,website_quote:web,suggested_fix:"Use stop_reason."}]});
 const valid=checkModelAssessment(make("Use stop_reason for termination","checks response.content[0]"),source,website);
 assert.equal(valid.accepted.length,1);
 assert.equal(valid.accepted[0].evidence_status,"both_quotes_present_not_semantically_adjudicated");
 const ungrounded=checkModelAssessment(make("Anthropic guarantees a perfect model","checks response.content[0]"),source,website);
 assert.equal(ungrounded.accepted.length,0);
 assert.equal(ungrounded.rejected.length,1);
 const notFound=checkModelAssessment(make("Use stop_reason for termination","No hallucinations ever"),source,website);
 assert.equal(notFound.accepted.length,0);
});
test("report warns readers when source is blocked",()=>{
 const text=markdownReport([{id:"2.2",source:"https://claudecertificationguide.com/learn/2-tool-design-mcp/2-2-structured-error-responses",
   source_status:"not_checked",review_status:"blocked",error:"HTTP 403",structural_findings:[],model:null}]);
 assert.match(text,/BLOCKED/);
 assert.match(text,/not verified claims/i);
});
test("offline smoke review never pretends to check sources or call models",()=>{
 const script=path.resolve("scripts/review-ccarf.mjs");
 const tmp=mkdtempSync(path.join(tmpdir(),"ccarf-review-"));
 try{
   const run=spawnSync(process.execPath,["--experimental-strip-types",script,"--lesson","3.3","--check-only"],
     {cwd:tmp,encoding:"utf8",env:{...process.env,ANTHROPIC_API_KEY:"",ANTHROPIC_MODEL:""}});
   assert.equal(run.status,0,run.stderr);
   const report=JSON.parse(readFileSync(path.join(tmp,"artifacts/ccarf-source-review/report.json"),"utf8"));
   assert.equal(report.counts.selected,1);
   assert.equal(report.counts.source_fetched,0);
   assert.equal(report.counts.comparisons_complete,0);
   assert.equal(report.mode,"structure_only_no_external_verification");
   const fail=spawnSync(process.execPath,["--experimental-strip-types",script,"--lesson","3.3"],
     {cwd:tmp,encoding:"utf8",env:{...process.env,ANTHROPIC_API_KEY:"",ANTHROPIC_MODEL:""}});
   assert.notEqual(fail.status,0);
   assert.match(fail.stderr,/required/);
 }finally{rmSync(tmp,{recursive:true,force:true});}
});
