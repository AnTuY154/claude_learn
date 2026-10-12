# Hướng dẫn thực hành Lesson 1.1–1.7 (Windows PowerShell / Node.js)

## 1. Chạy các live lab bằng Messages API

Yêu cầu Node.js 22+, `npm ci`, một Anthropic API key **có credits** và model hợp lệ mà API key được cấp quyền. Mặc định code sử dụng tên model đang được repo cấu hình; khi cần, chủ động đặt `ANTHROPIC_MODEL` thành model bạn có quyền gọi.

```powershell
npm ci
$env:ANTHROPIC_API_KEY = "PASTE_YOUR_KEY_LOCALLY"  # Tuyệt đối không commit key
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

Các lệnh trên gọi **Anthropic Messages API thật**; log có timestamp, `stop_reason`, số `input_tokens`/`output_tokens` và tool steps tùy bài. Không có API key → script từ chối thực thi. Mỗi cuộc gọi có thể tính phí; usage là số token **thực tế được API trả về**, không phải ước lượng.

**Những gì log cho thấy:**

| Lab | Đối tượng quan sát | Giới hạn |
|---|---|---|
| 1.1 | Model lựa chọn lookup/calculate tools; `tool_use`/`tool_result`/`end_turn`. | Catalog giả định; calculator không chạy JavaScript `eval`. |
| 1.2 | Coordinator → hai specialist calls song song → synthesis có context explicit. | Không có live web search; không xác thực lời khẳng định thực tế. |
| 1.3 | Structured findings; GOOD/BAD metadata; tác động lên synthesis. | URLs và tài liệu **minh họa**, không có live browsing. |
| 1.4 | Verification gate fail-closed, simulated refund tool, human handoff payload. | Không tạo refund hoặc chuyển tiền thật. |
| 1.5 | Trước khi chạy tool vs sau khi có raw output và normalized output. | **Chỉ middleware tại application layer**, không phải Agent SDK hook. |
| 1.6 | Local AI review nhiều files độc lập, integration sau khi có findings. | Các file code chỉ là mẫu minh họa. |
| 1.7 | Resume-like, fork-like, fresh-summary với mảng Messages API history. | **Không phải Agent SDK persisted sessions**. |

Không có gì đảm bảo Claude sẽ gọi mọi tool đúng thứ tự; model chủ động chọn công cụ. Hãy xem log để hiểu lý do điều phối thực tế.

## 2. Tùy chọn: chạy *Claude Agent SDK thật* cho 1.5 & 1.7

Ngoài Messages API analogies, repo có ví dụ `scripts/sdk-hooks-lab.mjs` và `scripts/sdk-sessions-lab.mjs` dùng `query()` của Agent SDK (đã được đối chiếu với docs chính thức).

```powershell
npm install --no-save --package-lock=false @anthropic-ai/claude-agent-sdk
# Giữ ANTHROPIC_API_KEY / ANTHROPIC_MODEL trong môi trường local.
npm run lab:sdk-hooks
npm run lab:sdk-sessions
```

- Hook lab: đăng ký `PreToolUse` / `PostToolUse` với Read matcher; chặn đọc file ngoài README.md; log callback events và result usage/cost khi SDK cung cấp.
- Session lab: tạo real session, capture ID, `resume` và `forkSession: true`; so sánh fresh session có curated summary. **Fork chỉ tách conversation history, không tự tách filesystem**.
- Có thể cần runtime/credentials hỗ trợ Claude Agent SDK ngoài Anthropic API key (phụ thuộc cấu hình môi trường); lỗi runtime phải kiểm tra đúng SDK requirements. Các ví dụ optional chưa được chạy live trong quá trình tạo repo do không có key.
- Để giảm nguy cơ gây thay đổi ngoài ý muốn, ví dụ session dùng prompt chỉ phân tích, không yêu cầu edit code.

## 3. Học trên GitHub Pages

Trang `/lesson1` đến `/lesson7` có **nút VI/EN**; ngôn ngữ được lưu cục bộ trong browser. Trật tự bắt buộc: Detailed Theory → Key Takeaways → Quiz → Build Exercise. GitHub Pages không dùng Anthropic API key trên client, quiz không tốn token.

## 4. Nguồn chính thức

- [Anthropic TypeScript SDK](https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript)
- [Agent SDK Hooks](https://code.claude.com/docs/en/agent-sdk/hooks)
- [Agent SDK Sessions](https://code.claude.com/docs/en/agent-sdk/sessions)
