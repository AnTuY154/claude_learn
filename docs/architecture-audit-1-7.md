# Audit kiến thức 1.1–1.7 — Claude Certified Architect

**Ngày:** 2026-10-12  
**Phạm vi:** 7 trang bài học gốc, JSX/TSX, lab/demo, quiz, test và navigation.  
**Phương pháp:** Ba **lượt tự rà soát theo ba vai trò đánh giá độc lập** của cùng trợ lý: (A) bám sát nguồn; (B) năng lực làm bài thi; (C) triển khai TypeScript / UI. Đây **không phải ba phiên subagent AI thực sự**; không tuyên bố đã chạy song song ba model. Ba agent API trong `scripts/review-lessons.mjs` là tùy chọn riêng, chưa chạy trong audit này.

## Review A — Source fidelity (đúng bài nguồn)

Nguồn đã đối chiếu:
- [1.1 Agentic Loops](https://claudecertificationguide.com/learn/1-agentic-architecture/1-1-agentic-loops)
- [1.2 Multi-Agent Orchestration](https://claudecertificationguide.com/learn/1-agentic-architecture/1-2-orchestration-patterns)
- [1.3 Subagent Invocation & Context Passing](https://claudecertificationguide.com/learn/1-agentic-architecture/1-3-subagent-invocation-context)
- [1.4 Workflow Enforcement & Handoff](https://claudecertificationguide.com/learn/1-agentic-architecture/1-4-workflow-enforcement-handoff)
- [1.5 Agent SDK Hooks](https://claudecertificationguide.com/learn/1-agentic-architecture/1-5-agent-sdk-hooks)
- [1.6 Task Decomposition](https://claudecertificationguide.com/learn/1-agentic-architecture/1-6-task-decomposition)
- [1.7 Session State & Resumption](https://claudecertificationguide.com/learn/1-agentic-architecture/1-7-session-state-resumption)

| Bài | Các ý phải có theo nguồn | Kết luận / xử lý |
|---|---|---|
| **1.1** | 4-step Messages API loop, `stop_reason`, `tool_use` → `tool_result`, model tool selection, 3 early-stop anti-patterns, cap chỉ là safety. | Bổ sung 7 chủ đề có JS examples và lưu ý production stop reasons (`pause_turn`, `max_tokens`, `refusal`...). Không đánh đồng mọi lý do không phải end_turn với tool_use. |
| **1.2** | strict hub-and-spoke theo bài thi, isolated context, dynamic agent selection, research partition, iterative refinement, narrow decomposition diagnosis. | Bổ sung 8 chủ đề và nhắc rõ phân biệt *breadth vs depth*. Coverage model tự chấm không tự xác minh evidence; bổ sung cảnh báo ngay trên UI. |
| **1.3** | Task/Agent tool, `allowedTools` exam vs SDK, description/prompt/tools, 3 context rules, metadata, parallel spawning, fork/resume. | Kiểm tra 8-topic overview, bổ sung quiz về AgentDefinition/permission/dependency; sửa regex heading. Không nhầm `Promise.all` simulation với Agent tool thật. |
| **1.4** | prompt vs programmatic gates, verify ID trước refund, compound concerns, self-contained handoff, subagent lifecycle beyond-guide. | Nội dung hiện đã có; bổ sung 4 decision cases chẩn đoán. Guard chỉ có bảo đảm nếu nằm trên mọi execution path đáng tin, không phải cứ viết một hook là security tự động an toàn. |
| **1.5** | PreToolUse trước side effect, PostToolUse sau tool trước model, data normalization và approval; PreCompact beyond-guide. | Nội dung hiện đã có; bổ sung decision cases và ví dụ symptom. `updatedToolOutput` là field thay output; PostToolUse không rollback giao dịch. |
| **1.6** | fixed pipeline vs adaptive plan; attention dilution; per-file passes + cross-file integration. | Nội dung hiện đã có; bổ sung decision cases giúp chọn đúng pattern, kể cả tình huống batching vẫn thiếu integration pass. |
| **1.7** | resume, fork, fresh summary; stale tool results; targeted changed-file reanalysis. | Nội dung hiện đã có; bổ sung decision cases cho dependency impact. Fork copy baseline nên không làm sạch stale history. |

**Lưu ý nguồn:** Tài liệu hướng dẫn thi có thể đơn giản hóa behavior của sản phẩm. Phần *exam rule* và *production nuance* phải được phân biệt:
- `allowedTools` có Task/Agent là câu trả lời theo guide, nhưng trong SDK hiện đại `allowedTools` chủ yếu quyết định auto-approval (thiếu Agent có thể đòi permission).
- Strict hub-and-spoke là kiến trúc tình huống thi; không suy rộng thành mọi kiểu nested delegation sản phẩm đều bị cấm.
- Các ví dụ research có URL, `confidence` hoặc model-scored coverage không thay thế xác minh tài liệu gốc.
- Nuclear fusion có trong scenario coverage của 1.2, nhưng không tự động là nguồn renewable; ghi rõ là yêu cầu của ví dụ.
- `PreToolUse` / `PostToolUse` phải phân biệt thời điểm side effect; tool/backend thực thi vẫn cần authorization.

## Review B — Exam readiness (khả năng làm bài)

**Phát hiện ưu tiên cao:** Lesson 1.1–1.2 có lý thuyết/Build Exercise nhưng chưa có một ngân hàng câu hỏi tương tác đầy đủ như 1.3–1.7. Vì vậy user có thể hiểu khái niệm nhưng ít được kiểm tra dạng scenario multiple-choice.  
**Đã áp dụng:** 10 câu/bài với 4 lựa chọn, đáp án giải thích và retry client-side; Lesson 1.3 tăng từ 10 lên 13; Lessons 1.4–1.7 giữ 8 câu/bài. Tổng tất cả hiện **65 câu**: 10 + 10 + 13 + 8×4.

**Bổ sung trên cả bảy bài:** Bảng root-cause decision matrix (4 case/bài = 28 tình huống). Mỗi case có symptom, correct action và because. Dùng `lib/exam-decisions.ts` để dữ liệu độc lập khỏi UI.

**Decision rules quan trọng**
- 1.1: `stop_reason` authoritative; tool result quay lại history; cap ≠ completion.
- 1.2: missing breadth → coordinator decomposition; missing depth → assigned specialist context; use refinement.
- 1.3: missing citations → explicit structured metadata; independent research → parallel; dependent synthesis → sequential.
- 1.4: high-risk financial/security/compliance → programmatic prerequisite gate; escalation payload tự chứa.
- 1.5: prevent → PreToolUse; normalize → PostToolUse; prompt style preference → prompt.
- 1.6: structured known steps → fixed; open unknown scope → adaptive; dilution → local+integration passes.
- 1.7: continue valid history → resume; divergence → fork; stale results → fresh+summary+re-read deltas.

## Review C — JS/TS & learning UX

**Phát hiện:** Lý thuyết 1.1/1.2 quá ngắn so với phần thực hành; Lesson 3 có regex nhầm escaped backslashes khi bỏ số thứ tự; Lesson 2 có chỉ số coverage dễ bị hiểu thành chứng nhận độ chính xác; footer 1–3 giữ counter cũ khi course đã thành 7 bài.

**Đã áp dụng:**
- `lib/foundation-study.ts`: lý thuyết đầy đủ và tình huống có JS/TS, source URL, exam rules cho 1–2.
- `app/components/FoundationStudy.tsx`: quiz + notes cùng design tokens và responsive như các bài cũ.
- `app/components/ExamDecisionBoard.tsx` + `lib/exam-decisions.ts`: bảng ra quyết định dùng chung toàn bộ 7 bài.
- `app/lesson3/Lesson3Quiz.tsx`: AgentDefinition/permissions/dependencies trong câu hỏi.
- `app/lesson3/Lesson3Theory.tsx`: regex hiển thị heading đúng.
- `app/lesson2/page.tsx`: caveat model-scored coverage và liên kết bài 1.3.
- Footer 1–3 cập nhật `/07`; lesson navigation header 1–7 tiếp tục dùng như trước.
- `lib/certification-audit.test.ts`: kiểm tra 7 decision tables, course completeness và quality cơ bản của quiz.

**Còn giới hạn/chưa khẳng định:**
- Static GitHub Pages không có server API: các phần 1–3 gọi Claude thật chỉ chạy khi có Node backend; quiz, notes và mô phỏng 1.4–1.7 là client-side.
- Lab 1.3 gọi nhiều lần Messages API bằng code thay vì Agent SDK `Agent` tool, nên minh họa principle mà không mô tả đó là Agent SDK invocation.
- Mô phỏng 1.4–1.7 dùng dữ liệu demo, không thực hiện refund, hook thật, code review AI thật hoặc resume thật.
- Audit thủ công ba góc nhìn **không tương đương** external peer review độc lập hoặc verified model-run agents.
- Content checking test chỉ bắt lỗi thiếu cấu trúc/coverage, không tự chứng minh độ đúng của đáp án. Cần đối chiếu khi giáo trình/SDK thay đổi.

## QA đề nghị trước khi thi

1. Mở các trang `/lesson1` đến `/lesson7`, đọc lý thuyết và kiểm tra bảng quyết định không bị tràn trên mobile.
2. Làm hết quiz, kiểm tra correct/wrong/explanation/reset; mục tiêu luyện tập ≥80% mỗi bài.
3. Với mỗi sai lầm, thử giải thích tầng lỗi (protocol, coordinator, context, gate, hook, decomposition hay session).
4. Đọc kỹ lưu ý `exam guide vs production SDK` trước khi code phần Agent SDK.
5. Khi có API credits, thực hiện các live labs ở Node server rồi đối chiếu trace thực tế.

Tài liệu này là báo cáo tự đánh giá có tham chiếu nguồn, không phải báo cáo của ba subagent AI riêng biệt.
