# Lesson 1.7 — Build Exercise (Claude Code CLI)

**Nguồn:** https://claudecertificationguide.com/learn/1-agentic-architecture/1-7-session-state-resumption

**CLI docs:** https://code.claude.com/docs/en/cli-reference

Bài gốc gồm **6 bước / khoảng 45 phút**. Mục tiêu chính: phân biệt `resume`, `fork_session`, `fresh start + summary injection`; hiểu `stale context` và `targeted re-analysis`.

Đây là thực hành **Claude Code CLI**, không phải bài bắt buộc tự viết Agent SDK. JavaScript chỉ dùng để chuẩn bị một workspace gồm đúng **10 source files**, rồi sửa đúng **3 file**. Bạn vẫn phải tự thực hành Claude, ghi findings và so sánh kết quả thực.

## Chuẩn bị

Yêu cầu: Node.js, Claude Code CLI đã cài (`claude --version`) và đăng nhập bằng phương thức hỗ trợ. Dùng CLI có thể phát sinh chi phí/quota; ba npm script dưới đây không gọi API.

Chạy từ root repo (nơi có `package.json`):

~~~powershell
npm run lab:session7:setup
npm run lab:session7:status
cd lesson7-session-workspace
claude --name lesson7-code-review
~~~

Workspace sẽ có **đúng 10 file mã .js** trong `src/` và ba prompt `01-baseline-prompt.md`, `02-resume-prompt.md`, `03-fresh-prompt.md`.

| File | Tình trạng ban đầu |
| --- | --- |
| `src/auth/permissions.js` | Lỗi cố ý: `canAccessAdmin()` luôn `return true` |
| `src/auth/session.js` | Lỗi cố ý: `buildSession()` gán role `admin` |
| `src/api/orders.js` | Lỗi cố ý: không kiểm tra `order.userId` |
| `src/config/roles.js` | Không đổi |
| `src/auth/errors.js` | Không đổi |
| `src/api/sample-orders.js` | Không đổi |
| `src/api/response.js` | Không đổi |
| `src/utils/ids.js` | Không đổi |
| `src/utils/format.js` | Không đổi |
| `src/utils/logger.js` | Không đổi |

Các file này là **mẫu học tập**: không sử dụng làm xác thực hoặc phân quyền production.

## Bước 1 — Named session đọc đủ 10 file

Trong phiên `claude --name lesson7-code-review`, dán nội dung từ `01-baseline-prompt.md`.

**Mục tiêu:** Agent dùng tool đọc **nội dung hiện tại** của cả 10 file, liệt kê findings theo từng file: issue, severity, evidence và recommendation. Không sửa source ở bước này.

**Vì sao?** Output của các lượt Read được giữ trong conversation history. Khi ba file thay đổi ở bước 3, history cũ có khả năng thành stale context.

## Bước 2 — Lưu findings có cấu trúc

Mở `findings-summary.md`. Thay toàn bộ placeholder `[FILL]` bằng phát hiện **thực sự** mà Claude trả về. Với file không có lỗi, ghi "không thấy lỗi" — không bịa bug.

Structured summary cần: tên file, issue, severity, recommendation, những phần đáng tin và ba file chuẩn bị sửa.

**Vì sao?** Đây là **curated summary** sẽ mang sang phiên mới, thay vì copy tất cả raw tool results cũ.

Thoát Claude Code bằng `/exit` rồi quay lại root repo bằng `cd ..`.

## Bước 3 — Sửa đúng 3 file (sau khi đã lưu summary)

~~~powershell
npm run lab:session7:fix
npm run lab:session7:status
~~~

Script sẽ **từ chối** nếu summary còn `[FILL]` hoặc nếu một trong ba file không còn đúng bản baseline, nhằm không ghi đè các sửa đổi thủ công.

Ba thay đổi:

~~~js
// src/auth/permissions.js — trước đây luôn true
export function canAccessAdmin(user) {
  return user?.role === 'admin';
}

