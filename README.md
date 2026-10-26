# Claude Learning Lab — Claude Certified Architect, Domains 1–5 (30 bài)

Ứng dụng ôn tập theo 30 bài thuộc cả năm domain của [Claude Certification Guide](https://claudecertificationguide.com/learn/1-agentic-architecture/1-1-agentic-loops), xây dựng bằng Next.js App Router + TypeScript.

## Cấu trúc tất cả các bài (VI / EN)

1. **Bài giảng / Lecture**: giải thích biên soạn đầy đủ, sát mục tiêu từng Task Statement; ví dụ, thuật ngữ, phân biệt Exam Guide/Current state và bẫy thi trong cùng một phần. Có VI/EN và liên kết nguồn duy nhất tại `claudecertificationguide.com/learn`.
2. **Bài tập / Build Exercise**: các bước, giải thích, tiêu chí hoàn thành và ví dụ chạy kiểm chứng (chỉ khi có môi trường phù hợp).
3. **Câu hỏi / MCQ**: 4 lựa chọn không chọn sẵn, chấm và giải thích sau khi đã đọc bài giảng và làm bài tập.

Không sao chép hoặc dịch nguyên văn nội dung tác giả bên thứ ba. Nội dung website là bản diễn giải độc lập dựa trên nguồn gốc; mở liên kết bài gốc để đối chiếu nguyên văn.

Nút **VI/EN** ở đầu mỗi bài nhớ lựa chọn trong browser. Thanh header cho phép chuyển giữa 1.1–1.7, 2.1–2.5, 3.1–3.6, 4.1–4.6 và 5.1–5.6. Website: https://antuy154.github.io/claude_learn/

| Bài | Nội dung |
|---|---|
| 1.1 | Agentic Loops · tool_use / tool_result / end_turn |
| 1.2 | Multi-Agent Orchestration · coordinator / routing / refinement |
| 1.3 | Subagent Invocation & Context Passing · Agent/Task, isolation, metadata |
| 1.4 | Workflow Enforcement & Handoff · prerequisite gate / human escalation |
| 1.5 | Agent SDK Hooks · PreToolUse / PostToolUse |
| 1.6 | Task Decomposition · fixed/adaptive, attention dilution, integration |
| 1.7 | Session State & Resumption · resume / fork / fresh context |
| 2.1 | Tool Interface Design · descriptions, JSON Schema, misrouting |
| 2.2 | Structured Error Responses · errors, retry policy, valid empty |
| 2.3 | Tool Distribution & Choice · role scope, tool_choice, least privilege |
| 2.4 | MCP Server Integration · .mcp.json, env, resources |
| 2.5 | Built-in Tools · Grep, Glob, Read, Edit, Write, Bash |

## Domain 2: Tool Design & MCP (mới)

Nội dung 2.1–2.5 được biên soạn lại theo phương pháp Lesson 1.7: mỗi bài có **tình huống xuyên suốt**, 6–7 phần giải thích chi tiết, code JavaScript được comment, bảng so sánh, glossary VI/EN, **8 câu quiz/bài**, và Build Exercise theo task gốc.

**Mở website:**
- [2.1 Tool Interface Design](https://antuy154.github.io/claude_learn/domain2/lesson1/)
- [2.2 Structured Error Responses](https://antuy154.github.io/claude_learn/domain2/lesson2/)
- [2.3 Tool Distribution & Choice](https://antuy154.github.io/claude_learn/domain2/lesson3/)
- [2.4 MCP Server Integration](https://antuy154.github.io/claude_learn/domain2/lesson4/)
- [2.5 Built-in Tools](https://antuy154.github.io/claude_learn/domain2/lesson5/)

**Hướng dẫn thực hành đầy đủ:** [docs/domain2-build-exercises.md](docs/domain2-build-exercises.md).

```powershell
npm run lab:domain2 -- 1  # Thật: 20 Claude API calls, cần key + model
npm run lab:domain2 -- 2  # Mock recovery deterministic, không dùng AI
npm run lab:domain2 -- 3  # Local tool scoping demo
npm run lab:domain2 -- 4  # Kiểm tra MCP config template
npm run lab:domain2 -- 5  # Tạo fixture Grep/Glob/Edit (không ghi đè)
```

MCP v2 server + client **thật qua stdio** (không gọi Claude model):

```powershell
npm install --no-save --package-lock=false @modelcontextprotocol/server @modelcontextprotocol/client zod
npm run lab:domain2:mcp:client
```


## Domain 3 — Claude Code Configuration & Workflows (3.1–3.6)

6 bài học chi tiết (VI/EN) viết lại theo phương pháp Lesson 1.7, có case thực tế Next.js, 6–7 chủ đề đi từ cơ chế tới tình huống, ví dụ cấu hình/JS, bảng quyết định, glossary, 8 câu quiz/bài và Build Exercise riêng.

| Bài | Chủ đề | Trang |
|---|---|---|
| 3.1 | CLAUDE.md Hierarchy, Scope & Imports | [3.1](https://antuy154.github.io/claude_learn/domain3/lesson1/) |
| 3.2 | Custom Commands & Skills | [3.2](https://antuy154.github.io/claude_learn/domain3/lesson2/) |
| 3.3 | Path-Specific Rules | [3.3](https://antuy154.github.io/claude_learn/domain3/lesson3/) |
| 3.4 | Plan Mode vs Direct Execution | [3.4](https://antuy154.github.io/claude_learn/domain3/lesson4/) |
| 3.5 | Iterative Refinement | [3.5](https://antuy154.github.io/claude_learn/domain3/lesson5/) |
| 3.6 | CI/CD Integration | [3.6](https://antuy154.github.io/claude_learn/domain3/lesson6/) |

**Hướng dẫn chính:** [docs/domain3-build-exercises.md](docs/domain3-build-exercises.md).

```powershell
npm ci
npm test

# Tạo đúng 1 workspace practice; không gọi AI, không sửa home config
npm run lab:domain3 -- 1
npm run lab:domain3 -- 2
npm run lab:domain3 -- 3
npm run lab:domain3 -- 4
npm run lab:domain3 -- 5
npm run lab:domain3 -- 6
```

Các workspace nằm trong `domain3-workspaces/` (gitignored) và **không ghi đè dữ liệu**. Với 3.5, `npm test` trong fixture có một failing test cố ý. Với 3.6, workflow mẫu ở trong sandbox, không kích hoạt pipeline hoặc tự gọi Claude có phí. Để tương tác thực với Claude Code, chạy `claude` trong workspace với credentials/quota hợp lệ.


## Chính sách nguồn duy nhất / Source-of-truth policy (Domains 1–4)

**Nguồn tin cậy duy nhất khi biên soạn nội dung 24 bài: [Claude Certification Guide — Curriculum](https://claudecertificationguide.com/learn)** và đường dẫn Task Statement tương ứng trên cùng website. Không dùng blog, Reddit, mock đề hay suy luận hành vi API bên ngoài website làm bằng chứng cho đáp án. Mỗi bài giờ có phần **Bài giảng biên soạn theo nguồn** trước các chương chi tiết, gồm 5 mục tiêu kiến thức, định nghĩa/cơ chế, ví dụ giả định, phân biệt/giới hạn và bẫy thi; song ngữ VI/EN, dẫn link gốc.

Đặc biệt, một số bài trên trang nguồn phân biệt **Exam Guide v1.0** và **Current state** (ví dụ Task/Agent, /memory//context, batch server tools). Website học cũng ghi rõ phân biệt theo chính trang nguồn, không tự kiểm chứng hoặc thay đổi kết luận bằng tài liệu bên ngoài. Ví dụ bài giảng là tình huống tự dựng để minh họa cơ chế, không phải kết quả đo thực nghiệm. Các câu hỏi website vẫn là câu gốc tự biên soạn, không phải câu thi thật hay đáp án bị lộ.

**Kiểm tra:** `npm test` bao gồm `editorial-coverage.test.ts` kiểm đủ 24 nguồn chính xác, 120 learning objectives, song ngữ đầy đủ và khớp chính URL của từng bài. `npm run build` xác nhận xuất trang tĩnh. Xem [PR kiểm toán](https://github.com/AnTuY154/claude_learn/pull/6) để theo dõi lịch sử chỉnh sửa.

## Website local và kiểm thử

```powershell
npm ci
npm test
npm run build
npm run dev
```

Mở http://localhost:3001 và chọn bài. **GitHub Pages là static hosting**: nội dung bài, quiz, hướng dẫn code hoạt động; không thể tự giữ ANTHROPIC_API_KEY hay chạy Next.js API route. Key chỉ được sử dụng ở Node local/hosting backend có kiểm soát.


## Build Exercise Lesson 1.7 theo giáo trình (Claude Code CLI)

**Trước khi bắt đầu:** chạy `claude --version` để xác nhận Claude Code CLI có sẵn. Chỉ bắt đầu lệnh `claude --name ...` khi đã đăng nhập bằng phương thức hợp lệ. Không dán API key vào source hay vào website.


Bài tập 1.7 trên website sử dụng **Claude Code CLI** là phần thực hành chính: 10 source files → findings summary → sửa 3 file → resume → fresh session + summary → so sánh, đúng 6 bước của [guide gốc](https://claudecertificationguide.com/learn/1-agentic-architecture/1-7-session-state-resumption).

```powershell
npm run lab:session7:setup
npm run lab:session7:status
cd lesson7-session-workspace
claude --name lesson7-code-review
# Dán nội dung 01-baseline-prompt.md; ghi findings-summary.md; thoát Claude
cd ..
npm run lab:session7:fix
cd lesson7-session-workspace
claude --resume lesson7-code-review
# Sau đó thoát phiên cũ và mở phiên fresh:
claude --name lesson7-fresh-review
```

Chi tiết sáu bước, chú thích từng lý do, prompt và bảng so sánh tại [docs/lesson7-build-exercise.md](docs/lesson7-build-exercise.md). Script được comment đầy đủ: [scripts/lesson7-workshop.mjs](scripts/lesson7-workshop.mjs). **Không cần API key để tạo/sửa workspace**; các phiên Claude Code có thể phát sinh chi phí theo phương thức đăng nhập. `npm run lab -- 7` và `npm run lab:sdk-sessions` là ví dụ bổ trợ, **không phải bài tập chính**.

## Chạy API Labs (có chi phí token)

```powershell
$env:ANTHROPIC_API_KEY = "YOUR_KEY"   # Chỉ nhập local; không commit
$env:ANTHROPIC_MODEL = "YOUR_AVAILABLE_MODEL"
npm run lab -- 1
npm run lab -- 2
npm run lab -- 3
npm run lab -- 3 --bad
npm run lab -- 4
npm run lab -- 5
npm run lab -- 6
npm run lab -- 7
```

Code: [scripts/live-labs.mjs](scripts/live-labs.mjs). Log `API REQUEST`, `API RESPONSE`, `stop_reason`, `TOOL RUN` và `usage.input_tokens/output_tokens` lấy từ response thực, không tự đặt con số. Một số tool/nguồn là mock để học, không có giao dịch tài chính, không duyệt web hoặc đọc tài liệu bên ngoài mặc định.

**Phân biệt API/SDK:** `npm run lab -- 5` mô phỏng pre/post interception trong ứng dụng bằng Messages API, **không** phải SDK hooks. `npm run lab -- 7` minh họa resume/fork-like bằng message arrays, **không** phải persisted Agent SDK sessions.

Để chạy *Claude Agent SDK thật* cho 1.5 và 1.7:

```powershell
npm install --no-save --package-lock=false @anthropic-ai/claude-agent-sdk
npm run lab:sdk-hooks
npm run lab:sdk-sessions
```

Các ví dụ này sử dụng optional dependency, không được chạy trong CI hoặc build Pages vì có thể phát sinh chi phí, cần credentials/runtime hỗ trợ và chỉ nên chạy trong môi trường local được kiểm soát.

**Hướng dẫn đầy đủ:** [docs/live-labs-guide.md](docs/live-labs-guide.md).

## Kế hoạch và 7 lượt double-check

[docs/bilingual-course-plan-audit.md](docs/bilingual-course-plan-audit.md) ghi kế hoạch, 7 lượt kiểm tra theo ba tiêu chí **Độ chính xác – Khả năng ôn thi – Chất lượng kỹ thuật**, cùng phân biệt exam guide và API thực tế. Các lượt review này là tự đánh giá, không phải 7 subagent AI độc lập.

## CI/CD

Mọi commit `main` tự chạy unit tests → TypeScript → Next.js static export → GitHub Pages. Các API key **không** được đưa vào các client bundles hoặc workflow Pages.

## Optional: 3 AI review agents

`npm run review:lessons` có thể chạy **3 lượt gọi model song song** rồi một synthesis khi có key/credit. Đây là tùy chọn, không phải điều đã được chạy tự động để xác minh khóa học. Việc model tự đánh giá không thay thế kiểm tra nguồn chính thức.

[docs/github-pages.md](docs/github-pages.md) · [Anthropic TypeScript SDK](https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript) · [Claude Agent SDK Docs](https://code.claude.com/docs/en/agent-sdk/overview)

## Domain 4 — Prompt Engineering & Structured Output (4.1–4.6)

Sáu bài **VI/EN** theo cấu trúc các domain trước: câu chuyện thực tế, lý thuyết chi tiết có annotated JavaScript, decision matrix, từ vựng tương tác, **8 quiz mỗi bài**, và Build Exercise có lệnh tạo fixture local.

| Bài | Trọng tâm | Trang |
|---|---|---|
| 4.1 | Explicit Criteria, Severity, False Positives | [4.1](https://antuy154.github.io/claude_learn/domain4/lesson1/) |
| 4.2 | Few-Shot Prompting and Decision Rationales | [4.2](https://antuy154.github.io/claude_learn/domain4/lesson2/) |
| 4.3 | Tool Use, JSON Schema, Nullability | [4.3](https://antuy154.github.io/claude_learn/domain4/lesson3/) |
| 4.4 | Validation, Retry with Error Feedback | [4.4](https://antuy154.github.io/claude_learn/domain4/lesson4/) |
| 4.5 | Batch Workloads, custom_id, SLA | [4.5](https://antuy154.github.io/claude_learn/domain4/lesson5/) |
| 4.6 | Independent Reviewer, Local + Integration Passes | [4.6](https://antuy154.github.io/claude_learn/domain4/lesson6/) |

```powershell
npm ci
npm test
npm run lab:domain4 -- 1
# Replace 1 with 2...6 to generate separate exercises.
cd domain4-workspaces/lesson41
node check.mjs
```

Local exercises use deterministic mock files, never call Claude, refuse to overwrite a previous workspace and do not require an API key. For detailed walkthroughs see [docs/domain4-build-exercises.md](docs/domain4-build-exercises.md). The exam-guide decisions and deployment-specific October 2026 API caveats are labelled separately in lessons 4.3 and 4.5.

## CCAR-F content QA agent (nguồn duy nhất)

Agent mới đối chiếu **24 bài Domain 1–4** với đúng trang nguồn tại https://claudecertificationguide.com/learn, kiểm tra nội dung VI/EN, kiến thức, quiz và labs có bằng chứng trích dẫn. Chạy thủ công trong **Actions → CCAR-F Source-Only Curriculum Review** (cần API key/model) hoặc dùng `npm run review:ccarf -- --lesson all --check-only` để kiểm tra cấu trúc local **không xác minh nguồn**. Xem [docs/ccarf-source-review-agent.md](docs/ccarf-source-review-agent.md). Agent không tự sửa hoặc công bố kết quả chính xác tuyệt đối.

## Domain 5 — Context Management & Reliability (5.1–5.6)

Nguồn duy nhất: https://claudecertificationguide.com/learn/5-context-management. Sáu bài giảng song ngữ VI/EN, mỗi bài 7 chương phân tích bản chất/ứng dụng/giới hạn, 8 câu hỏi trắc nghiệm A–D, thuật ngữ, bảng ra quyết định và 5 bước Build Exercise.

| Bài | Task Statement |
| --- | --- |
| 5.1 | Context Window Management — facts, trimming, lost in the middle, caching scope |
| 5.2 | Escalation & Ambiguity Resolution — 3 triggers, 2 anti-patterns, identifiers |
| 5.3 | Error Propagation — failure context, partial results, recovery |
| 5.4 | Codebase Exploration — scratchpads, subagents, phase injection, manifests |
| 5.5 | Human Review — stratified sampling, field calibration, prioritised queues |
| 5.6 | Provenance — claim/source mapping, conflicts, dates and rendering |

Chạy lab không cần API key: `npm run lab:domain5 -- 1` (thay 1 bằng 2–6). Script không ghi đè workspace hiện có. Sau đó vào thư mục tương ứng trong `domain5-workspaces/` và chạy `node check.mjs`. Hướng dẫn [docs/domain5-build-exercises.md](docs/domain5-build-exercises.md).

Agent review duy nhất `npm run review:ccarf -- --lesson all` được mở rộng lên 30 bài; trong workflow Actions vẫn cần API credentials và phải chọn thủ công. `--check-only` chỉ kiểm cấu trúc, không được tuyên bố đã đối chiếu nguồn.

### Bổ sung chiều sâu sau khi đối chiếu nguồn ngày 26/10/2026

Báo cáo đề mục gốc gồm **30/30 trang truy cập được**. Những bài có các mục bị gộp quá ngắn đã được làm rõ thêm trong phần Bài giảng (trước Build Exercise): 1.5 Agent SDK Hooks (callback contracts, extra lifecycle hooks), 3.1 CLAUDE.md (permissions vs memory, compaction diagnostics), 3.6 CI/CD (headless JSON contract, flags, GitHub Actions, worktrees, Batch vs realtime). Các mục *Beyond the guide* được gắn nhãn riêng và không được coi là mục tiêu kiểm tra theo Task Statement. Đây là phần kiến thức được biên soạn lại từ trang nguồn, **không phải bản dịch nguyên văn**.

Bổ sung tiếp source-outline 1.4 và 3.2–3.4 với bốn chương đối chiếu: lifecycle hooks ngoài exam scope; hai cách diễn đạt frontmatter theo Exam Guide/Current state; đối chứng glob rules trên file match và không match; phát hiện ambiguity trước khi sửa code và phân việc khám phá cho Explore. Mục tiêu là bổ sung bản giải thích, **không phải sao chép nguyên văn** giáo trình.
