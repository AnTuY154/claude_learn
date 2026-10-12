# Kế hoạch cấu trúc đồng nhất 1.1–1.7 và biên bản kiểm tra 7 lượt

**Phạm vi:** https://claudecertificationguide.com/learn/1-agentic-architecture/1-1-agentic-loops đến `1-7-session-state-resumption`.  
**Quy trình:** thiết kế → 7 lượt review kế hoạch theo ba tiêu chí → coding → test → CI/CD.  
**Giới hạn review:** Đây là **bảy lượt tự đánh giá** của cùng trợ lý, **không phải** bảy phiên chuyên gia độc lập hoặc bảy subagent thật. Nội dung English được biên soạn sát tài liệu, không phải trích dẫn nguyên văn.

## Kế hoạch đã chọn trước khi code

Một React component dùng chung cho mọi bài: **detailed lesson (VI/EN) → key takeaways → graded quiz (VI/EN) → Build Exercise**. Mỗi phần lý thuyết gồm keywords, giải thích, ví dụ được phân biệt với API thật và điểm cần nhớ khi thi. Toàn bộ câu hỏi và đáp án được kiểm tra parity giữa hai ngôn ngữ. Lab là CLI Node.js có comment tiếng Việt, in `stop_reason`, tool inputs/results, model messages, `usage.input_tokens`/`usage.output_tokens`; API key chỉ ở môi trường local. GitHub Pages chỉ host học liệu và quiz.

## Bảy lượt double-check kế hoạch, mỗi lượt đủ ba góc độ

| Lượt | Độ chính xác (source fidelity) | Khả năng ôn thi (exam readiness) | Chất lượng kỹ thuật (technical) | Kết luận |
|---|---|---|---|---|
| **1. Cấu trúc** | Giữ mọi chủ đề chính từng source, không ghép bừa tên API. | Bắt đầu bằng lý thuyết, tóm tắt sau khi học. | Một component thay bảy JSX độc lập. | Dùng `BilingualLesson` và một schema chung. |
| **2. Song ngữ** | Keyword API giữ nguyên; hai bản VI/EN có cùng thứ tự khái niệm. | Quiz và lời giải phải đổi ngôn ngữ cùng bài. | React state + localStorage sau hydrate tránh SSR mismatch. | Lưu locale, không gọi server. |
| **3. Protocol & orchestration 1.1–1.3** | stop_reason; hub pattern; Task/Agent naming; citations không phải verification. | Câu hỏi về tool_result role, narrow decomposition, context loss. | CLI log từng request/tool; không gọi Promise.all là Agent tool thật. | Tách note guide vs SDK. |
| **4. Gates & hooks 1.4–1.5** | PreToolUse trước execution, PostToolUse sau; backend guard cần thiết. | Case refund/compliance/normalization. | Lab tài chính không có real payment API, SDK hooks có optional sample riêng. | Không tự gọi middleware giả là SDK Hook. |
| **5. Decomposition & sessions 1.6–1.7** | local pass + integration; resume/fork/fresh; stale tool results. | Case attention dilution và refactor forks. | Messages history demo khác persisted SDK session; thêm optional SDK session example. | Ghi rõ fork **không** tách filesystem. |
| **6. Triển khai, token & secrets** | Không hứa chính xác số token trước call; usage lấy response. | Debug trace cho thấy causal flow. | CLI Node.js, API key không dùng NEXT_PUBLIC, Pages static; không lộ secrets trong logs. | Log usage thật, không tự gán giá tiền. |
| **7. QA trước release** | Nguồn lesson link riêng; code minh họa đánh dấu demo. | Quiz answer parity và explanations. | CI test content, Node syntax, TypeScript/static export, sau cùng deploy. | Chỉ nói build thành công khi GitHub Actions xác nhận. |

## Đối chiếu các chủ đề bắt buộc từ nguồn

- **1.1:** four-step loop, `tool_use`, `end_turn`, tool result history, model-driven tool selection, termination anti-patterns, safety cap.
- **1.2:** hub-and-spoke, isolation, dynamic selection, scope partition, iterative refinement, narrow-decomposition failure; product nuance về nested delegation.
- **1.3:** Task/Agent naming, allowedTools exam nuance, AgentDefinition, complete findings, metadata, goal-oriented prompts, parallel independent calls, attribution, fork/resume.
- **1.4:** prompt guidance vs code enforcement, prerequisite gate, multi-concern requests, self-contained human handoff, lifecycle hooks supplemental.
- **1.5:** PreToolUse vs PostToolUse, normalized timestamps/statuses, policy checks, updatedToolOutput, compaction supplement.
- **1.6:** fixed pipeline vs adaptive decomposition, attention dilution, per-file local + cross-file integration.
- **1.7:** resume, fork, fresh summary, stale tool results, targeted reanalysis.

Nguồn nghiên cứu là giáo trình trên, đối chiếu SDK tại:
- https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript
- https://code.claude.com/docs/en/agent-sdk/hooks
- https://code.claude.com/docs/en/agent-sdk/sessions

## Các giới hạn không được che giấu

1. Bài học đã biên soạn lại cho dễ hiểu, không tuyên bố câu nào là nguyên văn nguồn khi chỉ paraphrase.
2. Website tĩnh không thể gọi Next.js server API hoặc giữ secret. Lab chạy trong máy với API credits.
3. `npm run lab -- 5` = Messages API **application-layer hook analogy**; `npm run lab:sdk-hooks` = real Agent SDK Hook (cần optional package).
4. `npm run lab -- 7` = application-level message history; `npm run lab:sdk-sessions` = real persisted Agent SDK sessions (cần optional package).
5. Mỗi lab gọi API có thể tiêu token tính phí; CI không tự chạy API thật.
6. 7 lượt double-check trên là 7 góc rà soát kế hoạch lặp có tiêu chí rõ, không thay thế independent peer review, nguồn gốc hay testing với API thật.
