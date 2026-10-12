import { foundationLessons } from "./foundation-study.ts";
import { lessons } from "./agentic-course.ts";

// Nguồn chuẩn: bảy bài tại claudecertificationguide.com; content tiếng Anh ở đây
// là diễn giải/biên soạn sát nghĩa, KHÔNG phải bản chép nguyên văn tài liệu nguồn.
// Giữ thuật ngữ API/SDK (stop_reason, PreToolUse...) không dịch thành tên khác.
export type Locale = "vi" | "en";
export type Topic = { title: string; keywords: string; body: string; note: string; code?: string; warning?: string };
export type ExamQuestion = { question: string; choices: string[]; correct: number; explanation: string };
export type LearningContent = {
  title: string; intro: string; bridge: string; topics: Topic[]; summary: string[];
  quiz: ExamQuestion[]; labTitle: string; steps: string[];
};
export type BilingualLesson = { number: number; source: string; vi: LearningContent; en: LearningContent };

// Lesson 1.3 không có chung schema với 1.1–1.2 hoặc 1.4–1.7:
// bổ sung bài học riêng để giữ đủ 8 ý gốc (AgentDefinition, handoff, metadata...).
const thirdVi: LearningContent = {
  title: "Subagent Invocation and Context Passing",
  intro: "Bài 1.2 mô tả kiến trúc hub-and-spoke. Bài 1.3 giải thích cơ chế gọi subagent bằng Task/Agent, cách cấp quyền, thiết kế AgentDefinition và chuyển findings kèm nguồn qua coordinator.",
  bridge: "Từ 1.2: coordinator là hub, subagent không tự đọc conversation history. Sang 1.3: mọi lời gọi phải chuyển đúng goal, input và structured metadata.",
  topics: [
    { title: "Task / Agent tool", keywords: "Task · Agent · allowedTools", body: "Guide thi dùng tên Task tool; trong Claude Code hiện tại công cụ được gọi là Agent. Cấu hình allowedTools trong guide là điều kiện bật invocation. Trong SDK hiện đại, allowedTools thiên về auto-approval: không có Agent có thể kích hoạt permission check, thay vì vô hiệu hóa công cụ hoàn toàn.", note: "Theo tình huống bài thi, coordinator cần quyền gọi Task/Agent; khi code thực tế, kiểm tra permission mode và callback.", warning: "Không trộn thuật ngữ của guide với hành vi permission của SDK." },
    { title: "AgentDefinition", keywords: "description · prompt · tools", body: "Định nghĩa specialist gồm description (để coordinator biết khi nào giao việc), prompt (system instructions và mục tiêu), tools (giới hạn quyền). Nếu chỉ có tên mà description mơ hồ, routing dễ sai; nếu cấp quá nhiều tools, phạm vi thao tác vượt nhiệm vụ.", note: "Nhận diện đúng ba thành phần: description, system prompt, tool restrictions." },
    { title: "Isolated context", keywords: "context isolation · explicit context", body: "Một invocation không tự nhận toàn bộ lịch sử coordinator hoặc kết quả agent trước. Muốn Document Agent phân tích tiếp Web Agent, coordinator phải đưa findings liên quan vào lời gọi kế tiếp. Không giả định có shared memory.", note: "Lỗi thiếu context thường bắt nguồn từ coordinator, không nhất thiết do model yếu." },
    { title: "Ba quy tắc handoff", keywords: "complete findings · structured metadata · goal-oriented prompts", body: "Quy tắc 1: gửi đủ findings có liên quan từ agent trước. Quy tắc 2: tách content (claim, analysis) khỏi metadata (URL, tên file, trang). Quy tắc 3: giao mục tiêu và tiêu chí hoàn thành, không áp đặt mọi bước vi mô trừ khi policy yêu cầu.", note: "Chất lượng handoff quyết định khả năng synthesis có căn cứ." },
    { title: "Structured findings", keywords: "claim · source_url · document_name · page_number · confidence", body: "Một finding nên chứa claim, analysis cùng nguồn tham chiếu, số trang/tên tài liệu và agent thu thập. Không có metadata thì downstream không thể trích nguồn đáng tin từ dữ liệu được giao. Tuy nhiên có URL không chứng minh URL thật sự hỗ trợ claim.", note: "Attribution ≠ verification; phải kiểm tra nguồn khi cần.", code: '{ claim: "A", source_url: "https://example.org/report", document_name: null, page_number: null }' },
    { title: "Parallel và sequential", keywords: "parallel spawning · dependent synthesis", body: "Web Research và Document Research độc lập có thể spawn cùng một lượt coordinator. Synthesis cần cả hai kết quả nên phải chạy sau. Trong repo, Promise.all với nhiều Messages API calls chỉ là mô phỏng application-level, không phải Agent tool của Claude Agent SDK.", note: "Independent → parallel; dependent → sequential.", code: 'const [web, doc] = await Promise.all([researchWeb(), researchDocument()]);\nconst report = await synthesize({ web, doc });' },
    { title: "Attribution failure", keywords: "context loss · root cause", body: "Nếu research có URL và page number nhưng report cuối thiếu citations, kiểm tra payload coordinator gửi synthesis. Nếu coordinator chỉ giữ claim, không thể sửa bằng cách đơn giản thêm tool cho synthesis.", note: "Truy nguyên điểm đầu tiên làm mất chứng cứ." },
    { title: "Fork vs resume", keywords: "fork_session · resume", body: "Resume tiếp tục một session có history cũ; fork tạo nhánh độc lập từ baseline. Fork không đồng nghĩa parallel Agent invocations và không tự làm mới tài liệu stale. Lesson 1.7 phân tích sâu trường hợp chọn fresh session.", note: "Continue → resume; divergent work → fork; stale results → fresh + summary." }
  ],
  summary: [
    "Task (guide) và Agent (SDK hiện tại) là cơ chế giao việc cho subagent; lưu ý allowedTools/permission.",
    "AgentDefinition gồm description, prompt và tool restrictions.",
    "Subagent context độc lập; coordinator phải truyền explicit input.",
    "Giữ claim cùng source_url, document_name, page_number để synthesis trích dẫn.",
    "Independent research có thể parallel; dependent synthesis phải sequential.",
    "Thiếu citations: kiểm tra handoff metadata trước khi đổ lỗi model.",
    "Fork, resume và parallel spawning là ba khái niệm khác nhau."
  ],
  quiz: [
    { question: "Bài hướng dẫn thi yêu cầu cấu hình nào để coordinator gọi subagent?", choices: ["Bỏ tool definitions", "Cho Task/Agent trong allowedTools theo hướng dẫn thi", "Chỉ tăng max_tokens", "Thêm text 'done'"], correct: 1, explanation: "Guide yêu cầu Task/Agent; SDK hiện đại có permission behavior cần kiểm tra riêng." },
    { question: "AgentDefinition bao gồm các phần nào?", choices: ["description, prompt, tools", "timeout, price, stop_reason", "session_id, fork, resume", "content, source_url, page"], correct: 0, explanation: "Ba thành phần chính phục vụ chọn agent, instructions và giới hạn công cụ." },
    { question: "Synthesis không biết kết quả của Web Research. Cần sửa gì?", choices: ["Thêm model mạnh", "Giả định shared history", "Coordinator truyền explicit findings", "Tắt metadata"], correct: 2, explanation: "Context của các agent bị cô lập; coordinator chịu trách nhiệm handoff." },
    { question: "Research đã có nguồn, report lại không có citations. Gốc lỗi thường ở đâu?", choices: ["Tool definitions của calculator", "Coordinator bỏ metadata trước synthesis", "Iteration cap", "Fork session"], correct: 1, explanation: "Synthesis không thể gắn nguồn mà nó chưa được nhận." },
    { question: "Hai research task độc lập và synthesis cần cả hai. Điều phối nào đúng?", choices: ["Research sequential bắt buộc", "Synthesis chạy đầu tiên", "Research parallel rồi synthesis sequential", "Ba bước chạy random"], correct: 2, explanation: "Phải tôn trọng quan hệ dependency giữa các bước." },
    { question: "Có source_url trong finding có xác nhận claim chính xác không?", choices: ["Có, luôn đúng", "Không; vẫn cần source verification", "Có nếu confidence high", "Có nếu URL có https"], correct: 1, explanation: "Metadata giúp attribution, không thay thế kiểm tra nguồn." },
    { question: "Muốn thử hai hướng từ cùng baseline, chọn?", choices: ["resume cùng một nhánh", "fork session", "xóa prompt", "PostToolUse"], correct: 1, explanation: "Fork tạo các nhánh nghiên cứu độc lập; resume chỉ tiếp tục." }
  ],
  labTitle: "Research Handoff có log nguồn",
  steps: [
    "Khởi tạo hai research calls độc lập trên nguồn giả định được ghi rõ.",
    "Log request, response và usage token của từng researcher.",
    "Coordinator tạo structured findings giữ source_url và document_name.",
    "Synthesis chạy sau Promise.all và nhận toàn bộ findings.",
    "Thử --bad để lược bỏ metadata; đối chiếu log và báo cáo."
  ]
};

