"use client";

import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import en from "@/lib/question-bank/exams-en.json";
import vi from "@/lib/question-bank/exams-vi.json";
import {sameAnswers} from "@/lib/question-bank/quiz-core";
import type {ChoiceKey,Question,ExamData} from "@/lib/question-bank/quiz-core";

type Language="vi"|"en";
type Answers=Record<string,ChoiceKey[]>;
type Saved={language:Language;current:number;answers:Answers;drafts:Answers};
const collections:Record<Language,Question[]>={
 vi:(vi as unknown as ExamData).exam_sets.flatMap(s=>s.questions).slice(0,390),
 en:(en as unknown as ExamData).exam_sets.flatMap(s=>s.questions).slice(0,390),
};
const key="ccarf-practice390-original-upload-bank-v1";
const original="https://codingnconcepts.com/anthropic/claude-certified-architect-foundations-ccar-f-exam-questions/";
const words={
 vi:{
  back:"Về trang chủ",kicker:"CCAR-F · LUYỆN TẬP 390 CÂU",title:"Bộ đề luyện tập 390 câu",
  intro:"390 câu tuyển chọn từ bộ 420 câu song ngữ bạn đã cung cấp. Nội dung không phải bản sao 390 câu trên Coding N Concepts.",
  original:"Xem nguyên bản 390 câu tại Coding N Concepts",
  disclaimer:"Đây là bộ đề thực hành riêng, không phải đề thi chính thức. Nội dung và đáp án lấy từ hai file JSON bạn cung cấp.",
  answered:"Đã làm",correct:"Đúng",incorrect:"Sai",remaining:"Chưa làm",score:"Điểm",
  question:"Câu hỏi",select:"Đã chọn",check:"Chấm đáp án",right:"Chính xác",wrong:"Chưa chính xác",
  yours:"Bạn chọn",answer:"Đáp án đúng",explanation:"Giải thích",sources:"Tham khảo",
  previous:"Câu trước",next:"Câu tiếp",nextUnanswered:"Tìm câu chưa làm",reset:"Làm lại từ đầu",
  resetConfirm:"Xoá mọi câu trả lời của bộ đề 390 câu?",all:"Toàn bộ",domain:"Domain",
  complete:"Đã hoàn tất 390 câu",ongoing:"Chọn đáp án để kiểm tra và xem giải thích."
 },
 en:{
  back:"Back to home",kicker:"CCAR-F · 390-QUESTION PRACTICE",title:"390-Question Practice Exam",
  intro:"390 questions selected from the 420 bilingual questions you previously supplied. These are not a copy of Coding N Concepts' 390 questions.",
  original:"Read the original 390 questions on Coding N Concepts",
  disclaimer:"Independent study material, not official exam questions. Questions and answer keys are from your uploaded bilingual JSON files.",
  answered:"Answered",correct:"Correct",incorrect:"Incorrect",remaining:"Not answered",score:"Score",
  question:"Question",select:"Selected",check:"Check answers",right:"Correct",wrong:"Incorrect",
  yours:"Your selection",answer:"Correct answers",explanation:"Explanation",sources:"References",
  previous:"Previous",next:"Next",nextUnanswered:"Find unanswered",reset:"Restart exam",
  resetConfirm:"Clear all answers for the 390-question practice exam?",all:"All",domain:"Domain",
  complete:"All 390 questions completed",ongoing:"Select an answer to see your score and explanation."
 }
};
function load(raw:unknown):Saved|null{
 if(!raw||typeof raw!=="object")return null;
 const data=raw as Partial<Saved>;
 const language:Language=data.language==="en"?"en":"vi";
 const current=Number.isInteger(data.current)&&data.current!==undefined&&data.current>=0&&data.current<390?data.current:0;
 const answers:Answers={},drafts:Answers={};
 for(const question of collections.en){
  for(const [input,output,complete] of [[data.answers,answers,true],[data.drafts,drafts,false]] as const){
   const selection=input?.[question.id];
   if(!Array.isArray(selection)||selection.some(s=>typeof s!=="string"||!question.options.some(o=>o.key===s)))continue;
   if(new Set(selection).size!==selection.length)continue;
   if(complete&&selection.length!==question.select_count)continue;
   if(!complete&&(selection.length===0||selection.length>=question.select_count||question.question_type==="single_answer"))continue;
   output[question.id]=selection;
  }
 }
 for(const id of Object.keys(answers))delete drafts[id];
 return {language,current,answers,drafts};
}
export default function Practice390(){
 const [language,setLanguage]=useState<Language>("vi");
 const [current,setCurrent]=useState(0);
 const [answers,setAnswers]=useState<Answers>({});
 const [drafts,setDrafts]=useState<Answers>({});
 const [ready,setReady]=useState(false);
 useEffect(()=>{
  try{
   const persisted=localStorage.getItem(key);
   const saved=persisted?load(JSON.parse(persisted)):null;
   if(saved){setLanguage(saved.language);setCurrent(saved.current);setAnswers(saved.answers);setDrafts(saved.drafts);}
  }catch{ /* Works without local storage. */ }
  setReady(true);
 },[]);
 useEffect(()=>{
  if(!ready)return;
  try{localStorage.setItem(key,JSON.stringify({language,current,answers,drafts}));}catch{}
 },[ready,language,current,answers,drafts]);
 const t=words[language],questions=collections[language];
 const question=questions[current],selected=answers[question.id];
 const draft=drafts[question.id]??[];
 const revealed=selected!==undefined;
 const good=sameAnswers(selected,question.answer);
 const counts=useMemo(()=>{
  const reference=collections.en;
  const answered=reference.filter(q=>answers[q.id]!==undefined).length;
  const correct=reference.filter(q=>sameAnswers(answers[q.id],q.answer)).length;
  return {answered,correct};
 },[answers]);
 const go=(next:number)=>{
  if(next<0||next>=questions.length)return;
  setCurrent(next);
  document.getElementById("p390-question")?.scrollIntoView({block:"start",behavior:"smooth"});
 };
 const submit=(choice:ChoiceKey[])=>{
  if(revealed||choice.length!==question.select_count)return;
  setAnswers(a=>({...a,[question.id]:[...choice]}));
  setDrafts(a=>{const next={...a};delete next[question.id];return next;});
 };
 const toggle=(key:ChoiceKey)=>{
  if(revealed)return;
  if(question.question_type==="single_answer"){submit([key]);return;}
  setDrafts(a=>{
   const previous=a[question.id]??[];
   const next=previous.includes(key)?previous.filter(k=>k!==key):previous.length<question.select_count?[...previous,key]:previous;
   return {...a,[question.id]:next};
  });
 };
 const nextUnanswered=()=>{
  for(let i=1;i<=questions.length;i++){
   const at=(current+i)%questions.length;
   if(answers[questions[at].id]===undefined){go(at);return;}
  }
 };
 const restart=()=>{
  if(!window.confirm(t.resetConfirm))return;
  setAnswers({});setDrafts({});setCurrent(0);
 };
 return <main className="qb-page p390-page"><div className="qb-layout">
  <div className="qb-topline"><Link href="/">{t.back}</Link><span>CCAR-F /390</span></div>
  <header className="qb-hero"><div className="qb-hero-content">
    <p className="qb-kicker">{t.kicker}</p><h1>{t.title}</h1>
    <p className="qb-intro">{t.intro}</p>
    <p className="qb-disclaimer">{t.disclaimer}</p>
    <p className="p390-original"><a href={original} target="_blank" rel="noopener noreferrer">{t.original} ↗</a></p>
   </div>
   <div className="qb-lang" role="group" aria-label="Language">
    <button type="button" className={language==="vi"?"on":""} aria-pressed={language==="vi"} onClick={()=>setLanguage("vi")}>Tiếng Việt</button>
    <button type="button" className={language==="en"?"on":""} aria-pressed={language==="en"} onClick={()=>setLanguage("en")}>English</button>
   </div>
  </header>
  <section className="qb-statline p390-stats" aria-label={t.score}>
   <div><span>{t.answered}</span><strong>{counts.answered}<small> / 390</small></strong></div>
   <div><span>{t.correct}</span><strong>{counts.correct}</strong></div>
   <div><span>{t.incorrect}</span><strong>{counts.answered-counts.correct}</strong></div>
   <div><span>{t.remaining}</span><strong>{390-counts.answered}</strong></div>
   <div><span>{t.score}</span><strong>{counts.answered?Math.round(counts.correct/counts.answered*100):0}%</strong></div>
  </section>
  <div className="qb-main">
   <section className="qb-exam" id="p390-question">
    <div className="qb-question-head">
     <span>{t.question} {current+1}/390</span>
     <span className="qb-domain">{question.domain_code} · {question.domain_name}</span>
    </div>
    <h2>{question.question}</h2>
    <p className="qb-select-instruction">{question.selection_instruction}</p>
    <div className="qb-choices" role="group" aria-label={t.question+" "+(current+1)}>
     {question.options.map(option=>{
      const checked=(revealed?selected:draft).includes(option.key);
      const expected=question.answer.includes(option.key);
      const state=!revealed?(checked?"draft":""):expected?"correct":checked?"incorrect":"muted";
      return <button type="button" key={option.key} className={"qb-choice "+state+(checked?" selected":"")}
       aria-pressed={checked} disabled={revealed} onClick={()=>toggle(option.key)}>
       <span className="qb-choice-key">{option.key}</span><span className="qb-choice-copy">{option.text}</span>
       {revealed&&expected&&<span className="qb-choice-result">✓</span>}
       {revealed&&checked&&!expected&&<span className="qb-choice-result">×</span>}
       {!revealed&&question.question_type==="multiple_response"&&checked&&<span className="qb-choice-result">✓</span>}
      </button>;
     })}
    </div>
    {!revealed&&question.question_type==="multiple_response"&&<div className="qb-selection-control">
     <p>{t.select}: <strong>{draft.length}/{question.select_count}</strong></p>
     <button type="button" onClick={()=>submit(draft)} disabled={draft.length!==question.select_count}>{t.check}</button>
    </div>}
    {revealed?<section className={"qb-feedback "+(good?"good":"bad")} aria-live="polite">
     <h3>{good?"✓ "+t.right:"× "+t.wrong}</h3>
     <p><strong>{t.yours}:</strong> {selected.join(", ")} · <strong>{t.answer}:</strong> {question.answer.join(", ")}</p>
     <h4>{t.explanation}</h4><p>{question.explanation}</p>
     {question.sources.length>0&&<div className="qb-references"><strong>{t.sources}</strong>
      {question.sources.filter(url=>url.startsWith("https://")).map(url=>
       <a key={url} href={url} rel="noopener noreferrer" target="_blank">{url}</a>)}
     </div>}
    </section>:<p className="qb-prompt">{t.ongoing}</p>}
    {counts.answered===390&&<div className="qb-complete"><strong>{t.complete} · {counts.correct}/390</strong></div>}
    <div className="qb-controls">
     <button type="button" onClick={()=>go(current-1)} disabled={current===0}>{t.previous}</button>
     <button type="button" onClick={nextUnanswered} disabled={counts.answered===390}>{t.nextUnanswered}</button>
     <button type="button" onClick={()=>go(current+1)} disabled={current===389}>{t.next}</button>
    </div>
   </section>
   <aside className="qb-aside" aria-label={t.question}>
    <div className="qb-aside-head"><h2>{t.question} 1–390</h2><p>{t.answered}: {counts.answered}/390</p></div>
    <div className="p390-jump-scroll">
     <div className="qb-grid">
      {questions.map((q,i)=>{
       const answer=answers[q.id];
       const status=answer===undefined?(drafts[q.id]?.length?"draft":"unanswered"):sameAnswers(answer,q.answer)?"correct":"incorrect";
       return <button type="button" className={"qb-jump "+status+(current===i?" current":"")} key={q.id}
        aria-current={current===i?"step":undefined}
        aria-label={t.question+" "+(i+1)+": "+(answer===undefined?t.remaining:sameAnswers(answer,q.answer)?t.correct:t.incorrect)}
        onClick={()=>go(i)}>{i+1}</button>;
      })}
     </div>
    </div>
    <div className="qb-legend"><span><i className="right"/> {t.correct}</span><span><i className="wrong"/> {t.incorrect}</span><span><i className="pending"/> {t.remaining}</span></div>
    <button type="button" className="qb-reset" onClick={restart}>{t.reset}</button>
   </aside>
  </div>
 </div></main>;
}
