# Claude Learning Lab · Agentic Architecture

Website ôn tập Claude Certified Architect Foundation, viết bằng Next.js App Router và TypeScript.

## Nội dung
- 1.1 Agentic Loops — agent/tool loop và stop_reason.
- 1.2 Multi-Agent Orchestration — coordinator và decomposition.
- 1.3 Context Passing — isolated subagents, metadata và quiz.
- 1.4 Workflow Enforcement & Handoff — prerequisite gates, structured escalation.
- 1.5 Agent SDK Hooks — PreToolUse, PostToolUse và normalizer.
- 1.6 Task Decomposition — fixed vs adaptive, attention dilution, multi-pass.
- 1.7 Session Resumption — resume, fork và fresh summary.

Mọi bài đều truy cập từ header. Lesson 1.4–1.7 có tóm tắt, lý thuyết chi tiết, liên hệ bài trước, traps, 8 câu trắc nghiệm giải thích và Build Exercise checklist.

## Chạy local

```powershell
npm ci
Copy-Item .env.example .env.local
# Điền ANTHROPIC_API_KEY vào .env.local nếu dùng các lab gọi API
npm test
npm run dev
```

Mở http://localhost:3001/ hoặc http://localhost:3001/lesson4 .

## GitHub Pages CI/CD
Khi merge/push lên `main`, workflow chạy test, TypeScript, static export và deploy tới
https://antuy154.github.io/claude_learn/ (nếu Pages đã được bật).

GitHub Pages không chạy Node.js API routes. Các phần lý thuyết, quiz và checklist hoạt động tĩnh; live Claude Labs 1–3 cần backend riêng. Không đưa API key vào Next.js client/public vars.

## 3 agent review nội dung
Đã có **script thực thi thật** 3 reviewer song song (source-fidelity, exam-readiness, JS/TS pedagogy) rồi một coordinator synthesis. Cần API key và credit Anthropic; không chạy mặc định trong CI để tránh phát sinh phí mỗi commit:

```powershell
$env:ANTHROPIC_API_KEY="YOUR_KEY"
npm run review:lessons
```

Kết quả viết vào `artifacts/lesson-review.md` (local-only). Ba agent chỉ được cung cấp lesson content và coverage rubric; việc chúng đánh giá **không thay thế** xác minh trực tiếp trang nguồn. Source links nằm trong lesson và curriculum.

Chi tiết triển khai GitHub Pages: [docs/github-pages.md](docs/github-pages.md).
