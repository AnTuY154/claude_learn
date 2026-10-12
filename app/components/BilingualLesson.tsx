"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { course, type Locale } from "@/lib/bilingual-course";
import { labExamples } from "@/lib/lab-examples";
import { Lesson7Original } from "./Lesson7Original";
import { LessonGlossary, TermText } from "./CourseGlossary";

const labels = {
  vi: {
    previous:"Bài trước", next:"Bài tiếp", lesson:"BÀI HỌC CHI TIẾT", overview:"Từ vựng và kiến thức cốt lõi", bridge:"Liên hệ với bài trước",
    source:"Nguồn tham khảo của bài", examNote:"ĐIỂM CẦN NHỚ KHI THI", important:"TÓM TẮT TRỌNG TÂM",
    sumTitle:"Ôn lại trước khi làm trắc nghiệm", quiz:"CÂU HỎI TRẮC NGHIỆM", quizTitle:"Kiểm tra mức độ hiểu bài",
    all:"Đã trả lời", grade:"Chấm điểm", retry:"Làm lại", right:"Chính xác", wrong:"Chưa đúng", answer:"Đáp án",
    explanation:"Vì sao?", target:"Mục tiêu luyện tập: từ 80% trở lên. Điểm này không phải chứng nhận đã đỗ bài thi.",
    lab:"BUILD EXERCISE", labTitle:"Chạy code và quan sát Agent vận hành",
    labDetail:"Đây là CLI thực hiện các cuộc gọi Claude bằng API key trong môi trường local. GitHub Pages không thể chạy backend hoặc giữ bí mật API key.",
    steps:"Các bước thực hành", snippet:"CODE MINH HỌA (CÓ COMMENT)", run:"Lệnh chạy", output:"LOG BẠN SẼ THẤY", live:"Xem toàn bộ code đang chạy trên GitHub",
    notice:"API calls có thể phát sinh chi phí theo token; số token thực tế được in từ response. Các ví dụ tài chính là demo, không chuyển tiền thật.",
    sdk:"PHẠM VI DEMO", sdkText:"Lab dùng @anthropic-ai/sdk (Messages API). Bài 1.5 minh họa pre/post interception bằng code ở application layer, KHÔNG phải hook callback của Claude Agent SDK. Bài 1.7 minh họa resume/fork bằng message history ở application layer, KHÔNG phải Agent SDK persisted session. Các khác biệt được ghi trong code và log.",
    vi:"Tiếng Việt", en:"English", percentage:"Điểm số", questions:"câu", tokens:"Token usage được lấy từ API; không sử dụng token khi chỉ xem website."
  },
  en: {
    previous:"Previous", next:"Next", lesson:"DETAILED LESSON", overview:"Concepts and essential terminology", bridge:"Connection to previous lessons",
    source:"Original lesson source", examNote:"EXAM TAKEAWAY", important:"KEY TAKEAWAYS",
    sumTitle:"Review before taking the quiz", quiz:"KNOWLEDGE QUIZ", quizTitle:"Check your understanding",
    all:"Answered", grade:"Grade answers", retry:"Try again", right:"Correct", wrong:"Not quite", answer:"Answer",
    explanation:"Why?", target:"Suggested practice goal: at least 80%. This score is not a passing certification result.",
    lab:"BUILD EXERCISE", labTitle:"Run code and inspect the agent logs",
    labDetail:"The CLI makes real Claude API calls using a local environment key. GitHub Pages cannot run a backend or securely store your API key.",
    steps:"Exercise steps", snippet:"COMMENTED CODE EXAMPLE", run:"Run locally", output:"EXPECTED LOG STRUCTURE", live:"View the complete runnable code on GitHub",
    notice:"API calls consume paid tokens; actual token counts come from the response. Financial examples are simulated and never transfer money.",
    sdk:"DEMO SCOPE", sdkText:"The live CLI uses @anthropic-ai/sdk (Messages API). Lesson 1.5 demonstrates pre/post interception at the application layer, NOT Claude Agent SDK hook callbacks. Lesson 1.7 demonstrates resume/fork using application message histories, NOT persisted Agent SDK sessions. The code and logs state these differences.",
    vi:"Tiếng Việt", en:"English", percentage:"Score", questions:"questions", tokens:"API usage is logged when you run the CLI; browsing this website does not consume API tokens."
  }
} as const;

