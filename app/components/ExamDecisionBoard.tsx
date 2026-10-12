import { examDecisions } from "@/lib/exam-decisions";

// Bảng ra quyết định cho 7 bài: cố tình dùng cùng UI class diagnostic của Lesson 2.
// Không dựa trên model response và chạy hoàn toàn trên GitHub Pages.
export function ExamDecisionBoard({ number }: { number: number }) {
  const rows = examDecisions[number];
  if (!rows) return null;
  return (
    <section className="diagnostic-section exam-decision-board" aria-labelledby={`decision-title-${number}`}>
      <div className="section-heading">
        <span>Certification reasoning · root cause</span>
        <h2 id={`decision-title-${number}`}>Gặp tình huống này, chọn giải pháp nào?</h2>
      </div>
      <div className="diagnostic-table-wrap">
        <table className="diagnostic-table">
          <thead><tr><th>Triệu chứng / đề thi</th><th>Hướng xử lý đúng</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.symptom}>
                <td><strong>{row.symptom}</strong><small>{row.because}</small></td>
                <td>{row.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
