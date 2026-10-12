import { TermText } from "./CourseGlossary";
import type { Locale } from "@/lib/bilingual-course";

type Story = {
  title: string; context: string; dayOne: string; problem: string;
  steps: [string,string,string]; codeBad: string; codeGood: string;
  badTitle: string; goodTitle: string;
  why: string; comparison: [string,string,string][]; columns:[string,string,string];
  traps: string[]; practice: string; note: string;
};

// Các tình huống dưới đây được tạo để GIẢI THÍCH các nguyên tắc trong guide.
// Tên khách hàng, file, giá và kết quả đều là minh họa, không phải research thực tế.
const scenarios: Record<number,Record<Locale,Story>> = {
  1:{
    vi:{
      title:"Một AI hỗ trợ bán hàng dừng giữa chừng — vì sao?",context:"Bạn xây website Next.js có chatbot hỏi giá. Người dùng hỏi: 'Một sản phẩm demo có giá bao nhiêu, nếu mua 3 cái thì tổng là bao nhiêu?' Claude có hai công cụ: lookup_demo_price (tra dữ liệu giả định) và calculate_demo_total (nhân giá với số lượng).",
      dayOne:"Claude trả lời 'Tôi sẽ tra giá' kèm yêu cầu tool_use. Ứng dụng thấy đoạn text và trả ngay cho người dùng mà chưa chạy tool. Người dùng chỉ nhận được lời hứa, không nhận được giá.",problem:"Lỗi không nằm ở khả năng tính toán của Claude, mà nằm ở ứng dụng chọn sai tín hiệu kết thúc. Cần đọc stop_reason của API và bổ sung tool_result vào history.",
      steps:["Claude nhận user messages và danh sách tools có input_schema; model tự chọn lookup_demo_price.","stop_reason = tool_use: ứng dụng chạy tool, lưu nguyên assistant tool_use rồi gửi user tool_result khớp tool_use_id.","Claude có giá mới quyết định gọi calculator. Khi stop_reason = end_turn, ứng dụng mới trả kết quả cuối."],
      codeBad:"// SAI: text có thể xuất hiện cùng tool_use\nif (response.content[0]?.type === 'text') {\n  return response.content[0].text;\n}",
      codeGood:"// ĐÚNG: dựa trên stop_reason\nif (response.stop_reason === 'tool_use') {\n  messages.push({ role: 'assistant', content: response.content });\n  const results = await executeRequestedTools(response.content);\n  messages.push({ role: 'user', content: results }); // tool_result + tool_use_id\n  // Gọi lại Messages API với messages đã cập nhật.\n} else if (response.stop_reason === 'end_turn') {\n  return response.content.filter(x => x.type === 'text');\n} else {\n  // Xử lý riêng max_tokens, pause_turn, refusal...\n}",
      badTitle:"Lỗi dừng sớm",goodTitle:"Điều khiển đúng theo API",why:"Đoạn code trên là khung logic, không phải chương trình hoàn chỉnh. Trong live lab, tool được thực thi bằng handler ở Node.js và usage lấy từ response.usage. Cần validate tool input, không dùng eval() cho chuỗi do model sinh ra.",
      columns:["Lựa chọn","Kết quả","Lý do"],comparison:[["Dựa vào nội dung text","Có thể dừng sớm","Một response có cả text và tool_use"],["Dùng số vòng cố định","Không xác định được đã hoàn tất","Iteration cap chỉ là safety net"],["Kiểm tra stop_reason","Đúng cơ chế","tool_use tiếp tục, end_turn hoàn tất"]],
      traps:["Không lấy câu 'I'm done' làm tín hiệu hoàn thành.","Không ép tool_choice = any chỉ để model luôn gọi tool.","Không coi max_tokens, pause_turn hoặc refusal là tool_use."],practice:"Chạy npm run lab -- 1: theo dõi thứ tự API REQUEST → tool_use → TOOL RUN → tool_result → end_turn và token usage.",note:"Liên hệ Lesson 1.4: với thao tác tiền thật, cho dù Claude chọn tool đúng, code vẫn cần gate để kiểm soát quyền thực thi."
    },
    en:{
      title:"Why did a shopping assistant stop before finishing?",context:"A Next.js shop has a chatbot. A user asks for a demo product price and the total for three items. Claude can request lookup_demo_price and calculate_demo_total.",
      dayOne:"Claude responds with 'I will check the price' and a tool_use block. The application sees the text and returns immediately, before executing the tool.",problem:"This is an application control-flow bug. The completion signal is stop_reason, not the presence of text.",
      steps:["Send conversation history and tool definitions with input_schema.","On tool_use, execute the requested client tools, append assistant tool_use plus user tool_result with the matching IDs, then call Claude again.","Only treat end_turn as normal completion; handle other stop reasons separately."],
      codeBad:"// WRONG: text may coexist with tool_use\nif (response.content[0]?.type === 'text') return response.content[0].text;",
      codeGood:"// RIGHT: use stop_reason\nif (response.stop_reason === 'tool_use') {\n  messages.push({ role: 'assistant', content: response.content });\n  const results = await executeRequestedTools(response.content);\n  messages.push({ role: 'user', content: results });\n} else if (response.stop_reason === 'end_turn') {\n  return response.content.filter(x => x.type === 'text');\n} else { /* handle pause_turn, max_tokens, refusal... */ }",
      badTitle:"Premature termination",goodTitle:"Correct loop control",why:"This is a conceptual snippet. The runnable Node CLI validates tool inputs, executes tool handlers, and prints actual response usage. Never use eval() on model-produced expressions.",
      columns:["Approach","Outcome","Why"],comparison:[["Check text","May stop too early","Text can accompany tool_use"],["Fixed iteration count","Does not prove completion","A cap is a safety bound"],["Check stop_reason","Correct signal","tool_use continues; end_turn finishes"]],
      traps:["Do not parse 'I'm done' for completion.","Do not force tool_choice: any to keep a loop alive.","Handle non-basic API stop reasons separately."],practice:"Run npm run lab -- 1 and inspect the request, tool call, tool result, end_turn and token usage logs.",note:"Lesson 1.4 extends this model-driven loop with mandatory business execution gates."
    }
  },
  2:{
    vi:{
      title:"Nghiên cứu sáu chủ đề nhưng báo cáo chỉ có hai",context:"Bạn cần hệ AI nghiên cứu năng lượng: solar, wind, geothermal, tidal, biomass và fusion theo scope của ví dụ trong guide. Coordinator chỉ giao hai việc: tấm pin mặt trời và turbine gió. Hai specialist hoàn thành tốt nhiệm vụ đã nhận.",
      dayOne:"Báo cáo cuối rất chi tiết về solar và wind, nhưng thiếu những category chưa từng được giao. Tăng model hay thêm agent mà vẫn giữ scope sai sẽ không giải quyết được nguyên nhân.",problem:"Đây là narrow decomposition (phân rã phạm vi quá hẹp) của coordinator, không phải lỗi riêng của synthesis agent.",
      steps:["Coordinator đọc yêu cầu gốc, chia đủ breadth thành các subtopics bổ sung nhau; đánh dấu phạm vi chưa giao.","Chọn đúng specialist cho từng phần, chuyển goal và context tường minh qua hub; không giả định có shared memory.","Gộp findings, đánh giá coverage, giao targeted refinement cho phần thiếu rồi mới hoàn thiện báo cáo."],
      codeBad:"// SAI: chỉ giao hai phần trong yêu cầu sáu phần\nconst tasks = ['solar', 'wind'];\n// Không specialist nào được giao geothermal/tidal/biomass/fusion.",
      codeGood:"// ĐÚNG: scope được kiểm tra trước khi giao việc\nconst required = ['solar','wind','geothermal','tidal','biomass','fusion'];\nconst tasks = required.map(topic => ({ topic, goal: originalRequest }));\nconst findings = await Promise.all(tasks.map(task => research(task)));\nconst missing = required.filter(topic => !hasEvidenceFor(topic, findings));\n// hasEvidenceFor phải kiểm tra evidence, không chỉ keyword.\nfor (const topic of missing) findings.push(await research({topic, goal: originalRequest}));",
      badTitle:"Decomposition quá hẹp",goodTitle:"Coverage + refinement",why:"Fusion xuất hiện trong phạm vi tình huống của guide; điều đó không có nghĩa fusion mặc nhiên được phân loại là năng lượng tái tạo. hasEvidenceFor là một hàm kiểm chứng cần tự xây dựng, không phải API có sẵn.",
      columns:["Tình huống","Nơi cần sửa","Giải thích"],comparison:[["Thiếu cả một category","Coordinator decomposition","Không ai từng được giao"],["Có category nhưng nông","Specialist prompt / retrieval","Đã được giao nhưng phân tích yếu"],["Findings đủ nhưng report thiếu","Synthesis / handoff","Thông tin bị mất sau bước nghiên cứu"]],
      traps:["Hub-and-spoke trong đề thi yêu cầu luồng thông tin qua coordinator.","Một invocation không tự kế thừa toàn bộ lịch sử coordinator.","Model tự báo coverage 100% không phải bằng chứng nguồn đã chính xác."],practice:"Chạy npm run lab -- 2 để xem specialist calls, tổng hợp và heuristic coverage; dùng nguồn thật mới có thể xác minh claim.",note:"Liên hệ Lesson 1.3: coordinator phải giữ findings và metadata trong các lần bàn giao."
    },
    en:{
      title:"Six requested research categories, only two in the report",context:"A coordinator must cover solar, wind, geothermal, tidal, biomass and fusion in the guide's example. It delegates only solar and wind. Specialists perform their assigned work well.",
      dayOne:"The report is detailed on the assigned subjects but omits entire unassigned categories. Increasing model power cannot repair an incomplete delegation plan.",problem:"The root cause is narrow coordinator decomposition, not a downstream synthesis failure.",
      steps:["Partition the full requested scope into distinct subtopics.","Select the necessary specialists and pass explicit goal, constraints and context through the coordinator.","Audit coverage against the original request and re-delegate missing topics."],
      codeBad:"// WRONG: incomplete breadth\nconst tasks = ['solar', 'wind'];",
      codeGood:"// RIGHT: plan full breadth, then refine gaps\nconst required=['solar','wind','geothermal','tidal','biomass','fusion'];\nconst tasks=required.map(topic=>({topic,goal:originalRequest}));\nconst findings=await Promise.all(tasks.map(research));\nconst gaps=required.filter(topic=>!hasEvidenceFor(topic,findings));\nfor(const topic of gaps) findings.push(await research({topic,goal:originalRequest}));",
      badTitle:"Narrow decomposition",goodTitle:"Coverage and refinement",why:"Fusion is included in the guide's scenario scope; this does not classify fusion as renewable energy. hasEvidenceFor is application logic, not an SDK API.",
      columns:["Symptom","Investigate","Reason"],comparison:[["Entire category missing","Coordinator decomposition","Task never assigned"],["Assigned topic shallow","Specialist context/retrieval","Research lacks depth"],["Evidence present but report incomplete","Synthesis or handoff","Data was lost downstream"]],
      traps:["The exam's strict hub-and-spoke design routes inter-agent findings through the coordinator.","Do not assume shared memory across independent invocations.","A model-assessed coverage percentage does not validate source evidence."],practice:"Run npm run lab -- 2 and inspect specialist, aggregation and coverage logs.",note:"Lesson 1.3 explains how the coordinator preserves findings and metadata during handoff."
    }
  },
  3:{
    vi:{
      title:"Hai researcher có nguồn nhưng báo cáo không có citations",context:"Coordinator giao Web Research tìm bài công khai và Document Research kiểm tra tài liệu nội bộ. Mỗi agent trả về claim, analysis, source_url hoặc document_name và page_number. Synthesis sẽ viết báo cáo có dẫn nguồn.",
      dayOne:"Coordinator chỉ truyền đoạn claim sang Synthesis, bỏ các trường nguồn. Kết quả cuối có thể viết trôi chảy nhưng không còn dữ liệu để gắn citations cho từng nhận định.",problem:"Đây là attribution failure tại bước handoff: phải chuyển đầy đủ findings có cấu trúc, không chỉ nội dung text.",
      steps:["Khai báo specialist với description, prompt và tools; trong guide là Task, công cụ hiện tại thường mang tên Agent.","Spawn các research tasks độc lập song song, chỉ truyền explicit context mà từng agent cần.","Coordinator thu structured findings và bàn giao cả nội dung lẫn metadata; synthesis chạy sau khi nhận đầy đủ kết quả."],
      codeBad:"// SAI: xóa metadata trước khi tổng hợp\nconst transferred = findings.map(({ claim }) => ({ claim }));\n// Không có source_url, document_name, page_number.",
      codeGood:"// ĐÚNG: giữ evidence và vị trí nguồn\nconst transferred = findings.map(f => ({\n  claim: f.claim, analysis: f.analysis,\n  source_url: f.source_url, document_name: f.document_name,\n  page_number: f.page_number, retrieved_by: f.retrieved_by\n}));\nconst report = await synthesize({ findings: transferred });",
      badTitle:"Bàn giao thiếu metadata",goodTitle:"Bàn giao structured findings",why:"Ví dụ chỉ minh họa payload. Có URL không đồng nghĩa nội dung nguồn đã được xác minh. Promise.all trong CLI là nhiều Messages API calls, không tự trở thành Claude Agent SDK Agent tool.",
      columns:["Thuật ngữ","Nghĩa","Áp dụng"],comparison:[["Spawn","Khởi tạo/giao việc cho agent phụ","Research độc lập có thể parallel"],["Findings","Kết quả phát hiện có chứng cứ","Pass đầy đủ cho synthesis"],["Citations","Dẫn nguồn cho claim","Cần URL, tài liệu hoặc trang"]],
      traps:["Subagent không tự kế thừa kết quả của agent khác.","Parallel spawning chỉ dành cho các bước independent.","Resume/fork session không đồng nghĩa spawn subagent."],practice:"Chạy npm run lab -- 3 và npm run lab -- 3 --bad; so sánh metadata trong log handoff và kết quả tổng hợp.",note:"Liên hệ Lesson 1.2: coordinator quyết định ai làm gì. Lesson 1.3 quyết định chuyển những dữ liệu nào cho bước sau."
    },
    en:{
      title:"Research agents have sources, but the report lacks citations",context:"Web and document researchers produce claims with source_url, document_name and page_number. The coordinator must pass that evidence to synthesis.",
      dayOne:"The coordinator forwards only the claim text and strips the source fields. Synthesis cannot reliably attach citations to the assertions.",problem:"This is attribution failure at the handoff boundary, not necessarily a model capability problem.",
      steps:["Define specialists using description, prompt and tool restrictions.","Spawn independent research tasks in parallel with explicit context.","Pass complete structured findings, including metadata, to dependent synthesis."],
      codeBad:"// WRONG: source metadata is lost\nconst transferred = findings.map(({claim})=>({claim}));",
      codeGood:"// RIGHT: preserve source fields\nconst transferred=findings.map(f=>({\n claim:f.claim, analysis:f.analysis,\n source_url:f.source_url,document_name:f.document_name,\n page_number:f.page_number,retrieved_by:f.retrieved_by\n}));\nconst report=await synthesize({findings:transferred});",
      badTitle:"Lost attribution",goodTitle:"Structured handoff",why:"An attached URL enables attribution but does not independently verify a claim. Parallel Messages API calls are a simulation of coordination, not Agent tool invocations.",
      columns:["Term","Meaning","Application"],comparison:[["Spawn","Initiate a subagent task","Independent work can run concurrently"],["Findings","Evidence-backed research results","Preserve during handoff"],["Citations","References supporting claims","Need source metadata"]],
      traps:["Independent subagents do not inherit each other's context.","Parallelize only independent work.","Forking a session is not the same as spawning an agent."],practice:"Run npm run lab -- 3 with and without --bad and compare handoff logs.",note:"Lesson 1.2 determines who works on each task; Lesson 1.3 specifies what the coordinator passes on."
    }
  },
  4:{
    vi:{
      title:"Một AI hoàn tiền trước khi xác minh khách",context:"Một chatbot cửa hàng có các tool get_customer, lookup_order và process_refund. Prompt yêu cầu phải xác minh danh tính trước khi hoàn tiền. Nhưng đôi khi model đề xuất process_refund trước.",
      dayOne:"Nếu ứng dụng tin prompt và thực thi mọi tool call, có thể tạo giao dịch khi chưa được phép. Thêm lời nhắc vào prompt có thể giảm rủi ro nhưng không tạo ra điều kiện bắt buộc.",problem:"Bước xác minh là prerequisite. Phải thiết lập gate trong tool handler/backend trước side effect. Handoff cho nhân viên phải đủ ngữ cảnh để không phải đoán.",
      steps:["Model đề xuất tool call, nhưng application kiểm tra verifiedCustomerId trong trusted session state.","Nếu thiếu verification, trả lỗi có cấu trúc và không xử lý refund; agent có thể gọi tool xác minh rồi thử lại.","Nếu cần human escalation, tạo handoff chứa customer ID, yêu cầu, những bước đã thử, nguyên nhân và hành động tiếp theo."],
      codeBad:"// SAI: chỉ nhắc model mà không kiểm tra phía ứng dụng\nif (tool.name === 'process_refund') return paymentService.refund(tool.input);",
      codeGood:"// ĐÚNG: chặn trước side effect\nfunction processRefund(session, customerId, amount) {\n  if (session.verifiedCustomerId !== customerId) {\n    return {ok:false,error:'VERIFY_CUSTOMER_FIRST'};\n  }\n  if (!Number.isFinite(amount) || amount <= 0) {\n    return {ok:false,error:'INVALID_AMOUNT'};\n  }\n  return {ok:true,status:'APPROVED_IN_DEMO'}; // không chuyển tiền thật\n}",
      badTitle:"Prompt-only compliance",goodTitle:"Application prerequisite gate",why:"Chỉ kiểm tra verification trong session chưa đủ cho production: backend còn phải xác thực user đang đăng nhập, quyền đối với khách/đơn và chính sách hoàn tiền. Snippet này cố tình không thực hiện giao dịch thật.",
      columns:["Yêu cầu","Cách xử lý","Tại sao"],comparison:[["Markdown style","Prompt hướng dẫn","Ít rủi ro"],["Hoàn tiền / dữ liệu nhạy cảm","Gate + backend authorization","Không thể dựa vào hành vi model"],["Chuyển cho human","Structured handoff","Người tiếp nhận cần đủ thông tin"]],
      traps:["Routing classifier không thay thế precondition gate.","PostToolUse chạy quá muộn để ngăn một side effect đã xảy ra.","Yêu cầu nhiều concern cần phân rã và tổng hợp đủ tất cả phần."],practice:"Chạy npm run lab -- 4: quan sát BLOCKED trước verification, sau đó trạng thái APPROVED_IN_DEMO; không có payment API thật.",note:"Liên hệ Lesson 1.5: PreToolUse là điểm can thiệp trước tool, nhưng không thay authorization ở backend."
    },
    en:{
      title:"A support agent refunds before verifying a customer",context:"A shop assistant can call get_customer and process_refund. The prompt asks it to verify identity first, but the model occasionally proposes the refund before verification.",
      dayOne:"Executing every requested tool without an application guard may create an unauthorized transaction. Stronger prompt instructions do not guarantee execution order.",problem:"Verification is a prerequisite. Enforce it at the tool handler/backend boundary before any side effect, and prepare a self-contained handoff for human escalation.",
      steps:["Read trusted verified customer identity from session state.","Block unverified refund calls with a structured error before executing any payment operation.","Return an actionable human handoff if the request requires manual review."],
      codeBad:"// WRONG: trust the prompt alone\nif (tool.name === 'process_refund') return paymentService.refund(tool.input);",
      codeGood:"// RIGHT: check prerequisite before side effect\nfunction processRefund(session,customerId,amount){\n if(session.verifiedCustomerId!==customerId) return {ok:false,error:'VERIFY_CUSTOMER_FIRST'};\n if(!Number.isFinite(amount)||amount<=0) return {ok:false,error:'INVALID_AMOUNT'};\n return {ok:true,status:'APPROVED_IN_DEMO'};\n}",
      badTitle:"Prompt-only enforcement",goodTitle:"Deterministic gate",why:"Real financial systems must additionally authorize the signed-in user, order ownership and refund policy. This example performs no real payments.",
      columns:["Requirement","Approach","Reason"],comparison:[["Markdown style","Prompt guidance","Low risk"],["Refund or sensitive action","Gate + backend authorization","Mandatory invariant"],["Human escalation","Structured handoff","Actionable context"]],
      traps:["Routing does not enforce execution prerequisites.","PostToolUse is too late to prevent a completed side effect.","Multi-concern requests must address every concern."],practice:"Run npm run lab -- 4 to inspect pre-verification denial and simulated approval.",note:"Lesson 1.5 explains pre-execution interception using PreToolUse; backend checks remain necessary."
    }
  },
  5:{
    vi:{
      title:"Ba MCP tools trả ngày và trạng thái khác nhau",context:"Ứng dụng tra cứu vận chuyển từ ba service: Tool A trả Unix timestamp và status 200, Tool B trả ISO string và 'active', Tool C trả DD/MM/YYYY và mã 'P'. Claude cần tổng hợp báo cáo một định dạng nhất quán.",
      dayOne:"Nếu chỉ yêu cầu model tự suy đoán mọi kiểu dữ liệu, ngày 12/10 có thể bị hiểu thành tháng 12 ngày 10 và status của các nguồn bị gán sai. Thêm vào đó, giao dịch cần được chặn trước khi xảy ra, không phải sau khi có kết quả.",
      problem:"PreToolUse kiểm soát tool call trước execution; PostToolUse xử lý tool output sau execution nhưng trước khi model nhận. Đây là hai vị trí khác nhau trong lifecycle.",
      steps:["Đăng ký PreToolUse cho tool nhạy cảm để quyết định allow/deny hoặc kiểm tra updatedInput.","Thực thi tool được phép; PostToolUse đọc raw output và chuẩn hóa date/status theo contract của từng nguồn.","Truyền updatedToolOutput đến Claude. Không dùng PostToolUse để rollback chuyển tiền đã chạy."],
      codeBad:"// SAI: định chặn sau khi transfer đã chạy\nasync function postToolUse({tool_response}) {\n  if (tool_response.amount > limit) return {blocked:true};\n}",
      codeGood:"// HÌNH DUNG Agent SDK callback (cấu hình hooks xem live SDK lab)\n// PRE — trước side effect:\nreturn {hookSpecificOutput:{\n  hookEventName:'PreToolUse',permissionDecision:'deny',\n  permissionDecisionReason:'AML verification missing'\n}};\n// POST — sau tool, chuẩn hóa output cho model:\nreturn {hookSpecificOutput:{\n  hookEventName:'PostToolUse',updatedToolOutput:normalizedResult\n}};",
      badTitle:"Chặn quá muộn",goodTitle:"Pre để chặn, Post để chuẩn hóa",why:"Hai return trên thuộc hai callback khác nhau, không nằm trong cùng hàm. Snippet minh họa cấu trúc output hook; code chạy SDK thực tế ở scripts/sdk-hooks-lab.mjs. Backend vẫn cần policy enforcement.",
      columns:["Thời điểm","Hook","Việc phù hợp"],comparison:[["Trước tool chạy","PreToolUse","Policy, approval, deny"],["Sau tool chạy","PostToolUse","Normalize output, thêm context"],["Trước nén context","PreCompact","Quan sát/lưu context (phần bổ sung)"]],
      traps:["updatedToolOutput là trường hiện tại để thay output của PostToolUse.","Không dùng Date.parse cho DD/MM/YYYY nếu chưa xác định contract.","Không đánh đồng ứng dụng tự intercept Messages API với hook thật của Agent SDK."],practice:"Chạy npm run lab -- 5 để xem middleware analogy; tiếp đó chạy npm run lab:sdk-hooks để quan sát PreToolUse/PostToolUse thật.",note:"Liên hệ Lesson 1.4: gate là quy tắc nghiệp vụ; hook là một vị trí trong vòng đời để áp dụng quy tắc."
    },
    en:{
      title:"Three tools return incompatible dates and statuses",context:"Shipping tools return Unix timestamps, ISO strings or DD/MM/YYYY, alongside service-specific status codes. The assistant needs consistent output and safe action boundaries.",
      dayOne:"Relying on the model to guess ambiguous dates or status codes may produce incorrect reports. A tool that transfers funds cannot be blocked after execution.",problem:"PreToolUse intercepts tool requests before execution. PostToolUse can normalize results after execution and before model consumption.",
      steps:["Use PreToolUse to inspect and deny unsafe tool calls.","Run permitted tools and normalize their output with source-specific parsers in PostToolUse.","Send the normalized updatedToolOutput to the model; never assume PostToolUse rolls back side effects."],
      codeBad:"// WRONG: trying to stop a transfer after execution\nasync function postToolUse({tool_response}) {\n if(tool_response.amount>limit) return {blocked:true};\n}",
      codeGood:"// Illustrative output from TWO separate SDK callbacks\nreturn {hookSpecificOutput:{hookEventName:'PreToolUse',permissionDecision:'deny',permissionDecisionReason:'AML missing'}};\n// In a different PostToolUse callback:\nreturn {hookSpecificOutput:{hookEventName:'PostToolUse',updatedToolOutput:normalizedResult}};",
      badTitle:"Too late to block",goodTitle:"Prevent before; normalize after",why:"The two return statements illustrate different hook callbacks, not one executable function. Use the dedicated Agent SDK lab for a real registered hook example.",
      columns:["When","Hook","Purpose"],comparison:[["Before tool","PreToolUse","Policy and deny"],["After tool","PostToolUse","Normalize output"],["Before compaction","PreCompact","Context lifecycle supplement"]],
      traps:["Use updatedToolOutput in modern PostToolUse.","Do not guess day/month order from ambiguous formats.","A handcrafted Messages API interceptor is not automatically an SDK hook."],practice:"Run npm run lab -- 5 for the application analogy and npm run lab:sdk-hooks for registered SDK hooks.",note:"Lesson 1.4 defines the prerequisite gate; hooks offer a lifecycle interception point."
    }
  },
  6:{
    vi:{
      title:"Review 14 file: file đầu được phân tích sâu, file cuối bị qua loa",context:"Bạn dùng AI review 14 file React/Next.js cùng một lần. File 1–5 có bug, line references và severity cụ thể; file 10–14 chỉ nhận xét chung. Một pattern được coi là lỗi ở file 3 nhưng lại bị bỏ qua ở file 11.",
      dayOne:"Tăng context window hoặc đổi sang model mạnh hơn không bảo đảm mọi file được đánh giá đồng đều. Chia 14 file thành ba batch nhưng quên so sánh giữa các batch cũng có thể bỏ sót lỗi giữa modules.",
      problem:"Đây là attention dilution. Cần per-file local passes để giữ độ sâu, tiếp theo là cross-file integration pass để phát hiện sự thiếu nhất quán và dependency.",
      steps:["Chọn fixed pipeline khi đầu vào/đầu ra và các stage đã rõ; chọn dynamic decomposition khi debugging chưa rõ phạm vi.","Chạy local review cho mỗi file và trả findings có cấu trúc: file, vị trí, severity, evidence và đề xuất.","Chờ tất cả local passes rồi chạy integration pass đối chiếu imports, API contracts và mâu thuẫn giữa các file."],
      codeBad:"// SAI: một prompt duy nhất ôm tất cả\nconst report = await reviewAll(files.join('\\n'));\n// Dễ bị đánh giá nông và thiếu consistency.",
      codeGood:"// ĐÚNG: local + integration\nconst local = await Promise.all(files.map(async file => ({\n  file:file.name, findings:await reviewOne(file)\n})));\nconst crossFile = await compareAcrossFiles(local);\nreturn {local,crossFile};",
      badTitle:"Single-pass overload",goodTitle:"Multi-pass review",why:"reviewOne và compareAcrossFiles là các hàm do ứng dụng triển khai bằng Claude API; không phải function có sẵn trong SDK. Các local passes độc lập có thể parallel; integration phải chờ.",
      columns:["Loại nhiệm vụ","Chiến lược","Lý do"],comparison:[["Extract trường theo schema rõ","Fixed sequential pipeline","Các bước dự đoán được"],["Debug legacy system chưa biết nguyên nhân","Dynamic adaptive decomposition","Phát hiện mới có thể đổi plan"],["Review nhiều file","Local passes + integration","Giữ depth và cross-file consistency"]],
      traps:["Batching mà thiếu integration không phát hiện hết cross-file issues.","Không đánh đồng số findings nhiều hơn với quality cao hơn.","Attention dilution là nguy cơ thường gặp, không phải kết luận mọi single-pass đều sai."],practice:"Chạy npm run lab -- 6 để xem các local reviews song song, rồi integration call cùng token usage của từng request.",note:"Liên hệ Lesson 1.2: coordinator quyết định scope; Lesson 1.3 truyền structured findings cho integration."
    },
    en:{
      title:"A 14-file review is detailed early but shallow later",context:"An AI reviews 14 React/Next.js files in one prompt. Files 1–5 receive precise bugs and severities, while files 10–14 get generic comments. Identical patterns receive inconsistent judgments.",
      dayOne:"Increasing model size or batching without integration does not guarantee cross-file consistency. Bugs spanning modules can remain unseen.",problem:"This is attention dilution. Use per-file local passes followed by dedicated cross-file integration.",
      steps:["Choose fixed pipelines for known stages and adaptive decomposition for evolving unknown scope.","Review each file locally and capture structured findings.","After local reviews finish, compare API contracts, data flow and conflicting judgments across files."],
      codeBad:"// WRONG: a single overloaded prompt\nconst report=await reviewAll(files.join('\\n'));",
      codeGood:"// RIGHT: local pass then integration\nconst local=await Promise.all(files.map(async file=>({file:file.name,findings:await reviewOne(file)})));\nconst crossFile=await compareAcrossFiles(local);\nreturn {local,crossFile};",
      badTitle:"Single-pass overload",goodTitle:"Multi-pass review",why:"reviewOne and compareAcrossFiles are application functions, not built-in SDK calls. Independent local passes may run concurrently; integration waits for their results.",
      columns:["Task","Strategy","Why"],comparison:[["Fixed-schema extraction","Fixed pipeline","Predictable stages"],["Unfamiliar legacy debugging","Adaptive decomposition","Plan may evolve"],["Many-file review","Local + integration","Depth and consistency"]],
      traps:["Batching without integration can miss cross-file issues.","Issue count alone is not a quality metric.","Attention dilution is a risk, not an inevitable outcome of every single pass."],practice:"Run npm run lab -- 6 to inspect local parallel reviews and dependent integration logs.",note:"Lesson 1.2 covers scope planning; Lesson 1.3 covers passing structured findings to synthesis."
    }
  }
};

