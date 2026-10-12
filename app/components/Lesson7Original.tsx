import { LessonGlossary, TermText } from "./CourseGlossary";

// Nội dung VI giữ nguyên thông điệp và ví dụ do người dùng cung cấp.
// Chỉ tái cấu trúc Markdown thành JSX để hiển thị tốt trên mobile.
const notes = (value:string) => <TermText text={value} number={7} active={true}/>;
const tableRows = [
  ["Giữ lịch sử cũ", "Có", "Có, qua bản sao", "Không"],
  ["Tạo session mới", "Không", "Có", "Có"],
  ["Thử phương án khác", "Không phải mục đích chính", "Phù hợp", "Có thể"],
  ["Tránh stale context", "Không tự động", "Không tự động", "Tốt hơn"],
  ["Tiếp tục công việc cũ", "Phù hợp", "Không tối ưu", "Phù hợp khi cần làm sạch context"],
  ["Code đã thay đổi đáng kể", "Cần thận trọng", "Cần thận trọng", "Nên ưu tiên"],
];
const vocabulary = [
  ["Session State", "Trạng thái của phiên làm việc"],
  ["Resumption", "Việc tiếp tục phiên trước"],
  ["Resume", "Khôi phục và tiếp tục"],
  ["Fork", "Tạo nhánh từ phiên hiện có"],
  ["Context", "Ngữ cảnh AI sử dụng để xử lý yêu cầu"],
  ["Stale Context", "Ngữ cảnh lỗi thời"],
  ["Findings", "Những phát hiện hoặc kết quả rút ra sau phân tích"],
  ["Summary Injection", "Đưa bản tóm tắt vào ngữ cảnh mới"],
  ["Targeted Re-Analysis", "Phân tích lại có chọn lọc"],
  ["Full Re-Exploration", "Khảo sát, phân tích lại toàn bộ"],
  ["Divergent Exploration", "Khám phá những hướng giải quyết khác nhau"],
  ["Conversation History", "Lịch sử hội thoại"],
  ["Tool Results", "Kết quả trả về từ các công cụ"],
  ["Contradictory Advice", "Lời khuyên mâu thuẫn"],
  ["Baseline", "Cơ sở tham chiếu ban đầu"],
];
const cli = `# Tạo một phiên có tên
claude --name auth-review

# Tiếp tục phiên đó
claude --resume auth-review

# Hoặc tiếp tục phiên gần nhất
claude --continue`;
const oldCode = `// auth.js - phiên bản cũ
function isAdmin(user) {
  return true; // Lỗi: bất kỳ ai cũng là admin
}`;
const newCode = `// auth.js - phiên bản mới
function isAdmin(user) {
  return user?.role === "admin";
}`;
const sdk = `import { query } from "@anthropic-ai/claude-agent-sdk";

async function runAgent(prompt, options = {}) {
  let sessionId;

  for await (const message of query({
    prompt,
    options: {
      allowedTools: ["Read", "Glob", "Grep"],
      ...options,
    },
  })) {
    if (
      message.type === "system" &&
      message.subtype === "init"
    ) {
      sessionId = message.session_id;
      console.log("Session ID:", sessionId);
    }

    if (
      message.type === "result" &&
      message.subtype === "success"
    ) {
      console.log("Result:", message.result);
      sessionId = message.session_id;
    }
  }

  return sessionId;
}

// 1. Tạo session mới
const sessionId = await runAgent(
  "Analyze the authentication module"
);

// 2. Resume session đã tạo
await runAgent(
  "Continue analyzing the security issues",
  { resume: sessionId }
);

// 3. Fork từ session gốc
await runAgent(
  "Explore an alternative OAuth2 approach",
  {
    resume: sessionId,
    forkSession: true,
  }
);

// 4. Fresh start với bản tóm tắt
await runAgent(`
Previous findings:
- Authentication module was reviewed.
- Three security issues were identified.
- auth.ts and middleware.ts have since changed.

