#!/usr/bin/env node
/**
 * LESSON 1.7 — BUILD EXERCISE (đúng 6 bước từ Claude Certification Guide)
 * ---------------------------------------------------------------------
 * Script này CHỈ chuẩn bị/sửa một dự án JavaScript MẪU để Claude Code CLI đọc.
 * Không kết nối Anthropic API, không tự chạy Claude và không sửa source dự án thật.
 *
 * Sử dụng tại thư mục ROOT của repository:
 *   npm run lab:session7:setup   // Tạo 10 file cố ý có 3 lỗi
 *   npm run lab:session7:status  // Kiểm tra các file đang ở trạng thái nào
 *   npm run lab:session7:fix    // Sửa ĐÚNG 3 file sau khi đã lưu findings
 *
 * Tại sao không tự động sửa ngay sau setup?
 * Vì bài học cần Claude ĐỌC NỘI DUNG CŨ trong session ngày 1;
 * sau đó file thực tế mới bị thay đổi để bạn quan sát stale tool results.
 */

import fs from "node:fs";
import path from "node:path";

const workspace = path.resolve(process.cwd(), "lesson7-session-workspace");

// Danh sách CHÍNH XÁC 10 source files. Chỉ ba file đánh dấu CHANGED có lỗi cố ý.
// Các tên giả lập không phải logic authentication an toàn để đưa lên production.
const sources = {
  "src/config/roles.js": [
    "// Các role demo; KHÔNG thay thế quy tắc phân quyền phía backend.",
    "export const ROLES = Object.freeze({ ADMIN: 'admin', MEMBER: 'member', GUEST: 'guest' });",
    "export const isKnownRole = (role) => Object.values(ROLES).includes(role);"
  ],
  "src/auth/permissions.js": [
    "// [CHANGED 1/3] Kiểm tra quyền admin của user.",
    "export function canAccessAdmin(user) {",
    "  return true; // CỐ Ý SAI: ai cũng có quyền admin.",
    "}"
  ],
  "src/auth/session.js": [
    "// [CHANGED 2/3] Lấy role từ user đã xác thực (ví dụ mô phỏng).",
    "export function buildSession(user) {",
    "  return { userId: user?.id ?? null, role: 'admin' }; // CỐ Ý SAI: tự gán admin.",
    "}"
  ],
  "src/auth/errors.js": [
    "// Thống nhất mã lỗi phản hồi (unchanged).",
    "export const AUTH_ERRORS = Object.freeze({",
    "  UNAUTHENTICATED: 'UNAUTHENTICATED',",
    "  FORBIDDEN: 'FORBIDDEN'",
    "});"
  ],
  "src/api/orders.js": [
    "// [CHANGED 3/3] Xem đơn hàng: cần chỉ trả đơn thuộc user.",
    "import { DEMO_ORDERS } from './sample-orders.js';",
    "export function getOrderById(orderId, user) {",
    "  return DEMO_ORDERS.find((o) => o.id === orderId); // CỐ Ý SAI: không kiểm tra owner.",
    "}"
  ],
  "src/api/sample-orders.js": [
    "// Dữ liệu đơn hàng GIẢ, không có PII hoặc thanh toán thật.",
    "export const DEMO_ORDERS = Object.freeze([",
    "  { id: 'order-1', userId: 'user-a', total: 300000 },",
    "  { id: 'order-2', userId: 'user-b', total: 700000 }",
    "]);"
  ],
  "src/api/response.js": [
    "// Chuẩn hóa API response. File không đổi trong bài thực hành.",
    "export const ok = (data) => ({ ok: true, data });",
    "export const fail = (code) => ({ ok: false, error: code });"
  ],
  "src/utils/ids.js": [
    "// Kiểm tra ID demo. File không đổi.",
    "export function isNonEmptyId(value) {",
    "  return typeof value === 'string' && value.trim().length > 0;",
    "}"
  ],
  "src/utils/format.js": [
    "// Định dạng VND để hiển thị, không liên quan bảo mật.",
    "export const formatVnd = (amount) => new Intl.NumberFormat('vi-VN').format(amount) + ' đ';"
  ],
  "src/utils/logger.js": [
    "// Logger mẫu: không log token, mật khẩu hoặc dữ liệu nhạy cảm.",
    "export function logEvent(event, detail) {",
    "  return { event, detail, time: new Date().toISOString() };",
    "}"
  ]
};

