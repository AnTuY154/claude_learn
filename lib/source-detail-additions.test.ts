import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {sourceDetailAdditions} from "./source-detail-additions.ts";
import {sourceDetailMore} from "./source-detail-more.ts";
test("Additional chapters are bilingual, source-scoped and clearly distinguish beyond-guide material",()=>{
 assert.deepEqual(Object.keys(sourceDetailAdditions),["1.5","3.1","3.6"]);
 assert.equal(sourceDetailAdditions["1.5"].length,2);
 assert.equal(sourceDetailAdditions["3.1"].length,2);
 assert.equal(sourceDetailAdditions["3.6"].length,4);
 for(const [lesson,chapters] of Object.entries(sourceDetailAdditions)){
  for(const chapter of chapters){
   assert.ok(["exam","supplement"].includes(chapter.scope));
   for(const field of ["title","detail","example","trap"] as const){
    assert.equal(chapter[field].length,2);
    assert.ok(chapter[field][0].length>(field==="title"?20:90),lesson+" "+field+" VI");
    assert.ok(chapter[field][1].length>(field==="title"?20:90),lesson+" "+field+" EN");
   }
  }
 }
});


test("The four smaller source-outline gaps are explicit and remain inside the lecture",()=>{
 assert.deepEqual(Object.keys(sourceDetailMore),["1.4","3.2","3.3","3.4"]);
 for(const [id,items] of Object.entries(sourceDetailMore)){
  assert.equal(items.length,1,id);
  for(const item of items){
   for(const key of ["title","detail","example","trap"] as const){
    assert.equal(item[key].length,2,id);
    assert.ok(item[key][0].length>25,id+" "+key+" VI");
    assert.ok(item[key][1].length>25,id+" "+key+" EN");
   }
  }
 }

});