Re-read the modified files.
Verify which issues remain.
Do not rely on the old file contents.
`);`;
function Code({code}:{code:string}) {
  return <div className="pattern-code lesson7-verbatim-code"><div><span>Code example</span></div><pre>{code}</pre></div>;
}
export function Lesson7Original() {
  return <div className="lesson7-original">
    <div className="lesson7-original-lead">
      <p><strong>Chủ đề:</strong> Quản lý trạng thái phiên làm việc và tiếp tục công việc của AI Agent.</p>
      <p><strong>Nguồn:</strong> <a href="https://claudecertificationguide.com/learn/1-agentic-architecture/1-7-session-state-resumption" target="_blank" rel="noreferrer">Claude Certification Guide — Lesson 1.7</a>.</p>
      <p>Đây là bài học quan trọng trong phần Agentic Architecture &amp; Orchestration, đặc biệt khi xây dựng AI Agent để phân tích code, sửa lỗi hoặc làm việc trên những dự án lớn.</p>
    </div>
    <nav className="bilingual-toc" aria-label="Mục lục Lesson 1.7">
      {["Session State and Resumption là gì?","Ba phương pháp quản lý Session","Stale Context Problem","Targeted Re-Analysis","Ví dụ JavaScript với Claude Agent SDK","Bảng so sánh cần nhớ khi thi","Thuật ngữ tiếng Anh cần ghi nhớ"].map((s,i)=>
        <a key={s} href={`#lesson7-original-${i+1}`}><b>{i+1}</b><span>{s}</span></a>)}
    </nav>
    <LessonGlossary number={7}/>
    <section className="course-topic" id="lesson7-original-1">
      <h3>1. Session State and Resumption là gì?</h3>
      <p>Trước tiên, hiểu ba khái niệm:</p>
      <ul>
        <li><strong>Session (phiên làm việc):</strong> Một cuộc làm việc giữa người dùng và Claude, bao gồm các tin nhắn và kết quả công cụ.</li>
        <li><strong>State (trạng thái):</strong> Thông tin được duy trì trong phiên, chẳng hạn lịch sử hội thoại, kết quả đọc file và những gì đã phân tích.</li>
        <li><strong>Resumption (tiếp tục phiên):</strong> Khôi phục một phiên trước đó để Claude tiếp tục công việc.</li>
      </ul>
      <h4>Ví dụ thực tế</h4>
      <p>Bạn có một dự án Next.js gồm 50 file.</p>
      <p><strong>Ngày thứ nhất:</strong></p>
      <p>Bạn yêu cầu Claude phân tích hệ thống Authentication.</p>
      <p>Claude đã:</p>
      <ol>
        <li>Đọc <code>auth.ts</code>, <code>middleware.ts</code>, <code>session.ts</code>.</li>
        <li>Phát hiện ba lỗi liên quan đến xác thực.</li>
        <li>Đưa ra đề xuất sửa lỗi.</li>
        <li>Lưu lịch sử phân tích trong session.</li>
      </ol>
      <p><strong>Ngày thứ hai:</strong></p>
      <p>Bạn muốn Claude tiếp tục công việc mà không phải phân tích lại toàn bộ dự án.</p>
      <p>Vấn đề là nếu trong thời gian đó bạn đã sửa ba file trên, Claude có thể vẫn dựa vào kết quả đọc file cũ.</p>
      <p>Đó là lý do cần quản lý session đúng cách.</p>
    </section>
    <section className="course-topic" id="lesson7-original-2">
      <h3>2. Ba phương pháp quản lý Session</h3>
      <p>Đây là nội dung quan trọng nhất của Lesson 1.7.</p>
      <div className="lesson7-methods">
        <div><strong>Resume — Tiếp tục phiên cũ</strong><p>Giữ lịch sử và tiếp tục công việc đang làm.</p></div>
        <div><strong>Fork — Tạo nhánh phiên độc lập</strong><p>Dùng chung lịch sử ban đầu để thử nhiều hướng giải quyết.</p></div>
        <div><strong>Fresh Start + Summary Injection — Phiên mới kèm tóm tắt</strong><p>Loại bỏ lịch sử cũ không đáng tin cậy nhưng giữ lại kiến thức quan trọng.</p></div>
      </div>
      <h4>2.1. Resume</h4>
      <p>Resume = tiếp tục phiên hiện tại từ nơi đã dừng.</p>
      <p>Ví dụ với Claude Code CLI:</p>
      <Code code={cli}/>
      <p>Khi resume, lịch sử hội thoại trước đó được khôi phục, bao gồm các kết quả tool đã trả về.</p>
      <p><strong>Nên dùng khi:</strong> Bạn đang phân tích hệ thống và các file chưa thay đổi đáng kể.</p>
      <p><strong>Không nên dùng khi:</strong> Code đã bị thay đổi khiến những kết quả phân tích cũ không còn chính xác.</p>
      <h4>2.2. Fork Session</h4>
      <p>Fork = tạo một phiên mới dựa trên bản sao lịch sử phiên cũ.</p>
      <p>Giả sử bạn đã phân tích hệ thống Authentication và muốn thử hai cách cải tiến:</p>
      <ul><li>Phương án A: Authentication bằng JWT.</li><li>Phương án B: Authentication bằng session và cookie.</li></ul>
      <div className="lesson7-branches" aria-label="Ví dụ tách nhánh session">
        <div><strong>Session gốc</strong><span>Phân tích Authentication</span></div>
        <div className="lesson7-branch-pair"><div><strong>Session A</strong><span>Nghiên cứu JWT</span></div><div><strong>Session B</strong><span>Nghiên cứu Cookie Session</span></div></div>
      </div>
      <p>Hai phiên này có chung kiến thức ban đầu, nhưng lịch sử làm việc sau khi tách sẽ độc lập.</p>
      <p>Ví dụ:</p>
      <Code code="claude --resume auth-review --fork-session"/>
      <p>Trong Agent SDK, <code>fork_session: true</code> được sử dụng cùng <code>resume</code> để tạo nhánh từ một phiên cụ thể.</p>
      <p><strong>Lưu ý:</strong> Fork không tự giải quyết vấn đề dữ liệu cũ. Bởi vì nhánh mới kế thừa lịch sử từ phiên gốc, nó cũng kế thừa những kết quả tool đã lỗi thời.</p>
      <h4>2.3. Fresh Start + Summary Injection</h4>
      <p>Đây là cách phù hợp nhất khi code đã thay đổi nhiều.</p>
      <ul>
        <li><strong>Fresh Start:</strong> Khởi tạo một phiên hoàn toàn mới.</li>
        <li><strong>Summary:</strong> Bản tóm tắt các kết quả phân tích trước đó.</li>
        <li><strong>Injection:</strong> Đưa bản tóm tắt vào đầu phiên mới làm ngữ cảnh.</li>
      </ul>
      <p>Ví dụ nội dung cung cấp cho Claude:</p>
      <blockquote>Trong phiên trước, chúng ta đã phân tích hệ thống Authentication của dự án Next.js và phát hiện ba vấn đề bảo mật.

Sau đó tôi đã sửa <code>auth.ts</code>, <code>session.ts</code>, <code>middleware.ts</code>.

Hãy đọc lại ba file này để kiểm tra các thay đổi, đồng thời sử dụng những kết luận cũ còn phù hợp. Không giả định rằng lỗi cũ vẫn tồn tại.</blockquote>
      <p>Claude sẽ đọc lại các file đã thay đổi thay vì dựa vào dữ liệu lỗi thời.</p>
      <p><strong>Ưu điểm:</strong> Giữ kiến thức quan trọng, giảm lượng context không cần thiết và tránh phải phân tích lại toàn bộ 50 file.</p>
    </section>
    <section className="course-topic" id="lesson7-original-3">
      <h3>3. Stale Context Problem — Vấn đề ngữ cảnh lỗi thời</h3>
      <p>Đây là khái niệm trọng tâm của bài và là một điểm dễ xuất hiện trong kỳ thi.</p>
      <p>Stale Context là tình trạng AI sử dụng dữ liệu cũ không còn phản ánh thực tế hiện tại.</p>
      <p>Ví dụ:</p><p>Ngày thứ nhất, Claude đọc file:</p><Code code={oldCode}/>
      <p>Sau đó bạn sửa lại:</p><Code code={newCode}/>
      <p>Nếu resume phiên cũ, lịch sử vẫn chứa kết quả tool đã đọc phiên bản <code>return true</code>.</p>
      <p>Claude có thể đề xuất sửa một lỗi đã được khắc phục.</p>
      <h4>Tại sao không chỉ yêu cầu Claude đọc lại file?</h4>
      <p>Vì lịch sử cũ vẫn nằm trong session, tồn tại song song với kết quả đọc mới. Điều đó tạo nguy cơ Claude tham chiếu nhầm thông tin.</p>
      <p>Theo cách tiếp cận được nhấn mạnh trong bài học, khi context đã lỗi thời đáng kể, lựa chọn đáng tin cậy hơn là tạo phiên mới + truyền bản tóm tắt + đọc lại các file thay đổi.</p>
    </section>
    <section className="course-topic" id="lesson7-original-4">
      <h3>4. Targeted Re-Analysis — Phân tích lại có chọn lọc</h3>
      <p>Giả sử dự án có 50 file nhưng bạn chỉ sửa ba file.</p>
      <p>Bạn không cần yêu cầu Claude phân tích lại toàn bộ 50 file.</p>
      <p>Thay vào đó:</p>
      <div className="lesson7-files">
        <div><strong>50</strong><span>file đã được phân tích</span></div>
        <div><strong>47</strong><span>File không đổi</span><small>Giữ kết luận phù hợp</small></div>
        <div><strong>3</strong><span>File đã thay đổi</span><small>Đọc và phân tích lại</small></div>
      </div>
      <p><strong>Kết quả phân tích mới:</strong> Kiến thức cũ còn đúng + dữ liệu mới được kiểm chứng.</p>
      <p>Cách này được gọi là Targeted Re-Analysis, tức chỉ phân tích lại những phần đã thay đổi hoặc bị ảnh hưởng.</p>
      <p>Lưu ý trong thực tế, bạn cũng cần kiểm tra những file phụ thuộc vào các thay đổi đó nếu có nguy cơ bị ảnh hưởng.</p>
    </section>
    <section className="course-topic" id="lesson7-original-5">
      <h3>5. Ví dụ JavaScript với Claude Agent SDK</h3>
      <p>Bạn có thể áp dụng các cơ chế trên trong Node.js bằng package <code>@anthropic-ai/claude-agent-sdk</code>.</p>
      <p>Ví dụ bên dưới minh họa cách tạo session, lấy session ID và resume.</p>
      <Code code={sdk}/>
      <p>Điểm quan trọng: Khi gọi <code>resume</code>, SDK sử dụng lại lịch sử session. Khi gọi <code>forkSession: true</code> cùng <code>resume</code>, SDK tạo session mới có lịch sử riêng. Còn ví dụ cuối không truyền <code>resume</code>, nên tạo phiên mới từ bản tóm tắt.</p>
      <p>Đây là cú pháp được đối chiếu với <a href="https://code.claude.com/docs/en/agent-sdk/sessions" target="_blank" rel="noreferrer">tài liệu Sessions chính thức của Anthropic</a>.</p>
      <p>Một lưu ý kỹ thuật: Fork tách lịch sử hội thoại, không tự tạo một bản sao độc lập của thư mục code. Nếu hai agent cùng sửa file trong một thư mục, chúng vẫn có thể ảnh hưởng đến nhau.</p>
    </section>
    <section className="course-topic" id="lesson7-original-6">
      <h3>6. Bảng so sánh cần nhớ khi thi</h3>
      <div className="lesson7-table-wrap"><table><thead><tr><th>Tiêu chí</th><th>Resume</th><th>Fork</th><th>Fresh Start + Summary</th></tr></thead><tbody>
        {tableRows.map(row=><tr key={row[0]}>{row.map((v,i)=>i===0?<th scope="row" key={i}>{v}</th>:<td key={i}>{v}</td>)}</tr>)}
      </tbody></table></div>
    </section>
    <section className="course-topic" id="lesson7-original-7">
      <h3>7. Thuật ngữ tiếng Anh cần ghi nhớ</h3>
      <div className="lesson7-table-wrap"><table><thead><tr><th>Thuật ngữ</th><th>Ý nghĩa</th></tr></thead><tbody>
        {vocabulary.map(([term,meaning])=><tr key={term}><th scope="row">{term}</th><td>{meaning}</td></tr>)}
      </tbody></table></div>
    </section>
  </div>;
}
