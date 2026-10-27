import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import path from "node:path";

const root=path.resolve("lib/question-bank");
type Option={key:string;text:string};
type Question={id:string;domain_code:string;domain_name:string;question:string;options:Option[];answer:string;explanation:string;sources:string[]};
type ExamSet={set_id:string;questions:Question[]};
type ExamData={language:string;questions_per_set:number;total_questions:number;exam_sets:ExamSet[]};
const en:ExamData=JSON.parse(readFileSync(path.join(root,"exams-en.json"),"utf8"));
const vi:ExamData=JSON.parse(readFileSync(path.join(root,"exams-vi.json"),"utf8"));
const keys=["A","B","C","D"];

test("All five uploaded exam sets contain exactly 60 original questions in each language",()=>{
 for(const [lang,d] of [["en",en],["vi",vi]]){
  assert.equal(d.language,lang);
  assert.equal(d.questions_per_set,60);
  assert.equal(d.total_questions,300);
  assert.equal(d.exam_sets.length,5);
  const all=d.exam_sets.flatMap(s=>s.questions);
  assert.equal(all.length,300);
  assert.equal(new Set(all.map(q=>q.id)).size,300);
  d.exam_sets.forEach((set,i)=>{
   const setId="SET0"+(i+1);
   assert.equal(set.set_id,setId);
   assert.equal(set.questions.length,60);
   for(const [index,q] of set.questions.entries()){
    assert.equal(q.id,setId+"-Q"+String(index+1).padStart(2,"0"));
    assert.ok(/^D[1-5]$/.test(q.domain_code));
    assert.equal(q.options.length,4);
    assert.deepEqual(q.options.map(o=>o.key),keys);
    assert.ok(keys.includes(q.answer));
    assert.ok(q.question.trim());
    assert.ok(q.explanation.trim());
    assert.ok(q.options.every(o=>o.text.trim()));
    assert.ok(Array.isArray(q.sources));
   }
  });
 }
});

test("The English and Vietnamese exams align exactly by IDs, domain, options, and answers",()=>{
 for(let set=0;set<5;set++){
  const e=en.exam_sets[set],v=vi.exam_sets[set];
  assert.equal(e.set_id,v.set_id);
  for(let question=0;question<60;question++){
   const x=e.questions[question],y=v.questions[question];
   assert.equal(x.id,y.id);
   assert.equal(x.domain_code,y.domain_code);
   assert.equal(x.answer,y.answer);
   assert.deepEqual(x.options.map(o=>o.key),y.options.map(o=>o.key));
  }
 }
});
test("Instant feedback only reveals the answer after selection; language selection keeps shared answers",()=>{
 const text=readFileSync("app/components/QuestionBank.tsx","utf8");
 assert.match(text,/const revealed=chosen!==undefined/);
 assert.match(text,/revealed\?<section/);
 assert.match(text,/setLanguage\("vi"\)/);
 assert.match(text,/setLanguage\("en"\)/);
 assert.match(text,/setAnswers\(old=>/);
 assert.match(text,/localStorage\.setItem/);
 assert.match(text,/resetSet/);
});
