// Editorial review: authored as paraphrased, cross-checked teaching notes, not copied guide text.
// Each lesson remains constrained to its Task Statement and links to directly applicable official documentation.
export type EditorialLesson = {id:string; official:string; mechanism:[string,string]; example:[string,string]; distinction:[string,string]; examTrap:[string,string]};
export const domain12Editorial: EditorialLesson[] = [
  {
    "id": "1.1",
    "official": "https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons",
    "mechanism": [
      "Vòng lặp agent bắt đầu bằng Messages API request, đọc stop_reason, thực thi mọi client tool_use được yêu cầu, rồi gửi lại assistant tool_use cùng user tool_result có tool_use_id khớp. end_turn nghĩa là xong lượt; tool_use nghĩa là ứng dụng cần chạy tool. Đây là luồng điều khiển do code sở hữu, không phải Claude tự chạy hàm JavaScript của bạn.",
      "An agent loop sends a Messages API request, inspects stop_reason, executes requested client tools, then returns the assistant tool_use blocks followed by matching user tool_result blocks using tool_use_id. end_turn closes the turn; tool_use hands control to your application. Claude does not directly execute the JavaScript functions you define."
    ],
    "example": [
      "Khách hỏi trạng thái giao hàng: lần 1 model gọi lookup_order; ứng dụng tra đơn #84 và trả result; lần 2 model có thể gọi tracking; chỉ khi end_turn mới hiển thị câu trả lời cuối. Luôn log tool name, ids và status để debug.",
      "A delivery enquiry may need lookup_order then tracking in separate iterations. Run each tool, append its result and request another model turn. Display the final answer only on end_turn, logging tool names, IDs and statuses for diagnosis."
    ],
    "distinction": [
      "Đừng nhầm tool_use với chỉ có một tool: phản hồi có thể chứa nhiều blocks và cả text. Safety cap, timeout và ngân sách vẫn cần để chống runaway, nhưng cap không phải tín hiệu thành công. Các stop_reason khác có pause_turn, refusal, max_tokens, stop_sequence, model_context_window_exceeded và phải xử lý riêng.",
      "A tool_use response can contain multiple tool calls and accompanying text. Safety caps, timeouts and budgets prevent runaway work but do not prove successful completion. Production also handles pause_turn, refusal, max_tokens, stop_sequence and model_context_window_exceeded explicitly."
    ],
    "examTrap": [
      "Bẫy: kiểm tra content[0].type === 'text' và kết thúc sớm sẽ bỏ lỡ tool_use phía sau. Không gửi tool_result khớp ID cũng làm mất tiến trình. Khi bị max_tokens cắt giữa một tool block, tăng giới hạn và thử lại an toàn thay vì thực thi JSON chưa đủ.",
      "Exam trap: treating the first text block as completion misses later tool_use blocks. Missing or mismatched result IDs also break the loop. If max_tokens truncates a tool call, do not execute incomplete arguments."
    ]
  },
  {
    "id": "1.2",
    "official": "https://code.claude.com/docs/en/agent-sdk/subagents",
    "mechanism": [
      "Coordinator nhận goal, chia scope rõ cho specialist, cấp context và tools vừa đủ, tổng hợp findings sau khi từng agent hoàn tất. Hub-and-spoke không đồng nghĩa với chia mọi công việc; một nhiệm vụ nhỏ có thể tốt hơn với một agent.",
      "A coordinator receives the goal, partitions responsibilities, passes the necessary context and tools, then synthesises specialist findings. Hub-and-spoke does not mean every task deserves multiple agents; a narrow problem may be better served by one."
    ],
    "example": [
      "Một báo cáo cần giá bán thị trường và quy định nội bộ: giao Web Specialist chỉ nghiên cứu giá kèm URL, Document Specialist chỉ đọc chính sách kèm trang, Synthesiser chỉ kết luận từ hai gói findings có nguồn.",
      "For a report covering market prices and internal policy, assign price research with URLs to a web specialist, document analysis with page references to another, and evidence-based synthesis to a final specialist."
    ],
    "distinction": [
      "Song song khi tác vụ độc lập; tuần tự khi B cần output của A. Thiếu breadth thì thêm scope còn trống; thiếu depth thì bổ sung evidence hoặc specialist có năng lực chuyên biệt. Không lấy câu model tự nhận 'đã bao phủ 100%' làm chứng cứ.",
      "Parallelise independent investigations; run dependent ones sequentially. Fix missing breadth by filling uncovered scopes; fix missing depth by targeted evidence retrieval or specialist analysis. A model's claim of 100% coverage is not verification."
    ],
    "examTrap": [
      "Bẫy: nhiều agents với scope chồng lấn có thể nhân đôi lỗi, chi phí và findings mâu thuẫn. Coordinator phải loại trùng, chỉ ra provenance, kiểm lại các claims quan trọng trước khi xuất báo cáo.",
      "Exam trap: overlapping agent scopes create duplicate work, costs and inconsistent conclusions. A coordinator must reconcile findings and verify consequential claims."
    ]
  },
  {
    "id": "1.3",
    "official": "https://code.claude.com/docs/en/agent-sdk/subagents",
    "mechanism": [
      "AgentDefinition định nghĩa description (khi nào giao việc), prompt (hướng dẫn), tools (công cụ được phép). Subagent thường có context riêng; coordinator phải chủ động truyền goal, evidence, URL và metadata cần thiết. Cách cấu hình tool delegation phụ thuộc phiên bản SDK/CLI đang dùng.",
      "An AgentDefinition describes when to delegate, what the subagent must do and which tools it may use. Subagents have separate context: the coordinator must pass goals, relevant findings and source metadata explicitly. Delegation permissions and tool names are SDK/CLI-version specific."
    ],
    "example": [
      "Web Agent trả {claim, source_url, title}; Document Agent trả {claim, document_name, page_number}; Synthesis Agent phải nhận cả hai object chứ không chỉ một câu 'đã tìm xong'.",
      "Pass structured web findings with URL/title and document findings with document name/page number to the synthesis agent, rather than telling it simply that research is complete."
    ],
    "distinction": [
      "Context isolation khác với Resume/Fork của session: fork sao chép một phần lịch sử session; subagent không mặc định thừa kế mọi tool result. Tool tên Task trong nhiều guide cũ được đổi thành Agent trong Claude Code mới; kiểm tra tài liệu runtime.",
      "Context isolation differs from session resume/fork. Forking retains history, whereas a newly delegated subagent does not automatically inherit all prior tool results. Older guides refer to Task; newer Claude Code refers to Agent."
    ],
    "examTrap": [
      "Bẫy: chỉ gửi claim mà bỏ URL/trang khiến attribution thất bại; thêm một source_url bất kỳ không chứng minh nguồn thực sự hỗ trợ claim. Không coi allowedTools là một cơ chế bảo mật vượt qua mọi permission boundary.",
      "Exam trap: passing claims without source location breaks attribution; merely attaching a URL does not prove it supports the claim. Do not mistake allowedTools configuration for a complete security boundary."
    ]
  },
  {
    "id": "1.4",
    "official": "https://code.claude.com/docs/en/agent-sdk/hooks",
    "mechanism": [
      "Prompt chỉ định hành vi mong muốn; điều kiện bắt buộc như xác minh khách trước refund phải do backend/permission gate kiểm tra tại điểm thực thi. Gate fail-closed nếu thiếu session authorization, đúng customer ID hoặc amount validation.",
      "Prompts steer intended behaviour; mandatory prerequisites such as verifying a customer before refund need application-side or permission checks at the execution boundary. Fail closed when the authorised identity, matching customer ID or valid amount is missing."
    ],
    "example": [
      "Trước process_refund kiểm tra verifiedCustomerId == customerId và quyền trên order hiện tại, không dùng cờ 'verified' do model tự viết. Khi không đủ điều kiện, trả structured error để coordinator chuyển đúng luồng xác minh hoặc human escalation.",
      "Before process_refund, verify the trusted session identity, ownership of the order and amount. Ignore a 'verified' flag asserted by the model. Return a structured block and route to verification or human review when required."
    ],
    "distinction": [
      "Handoff tự chứa: mục tiêu, dữ liệu đã xác minh, việc đã làm, còn thiếu gì, nguyên nhân chuyển, hành động tiếp. Handoff không phải đơn thuần chuyển nguyên transcript dài cho con người.",
      "A self-contained handoff captures the goal, verified facts, completed work, blockers, reason for escalation and next action. Dumping a long conversation transcript is not a substitute."
    ],
    "examTrap": [
      "Bẫy: PostToolUse không đảo ngược được refund đã chạy. Tránh chỉ mô tả 'luôn xác minh' trong system prompt và giả định policy luôn được thực thi.",
      "Exam trap: PostToolUse cannot reverse a refund that has already executed. A system prompt saying 'always verify' is not deterministic enforcement."
    ]
  },
  {
    "id": "1.5",
    "official": "https://code.claude.com/docs/en/agent-sdk/hooks",
    "mechanism": [
      "PreToolUse chạy trước khi tool được thực thi và có thể deny/ask/allow hoặc chỉnh tool input theo contract hỗ trợ; PostToolUse chạy sau, có thể chuẩn hóa kết quả trước khi model đọc. Hooks áp dụng ở runtime được cấu hình, không phải lời hứa ngôn ngữ.",
      "PreToolUse runs before tool execution and can deny, request approval, allow or modify inputs through supported contracts; PostToolUse runs afterwards and can normalise outputs before Claude processes them. Hooks are runtime enforcement, not prose instructions."
    ],
    "example": [
      "Ba API trả timestamp Unix/ISO/ngày địa phương: PostToolUse chuyển về ISO 8601 với timezone đúng để tránh synthesis sai. process_refund bị chặn bằng PreToolUse và server-side authorisation, trước khi side effect xảy ra.",
      "When systems return Unix, ISO and local date formats, normalise carefully to a consistent ISO 8601 representation after retrieval. Block process_refund before side effects using PreToolUse and backend authorisation."
    ],
    "distinction": [
      "Không nhầm hook với wrapper viết tay trong Messages API: wrapper có thể mô phỏng logic nhưng không phải SDK hook API. Tham số updatedToolOutput khác với tên trường cũ trong vài SDK release; kiểm tra loại tool được hỗ trợ.",
      "Do not conflate a custom Messages API wrapper with an Agent SDK hook callback. The supported updatedToolOutput contract and hook result shape can vary by SDK version and tool type."
    ],
    "examTrap": [
      "Bẫy: khóa thao tác tài chính bằng PostToolUse là quá muộn. Khi normalize data, kiểm timezone và null trước khi format; không biến HTTP 404 thành giao hàng 'đã xong'.",
      "Exam trap: financial side effects cannot be prevented by PostToolUse. Validate timezones, nulls and status mapping; do not normalise away real errors."
    ]
  },
  {
    "id": "1.6",
    "official": "https://code.claude.com/docs/en/best-practices",
    "mechanism": [
      "Fixed pipeline (prompt chaining) có các bước xác định trước, thích hợp kiểm định hồ sơ lặp lại. Adaptive decomposition khảo sát, phát hiện dependency và thay đổi kế hoạch sau mỗi bằng chứng mới, phù hợp điều tra bug chưa biết nguyên nhân.",
      "A fixed pipeline follows predetermined stages for predictable repeated work. Adaptive decomposition discovers dependencies and revises subtasks as evidence arrives, suitable for investigations whose cause is initially unknown."
    ],
    "example": [
      "Review PR nhiều file: pass A phân tích từng file độc lập, pass B kiểm tra contracts và data flows qua các file, pass C tổng hợp. Trong điều tra lỗi inventory chưa rõ, agent khảo sát logs rồi thay đổi scope theo findings.",
      "For a large PR, review individual files, then cross-file contracts and data flow, then synthesise. For an unexplained inventory fault, inspect evidence and revise the investigation plan dynamically."
    ],
    "distinction": [
      "Attention dilution nghĩa là tài liệu quá rộng làm model không phân bố chú ý đều, không chỉ là vượt context window. Chia local pass để tránh bỏ sót, nhưng phải có integration pass để phát hiện lỗi tại ranh giới.",
      "Attention dilution is uneven scrutiny across a large context, not necessarily exhaustion of the context window. Local passes improve depth, whilst a separate integration pass catches interaction defects."
    ],
    "examTrap": [
      "Bẫy: chia mọi file độc lập rồi bỏ tổng hợp có thể làm mỗi file đúng mà hệ thống sai. Chọn fixed/adaptive dựa trên mức độ biết trước các bước, không phải chỉ số lượng file.",
      "Exam trap: isolated per-file checks may miss system-level breakage. Choose fixed versus adaptive by how predictable the steps are, not merely by file count."
    ]
  },
  {
    "id": "1.7",
    "official": "https://code.claude.com/docs/en/agent-sdk/sessions",
    "mechanism": [
      "Resume tiếp tục một session cùng history. Fork tạo nhánh độc lập từ history gốc nhưng vẫn giữ thông tin đã đọc trước khi tách. Fresh session + curated summary tạo context mới có chọn lọc. Session history không đồng nghĩa trạng thái file hiện tại.",
      "Resume continues a session with its previous history. Fork creates an independent branch from that history but retains information present before the fork. A fresh session with a curated summary starts with selected context. Session history is not the current filesystem state."
    ],
    "example": [
      "Khi ba trong 50 files vừa đổi, tránh tin tool outputs từ ngày trước; tạo session mới có summary findings và đọc lại ba files cùng dependencies, hoặc resume nếu không có thay đổi quan trọng.",
      "If three out of fifty files changed overnight, do not blindly trust yesterday's tool results. Start fresh with a findings summary and re-read changed files and affected dependencies; resume if previous evidence remains valid."
    ],
    "distinction": [
      "Application-level messages array trong Messages API không tự tạo persisted Agent SDK session. Phân biệt continue gần nhất, resume theo ID và fork khi cần hai hướng thử nghiệm.",
      "Copying a Messages API history array is not the same as persisting an Agent SDK session. Distinguish continue-latest, resume-by-ID and fork-for-alternative-experiments."
    ],
    "examTrap": [
      "Bẫy: fork không xóa stale results; resume khi code đã đổi có thể đưa lời khuyên cũ. Curated summary vẫn cần validation, không biến nhận định chưa kiểm chứng thành sự thật.",
      "Exam trap: forking does not purge stale reads, and a resumed session can reproduce obsolete advice. A summary needs verification rather than promoting unproved findings to facts."
    ]
  },
  {
    "id": "2.1",
    "official": "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview",
    "mechanism": [
      "Tool name, description và input_schema phối hợp định hướng lựa chọn và tham số. Description phải nói chức năng, input/format, examples, limitations và khi nào KHÔNG dùng tool để tránh misrouting với công cụ gần nghĩa.",
      "Tool names, descriptions and input_schema jointly shape selection and parameter generation. A reliable description gives purpose, input formats, examples, limitations and boundaries against similar tools."
    ],
    "example": [
      "get_customer dùng tra hồ sơ theo email hoặc customer ID; lookup_order dùng order ID và status, không xác minh danh tính. Hai tool đều 'retrieve information' nhưng ranh giới phải chỉ rõ trong description.",
      "get_customer handles profile lookups by email or customer ID; lookup_order handles order identifiers and status. Both retrieve data, so clarify boundaries in their descriptions."
    ],
    "distinction": [
      "JSON Schema ràng buộc hình dạng parameters khi model sinh input; strict:true trên tool hỗ trợ mang bảo đảm mạnh hơn. Schema không thay thế authorisation, kiểm tra giá trị nghiệp vụ hay mô tả tool chọn đúng.",
      "JSON Schema defines parameter shape, with supported strict:true giving stronger conformance. It does not replace authorisation, business value checks or clear guidance for choosing the correct tool."
    ],
    "examTrap": [
      "Bẫy: thêm nhiều tools gần nhau nhưng description cùng chung chung có thể làm routing tệ hơn. Tinh chỉnh ranh giới và kiểm thử ambiguous queries trước khi thêm coordinator mới.",
      "Exam trap: adding nearly identical tools with generic descriptions can worsen routing. First test ambiguous requests and sharpen selection boundaries."
    ]
  },
  {
    "id": "2.2",
    "official": "https://modelcontextprotocol.io/specification/2025-06-18/server/tools",
    "mechanism": [
      "Lỗi MCP tool execution dùng result với isError:true để model có cơ hội đọc và sửa tham số nếu cần. Đây khác với lỗi protocol/transport JSON-RPC. Trả structured details rõ category, code, message và retry guidance; không cần giả định một trường isRetryable là bắt buộc của MCP.",
      "An MCP tool execution failure can return a tool result with isError:true so the model receives actionable details. This differs from JSON-RPC protocol or transport errors. Include explicit error category, code, message and retry guidance; isRetryable is a useful application convention, not a universally required MCP field."
    ],
    "example": [
      "Validation error 'orderId invalid' sửa tham số; timeout từ dịch vụ có thể retry có backoff; permission denied cần xin quyền, không retry giống y; valid empty result báo thành công với array rỗng, không tự gắn isError.",
      "An invalid order ID needs corrected arguments; a transient timeout may permit bounded backoff; permission denied requires authorisation, not blind retries. A legitimate empty search result is successful data rather than an error."
    ],
    "distinction": [
      "Phân biệt error có thể giải quyết bằng cùng request với lỗi cần thay đổi input/permission; retry chỉ khi loại lỗi và idempotency cho phép. Với operation có side effect, phải chống double submit bằng idempotency key nếu cần.",
      "Distinguish transient retryable failures from invalid inputs and insufficient permissions. For side-effectful operations, bounded retries also need idempotency controls to avoid duplicate actions."
    ],
    "examTrap": [
      "Bẫy: HTTP status 200 không có nghĩa tool execution luôn thành công; isError:true là kết quả lỗi mức tool. Không đặt isRetryable:true mặc định cho mọi failure.",
      "Exam trap: a successful transport response can contain a tool execution error. Do not mark every failure retryable."
    ]
  },
  {
    "id": "2.3",
    "official": "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview",
    "mechanism": [
      "Giới hạn mỗi agent ở bộ tools thực sự phục vụ vai trò để giảm nhầm lẫn và quyền thừa; chọn tool theo description và available inputs. tool_choice auto cho phép trả text, any muốn một tool, named tool muốn tên cụ thể trên model hỗ trợ chế độ đó.",
      "Limit each agent to a coherent toolset to reduce misrouting and unnecessary permissions. auto can produce a direct answer; any and named tool modes request forced selection where the chosen model supports them."
    ],
    "example": [
      "Agent trích metadata chỉ cần extract_metadata và read_document; coordinator có thể định tuyến sang search_files hoặc send_report ở bước khác. Khi hai thao tác cùng bản chất, cân nhắc một parameterised tool với mode thay vì nhân bản tools.",
      "A metadata specialist needs extract_metadata and read_document, not send_report. A coordinator can route to other capabilities later. Closely related operations may be clearer as one parameterised tool rather than many duplicated tools."
    ],
    "distinction": [
      "Tool-choice constraint có phạm vi từng request, không phải quyền bảo mật lâu dài. Các model/API mới có thể giới hạn forced tool choice; phải kiểm docs phiên bản và quyền khi triển khai.",
      "Tool-choice applies to an individual request, not to long-term permissions. Some models or feature combinations restrict forced modes, so check current documentation before deploying."
    ],
    "examTrap": [
      "Bẫy: nhiều tools rộng không luôn tốt; đổi tool_choice để ép dùng tool không sửa được description sai hoặc tham số thiếu.",
      "Exam trap: more tools are not always better, and forcing a tool does not fix a bad description or missing parameters."
    ]
  },
  {
    "id": "2.4",
    "official": "https://code.claude.com/docs/en/mcp",
    "mechanism": [
      "MCP cung cấp tools (thao tác), resources (ngữ cảnh có thể đọc) và prompts (mẫu). Claude Code có nhiều scope: project .mcp.json để chia sẻ, user config cho cá nhân, local scope cho repo hiện tại. Các scope tồn tại cùng nhau; lựa chọn scope quyết định chia sẻ và mức trust.",
      "MCP exposes tools for operations, resources for readable context and prompts for reusable templates. Claude Code supports project-level .mcp.json and personal user/local scoping. These can coexist; scope affects sharing and trust."
    ],
    "example": [
      "Team dùng GitHub/Jira MCP đặt cấu hình project với ${ENV_VAR}, không commit token. Notion cá nhân giữ ở user scope. API quản lý order độc quyền có thể cần custom server; ưu tiên server có sẵn được kiểm tra nếu phù hợp.",
      "Share a GitHub/Jira server definition through project configuration using environment references rather than committing secrets. Keep personal integrations in user scope. A proprietary order API may justify a custom server once existing options are assessed."
    ],
    "distinction": [
      "Project MCP có approval/trust flow; 'tồn tại trong .mcp.json' không đồng nghĩa máy mới tự chạy server nguy hiểm không hỏi. Resource không thay thế tool cần parameters/dynamic lookup.",
      "Project-scoped MCP servers are subject to approval and workspace trust; a checked-in .mcp.json does not mean unsafe servers run silently on every clone. Resources do not replace parameterised operational tools."
    ],
    "examTrap": [
      "Bẫy: nhét credentials vào .mcp.json; mặc định assume server luôn available; dùng resource để thay create_order có side effects; đặt một tích hợp cá nhân vào project.",
      "Exam traps: committing credentials, assuming automatic authorisation, using a resource for a side-effectful create_order action, or sharing a personal integration through the project."
    ]
  },
  {
    "id": "2.5",
    "official": "https://code.claude.com/docs/en/cli-reference",
    "mechanism": [
      "Glob tìm đường dẫn/tên file theo pattern; Grep tìm nội dung trong file; Read xem đầy đủ ngữ cảnh. Edit patch một đoạn khi đoạn old_string đủ duy nhất; Write tạo hoặc thay nội dung, vì vậy cần đọc lại và kiểm diff trước ghi đè.",
      "Glob discovers file paths by glob pattern; Grep searches file contents. Read inspects context; Edit changes a uniquely identified span; Write creates or replaces content and demands caution against accidental overwrite."
    ],
    "example": [
      "Tìm files chứa 'getSession' dùng Grep; tìm tất cả *.test.tsx dùng Glob. Với hai chỗ text trùng nhau, đừng Edit mù; Read các vị trí rồi định phạm vi thay đổi hoặc sửa bằng patch an toàn.",
      "Use Grep for callers of getSession and Glob for all *.test.tsx paths. If a replacement string occurs twice, inspect both sites and make a targeted edit rather than applying an ambiguous patch."
    ],
    "distinction": [
      "Bash phù hợp chạy test/build/commands có kiểm soát, không thay thế mọi tool file-specific. Trong dự án thật, tool exposure và permission phụ thuộc Claude Code/SDK runtime, không coi tên tool trong giáo trình là universal API guarantee.",
      "Bash runs controlled tests or build commands, but is not a general substitute for purpose-built file tools. Available tools and permissions depend on the Claude Code or SDK runtime; teaching examples are not universal API guarantees."
    ],
    "examTrap": [
      "Bẫy: Grep vs Glob đổi mục đích; dùng Write để thay toàn file khi chỉ cần sửa một đoạn; chạy Bash lệnh phá dữ liệu không có approval.",
      "Exam traps: swapping Grep and Glob, overwriting an entire file for a small change, or running destructive shell commands without approval."
    ]
  }
];