// Các bản sửa chỉ áp dụng cho BA FILE xác định trước; không đụng file thứ tư.
const fixes = {
  "src/auth/permissions.js": [
    "// [FIXED 1/3] Demo role-based check; production vẫn cần backend authorization.",
    "export function canAccessAdmin(user) {",
    "  return user?.role === 'admin';",
    "}"
  ],
  "src/auth/session.js": [
    "// [FIXED 2/3] Không nâng user thường thành admin.",
    "export function buildSession(user) {",
    "  return { userId: user?.id ?? null, role: user?.role ?? 'guest' };",
    "}"
  ],
  "src/api/orders.js": [
    "// [FIXED 3/3] Chỉ trả về đơn thuộc user; production cần xác minh user server-side.",
    "import { DEMO_ORDERS } from './sample-orders.js';",
    "export function getOrderById(orderId, user) {",
    "  return DEMO_ORDERS.find((o) => o.id === orderId && o.userId === user?.id);",
    "}"
  ]
};

const summaryTemplate = [
  "# Findings — Lesson 1.7 (TỰ ĐIỀN SAU KHI CHẠY CLAUDE)",
  "",
  "## Thông tin phiên",
  "- Session name: lesson7-code-review",
  "- Ngày phân tích: [FILL: ngày thực tế]",
  "- Mục tiêu: đọc và review đúng 10 source files trong src/",
  "",
  "## Bảng findings có cấu trúc",
  "| File | Lỗi / kết luận | Severity | Recommendation |",
  "| --- | --- | --- | --- |",
  ...Object.keys(sources).map((f) => "| " + f + " | [FILL] | [FILL] | [FILL] |"),
  "",
  "## Điều còn đáng tin sau khi code đổi",
  "- [FILL: kiến thức hoặc module không bị ảnh hưởng, đã kiểm chứng]",
  "",
  "## File cần đọc lại trong fresh session",
  "- src/auth/permissions.js",
  "- src/auth/session.js",
  "- src/api/orders.js",
  "- Kiểm tra imports/call sites bị ảnh hưởng nếu có.",
  "",
  "## Quy tắc freshness",
  "- Những findings về ba file trên chỉ là nhận định của phiên TRƯỚC, không phải sự thật hiện tại.",
  "- Đọc lại file mới trước khi xác nhận bug còn tồn tại."
].join("\n") + "\n";

// Prompt dùng trong Claude Code CLI; người học tự copy/paste ở từng bước.
// Làm vậy Claude thực sự đọc file thông qua tool, chứ không chỉ nhìn ví dụ text.
const prompts = {
  "01-baseline-prompt.md": [
    "# BƯỚC 1 — Baseline, dùng trong: claude --name lesson7-code-review",
    "",
    "Review đúng 10 file .js trong thư mục src/ của dự án demo này.",
    "Hãy sử dụng Read/Glob/Grep để xem nội dung thực tế của từng file.",
    "Không sửa file. Trả về bảng gồm file, issue, severity, evidence (dòng code), recommendation.",
    "Nêu rõ ít nhất các vấn đề về authorization, session role và quyền xem order nếu có.",
    "Phân biệt bug đã thấy với suy đoán; đừng tạo nguồn hoặc kết quả giả.",
    "Sau khi có output, tôi sẽ tự lưu findings vào findings-summary.md."
  ].join("\n") + "\n",
  "02-resume-prompt.md": [
    "# BƯỚC 4 — Dùng trong: claude --resume lesson7-code-review",
    "",
    "Tiếp tục báo cáo audit ngày trước. Những vấn đề xác thực nào bạn đã thấy ở",
    "src/auth/permissions.js, src/auth/session.js và src/api/orders.js?",
    "Nêu rõ bạn đang dựa trên file read hiện tại hay các tool results từ session cũ.",
    "Chưa đọc lại ba file cho đến khi bạn nói rõ các kết luận từ history cũ.",
    "Sau đó đọc lại ba file đó và báo các thay đổi, nếu có.",
    "Không sửa code. Lưu nhận xét thực tế vào resume-observations.md bằng tay.",
    "Lưu ý: model CÓ THỂ không mắc lỗi stale context. Không giả định sẽ bắt buộc sai."
  ].join("\n") + "\n",
  "03-fresh-prompt.md": [
    "# BƯỚC 5 — Dùng trong: claude --name lesson7-fresh-review",
    "",
    "Đây là MỘT PHIÊN MỚI. Đầu tiên đọc findings-summary.md",
    "và xem đó là curated summary từ phiên hôm trước, không phải nội dung file hiện tại.",
    "Các file sau ĐÃ SỬA sau phiên cũ:",
    "- src/auth/permissions.js",
    "- src/auth/session.js",
    "- src/api/orders.js",
    "",
    "Dùng Read/Glob/Grep để đọc đúng ba file trên ở trạng thái HIỆN TẠI.",
    "Chỉ mở thêm dependency/call site nếu cần kiểm chứng ảnh hưởng.",
    "Đối chiếu với summary: lỗi nào đã sửa, còn lỗi nào, có lỗi mới không?",
    "Không mặc định bug từ hôm qua vẫn còn. Không quét lại 10 file nếu không cần.",
    "Không sửa code. Tôi sẽ lưu nhận xét thực tế vào fresh-observations.md."
  ].join("\n") + "\n"
};

