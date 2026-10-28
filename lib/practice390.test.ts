import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {sameAnswers} from "./question-bank/quiz-core.ts";
type Question={id:string;domain_code:string;question:string;answer:("A"|"B"|"C"|"D"|"E")[];select_count:number;question_type:string};
type ExamSet={questions:Question[]};
type Data={exam_sets:ExamSet[]};
const en=JSON.parse(readFileSync("lib/question-bank/exams-en.json","utf8")) as Data;
const vi=JSON.parse(readFileSync("lib/question-bank/exams-vi.json","utf8")) as Data;
test("Independent /390 includes exactly 390 aligned bilingual user-provided questions",()=>{
 const e=en.exam_sets.flatMap(s=>s.questions).slice(0,390);
 const v=vi.exam_sets.flatMap(s=>s.questions).slice(0,390);
 assert.equal(e.length,390);
 assert.equal(v.length,390);
 assert.equal(new Set(e.map(q=>q.id)).size,390);
 for(let i=0;i<390;i++){
  assert.equal(e[i].id,v[i].id);
  assert.equal(e[i].domain_code,v[i].domain_code);
  assert.equal(e[i].select_count,v[i].select_count);
  assert.equal(e[i].question_type,v[i].question_type);
  assert.ok(sameAnswers(e[i].answer,v[i].answer));
 }
 assert.ok(e.some(q=>q.select_count===2));
 assert.ok(e.some(q=>q.select_count===3));
});
test("The page links the actual source, distinguishes independently sourced questions, and scores exact sets",()=>{
 const body=readFileSync("app/components/Practice390.tsx","utf8");
 assert.match(body,/sameAnswers\(selected,question\.answer\)/);
 assert.match(body,/ccarf-practice390-original-upload-bank-v1/);
 assert.match(body,/codingnconcepts\.com/);
 assert.match(body,/not a copy of Coding N Concepts/);
 assert.match(body,/question\.question_type==="multiple_response"/);
 assert.match(body,/draft\.length!==question\.select_count/);
 assert.match(body,/setLanguage\("vi"\)/);
 assert.match(body,/setLanguage\("en"\)/);
});