// Toggle mặc định tiếng Việt để SSR/static export nhất quán; nhớ lựa chọn của người dùng
// trong browser sau khi hydrate. Không đọc localStorage ở render đầu (tránh mismatch).
export default function BilingualLesson({ number }: { number: number }) {
  const item = course[number];
  const [language,setLanguage] = useState<Locale>("vi");
  const [answers,setAnswers] = useState<Record<number,number>>({});
  const [graded,setGraded] = useState(false);
  useEffect(()=>{
    try { if (window.localStorage.getItem("claude-course-language") === "en") setLanguage("en"); } catch {}
  },[]);
  function switchTo(next:Locale) {
    setLanguage(next);
    try {window.localStorage.setItem("claude-course-language",next);} catch {}
  }
  if(!item) return <main><p>Lesson not found.</p></main>;
  const content=item[language], t=labels[language];
  const completed=Object.keys(answers).filter(k=>Number(k)<content.quiz.length).length;
  const score=content.quiz.filter((q,i)=>answers[i]===q.correct).length;
  const pass=Math.ceil(content.quiz.length*.8);

  return <main className="lesson-page bilingual-lesson">
    <nav className="lesson-nav" aria-label="Lesson navigation">
      {number>1 ? <Link href={`/lesson${number-1}`}>← {t.previous} {number-1}</Link> : <Link href="/">← Home</Link>}
      <span>Agentic Architecture · 1.{number}</span>
      {number<7 ? <Link href={`/lesson${number+1}`}>{t.next} {number+1} →</Link> : <Link href="/">Course →</Link>}
    </nav>
    <div className="lesson-shell">
      <aside className="lesson-index" aria-label="Lesson number">
        <span>Lesson</span><strong>{String(number).padStart(2,"0")}</strong><i/><small>1.{number}</small>
      </aside>
      <article className="lesson-body">
        <div className="course-language-row" aria-label="Language selector">
          <span>{t.lesson} · 1.{number}</span>
          <div role="group" aria-label="Content language">
            <button type="button" aria-pressed={language==="vi"} className={language==="vi"?"active":""} onClick={()=>switchTo("vi")}>VI</button>
            <button type="button" aria-pressed={language==="en"} className={language==="en"?"active":""} onClick={()=>switchTo("en")}>EN</button>
          </div>
        </div>

        {/* 1. CHI TIẾT BÀI HỌC đứng đầu, không phải summary. */}
        <header className="lesson-hero bilingual-hero">
          <p>{t.overview}</p><h1>{content.title}</h1><h2><TermText text={content.intro} number={number} active={language==="vi"}/></h2>
        </header>
        {number===7 && language==="vi" ? <Lesson7Original /> : <>
        <div className="application-note bilingual-bridge"><span>{t.bridge}</span><p>{content.bridge}</p></div>
        <nav className="bilingual-toc" aria-label="Lesson content">
          {content.topics.map((topic,i)=><a href={`#concept-${number}-${i}`} key={i}>
            <b>{String(i+1).padStart(2,"0")}</b><span>{topic.title}</span></a>)}
        </nav>
        {language==="vi" && <LessonGlossary number={number}/>}
        <section className="bilingual-topics" aria-label="Detailed theory">
          {content.topics.map((topic,i)=><section id={`concept-${number}-${i}`} className="course-topic" key={i}>
            <div className="course-topic-heading"><span>{String(i+1).padStart(2,"0")}</span>
              <div><small><TermText text={topic.keywords} number={number} active={language==="vi"}/></small><h3><TermText text={topic.title} number={number} active={language==="vi"}/></h3></div>
            </div>
            <p><TermText text={topic.body} number={number} active={language==="vi"}/></p>
            {topic.code && <div className="pattern-code"><div><span>JavaScript / TypeScript</span></div><pre>{topic.code}</pre></div>}
            <div className="foundation-exam-key"><strong>{t.examNote}</strong><p><TermText text={topic.note} number={number} active={language==="vi"}/></p></div>
            {topic.warning && <p className="bilingual-warning">{topic.warning}</p>}
          </section>)}
        </section>
        {number===7 && <section className="lesson7-comparison" aria-label={language==="vi"?"So sánh ba chiến lược session":"Compare session strategies"}>
          <div className="section-heading"><span>Session decision matrix</span><h2>{language==="vi"?"So sánh Resume, Fork và Fresh Start":"Resume vs Fork vs Fresh Start"}</h2></div>
          <div className="lesson7-table-wrap"><table>
            <thead><tr><th>{language==="vi"?"Tiêu chí":"Criterion"}</th><th>Resume</th><th>Fork</th><th>Fresh + Summary</th></tr></thead>
            <tbody>{(language==="vi"?[
              ["Giữ history cũ","Có","Có, bản sao","Không, chỉ summary"],
              ["Session mới","Không","Có","Có"],
              ["Thử hướng độc lập","Không phải mục tiêu chính","Phù hợp","Có thể"],
              ["Loại stale context","Không tự động","Không tự động","Tốt hơn khi đọc lại nguồn"],
              ["Tiếp tục việc cũ","Phù hợp","Không cần thiết","Khi history cần làm mới"],
              ["Code thay đổi đáng kể","Kiểm tra lại dữ liệu cũ","Vẫn kế thừa dữ liệu cũ","Ưu tiên summary và re-read"]
            ]:[
              ["Keeps old history","Yes","Yes, copied","No, only curated summary"],
              ["New session","No","Yes","Yes"],
              ["Explore alternatives","Not the main purpose","Well suited","Possible"],
              ["Removes stale context","Not automatically","Not automatically","Better with fresh reads"],
              ["Continue existing work","Well suited","Usually unnecessary","When history needs reset"],
              ["Code changed significantly","Check prior reads","Still inherits old reads","Prefer summary + re-read"]
            ]).map(row=><tr key={row[0]}>{row.map((cell,i)=>i===0?<th scope="row" key={i}>{cell}</th>:<td key={i}>{cell}</td>)}</tr>)}</tbody>
          </table></div>
          <p className="research-limit">{language==="vi"?"Lưu ý: Fork chỉ tách lịch sử hội thoại, không tách filesystem. Fresh + Summary là chiến lược, không phải một SDK option riêng.":"Note: Fork separates conversation history, not the filesystem. Fresh + Summary is a strategy, not a dedicated SDK option."}</p>
        </section>}
        </>}
        <p className="bilingual-source">{t.source}: <a href={item.source} target="_blank" rel="noreferrer">{item.source} ↗</a></p>

        {/* 2. SUMMARY đặt SAU phần lý thuyết, trước quiz. */}
        <section className="lesson-summary bilingual-summary" id="summary">
          <span>{t.important}</span><h2>{t.sumTitle}</h2>
          <ol>{content.summary.map((point,i)=><li key={i}><TermText text={point} number={number} active={language==="vi"}/></li>)}</ol>
        </section>

        {/* 3. TRẮC NGHIỆM. Toàn bộ câu hỏi/đáp án/giải thích thay đổi VI/EN. */}
        <section className="course-quiz bilingual-quiz" id="quiz">
          <div className="section-heading"><span>{t.quiz} · {content.quiz.length} {t.questions}</span><h2>{t.quizTitle}</h2></div>
          <div className="course-quiz-meter" aria-live="polite">
            <strong>{graded ? `${t.percentage}: ${score}/${content.quiz.length} (${Math.round(100*score/content.quiz.length)}%)` : `${t.all}: ${completed}/${content.quiz.length}`}</strong>
            <div className="coverage-meter"><i style={{width:`${100*(graded?score:completed)/content.quiz.length}%`}}/></div>
            {graded && <p>{score>=pass?"✓ ":"↻ "}{t.target}</p>}
          </div>
          <div className="course-questions">
            {content.quiz.map((q,i)=><fieldset className="course-question" key={i}>
              <legend><b>{String(i+1).padStart(2,"0")}</b>{q.question}</legend>
              <div className="course-choices">
                {q.choices.map((choice,j)=><label key={j} className={graded&&j===q.correct?"correct":graded&&answers[i]===j?"wrong":""}>
                  <input type="radio" name={`lesson-${number}-question-${i}`} checked={answers[i]===j} disabled={graded}
                    onChange={()=>setAnswers(a=>({...a,[i]:j}))}/>
                  <b>{String.fromCharCode(65+j)}</b>{choice}
                </label>)}
              </div>
              {graded && <div className="course-answer" role="status">
                <strong>{answers[i]===q.correct?t.right:`${t.wrong} — ${t.answer}: ${String.fromCharCode(65+q.correct)}`}</strong>
                <p>{t.explanation} {q.explanation}</p>
              </div>}
            </fieldset>)}
          </div>
          <div className="course-actions">
            {!graded && <button type="button" disabled={completed!==content.quiz.length} onClick={()=>setGraded(true)}>{t.grade} →</button>}
            <button type="button" className="secondary" onClick={()=>{setAnswers({});setGraded(false);}}>{t.retry}</button>
          </div>
        </section>

        {/* 4. BUILD EXERCISE: source runnable CLI, NO client API secret. */}
        <section className="live-lab bilingual-lab" id="build">
          <div className="lab-heading"><div><span>{t.lab} · 1.{number}</span><h2>{content.labTitle}</h2></div><b>Node.js + Anthropic API</b></div>
          <p className="course-lede">{t.labDetail}</p>
          <div className="research-warning"><strong>{t.sdk}:</strong> {t.sdkText}</div>
          <div className="section-heading"><span>{t.steps}</span><h2>{t.labTitle}</h2></div>
          <ol className="bilingual-lab-steps">{content.steps.map((step,i)=><li key={i}><strong>{String(i+1).padStart(2,"0")}</strong><span>{step}</span></li>)}</ol>
          <div className="pattern-code">
            <div><span>{t.snippet}</span><h3>{labExamples[number].title}</h3></div>
            <pre>{labExamples[number].code}</pre>
          </div>
          <div className="bilingual-run">
            <span>{t.run} (Node.js)</span>
            <pre>{`npm ci
# Set ANTHROPIC_API_KEY and ANTHROPIC_MODEL in your terminal
npm run lab -- ${number}`}</pre>
            <span>{t.output}</span>
            <pre>{`[LAB 1.${number}] START
[API request] model=... role=...
[API response] stop_reason=... input_tokens=... output_tokens=...
[LAB 1.${number}] COMPLETE / ERROR`}</pre>
            <p>{t.notice}</p><p><small>{t.tokens}</small></p>
            <a href="https://github.com/AnTuY154/claude_learn/blob/main/scripts/live-labs.mjs" target="_blank" rel="noreferrer">{t.live} ↗</a>
            {(number===5||number===7) && <div className="bilingual-sdk-live">
              <strong>{language==="vi"?"Tùy chọn: chạy Claude Agent SDK THẬT":"Optional: run the REAL Claude Agent SDK"}</strong>
              <p>{language==="vi"
                ?"Ví dụ riêng cho 1.5/1.7 dùng package @anthropic-ai/claude-agent-sdk, in sự kiện hook/session ID và usage/cost khi SDK cung cấp. Cần cài thêm package và có API credentials hợp lệ."
                :"The separate 1.5/1.7 examples use @anthropic-ai/claude-agent-sdk and print real hook events/session IDs and usage/cost when the SDK provides them. An additional package and valid credentials are required."}</p>
              <pre>{`npm install --no-save --package-lock=false @anthropic-ai/claude-agent-sdk
npm run ${number===5?"lab:sdk-hooks":"lab:sdk-sessions"}`}</pre>
              <a href={number===5
                ?"https://github.com/AnTuY154/claude_learn/blob/main/scripts/sdk-hooks-lab.mjs"
                :"https://github.com/AnTuY154/claude_learn/blob/main/scripts/sdk-sessions-lab.mjs"}
                target="_blank" rel="noreferrer">{language==="vi"?"Mở code SDK có comment":"Open commented SDK source"} ↗</a>
            </div>}
          </div>
        </section>
        <footer className="lesson-footer">
          <Link href={number>1?`/lesson${number-1}`:"/"}>← {t.previous}</Link><span>{String(number).padStart(2,"0")} / 07</span>
          {number<7?<Link href={`/lesson${number+1}`}>{t.next} →</Link>:<Link href="/">Course →</Link>}
        </footer>
      </article>
    </div>
  </main>;
}
