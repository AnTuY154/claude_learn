"use client";

import Link from "next/link";
import SourceVerifiedLecture from "./SourceVerifiedLecture";
import LessonStageNav from "./LessonStageNav";
import { useEffect, useState } from "react";
import { domain2 } from "@/lib/domain2-course";
import type { Domain2Language } from "@/lib/domain2-types";
import { TermText, LessonGlossary } from "./CourseGlossary";

// Trang Domain 2 không ghép thêm một 'Story' ngắn ở cuối.
// Mỗi chương là bài giảng độc lập: context → cơ chế → code → pitfalls → comparison → quiz → exercise.
export default function Domain2Lesson({number}:{number:number}){
  const lesson=domain2[number];
  const [language,setLanguage]=useState<Domain2Language>("vi");
  const [answers,setAnswers]=useState<Record<number,number>>({});
  const [graded,setGraded]=useState(false);

  useEffect(()=>{try{if(localStorage.getItem("claude-course-language")==="en")setLanguage("en");}catch{}},[]);
  if(!lesson) return <main className="lesson-page"><p>Lesson not found.</p></main>;
  const t=lesson[language];
  const vi=language==="vi";
  const glossaryId=number+20;
  const display=(text:string)=><TermText text={text} number={glossaryId} active={vi}/>;
  const score=t.quiz.filter((q,i)=>answers[i]===q.correct).length;
  const totalAnswered=t.quiz.filter((_,i)=>answers[i]!==undefined).length;
  const scoreTarget=Math.ceil(t.quiz.length*0.8);
  const switchLang=(next:Domain2Language)=>{
    setLanguage(next);setAnswers({});setGraded(false);
    try{localStorage.setItem("claude-course-language",next);}catch{}
  };
  return <main className="lesson-page bilingual-lesson domain2-page">
    <nav className="lesson-nav" aria-label="Domain 2 lesson navigation">
      <Link href={number>1?`/domain2/lesson${number-1}`:"/lesson7"}>← {vi?"Bài trước":"Previous"} {number>1?`2.${number-1}`:"1.7"}</Link>
      <span>Tool Design &amp; MCP · 2.{number}</span>
      {number<5?<Link href={`/domain2/lesson${number+1}`}>{vi?"Bài tiếp":"Next"} 2.{number+1} →</Link>:<Link href="/domain3/lesson1">3.1 →</Link>}
    </nav>
    <div className="lesson-shell">
      <aside className="lesson-index" aria-label="Lesson number">
        <span>Domain</span><strong>02</strong><i/><small>2.{number}</small>
      </aside>
      <article className="lesson-body">
        <div className="course-language-row">
          <span>{vi?"BÀI HỌC CHI TIẾT":"DETAILED LESSON"} · 2.{number}</span>
          <div role="group" aria-label="Content language">
            <button type="button" aria-pressed={vi} className={vi?"active":""} onClick={()=>switchLang("vi")}>VI</button>
            <button type="button" aria-pressed={!vi} className={!vi?"active":""} onClick={()=>switchLang("en")}>EN</button>
          </div>
        </div>

        <LessonStageNav language={language} exerciseId="domain2-build" quizId="domain2-quiz" sourceUrl={lesson.source}/>
        <div id="lecture" className="lesson-stage-anchor" aria-hidden="true"/>
        <header className="lesson-hero bilingual-hero">
          <p>Claude Certified Architect · Domain 02 · Lesson 2.{number}</p>
          <h1>{t.title}</h1>
          <h2>{display(t.subtitle)}</h2>
        </header>
        <div className="application-note bilingual-bridge">
          <span>{vi?"KIẾN THỨC NỐI TIẾP":"PRIOR KNOWLEDGE"}</span><p>{display(t.bridge)}</p>
        </div>
        <section className="domain2-scenario">
          <span>{vi?"TÌNH HUỐNG XUYÊN SUỐT":"RUNNING SCENARIO"}</span>
          <h2>{t.scenarioTitle}</h2>
          <p>{display(t.scenario)}</p>
        </section>


        <nav className="bilingual-toc" aria-label="Domain 2 lecture outline">
          {t.sections.map((sec,i)=><a key={sec.title} href={`#d2-topic-${number}-${i}`}>
            <b>{String(i+1).padStart(2,"0")}</b><span>{sec.title}</span></a>)}
          <a href="#domain2-decision"><b>↔</b><span>{vi?"Bảng so sánh":"Decision table"}</span></a>
          <a href="#domain2-quiz"><b>?</b><span>{vi?"Trắc nghiệm":"Quiz"}</span></a>
          <a href="#domain2-build"><b>JS</b><span>Build Exercise</span></a>
        </nav>

        {vi&&<LessonGlossary number={glossaryId}/>}
        <section className="bilingual-topics" aria-label="Complete detailed explanation">
          {t.sections.map((sec,i)=><section className="course-topic domain2-topic" id={`d2-topic-${number}-${i}`} key={sec.title}>
            <div className="course-topic-heading"><span>{String(i+1).padStart(2,"0")}</span><div>
              <small>DOMAIN 02 · 2.{number}</small><h3>{sec.title}</h3>
            </div></div>
            {sec.explanation.map((paragraph,j)=><p key={j}>{display(paragraph)}</p>)}
            {sec.code&&<div className="pattern-code"><div><span>{sec.codeLabel??"JavaScript / TypeScript — annotated example"}</span></div><pre>{sec.code}</pre></div>}
            <div className="foundation-exam-key">
              <strong>{vi?"ĐIỂM CẦN NHỚ KHI THI":"EXAM TAKEAWAY"}</strong><p>{display(sec.keyPoint)}</p>
            </div>
            {sec.pitfall&&<p className="bilingual-warning">{display(sec.pitfall)}</p>}
          </section>)}
        </section>

        <SourceVerifiedLecture id={`2.${number}`} language={language}/>

        <section id="domain2-decision" className="lesson7-comparison">
          <div className="section-heading"><span>DECISION MATRIX</span><h2>{vi?"So sánh để chọn đúng giải pháp":"Choose by scenario"}</h2></div>
          <div className="lesson7-table-wrap">
            <table><thead><tr>{t.table.headers.map((h,i)=><th key={i}>{h}</th>)}</tr></thead>
            <tbody>{t.table.rows.map((r,i)=><tr key={i}>{r.map((v,j)=>j===0?<th key={j} scope="row">{display(v)}</th>:<td key={j}>{display(v)}</td>)}</tr>)}</tbody></table>
          </div>
        </section>

        <section className="domain2-vocabulary">
          <div className="section-heading"><span>ENGLISH + VIETNAMESE</span><h2>{vi?"Từ vựng phải nhớ khi thi":"Exam vocabulary"}</h2></div>
          <div className="lesson7-table-wrap"><table><thead><tr><th>English term</th><th>{vi?"Nghĩa tiếng Việt":"Vietnamese"}</th><th>{vi?"Giải thích ngắn":"Meaning"}</th></tr></thead>
          <tbody>{t.vocabulary.map(([term,meaning,desc])=><tr key={term}><th scope="row">{term}</th><td>{meaning}</td><td>{desc}</td></tr>)}</tbody></table></div>
        </section>

        <p className="bilingual-source">{vi?"Nguồn bài học gốc (nội dung được biên soạn lại)":"Original reference (independently paraphrased)"}: <a href={lesson.source} target="_blank" rel="noreferrer">{lesson.source} ↗</a></p>
        <section className="lesson-summary bilingual-summary" id="domain2-summary">
          <span>{vi?"TÓM TẮT TRỌNG TÂM":"KEY TAKEAWAYS"}</span>
          <h2>{vi?"Ôn lại trước khi làm bài":"Review before the quiz"}</h2>
          <ol>{t.summary.map((s,i)=><li key={i}>{display(s)}</li>)}</ol>
        </section>

        <section className="live-lab bilingual-lab domain2-build" id="domain2-build">
          <div className="lab-heading"><div><span>BUILD EXERCISE · 2.{number} · {t.lab.duration}</span><h2>{t.lab.title}</h2></div><b>JavaScript / Node.js</b></div>
          <p className="course-lede">{display(t.lab.goal)}</p>
          <div className="research-warning">{t.lab.disclaimer}</div>
          <ol className="domain2-lab-steps">{t.lab.steps.map((st,i)=><li key={i}>
            <div className="domain2-lab-step-index">{String(i+1).padStart(2,"0")}</div>
            <div><h3>{st.title}</h3><p>{st.instruction}</p><small><b>{vi?"Vì sao":"Why"}:</b> {st.why}</small><p><b>{vi?"Kết quả cần thấy":"Expected"}:</b> {st.expected}</p></div>
          </li>)}</ol>
          <div className="pattern-code"><div><span>{vi?"LỆNH CHẠY LOCAL":"LOCAL COMMANDS"}</span></div><pre>{t.lab.commands}</pre></div>
          <p><a href={`https://github.com/AnTuY154/claude_learn/blob/main/${t.lab.source}`} target="_blank" rel="noreferrer">{vi?"Mở code ví dụ có comment trên GitHub":"Open commented example on GitHub"} ↗</a></p>
          <p>{vi?"Xem website, học lý thuyết và làm quiz không tiêu tốn API tokens. Live API labs chỉ chạy trên máy có credentials hợp lệ.":"Reading and taking quizzes never consumes API tokens. Live API exercises require valid local credentials."}</p>
        </section>


        <section className="course-quiz bilingual-quiz" id="domain2-quiz">
          <div className="section-heading"><span>QUIZ · {t.quiz.length} {vi?"câu hỏi":"questions"}</span><h2>{vi?"Tự kiểm tra kiến thức":"Check your understanding"}</h2></div>
          <div className="course-quiz-meter" aria-live="polite">
            <strong>{graded?`${vi?"Điểm":"Score"}: ${score}/${t.quiz.length} (${Math.round(score/t.quiz.length*100)}%)`:`${vi?"Đã trả lời":"Answered"}: ${totalAnswered}/${t.quiz.length}`}</strong>
            <div className="coverage-meter"><i style={{width:`${100*(graded?score:totalAnswered)/t.quiz.length}%`}}/></div>
            {graded&&<p>{score>=scoreTarget?"✓ ":"↻ "}{vi?"Mục tiêu luyện tập ≥80%, không phải điểm đỗ chứng chỉ.":"Practice target ≥80%, not an official exam pass."}</p>}
          </div>
          <div className="course-questions">{t.quiz.map((q,i)=><fieldset key={i} className="course-question">
            <legend><b>{String(i+1).padStart(2,"0")}</b>{q.question}</legend>
            <div className="course-choices">{q.choices.map((choice,j)=><label key={j} className={graded&&j===q.correct?"correct":graded&&answers[i]===j?"wrong":""}>
              <input type="radio" name={`domain2-${number}-${i}`} checked={answers[i]===j} disabled={graded} onChange={()=>setAnswers(a=>({...a,[i]:j}))}/>
              <b>{String.fromCharCode(65+j)}</b>{choice}</label>)}</div>
            {graded&&<div className="course-answer" role="status"><strong>{answers[i]===q.correct?(vi?"Chính xác":"Correct"):(vi?"Chưa đúng":"Incorrect")+" — "+String.fromCharCode(65+q.correct)}</strong><p>{q.explanation}</p></div>}
          </fieldset>)}</div>
          <div className="course-actions">
            {!graded&&<button type="button" disabled={totalAnswered!==t.quiz.length} onClick={()=>setGraded(true)}>{vi?"Chấm điểm":"Grade"} →</button>}
            <button type="button" className="secondary" onClick={()=>{setAnswers({});setGraded(false);}}>{vi?"Làm lại":"Retry"}</button>
          </div>
        </section>

        <footer className="lesson-footer">
          <Link href={number>1?`/domain2/lesson${number-1}`:"/lesson7"}>← {vi?"Bài trước":"Previous"}</Link>
          <span>2.{number} / 2.5</span>
          <Link href={number<5?`/domain2/lesson${number+1}`:"/domain3/lesson1"}>{vi?"Bài tiếp":"Next"} →</Link>
        </footer>
      </article>
    </div>
  </main>;
}
