import type {Domain3Entry} from "./domain3-types.ts";
import type {Domain2Content} from "./domain2-types.ts";
type Duo=[string,string];
export type Compact={
 title:Duo;subtitle:Duo;scenario:Duo;bridge:Duo;
 // [VI heading, EN heading, VI explanation, EN explanation, JS/config, VI takeaway, EN takeaway]
 topics:[string,string,string,string,string,string,string][];
 // [VI question, EN question, VI correct answer, EN correct answer, VI wrong 1..3, EN wrong 1..3]
 questions:[string,string,string,string,string,string,string,string,string,string][];
 // [EN term, VI translation, definition]
 words:[string,string,string][];
 // [VI title, EN title, VI instruction, EN instruction]
 exercise:[string,string,string,string][];
 table:[string,string,string][];
 commands:string; duration:string; slug:string
};
export function compactLesson(number:number,d:Compact):Domain3Entry{
 const convert=(locale:"vi"|"en"):Domain2Content=>{
  const en=locale==="en",i=en?1:0;
  const topics=d.topics.map((s)=>({
   title:s[i],explanation:[s[i+2]],
   code:s[4],codeLabel:"Annotated Claude Code / JavaScript",keyPoint:s[i+5]
  }));
  const quizzes=d.questions.map((q,k)=>{
   const good=q[i+2];const wrongs=en?q.slice(7,10):q.slice(4,7);
   const index=k%4;
   const choices=[...wrongs];choices.splice(index,0,good);
   return {question:q[i],choices:choices as [string,string,string,string],correct:index,
    explanation:(en?"Correct choice: ":"Đáp án đúng: ")+good+". "+topics[k%topics.length].keyPoint};
  });
  return {
    title:d.title[i],subtitle:d.subtitle[i],bridge:d.bridge[i],
    scenarioTitle:en?"Practical Next.js scenario":"Tình huống Next.js thực tế",scenario:d.scenario[i],
    sections:topics,summary:topics.map(t=>t.keyPoint),quiz:quizzes,
    vocabulary:d.words,
    table:{headers:en?["Situation","Best choice","Reason"]:["Tình huống","Cách phù hợp","Lý do"],rows:d.table},
    lab:{title:en?"Hands-on build exercise":"Bài tập thực hành theo giáo trình",duration:d.duration,
      goal:d.bridge[i]+" "+d.scenario[i],
      steps:d.exercise.map((x,k)=>({
        title:x[i],instruction:x[i+2],
        why:en?"Apply this step to the exercise objective and verify the observation.":"Bước này giúp kiểm chứng kiến thức bài học bằng ví dụ có thể quan sát được.",
        expected:en?"Record the actual outcome, without inventing model behaviour.":"Ghi lại kết quả thực tế, không giả định Claude chắc chắn làm đúng."})),
      commands:d.commands,source:"scripts/domain3-labs.mjs",
      disclaimer:en?"Workspace scaffold is local; real Claude Code commands require an authenticated CLI and may use tokens.":"Script chuẩn bị workspace không gọi model; chạy Claude Code thật cần đăng nhập và có thể tiêu thụ quota/credits."
    }
  };
 };
 return {number,source:"https://claudecertificationguide.com/learn/3-claude-code-config/3-"+number+"-"+d.slug,vi:convert("vi"),en:convert("en")};
}
