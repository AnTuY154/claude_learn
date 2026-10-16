import type {Domain2Content,Domain2Section,Domain2Quiz} from "./domain2-types.ts";
import type {Domain3Entry} from "./domain3-types.ts";

export type Duo=[string,string];
export type SourceSection={title:Duo;body:[Duo,Duo];code:string;takeaway:Duo;trap?:Duo};
export type Question={question:Duo;options:[Duo,Duo,Duo,Duo];answer:number;because:Duo};
export type Step={title:Duo;instruction:Duo;why:Duo;expected:Duo};
export type RawLesson={
 title:Duo; subtitle:Duo;bridge:Duo;scenarioTitle:Duo;scenario:Duo;
 sections:SourceSection[];matrix:{heads:[Duo,Duo,Duo];rows:[Duo,Duo,Duo][]};
 words:[string,string,string][];questions:Question[];
 lab:{title:Duo;duration:string;goal:Duo;steps:Step[];commands:string;source:string;disclaimer:Duo}
};
const l=(value:Duo,index:0|1)=>value[index];
export function buildDomain3(number:number,slug:string,data:RawLesson):Domain3Entry{
  const language=(i:0|1):Domain2Content=>({
    title:l(data.title,i),subtitle:l(data.subtitle,i),bridge:l(data.bridge,i),
    scenarioTitle:l(data.scenarioTitle,i),scenario:l(data.scenario,i),
    sections:data.sections.map((s):Domain2Section=>({
      title:l(s.title,i),explanation:s.body.map(p=>l(p,i)),
      code:s.code,codeLabel:"Example · Claude Code / JavaScript",
      keyPoint:l(s.takeaway,i),pitfall:s.trap?l(s.trap,i):undefined
    })),
    table:{headers:data.matrix.heads.map(h=>l(h,i)) as [string,string,string],
      rows:data.matrix.rows.map(row=>row.map(cell=>l(cell,i)) as [string,string,string])},
    vocabulary:data.words,
    summary:data.sections.map(s=>l(s.takeaway,i)),
    quiz:data.questions.map(q):Domain2Quiz=>({question:l(q.question,i),choices:q.options.map(o=>l(o,i)) as [string,string,string,string],correct:q.answer,explanation:l(q.because,i)})),
    lab:{title:l(data.lab.title,i),duration:data.lab.duration,goal:l(data.lab.goal,i),
      steps:data.lab.steps.map(s=>({title:l(s.title,i),instruction:l(s.instruction,i),why:l(s.why,i),expected:l(s.expected,i)})),
      commands:data.lab.commands,source:data.lab.source,disclaimer:l(data.lab.disclaimer,i)}
  });
  return {number,source:"https://claudecertificationguide.com/learn/3-claude-code-config/3-"+number+"-"+slug,vi:language(0),en:language(1)};
}