// src/auth/session.js — trước đây role luôn admin
export function buildSession(user) {
  return { userId: user?.id ?? null, role: user?.role ?? 'guest' };
}

// src/api/orders.js — trước đây chỉ so sánh order.id
export function getOrderById(orderId, user) {
  return DEMO_ORDERS.find((o) => o.id === orderId && o.userId === user?.id);
}
~~~

Ba file đã đổi trên disk, nhưng **session ngày 1 vẫn chứa kết quả Read phiên bản cũ**. Đây là nền tảng cho bài tập stale context.

## Bước 4 — Resume và quan sát

~~~powershell
cd lesson7-session-workspace
claude --resume lesson7-code-review
~~~

Dán `02-resume-prompt.md`.

Yêu cầu Claude nói rõ nhận định nào lấy từ history cũ trước khi re-read, rồi đọc lại ba file mới. Quan sát có khuyên sửa lỗi đã sửa không, có dẫn chứng code không còn tồn tại không, và có tự phân biệt kết quả cũ/mới không.

Ghi **kết quả thật** vào cột Resume của `compare-results.md`.

**Lưu ý bắt buộc:** Stale context là *rủi ro*, không chắc chắn lần nào Claude cũng sai. Nếu Claude không bị ảnh hưởng, hãy ghi như vậy.

## Bước 5 — Fresh session + summary injection

~~~powershell
# Vẫn ở lesson7-session-workspace.
# Tuyệt đối KHÔNG dùng --resume hay --continue ở bước này.
claude --name lesson7-fresh-review
~~~

Dán `03-fresh-prompt.md`. Prompt bảo Claude đọc `findings-summary.md` như **curated summary** của phiên cũ, sau đó đọc lại ba file đã sửa và **chỉ những dependency/call site liên quan khi cần**.

Bạn cũng có thể dán nguyên nội dung summary vào prompt đầu tiên để thực hiện summary injection tường minh. Không yêu cầu đọc lại tất cả 10 file nếu không có lý do.

Ghi kết quả thực vào cột Fresh của `compare-results.md`.

## Bước 6 — So sánh Resume và Fresh

Mở `compare-results.md` và điền bảng:

1. Có đề xuất sửa vấn đề đã fix không?
2. Có phân biệt code cũ với code hiện tại không?
3. Có đọc lại đúng ba file và dependencies liên quan không?
4. Mỗi kết luận có evidence mới hỗ trợ không?
5. Kết quả có mâu thuẫn không?

**Không điền kết luận mẫu như thể đã chạy.** Ngay cả khi cả hai session trả lời đúng, có thể nhận xét sự khác biệt ở việc session gốc **vẫn chứa raw history**, còn fresh chỉ có curated summary + file reads mới.

## Mở rộng tùy chọn — Fork

~~~powershell
claude --resume lesson7-code-review --fork-session
~~~

Dùng khi muốn thử hai hướng giải pháp từ cùng baseline. Fork **không** loại bỏ stale tool results và **không** fork filesystem.

## Kết quả cần đạt

- [ ] Agent đã đọc cả 10 file.
- [ ] Structured summary có findings theo file, severity và recommendations.
- [ ] `status` báo 3 file FIXED, 7 file BASELINE.
- [ ] Resume đã được kiểm tra và ghi nhận thực tế.
- [ ] Fresh session nhận summary, thực hiện targeted re-analysis.
- [ ] Đã ghi so sánh kết quả thật trong `compare-results.md`.

## Phân biệt với bài SDK cũ

`scripts/sdk-sessions-lab.mjs` là bài minh họa option `resume` / `forkSession` ở Agent SDK bằng đoạn code nhỏ. Nó **không thực hiện đủ sáu bước của Build Exercise 1.7** và vì thế chỉ còn là **bài mở rộng**.

**Bảo vệ dữ liệu:** `setup` chỉ tạo workspace mới, không ghi đè; `fix` chỉ sửa đúng ba file khi khớp phiên bản ban đầu; workspace được đưa vào `.gitignore`. Không có API key thật trong file mẫu.
