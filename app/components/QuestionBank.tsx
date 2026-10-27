"use client";

import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import enJson from "@/lib/question-bank/exams-en.json";
import viJson from "@/lib/question-bank/exams-vi.json";
import {sameAnswers,summariseSet,validSelection} from "@/lib/question-bank/quiz-core";
import type {ChoiceKey,ExamData,AnswerStore} from "@/lib/question-bank/quiz-core";

type Language="vi"|"en";
type SavedState={
 answers:AnswerStore;drafts:AnswerStore;language:Language;
 indices:Record<string,number>;activeSet:string;
};
const bank:Record<Language,ExamData>={
 vi:viJson as unknown as ExamData,
 en:enJson as unknown as ExamData,
};
// This is a different exam edition; never carry over answers for the old 5-set format.
const storageKey="ccarf-question-bank-mixed-7-sets-v2";
const setIds=bank.vi.exam_sets.map(set=>set.set_id);
const labels={
 vi:{
  kicker:"CCAR-F · NGÂN HÀNG CÂU HỎI",heading:"Luyện thi Question Bank",
  intro:"7 bộ đề · 60 câu mỗi bộ. Gồm câu chọn một, hai hoặc ba đáp án. Chuyển ngôn ngữ không làm mất kết quả.",
  notOfficial:"Bộ đề ôn tập độc lập, không phải câu hỏi thi chính thức.",
  set:"Bộ đề",question:"Câu hỏi",answered:"Đã làm",correct:"Đúng",wrong:"Sai",remaining:"Còn lại",
  answerNow:"Chọn đáp án để xem ngay đúng/sai và lời giải.",
  selectCount:"Đã chọn",checkAnswer:"Chấm đáp án",yourAnswer:"Bạn đã chọn",correctAnswer:"Đáp án đúng",
  right:"Chính xác!",incorrect:"Chưa chính xác",why:"Giải thích",references:"Tài liệu tham khảo",
  previous:"Câu trước",next:"Câu tiếp theo",nextUnanswered:"Câu chưa làm tiếp",restart:"Làm lại bộ đề",
  restartConfirm:"Bạn có muốn xoá toàn bộ câu trả lời của bộ đề này không?",
  complete:"Hoàn thành bộ đề",summary:"Kết quả",home:"Về trang chủ",jump:"Đi đến câu hỏi",
  score:"Điểm",language:"Ngôn ngữ",total:"Tổng tiến độ",review:"Xem lại hoặc chuyển sang bộ đề khác."
 },
 en:{
  kicker:"CCAR-F · QUESTION BANK",heading:"Question Bank Practice",
  intro:"7 exam sets · 60 questions each, with single-, two- and three-answer questions. Switch languages without losing your results.",
  notOfficial:"Independent practice questions; these are not official certification exam items.",
  set:"Exam set",question:"Question",answered:"Answered",correct:"Correct",wrong:"Incorrect",remaining:"Remaining",
  answerNow:"Select an answer to see instant feedback and an explanation.",
  selectCount:"Selected",checkAnswer:"Check answers",yourAnswer:"You selected",correctAnswer:"Correct answer",
  right:"Correct!",incorrect:"Not quite",why:"Explanation",references:"References",
  previous:"Previous",next:"Next question",nextUnanswered:"Next unanswered",restart:"Restart this set",
  restartConfirm:"Remove all answers for this exam set?",
  complete:"Set complete",summary:"Result",home:"Back to home",jump:"Jump to question",
  score:"Score",language:"Language",total:"Overall progress",review:"Review your answers or choose another set."
 }
};

function safeRestore(input:unknown):SavedState|null{
 if(!input||typeof input!=="object")return null;
 const v=input as Partial<SavedState>;
 const language:Language=v.language==="en"?"en":"vi";
 const activeSet=typeof v.activeSet==="string"&&setIds.includes(v.activeSet)?v.activeSet:setIds[0];
 const answers:AnswerStore={};
 const drafts:AnswerStore={};
 const indices:Record<string,number>={};
 for(const set of bank.en.exam_sets){
  answers[set.set_id]={};
  drafts[set.set_id]={};
  for(const q of set.questions){
   const completed=validSelection(v.answers?.[set.set_id]?.[q.id],q,true);
   if(completed){answers[set.set_id][q.id]=completed;continue;}
   const draft=validSelection(v.drafts?.[set.set_id]?.[q.id],q,false);
   if(draft)drafts[set.set_id][q.id]=draft;
  }
  const index=v.indices?.[set.set_id];
  indices[set.set_id]=typeof index==="number"&&Number.isInteger(index)&&index>=0&&index<set.questions.length?index:0;
 }
 return {language,activeSet,answers,drafts,indices};
}

