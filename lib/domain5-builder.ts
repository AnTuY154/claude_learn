import {compactLesson, type Compact} from "./domain3-compact.ts";
import type {Domain3Entry} from "./domain3-types.ts";

// The source curriculum for Domain 5: https://claudecertificationguide.com/learn/5-context-management
// All lesson content is independently paraphrased, never copied from the website.
export function reliabilityLesson(number:number,data:Compact):Domain3Entry{
 const entry=compactLesson(number,data);
 entry.source="https://claudecertificationguide.com/learn/5-context-management/5-"+number+"-"+data.slug;
 for(const language of ["vi","en"] as const){
  const content=entry[language];
  content.scenarioTitle=language==="vi"?"Tình huống thực tế xuyên suốt":"Running architecture scenario";
  content.sections.forEach(section=>{
   section.codeLabel="JavaScript / TypeScript — conceptual teaching example";
   section.code=section.code?.replaceAll("\\n","\n");
  });
  content.lab.title=language==="vi"?"Build Exercise — Context & Reliability":"Build Exercise — Context & Reliability";
  content.lab.source="scripts/domain5-labs.mjs";
  content.lab.disclaimer=language==="vi"
   ?"Lab là mô phỏng Node.js offline, không gọi Claude API; dữ liệu và kết quả minh hoạ không phải đo thực nghiệm model. Cần key riêng nếu muốn thử API thật."
   :"Labs are deterministic offline Node.js demonstrations, not live Claude API results. Real API use needs separate credentials.";
 }
 return entry;
}
