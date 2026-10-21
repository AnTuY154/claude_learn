import {compactLesson, type Compact} from "./domain3-compact.ts";
import type {Domain3Entry} from "./domain3-types.ts";

// Reuse the tested bilingual compact lesson shape; customise references for Domain 4.
export function promptEngineeringLesson(number:number,data:Compact):Domain3Entry{
 const entry=compactLesson(number,data);
 entry.source="https://claudecertificationguide.com/learn/4-prompt-engineering/4-"+number+"-"+data.slug;
 for(const language of ["vi","en"] as const){
  const content=entry[language];
  content.scenarioTitle=language==="vi"?"Tình huống thực tế xuyên suốt":"Practical running scenario";
  content.sections.forEach(section=>{section.codeLabel="Annotated JavaScript / Claude API concept";});
  content.lab.source="scripts/domain4-labs.mjs";
  content.lab.title=language==="vi"?"Bài tập thực hành Domain 4":"Domain 4 hands-on build exercise";
  content.lab.disclaimer=language==="vi"
    ?"Website tĩnh không thực thi Claude API. Lệnh lab chỉ tạo fixture an toàn trên máy; thử SDK thật cần key local và có thể phát sinh chi phí."
    :"Static hosting does not run Claude API. The lab command scaffolds local fixtures only; real SDK invocations require local credentials and may incur costs.";
 }
 return entry;
}
