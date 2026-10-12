# Lesson 3 — Subagent Invocation & Context Passing

## Mục đích
- Học **isolated context**: hai lần gọi Claude không chia sẻ history.
- **Parallel invocation**: `Promise.all` chạy web-source review và document review cùng lúc.
- **Explicit context passing**: coordinator thu kết quả, đưa JSON cho synthesis.
- **Structured metadata**: `source_url`, `document_name`, `page_number`, `confidence`.
- **Attribution failure**: chuyển GOOD/BAD để thấy hệ quả khi loại metadata.

## Cách chạy
```powershell
npm install
Copy-Item .env.example .env.local
# Thiết lập ANTHROPIC_API_KEY trong .env.local
npm run dev
```
Mở `http://localhost:3001/lesson3`. Nhập topic, web source có URL, document source rồi chạy GOOD. Chạy BAD để so sánh. Mỗi lần nhấn gọi Claude API thật và có thể phát sinh chi phí.

## Data flow
```text
Client → POST /api/context-passing → Coordinator
                                 ├─ web research call ─────┐
                                 └─ document research call ┤ Promise.all
                                                           ↓
                                 normalize/validate findings
                                                           ↓
                                    buildSynthesisContext(mode)
                                                           ↓
                                              synthesis call
                                                           ↓
                                                  UI + trace
```

## Giới hạn quan trọng
- Dự án vốn dùng `@anthropic-ai/sdk`, nên đây là cách **mô phỏng subagent bằng lời gọi Messages API độc lập**. Đây **không phải** `Agent` tool của Claude Agent SDK.
- Không có live web search. Web agent **chỉ** phân tích đoạn nguồn do bạn nhập; không xác minh URL, tính chính xác của excerpt hoặc tài liệu. Mẫu source có tính minh họa.
- GOOD giữ metadata đã được cung cấp và normalize; **không** chứng minh citation đúng sự thật. BAD là lỗi cố ý cho mục đích học.
- Không đưa `ANTHROPIC_API_KEY` vào React client. API route chạy phía server.
- Tách context logic sang `lib/context-passing.ts` để dễ test và review.

## Cấu trúc bài học trên giao diện
1. **A. Lý thuyết chi tiết**: 8 chủ đề có keywords tiếng Anh, code snippets, exam traps; nội dung ở `app/lesson3/Lesson3Theory.tsx`.
2. **B. Build Exercise**: API thật, so sánh GOOD/BAD, trace và JSON.
3. **C. Knowledge Quiz**: 10 câu trắc nghiệm tương tác, chấm điểm và giải thích chi tiết. Code ở `app/lesson3/Lesson3Quiz.tsx`. Quiz là client-side, không gọi API và không phát sinh phí.

Mục tiêu ôn tập: hiểu isolated context, explicit metadata passing, independent parallel calls, dependent sequential calls, và phân biệt Messages API simulation với Agent SDK.
