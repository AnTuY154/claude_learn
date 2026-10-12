// Nội dung bài học tách riêng để dễ ôn lý thuyết mà không làm rối code API.
const concepts = [
  {
    title: "1. Coordinator và subagent là gì?",
    english: "Coordinator · Delegation · Specialized subagent",
    body: "Coordinator nhận yêu cầu, chia việc, chọn specialist, nhận kết quả và quyết định bước tiếp theo. Subagent chỉ giải quyết scope được giao. Agent không phải hàm JavaScript thuần: nó là một lượt thực thi model với instructions và công cụ được cấp.",
    example: "User → Coordinator → [Web Research, Document Research] → Coordinator → Synthesis → User",
    takeaway: "Coordinator chịu trách nhiệm orchestration; không đẩy trách nhiệm tổng hợp sang các specialist riêng lẻ.",
  },
  {
    title: "2. Invocation: gọi đúng agent",
    english: "Agent definition · Task/Agent tool · Tool restrictions",
    body: "Trong Claude Agent SDK, coordinator có thể dùng Agent tool (tài liệu cũ gọi Task) để giao nhiệm vụ cho agent được định nghĩa bởi description, prompt và tools. Description giúp nhận diện khi nào cần gọi, prompt định hướng hành vi, tools giới hạn năng lực sử dụng công cụ.",
    example: 'agents: { researcher: { description: "Research sources", prompt: "Return cited findings", tools: ["WebSearch"] } }',
    takeaway: "Repo hiện dùng @anthropic-ai/sdk: các lần gọi Messages API riêng biệt mô phỏng subagent, KHÔNG phải gọi Agent tool thật.",
  },
  {
    title: "3. Isolated context: mỗi agent có ngữ cảnh riêng",
    english: "Context isolation · Explicit context passing",
    body: "Subagent không tự động đọc được kết quả từ agent khác hoặc toàn bộ history của coordinator. Coordinator cần ghi rõ topic, scope, constraints, nguồn tham chiếu và kết quả liên quan trong lời gọi. Tránh giả định có shared memory.",
    example: 'callAgent("Document specialist", "Topic: SEO; source: internal-seo-report.md; goal: extract findings...")',
    takeaway: "Subagent knows only the context explicitly available to it (ngoài các cơ chế context được công cụ hỗ trợ).",
  },
  {
    title: "4. Structured findings & metadata",
    english: "Claim · source_url · document_name · page_number · confidence",
    body: "Kết quả nghiên cứu gồm nội dung (claim, analysis) và thông tin nguồn (metadata). Nếu coordinator chỉ giữ claim rồi bỏ URL/tên tài liệu/trang, synthesis không còn chứng cứ để trích dẫn. Cần validation vì JSON do LLM trả về có thể lỗi.",
    example: '{ claim: "A", analysis: "...", source_url: "https://example.com", document_name: null, page_number: null, confidence: "high" }',
    takeaway: "Có metadata chưa chắc nội dung đúng: muốn đáng tin cậy vẫn phải xác minh nguồn hỗ trợ claim.",
  },
  {
    title: "5. Parallel và sequential",
    english: "Independent tasks → parallel · Dependency → sequential",
    body: "Nếu Web Research và Document Research không cần output của nhau, chạy đồng thời để giảm thời gian. Synthesis phụ thuộc kết quả research nên chạy sau. Trong bài code này, Promise.all thực hiện parallel ở application layer.",
    example: "const [web, doc] = await Promise.all([researchWeb(), researchDocument()]);\nconst report = await synthesize([...web, ...doc]);",
    takeaway: "Trong Claude Agent SDK, parallel subagents tương ứng nhiều Agent tool calls trong cùng một lượt; Promise.all chỉ là mô phỏng bằng API.",
  },
  {
    title: "6. Goal-oriented delegation",
    english: "Specify goals, not micromanaged procedures",
    body: "Giao nhiệm vụ bằng mục tiêu, yêu cầu output, tiêu chuẩn chất lượng, nguồn cần dùng và giới hạn quyền. Tránh ép agent theo từng thao tác nhỏ nếu không cần. Ví dụ: tìm chứng cứ có URL và độ tin cậy, thay vì ra lệnh phải bấm kết quả đầu tiên.",
    example: 'Goal: "Extract 3 supported findings with citations, mark missing evidence."',
    takeaway: "Đưa đủ scope và acceptance criteria; để specialist chọn cách thực hiện hợp lý trong quyền được cấp.",
  },
  {
    title: "7. Diagnosing attribution failure",
    english: "Root cause · Context loss · Attribution failure",
    body: "Nếu research agent đã có URL/trang tài liệu nhưng báo cáo cuối không có citations, hãy kiểm tra payload coordinator gửi synthesis trước khi đổ lỗi cho synthesis model. Chạy GOOD/BAD ở lab: GOOD giữ metadata; BAD xóa metadata cố ý.",
    example: "GOOD: [{claim, analysis, source_url, page_number}]\nBAD:  [{claim, analysis}]",
    takeaway: "Lỗi thường nằm ở coordinator stripping structured metadata.",
  },
  {
    title: "8. Resume và fork session",
    english: "resume · fork_session / forkSession",
    body: "Resume tiếp tục một session đang có; fork tạo nhánh mới từ trạng thái có trước để thử hướng khác mà không trộn kết quả vào luồng gốc. Đây là khái niệm session management, không đồng nghĩa với truyền dữ liệu giữa mọi subagent.",
    example: "resume → tiếp tục hướng A\nfork → tách A thành A1 và A2",
    takeaway: "Dễ nhầm ở đề thi: continue một investigation = resume; thử hai chiến lược độc lập = fork.",
  },
];

export function Lesson3Theory() {
  return (
    <section className="lesson3-theory" id="lesson3-theory" aria-labelledby="theory-heading">
      <div className="section-heading">
        <span>Study notes · 8 concepts</span>
        <h2 id="theory-heading">Lý thuyết cần nắm trước khi thi</h2>
      </div>
      <p className="lesson3-intro">Mỗi phần gồm: khái niệm, thuật ngữ tiếng Anh, cách áp dụng bằng JavaScript/TypeScript và một điểm dễ xuất hiện trong câu hỏi tình huống.</p>
      <nav className="lesson3-topic-nav" aria-label="Đi đến chủ đề">
        {concepts.map((concept, i) => (
          <a key={concept.title} href={`#concept-${i + 1}`}>
            {String(i + 1).padStart(2, "0")} <span>{concept.title.replace(/^\\d+\\. /, "")}</span>
          </a>
        ))}
      </nav>
      <div className="lesson3-concepts">
        {concepts.map((concept, i) => (
          <article key={concept.title} id={`concept-${i + 1}`} className="lesson3-concept">
            <div className="lesson3-concept-head">
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div><small>{concept.english}</small><h3>{concept.title.replace(/^\\d+\\. /, "")}</h3></div>
            </div>
            <p>{concept.body}</p>
            <div className="lesson3-code"><span>Example / mental model</span><pre>{concept.example}</pre></div>
            <div className="lesson3-exam-note"><strong>Điểm thi cần nhớ</strong><p>{concept.takeaway}</p></div>
          </article>
        ))}
      </div>
    </section>
  );
}
