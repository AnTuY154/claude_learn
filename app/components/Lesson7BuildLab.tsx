import type { Locale } from "@/lib/bilingual-course";

const exercises = {
  vi: {
    heading:"Build Exercise 1.7 — Session Management Strategies",
    lead:"Bài tập gốc (45 phút): dùng Claude Code CLI phân tích 10 file, lưu findings, sửa 3 file, resume, fresh start và đối chiếu chất lượng. JavaScript chỉ dùng để tạo và sửa workspace mẫu; không phải Agent SDK lab.",
    commandsTitle:"Lệnh chạy theo đúng trình tự (Windows PowerShell / Terminal)",
    scenarios:[
      ["01 · Tạo named session, phân tích 10 file","Chạy setup, mở Claude Code với --name. Dán prompt 01-baseline-prompt.md; yêu cầu Claude dùng công cụ đọc đủ 10 file thật. Không sửa code.","Vì sao? Session chứa tool results của phiên bản code đầu tiên."],
      ["02 · Ghi findings có cấu trúc","Điền findings-summary.md: tên file, issue, severity, evidence và recommendation từ output thật. Kết luận không có lỗi cũng phải ghi rõ.","Vì sao? Đây là curated summary sẽ được đưa vào fresh session thay cho raw history."],
      ["03 · Sửa đúng 3 file","Thoát Claude, quay lại root rồi chạy npm run lab:session7:fix. Script chỉ sửa permissions.js, session.js, orders.js, và từ chối nếu summary chưa điền.","Vì sao? File trên disk giờ khác nội dung mà Claude đã Read từ phiên cũ."],
      ["04 · Resume để quan sát stale context","Mở lại cùng workspace với claude --resume lesson7-code-review. Dán 02-resume-prompt.md, so sánh nhận định dựa trên history và sau khi đọc file mới.","Vì sao? Resume giữ cả tool results cũ. Claude có THỂ nhắc lỗi đã sửa nhưng không chắc chắn sẽ sai."],
      ["05 · Fresh session + summary","Khởi tạo claude --name lesson7-fresh-review, không thêm --resume. Dán prompt 03-fresh-prompt.md, đọc summary và re-read ba file đã sửa cùng dependencies liên quan.","Vì sao? Summary Injection giữ kiến thức cần thiết mà không kéo raw tool results đã lỗi thời vào phiên mới."],
      ["06 · So sánh kết quả thật","Điền compare-results.md: có nhắc bug cũ không, đã đọc lại file nào, độ chính xác, bằng chứng và mâu thuẫn. Không điền kết quả giả.","Vì sao? Kiểm tra quyết định Resume hay Fresh dựa vào độ đáng tin của context."]
    ],
    prerequisite:"Cần Node.js và Claude Code CLI đã cài, đăng nhập thành công. Ba npm script setup/status/fix không cần API key và không gọi model; phiên claude có thể dùng credits/quota.",
    before:"Ba file lỗi ở trạng thái ban đầu",
    after:"Sau khi sửa, file thật thay đổi",
    outputs:"Quan sát và tự ghi kết quả, không phải log giả định",
    optional:"Mở rộng: Fork và Agent SDK (không bắt buộc)",
    optionalText:"Fork dùng để so sánh hướng xử lý, không làm mới stale context và không copy filesystem. Script Agent SDK cũ chỉ demo session options với code nhỏ; không thay thế bài 10 file này.",
    article:"Mở hướng dẫn 6 bước đầy đủ",
    source:"Xem source JavaScript có comment giải thích từng đoạn",
    result:"Kết quả cần đạt: 10 file được đọc, summary hoàn chỉnh, 3 file được fix, hai session được quan sát và bảng so sánh có dẫn chứng."
  },
  en: {
    heading:"Build Exercise 1.7 — Session Management Strategies",
    lead:"Original 45-minute exercise: use Claude Code CLI to analyze 10 actual files, record findings, modify 3 files, resume, start fresh with a curated summary, and compare results. JavaScript only scaffolds and changes the sample workspace.",
    commandsTitle:"Run these commands in order (PowerShell / Terminal)",
    scenarios:[
      ["01 · Named session; inspect 10 files","Run setup and start Claude Code with --name. Paste 01-baseline-prompt.md. Ask Claude to read all 10 files using its tools without modifying code.","Why? The original session stores tool results from the initial file versions."],
      ["02 · Structured findings","Complete findings-summary.md with actual file names, issues, severities, evidence and recommendations. Record clean files too.","Why? Curated knowledge will seed the new session without old raw tool outputs."],
      ["03 · Modify exactly 3 files","Exit Claude, return to the repo root and run npm run lab:session7:fix. The script modifies only permissions.js, session.js and orders.js after summary completion.","Why? The code on disk now differs from the saved tool output."],
      ["04 · Resume and inspect stale context","Use claude --resume lesson7-code-review in the same workspace. Paste 02-resume-prompt.md; compare statements from historical reads with current file reads.","Why? Resumed history may contain stale tool results, but mistakes are not guaranteed."],
      ["05 · Fresh session with summary","Start claude --name lesson7-fresh-review without --resume. Paste 03-fresh-prompt.md, read the curated summary and re-read only changed or affected files.","Why? Fresh context avoids carrying over raw stale tool outputs."],
      ["06 · Compare actual advice","Fill compare-results.md with observed contradictions, evidence and re-read scope. Do not invent results.","Why? The key skill is choosing based on validity of saved context."]
    ],
    prerequisite:"Requires Node.js and an authenticated Claude Code CLI. The local setup/status/fix scripts do not call an AI API; Claude CLI sessions may use paid credits or plan quota.",
    before:"Three intentionally flawed source files",
    after:"Updated files after the fix",
    outputs:"Record actual observations (illustrative file statuses only)",
    optional:"Optional extension: Fork and Agent SDK",
    optionalText:"Fork is for divergent exploration, not removal of stale history or filesystem isolation. The older Agent SDK script is a small session-option demonstration, not this full 10-file exercise.",
    article:"Open complete six-step instructions",
    source:"Read the fully commented JavaScript source",
    result:"Success means all 10 files were read, the summary was written, exactly 3 files were fixed, and actual resume/fresh comparisons were recorded."
  }
} as const;