// Các bản dịch tiếng Anh dưới đây là diễn giải do tác giả tạo từ các khái niệm
// được đối chiếu trong nguồn. Không tuyên bố đây là original text của guide.
type EnglishOutline = Omit<LearningContent, "labTitle"> & { labTitle: string };

const en: Record<number, EnglishOutline> = {
  1: {
    title: "Agentic Loops",
    intro: "An agentic loop is application-level control flow around the Messages API. Claude chooses tools from the supplied definitions; your code executes client tools, sends back results, and inspects stop_reason to decide what happens next.",
    bridge: "Lesson 1.1 supplies the execution protocol. Lesson 1.2 uses that foundation to orchestrate specialized agents.",
    topics: [
      { title: "The four-step lifecycle", keywords: "Messages API · tool results", body: "Send messages and tool definitions to Claude. Inspect stop_reason. For tool_use, execute the requested client tools and append assistant tool_use content plus user tool_result content to history. For end_turn, return the final answer.", note: "A missing tool_result breaks the feedback loop.", code: "request → tool_use → tool_result → next request → end_turn" },
      { title: "Use stop_reason as control flow", keywords: "tool_use · end_turn", body: "Text can appear alongside tool_use. Neither the first content block nor a natural-language statement such as 'finished' is a reliable completion signal. Basic exam loops branch on tool_use and end_turn.", note: "Never terminate because response.content[0] happens to be text." },
      { title: "Conversation history format", keywords: "assistant tool_use · user tool_result · tool_use_id", body: "Append the full assistant content containing tool_use blocks. Then append a user message with tool_result blocks referencing the matching tool_use_id values. The next Claude request must include the updated messages.", note: "Keep tool call IDs matched and preserve the required message roles." },
      { title: "Model-driven tool selection", keywords: "JSON Schema · input_schema", body: "Declare each client tool using a name, description and JSON Schema input_schema. Claude decides whether to request a calculator or mock search tool based on the task. The application, not Claude, validates inputs and executes the tool.", note: "Tool selection is model-driven; tool execution and security are owned by code." },
      { title: "Termination anti-patterns", keywords: "natural-language parsing · fixed iteration count", body: "Parsing completion phrases, looking for text content or using a fixed number of iterations as the completion rule may stop work prematurely. A maximum turn count is a safety bound, not evidence of success. Forcing tool_choice 'any' can also force unnecessary tool calls.", note: "Safety caps protect the loop; they are not the normal stop condition." },
      { title: "Additional API stop reasons", keywords: "pause_turn · max_tokens · refusal", body: "The certification guide emphasizes tool_use and end_turn. Production code must separately handle other stop_reason values such as pause_turn, max_tokens, stop_sequence, refusal and context-window limits. Do not treat all non-end_turn values as tool_use.", note: "Keep exam simplifications distinct from the live API." },
      { title: "Test sequential tool decisions", keywords: "debug trace · tool chain", body: "Use a prompt where Claude must obtain a mock price before calculating a total. Log each stop_reason, requested tool, tool_result and token usage. Fail explicitly if the safety limit is reached without end_turn.", note: "A correct trace shows the results returned to Claude before its next decision." }
    ],
    summary: ["Use stop_reason, not text, as the loop-control signal.", "For tool_use: run requested client tools and append assistant + user tool-result messages.", "For end_turn: return the final response.", "Use iteration limits as safety caps, not completion signals.", "The model selects tools; the application executes and validates them.", "Production must handle additional stop reasons."],
    quiz: [
      { question: "Claude returns text followed by tool_use. What is wrong with returning when the first block is text?", choices: ["Nothing", "It checks content instead of stop_reason", "It needs a larger model", "It needs more turns"], correct: 1, explanation: "Text can accompany a tool call; stop_reason is the reliable control field." },
      { question: "Claude requests two client tools in one tool_use response. What should your app do?", choices: ["Finish immediately", "Run only the first", "Execute requested tools and return matching tool_result blocks", "Discard the message"], correct: 2, explanation: "Each tool call needs a matching result identified by its tool_use_id." },
      { question: "In the Messages API, which role carries tool_result?", choices: ["assistant", "user", "system", "developer"], correct: 1, explanation: "The assistant sends tool_use; the user message carries tool_result." },
      { question: "What must happen before Claude can calculate from a search result?", choices: ["Discard the search result", "Append assistant tool_use and user tool_result to history", "Force all tools", "Stop after search"], correct: 1, explanation: "The next model call must see the result in conversation history." },
      { question: "What does MAX_ITERATIONS mean?", choices: ["Mandatory turn count", "Success signal", "Safety limit", "Replacement for end_turn"], correct: 2, explanation: "Normal completion is signaled by end_turn, not a turn counter." },
      { question: "Claude returns end_turn on the second turn. What should happen?", choices: ["Continue to the limit", "Force another tool", "Return the final answer", "Search for the word done"], correct: 2, explanation: "end_turn is the basic loop's completion signal." },
      { question: "Which statement describes model-driven tool selection?", choices: ["Always use a fixed sequence", "Claude chooses an available tool based on context", "Run a random tool", "Tools need no schema"], correct: 1, explanation: "Claude chooses tool calls from definitions; your application executes them." },
      { question: "Should pause_turn be interpreted as tool_use?", choices: ["Yes", "No, it requires separate handling", "Only if there is text", "Only after 20 turns"], correct: 1, explanation: "The live API has additional stop_reason values beyond the exam's main two." },
      { question: "What risk comes from tool_choice: any?", choices: ["Less observability", "Forcing a tool even when no tool is needed", "Losing tool IDs", "Breaking JSON Schema"], correct: 1, explanation: "Forced tool calls may prevent a natural completion." },
      { question: "How should your application evaluate a tool-supplied expression?", choices: ["Use eval()", "Validate or safely parse supported arithmetic", "Run arbitrary JS", "Trust the model input"], correct: 1, explanation: "Model-provided tool inputs are untrusted data, not executable JavaScript." }
    ],
    labTitle: "Multi-Tool Agent Loop with Protocol Logs",
    steps: ["Define a mock lookup tool and a safe calculator tool.", "Send messages and tool definitions to Claude.", "Log stop_reason and requested tool inputs.", "Execute tools and append tool_result blocks.", "Continue until end_turn or a safety bound is reached."]
  },
  2: {
    title: "Multi-Agent Orchestration",
    intro: "The exam uses a hub-and-spoke architecture: one coordinator decomposes work, selects specialists, passes explicit context, checks coverage, and integrates findings. The specialists return results to the coordinator rather than communicating with peers.",
    bridge: "Lesson 1.1 explains a single loop. Lesson 1.2 explains how a coordinator can manage multiple specialized reasoning calls. Lesson 1.3 covers the invocation and context-passing mechanics.",
    topics: [
      { title: "Hub-and-spoke orchestration", keywords: "coordinator · subagents", body: "The coordinator receives a broad request, splits it into tasks, selects specialists, routes information, aggregates results and handles errors. The hub provides observability, consistent error handling and controlled information flow.", note: "For the exam scenario, route inter-agent communication through the coordinator." },
      { title: "Context isolation", keywords: "isolated context · explicit handoff", body: "Specialists do not automatically inherit the coordinator's entire history or the output of another independent invocation. The coordinator must explicitly pass the task, previous findings and necessary constraints.", note: "First check the coordinator's input when downstream context is missing." },
      { title: "Dynamic specialist selection", keywords: "routing · relevance", body: "Choose only the agents required for the current request. Running an entire research-analysis-synthesis pipeline for a simple question wastes time and budget.", note: "Do not always invoke every configured agent." },
      { title: "Scope partition and coverage", keywords: "decomposition · breadth", body: "Partition a broad topic into distinct source types or subtopics so specialists do not duplicate work. If the coordinator assigns only solar and wind, it cannot expect missing geothermal and tidal coverage to materialize downstream.", note: "Missing whole categories points to the coordinator's decomposition." },
      { title: "Iterative refinement", keywords: "coverage audit · targeted follow-up", body: "After synthesizing results, compare them against the original scope. For missing or shallow areas, delegate targeted follow-up tasks and assess coverage again. Stop once sufficient coverage or a safety bound is reached.", note: "A coordinator is not just a one-shot dispatcher." },
      { title: "Diagnose the failing layer", keywords: "breadth vs depth · root cause", body: "A missing category usually indicates inadequate decomposition. Shallow research on an assigned topic suggests retrieval or specialist prompt problems. A report that ignores adequate evidence points to synthesis or handoff.", note: "Correct the earliest layer that lost the needed information." },
      { title: "Exam pattern vs product capabilities", keywords: "strict hub-and-spoke · nested delegation", body: "The guide tests strict hub-and-spoke routing. Certain current Claude products allow hierarchical or nested delegation, so the exam architecture is not a universal product restriction.", note: "Choose the requested architecture, not an unsupported universal claim." },
      { title: "Read example scope carefully", keywords: "source taxonomy · scenario constraints", body: "The guide's coverage example names nuclear fusion among energy technologies to consider. Fusion is part of that example's required scope; this does not automatically classify fusion as a renewable energy source.", note: "Follow the scope specified in a scenario without changing scientific classifications." }
    ],
    summary: ["The coordinator owns decomposition, routing, aggregation and refinement.", "Use explicit context between isolated specialist calls.", "Select only necessary specialists and partition work to reduce duplication.", "Missing breadth is typically a coordinator decomposition failure.", "Missing depth calls for better task context or sources.", "Re-delegate uncovered topics; do not confuse self-rated coverage with evidence verification."],
    quiz: [
      { question: "A report covers only solar and wind, and no one was assigned other categories. Root cause?", choices: ["Document specialist quality", "Coordinator decomposed the task too narrowly", "Markdown formatting", "Too few tokens"], correct: 1, explanation: "The missing areas were never assigned; downstream specialists cannot recover omitted scope automatically." },
      { question: "A question needs only one specialist. Should the coordinator run all agents?", choices: ["Yes, always", "No, select only the necessary specialist", "Always fork two sessions", "Skip explicit context"], correct: 1, explanation: "Dynamic selection avoids unnecessary calls and latency." },
      { question: "Synthesis does not have the web agent's findings. First check?", choices: ["Whether the coordinator passed the findings", "Temperature", "UI framework", "Session name"], correct: 0, explanation: "Isolated specialists cannot read one another's history automatically." },
      { question: "How should two independent specialists avoid duplicating research?", choices: ["Search identical sources", "Partition distinct subtopics or source types", "Drop half the user request", "Force tool_choice"], correct: 1, explanation: "Explicit scope partition produces complementary findings." },
      { question: "The coverage audit finds two missing topics. Next action?", choices: ["Stop permanently", "Targeted follow-up, then re-check coverage", "Invent missing citations", "Increase a fixed turn count"], correct: 1, explanation: "Iterative refinement fills specific gaps." },
      { question: "Why is a hub-and-spoke architecture useful?", choices: ["Guaranteed correctness", "Central observability and controlled information routing", "Zero token cost", "No need for errors"], correct: 1, explanation: "One coordinator gives a clear place to manage messages and error recovery." },
      { question: "An assigned subtopic was researched very shallowly. What should be improved first?", choices: ["All-topic decomposition", "Specialist prompt, context or retrieval", "Number of unrelated agents", "Remove the subtopic"], correct: 1, explanation: "This is a depth problem, not a missing category." },
      { question: "Does a model's self-reported 100% coverage prove the evidence is correct?", choices: ["Yes", "No, evidence must be checked", "Yes if all agents ran", "Yes for six categories"], correct: 1, explanation: "Coverage scores are estimates, not source verification." },
      { question: "In the guide's strict hub-and-spoke design, how do findings reach synthesis?", choices: ["Directly from any specialist", "Via the coordinator", "Via universal shared memory", "Only through a database"], correct: 1, explanation: "In this exam architecture, coordination remains centralized." },
      { question: "What is wrong with running six agents for every trivial request?", choices: ["Nothing", "Inefficient dynamic selection", "Wrong time format", "Wrong session flag"], correct: 1, explanation: "Coordinator routing should reflect actual task requirements." }
    ],
    labTitle: "Hub-and-Spoke Coordinator with Live Logs",
    steps: ["Define a broad research goal with explicit category coverage.", "Delegate independent source reviews to separate model calls.", "Log every specialist prompt and response.", "Aggregate the findings and identify missing categories.", "Run targeted follow-up research before synthesis if needed."]
  },
  3: {
    title: "Subagent Invocation and Context Passing",
    intro: "Lesson 1.2 described the architecture; Lesson 1.3 specifies the wiring. The coordinator invokes specialized agents and must explicitly pass prior findings and source metadata into dependent calls.",
    bridge: "Lesson 1.2 introduced the coordinator and isolated specialists. Lesson 1.3 makes delegation concrete: tool permission, agent definitions, complete findings and structured attribution.",
    topics: [
      { title: "Task / Agent invocation", keywords: "Task · Agent · allowedTools", body: "The exam guide refers to the Task tool. Current Claude Code uses Agent. The guide treats allowedTools as the gate for invocation; current SDK permission behavior is more nuanced, and omitted auto-approval may trigger a permission request.", note: "Know the exam wording and distinguish it from current SDK permission semantics." },
      { title: "AgentDefinition components", keywords: "description · prompt · tools", body: "A specialist definition specifies what the agent is for, the instructions it receives, and which tools it may access. Descriptions support selection; prompts guide behavior; tool lists restrict capabilities.", note: "Remember all three fields." },
      { title: "Isolated context", keywords: "explicit context · no shared history", body: "One specialist call does not automatically inherit the coordinator's full history or another specialist's output. The coordinator supplies the needed task and findings in the new invocation.", note: "Do not assume shared memory across independent invocations." },
      { title: "The three context-passing rules", keywords: "complete findings · metadata · goals", body: "Pass all relevant findings, preserve content together with structured source metadata, and specify goals and quality requirements rather than unnecessarily micromanaging every step.", note: "An accurate synthesis needs both evidence and instructions." },
      { title: "Structured findings", keywords: "claim · source_url · document_name · page_number", body: "A finding should contain its claim, analysis and source information. The downstream agent needs these fields to attribute claims. Source metadata does not automatically verify the accuracy of a claim.", note: "Attribution is not source verification.", code: '{ claim: "A", source_url: "https://example.org/report", page_number: null }' },
      { title: "Parallel and sequential execution", keywords: "independent research · dependent synthesis", body: "Independent web and document research can run concurrently. Synthesis must wait until it receives their findings. This repository's Promise.all-based Messages API example demonstrates the coordination principle but is not the Agent tool itself.", note: "Run independent tasks in parallel and dependent tasks sequentially." },
      { title: "Attribution failures", keywords: "lost metadata · coordinator handoff", body: "If research outputs include citations but the report does not, inspect the coordinator's synthesis payload. Omitting URLs or document pages removes the information needed for attribution.", note: "Fix the first point at which attribution metadata is lost." },
      { title: "Forking vs resuming", keywords: "fork_session · resume", body: "Resume continues a session; fork branches from a shared baseline. Forking a session is not equivalent to spawning two independent agents, and a fork retains old context rather than automatically refreshing it.", note: "Learn the detailed decision rules in Lesson 1.7." }
    ],
    summary: ["Task is the guide's name; Agent is the name used in current tooling.", "AgentDefinition includes description, prompt and tools.", "Specialists require explicit context, not assumed shared memory.", "Pass complete findings with attribution metadata.", "Independent calls can be parallel; synthesis depends on their output.", "Inspect coordinator handoff when source citations disappear.", "Forking and resuming sessions are not the same as parallel agent calls."],
    quiz: [
      { question: "What tool permission is expected by the exam guide for subagent invocation?", choices: ["No tool definitions", "Task/Agent in allowedTools according to the guide", "Only max_tokens", "A completion phrase"], correct: 1, explanation: "Know the guide's rule while recognizing current SDK permission behavior can differ." },
      { question: "What belongs in an AgentDefinition?", choices: ["description, prompt, tools", "timeout, price, stop_reason", "session_id and token cap only", "claim and page number"], correct: 0, explanation: "These define selection, instructions and available tools." },
      { question: "Synthesis cannot see a web specialist's output. What should change?", choices: ["Use more tokens", "Assume shared memory", "Pass findings explicitly through the coordinator", "Remove citations"], correct: 2, explanation: "Isolated calls receive only the context provided to them." },
      { question: "Research includes source metadata, but synthesis does not cite sources. Likely cause?", choices: ["Calculator schema", "The coordinator stripped metadata", "Too many turns", "A session fork"], correct: 1, explanation: "The synthesis agent cannot cite a source it never received." },
      { question: "What is the right schedule for two independent researchers and a dependent synthesizer?", choices: ["All sequential by definition", "Synthesis first", "Researchers parallel, synthesis after", "Random order"], correct: 2, explanation: "Synthesis depends on the research results." },
      { question: "Does an HTTPS source_url prove a claim is true?", choices: ["Yes", "No; verify the underlying source", "Yes with high confidence", "Yes with a page number"], correct: 1, explanation: "Structured attribution does not independently validate evidence." },
      { question: "To compare two strategies from one baseline, which session action fits?", choices: ["Resume one branch", "Fork the session", "Delete the prompt", "Use PostToolUse"], correct: 1, explanation: "Forking creates independent branches; resuming continues a single history." }
    ],
    labTitle: "Structured Handoff & Citation Trace",
    steps: ["Start independent research calls on explicitly labeled sample sources.", "Log each research call, answer and token usage.", "Build a structured findings object containing citations.", "Pass the full payload to synthesis after research finishes.", "Use --bad to compare output when source metadata is removed."]
  },
  4: {
    title: "Workflow Enforcement and Handoff",
    intro: "In high-risk workflows, prompts encourage behavior but do not enforce preconditions. Application-level checks, permission gates and correctly placed hooks must block unsafe execution. A human escalation needs complete, actionable context.",
    bridge: "Lesson 1.1 let the model propose tool calls. Lesson 1.4 distinguishes proposing a tool from being authorized to execute it. Lesson 1.5 shows how PreToolUse and PostToolUse hooks fit this boundary.",
    topics: [
      { title: "Prompt guidance vs programmatic enforcement", keywords: "probabilistic · deterministic", body: "Instructions may improve compliance, but they are not reliable safety gates. A programmatic precondition checks state at the execution boundary; it prevents a transaction along guarded execution paths when verification is missing.", note: "For high-risk finance, security and compliance, enforce rules in code.", warning: "A hook is not a substitute for backend authorization or protection against bypass paths." },
      { title: "Prerequisite gates", keywords: "verification · fail closed", body: "Before processing a refund, check a trusted customer identity verified in the current session. Do not let a language model invent verification status. A denied tool call can return a structured error that leads the agent back to verification.", note: "No verified customer, no refund." },
      { title: "Enforce ordering at the execution boundary", keywords: "precondition · tool handler", body: "The model may request process_refund before get_customer. Code must reject that attempt before any side effect, and verify conditions on each new attempt. Putting the rule only in a prompt cannot guarantee ordering.", note: "Enforce the invariant, rather than trusting a predicted sequence." },
      { title: "Multiple concerns in one request", keywords: "decomposition · parallel inquiry · unified response", body: "A customer may request a return, address update and loyalty-point check at once. Separate independent inquiries and combine the outcomes, but keep any authorization-dependent side effects sequential.", note: "Do not ignore extra concerns or parallelize dependent transactions." },
      { title: "Structured human handoff", keywords: "self-contained escalation · root cause", body: "The next human operator may not have access to the original transcript. Include customer ID, summary, attempted actions, the identified issue, requested amount where relevant, and the recommended next action.", note: "A handoff must allow the next operator to act without guessing." },
      { title: "Subagent lifecycle hooks (supplement)", keywords: "SubagentStart · SubagentStop · PreToolUse", body: "SubagentStart fires when a subagent starts and can provide additionalContext, but is not the hook used to deny its spawn. To intercept an Agent tool invocation, use PreToolUse. SubagentStop concerns the subagent lifecycle.", note: "The guide treats lifecycle hooks as supplementary beyond the primary exam focus." }
    ],
    summary: ["Use programmatic gates for financial, security and compliance operations.", "A refund must be blocked before execution if identity verification is missing.", "Prompt improvements alone cannot enforce a prerequisite.", "Decompose multi-concern requests and combine findings in one response.", "Human handoffs must contain enough context to act independently.", "PreToolUse intercepts a tool call before execution."],
    quiz: [
      { question: "An agent occasionally refunds customers before verification. Best fix?", choices: ["More examples in the prompt", "A gate that blocks refund without verified identity", "A bigger model", "Only a routing classifier"], correct: 1, explanation: "A programmatic gate blocks invalid actions at execution time." },
      { question: "For a Markdown style preference, what is generally appropriate?", choices: ["A payment authorization gate", "Block all tools", "Prompt guidance", "Human approval every time"], correct: 2, explanation: "Stylistic preferences are comparatively low risk." },
      { question: "A customer has three independent concerns. What should the coordinator do?", choices: ["Handle only the first", "Require three unrelated chats", "Investigate independent concerns then produce one coherent response", "Refund without checking"], correct: 2, explanation: "Separate the work without omitting any concern." },
      { question: "What must an escalation contain when the agent's transcript is unavailable?", choices: ["Only a customer name", "Identity, context, issue, amount if relevant, recommended action", "A greeting only", "Only raw logs"], correct: 1, explanation: "Human handoffs must be self-contained." },
      { question: "Does a routing classifier enforce verification before refund?", choices: ["Yes", "No, routing is not an execution gate", "Yes with six agents", "Yes with a long prompt"], correct: 1, explanation: "Routing chooses the workflow; execution guards enforce invariants." },
      { question: "The model calls refund without verified identity. What should the tool do?", choices: ["Run then apologize", "Reject before performing the refund", "Trust the model", "Wait until PostToolUse"], correct: 1, explanation: "Fail closed before any side effect." },
      { question: "Which hook can intercept an Agent spawn before execution?", choices: ["SubagentStart", "PreToolUse with an Agent matcher", "PostToolUse on refund", "SubagentStop"], correct: 1, explanation: "SubagentStart is not the pre-spawn blocking point." },
      { question: "When must related tasks be sequential?", choices: ["Always", "When one needs another's result or approval", "Whenever more than two agents exist", "Never"], correct: 1, explanation: "Dependent operations must respect ordering." }
    ],
    labTitle: "Refund Verification Gate (No Real Money)",
    steps: ["Define a verify_customer tool and a simulated refund tool.", "Keep verification state in trusted application memory.", "Deny refund requests made before verification.", "Log blocked and approved-in-demo actions with tool_use IDs.", "Summarize a self-contained handoff for a human operator."]
  },
  5: {
    title: "Agent SDK Hooks",
    intro: "Hooks enforce predictable behavior at tool boundaries. PreToolUse runs before execution and can block or change a call; PostToolUse runs after execution and may normalize the output before the model reads it.",
    bridge: "Lesson 1.4 introduced prerequisite gates. Lesson 1.5 examines when to use PreToolUse versus PostToolUse. In Lesson 1.3, structured handoff data benefits from normalization.",
    topics: [
      { title: "PreToolUse policy interception", keywords: "PreToolUse · permissionDecision", body: "PreToolUse can allow, deny, ask or defer a tool invocation, and may provide updatedInput. Use pre-execution checks for compliance verification, refund limits and sensitive actions.", note: "A denied tool must not run.", warning: "Backend authorization is still required; hooks alone cannot secure bypassed execution paths." },
      { title: "PostToolUse output normalization", keywords: "PostToolUse · updatedToolOutput", body: "PostToolUse runs after the tool, before the model processes its result. It can replace or enrich tool output so mixed backend formats become consistent. updatedToolOutput is the modern replacement field; updatedMCPToolOutput is a deprecated MCP-only form.", note: "PostToolUse does not reverse a side effect." },
      { title: "Normalize tool-specific data", keywords: "Unix timestamp · ISO 8601 · status enum", body: "Convert Unix seconds to milliseconds before making an ISO timestamp; parse DD/MM/YYYY using an explicit contract rather than guessing locale; map numeric/string statuses using the specific service's definitions.", note: "Format normalization must be deterministic and source-aware." },
      { title: "Choosing prompt or hook", keywords: "deterministic enforcement · preference", body: "Use prompts for low-risk style guidance. Use hooks and execution gates for sensitive or mandatory conditions. Observe matching rules and test that interception actually executes for the target tool.", note: "Prevent before execution; normalize after execution." },
      { title: "Compaction hooks (supplement)", keywords: "PreCompact · PostCompact", body: "PreCompact and PostCompact concern conversation compaction rather than tool calls. They may support archiving or adding context around compaction events. They are supplementary to the guide's core PreToolUse/PostToolUse distinction.", note: "Compaction lifecycle hooks are not refund approval hooks." }
    ],
    summary: ["PreToolUse intercepts outgoing tool calls and can deny them.", "PostToolUse sees tool results after execution and may normalize them.", "PostToolUse cannot undo a side effect that already happened.", "Use updatedToolOutput when returning replacement tool output.", "Parse dates and status codes according to each tool's documented contract.", "Real Agent SDK hooks differ from a handcrafted Messages API middleware demonstration."],
    quiz: [
      { question: "Which hook should block a transfer before AML verification?", choices: ["PostToolUse", "PreToolUse", "PostCompact", "SubagentStop"], correct: 1, explanation: "PreToolUse runs before execution and can deny the tool call." },
      { question: "Where should Unix timestamps be normalized before Claude processes results?", choices: ["Only a prompt", "PreToolUse", "PostToolUse with updatedToolOutput", "No normalization"], correct: 2, explanation: "PostToolUse has access to tool results and can replace their output." },
      { question: "Can PostToolUse roll back a completed refund?", choices: ["Yes", "No, the tool has already run", "Yes with a longer prompt", "Only for MCP"], correct: 1, explanation: "Side effects require prevention before execution or a separate compensation transaction." },
      { question: "Which hook field can deny a PreToolUse invocation?", choices: ["updatedToolOutput", "permissionDecision", "stop_reason", "tool_result"], correct: 1, explanation: "PreToolUse hookSpecificOutput includes permissionDecision." },
      { question: "Which field replaces a tool's output in modern PostToolUse hooks?", choices: ["updatedInput", "updatedToolOutput", "tool_choice", "forkSession"], correct: 1, explanation: "updatedToolOutput is the current output-replacement field." },
      { question: "How should a simple Markdown style preference be handled?", choices: ["Always a blocking hook", "Prompt guidance", "Human financial approval", "Disable tools"], correct: 1, explanation: "A style preference normally does not require deterministic business enforcement." },
      { question: "What is risky about Date.parse('12/10/2026')?", choices: ["It is always unambiguous", "Regional day/month order may be confused", "It always throws", "It returns a session ID"], correct: 1, explanation: "Parse dates according to the input contract instead of relying on ambiguous formats." },
      { question: "What does PreCompact primarily relate to?", choices: ["Blocking refunds", "Normalizing tool outputs", "State before context compaction", "Choosing specialists"], correct: 2, explanation: "Compaction hooks are separate from tool execution hooks." }
    ],
    labTitle: "Pre/Post Interception with Visible Logs",
    steps: ["Define a status-reading tool and a restricted action tool.", "Show a pre-execution denial for an invalid action.", "Execute permitted tools and log raw output.", "Normalize tool output before the next model request.", "Compare this Messages API middleware with real Agent SDK hook APIs."]
  },
  6: {
    title: "Task Decomposition Strategies",
    intro: "Choose fixed pipelines when the processing steps are known. Choose adaptive decomposition when discoveries change the plan. For large code reviews, local passes followed by cross-file integration help avoid attention dilution.",
    bridge: "Lesson 1.2 assigned broad research scope. Lesson 1.6 chooses between fixed and adaptive work plans, then examines how multi-pass reviews preserve depth and cross-file consistency.",
    topics: [
      { title: "Fixed sequential pipelines", keywords: "prompt chaining · predetermined steps", body: "Define the stages up front and feed each stage's output into the next. This suits structured extraction, document processing and predictable review workflows. It is easier to monitor, but less adaptable to unexpected discoveries.", note: "Choose fixed stages when the task is structured." },
      { title: "Dynamic adaptive decomposition", keywords: "discover · plan · replan", body: "Investigate the task, build a plan, then revise the remaining subtasks as new dependencies and problems appear. This suits unfamiliar legacy systems, open-ended audits and unknown root causes.", note: "Unknown scope benefits from adaptive planning." },
      { title: "Match pattern to task", keywords: "structured vs open-ended", body: "Do not choose the most sophisticated-sounding pattern by default. Deterministic extraction fits a fixed pipeline, while debugging a system with unknown dependencies calls for adaptive investigation.", note: "Task characteristics determine the best decomposition." },
      { title: "Attention dilution", keywords: "single-pass overload · inconsistent coverage", body: "When too many files are reviewed at once, early files may get thorough feedback while later ones receive shallow comments; identical patterns may be judged inconsistently. This is the failure mode highlighted by the guide.", note: "Look for unequal depth and contradictory judgments across files." },
      { title: "Local passes plus integration", keywords: "per-file pass · cross-file integration", body: "Review each file separately for local issues, then run a dedicated integration pass to compare APIs, dependencies, data flow and inconsistent patterns. Independent local reviews can run in parallel; integration must wait.", note: "Batches without an integration pass may miss cross-file problems." },
      { title: "Measure review quality", keywords: "coverage · consistency · contradictions", body: "Compare single-pass with multi-pass results. Inspect line-level issue coverage, consistent severities, repeated patterns and issues spanning file boundaries. A larger model alone does not replace better decomposition.", note: "Evaluate review quality, not just the number of findings." }
    ],
    summary: ["Fixed pipelines suit well-defined stages and schemas.", "Adaptive decomposition suits changing or unknown scope.", "Attention dilution appears as uneven per-item analysis.", "Use per-file reviews and a cross-file integration pass.", "Parallelize independent local work, not dependent integration.", "Measure evidence, depth and consistency instead of blindly increasing model size."],
    quiz: [
      { question: "You extract a fixed set of fields from documents. Which approach fits?", choices: ["Always adaptive", "Fixed sequential pipeline", "Fork sessions only", "Single giant prompt"], correct: 1, explanation: "The steps and schema are already defined." },
      { question: "You are exploring an unfamiliar legacy system with unknown dependencies. Which approach fits?", choices: ["Rigid fixed only", "Adaptive decomposition", "No planning", "Skip exploration"], correct: 1, explanation: "The plan needs to adapt as dependencies are discovered." },
      { question: "A review covers early files deeply but later files superficially. What is this?", choices: ["A tool permission problem", "Attention dilution", "Stale session history", "A handoff ID error"], correct: 1, explanation: "Large single-pass workloads may produce inconsistent coverage." },
      { question: "Best remedy for attention dilution across many files?", choices: ["Longer prompt alone", "Just upgrade the model", "Local file passes plus cross-file integration", "Ignore last files"], correct: 2, explanation: "Separate local attention from integration reasoning." },
      { question: "Why can batching without integration still fail?", choices: ["It always fixes everything", "Cross-batch issues may be missed", "It cannot run in parallel", "It implies a new session"], correct: 1, explanation: "Dependencies and inconsistent patterns may cross batch boundaries." },
      { question: "The same code pattern is criticized in one file and accepted in another. This suggests?", choices: ["Perfect consistency", "Inconsistent attention/coverage", "A valid reason to skip review", "A tool_use error"], correct: 1, explanation: "Contradictory judgments are a clue that the review structure needs work." },
      { question: "When can per-file local reviews run in parallel?", choices: ["Never", "When the local passes are independent", "Only after integration", "Only in a fork"], correct: 1, explanation: "Integration consumes the local results and must run afterward." },
      { question: "Debugging a changing unknown root cause calls for?", choices: ["Adaptive planning", "Only fixed extraction", "PostCompact", "Arbitrary batching"], correct: 0, explanation: "New findings should be able to change the investigation plan." }
    ],
    labTitle: "Per-File AI Reviews then Cross-File Integration",
    steps: ["Prepare several sample JS/TS modules and expected review criteria.", "Run independent local reviews with model calls.", "Log findings and token usage for every reviewed file.", "Run integration analysis after all local passes.", "Compare repeated issues and cross-file dependencies."]
  },
  7: {
    title: "Session State and Resumption",
    intro: "A resumed session retains prior conversation and tool results. Forking creates a branch from a shared baseline. Starting fresh with a curated summary avoids carrying stale tool outputs into a changed codebase.",
    bridge: "Lesson 1.3 introduced resume and fork; Lesson 1.7 adds the stale-context decision. Lesson 1.6's targeted analysis avoids unnecessary re-review of unchanged files.",
    topics: [
      { title: "Resume an existing session", keywords: "--resume · --continue", body: "Resume continues a stored session, preserving prior conversation history and tool results. It is useful when the environment has not changed significantly and previous context remains trustworthy. It does not create a new session.", note: "Resume is for continuation with valid history." },
      { title: "Fork an independent branch", keywords: "fork_session · forkSession", body: "Fork uses a previous session as its starting point but continues on a separate branch. In the Agent SDK's V1 query interface, forkSession can accompany resume. A fork retains the source history; it does not clean stale results.", note: "Fork is for divergent experiments, not simple continuation." },
      { title: "Fresh session with a summary", keywords: "fresh start · structured summary", body: "Start a new session and inject a curated summary when old tool results are no longer reliable. Keep validated findings and clearly list changed files and open questions, rather than reusing raw stale outputs.", note: "Fresh context can preserve useful knowledge without retaining obsolete raw reads." },
      { title: "Recognize stale context", keywords: "stale tool results · contradictory advice", body: "A previous session may have read files that have since been modified. Resuming can expose the model to both old and new versions, sometimes producing advice about code that no longer exists.", note: "Old tool outputs do not update automatically when files change." },
      { title: "Targeted re-analysis", keywords: "changed files · impact analysis", body: "If only three of fifty files changed, read the changed files and any newly affected dependencies, while retaining validated findings about unchanged regions. Re-scan the whole codebase only when the impact warrants it.", note: "Minimize unnecessary reads without overlooking dependencies." },
      { title: "The session decision matrix", keywords: "continue · diverge · stale", body: "Continue a valid investigation using resume. Compare independent alternatives using fork. If source code, external data or context has gone stale, prefer a fresh session with structured summary and targeted reads.", note: "Choose by context validity and the purpose of the next step." }
    ],
    summary: ["Resume continues valid previous history.", "Fork creates divergent branches from a shared baseline.", "Fork does not remove stale tool results.", "Fresh session + curated summary replaces obsolete raw history.", "Re-read changed files and impacted dependencies.", "Do not confuse a Messages API conversation array with an Agent SDK persisted session."],
    quiz: [
      { question: "You stopped debugging yesterday; no files changed. What should you do?", choices: ["Fresh without summary", "Resume", "Fork", "Ignore all context"], correct: 1, explanation: "The prior history is still useful for continuation." },
      { question: "You want to compare two refactoring ideas from one baseline. Which action fits?", choices: ["Only resume", "Fresh without context", "Fork", "PreToolUse"], correct: 2, explanation: "Fork creates independent investigation branches." },
      { question: "Three of fifty files changed and a resumed assistant gives outdated advice. Cause?", choices: ["Attention dilution", "Stale context", "Missing citation", "A hook denial"], correct: 1, explanation: "Old file reads remain in the resumed history." },
      { question: "Best response when prior tool results are stale?", choices: ["Fork the old session", "Keep resuming without care", "Fresh session plus summary and targeted re-reads", "Never inspect code again"], correct: 2, explanation: "Curated context avoids obsolete raw results." },
      { question: "Does fork automatically remove stale tool outputs?", choices: ["Yes", "No, it copies previous context", "Only for branch A", "Only on the CLI"], correct: 1, explanation: "Forking retains its source history." },
      { question: "How should an excessively cluttered context be improved?", choices: ["Resume forever", "Start fresh with a carefully selected summary", "Increase randomness", "Use PostToolUse"], correct: 1, explanation: "A clean baseline reduces irrelevant accumulated tool outputs." },
      { question: "What does claude --resume do?", choices: ["Create a new session", "Continue an existing session", "Always fork a branch", "Delete prior results"], correct: 1, explanation: "Resume targets an existing session ID or name." },
      { question: "Only three files changed. What is a reasonable reanalysis scope?", choices: ["All fifty regardless", "Changed files and affected dependencies", "No files", "Always fork three times"], correct: 1, explanation: "Targeted delta analysis is efficient and reliable when impact is evaluated." }
    ],
    labTitle: "Resume, Fork and Fresh Context: Live Comparison",
    steps: ["Create a small shared analysis baseline using a Messages API call.", "Continue that conversation by appending a new user message (resume-like).", "Fork application-level history into two independent branches.", "Start a fresh conversation with only a curated summary.", "Compare prompts, responses and token usage; distinguish these operations from Agent SDK persisted sessions."]
  }
};

