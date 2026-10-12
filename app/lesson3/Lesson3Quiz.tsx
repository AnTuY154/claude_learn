"use client";

import { useState } from "react";

// Quiz chạy hoàn toàn trên React client, KHÔNG tốn Claude API tokens.
// correct là index đáp án, explanation giải thích vì sao đúng và chỉ ra exam trap.
const questions = [
  { q: "Subagent có tự kế thừa conversation history của coordinator không?", choices: ["Có, luôn kế thừa", "Không, coordinator phải truyền context cần thiết", "Chỉ khi chạy song song", "Chỉ khi có WebSearch"], correct: 1, explanation: "Isolated context: không tự động chia sẻ history giữa các subagent." },
  { q: "Web Agent có URL nhưng báo cáo cuối thiếu citation. Kiểm tra điểm nào đầu tiên?", choices: ["Nâng cấp model synthesis", "Tăng số subagent", "Payload Coordinator → Synthesis có giữ source_url không", "Chạy lại search mà không dùng metadata"], correct: 2, explanation: "Attribution failure thường do coordinator bỏ metadata khi truyền context." },
  { q: "Web Agent và Document Agent độc lập. Cách điều phối phù hợp?", choices: ["Sequential", "Parallel", "Cho hai agent tự gọi nhau", "Chỉ dùng một agent"], correct: 1, explanation: "Independent → parallel. Chỉ synthesis phải chờ kết quả của cả hai." },
  { q: "Synthesis cần nhận thông tin gì để trích dẫn chính xác?", choices: ["Chỉ claim", "Chỉ topic", "Claim + source URL / document / page", "Chỉ confidence"], correct: 2, explanation: "Structured metadata giúp truy nguồn. Confidence riêng lẻ không phải citation." },
  { q: "Trong bài demo repo, Promise.all đóng vai trò gì?", choices: ["Thực hiện Agent tool của Claude Agent SDK", "Chạy hai API calls độc lập ở application layer", "Tự động chia sẻ context", "Bảo đảm không phát sinh chi phí"], correct: 1, explanation: "Promise.all là concurrency của JavaScript, không phải Agent/Task tool của Agent SDK." },
  { q: "Synthesis có thể chạy trước khi research hoàn thành không?", choices: ["Có, luôn luôn", "Không, vì synthesis phụ thuộc findings", "Có, nếu có 2 agent", "Có, nếu model mạnh"], correct: 1, explanation: "Dependent → sequential. Research có thể parallel với nhau, synthesis phải chờ input." },
  { q: "Prompt giao việc subagent nên ưu tiên điều gì?", choices: ["Micromanage từng cú click", "Chỉ ghi tên agent", "Goal, scope, expected output, constraints", "Bỏ qua tiêu chí nguồn"], correct: 2, explanation: "Specify goals, not procedures: giao mục tiêu rõ, ràng buộc và format kết quả." },
  { q: "Đã có URL trong JSON thì có chắc trích dẫn đúng?", choices: ["Có, vì có source_url", "Không, URL và claim vẫn cần kiểm chứng", "Có, nếu confidence=high", "Có, nếu có page_number"], correct: 1, explanation: "Metadata cho phép attribution nhưng không tự chứng minh nguồn là đúng hoặc hỗ trợ claim." },
  { q: "Bạn muốn tiếp tục cùng investigation hiện tại. Chọn?", choices: ["fork session", "resume session", "parallel spawning", "strip metadata"], correct: 1, explanation: "Resume tiếp tục session. Fork là tạo nhánh độc lập từ trạng thái cũ." },
  { q: "Bạn muốn thử hai chiến lược độc lập từ cùng trạng thái ban đầu. Chọn?", choices: ["fork session", "resume một session duy nhất", "xóa metadata", "đổi tên subagent"], correct: 0, explanation: "Fork tạo các nhánh để thử nghiệm độc lập mà không trộn state vào luồng chính." },
];

export function Lesson3Quiz() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const completed = questions.filter((_, i) => answers[i] !== undefined).length;
  const score = questions.filter((q, i) => answers[i] === q.correct).length;
  const progress = Math.round((completed / questions.length) * 100);

  // Reset cả selections và grading state. Không cần gọi Claude API.
  function reset() { setAnswers({}); setSubmitted(false); }

  return (
    <section id="lesson3-quiz" className="lesson3-quiz" aria-labelledby="quiz-title">
      <div className="section-heading">
        <span>Certification practice · 10 questions</span>
        <h2 id="quiz-title">Kiểm tra độ hiểu bài học</h2>
      </div>
      <p className="lesson3-intro">Các câu hỏi kiểm tra khả năng phân biệt nguyên nhân gốc, dependency và context passing. Trả lời hết rồi chấm điểm để xem giải thích theo từng tình huống.</p>
      <div className="lesson3-quiz-progress">
        <div><span>YOUR PROGRESS</span><strong>{completed} / {questions.length}</strong></div>
        <div className="coverage-meter" aria-label={`Đã hoàn thành ${progress}%`}><i style={{ width: `${progress}%` }} /></div>
        {submitted && <p role="status"><strong>{score}/{questions.length} đúng · {Math.round(score / questions.length * 100)}%</strong> — {score >= 8 ? "Đạt mục tiêu ôn tập." : "Đọc lại các giải thích và thử lần nữa."}</p>}
      </div>
      <div className="lesson3-questions">
        {questions.map((item, i) => (
          <fieldset key={i} className="lesson3-question">
            <legend><span>{String(i + 1).padStart(2, "0")}</span>{item.q}</legend>
            <div className="lesson3-answers">
              {item.choices.map((choice, j) => (
                <label key={j} className={submitted && j === item.correct ? "is-correct" : submitted && answers[i] === j ? "is-wrong" : ""}>
                  <input type="radio" name={`quiz-${i}`} checked={answers[i] === j} disabled={submitted}
                    onChange={() => setAnswers(prev => ({ ...prev, [i]: j }))} />
                  <b>{String.fromCharCode(65 + j)}</b><span>{choice}</span>
                </label>
              ))}
            </div>
            {submitted && <div className="lesson3-answer-explain" role="status">
              <strong>{answers[i] === item.correct ? "✓ Chính xác" : `✗ Chưa đúng · đáp án ${String.fromCharCode(65 + item.correct)}`}</strong>
              <p>{item.explanation}</p>
            </div>}
          </fieldset>
        ))}
      </div>
      <div className="lesson3-quiz-actions">
        {!submitted && <button type="button" disabled={completed !== questions.length} onClick={() => setSubmitted(true)}>Chấm điểm <b>→</b></button>}
        <button type="button" className="lesson3-reset" onClick={reset}>Làm lại bài kiểm tra</button>
      </div>
      <p className="research-limit">Quiz chạy trên trình duyệt; không sử dụng Claude API và không tính token.</p>
    </section>
  );
}
