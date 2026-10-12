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

  function reset() { setAnswers({}); setSubmitted(false); }

  return (
    <section id="lesson3-quiz" aria-labelledby="quiz-title" style={{ marginBlock: 34 }}>
      <h2 id="quiz-title">C. Quiz kiểm tra kiến thức — 10 câu</h2>
      <p>Các câu hỏi theo dạng tình huống thường gặp khi ôn Claude Certified Architect. Chọn đủ đáp án rồi nhấn <strong>Chấm điểm</strong>; phần giải thích chỉ hiện sau khi nộp.</p>
      <p aria-live="polite">Đã trả lời: <strong>{completed}/{questions.length}</strong>{submitted && <> · Kết quả: <strong>{score}/{questions.length} ({Math.round(score / questions.length * 100)}%)</strong></>}</p>
      <div style={{ display: "grid", gap: 14 }}>
        {questions.map((item, i) => (
          <fieldset key={i} style={{ border: "1px solid #8885", borderRadius: 12, padding: 16 }}>
            <legend style={{ fontWeight: 650 }}>Câu {i + 1}: {item.q}</legend>
            {item.choices.map((choice, j) => (
              <label key={j} style={{ display: "flex", gap: 8, alignItems: "baseline", padding: "5px 0", cursor: submitted ? "default" : "pointer" }}>
                <input type="radio" name={`quiz-${i}`} checked={answers[i] === j} disabled={submitted}
                  onChange={() => setAnswers(prev => ({ ...prev, [i]: j }))}/>
                <span>{String.fromCharCode(65 + j)}. {choice}</span>
              </label>
            ))}
            {submitted && (
              <div role="status" style={{ marginTop: 10, borderTop: "1px solid #8885", paddingTop: 8 }}>
                <strong>{answers[i] === item.correct ? "✓ Chính xác" : `✗ Chưa đúng — Đáp án: ${String.fromCharCode(65 + item.correct)}`}</strong>
                <p>{item.explanation}</p>
              </div>
            )}
          </fieldset>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        {!submitted && <button type="button" disabled={completed !== questions.length} onClick={() => setSubmitted(true)}
          style={{ padding: "10px 18px", cursor: completed === questions.length ? "pointer" : "not-allowed" }}>Chấm điểm</button>}
        <button type="button" onClick={reset} style={{ padding: "10px 18px" }}>Làm lại</button>
      </div>
      {submitted && <p role="status"><strong>{score >= 8 ? "Đạt mục tiêu ôn tập!" : "Nên xem lại phần lý thuyết và các giải thích trên."}</strong> Mục tiêu đề xuất: từ 8/10 câu đúng.</p>}
    </section>
  );
}