export function Lesson7BuildLab({language}:{language:Locale}){
  const t=exercises[language];
  return <section className="live-lab bilingual-lab lesson7-build-lab" id="build">
    <div className="lab-heading"><div><span>BUILD EXERCISE · LESSON 1.7</span><h2>{t.heading}</h2></div><b>Claude Code CLI + Node.js</b></div>
    <p className="course-lede">{t.lead}</p>
    <div className="research-warning"><strong>{language==="vi"?"Điều kiện trước khi chạy":"Prerequisites"}:</strong> {t.prerequisite}</div>
    <div className="section-heading"><span>6 STEPS · 45 MINUTES</span><h2>{language==="vi"?"Bám sát từng bước của bài gốc":"The original six steps"}</h2></div>
    <ol className="lesson7-build-steps">{t.scenarios.map(([title,description,why])=>
      <li key={title}>
        <h3>{title}</h3><p>{description}</p><small>{why}</small>
      </li>
    )}</ol>
    <div className="section-heading"><span>COMMANDS</span><h2>{t.commandsTitle}</h2></div>
    <div className="lesson7-command-list">
      <div><strong>{language==="vi"?"Chuẩn bị và bắt đầu (repo root)":"Setup and start (repo root)"}</strong>
        <pre>{["npm run lab:session7:setup","npm run lab:session7:status","cd lesson7-session-workspace","claude --name lesson7-code-review",
          "# Paste 01-baseline-prompt.md and complete findings-summary.md"].join("\n")}</pre></div>
      <div><strong>{language==="vi"?"Sau khi lưu summary, sửa đúng 3 file":"After recording summary, fix exactly 3 files"}</strong>
        <pre>{["# First exit Claude Code with /exit","cd ..","npm run lab:session7:fix","npm run lab:session7:status"].join("\n")}</pre></div>
      <div><strong>{language==="vi"?"Resume session cũ":"Resume old session"}</strong>
        <pre>{["cd lesson7-session-workspace","claude --resume lesson7-code-review","# Paste 02-resume-prompt.md; document actual observations"].join("\n")}</pre></div>
      <div><strong>{language==="vi"?"Fresh session, không dùng --resume":"Fresh session: no --resume"}</strong>
        <pre>{["# Exit old session first","claude --name lesson7-fresh-review","# Paste 03-fresh-prompt.md; read findings-summary.md","# Fill compare-results.md with REAL comparisons"].join("\n")}</pre></div>
    </div>
    <div className="section-heading"><span>BEFORE → AFTER</span><h2>{language==="vi"?"Code ba file tạo ra stale context":"Three file changes that cause stale context risk"}</h2></div>
    <div className="lesson7-build-code">
      <div><strong>{t.before}</strong><pre>{[
        "// permissions.js: user nào cũng có quyền admin",
        "return true;",
        "",
        "// session.js: tự nâng role lên admin",
        "return { userId: user?.id ?? null, role: 'admin' };",
        "",
        "// orders.js: bất kỳ user nào cũng xem được order",
        "return DEMO_ORDERS.find(o => o.id === orderId);"
      ].join("\n")}</pre></div>
      <div><strong>{t.after}</strong><pre>{[
        "// permissions.js: dựa trên role của user",
        "return user?.role === 'admin';",
        "",
        "// session.js: không tự gán admin",
        "return { userId: user?.id ?? null, role: user?.role ?? 'guest' };",
        "",
        "// orders.js: lọc thêm owner",
        "return DEMO_ORDERS.find(o => o.id === orderId && o.userId === user?.id);"
      ].join("\n")}</pre></div>
    </div>
    <p className="bilingual-warning">{language==="vi"
      ?"Đây là code mô phỏng, không phải phân quyền production. Script setup/fix chỉ thao tác trong lesson7-session-workspace và không được tự sửa codebase thật."
      :"This is instructional demo code, not production authorization. setup/fix only operate within lesson7-session-workspace."}</p>
    <p className="lesson7-build-result"><strong>{language==="vi"?"Tiêu chí hoàn thành":"Completion criteria"}:</strong> {t.result}</p>
    <div className="bilingual-sdk-live">
      <strong>{t.article}</strong>
      <a href="https://github.com/AnTuY154/claude_learn/blob/main/docs/lesson7-build-exercise.md" target="_blank" rel="noreferrer">docs/lesson7-build-exercise.md ↗</a>
      <strong>{t.source}</strong>
      <a href="https://github.com/AnTuY154/claude_learn/blob/main/scripts/lesson7-workshop.mjs" target="_blank" rel="noreferrer">scripts/lesson7-workshop.mjs ↗</a>
    </div>
    <details className="lesson7-optional-sdk"><summary>{t.optional}</summary>
      <p>{t.optionalText}</p>
      <pre>{["# Optional: explore fork from existing history", "claude --resume lesson7-code-review --fork-session",
        "", "# Optional separate SDK demonstration", "npm install --no-save --package-lock=false @anthropic-ai/claude-agent-sdk",
        "npm run lab:sdk-sessions"].join("\n")}</pre>
      <a href="https://github.com/AnTuY154/claude_learn/blob/main/scripts/sdk-sessions-lab.mjs" target="_blank" rel="noreferrer">Agent SDK sample ↗</a>
    </details>
  </section>;
}
