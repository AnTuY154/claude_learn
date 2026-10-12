"use client";

import Link from "next/link";
import { ExamDecisionBoard } from "./ExamDecisionBoard";
import { useState } from "react";
import type { CourseLesson } from "@/lib/agentic-course";
import { runLessonSimulation, type SimulationResult } from "@/lib/agentic-exercises";

function ExamQuiz({ lesson }: { lesson: CourseLesson }) {
  // Quiz chỉ dùng React state, không phát sinh token / Claude API.
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [graded, setGraded] = useState(false);
  const completed = Object.keys(answers).length;
  const score = lesson.questions.filter((q, index) => answers[index] === q.correct).length;
  return (
    <section className="course-quiz" id="quiz">
      <div className="section-heading"><span>Certification exam · 8 scenario questions</span><h2>Tự kiểm tra trước khi làm lab</h2></div>
      <p className="course-lede">Hãy chọn đủ 8 câu. Sau khi chấm, từng câu sẽ hiện đáp án và lý do, kể cả khi bạn đã chọn đúng.</p>
      <div className="course-quiz-meter">
        <strong>{graded ? `Kết quả: ${score}/${lesson.questions.length}` : `Đã làm: ${completed}/${lesson.questions.length}`}</strong>
        <div className="coverage-meter" aria-label="Tiến độ bài kiểm tra"><i style={{ width: `${(graded ? score : completed) / lesson.questions.length * 100}%` }} /></div>
        {graded && <p>{score >= 7 ? "Đã nắm khá tốt! Hãy đọc lại các điểm còn sai." : "Nên đọc lại các phần được giải thích trước khi thử lại."}</p>}
      </div>
      <div className="course-questions">
        {lesson.questions.map((question, index) => (
          <fieldset key={index} className="course-question">
            <legend><b>{String(index + 1).padStart(2, "0")}</b>{question.question}</legend>
            <div className="course-choices">
              {question.choices.map((choice, choiceIndex) => (
                <label key={choiceIndex}
                  className={graded && choiceIndex === question.correct ? "correct" : graded && answers[index] === choiceIndex ? "wrong" : ""}>
                  <input name={`q-${lesson.number}-${index}`} type="radio"
                    disabled={graded} checked={answers[index] === choiceIndex}
                    onChange={() => setAnswers(a => ({ ...a, [index]: choiceIndex }))}/>
                  <b>{String.fromCharCode(65 + choiceIndex)}</b>{choice}
                </label>
              ))}
            </div>
            {graded && <div className="course-answer" role="status">
              <strong>{answers[index] === question.correct ? "Đúng" : `Chưa đúng — chọn ${String.fromCharCode(65 + question.correct)}`}</strong>
              <p>{question.explanation}</p>
            </div>}
          </fieldset>
        ))}
      </div>
      <div className="course-actions">
        {!graded && <button disabled={completed !== lesson.questions.length} onClick={() => setGraded(true)}>Chấm điểm →</button>}
        <button className="secondary" onClick={() => { setAnswers({}); setGraded(false); }}>Làm lại</button>
      </div>
    </section>
  );
}

// Bài tập định hướng để thực hiện bằng code trên máy tính.
// Trên GitHub Pages không có Node server nên không giả vờ gọi SDK thật.
function Exercise({ lesson }: { lesson: CourseLesson }) {
  const [checked, setChecked] = useState<number[]>([]);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  return (
    <section className="live-lab course-exercise" id="exercise">
      <div className="lab-heading">
        <div><span>Build exercise · {lesson.duration}</span><h2>{lesson.exerciseTitle}</h2></div>
        <b>JS / TypeScript</b>
      </div>
      <div className="research-warning"><strong>Mục tiêu:</strong> tự thực hiện các bước này trong Node.js/Claude Code. Snippet là điểm bắt đầu để hiểu thuật toán, không phải một ứng dụng Agent SDK hoàn chỉnh hay kết quả API đã chạy.</div>
      <div className="course-exercise-list">
        {lesson.exerciseSteps.map((step, index) => (
          <label key={index}>
            <input type="checkbox" checked={checked.includes(index)} onChange={(e) => setChecked(previous =>
              e.target.checked ? [...previous, index] : previous.filter(value => value !== index))}/>
            <span><b>{String(index + 1).padStart(2, "0")}</b>{step}</span>
          </label>
        ))}
      </div>
      <div className="pattern-code course-exercise-code"><div><span>Code concept</span><h3>Đọc logic rồi tự mở rộng</h3></div><pre>{lesson.practiceCode}</pre></div>
      <div className="course-simulation">
        <div className="section-heading"><span>Local simulation · no API credits</span><h2>Quan sát logic bằng dữ liệu giả</h2></div>
        <button type="button" onClick={() => setSimulation(runLessonSimulation(lesson.number))}>Chạy mô phỏng →</button>
        {simulation && <div className="course-simulation-output" aria-live="polite">
          <h3>{simulation.title}</h3>
          <ol>{simulation.steps.map((step, index) => <li key={index}>
            <b>{step.stage}</b><code>{step.outcome}</code><p>{step.explanation}</p>
          </li>)}</ol>
        </div>}
      </div>
      <p className="research-limit">Hoàn thành {checked.length}/{lesson.exerciseSteps.length} mục · checklist lưu trong phiên trang hiện tại, không đồng bộ lên server.</p>
    </section>
  );
}

