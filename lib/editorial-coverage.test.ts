import {test} from "node:test";
import assert from "node:assert/strict";
import {domain12Editorial} from "./editorial-domain12.ts";
import {domain3Editorial} from "./editorial-domain3.ts";
import {domain4Editorial} from "./editorial-domain4.ts";
import {domain5Editorial} from "./editorial-domain5.ts";
import {sourceLearningObjectives} from "./source-learning-objectives.ts";
import {course} from "./bilingual-course.ts";
import {domain2} from "./domain2-course.ts";
import {domain3} from "./domain3-course.ts";
import {domain4} from "./domain4-course.ts";
import {domain5} from "./domain5-course.ts";

test("30 source-aligned bilingual lectures link exclusively to the matching curriculum page",()=>{
 const all=[...domain12Editorial,...domain3Editorial,...domain4Editorial,...domain5Editorial];
 assert.equal(all.length,30);
 const expected=[...Array.from({length:7},(_,i)=>`1.${i+1}`),...Array.from({length:5},(_,i)=>`2.${i+1}`),...Array.from({length:6},(_,i)=>`3.${i+1}`),...Array.from({length:6},(_,i)=>`4.${i+1}`),...Array.from({length:6},(_,i)=>`5.${i+1}`)];
 assert.deepEqual(all.map(x=>x.id),expected);
 assert.deepEqual(Object.keys(sourceLearningObjectives),expected);
 const guidePrefix="https://claudecertificationguide.com/learn/";
 for(const item of all){
  assert.ok(item.source.startsWith(guidePrefix),item.id);
  const objectives=sourceLearningObjectives[item.id];
  assert.equal(objectives.length,5,item.id);
  for(const [vi,en] of objectives){assert.ok(vi.length>=25,item.id+" objective VI");assert.ok(en.length>=20,item.id+" objective EN");}
  assert.ok(item.source.includes("/"+item.id.replace(".","-")+"-"),item.id);
  for(const field of ["mechanism","example","distinction","examTrap"] as const){
   assert.equal(item[field].length,2,item.id+field);
   assert.ok(item[field][0].length>=120,item.id+" VI "+field);
   assert.ok(item[field][1].length>=100,item.id+" EN "+field);
   assert.ok(!item[field][0].includes("http"),"Do not leak external source into notes");
  }
  const [domain,n]=item.id.split(".").map(Number);
  const fromCourse=domain===1?course[n]:domain===2?domain2[n]:domain===3?domain3[n]:domain===4?domain4[n]:domain5[n];
  assert.equal(fromCourse.source,item.source,"Source mismatch "+item.id);
 }
});
