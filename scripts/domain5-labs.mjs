import {existsSync,mkdirSync,writeFileSync} from "node:fs";
import path from "node:path";
// Offline deterministic fixtures; never calls model or overwrites a student's files.
const lessons={
 1:{source:{facts:{customerId:"C-4421",issues:[{orderId:"#8891",refundAmount:247.83,date:"2024-03-03"}]},summary:"Customer wants a refund",tool:{order_id:"#8891",order_date:"2024-03-03",total_amount:247.83,return_eligible:true,item_description:"headphones",warehouse_id:"unneeded"}},check:"assert.equal(d.facts.issues[0].refundAmount,247.83);assert.equal(d.facts.issues[0].orderId,'#8891');const fields=['order_id','order_date','total_amount','return_eligible','item_description'];assert.equal(Object.keys(d.tool).filter(k=>fields.includes(k)).length,5);"},
 2:{source:{cases:[{human:true,route:"human"},{policyGap:true,route:"human"},{blocked:true,route:"human"},{angry:true,route:"resolve"}],matches:[{id:1},{id:2}]},check:"const route=c=>c.human||c.policyGap||c.blocked?'human':'resolve';for(const c of d.cases)assert.equal(route(c),c.route);assert.equal(d.matches.length,2);"},
 3:{source:{failure:{status:"partial_failure",failureType:"transient",attemptedAction:{tool:"search",query:"brick"},partialResults:[{price:42}],alternativeApproaches:["retry"]},empty:{status:"success",results:[]}},check:"for(const k of ['failureType','attemptedAction','partialResults','alternativeApproaches'])assert.ok(k in d.failure);assert.equal(d.empty.status,'success');assert.deepEqual(d.empty.results,[]);"},
 4:{source:{scratchpad:"QuoteRepository at src/repos/quote.ts implements findById caching",manifest:{phase:2,exploredPaths:["src/repos/quote.ts"],keyFindings:["cache"],nextSteps:["check invalidation"],unresolvedQuestions:["cache ttl?"]}},check:"assert.match(d.scratchpad,/QuoteRepository/);for(const k of ['exploredPaths','keyFindings','nextSteps','unresolvedQuestions'])assert.ok(d.manifest[k].length);"},
 5:{source:{samples:[{type:"standard",field:"date",confidence:.95,correct:true},{type:"handwritten",field:"date",confidence:.95,correct:false},{type:"international",field:"amount",confidence:.2,correct:false}]},check:"assert.ok(d.samples.some(x=>x.confidence>.9&&!x.correct));assert.ok(new Set(d.samples.map(x=>x.type)).size>1);"},
 6:{source:{claims:[{claim:"Growth 12%",sourceUrl:"https://example.invalid/a",documentName:"Report A",relevantExcerpt:"Growth 12%",publicationDate:"2024-06-01",value:12},{claim:"Growth 8%",sourceUrl:"https://example.invalid/b",documentName:"Report B",relevantExcerpt:"Growth 8%",publicationDate:"2025-06-01",value:8}]},check:"for(const x of d.claims)for(const k of ['claim','sourceUrl','documentName','relevantExcerpt','publicationDate'])assert.ok(x[k]);assert.deepEqual(d.claims.map(x=>x.value),[12,8]);"},
};
const id=process.argv[2];
if(!Object.hasOwn(lessons,id)){console.error("Usage: npm run lab:domain5 -- 1|2|3|4|5|6");process.exit(2)}
const folder=path.resolve("domain5-workspaces/lesson5"+id);
if(existsSync(folder)){console.error("Workspace exists; refusing to overwrite:",folder);process.exit(1)}
mkdirSync(folder,{recursive:true});
writeFileSync(path.join(folder,"fixture.json"),JSON.stringify(lessons[id].source,null,2)+"\n");
const check="import assert from 'node:assert/strict';\nimport {readFileSync} from 'node:fs';\nconst d=JSON.parse(readFileSync('fixture.json','utf8'));\n"+lessons[id].check+"\nconsole.log('PASS: Domain 5 lesson "+id+" offline assertions');\n";
writeFileSync(path.join(folder,"check.mjs"),check);
console.log("Fixture created:",folder,"\nRun: cd "+folder+" && node check.mjs");