const source = (n:number) => n <= 2 ? foundationLessons[n as 1|2].source
  : n === 3 ? "https://claudecertificationguide.com/learn/1-agentic-architecture/1-3-subagent-invocation-context" : lessons[n].source;

function vietnamese(n:number): LearningContent {
  if (n === 3) return thirdVi;
  if (n <= 2) {
    const l=foundationLessons[n as 1|2];
    return {
      title: en[n].title, intro: l.goal, bridge: l.bridge,
      topics: l.topics.map(t=>({ title:t.title, keywords:t.english, body:t.explanation, note:t.examRule, code:t.example })),
      summary: n === 1 ? [
        "Đọc stop_reason để điều khiển vòng lặp; không kiểm tra text đầu tiên.",
        "tool_use → thực thi tool, thêm assistant tool_use và user tool_result vào history.",
        "end_turn → hoàn tất lượt assistant và trả kết quả.",
        "Số vòng tối đa chỉ là safety cap, không phải điều kiện thành công.",
        "Claude chọn tool dựa theo ngữ cảnh; code thực thi và validate input.",
        "Production còn có pause_turn, max_tokens, refusal và các trạng thái khác."
      ] : [
        "Coordinator là hub, chịu trách nhiệm phân rã scope, routing và synthesis.",
        "Không có shared memory mặc định giữa independent subagent invocations.",
        "Chọn đúng agent cần thiết và phân vùng scope không trùng lặp.",
        "Missing breadth → decomposition; missing depth → specialist context/retrieval.",
        "Coverage gap → targeted refinement rồi đánh giá lại.",
        "Model tự báo coverage 100% không thay thế verification nguồn."
      ],
      quiz: l.quiz.map(q=>({ question:q.question, choices:q.choices, correct:q.correct, explanation:q.explanation })),
      labTitle: n === 1 ? "Multi-Tool Agent Loop có log từng lượt" : "Hub-and-Spoke Coordinator có log",
      steps: n === 1 ? [
        "Khai báo công cụ lookup_demo_price và calculate_demo_total với JSON Schema.",
        "Gửi Messages API request và log stop_reason sau mỗi lượt.",
        "Thực thi tool, đưa tool_result đúng ID vào messages.",
        "Lặp tới end_turn hoặc chạm safety cap.",
        "In input_tokens/output_tokens và kết quả cuối."
      ] : [
        "Tạo goal nghiên cứu và danh sách category cần bao phủ.",
        "Giao tác vụ riêng cho hai specialist bằng Messages API calls.",
        "Log prompt, response và token usage mỗi agent.",
        "Coordinator kiểm tra coverage và refinement nếu thiếu.",
        "Synthesis nhận findings và hoàn tất."
      ]
    };
  }
  const l=lessons[n];
  return {
    title: l.title, intro:l.summary, bridge:l.related,
    topics:l.sections.map(t=>({ title:t.heading, keywords:t.keywords, body: t.body + (t.bullets ? " " + t.bullets.join(" ") : ""), note:t.warning || (l.pillars[0][1]), code:t.snippet, warning:t.warning })),
    summary: l.pillars.map(([label,desc])=>label + " — " + desc).concat(l.traps.slice(0,3)),
    quiz:l.questions.map(q=>({ question:q.question, choices:q.choices, correct:q.correct, explanation:q.explanation })),
    labTitle:l.exerciseTitle,
    steps:l.exerciseSteps
  };
}
export const course: Record<number,BilingualLesson> = Object.fromEntries(
  [1,2,3,4,5,6,7].map(n=>[n,{number:n,source:source(n),vi:vietnamese(n),en:en[n]}])
);
