"use client";

import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import enJson from "@/lib/question-bank/exams-en.json";
import viJson from "@/lib/question-bank/exams-vi.json";

type Language="vi"|"en";
type ChoiceKey="A"|"B"|"C"|"D";
type Question={
 id:string;domain_code:string;domain_name:string;question:string;
 options:{key:ChoiceKey;text:string}[];answer:ChoiceKey;explanation:string;sources:string[];
};
type ExamSet={set_id:string;questions:Question[]};
type ExamData={title:string;note:string;exam_sets:ExamSet[]};
type AnswerStore=Record<string,Record<string,ChoiceKey>>;
type SavedState={answers:AnswerStore;language:Language;indices:Record<string,number>;activeSet:string};
const bank:Record<Language,ExamData>={
 vi:viJson as unknown as ExamData,en:enJson as unknown as ExamData
};
const storageKey="ccarf-question-bank-answers-v1";
const setIds=bank.vi.exam_sets.map(item=>item.set_id);
const labels={
 vi:{
  kicker:"CCAR-F · NGÂN HÀNG CÂU HỎI",heading:"Luyện thi Question Bank",
  intro:"5 bộ đề · 60 câu mỗi bộ. Chọn một đáp án để xem ngay đúng/sai và lời giải. Chuyển ngôn ngữ không làm mất kết quả.",
  notOfficial:"Bộ đề ôn tập độc lập, không phải câu hỏi thi chính thức.",
  set:"Bộ đề",question:"Câu hỏi",answered:"Đã làm",correct:"Đúng",wrong:"Sai",remaining:"Còn lại",
  answerNow:"Chọn một đáp án để kiểm tra ngay.",yourAnswer:"Bạn đã chọn",correctAnswer:"Đáp án đúng",
  right:"Chính xác!",incorrect:"Chưa chính xác",why:"Giải thích",references:"Tài liệu tham khảo",
  previous:"Câu trước",next:"Câu tiếp theo",nextUnanswered:"Câu chưa làm tiếp",restart:"Làm lại bộ đề",
  restartConfirm:"Bạn có muốn xoá toàn bộ câu trả lời của bộ đề này không?",
  complete:"Hoàn thành bộ đề",summary:"Kết quả",home:"Về trang chủ",jump:"Đi đến câu hỏi",
  outOf:"trên",score:"Điểm",language:"Ngôn ngữ",total:"Tổng tiến độ",review:"Xem lại hoặc chuyển sang bộ đề khác."
 },
 en:{
  kicker:"CCAR-F · QUESTION BANK",heading:"Question Bank Practice",
  intro:"5 exam sets · 60 questions each. Choose an answer for instant feedback and an explanation. Switch languages without losing your answers.",
  notOfficial:"Independent practice questions; these are not official certification exam items.",
  set:"Exam set",question:"Question",answered:"Answered",correct:"Correct",wrong:"Incorrect",remaining:"Remaining",
  answerNow:"Select one option to check your answer instantly.",yourAnswer:"You selected",correctAnswer:"Correct answer",
  right:"Correct!",incorrect:"Not quite",why:"Explanation",references:"References",
  previous:"Previous",next:"Next question",nextUnanswered:"Next unanswered",restart:"Restart this set",
  restartConfirm:"Remove all answers for this exam set?",
  complete:"Set complete",summary:"Result",home:"Back to home",jump:"Jump to question",
  outOf:"of",score:"Score",language:"Language",total:"Overall progress",review:"Review your answers or choose another set."
 }
};

function safeRestore(input:unknown):SavedState|null{
 if(!input||typeof input!=="object")return null;
 const v=input as Partial<SavedState>;
 const language:Language=v.language==="en"?"en":"vi";
 const activeSet=typeof v.activeSet==="string"&&setIds.includes(v.activeSet)?v.activeSet:"SET01";
 const answers:AnswerStore={};
 const indices:Record<string,number>={};
 for(const s of bank.en.exam_sets){
  answers[s.set_id]={};
  const stored=v.answers?.[s.set_id];
  for(const q of s.questions){
   const value=stored?.[q.id];
   if(value==="A"||value==="B"||value==="C"||value==="D")answers[s.set_id][q.id]=value;
  }
  const raw=v.indices?.[s.set_id];
  indices[s.set_id]=Number.isInteger(raw)&&raw!==undefined&&raw>=0&&raw<60?raw:0;
 }
 return {language,activeSet,answers,indices};
}

