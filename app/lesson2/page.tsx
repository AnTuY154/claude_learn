import Link from "next/link";

export default function Lesson2Page() {
  return (
    <main className="lesson-page">
      <nav className="lesson-nav" aria-label="Điều hướng bài học">
        <Link href="/lesson1">← Bài 01</Link>
        <span>Agentic Architecture</span>
        <Link href="/lesson2">Claude Lab / Bài 02</Link>
      </nav>

      <div className="lesson-shell">
        <aside className="lesson-index" aria-label="Số bài học">
          <span>Lesson</span><strong>02</strong><i /><small>1.2</small>
        </aside>

        <article className="lesson-body">
          <header className="lesson-hero">
            <p>Agentic Architecture · 1.2</p>
            <h1>Multi-Agent<br />Orchestration</h1>
            <h2>Một coordinator phân rã công việc, gọi đúng specialist, rồi gom kết quả thành câu trả lời thống nhất.</h2>
          </header>

          <section className="lesson-summary">
            <span>Ý chính trong 30 giây</span>
            <p>Mô hình phổ biến là hub-and-spoke: mọi subagent trao đổi qua coordinator, không gọi trực tiếp lẫn nhau và không tự động dùng chung lịch sử.</p>
          </section>

          <section className="takeaway-grid" aria-label="Ba điểm cần nhớ">
            <div><b>01 / HUB</b><p>Coordinator là điểm định tuyến và tổng hợp duy nhất.</p></div>
            <div><b>02 / CONTEXT</b><p>Mỗi subagent chỉ biết context được truyền rõ ràng.</p></div>
            <div><b>03 / PLAN</b><p>Coordinator chịu trách nhiệm chọn agent, chia việc và refinement.</p></div>
          </section>

          <div className="lesson-columns">
            <div className="lesson-sections">
              <section><h3>Hub-and-spoke</h3><p>Coordinator nhận mục tiêu từ người dùng, quyết định specialist nào phù hợp, gửi từng nhiệm vụ hẹp và tổng hợp kết quả trả về. Luồng điều phối luôn quay lại hub.</p></section>
              <section><h3>Isolation là chủ đích</h3><p>Subagent không mặc định kế thừa conversation history, shared memory hay kết quả của agent khác. Coordinator phải truyền đúng dữ liệu đầu vào cho từng lời gọi.</p></section>
              <section><h3>Iterative refinement</h3><p>Sau khi nhận kết quả, coordinator có thể gọi thêm agent, bổ sung context hoặc yêu cầu sửa kết quả. Việc chia task quá hẹp ngay từ đầu dễ mất mối liên hệ giữa các phần.</p></section>
            </div>
            <aside className="exam-card"><span>Certification lens</span><p>Agent isolation tạo predictability; coordinator tạo coherence.</p></aside>
          </div>

          <section className="pattern-code">
            <div><span>Topology</span><h3>Coordinator là trung tâm</h3></div>
            <pre>{`User
  └─ Coordinator
      ├─ Fruit agent  → fruits[]
      ├─ Flower agent → flowers[]
      └─ Calculator   ← giá do coordinator truyền vào

Mọi kết quả quay về Coordinator.
Không có Fruit agent ↔ Flower agent.`}</pre>
          </section>

          <section className="application-note">
            <span>Áp dụng vào project</span>
            <p>Catalog hiện đã tách <strong>hoa quả</strong> và <strong>hoa</strong>. Live lab tiếp theo có thể dùng coordinator để định tuyến câu hỏi sang từng specialist rồi đưa giá đã tìm được cho calculator.</p>
          </section>

          <footer className="lesson-footer">
            <Link href="/lesson1">← Agentic Loops</Link><span>02 / 02</span>
            <a href="https://claudecertificationguide.com/learn/1-agentic-architecture/1-2-orchestration-patterns" target="_blank" rel="noreferrer">Nguồn bài học ↗</a>
          </footer>
        </article>
      </div>
    </main>
  );
}