const observations = [
  "# So sánh sau hai phiên — TỰ GHI KẾT QUẢ THỰC",
  "",
  "| Tiêu chí | Resume | Fresh + Summary |",
  "| --- | --- | --- |",
  "| Có nhắc bug đã fix không? | [FILL] | [FILL] |",
  "| Có đọc lại ba file không? | [FILL] | [FILL] |",
  "| Nguồn kết luận là history hay file hiện tại? | [FILL] | [FILL] |",
  "| Có tự thêm phân tích các dependencies không? | [FILL] | [FILL] |",
  "| Có lời khuyên mâu thuẫn không? | [FILL] | [FILL] |",
  "| Chất lượng kết luận / bằng chứng | [FILL] | [FILL] |",
  "",
  "Kết luận: [FILL: nêu khi nào resume phù hợp, khi nào fresh an toàn hơn]",
  "",
  "Không ghi kết quả giả; nếu resume không mắc lỗi stale thì ghi đúng là KHÔNG QUAN SÁT THẤY."
].join("\n") + "\n";

function fileText(lines) { return lines.join("\n") + "\n"; }
function fullPath(relative) { return path.join(workspace, relative); }
function writeNew(relative, content) {
  const dest = fullPath(relative);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content, { flag: "wx" });
}

function setup() {
  // Bảo vệ người học: không ghi đè project đã có, tránh xóa findings hay code tự sửa.
  if (fs.existsSync(workspace)) {
    throw new Error("Workspace đã tồn tại: " + workspace + ". Không ghi đè. Hãy dùng status.");
  }
  fs.mkdirSync(workspace, { recursive: true });
  for (const [name, lines] of Object.entries(sources)) writeNew(name, fileText(lines));
  for (const [name, prompt] of Object.entries(prompts)) writeNew(name, prompt);
  writeNew("findings-summary.md", summaryTemplate);
  writeNew("compare-results.md", observations);
  console.log("[SETUP] Created exactly", Object.keys(sources).length, "JavaScript source files.");
  console.log("[WORKSPACE]", workspace);
  console.log("[NEXT] cd lesson7-session-workspace");
  console.log("[NEXT] claude --name lesson7-code-review");
  console.log("[NEXT] Paste 01-baseline-prompt.md; save ACTUAL findings to findings-summary.md");
  console.log("[IMPORTANT] Exit Claude BEFORE running npm run lab:session7:fix.");
}

function status() {
  if (!fs.existsSync(workspace)) throw new Error("Run setup first.");
  for (const name of Object.keys(sources)) {
    const dest = fullPath(name);
    const actual = fs.existsSync(dest) ? fs.readFileSync(dest, "utf8") : "";
    const state = actual === fileText(sources[name])
      ? "BASELINE" : (fixes[name] && actual === fileText(fixes[name]) ? "FIXED" : "MODIFIED/MISSING");
    console.log("[FILE]", name, state);
  }
  console.log("[NOTE] BASELINE/FIXED compares file content; it does not verify actual Claude output.");
}

function fix() {
  if (!fs.existsSync(workspace)) throw new Error("Run setup first.");
  // Không được làm bài thay người học: summary do người học ghi findings thực tế.
  const summary = fs.readFileSync(fullPath("findings-summary.md"), "utf8");
  if (summary.includes("[FILL")) {
    throw new Error("Hãy điền findings-summary.md từ output thật của Claude trước khi chạy fix.");
  }
  // Verify all three old contents BEFORE writing; avoid overwriting any manual work.
  for (const name of Object.keys(fixes)) {
    const current = fs.readFileSync(fullPath(name), "utf8");
    if (current !== fileText(sources[name])) {
      throw new Error("Không sửa file vì không còn đúng baseline: " + name);
    }
  }
  for (const [name, lines] of Object.entries(fixes)) {
    fs.writeFileSync(fullPath(name), fileText(lines));
    console.log("[FIXED]", name);
  }
  console.log("[DONE] Updated exactly 3/10 source files.");
  console.log("[NEXT] cd lesson7-session-workspace; claude --resume lesson7-code-review");
  console.log("[NEXT] Follow 02-resume-prompt.md, record actual observations.");
  console.log("[NEXT] Start a NEW session with: claude --name lesson7-fresh-review");
  console.log("[NEXT] Follow 03-fresh-prompt.md; compare results in compare-results.md.");
}

const command = process.argv[2];
try {
  if (command === "setup") setup();
  else if (command === "fix") fix();
  else if (command === "status") status();
  else {
    console.log("Lesson 1.7 workspace commands: setup | status | fix");
    process.exitCode = 1;
  }
} catch (error) {
  console.error("[LAB ERROR]", error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