export default function CourseLessonView({ lesson }: { lesson: CourseLesson }) {
  const previous = lesson.number - 1, next = lesson.number + 1;
  return (
    <main className="lesson-page course-lesson">
      <nav className="lesson-nav" aria-label="Điều hướng gần bài học">
        <Link href={`/lesson${previous}`}>← Bài {String(previous).padStart(2,"0")}</Link>
        <span>Agentic Architecture · {lesson.label}</span>
        {next <= 7 ? <Link href={`/lesson${next}`}>Bài tiếp theo →</Link> : <Link href="/">Danh sách bài học →</Link>}
      </nav>
      <div className="lesson-shell">
        <aside className="lesson-index"><span>Lesson</span><strong>{String(lesson.number).padStart(2,"0")}</strong><i/><small>{lesson.label}</small></aside>
        <article className="lesson-body">
          <header className="lesson-hero">
            <p>Agentic Architecture · {lesson.label}</p>
            <h1>{lesson.title}</h1>
            <h2>{lesson.headline}</h2>
          </header>
          <section className="lesson-summary"><span>Ý chính trong 30 giây</span><p>{lesson.summary}</p></section>
          <section className="takeaway-grid" aria-label="Ba mục tiêu trọng tâm">
            {lesson.pillars.map(([title, description]) => (
              <div key={title}><b>{title}</b><p>{description}</p></div>
            ))}
          </section>
          <section className="application-note course-connection">
            <span>Liên hệ bài đã học</span><p>{lesson.related}</p>
          </section>
          <nav className="course-jump" aria-label="Mục lục bài">
            <a href="#theory">Lý thuyết</a>
            <a href="#traps">Exam traps</a>
            <a href="#quiz">Trắc nghiệm</a>
            <a href="#exercise">Build Exercise</a>
          </nav>
          <section id="theory" className="course-theory">
            <div className="section-heading"><span>Detailed notes · Certification concepts</span><h2>Kiến thức cần nắm</h2></div>
            {lesson.sections.map((section, index) => (
              <section className="course-topic" key={section.heading}>
                <div className="course-topic-heading"><span>{String(index + 1).padStart(2,"0")}</span><div>
                  <small>{section.keywords}</small><h3>{section.heading}</h3>
                </div></div>
                <p>{section.body}</p>
                {section.bullets && <ul>{section.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul>}
                {section.snippet && <div className="pattern-code"><div><span>TypeScript / JavaScript concept</span></div><pre>{section.snippet}</pre></div>}
                {section.warning && <div className="research-warning"><strong>Điểm dễ nhầm:</strong> {section.warning}</div>}
              </section>
            ))}
          </section>
          <section id="traps" className="trap-section">
            <span>Exam traps</span><h3>Nhìn đáp án để không bị đánh lừa</h3>
            <ol>{lesson.traps.map(trap => <li key={trap}>{trap}</li>)}</ol>
          </section>
          <ExamDecisionBoard number={lesson.number} />
          <ExamQuiz lesson={lesson}/>
          <Exercise lesson={lesson}/>
          <footer className="lesson-footer">
            <Link href={`/lesson${previous}`}>← Bài {previous}</Link>
            <span>{String(lesson.number).padStart(2,"0")} / 07</span>
            <a href={lesson.source} target="_blank" rel="noreferrer">Nguồn bài gốc ↗</a>
          </footer>
          {lesson.extraSource && <p className="research-limit">Đối chiếu API hiện tại: <a href={lesson.extraSource} target="_blank" rel="noreferrer">Anthropic documentation ↗</a></p>}
        </article>
      </div>
    </main>
  );
}
