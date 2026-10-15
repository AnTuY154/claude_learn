# Domain 2 — Tool Design & MCP Integration (Lessons 2.1–2.5)

Đây là hướng dẫn thực hành sát các Build Exercise của Claude Certification Guide. Mỗi bài trên website có lý thuyết VI/EN, code JavaScript có comment, glossary, 8 câu quiz và các bước tự làm. **GitHub Pages không chạy server hay giữ API key.**

## 2.1 — Tool Interface Design (30 phút)

Yêu cầu: tạo `get_customer` và `lookup_order` với mô tả mơ hồ, thử **10 truy vấn**; viết lại description gồm purpose, input format, examples, edge cases và boundaries; chạy **lại cùng 10 truy vấn** rồi so sánh tool selection.

~~~powershell
npm ci
$env:ANTHROPIC_API_KEY = "YOUR_KEY_IN_LOCAL_TERMINAL"
$env:ANTHROPIC_MODEL = "YOUR_AVAILABLE_MODEL"
npm run lab:domain2 -- 1
~~~

Đây là **20 lượt Messages API THẬT** có thể phát sinh phí. Script ghi lại tên tool từ actual `tool_use`, `stop_reason` và token usage. Với `tool_choice:auto`, model có thể trả text thay vì gọi tool. Script không chạy backend handlers, vì mục tiêu của bài là đo lựa chọn tool. Không bịa điểm baseline hoặc mặc định description mới chắc chắn 10/10.

## 2.2 — Structured Error Responses (45 phút)

Yêu cầu: tạo MCP `customer_lookup` giả lập bốn category lỗi, `structuredContent` với `errorCategory`, `isRetryable`, `description`; phân biệt `isError:true` với valid empty `isError:false` + `resultCount:0`; agent-side recovery giới hạn ba lượt retry transient, validation sửa input, business/permission escalation.

**Cấp A — Logic deterministic local (KHÔNG gọi model, KHÔNG MCP transport):**

~~~powershell
npm run lab:domain2 -- 2
~~~

**Cấp B — MCP server + MCP client THẬT bằng SDK v2:**

~~~powershell
npm install --no-save --package-lock=false @modelcontextprotocol/server @modelcontextprotocol/client zod

# Client sẽ tự khởi chạy server, handshake, list tools/resources và callTool:
npm run lab:domain2:mcp:client

# Chỉ dùng lệnh này nếu kết nối server từ Claude Code hoặc MCP host:
npm run lab:domain2:mcp
~~~

- `scripts/domain2-mcp-server.mjs`: McpServer.registerTool với Zod input schema, xử lý error result, đăng ký resource demo://customers/schema.
- `scripts/domain2-mcp-client.mjs`: Client + StdioClientTransport kết nối server, gọi tool thực bằng MCP JSON-RPC, in structured result và quyết định recovery.
- `scripts/domain2-core.mjs`: mock customer data, bốn errors, valid empty, bounded recovery.

**Chính xác về thuật ngữ:** Đây là MCP server/client thật, nhưng **không phải Claude model tự quyết định**; recovery loop là JavaScript bên ứng dụng. Các field `errorCategory`/`isRetryable`/`description` là application metadata, không phải field bắt buộc của MCP specification.

## 2.3 — Tool Distribution & Tool Choice (45 phút)

~~~powershell
npm run lab:domain2 -- 3
~~~

Thiết kế ba role: Web Research, Document Analysis, Synthesis, mỗi role có bốn tool phù hợp. Tạo scoped verify_fact cho Synthesis và kiểm tra allowlist load_document; so sánh cấu hình `tool_choice:auto`, `any`, `{type:'tool',name:'extract_metadata'}`.

**Quan trọng:** 4–5 tools/agent là heuristic trong guide, không phải giới hạn kỹ thuật. Forced `tool_choice:any` hoặc named tool không được hỗ trợ trên một số model mới; khi triển khai thật phải đối chiếu model API docs, không khẳng định cấu hình luôn chạy được. Script này chỉ mô phỏng quyết định kiến trúc, không đo latency thực tế.

## 2.4 — MCP Server Integration (30 phút)

~~~powershell
npm run lab:domain2 -- 4
~~~

Template: [examples/domain2/mcp-project.example.json](../examples/domain2/mcp-project.example.json).

Trong một project sandbox, copy template thành `.mcp.json`, phân biệt:
- **Project scope:** file `.mcp.json` ở root, commit được nếu KHÔNG chứa secrets.
- **User scope:** `~/.claude.json` riêng từng developer.
- **Local scope:** phạm vi thứ ba trên Claude Code hiện tại (khác user/project).
- **Remote HTTP:** `type:http` và `url`.
- **Local stdio:** `command` và `args`.
- **Credentials:** placeholder `${TEAM_MCP_TOKEN}`, mỗi người đặt env thật local, không commit token.
- **Resources:** server công bố; host/client quyết định khi nào đọc và đưa vào context.

Endpoint example.test **không phải server đang chạy**, chỉ là template an toàn. Ưu tiên đánh giá official/maintained community server cho tích hợp tiêu chuẩn trước khi viết custom.

## 2.5 — Built-in Tools (30 phút)

~~~powershell
# Chạy từ root repo để tạo fixture, script không ghi đè dữ liệu:
npm run lab:domain2 -- 5
cd domain2-builtins-workspace
npm test
claude
~~~

Fixture có direct callers của `processLegacyOrder` và barrel re-export tên `submitOrder`. Bạn tự thực hành trong Claude Code:

1. **Grep** nội dung file để tìm processLegacyOrder.
2. **Glob** `**/*.test.js` để tìm test paths. Guide thường dùng .test.tsx nhưng fixture runnable Node dùng .test.js.
3. **Read** caller imports và `utils/index.js` để tìm barrel alias.
4. **Grep** submitOrder để tìm thêm 3 indirect consumers.
5. **Edit** từng call-site với unique old_string; nếu trùng, widen anchor. Guide thi nêu Read+Write làm fallback.
6. **Bash** chạy npm test và kiểm tra diff, không Read 200 file upfront.

Script sinh thư mục `domain2-builtins-workspace/` vào .gitignore. Không có API key/model call ở bước setup. Nếu fixture tồn tại, script từ chối ghi đè.

## Xác nhận hoàn thành

2.1: log hai accuracy scores thực, 10 truy vấn trước/sau, rà system prompt.
2.2: in đủ bốn categories + valid empty, client callTool thật, transient retry có giới hạn.
2.3: ba role toolsets và scoped tool, giải thích tool_choice + least privilege.
2.4: cấu hình project/user, env placeholders, MCP resource và tool description.
2.5: Grep direct+alias, Glob tests, targeted Edit, test suite pass và giải thích vì sao không Read all files.

## Official documentation

- https://ts.sdk.modelcontextprotocol.io/v2/get-started/first-server
- https://ts.sdk.modelcontextprotocol.io/v2/get-started/first-client.html
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview

**Security:** Không đăng API key lên website hoặc Git; mock database không chứa khách hàng thật.