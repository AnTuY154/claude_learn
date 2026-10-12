# Claude Learning Lab — Agentic Architecture (1.1–1.7)

Ứng dụng ôn tập theo 7 bài của [Claude Certification Guide](https://claudecertificationguide.com/learn/1-agentic-architecture/1-1-agentic-loops), xây dựng bằng Next.js App Router + TypeScript.

## Cấu trúc tất cả các bài (VI / EN)

1. **Detailed Lesson**: lý thuyết đầy đủ, terms, examples và exam takeaways; đổi giữa **Tiếng Việt** và **English**.
2. **Key Takeaways**: tóm tắt các ý quan trọng **sau** lý thuyết.
3. **Knowledge Quiz**: trắc nghiệm có giải thích đúng/sai; câu hỏi và đáp án theo ngôn ngữ đã chọn.
4. **Build Exercise**: comment code, các bước tự làm, lệnh Node.js chạy thật và log từng request/tool/usage.

Nút **VI/EN** ở đầu mỗi bài nhớ lựa chọn trong browser. Thanh header cho phép chuyển giữa 1.1–1.7. Website: https://antuy154.github.io/claude_learn/

| Bài | Nội dung |
|---|---|
| 1.1 | Agentic Loops · tool_use / tool_result / end_turn |
| 1.2 | Multi-Agent Orchestration · coordinator / routing / refinement |
| 1.3 | Subagent Invocation & Context Passing · Agent/Task, isolation, metadata |
| 1.4 | Workflow Enforcement & Handoff · prerequisite gate / human escalation |
| 1.5 | Agent SDK Hooks · PreToolUse / PostToolUse |
| 1.6 | Task Decomposition · fixed/adaptive, attention dilution, integration |
| 1.7 | Session State & Resumption · resume / fork / fresh context |

## Website local và kiểm thử

```powershell
npm ci
npm test
npm run build
npm run dev
```

Mở http://localhost:3001 và chọn bài. **GitHub Pages là static hosting**: nội dung bài, quiz, hướng dẫn code hoạt động; không thể tự giữ ANTHROPIC_API_KEY hay chạy Next.js API route. Key chỉ được sử dụng ở Node local/hosting backend có kiểm soát.

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
