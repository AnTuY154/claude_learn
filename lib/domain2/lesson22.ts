import type { Domain2Content } from "../domain2-types";
export const lesson22:Record<"vi"|"en",Domain2Content> = {
  "vi": {
    "title": "Structured Error Responses — Phản hồi lỗi có cấu trúc",
    "subtitle": "Lỗi timeout, input sai, vi phạm chính sách và không đủ quyền đều cần hành động phục hồi khác nhau.",
    "bridge": "Từ Lesson 2.1: Tool schema giúp Claude chọn tool và tạo input. Lesson 2.2 giải quyết lượt tiếp theo: tool trả lỗi thì AI Agent phải hiểu lỗi nào nên retry, lỗi nào phải đổi hướng.",
    "scenarioTitle": "Agent retry ba lần dù khách hàng không tồn tại",
    "scenario": "Một khách hàng nhập email chưa đăng ký. customer_lookup truy vấn database thành công và trả danh sách rỗng. Agent nhầm kết quả rỗng thành lỗi mạng, retry ba lần rồi chuyển nhân viên. Chi phí và thời gian tăng, trong khi kết luận đúng chỉ là 'không tìm thấy'.",
    "sections": [
      {
        "title": "1. Hai lớp lỗi: JSON-RPC protocol và tool execution",
        "explanation": [
          "MCP phân biệt lỗi ở tầng giao thức và lỗi trong quá trình thực thi. Protocol error là JSON-RPC error khi tên tool không tồn tại, request sai cấu trúc hoặc lỗi giao thức; host/client thường xử lý và không có CallToolResult bình thường để model phân tích.",
          "Tool execution error là công cụ đã được gọi nhưng gặp vấn đề như upstream timeout hay business rule. Thông thường server trả CallToolResult có content và isError: true để agent nhận tín hiệu khôi phục. Cần phân biệt validation ở tầng schema/giao thức với input hợp lệ về schema nhưng sai nghiệp vụ."
        ],
        "code": "// A: JSON-RPC protocol error — không có result envelope\nconst protocol = {jsonrpc:'2.0',id:3,error:{code:-32602,message:'Unknown tool'}};\n\n// B: MCP execution error — có result envelope\nconst execution = {jsonrpc:'2.0',id:4,result:{\n  isError:true,\n  content:[{type:'text',text:'Order database timed out'}]\n}};",
        "keyPoint": "Protocol failure không đồng nhất với tool execution failure. isError thuộc CallToolResult."
      },
      {
        "title": "2. Các field nào là chuẩn MCP, field nào do ứng dụng định nghĩa?",
        "explanation": [
          "MCP CallToolResult hỗ trợ content, isError và structuredContent. Trong thực hành bài này, server trả thông báo ngắn cho model ở content và dữ liệu máy có thể đọc ở structuredContent.",
          "Ba trường errorCategory, isRetryable, description là convention do ứng dụng thiết kế, KHÔNG phải key bắt buộc của MCP. Bài thi yêu cầu hiểu ý nghĩa ba trường để agent phục hồi hợp lý. isError là optional trong schema nhưng cần đánh dấu đúng cho lỗi thực thi."
        ],
        "code": "function makeError(errorCategory,isRetryable,description){\n  return {\n    isError: true,   // MCP field\n    content: [{ type:'text', text:description }],\n    structuredContent: {\n      errorCategory, // APP convention\n      isRetryable,   // APP convention\n      description    // APP convention\n    }\n  };\n}",
        "keyPoint": "Không nhầm isError với is_error của Anthropic Messages API; cũng không coi errorCategory là thuộc tính bắt buộc của spec."
      },
      {
        "title": "3. Transient và Validation: cùng có thể khôi phục nhưng theo hai cách",
        "explanation": [
          "Transient error xuất hiện do timeout, mạng hoặc rate limit: request hợp lệ nhưng hệ thống tạm thời không xử lý được. Có thể retry cùng request sau delay, theo giới hạn số lần và backoff. Với side effect không idempotent cần thêm idempotency key hoặc đối soát trước khi retry.",
          "Validation error xảy ra khi thiếu field, sai định dạng hoặc giá trị nằm ngoài phạm vi nghiệp vụ. Gọi lại Y HỆT không có ích nên isRetryable:false; Claude có thể sửa input rồi gọi một request MỚI, không phải 'bỏ cuộc'."
        ],
        "code": "const transient=makeError('transient',true,'Upstream timeout; retry later');\nconst validation=makeError('validation',false,'Order ID must be #NNNNN');\n\n// Không được viết if (!isRetryable) return STOP;\n// Với validation: cần sửa input, sau đó tạo lời gọi mới.",
        "keyPoint": "isRetryable hỏi 'gửi lại cùng request có cơ hội thành công không?', không hỏi 'agent còn cứu được nhiệm vụ không?'."
      },
      {
        "title": "4. Business và Permission: không vượt rào bằng retry",
        "explanation": [
          "Business error: yêu cầu đúng dạng nhưng không đáp ứng policy, ví dụ hoàn 750 khi auto-refund tối đa 500. Retry nguyên yêu cầu không làm thay đổi quy tắc; cần workflow phê duyệt hoặc nhân viên xử lý.",
          "Permission error: service account thiếu quyền xem dữ liệu tài chính. Agent phải xin quyền hợp pháp, yêu cầu người có thẩm quyền hoặc báo thất bại; KHÔNG được tự ý đổi sang credentials khác không được cấp. Bộ kiểm tra quyền nằm ở backend."
        ],
        "code": "const policy=makeError('business',false,'Above limit; manager approval required');\nconst access=makeError('permission',false,'Access denied; request authorized access');\n// KHÔNG dùng retry để bypass policy hoặc permissions.",
        "keyPoint": "Business/permission cần đổi quy trình hoặc principal được phép, không chỉ viết lại prompt."
      },
      {
        "title": "5. Valid Empty Result khác Access Failure như thế nào?",
        "explanation": [
          "Valid empty: server query thành công nhưng không thấy khách, trả isError:false và resultCount:0. Agent nên thông báo không tìm thấy; retry vô ích trừ khi có dữ liệu mới.",
          "Access failure: tool không truy cập được database, nên chưa xác định có khách hay không. Trả isError:true cùng errorCategory và hint. Tuyệt đối không che timeout bằng [] vì coordinator sẽ đưa ra kết luận sai."
        ],
        "code": "// Query chạy xong, KHÔNG có matches\nconst empty={isError:false,content:[{type:'text',text:'No results'}],\n  structuredContent:{resultCount:0,items:[]}};\n\n// Không truy cập được nguồn: chưa có kết luận về dữ liệu\nconst failed=makeError('transient',true,'Database connection timed out');",
        "keyPoint": "Đây là cặp phân biệt trọng tâm khi thi Domain 2.2.",
        "pitfall": "Không biến 'not found' hợp lệ thành lỗi mạng. Cũng không che lỗi mạng bằng kết quả rỗng thành công."
      },
      {
        "title": "6. Agent Recovery: local first, selective propagation",
        "explanation": [
          "Subagent thử xử lý transient tại chỗ với retry giới hạn và exponential backoff, nhưng với validation phải chỉnh input; business/permission phải báo đúng đường xử lý. Khi không tự phục hồi được, subagent trả lên coordinator lỗi có cấu trúc cùng những gì đã thử.",
          "Nếu lấy thành công 3/5 nguồn nhưng hai nguồn timeout, đừng làm mất ba kết quả; gửi partial results, sources_failed, attempts, và nguyên nhân. Coordinator quyết định tiếp tục báo cáo giới hạn hay escalation dựa trên evidence."
        ],
        "code": "async function recover(call, maxAttempts=3) {\n  for (let n=1;n<=maxAttempts;n++) {\n    const result=await call();\n    if (!result.isError) return {status:'success',result};\n    const m=result.structuredContent;\n    if (m.errorCategory!=='transient' || !m.isRetryable)\n      return {status:'needs_other_action',result};\n    if(n<maxAttempts) await new Promise(r=>setTimeout(r,200*2**(n-1)));\n  }\n  return {status:'retry_exhausted'};\n}",
        "keyPoint": "Agent phục hồi có giới hạn; lỗi không tự giải quyết phải truyền có chọn lọc, kèm partial findings."
      }
    ],
    "table": {
      "headers": [
        "Loại phản hồi",
        "isRetryable",
        "Hành động đúng"
      ],
      "rows": [
        [
          "transient: timeout",
          "true",
          "Retry có giới hạn/backoff (thận trọng với side effects)"
        ],
        [
          "validation: mã #NNNNN sai",
          "false",
          "Sửa input rồi gọi request mới"
        ],
        [
          "business: vượt chính sách",
          "false",
          "Manager approval / alternative workflow"
        ],
        [
          "permission: không có quyền",
          "false",
          "Xin quyền hợp lệ / escalation"
        ],
        [
          "empty success: 0 bản ghi",
          "Không áp dụng",
          "Trả 'không tìm thấy', không retry"
        ]
      ]
    },
    "vocabulary": [
      [
        "CallToolResult",
        "kết quả tool MCP",
        "Envelope phản hồi một lần thực thi tool trong MCP."
      ],
      [
        "Protocol Error",
        "lỗi giao thức",
        "JSON-RPC error khi request không hợp lệ ở tầng giao tiếp."
      ],
      [
        "Tool Execution Error",
        "lỗi chạy tool",
        "Tool hợp lệ chạy và báo lỗi trong result."
      ],
      [
        "StructuredContent",
        "nội dung có cấu trúc",
        "Phần structuredContent của CallToolResult."
      ],
      [
        "Error Category",
        "nhóm lỗi",
        "transient, validation, business hoặc permission."
      ],
      [
        "isRetryable",
        "có thể gọi lại cùng request",
        "Application-level boolean thể hiện khả năng retry không đổi input."
      ],
      [
        "Valid Empty Result",
        "kết quả rỗng hợp lệ",
        "Nguồn đã được truy vấn thành công nhưng không có record."
      ],
      [
        "Backoff",
        "tăng thời gian chờ",
        "Giãn khoảng cách giữa các lượt retry."
      ],
      [
        "Partial Results",
        "kết quả một phần",
        "Kết quả thành công được giữ ngay cả khi vài nhánh lỗi."
      ],
      [
        "Selective Propagation",
        "chuyển lỗi có chọn lọc",
        "Báo lên coordinator những lỗi không sửa được cục bộ."
      ]
    ],
    "summary": [
      "MCP phân biệt protocol error (JSON-RPC error) và tool execution error (isError:true).",
      "errorCategory/isRetryable/description là convention do ứng dụng định nghĩa.",
      "Transient có thể retry; validation cần sửa input; business cần workflow khác; permission cần quyền hợp lệ.",
      "isRetryable:false không có nghĩa từ bỏ toàn bộ nhiệm vụ.",
      "Truy vấn thành công không thấy kết quả là valid empty, không phải access failure.",
      "Subagent recovery cục bộ; nếu lỗi không xử lý được, trả partial findings và error context."
    ],
    "quiz": [
      {
        "question": "Tool chạy truy vấn thành công nhưng trả items:[] và resultCount:0. Nên làm gì?",
        "choices": [
          "Retry ba lần",
          "Trả không tìm thấy",
          "Đánh dấu transient",
          "Escalate"
        ],
        "correct": 1,
        "explanation": "Không có record là valid empty result, không phải lỗi. Truy vấn đã được thực hiện."
      },
      {
        "question": "Các trường errorCategory/isRetryable/description có bắt buộc bởi MCP spec không?",
        "choices": [
          "Cả ba bắt buộc",
          "Chỉ description bắt buộc",
          "Không, do ứng dụng quy ước",
          "Chỉ errorCategory bắt buộc"
        ],
        "correct": 2,
        "explanation": "MCP định nghĩa result envelope; ba metadata đó là quy ước do developer đưa vào structuredContent."
      },
      {
        "question": "Một database timeout hợp lệ là nhóm nào?",
        "choices": [
          "transient",
          "business",
          "permission",
          "validation"
        ],
        "correct": 0,
        "explanation": "Timeout hoặc service unavailable thường tạm thời, có thể retry giới hạn."
      },
      {
        "question": "Mã order 'abc' không đúng #NNNNN. isRetryable với cùng request?",
        "choices": [
          "true",
          "false",
          "Không dùng category",
          "Luôn throw"
        ],
        "correct": 1,
        "explanation": "Đúng hành động là sửa input trước khi gọi mới, không gửi nguyên yêu cầu."
      },
      {
        "question": "Tool hoàn tiền 750 khi hạn mức tự động 500. Hành động đúng?",
        "choices": [
          "Retry 5 lần",
          "Tăng limit client",
          "Chuyển quy trình phê duyệt",
          "Bỏ qua lỗi"
        ],
        "correct": 2,
        "explanation": "Business policy không đổi vì retry. Cần thay đổi workflow với quyền hợp lệ."
      },
      {
        "question": "Một protocol error do tên tool không tồn tại là dạng nào?",
        "choices": [
          "MCP result isError:true",
          "JSON-RPC error response",
          "Valid empty result",
          "Successful content"
        ],
        "correct": 1,
        "explanation": "Tool chưa chạy; lỗi nằm ở request/giao thức."
      },
      {
        "question": "Subagent tìm 3/5 nguồn rồi hai nguồn timeout. Nên báo gì cho coordinator?",
        "choices": [
          "[]",
          "Chỉ error chung",
          "3 findings + lỗi 2 nguồn + attempts",
          "Tuyên bố đủ 5 nguồn"
        ],
        "correct": 2,
        "explanation": "Giữ partial results và context thất bại để coordinator ra quyết định."
      },
      {
        "question": "Permission error không đủ credentials. Agent nên làm gì?",
        "choices": [
          "Lách quyền bằng tool khác",
          "Retry vô hạn",
          "Yêu cầu quyền hợp lệ hoặc escalation",
          "Sửa role trong request"
        ],
        "correct": 2,
        "explanation": "Permission là ranh giới authorization, không được bypass bằng prompt hoặc retry."
      }
    ],
    "lab": {
      "title": "MCP customer_lookup: bốn loại lỗi và recovery loop",
      "duration": "45 phút",
      "goal": "Tạo MCP server tool customer_lookup trên database giả, mô phỏng bốn errors + valid empty và viết agent-side recovery có giới hạn.",
      "steps": [
        {
          "title": "Đăng ký một MCP tool thật",
          "instruction": "Cài @modelcontextprotocol/sdk cùng zod, registerTool('customer_lookup') với schema input.",
          "why": "Đảm bảo đang làm việc với MCP CallToolResult chứ không chỉ object giả.",
          "expected": "Server công bố customer_lookup, nhận customerId và failureMode ở demo."
        },
        {
          "title": "Mô phỏng bốn error categories",
          "instruction": "Handler trả isError:true, content và structuredContent với transient/validation/business/permission.",
          "why": "Mỗi lỗi đòi cách recovery khác nhau.",
          "expected": "Bốn output có metadata và hint đúng category."
        },
        {
          "title": "Bổ sung valid empty",
          "instruction": "Không có khách → isError:false và resultCount:0.",
          "why": "Ngăn lặp vô ích khi truy vấn thành công.",
          "expected": "No matches hoàn toàn khác timeout."
        },
        {
          "title": "Cài giới hạn retry và branching",
          "instruction": "Transient retry tối đa ba lần với backoff; validation sửa input; business và permission chuyển sang quy trình phù hợp.",
          "why": "Biến metadata thành hành động an toàn.",
          "expected": "Không retry cùng yêu cầu validation/business/permission."
        },
        {
          "title": "Chạy từng failureMode và đọc log",
          "instruction": "Ghi category, attempts và output thực tế, không giả lập 'Claude tự gọi' nếu chỉ chạy local logic.",
          "why": "Quan sát rõ logic recovery và phân biệt MCP server với consumer.",
          "expected": "5 trường hợp được test; không gọi Anthropic API để chạy logic local."
        }
      ],
      "commands": "npm run lab:domain2 -- 2\n# Tùy chọn chạy MCP server thật:\nnpm install --no-save --package-lock=false @modelcontextprotocol/server @modelcontextprotocol/client zod\nnpm run lab:domain2:mcp",
      "source": "scripts/domain2-mcp-server.mjs",
      "disclaimer": "Lab local không cần Claude API. Bản MCP server/client sử dụng MCP SDK v2 qua stdio, gọi tool thật nhưng KHÔNG gọi Claude model và không tự cấp quyền."
    }
  },
  "en": {
    "title": "Structured Error Responses — Recover safely from tool failures",
    "subtitle": "Different failure categories require different actions: retry, correct input, alternative workflow, or authorised access.",
    "bridge": "Task 2.1 explains selecting tools. Task 2.2 explains what the agent should do AFTER a valid tool call fails.",
    "scenarioTitle": "An agent retries when a customer does not exist",
    "scenario": "A lookup succeeds and returns no customer records. An agent misclassifies the empty result as an outage, retries three times and escalates unnecessarily. The correct answer was simply no matching account.",
    "sections": [
      {
        "title": "1. Two error layers: protocol vs tool execution",
        "explanation": [
          "MCP protocol errors use JSON-RPC error responses when requests are malformed, tool names are unknown or protocol processing fails.",
          "Tool execution errors use a CallToolResult with isError:true so the model can reason about recovery. Distinguish invalid RPC input from business-invalid data accepted by the tool schema."
        ],
        "code": "// A: JSON-RPC protocol error — không có result envelope\nconst protocol = {jsonrpc:'2.0',id:3,error:{code:-32602,message:'Unknown tool'}};\n\n// B: MCP execution error — có result envelope\nconst execution = {jsonrpc:'2.0',id:4,result:{\n  isError:true,\n  content:[{type:'text',text:'Order database timed out'}]\n}};",
        "keyPoint": "JSON-RPC errors and CallToolResult execution errors are different layers."
      },
      {
        "title": "2. Standard MCP fields vs application-defined metadata",
        "explanation": [
          "MCP defines content, isError and structuredContent. The errorCategory, isRetryable and description fields in this lesson are application-level conventions.",
          "Using those fields in structuredContent helps recovery but they are not mandatory MCP protocol fields. Distinguish MCP's isError from the Messages API tool_result is_error field."
        ],
        "code": "function makeError(errorCategory,isRetryable,description){\n  return {\n    isError: true,   // MCP field\n    content: [{ type:'text', text:description }],\n    structuredContent: {\n      errorCategory, // APP convention\n      isRetryable,   // APP convention\n      description    // APP convention\n    }\n  };\n}",
        "keyPoint": "Custom metadata improves reliability without becoming part of the mandatory MCP specification."
      },
      {
        "title": "3. Transient vs validation: different recovery",
        "explanation": [
          "Transient failures include temporary upstream timeouts and rate limits; a bounded retry with backoff may help. Avoid duplicate side effects by applying idempotency or reconciliation.",
          "Validation failures need a changed input, not a retry of the identical call. Thus isRetryable:false does not mean the agent must abandon the task."
        ],
        "code": "const transient=makeError('transient',true,'Upstream timeout; retry later');\nconst validation=makeError('validation',false,'Order ID must be #NNNNN');\n\n// Không được viết if (!isRetryable) return STOP;\n// Với validation: cần sửa input, sau đó tạo lời gọi mới.",
        "keyPoint": "The boolean answers whether repeating the exact request can succeed."
      },
      {
        "title": "4. Business and permission failures require a different path",
        "explanation": [
          "A policy limit cannot be bypassed by repeating a valid-looking call; escalate or use an authorised alternative workflow.",
          "Missing permissions require access approval or an authorised principal. Never attempt unauthorised credential substitution."
        ],
        "code": "const policy=makeError('business',false,'Above limit; manager approval required');\nconst access=makeError('permission',false,'Access denied; request authorized access');\n// KHÔNG dùng retry để bypass policy hoặc permissions.",
        "keyPoint": "Retry does not change business policy or authorization."
      },
      {
        "title": "5. Valid empty result vs access failure",
        "explanation": [
          "No matched records after a successful query is a normal result: isError:false with resultCount:0.",
          "A database timeout leaves the data unknown and must not be masked by an empty array. This is a key exam distinction."
        ],
        "code": "// Query chạy xong, KHÔNG có matches\nconst empty={isError:false,content:[{type:'text',text:'No results'}],\n  structuredContent:{resultCount:0,items:[]}};\n\n// Không truy cập được nguồn: chưa có kết luận về dữ liệu\nconst failed=makeError('transient',true,'Database connection timed out');",
        "keyPoint": "Do not retry successful empty queries; do not claim no data after an access failure.",
        "pitfall": "Never turn a timeout into [] as a success."
      },
      {
        "title": "6. Local recovery and selective propagation",
        "explanation": [
          "Subagents should recover transient failures locally when safe and bounded, then propagate unresolved errors with clear evidence to the coordinator.",
          "Preserve partial results. If three of five sources were retrieved, deliver those three plus failed source IDs and attempted retries."
        ],
        "code": "async function recover(call, maxAttempts=3) {\n  for (let n=1;n<=maxAttempts;n++) {\n    const result=await call();\n    if (!result.isError) return {status:'success',result};\n    const m=result.structuredContent;\n    if (m.errorCategory!=='transient' || !m.isRetryable)\n      return {status:'needs_other_action',result};\n    if(n<maxAttempts) await new Promise(r=>setTimeout(r,200*2**(n-1)));\n  }\n  return {status:'retry_exhausted'};\n}",
        "keyPoint": "Keep useful partial findings and explicitly report unresolved failures."
      }
    ],
    "table": {
      "headers": [
        "Response",
        "isRetryable",
        "Correct action"
      ],
      "rows": [
        [
          "transient timeout",
          "true",
          "Bounded retry with backoff"
        ],
        [
          "validation format error",
          "false",
          "Correct input and issue a new call"
        ],
        [
          "business policy violation",
          "false",
          "Alternative workflow / human escalation"
        ],
        [
          "permission denied",
          "false",
          "Request authorised access"
        ],
        [
          "successful empty query",
          "N/A",
          "Report no matches"
        ]
      ]
    },
    "vocabulary": [
      [
        "CallToolResult",
        "kết quả tool MCP",
        "Envelope phản hồi một lần thực thi tool trong MCP."
      ],
      [
        "Protocol Error",
        "lỗi giao thức",
        "JSON-RPC error khi request không hợp lệ ở tầng giao tiếp."
      ],
      [
        "Tool Execution Error",
        "lỗi chạy tool",
        "Tool hợp lệ chạy và báo lỗi trong result."
      ],
      [
        "StructuredContent",
        "nội dung có cấu trúc",
        "Phần structuredContent của CallToolResult."
      ],
      [
        "Error Category",
        "nhóm lỗi",
        "transient, validation, business hoặc permission."
      ],
      [
        "isRetryable",
        "có thể gọi lại cùng request",
        "Application-level boolean thể hiện khả năng retry không đổi input."
      ],
      [
        "Valid Empty Result",
        "kết quả rỗng hợp lệ",
        "Nguồn đã được truy vấn thành công nhưng không có record."
      ],
      [
        "Backoff",
        "tăng thời gian chờ",
        "Giãn khoảng cách giữa các lượt retry."
      ],
      [
        "Partial Results",
        "kết quả một phần",
        "Kết quả thành công được giữ ngay cả khi vài nhánh lỗi."
      ],
      [
        "Selective Propagation",
        "chuyển lỗi có chọn lọc",
        "Báo lên coordinator những lỗi không sửa được cục bộ."
      ]
    ],
    "summary": [
      "Protocol errors differ from tool execution errors.",
      "Three recovery metadata fields are application-defined, not mandatory MCP fields.",
      "Transient retry; validation correct input; business alternative path; permission approved access.",
      "isRetryable:false does not mean abandoning the whole task.",
      "Valid empty and access failure must be distinct.",
      "Preserve partial findings when escalating unresolved subagent errors."
    ],
    "quiz": [
      {
        "question": "A successful lookup returns no items. What next?",
        "choices": [
          "Retry 3 times",
          "Report no matches",
          "Treat as transient",
          "Escalate"
        ],
        "correct": 1,
        "explanation": "The query succeeded; no matching data is a valid empty result."
      },
      {
        "question": "Are errorCategory/isRetryable/description mandatory MCP protocol fields?",
        "choices": [
          "All are mandatory",
          "Only description",
          "No, application-defined",
          "Only errorCategory"
        ],
        "correct": 2,
        "explanation": "They are conventions in structuredContent, not mandatory MCP keys."
      },
      {
        "question": "A temporary database timeout belongs to which category?",
        "choices": [
          "transient",
          "business",
          "permission",
          "validation"
        ],
        "correct": 0,
        "explanation": "Timeouts are transient and can be retried safely with bounds."
      },
      {
        "question": "An order ID fails #NNNNN format. Retry unchanged?",
        "choices": [
          "true",
          "false",
          "ignore category",
          "always throw"
        ],
        "correct": 1,
        "explanation": "Unchanged invalid inputs fail again; a corrected call is needed."
      },
      {
        "question": "Refund exceeds policy limit. What next?",
        "choices": [
          "Retry",
          "Raise client limit",
          "Escalate for approval",
          "Ignore"
        ],
        "correct": 2,
        "explanation": "A business policy violation needs an alternative authorised workflow."
      },
      {
        "question": "Unknown tool name produces what response?",
        "choices": [
          "isError:true result",
          "JSON-RPC error",
          "Empty result",
          "Successful content"
        ],
        "correct": 1,
        "explanation": "Unknown tools are protocol-layer JSON-RPC errors."
      },
      {
        "question": "A researcher obtains three of five sources; two time out. What should be reported?",
        "choices": [
          "[]",
          "Generic error",
          "Three findings plus failed sources/attempts",
          "Claim complete"
        ],
        "correct": 2,
        "explanation": "Preserve partial evidence and report unresolved failures."
      },
      {
        "question": "What should an agent do on permission denied?",
        "choices": [
          "Bypass with another tool",
          "Retry forever",
          "Request authorised access",
          "Change role field"
        ],
        "correct": 2,
        "explanation": "Authorization must be respected, not worked around."
      }
    ],
    "lab": {
      "title": "MCP customer_lookup with recovery categories",
      "duration": "45 minutes",
      "goal": "Register a real MCP tool, simulate four execution failure categories, handle successful empty lookup, and implement bounded recovery.",
      "steps": [
        {
          "title": "Register an MCP tool",
          "instruction": "Use @modelcontextprotocol/sdk and zod for customer_lookup.",
          "why": "Work with an actual CallToolResult.",
          "expected": "MCP tool is discoverable."
        },
        {
          "title": "Simulate four categories",
          "instruction": "Return isError:true plus custom structuredContent metadata.",
          "why": "Map tool failure to recovery strategy.",
          "expected": "Four distinct valid error responses."
        },
        {
          "title": "Return valid empty",
          "instruction": "An unmatched ID returns isError:false and resultCount:0.",
          "why": "Avoid wasted retries.",
          "expected": "Empty success differs from access failure."
        },
        {
          "title": "Implement recovery",
          "instruction": "Retry transient three times, correct validation, escalate business/permission.",
          "why": "Apply metadata without bypassing policy.",
          "expected": "No retries of unchanged non-retriable calls."
        },
        {
          "title": "Test all paths",
          "instruction": "Inspect category, attempt counts, and actual local outputs.",
          "why": "Avoid claiming the model was involved when only local logic ran.",
          "expected": "Five exercised response paths."
        }
      ],
      "commands": "npm run lab:domain2 -- 2\n# Tùy chọn chạy MCP server thật:\nnpm install --no-save --package-lock=false @modelcontextprotocol/server @modelcontextprotocol/client zod\nnpm run lab:domain2:mcp",
      "source": "scripts/domain2-mcp-server.mjs",
      "disclaimer": "No Anthropic key is needed. The optional v2 MCP server/client really exchanges JSON-RPC over stdio, but does not invoke a Claude model."
    }
  }
};
