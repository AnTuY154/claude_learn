import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {course} from "./bilingual-course.ts";
import {domain2} from "./domain2-course.ts";
import {domain3} from "./domain3-course.ts";
import {domain4} from "./domain4-course.ts";
import {domain5} from "./domain5-course.ts";
import {sourceLearningObjectives} from "./source-learning-objectives.ts";

test("All 30 lessons preserve lecture, practical steps, original MCQs and the trusted source",()=>{
 const sources=[...Object.values(course),...Object.values(domain2),...Object.values(domain3),...Object.values(domain4),...Object.values(domain5)];
 assert.equal(sources.length,30);
 assert.equal(Object.keys(sourceLearningObjectives).length,30);
 for(const entry of sources){
  assert.ok(entry.source.startsWith("https://claudecertificationguide.com/learn/"));
  for(const locale of ["vi","en"] as const){
   const c=entry[locale];
   const topics="topics" in c?c.topics:c.sections;
   assert.ok(topics.length>=5,entry.source+" "+locale);
   assert.ok(c.quiz.length>=5,entry.source+" "+locale);
   for(const q of c.quiz){
    assert.equal(q.choices.length,4,entry.source);
    assert.equal(new Set(q.choices.map(s=>s.toLowerCase())).size,4,entry.source);
    assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<=3);
   }
   const steps="steps" in c?c.steps:c.lab.steps;
   assert.ok(steps.length>=5,entry.source+" "+locale);
  }
 }
});
test("All five reusable lesson views put exercises before quizzes and include stage navigation",()=>{
 const targets=["BilingualLesson","Domain2Lesson","Domain3Lesson","Domain4Lesson","Domain5Lesson"];
 for(const name of targets){
  const content=readFileSync("app/components/"+name+".tsx","utf8");
  assert.match(content,/LessonStageNav/,name);
  assert.match(content,/SourceVerifiedLecture/,name);
  const exercise=content.indexOf("live-lab bilingual-lab");
  const quiz=content.indexOf("course-quiz bilingual-quiz");
  if(name==="BilingualLesson"){
   assert.ok(exercise>0&&quiz>exercise,name);
  }else{
   assert.ok(exercise>0&&quiz>exercise,name);
  }
 }
 const stageNav=readFileSync("app/components/LessonStageNav.tsx","utf8");
 assert.ok(stageNav.indexOf('name:vi?"Bài giảng"')<stageNav.indexOf('name:vi?"Bài tập"'));
 assert.ok(stageNav.indexOf('name:vi?"Bài tập"')<stageNav.indexOf('name:vi?"Câu hỏi"'));
});
test("The official lesson 1.1/1.2 hands-on concept checks are retained before quizzes",()=>{
 for(const n of [1,2]){
  for(const lang of ["vi","en"] as const){
   assert.ok(course[n][lang].steps.length>=6, "Source-aligned practical sequence 1."+n+" "+lang);
  }
 }
 assert.match(course[1].en.steps.join(" "),/stop_reason/);
 assert.match(course[1].en.steps.join(" "),/safety iteration cap/);
 assert.match(course[2].en.steps.join(" "),/geothermal/);
});
