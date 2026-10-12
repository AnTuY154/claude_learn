"use client";

import { useState } from "react";
import { foundationLessons, type FoundationLesson } from "@/lib/foundation-study";

// Hai trang 1.1–1.2 có thiết kế riêng; dùng chính CSS lesson-* hiện hành
// để bổ sung nội dung mà không làm hỏng các Build Exercise và trace đang có.
export function FoundationTheory({ lessonNumber }: { lessonNumber: 1 | 2 }) {
  const lesson = foundationLessons[lessonNumber];
  return (
    <section className="foundation-study" id="certification-theory">
      <div className="section-heading">
        <span>Certification audit · Complete theory</span>
        <h2>Lý thuyết trọng tâm để đi thi</h2>
      </div>
      <p className="course-lede">{lesson.goal}</p>
      <div className="application-note foundation-bridge">
        <span>Liên hệ kiến thức</span>
        <p>{lesson.bridge}</p>
      </div>
      <nav className="foundation-toc" aria-label="Chủ đề bài học">
        {lesson.topics.map((t, index) => <a key={t.title} href={`#foundation-${lessonNumber}-${index}`}>
          <b>{String(index + 1).padStart(2, "0")}</b><span>{t.title}</span>
        </a>)}
      </nav>
      <div className="foundation-topics">
        {lesson.topics.map((topic, index) => (
          <section key={topic.title} className="course-topic" id={`foundation-${lessonNumber}-${index}`}>
            <div className="course-topic-heading"><span>{String(index + 1).padStart(2, "0")}</span><div>
              <small>{topic.english}</small><h3>{topic.title}</h3>
            </div></div>
            <p>{topic.explanation}</p>
            {topic.example && <div className="pattern-code">
              <div><span>Model / TypeScript example</span></div><pre>{topic.example}</pre>
            </div>}
            <div className="foundation-exam-key">
              <strong>Điểm thi cần nhớ</strong><p>{topic.examRule}</p>
            </div>
          </section>
        ))}
      </div>
      <p className="research-limit">Đối chiếu giáo trình: <a href={lesson.source} target="_blank" rel="noreferrer">Lesson {lesson.number}.x source ↗</a></p>
    </section>
  );
}

function countCorrect(lesson: FoundationLesson, answers: Record<number, number>): number {
  return lesson.quiz.filter((q, i) => answers[i] === q.correct).length;
}

export function FoundationQuiz({ lessonNumber }: { lessonNumber: 1 | 2 }) {
  const lesson = foundationLessons[lessonNumber];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const attempted = Object.keys(answers).length;
  const correct = countCorrect(lesson, answers);

  function reset() { setAnswers({}); setSubmitted(false); }

  return (
    <section className="course-quiz foundation-quiz" id="certification-quiz">
      <div className="section-heading">
        <span>Certification test · {lesson.quiz.length} scenarios</span>
        <h2>Kiểm tra mức độ hiểu bài {lessonNumber}</h2>
      </div>
      <p className="course-lede">Mỗi câu kiểm tra một quyết định kiến trúc. Hãy chọn đủ đáp án; phần lý giải và điểm thi sẽ hiện sau khi chấm. Quiz chạy tại client, không dùng API key.</p>
      <div className="course-quiz-meter">
        <strong>{submitted ? `Kết quả: ${correct}/${lesson.quiz.length}` : `Tiến độ: ${attempted}/${lesson.quiz.length}`}</strong>
        <div className="coverage-meter"><i style={{ width: `${(submitted ? correct : attempted) / lesson.quiz.length * 100}%` }}/></div>
        {submitted && <p role="status">{correct >= 8 ? "Đạt mục tiêu ôn tập (≥8/10)." : "Hãy xem lại các giải thích và ôn phần chưa nắm."}</p>}
      </div>
      <div className="course-questions">
        {lesson.quiz.map((q, index) => (
          <fieldset key={index} className="course-question">
            <legend><b>{String(index + 1).padStart(2, "0")}</b>{q.question}</legend>
            <div className="course-choices">
              {q.choices.map((choice, choiceIndex) => (
                <label key={choiceIndex} className={submitted && choiceIndex === q.correct ? "correct" : submitted && answers[index] === choiceIndex ? "wrong" : ""}>
                  <input type="radio" name={`foundation-${lessonNumber}-quiz-${index}`}
                    checked={answers[index] === choiceIndex} disabled={submitted}
                    onChange={() => setAnswers(prev => ({ ...prev, [index]: choiceIndex }))}/>
                  <b>{String.fromCharCode(65 + choiceIndex)}</b>{choice}
                </label>
              ))}
            </div>
            {submitted && <div className="course-answer" role="status">
              <strong>{answers[index] === q.correct ? "✓ Chính xác" : `✗ Chưa đúng · đáp án ${String.fromCharCode(65 + q.correct)}`}</strong>
              <p>{q.explanation}</p>
              <small>Keyword: {q.concept}</small>
            </div>}
          </fieldset>
        ))}
      </div>
      <div className="course-actions">
        {!submitted && <button type="button" disabled={attempted !== lesson.quiz.length} onClick={() => setSubmitted(true)}>Chấm điểm →</button>}
        <button type="button" className="secondary" onClick={reset}>Làm lại</button>
      </div>
    </section>
  );
}