export default function QuestionBank(){
 const [language,setLanguage]=useState<Language>("vi");
 const [activeSet,setActiveSet]=useState("SET01");
 const [answers,setAnswers]=useState<AnswerStore>({});
 const [indices,setIndices]=useState<Record<string,number>>({});
 const [hydrated,setHydrated]=useState(false);
 useEffect(()=>{
  try{
   const raw=localStorage.getItem(storageKey);
   if(raw){
    const saved=safeRestore(JSON.parse(raw));
    if(saved){setLanguage(saved.language);setActiveSet(saved.activeSet);setAnswers(saved.answers);setIndices(saved.indices);}
   }
  }catch{ /* Browser storage may be disabled. Practice still works in this tab. */ }
  setHydrated(true);
 },[]);
 useEffect(()=>{
  if(!hydrated)return;
  try{localStorage.setItem(storageKey,JSON.stringify({language,activeSet,answers,indices}));}catch{}
 },[hydrated,language,activeSet,answers,indices]);

 const t=labels[language],data=bank[language];
 const selectedSet=data.exam_sets.find(s=>s.set_id===activeSet)??data.exam_sets[0];
 const questions=selectedSet.questions;
 const current=Math.max(0,Math.min(questions.length-1,indices[activeSet]??0));
 const question=questions[current];
 const chosen=answers[activeSet]?.[question.id];
 const revealed=chosen!==undefined;
 const correct=chosen===question.answer;
 const result=useMemo(()=>{
  const perSet=bank.en.exam_sets.map(set=>{
   const a=answers[set.set_id]??{};
   return {id:set.set_id,
    answered:set.questions.filter(q=>a[q.id]!==undefined).length,
    correct:set.questions.filter(q=>a[q.id]===q.answer).length,
    total:set.questions.length};
  });
  return {perSet,overall:perSet.reduce((sum,s)=>sum+s.answered,0)};
 },[answers]);
 const setResult=result.perSet.find(s=>s.id===activeSet)!;

 const navigate=(index:number)=>{
  if(index<0||index>=questions.length)return;
  setIndices(old=>({...old,[activeSet]:index}));
  document.getElementById("qb-question")?.scrollIntoView({block:"start",behavior:"smooth"});
 };
 const choose=(key:ChoiceKey)=>{
  if(revealed)return;
  if(!question.options.some(x=>x.key===key))return;
  setAnswers(old=>({...old,[activeSet]:{...(old[activeSet]??{}),[question.id]:key}}));
 };
 const resetSet=()=>{
  if(!window.confirm(t.restartConfirm))return;
  setAnswers(old=>({...old,[activeSet]:{}}));
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
    {result.perSet.map((s,i)=><button type="button" key={s.id} className={"qb-set "+(activeSet===s.id?"active":"")}
     onClick={()=>setActiveSet(s.id)} aria-pressed={activeSet===s.id}>
      <span>{t.set} {String(i+1).padStart(2,"0")}</span>
      <strong>{s.answered}/{s.total}</strong>
      <span className="qb-set-bar"><i style={{width:String(100*s.answered/s.total)+"%"}}/></span>
     </button>)}
   </section>

   <section className="qb-statline" aria-label={t.summary}>
    <div><span>{t.answered}</span><strong>{setResult.answered}<small> / {setResult.total}</small></strong></div>
    <div><span>{t.correct}</span><strong>{setResult.correct}</strong></div>
    <div><span>{t.wrong}</span><strong>{setResult.answered-setResult.correct}</strong></div>
    <div><span>{t.score}</span><strong>{setResult.answered?Math.round(setResult.correct/setResult.answered*100):0}%</strong></div>
    <div className="qb-overall"><span>{t.total}</span><strong>{result.overall} / 300</strong></div>
   </section>

   <div className="qb-main">
    <section className="qb-exam" id="qb-question">
     <div className="qb-question-head"><span>{selectedSet.set_id} · {t.question} {current+1}/{questions.length}</span>
      <span className="qb-domain">{question.domain_code} · {question.domain_name}</span>
     </div>
     <h2>{question.question}</h2>
     <div className="qb-choices" role="group" aria-label={t.question+" "+(current+1)}>
      {question.options.map(option=>{
       const isSelected=chosen===option.key;
       const state=!revealed?"":option.key===question.answer?"correct":isSelected?"incorrect":"muted";
       return <button type="button" key={option.key} className={"qb-choice "+state+(isSelected?" selected":"")}
        onClick={()=>choose(option.key)} disabled={revealed} aria-pressed={isSelected}>
        <span className="qb-choice-key">{option.key}</span>
        <span className="qb-choice-copy">{option.text}</span>
        {revealed&&option.key===question.answer&&<span className="qb-choice-result" aria-label={t.correct}>✓</span>}
        {revealed&&isSelected&&!correct&&<span className="qb-choice-result" aria-label={t.wrong}>×</span>}
       </button>;
      })}
     </div>
     {revealed?<section className={"qb-feedback "+(correct?"good":"bad")} aria-live="polite" aria-label={t.summary}>
      <h3>{correct?"✓ "+t.right:"× "+t.incorrect}</h3>
      <p><strong>{t.yourAnswer}:</strong> {chosen} · <strong>{t.correctAnswer}:</strong> {question.answer}</p>
      <h4>{t.why}</h4>
      <p>{question.explanation}</p>
      {question.sources.length>0&&<div className="qb-references">
       <strong>{t.references}</strong>
       {question.sources.filter(url=>url.startsWith("https://")).map((url,i)=><a key={url} href={url} target="_blank" rel="noopener noreferrer">{i+1}. {(()=>{try{return new URL(url).hostname+new URL(url).pathname}catch{return url}})()} ↗</a>)}
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
        const status=selected===undefined?"unanswered":selected===q.answer?"correct":"incorrect";
        return <button type="button" key={q.id} onClick={()=>navigate(i)}
         className={"qb-jump "+status+(i===current?" current":"")}
         aria-current={i===current?"step":undefined}
         aria-label={t.question+" "+(i+1)+" · "+(selected===undefined?t.remaining:selected===q.answer?t.correct:t.wrong)}>
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
