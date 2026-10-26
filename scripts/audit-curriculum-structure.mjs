/**
 * Read-only structural comparison of all 30 curriculum pages.
 * Sole trusted source: https://claudecertificationguide.com/learn.
 *
 * This checks WHICH chapters exist in the source and website. It cannot
 * establish whether an explanation is semantically faithful or complete.
 * Does not copy article paragraphs, call an LLM, require a key or modify lessons.
 *
 * npm run audit:curriculum -- --lesson all
 */
import {createHash} from "node:crypto";
import {mkdir,writeFile} from "node:fs/promises";
import path from "node:path";
import {course} from "../lib/bilingual-course.ts";
import {domain2} from "../lib/domain2-course.ts";
import {domain3} from "../lib/domain3-course.ts";
import {domain4} from "../lib/domain4-course.ts";
import {domain5} from "../lib/domain5-course.ts";
import {sourceDetailAdditions} from "../lib/source-detail-additions.ts";
import {sourceDetailMore} from "../lib/source-detail-more.ts";
import {parseLessonSelection,sourceUrlAllowed} from "../lib/course-review-core.mjs";

const args=process.argv.slice(2),position=args.indexOf("--lesson");
if(args.length&&(args.length!==2||position!==0)){console.error("Usage: --lesson all|1.1..5.6");process.exit(2)}
const ids=parseLessonSelection(position<0?"all":args[1]);
const sha=text=>createHash("sha256").update(text).digest("hex");
function strip(raw){
 const plain=raw.replace(/<[^>]*>/g," ")
 .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")
 .replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'")
 .replace(/&nbsp;/g," ").replace(/\s+/g," ").trim();
 return plain;
}
function headings(html){
 const found=[...html.matchAll(/<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi)]
 .map(m=>({level:Number(m[1]),label:strip(m[2])}));
 const first=found.findIndex(x=>/What You Need to Know/i.test(x.label));
 if(first<0)throw Error("Cannot locate What You Need to Know heading");
 const end=found.findIndex((x,i)=>i>first&&/^Practice Scenario$/i.test(x.label));
 if(end<0)throw Error("Cannot locate Practice Scenario boundary");
 const theory=found.slice(first+1,end).filter(x=>x.level===3).map(x=>x.label);
 const buildStart=found.findIndex(x=>/^Build Exercise$/i.test(x.label));
 const buildEnd=found.findIndex((x,i)=>i>buildStart&&/^Sources$/i.test(x.label));
 return {theory,buildPresent:buildStart>=0,examTraps:found.some(x=>/^Exam Traps$/i.test(x.label)),
  practiceScenario: end>=0,sourceHeadingCount:found.length,buildHasSourceSection:buildEnd>buildStart};
}
async function fetchPage(input){
 let url=input;
 for(let hop=0;hop<3;hop++){
  if(!sourceUrlAllowed(url))throw Error("Source URL is outside the sole trusted /learn origin.");
  const res=await fetch(url,{redirect:"manual",signal:AbortSignal.timeout(18000),headers:{accept:"text/html"}});
  if(res.status>=300&&res.status<400){url=new URL(res.headers.get("location")||"",url).href;continue;}
  if(!res.ok)throw Error("Source returned HTTP "+res.status);
  if(!(res.headers.get("content-type")||"").includes("text/html"))throw Error("Unexpected source content type");
  const html=await res.text();
  if(html.length>3000000)throw Error("Source document too large");
  return {url,content:headings(html),digest:sha(html)};
 }
 throw Error("Too many source redirects");
}
function lessonFor(id){
 const [domain,n]=id.split(".").map(Number);
 return domain===1?course[n]:domain===2?domain2[n]:domain===3?domain3[n]:domain===4?domain4[n]:domain5[n];
}
const results=[];
for(const id of ids){
 const entry=lessonFor(id);
 const extract=(content,locale)=>[...("topics" in content?content.topics:content.sections).map(x=>x.title),...(sourceDetailAdditions[id]||[]).map(x=>x.title[locale==="vi"?0:1]),...(sourceDetailMore[id]||[]).map(x=>x.title[locale==="vi"?0:1])];
 const res={id,source:entry.source,fetchStatus:"not_started",manualContentReviewRequired:true,
    website:{vi:extract(entry.vi,"vi"),en:extract(entry.en,"en"),exerciseStepsVI:("steps" in entry.vi?entry.vi.steps:entry.vi.lab.steps).length,
    exerciseStepsEN:("steps" in entry.en?entry.en.steps:entry.en.lab.steps).length,
    questionsVI:entry.vi.quiz.length,questionsEN:entry.en.quiz.length}};
 try{
  const page=await fetchPage(entry.source);
  res.fetchStatus="fetched";
  res.sourceDigest=page.digest;
  res.sourceStructure=page.content;
  res.actualSourceUrl=page.url;
  console.log("Fetched "+id+": "+page.content.theory.length+" source theory subheadings; "+
     res.website.vi.length+" VI / "+res.website.en.length+" EN local sections");
 }catch(error){
  res.fetchStatus="blocked";
  res.error=String(error?.message||error);
  console.error("BLOCKED "+id+": "+res.error);
 }
 results.push(res);
}
const dir=path.resolve("artifacts/ccarf-source-structure");
await mkdir(dir,{recursive:true});
const report={generatedAt:new Date().toISOString(),trustedSource:"https://claudecertificationguide.com/learn",
  rule:"Source heading presence and chapter counts only; NOT a semantic fidelity or full translation certification",
  selected:ids.length,fetched:results.filter(x=>x.fetchStatus==="fetched").length,
  blocked:results.filter(x=>x.fetchStatus==="blocked").length,results};
await writeFile(path.join(dir,"report.json"),JSON.stringify(report,null,2)+"\n");
const markdown=["# CCAR-F — Curriculum Chapter Comparison","",
  "**Source:** https://claudecertificationguide.com/learn (sole curriculum authority).",
  "**Important:** Heading counts are structural metadata, not a judgement of whether a lesson is accurate or complete. Each case still requires manual concept-level comparison.",""];
for(const result of results){
 markdown.push("## "+result.id,"",
  "- Link: "+result.source,
  "- Source status: "+result.fetchStatus,
  "- Source lesson subheadings: "+(result.sourceStructure?.theory.length??"unknown"),
  "- Website chapters VI/EN: "+result.website.vi.length+" / "+result.website.en.length,
  "- Local practice steps VI/EN: "+result.website.exerciseStepsVI+" / "+result.website.exerciseStepsEN,
  "- Manual semantic check: REQUIRED","");
 if(result.error)markdown.push("**BLOCKED**: "+result.error,"");
 if(result.sourceStructure)markdown.push("**Original lesson sections**: "+result.sourceStructure.theory.join("; "),"");
 markdown.push("**Local VI sections**: "+result.website.vi.join("; "),"",
   "**Local EN sections**: "+result.website.en.join("; "),"");
}
await writeFile(path.join(dir,"report.md"),markdown.join("\n")+"\n");
console.log("Wrote "+dir,"fetched="+report.fetched,"blocked="+report.blocked);
if(report.blocked)process.exitCode=1;
