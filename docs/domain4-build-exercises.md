# Domain 4 — Build Exercises 4.1–4.6

Mỗi bài có giải thích đầy đủ trên website bằng tiếng Việt và British English. Mục tiêu của lab là **tự tạo tài liệu, code, kiểm tra các quyết định bằng fixture**; không giả vờ có kết quả model thật.

## Bắt đầu / Getting started

```bash
npm ci
npm run lab:domain4 -- 1
cd domain4-workspaces/lesson41
node check.mjs
```

Thay `1` bằng số bài `2`–`6` để tạo workspace độc lập. Script chỉ viết trong thư mục `domain4-workspaces/` (gitignored), **không ghi đè**, không đọc env, không gọi API. Nếu cần thử trên API thật, hãy giữ `ANTHROPIC_API_KEY` ở môi trường Node được kiểm soát, không lưu vào website GitHub Pages.

## 4.1 — Explicit criteria
- Đọc `review-policy.md`, phân biệt các trường hợp phải báo và phải skip.
- Xem `findings.json` gồm các finding đã được người duyệt chấp nhận/bác bỏ.
- Chạy `node check.mjs` để tính precision theo category và thấy nhóm style nhiều false positives.
- Tự bổ sung một pattern security và một case benign; nêu lí do bật/tắt nhóm.

## 4.2 — Few-shot prompting
- Đọc `examples.json`: mỗi ví dụ có input, output và **why**.
- Không đưa `holdout.json` vào examples: dành cho kiểm chứng tính khái quát.
- Chạy `node check.mjs` để xác minh đủ ví dụ và không trùng tập.
- Viết thêm ví dụ narrative extraction và giá trị null khi nguồn thiếu.

## 4.3 — Structured output
- `schema.json` có field nullable và enum `unclear`/`other`.
- `receipt.json` thiếu PO nên trả `null`, không bịa một string.
- `node check.mjs` xác nhận cấu trúc cơ bản; **không** tuyên bố factual correctness.
- Theo guide thi: auto/any/named. Theo API hiện hành: kiểm tra hỗ trợ forced choice và strict/output_config.format theo model.

## 4.4 — Validation and retry
- So `original.json` (3 dòng = 500) và `failed-extraction.json` (chỉ 2 dòng = 450).
- `node check.mjs` tạo payload retry gồm original, failed output và validation error rõ ràng.
- `missing-reference.json` cho thấy reference **không tồn tại**; phải trả null hoặc human review thay vì retry.
- Nâng cấp bằng validator dates và `conflict_detected` khi nguồn tự mâu thuẫn.

## 4.5 — Batch processing
- `workloads.json`: pre-merge blocking → synchronous; nightly audit → batch.
- `results.json`: success / errored / expired có `custom_id` riêng.
- `node check.mjs` xác định chỉ retry lỗi; tính 30 − 24 − 4 = 2 giờ buffer.
- Chú ý theo guide, client-side tool loop không tự chạy trong một batch item; server-side tool support có thể khác theo API hiện hành.

## 4.6 — Multi-instance review
- `per-file-findings.json` chứa findings của các file được review riêng.
- `contracts.json` mô phỏng controller gọi một tên API khác với service export.
- `node check.mjs` phát hiện mismatch trong pass tích hợp.
- Khi dùng Claude thật, tạo **fresh reviewer invocation** không chứa history generation; thêm calibration từ labelled review outcomes trước khi tự động routing.

## Kiểm chứng / Verification
```bash
npm test
npm run build
```

Quiz website chỉ dùng React state và không preselect đáp án. Kiểm tra local tạo fixture + chạy Node không thay thế việc thử Anthropic SDK thật. Các kết quả local là **deterministic demonstrations** chứ không phải kết quả model được xác nhận.