export default function QuestionBank(){
 const [language,setLanguage]=useState<Language>("vi");
 const [activeSet,setActiveSet]=useState(setIds[0]);
 const [answers,setAnswers]=useState<AnswerStore>({});
 const [drafts,setDrafts]=useState<AnswerStore>({});
 const [indices,setIndices]=useState<Record<string,number>>({});
 const [hydrated,setHydrated]=useState(false);
 useEffect(()=>{
  try{
   const raw=localStorage.getItem(storageKey);
   if(raw){
    const saved=safeRestore(JSON.parse(raw));
    if(saved){
     setLanguage(saved.language);setActiveSet(saved.activeSet);
     setAnswers(saved.answers);setDrafts(saved.drafts);setIndices(saved.indices);
    }
   }
  }catch{ /* Practice still works if storage is unavailable. */ }
  setHydrated(true);
 },[]);
 useEffect(()=>{
  if(!hydrated)return;
  try{localStorage.setItem(storageKey,JSON.stringify({language,activeSet,answers,drafts,indices}));}catch{}
 },[hydrated,language,activeSet,answers,drafts,indices]);

 const t=labels[language];
 const data=bank[language];
 const selectedSet=data.exam_sets.find(set=>set.set_id===activeSet)??data.exam_sets[0];
 const questions=selectedSet.questions;
 const current=Math.max(0,Math.min(questions.length-1,indices[activeSet]??0));
 const question=questions[current];
 const chosen=answers[activeSet]?.[question.id];
 const draft=drafts[activeSet]?.[question.id]??[];
 const revealed=chosen!==undefined;
 const correct=sameAnswers(chosen,question.answer);
 const result=useMemo(()=>{
  const perSet=bank.en.exam_sets.map(set=>summariseSet(set,answers[set.set_id]));
  return {perSet,overall:perSet.reduce((sum,set)=>sum+set.answered,0)};
 },[answers]);
 const setResult=result.perSet.find(s=>s.id===activeSet)!;

 const navigate=(index:number)=>{
  if(index<0||index>=questions.length)return;
  setIndices(old=>({...old,[activeSet]:index}));
  document.getElementById("qb-question")?.scrollIntoView({block:"start",behavior:"smooth"});
 };
 const submit=(selection:ChoiceKey[])=>{
  if(revealed||selection.length!==question.select_count)return;
  setAnswers(old=>({...old,[activeSet]:{...(old[activeSet]??{}),[question.id]:selection}}));
  setDrafts(old=>{
   const currentDrafts={...(old[activeSet]??{})};
   delete currentDrafts[question.id];
   return {...old,[activeSet]:currentDrafts};
  });
 };
 const choose=(key:ChoiceKey)=>{
  if(revealed||!question.options.some(option=>option.key===key))return;
  if(question.question_type==="single_answer"){
   submit([key]);return;
  }
  setDrafts(old=>{
   const previous=old[activeSet]?.[question.id]??[];
   const next=previous.includes(key)
    ?previous.filter(x=>x!==key)
    :previous.length<question.select_count?[...previous,key]:previous;
   return {...old,[activeSet]:{...(old[activeSet]??{}),[question.id]:next}};
  });
 };
 const resetSet=()=>{
  if(!window.confirm(t.restartConfirm))return;
  setAnswers(old=>({...old,[activeSet]:{}}));
  setDrafts(old=>({...old,[activeSet]:{}}));
  setIndices(old=>({...old,[activeSet]:0}));
 };
 const nextUnanswered=()=>{
  const a=answers[activeSet]??{};
  for(let delta=1;delta<=questions.length;delta++){
   const next=(current+delta)%questions.length;
   if(a[questions[next].id]===undefined){navigate(next);return;}
  }
 };

 return <main className="qb-page">
  <div className="qb-layout">
   <div className="qb-topline"><Link href="/">{t.home}</Link><span>CCAR-F / Question Bank</span></div>
   <header className="qb-hero">
    <div className="qb-hero-content">
     <p className="qb-kicker">{t.kicker}</p>
     <h1>{t.heading}</h1>
     <p className="qb-intro">{t.intro}</p>
     <p className="qb-disclaimer">{t.notOfficial}</p>
    </div>
    <div className="qb-lang" role="group" aria-label={t.language}>
     <button type="button" aria-pressed={language==="vi"} className={language==="vi"?"on":""} onClick={()=>setLanguage("vi")}>Tiếng Việt</button>
     <button type="button" aria-pressed={language==="en"} className={language==="en"?"on":""} onClick={()=>setLanguage("en")}>English</button>
    </div>
   </header>

   <section aria-label={t.set} className="qb-sets">
    {result.perSet.map((set,i)=><button type="button" key={set.id}
      className={"qb-set "+(activeSet===set.id?"active":"")}
      onClick={()=>setActiveSet(set.id)} aria-pressed={activeSet===set.id}>
      <span>{t.set} {String(i+1).padStart(2,"0")}</span>
      <strong>{set.answered}/{set.total}</strong>
      <span className="qb-set-bar"><i style={{width:(100*set.answered/set.total)+"%"}}/></span>
     </button>)}
   </section>

   <section className="qb-statline" aria-label={t.summary}>
    <div><span>{t.answered}</span><strong>{setResult.answered}<small> / {setResult.total}</small></strong></div>
    <div><span>{t.correct}</span><strong>{setResult.correct}</strong></div>
    <div><span>{t.wrong}</span><strong>{setResult.answered-setResult.correct}</strong></div>
    <div><span>{t.score}</span><strong>{setResult.answered?Math.round(setResult.correct/setResult.answered*100):0}%</strong></div>
    <div className="qb-overall"><span>{t.total}</span><strong>{result.overall} / {data.total_questions}</strong></div>
   </section>

   <div className="qb-main">
    <section className="qb-exam" id="qb-question">
     <div className="qb-question-head">
      <span>{selectedSet.set_id} · {t.question} {current+1}/{questions.length}</span>
      <span className="qb-domain">{question.domain_code} · {question.domain_name}</span>
     </div>
     <h2>{question.question}</h2>
     <p className="qb-select-instruction">{question.selection_instruction}</p>
     <div className="qb-choices" role="group" aria-label={t.question+" "+(current+1)}>
      {question.options.map(option=>{
       const isSelected=revealed?chosen.includes(option.key):draft.includes(option.key);
       const isExpected=question.answer.includes(option.key);
       const state=!revealed?(isSelected?"draft":""):isExpected?"correct":isSelected?"incorrect":"muted";
       return <button type="button" key={option.key}
        className={"qb-choice "+state+(isSelected?" selected":"")}
        onClick={()=>choose(option.key)} disabled={revealed}
        aria-pressed={isSelected}>
        <span className="qb-choice-key">{option.key}</span>
        <span className="qb-choice-copy">{option.text}</span>
        {revealed&&isExpected&&<span className="qb-choice-result" aria-label={t.correct}>✓</span>}
        {revealed&&isSelected&&!isExpected&&<span className="qb-choice-result" aria-label={t.wrong}>×</span>}
        {!revealed&&question.question_type==="multiple_response"&&isSelected&&<span className="qb-choice-result" aria-hidden="true">✓</span>}
       </button>;
      })}
     </div>
     {!revealed&&question.question_type==="multiple_response"&&
      <div className="qb-selection-control" aria-live="polite">
       <p>{t.selectCount}: <strong>{draft.length}/{question.select_count}</strong></p>
       <button type="button" onClick={()=>submit(draft)} disabled={draft.length!==question.select_count}>
        {t.checkAnswer}
       </button>
      </div>}
     {revealed?<section className={"qb-feedback "+(correct?"good":"bad")} aria-live="polite" aria-label={t.summary}>
      <h3>{correct?"✓ "+t.right:"× "+t.incorrect}</h3>
      <p><strong>{t.yourAnswer}:</strong> {chosen.join(", ")} · <strong>{t.correctAnswer}:</strong> {question.answer.join(", ")}</p>
      <h4>{t.why}</h4>
      <p>{question.explanation}</p>
      {question.sources.length>0&&<div className="qb-references">
       <strong>{t.references}</strong>
       {question.sources.filter(url=>url.startsWith("https://")).map((url,i)=>
        <a key={url} href={url} target="_blank" rel="noopener noreferrer">
         {i+1}. {(()=>{try{const u=new URL(url);return u.hostname+u.pathname;}catch{return url;}})()} ↗
        </a>)}
      </div>}
     </section>:<p className="qb-prompt">{t.answerNow}</p>}
     {setResult.answered===setResult.total&&<div className="qb-complete" role="status">
       <strong>{t.complete} — {setResult.correct}/{setResult.total} ({Math.round(setResult.correct/setResult.total*100)}%)</strong>
       <p>{t.review}</p>
     </div>}
     <div className="qb-controls">
      <button type="button" onClick={()=>navigate(current-1)} disabled={current===0}>{t.previous}</button>
      <button type="button" onClick={nextUnanswered} disabled={setResult.answered===setResult.total}>{t.nextUnanswered}</button>
      <button type="button" onClick={()=>navigate(current+1)} disabled={current===questions.length-1}>{t.next}</button>
     </div>
    </section>

    <aside className="qb-aside" aria-label={t.jump}>
      <div className="qb-aside-head"><h2>{t.jump}</h2><p>{t.answered}: {setResult.answered}/{setResult.total}</p></div>
      <div className="qb-grid">
       {questions.map((q,i)=>{
        const selected=answers[activeSet]?.[q.id];
        const partial=drafts[activeSet]?.[q.id]?.length;
        const status=selected===undefined?(partial?"draft":"unanswered"):sameAnswers(selected,q.answer)?"correct":"incorrect";
        return <button type="button" key={q.id} onClick={()=>navigate(i)}
         className={"qb-jump "+status+(i===current?" current":"")}
         aria-current={i===current?"step":undefined}
         aria-label={t.question+" "+(i+1)+" · "+(selected===undefined?t.remaining:sameAnswers(selected,q.answer)?t.correct:t.wrong)}>
         {i+1}
        </button>;
       })}
      </div>
      <div className="qb-legend"><span><i className="right"/> {t.correct}</span><span><i className="wrong"/> {t.wrong}</span><span><i className="pending"/> {t.remaining}</span></div>
      <button type="button" className="qb-reset" onClick={resetSet}>{t.restart}</button>
    </aside>
   </div>
  </div>
 </main>;
}