export function LessonStory({number,language}:{number:number;language:Locale}){
  const story=scenarios[number]?.[language];if(!story)return null;
  const vi=language==="vi";
  const render=(value:string)=><TermText text={value} number={number} active={vi}/>;
  return <section className="lesson-story" aria-label={vi?"Ví dụ xuyên suốt và phân tích tình huống":"Worked scenario and architectural decisions"}>
    <div className="section-heading"><span>{vi?"VÍ DỤ XUYÊN SUỐT · NHƯ LESSON 1.7":"WORKED EXAMPLE · LIKE LESSON 1.7"}</span>
      <h2>{story.title}</h2></div>
    <div className="lesson-story-timeline">
      <div><span>01</span><h3>{vi?"Bối cảnh thực tế":"Practical context"}</h3><p>{render(story.context)}</p></div>
      <div><span>02</span><h3>{vi?"Điều đã xảy ra":"What happened"}</h3><p>{render(story.dayOne)}</p></div>
      <div><span>03</span><h3>{vi?"Nguyên nhân gốc cần hiểu":"Root cause"}</h3><p>{render(story.problem)}</p></div>
    </div>
    <div className="section-heading"><span>{vi?"TỪNG BƯỚC VẬN HÀNH":"STEP-BY-STEP FLOW"}</span>
      <h2>{vi?"Hệ thống nên xử lý như thế nào?":"How should the system work?"}</h2></div>
    <ol className="lesson-story-steps">{story.steps.map((step,i)=><li key={i}><b>{String(i+1).padStart(2,"0")}</b><p>{render(step)}</p></li>)}</ol>
    <div className="lesson-story-code-grid">
      <div><h3>{story.badTitle}</h3><div className="pattern-code"><div><span>{vi?"ANTI-PATTERN / SAI":"ANTI-PATTERN / WRONG"}</span></div><pre>{story.codeBad}</pre></div></div>
      <div><h3>{story.goodTitle}</h3><div className="pattern-code"><div><span>{vi?"BETTER PATTERN / ĐÚNG":"BETTER PATTERN"}</span></div><pre>{story.codeGood}</pre></div></div>
    </div>
    <p className="lesson-story-boundary">{render(story.why)}</p>
    <div className="section-heading"><span>{vi?"SO SÁNH ĐỂ NHỚ KHI THI":"EXAM DECISION TABLE"}</span>
      <h2>{vi?"Nhìn tình huống để chọn giải pháp":"Choose the solution by symptom"}</h2></div>
    <div className="lesson7-table-wrap"><table>
      <thead><tr>{story.columns.map((c,i)=><th key={i}>{c}</th>)}</tr></thead>
      <tbody>{story.comparison.map((row,i)=><tr key={i}>{row.map((cell,j)=>j===0?<th scope="row" key={j}>{render(cell)}</th>:<td key={j}>{render(cell)}</td>)}</tr>)}</tbody>
    </table></div>
    <section className="lesson-story-traps"><h3>{vi?"Những bẫy dễ sai trong đề":"Common exam traps"}</h3>
      <ul>{story.traps.map((trap,i)=><li key={i}>{render(trap)}</li>)}</ul></section>
    <p className="lesson-story-practice"><strong>{vi?"Khi chạy code":"When you run the code"}:</strong> {story.practice}</p>
    <p className="lesson-story-related"><strong>{vi?"Liên hệ bài học":"Cross-lesson connection"}:</strong> {render(story.note)}</p>
  </section>;
}
