export type LessonExamQuestion = {
  question: string;
  choices: [string, string, string, string];
  correct: number;
  explanation: string;
};

export type LessonSection = {
  heading: string;
  keywords: string;
  body: string;
  bullets?: string[];
  snippet?: string;
  warning?: string;
};

export type CourseLesson = {
  number: number;
  label: string;
  slug: string;
  title: string;
  headline: string;
  summary: string;
  related: string;
  pillars: [string, string][];
  sections: LessonSection[];
  traps: string[];
  questions: LessonExamQuestion[];
  exerciseTitle: string;
  duration: string;
  exerciseSteps: string[];
  practiceCode: string;
  source: string;
  extraSource?: string;
};

export const lessons: Record<number, CourseLesson> = {
  4: {
    number: 4, label: "1.4", slug: "workflow-enforcement-handoff",
    title: "Workflow Enforcement & Handoff",
    headline: "Khi một sai sót có thể mất tiền hoặc vi phạm quy định, lời nhắc không đủ: hãy chặn bằng code trước khi tool chạy.",
    summary: "Prompt hướng dẫn theo xác suất; prerequisite gate kiểm tra điều kiện trước khi cho phép tool gây tác động thực thi. Bàn giao cho con người phải tự chứa đầy đủ thông tin.",
    related: "Liên hệ 1.1–1.3: vòng lặp tool_use vẫn do model đề xuất (1.1), coordinator điều phối (1.2), và dữ liệu phải chuyển explicit (1.3). Ở 1.4, application code kiểm soát bước nào được thực thi thật.",
    pillars: [["Prompt ≠ Gate", "Prompt không bảo đảm một bước bắt buộc luôn được tuân thủ."], ["Verification → Refund", "Refund bị từ chối nếu chưa xác minh đúng khách hàng trong phiên."], ["Self-contained handoff", "Người nhận không cần mở lại lịch sử chat để hiểu vấn đề."]],
    sections: [
      { heading: "Enforcement spectrum: xác suất và tất định", keywords: "prompt guidance · programmatic enforcement", body: "System prompt, few-shot và nhắc nhở có thể nâng tỉ lệ tuân thủ nhưng vẫn có rủi ro bỏ bước. Với tài chính, bảo mật và compliance, điều kiện phải được kiểm tra ở boundary thực thi: tool handler, permission layer hoặc PreToolUse. Sự bảo đảm chỉ đúng đối với đường thực thi được kiểm soát, cần chống bypass và test.", bullets: ["Low-stakes: văn phong, markdown → prompt có thể đủ.", "High-stakes: refund, chuyển tiền, xác minh định danh, AML → gate phía code.", "Đừng dựa vào câu model nói “đã xác minh” để cấp quyền."], warning: "Các con số 92%/8% trong bài nguồn là scenario minh họa, không phải tỉ lệ chung của mọi model." },
      { heading: "Prerequisite gate và trạng thái phiên", keywords: "session-level state · fail closed · verified customer ID", body: "Tool process_refund phải kiểm tra một trạng thái xác thực đáng tin: customer ID đã được verify trong đúng session, user hiện tại được phép tác động lên customer đó, số tiền hợp lệ. Nếu thiếu điều kiện, return blocked error. Không đưa auth flag do LLM tự khai vào gate.", snippet: "// Minh họa application-layer gate, không gọi API thật\nfunction processRefund(session, customerId, amount) {\n  if (session.verifiedCustomerId !== customerId) {\n    return { ok: false, error: 'VERIFY_CUSTOMER_FIRST' };\n  }\n  if (!Number.isFinite(amount) || amount <= 0) {\n    return { ok: false, error: 'INVALID_AMOUNT' };\n  }\n  return { ok: true, status: 'AUTHORIZED_FOR_PROCESSING' };\n}" },
      { heading: "Workflow ordering là code, không phải lời hứa", keywords: "precondition · control boundary", body: "Ngay cả khi Claude gọi refund trước khi gọi get_customer, gate vẫn chặn. Agent có thể nhận phản hồi và gọi xác minh rồi thử lại; gate vẫn phải kiểm tra từng lần thực thi. Guard phải nằm ở nơi mà mọi đường thực thi giao dịch đều đi qua.", bullets: ["Model đề xuất tool call.", "Application xác thực, phân quyền, áp gate.", "Nếu qua được gate mới cho tool chạy; nếu không trả lỗi có cấu trúc."] },
      { heading: "Multi-concern requests", keywords: "decompose · parallel investigation · unified synthesis", body: "Một khách hàng đồng thời hỏi trả hàng, cập nhật địa chỉ và điểm thưởng. Tách thành 3 yêu cầu, chia sẻ customer context được phép, điều tra độc lập song song rồi tổng hợp thành một câu trả lời; các thao tác gây thay đổi phải qua gate của riêng chúng.", warning: "Không phải mọi bước đều có thể chạy song song: thay đổi trạng thái phụ thuộc nhau hoặc yêu cầu approval phải đi tuần tự." },
      { heading: "Structured human handoff", keywords: "self-contained escalation · root cause · recommended action", body: "Người hỗ trợ tiếp theo có thể không thấy transcript. Coordinator phải tạo payload đủ ngữ cảnh: customer ID, tóm tắt yêu cầu + bước đã thử, root cause/giả thuyết, refund amount nếu có, recommended action và tình trạng verification.", snippet: "const handoff = {\n  customerId: 'C-101',\n  summary: 'Khách cần hoàn đơn, đổi địa chỉ, kiểm tra điểm',\n  rootCause: 'Refund cần phê duyệt thủ công',\n  refundAmount: 250000, // VND, dữ liệu demo\n  recommendedAction: 'Kiểm tra đơn và xét duyệt hoàn tiền'\n};" },
      { heading: "Subagent lifecycle hooks (phần bổ sung)", keywords: "SubagentStart · SubagentStop · PreToolUse(Agent)", body: "SubagentStart ghi nhận khởi tạo và có thể thêm additionalContext, không chặn spawn trực tiếp; để chặn chính lời gọi Agent, dùng PreToolUse matcher Agent. SubagentStop có thể kiểm tra output và ngăn việc dừng khi hỗ trợ cơ chế block. Không nhầm lifecycle hooks với thao tác tự động rewrite kết quả subagent.", warning: "Bài gốc đánh dấu mục này Beyond the guide — nên biết nhưng ưu tiên gate/handoff khi ôn Task 1.4." }
    ],
    traps: ["Nâng system prompt thay cho gate với refund nguy cơ cao.", "Dùng routing classifier để sửa lỗi trình tự bên trong agent.", "Giả định nhân viên tiếp nhận có thể tự đọc transcript.", "Cho process_refund chạy trước rồi mới kiểm tra ở PostToolUse.", "Quên xử lý các concern còn lại trong cùng yêu cầu."],
    questions: [
      { question: "Agent bỏ xác minh 8% trước refund. Phương án đúng?", choices: ["Thêm few-shot", "Chặn process_refund nếu chưa có verified ID", "Đổi model lớn hơn", "Chỉ phân loại request"], correct: 1, explanation: "Lỗi xảy ra ở thực thi, nên gate tất định tại tool boundary mới ngăn refund không hợp lệ." },
      { question: "Quy tắc định dạng câu trả lời theo Markdown nên dùng?", choices: ["Mandatory financial gate", "Block mọi tool", "Prompt instructions", "Human approval mỗi lần"], correct: 2, explanation: "Formatting là low-stakes, prompt guidance phù hợp." },
      { question: "Khách hỏi hoàn hàng, sửa địa chỉ và điểm thưởng: chọn luồng nào?", choices: ["Xử lý concern đầu", "Ba cuộc trò chuyện riêng", "Tách, điều tra parallel khi độc lập, tổng hợp thống nhất", "Refund trước rồi bỏ qua còn lại"], correct: 2, explanation: "Multi-concern handling cần decomposition, parallel investigation và unified response." },
      { question: "Handoff đến human không có transcript phải chứa gì?", choices: ["Chỉ tên khách", "Customer ID, summary, root cause, amount nếu có, action", "Chỉ nguyên văn một câu khách", "Chỉ tool logs"], correct: 1, explanation: "Handoff phải tự chứa thông tin cho người tiếp nhận hành động." },
      { question: "Một routing classifier có bảo đảm refund sau verification?", choices: ["Có", "Không; routing không chặn thứ tự nội bộ", "Có nếu nhiều agent", "Có khi prompt dài"], correct: 1, explanation: "Classifier định tuyến, gate kiểm soát prerequisite cho hành động." },
      { question: "Model gọi process_refund trực tiếp khi chưa verify, app nên?", choices: ["Thực thi rồi xin lỗi", "Deny và trả lỗi VERIFY_CUSTOMER_FIRST", "Tin model", "Đợi PostToolUse"], correct: 1, explanation: "Fail closed trước khi có side effect." },
      { question: "Muốn chặn một subagent được spawn bởi Agent tool, dùng?", choices: ["SubagentStart để block", "PreToolUse matcher Agent", "PostToolUse refund", "SubagentStop"], correct: 1, explanation: "SubagentStart không phải gate để chặn spawn; PreToolUse can intercept Agent invocation." },
      { question: "Khi nào xử lý các concern tuần tự?", choices: ["Luôn luôn", "Khi có dependency hoặc approval bắt buộc", "Khi có hơn 2 agent", "Không bao giờ"], correct: 1, explanation: "Parallel chỉ với nhiệm vụ độc lập; side-effect dependencies phải tuần tự." }
    ],
    exerciseTitle: "Prerequisite Gate & Structured Handoff", duration: "60 phút",
    exerciseSteps: ["Tạo ba tool schema: get_customer, lookup_order, process_refund.", "Lưu verified customer ID vào session trusted state.", "Chặn refund ở handler khi thiếu verification; test attempt bypass.", "Viết structured handoff object đủ 5 trường cốt lõi.", "Phân rã request nhiều concern, điều tra phần độc lập song song, tổng hợp một phản hồi."],
    practiceCode: "const session = { verifiedCustomerId: null };\nconsole.log(processRefund(session, 'C-101', 250000)); // BLOCKED\nsession.verifiedCustomerId = 'C-101'; // chỉ code verify mới được cập nhật\nconsole.log(processRefund(session, 'C-101', 250000)); // permitted",
    source: "https://claudecertificationguide.com/learn/1-agentic-architecture/1-4-workflow-enforcement-handoff",
    extraSource: "https://code.claude.com/docs/en/agent-sdk/hooks"
  },
  5: {
    number: 5, label: "1.5", slug: "agent-sdk-hooks", title: "Agent SDK Hooks",
    headline: "Đặt guard trước khi tool chạy; đặt normalizer sau khi tool có kết quả. Học đúng thời điểm can thiệp để không chặn quá muộn.",
    summary: "PreToolUse kiểm soát tool call trước execution; PostToolUse chuẩn hóa output sau khi tool chạy và trước khi Claude xử lý. Hook là điểm can thiệp bằng code; prompt chỉ là hướng dẫn.",
    related: "Liên hệ Lesson 1.4: prerequisite gate là nguyên tắc; PreToolUse là một cách hiện thực gate. Liên hệ 1.1: hook can thiệp tại boundary trong agentic tool loop. Liên hệ 1.3: normalizer giúp downstream agent nhận metadata nhất quán.",
    pillars: [["PRE / Prevent", "PreToolUse có thể deny, ask, allow hoặc defer trước side effect."], ["POST / Normalize", "PostToolUse dùng updatedToolOutput để dữ liệu nhất quán."], ["Boundary / Verify", "Hook không thay thế kiểm tra bảo mật tại backend thực thi."]],
    sections: [
      { heading: "PreToolUse: policy trước khi thực thi", keywords: "PreToolUse · permissionDecision · updatedInput", body: "Hook chạy trước tool. Có thể allow/deny/ask/defer, hoặc tạo updatedInput để sửa tham số tool. Với refund quá ngưỡng, AML chưa pass, hoặc discount thiếu manager approval, chặn ở đây chứ không đợi tool chạy rồi mới xử lý.", snippet: "// Pseudocode minh họa object callback Agent SDK\nreturn { hookSpecificOutput: {\n  hookEventName: 'PreToolUse',\n  permissionDecision: 'deny',\n  permissionDecisionReason: 'AML check not completed'\n} };", warning: "Ngoài hook, các tool/backend nhạy cảm vẫn phải xác minh điều kiện thật, vì security boundary không nên phụ thuộc vào một lớp hook duy nhất." },
      { heading: "PostToolUse: normalize sau thực thi", keywords: "PostToolUse · updatedToolOutput · additionalContext", body: "Các MCP tool khác nhau có thể trả timestamp Unix, ISO datetime, DD/MM/YYYY; status number, string hoặc một ký tự. PostToolUse chuẩn hóa thành một cấu trúc chung trước khi model dùng. Bản SDK hiện tại dùng updatedToolOutput để thay output; updatedMCPToolOutput là tên cũ chỉ cho MCP.", snippet: "// Pseudocode trả output đã chuẩn hóa\nreturn { hookSpecificOutput: {\n  hookEventName: 'PostToolUse',\n  updatedToolOutput: { status: 'shipped', date: '2026-10-12T00:00:00.000Z' }\n} };", warning: "PostToolUse chạy SAU tool: không thể hoàn tác khoản tiền đã chuyển hay email đã gửi." },
      { heading: "Chuẩn hóa dữ liệu 3 nguồn", keywords: "Unix → ISO · numeric code → string · DD/MM/YYYY", body: "Tool A trả epoch seconds + status 200, B trả ISO + active, C trả DD/MM/YYYY + P. Định nghĩa mapping dựa trên contract từng tool rồi trả ISO 8601, status enum nhất quán. Date format nhập mơ hồ cần quy tắc rõ, không đoán thứ tự ngày/tháng.", bullets: ["Unix giây × 1000 trước new Date().toISOString().", "DD/MM/YYYY: tách ngày/tháng/năm có kiểm tra; không dùng Date.parse mơ hồ.", "Map 200/404/P/S theo hợp đồng từng service, tránh mapping toàn cục sai."] },
      { heading: "Decision rule: prompt hay hook?", keywords: "deterministic · probabilistic · enforcement", body: "Khi chỉ cần ưu tiên văn phong: prompt. Khi lệnh có thể gây thiệt hại tài chính hoặc vi phạm compliance: gate/hook + backend enforcement. Nếu có nhiều hook trên cùng tool, cần chú ý rule xung đột và logging để debug.", bullets: ["Financial: refund > threshold → block/approval.", "Security: file access hoặc customer identity → validate before execution.", "Style: markdown preference → prompt."] },
      { heading: "Beyond guide: PreCompact / PostCompact", keywords: "PreCompact · PostCompact · transcript archive", body: "Khi conversation cần compaction, PreCompact có thể lưu transcript trước khi tóm lược và trong cấu hình hỗ trợ có thể block; PostCompact chạy sau. Đây là thông tin bổ sung từ tài liệu hook, không phải phần trọng tâm Task 1.5.", warning: "Không nhầm 'pre' của compact với 'pre' của tool execution; matcher và callback khác nhau." }
    ],
    traps: ["Dùng PostToolUse để ngăn giao dịch: side effect đã xảy ra.", "Giao model tự diễn giải ngày tháng hỗn hợp trên mỗi tool call.", "Cho rằng few-shot bảo đảm 100% tuân thủ.", "Nhầm updatedMCPToolOutput (cũ) với updatedToolOutput.", "Quên điều kiện về matcher/tool_name khiến hook không chạy."],
    questions: [
      { question: "Cần chặn transfer_funds trước khi AML pass. Hook nào?", choices: ["PostToolUse", "PreToolUse", "PostCompact", "SubagentStop"], correct: 1, explanation: "PreToolUse chạy trước side effect và có thể deny." },
      { question: "Muốn Unix timestamp từ MCP đổi sang ISO trước khi Claude đọc?", choices: ["Prompt nhắc model mỗi lần", "PreToolUse", "PostToolUse với updatedToolOutput", "Tắt tool"], correct: 2, explanation: "PostToolUse có output tool để normalize và thay output Claude thấy." },
      { question: "PostToolUse có hoàn tác refund đã thực thi không?", choices: ["Có", "Không; tool đã chạy", "Có nếu prompt đủ mạnh", "Chỉ với MCP"], correct: 1, explanation: "Sau execution không rollback side effect bằng hook này." },
      { question: "Field cho phép deny trong PreToolUse callback?", choices: ["updatedToolOutput", "permissionDecision", "tool_result", "stop_reason"], correct: 1, explanation: "permissionDecision: 'deny' nằm trong hookSpecificOutput." },
      { question: "Field thay output tool ở PostToolUse hiện tại?", choices: ["updatedInput", "updatedToolOutput", "tool_choice", "fork_session"], correct: 1, explanation: "updatedToolOutput thay dữ liệu trước khi model đọc." },
      { question: "Khi yêu cầu chỉ là Markdown style, lựa chọn phù hợp?", choices: ["PreToolUse bắt buộc", "Prompt guidance", "Human approval", "Deny all"], correct: 1, explanation: "Không cần overhead của policy gate cho style low-stakes." },
      { question: "Tool C trả 12/10/2026; vấn đề khi parse bằng Date.parse?", choices: ["Luôn chính xác", "Ngày/tháng có thể bị nhầm", "Không bao giờ parse được", "Tự động ISO"], correct: 1, explanation: "Phải biết rõ DD/MM/YYYY theo contract và tự validate." },
      { question: "Mục đích PreCompact?", choices: ["Chặn tool refund", "Chạy sau normalization", "Quan sát/lưu transcript trước compaction", "Chọn subagent"], correct: 2, explanation: "PreCompact can thiệp trước khi nén lịch sử, khác tool hooks." }
    ],
    exerciseTitle: "PreToolUse Gate + PostToolUse Normalizer", duration: "60 phút",
    exerciseSteps: ["Tạo 3 mock MCP tools trả ngày/status theo các format khác nhau.", "Viết PostToolUse normalizer thống nhất ISO date và enum status.", "Kiểm tra output chuẩn hóa trước khi model sử dụng.", "Viết PreToolUse guard cho transfer/refund theo threshold và prerequisite.", "Test trường hợp action bị deny trước khi side effect, compare với prompt-only."],
    practiceCode: "const normalizeStatus = (source, value) => {\n  if (source === 'shipping' && value === 'P') return 'pending';\n  if (source === 'shipping' && value === 'S') return 'shipped';\n  return String(value).toLowerCase();\n};\n// Hook: PRE guards call; POST normalizes response.",
    source: "https://claudecertificationguide.com/learn/1-agentic-architecture/1-5-agent-sdk-hooks",
    extraSource: "https://code.claude.com/docs/en/agent-sdk/hooks"
  },
  6: {
    number: 6, label: "1.6", slug: "task-decomposition",
    title: "Task Decomposition Strategies",
    headline: "Không phải nhiệm vụ nào cũng phù hợp một pipeline cố định. Chia công việc theo đặc tính, và tránh dồn 14 file vào một lần review.",
    summary: "Fixed sequential pipeline cho bước đã biết; dynamic adaptive decomposition cho điều tra chưa rõ. Attention dilution được giải bằng local passes theo item rồi cross-item integration, không chỉ nâng model.",
    related: "Liên hệ 1.2: coordinator chịu trách nhiệm partition/refine scope. Liên hệ 1.3: các per-file passes phải truyền structured findings cho integration pass. Liên hệ 1.4: compliance pipeline có bước bắt buộc cần gate.",
    pillars: [["Fixed", "Bước biết trước, xử lý ổn định và dễ debug."], ["Dynamic", "Điều tra mở, kế hoạch đổi khi phát hiện dependency."], ["Multi-pass", "Local review từng file + cross-file integration."]],
    sections: [
      { heading: "Fixed sequential pipelines / prompt chaining", keywords: "predetermined steps · stable workflow", body: "Luồng Step 1 → Step 2 → Step 3 định sẵn, output bước trước là input bước sau. Phù hợp data extraction, document processing, code review có stages rõ. Dễ đo thời gian và debug; không thích hợp khi cần điều chỉnh chiến lược liên tục.", snippet: "// Pipeline có dependency rõ ràng\nconst localReports = await Promise.all(files.map(reviewOneFile));\nconst integration = await reviewCrossFile(localReports);\nreturn compileReport(localReports, integration);" },
      { heading: "Dynamic adaptive decomposition", keywords: "discover → plan → execute → replan", body: "Khi chưa biết đầy đủ scope như debug legacy app hoặc security audit, coordinator khám phá codebase, xếp thứ tự ưu tiên và cập nhật plan mỗi khi phát hiện dependency mới. Ưu: linh hoạt. Nhược: khó dự báo thời gian/cost hơn.", snippet: "let plan = await mapCodebase();\nwhile (plan.hasWork()) {\n  const finding = await investigate(plan.next());\n  plan = revisePlan(plan, finding); // điều chỉnh bởi phát hiện mới\n}" },
      { heading: "Match pattern to the task", keywords: "structured vs open-ended", body: "Dữ liệu có schema rõ, bước chuẩn hóa xác định → fixed. Nghiên cứu domain mới, khám phá nguyên nhân lỗi chưa biết → dynamic. Không chọn dynamic chỉ vì nghe hiện đại; đó là lời giải sai khi quy trình cố định đã phù hợp.", bullets: ["Document extraction → fixed.", "14-file review → local + integration fixed stages.", "Khám phá legacy dependencies → dynamic.", "Root-cause debugging chưa biết → dynamic."] },
      { heading: "Attention dilution: review càng về sau càng nông", keywords: "single-pass overload · inconsistent coverage", body: "Nếu file 1–5 được nhận xét chi tiết nhưng file 10–14 chỉ nói chung chung, cùng pattern bị phê bình ở file 3 nhưng được chấp nhận ở file 11, thì đang có attention dilution. Nhiều items trong cùng context cạnh tranh mức chú ý.", warning: "Không giả định mọi lần single-pass đều chắc chắn sẽ bị lỗi; đây là failure mode mà bài thi yêu cầu nhận diện." },
      { heading: "Multi-pass solution: local rồi integration", keywords: "per-item local pass · cross-item integration", body: "Pass một đánh giá từng file độc lập và trả structured findings (bug, severity, line). Pass hai so sánh tất cả kết quả, kiểm tra API consistency, data flow và cross-file dependencies. Chia batch mà thiếu integration vẫn bỏ qua lỗi giữa các batch.", snippet: "// Per-file (có thể song song nếu độc lập)\nconst local = await Promise.all(files.map(reviewFile));\n// Integration phải chờ toàn bộ findings\nconst cross = await compareAcrossFiles(local);\nreturn { local, cross };" },
      { heading: "Measure quality instead of assuming", keywords: "coverage · contradiction · consistency", body: "So sánh single-pass và multi-pass trên cùng 10–14 file. Theo dõi số issue có line references, severity, độ đồng đều chiều sâu giữa các file và mâu thuẫn về rule. Cần có tiêu chí integration pass, không chỉ đếm tổng issue." }
    ],
    traps: ["Nâng model/context window thay vì đổi kiến trúc multi-pass.", "Batch mỗi 5 file nhưng quên cross-file integration.", "Dùng fixed pipeline cho debugging mở chưa rõ nguyên nhân.", "Dùng dynamic cho data extraction cố định chỉ vì nghe nâng cao.", "Phân tích mỗi file tốt nhưng không tổng hợp mâu thuẫn giữa files."],
    questions: [
      { question: "Extract 5 trường cố định từ PDF, nên chọn?", choices: ["Adaptive dynamic", "Fixed sequential pipeline", "Không cần pipeline", "Fork session"], correct: 1, explanation: "Bước xử lý/schema đã rõ, fixed pipeline dễ kiểm chứng." },
      { question: "Khám phá legacy codebase chưa biết dependencies?", choices: ["Fixed không đổi", "Dynamic adaptive decomposition", "Single pass 100 files", "Chỉ đổi model"], correct: 1, explanation: "Plan phải thay đổi theo phát hiện mới." },
      { question: "Review 14 files, 5 file đầu sâu, 9 file cuối nông. Lỗi?", choices: ["Tool auth", "Attention dilution", "Stale session", "Bad handoff"], correct: 1, explanation: "Số item quá lớn trong một pass làm mất độ đồng đều." },
      { question: "Giải pháp đúng cho attention dilution?", choices: ["Thêm prompt dài", "Đổi model lớn", "Per-file passes + cross-file integration", "Giảm kết quả trả về"], correct: 2, explanation: "Đổi cấu trúc review để vừa sâu từng file vừa phát hiện cross-file issues." },
      { question: "Batch 5 file × 3 đợt nhưng không integration pass thì?", choices: ["Đủ mọi lỗi", "Có thể bỏ lỡ lỗi cross-batch", "Không có cải thiện nào", "Tự động dynamic"], correct: 1, explanation: "Local groups không thể thay thế integration pass." },
      { question: "Điều gì thể hiện review không nhất quán?", choices: ["Có line references", "Cùng pattern bị đánh giá trái ngược ở hai file", "Có severity", "Có parallel"], correct: 1, explanation: "Đây là dấu hiệu attention dilution được bài nguồn nhấn mạnh." },
      { question: "Multi-pass có thể thực thi local per-file thế nào?", choices: ["Luôn tuần tự", "Parallel nếu độc lập, integration sau", "Integration trước", "Mỗi file fork session bắt buộc"], correct: 1, explanation: "Các local passes độc lập có thể parallel, integration phụ thuộc kết quả." },
      { question: "Root cause chưa biết, plan điều tra phải đổi theo findings. Chọn?", choices: ["Adaptive", "Fixed only", "Prompt markdown", "PostToolUse"], correct: 0, explanation: "Unknown scope + evolving dependencies cần dynamic decomposition." }
    ],
    exerciseTitle: "Multi-Pass TypeScript Code Review", duration: "60 phút",
    exerciseSteps: ["Chuẩn bị 10+ file JS/TS làm input; ghi lại quy tắc và phạm vi.", "Chạy baseline single-pass và ghi nhận kết quả.", "Tạo per-file local pass có structured issues: line, severity, description.", "Chạy cross-file integration kiểm tra imports, data flow, API consistency và quy tắc dùng chung.", "So sánh coverage, độ đồng đều và số contradiction giữa hai phương án.", "Đánh dấu các pattern được nhận xét mâu thuẫn khi single-pass."],
    practiceCode: "const local = await Promise.all(\n  files.map(async (file) => ({ file, issues: await reviewOne(file) }))\n);\nconst integration = await crossFileReview(local);\nreturn { local, integration };",
    source: "https://claudecertificationguide.com/learn/1-agentic-architecture/1-6-task-decomposition"
  },
  7: {
    number: 7, label: "1.7", slug: "session-state-resumption",
    title: "Session State & Resumption",
    headline: "Tiếp tục phiên làm việc, tách nhánh thử nghiệm hay làm mới ngữ cảnh? Chọn sai sẽ khiến AI tư vấn dựa trên code đã lỗi thời.",
    summary: "Resume khi prior context còn đúng; fork để thử các hướng từ baseline chung; fresh start + structured summary và targeted re-analysis khi tool results đã stale.",
    related: "Liên hệ 1.3: fork_session và resume đã được giới thiệu; 1.7 bổ sung lựa chọn fresh start khi code thay đổi. Liên hệ 1.6: chỉ re-analyze changed files thay vì full exploration. Liên hệ 1.1: lịch sử tool results ảnh hưởng các vòng chạy sau.",
    pillars: [["Resume", "Tiếp tục khi history/tool results vẫn đáng tin."], ["Fork", "Các nhánh khác nhau dựa trên cùng baseline."], ["Fresh + Summary", "Bỏ stale raw tool output và chỉ review phần đã đổi."]],
    sections: [
      { heading: "Resume session: tiếp tục", keywords: "--resume · --continue · --name", body: "Resume khôi phục session đang có để tiếp tục công việc. Dùng khi source files và dữ liệu ngoài chưa thay đổi đáng kể, và history còn hữu ích. Claude Code hỗ trợ đặt tên session rồi resume, còn --continue/-c thường tiếp tục conversation gần nhất trong working directory.", snippet: "# CLI illustration\nclaude --name auth-audit\n# Khi quay lại và files chưa đổi:\nclaude --resume auth-audit" },
      { heading: "Fork session: tạo nhánh thử nghiệm", keywords: "fork_session · resume + forkSession", body: "Fork lấy history hiện có làm baseline, rồi tạo independent branch để thử hai cách refactor khác nhau. Trong SDK, forkSession/fork_session được thiết lập cùng resume: chọn session gốc và yêu cầu branch thay vì append. Fork không giải quyết stale context vì kế thừa history cũ.", snippet: "// Pseudocode Agent SDK option shape\nconst options = {\n  resume: existingSessionId,\n  forkSession: true // branch, không append session gốc\n};" },
      { heading: "Fresh start with summary injection", keywords: "fresh session · structured summary · clean baseline", body: "Khi files, APIs hoặc dependencies đổi, tạo session mới và inject bản tóm tắt đã kiểm duyệt: các kết luận còn giá trị, danh sách files thay đổi, cần re-check gì. Không mang theo raw old tool results dễ khiến model mâu thuẫn.", snippet: "const summary = {\n  previousFindings: ['auth needs review'],\n  changedFiles: ['auth.ts', 'session.ts', 'middleware.ts'],\n  requiredAction: 'Re-read changed files and verify fixes'\n};" },
      { heading: "Stale context: nhận diện tư vấn mâu thuẫn", keywords: "stale tool results · contradictory advice", body: "Claude đã đọc auth.ts phiên trước, người dùng sửa code, rồi resume. Old tool output vẫn còn trong history khiến model nhắc lại lỗi đã fix và trộn code cũ/mới. Hỏi re-read lại trong cùng history không xóa old tool results.", warning: "Không phải mọi resume sau thay đổi đều sẽ sai; đây là rủi ro mà bài thi muốn tránh bằng clean summary và fresh reads." },
      { heading: "Targeted re-analysis, không scan lại tất cả", keywords: "changed files · delta analysis · efficiency", body: "Ví dụ 50 files, chỉ 3 files đã sửa. Giữ summary của phần chưa đổi, mở session mới, đọc lại đúng 3 files và kiểm tra dependency liên quan nếu cần. Không phải xem lại cả 50 trừ khi thay đổi lan rộng.", bullets: ["Liệt kê danh sách file thay đổi.", "Tóm tắt findings cũ còn đáng tin và điều gì đã fix.", "Chỉ định kiểm tra lại những vùng ảnh hưởng; mở rộng scope khi dependencies yêu cầu."] },
      { heading: "Decision matrix để làm bài thi", keywords: "continue / diverge / stale", body: "Không đổi code, muốn tiếp tục cùng một hướng → resume. Muốn so sánh hai chiến lược refactor → fork. Đã sửa files hoặc nâng dependency khiến raw tool results cũ không chính xác → fresh session + summary, đọc lại vùng thay đổi.", bullets: ["Resume = append.", "Fork = branch từ old history.", "Fresh = bỏ old raw tool results, inject curated knowledge."] }
    ],
    traps: ["Resume dù code đã sửa và history đầy stale tool results.", "Fork để xử lý stale context: fork vẫn mang stale history.", "Đọc lại toàn bộ 50 file khi 3 file đổi mà không có lý do.", "Fresh session không summary làm mất toàn bộ tiến độ.", "Nhầm --resume với tạo session mới; resume chỉ tiếp tục session có sẵn."],
    questions: [
      { question: "Hôm qua dừng debug, hôm nay không file nào thay đổi. Chọn?", choices: ["Fresh no summary", "Resume", "Fork", "Ignore context"], correct: 1, explanation: "Prior context vẫn đúng, resume hiệu quả nhất." },
      { question: "Muốn so sánh refactor A và B từ cùng baseline?", choices: ["Resume một nhánh", "Fresh no context", "Fork session", "PreToolUse"], correct: 2, explanation: "Fork tạo divergent investigations từ cùng history ban đầu." },
      { question: "3/50 files đã sửa, resume đưa lời khuyên cũ. Nguyên nhân?", choices: ["Attention dilution", "Stale context", "Missing handoff", "No post-hook"], correct: 1, explanation: "History giữ tool results của code trước sửa." },
      { question: "Xử lý stale context đáng tin cậy nhất?", choices: ["Fork old session", "Resume rồi yêu cầu đọc lại", "Fresh session + summary + re-read changed files", "Quét lại mọi file"], correct: 2, explanation: "Fresh bỏ raw stale results và summary giữ kiến thức cần thiết." },
      { question: "Fork có tự loại stale tool results không?", choices: ["Có", "Không, fork sao chép baseline cũ", "Có nếu nhánh A", "Chỉ trên CLI"], correct: 1, explanation: "Fork thừa hưởng history session nguồn; nếu history stale thì fork cũng stale." },
      { question: "Session dài quá nhiều tool logs không còn liên quan nên?", choices: ["Cứ resume mãi", "Fresh start + curated summary", "Chỉ tăng temperature", "Dùng PostToolUse"], correct: 1, explanation: "Tạo clean baseline giúp tránh degraded context." },
      { question: "Claude Code --resume dùng để?", choices: ["Tạo session mới", "Tiếp tục session hiện có", "Tự fork", "Xóa tool results"], correct: 1, explanation: "Resume dùng session ID/name đã tồn tại; không phải lệnh khởi tạo." },
      { question: "Chỉ 3 files đổi, cách tiết kiệm mà đúng?", choices: ["Re-analyze mọi 50 files", "Re-analyze 3 changed files với summary, mở rộng nếu dependency cần", "Không đọc gì", "Fork ba lần"], correct: 1, explanation: "Targeted re-analysis giữ efficiency mà giảm stale advice." }
    ],
    exerciseTitle: "Resume, Fork & Fresh Summary Lab", duration: "45 phút",
    exerciseSteps: ["Tạo/named session và phân tích codebase 10 files.", "Lưu structured findings theo file, issue, severity và recommendation.", "Thay đổi 3 files bằng các bản sửa thật.", "Resume và quan sát old tool results/contradictory advice nếu có.", "Tạo fresh session, inject summary và re-read đúng 3 files thay đổi.", "So sánh kết quả consistency, độ dài history và số files cần phân tích."],
    practiceCode: "// CLI demo (chạy tại terminal với Claude Code)\n// 1. claude --name code-audit\n// 2. Sửa các file trong IDE\n// 3. claude --resume code-audit  // có thể stale\n// 4. Khởi tạo phiên mới + summary và changedFiles",
    source: "https://claudecertificationguide.com/learn/1-agentic-architecture/1-7-session-state-resumption"
  }
};
