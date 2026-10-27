import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import path from "node:path";
import {sameAnswers,summariseSet,validSelection} from "./question-bank/quiz-core.ts";
import type {ChoiceKey,ExamData,Question} from "./question-bank/quiz-core.ts";

const root=path.resolve("lib/question-bank");
const en:ExamData=JSON.parse(readFileSync(path.join(root,"exams-en.json"),"utf8"));
const vi:ExamData=JSON.parse(readFileSync(path.join(root,"exams-vi.json"),"utf8"));
const keyList=["A","B","C","D","E"];
const numberOfQuestions=en.exam_sets.reduce((sum,set)=>sum+set.questions.length,0);

test("Seven practice sets have exactly 60 valid questions per language, mixing single and multiple answers",()=>{
 for(const [language,data] of [["en",en],["vi",vi]] as const){
  assert.equal(data.language,language);
  assert.equal(data.questions_per_set,60);
  assert.equal(data.total_questions,420);
  assert.equal(data.exam_sets.length,7);
  const all=data.exam_sets.flatMap(set=>set.questions);
  assert.equal(all.length,420);
  assert.equal(new Set(all.map(q=>q.id)).size,420);
  data.exam_sets.forEach((set,i)=>{
   const id="SET"+String(i+1).padStart(2,"0");
   assert.equal(set.set_id,id);
   assert.equal(set.questions.length,60);
   for(const [index,q] of set.questions.entries()){
    assert.equal(q.id,id+"-Q"+String(index+1).padStart(2,"0"));
    assert.match(q.domain_code,/^D[1-5]$/);
    assert.ok(q.question.trim().length>0);
    assert.ok(q.explanation.trim().length>0);
    assert.ok(q.selection_instruction.trim().length>0);
    assert.ok(q.options.every(o=>o.text.trim().length>0));
    assert.deepEqual(q.options.map(o=>o.key),keyList.slice(0,q.options.length));
    assert.ok(q.question_type==="single_answer"||q.question_type==="multiple_response");
    assert.ok(q.select_count===1||q.select_count===2||q.select_count===3);
    assert.equal(q.options.length,q.question_type==="single_answer"?4:5);
    assert.equal(q.select_count===1,q.question_type==="single_answer");
    assert.equal(q.answer.length,q.select_count);
    assert.equal(new Set(q.answer).size,q.answer.length);
    assert.ok(q.answer.every(key=>q.options.some(opt=>opt.key===key)));
    assert.ok(Array.isArray(q.sources));
   }
  });
 }
});

test("All 420 English and Vietnamese question pairs match by ID, answer set, option keys and selection count",()=>{
 for(let set=0;set<7;set++){
  const e=en.exam_sets[set],v=vi.exam_sets[set];
  assert.equal(e.set_id,v.set_id);
  for(let index=0;index<60;index++){
   const x=e.questions[index],y=v.questions[index];
   assert.equal(x.id,y.id);
   assert.equal(x.domain_code,y.domain_code);
   assert.equal(x.question_type,y.question_type);
   assert.equal(x.select_count,y.select_count);
   assert.ok(sameAnswers(x.answer,y.answer));
   assert.deepEqual(x.options.map(o=>o.key),y.options.map(o=>o.key));
  }
 }
});

test("Multiple-response questions receive credit only for the full answer set (order independent)",()=>{
 const questions=en.exam_sets.flatMap(set=>set.questions);
 const single=questions.find(q=>q.select_count===1)!;
 const double=questions.find(q=>q.select_count===2)!;
 const triple=questions.find(q=>q.select_count===3)!;
 assert.equal(numberOfQuestions,420);
 for(const q of [single,double,triple]){
  assert.equal(sameAnswers(q.answer,q.answer),true);
  assert.equal(sameAnswers([...q.answer].reverse(),q.answer),true);
  assert.equal(sameAnswers(q.answer.slice(0,-1),q.answer),false);
  assert.equal(sameAnswers([...q.answer,q.answer[0]],q.answer),false);
  const notCorrect=q.options.find(o=>!q.answer.includes(o.key))!.key;
  assert.equal(sameAnswers([...q.answer.slice(0,-1),notCorrect],q.answer),false);
  assert.deepEqual(validSelection([...q.answer].reverse(),q,true),[...q.answer].reverse());
  assert.equal(validSelection([q.answer[0],q.answer[0]],q,true),null);
 }
 assert.equal(validSelection([double.answer[0]],double,false)?.length,1);
 assert.equal(validSelection([single.answer[0]],single,false),null);
 const result=summariseSet({set_id:"test",questions:[single,double,triple]},{
  [single.id]:[...single.answer],
  [double.id]:double.answer.slice(0,1) as ChoiceKey[],
  [triple.id]:[...triple.answer].reverse(),
 });
 assert.deepEqual(result,{id:"test",total:3,answered:3,correct:2});
});

test("UI uses seven set labels, five-option controls, validated multi-answer submission and new progress edition",()=>{
 const content=readFileSync("app/components/QuestionBank.tsx","utf8");
 assert.match(content,/setIds=bank\.vi\.exam_sets/);
 assert.match(content,/data\.total_questions/);
 assert.match(content,/question\.options\.map/);
 assert.match(content,/question\.selection_instruction/);
 assert.match(content,/sameAnswers/);
 assert.match(content,/question\.question_type==="multiple_response"/);
 assert.match(content,/draft\.length!==question\.select_count/);
 assert.match(content,/setLanguage\("vi"\)/);
 assert.match(content,/setLanguage\("en"\)/);
 assert.match(content,/ccarf-question-bank-mixed-7-sets-v2/);
 assert.match(content,/localStorage\.setItem/);
 assert.match(content,/resetSet/);
});
