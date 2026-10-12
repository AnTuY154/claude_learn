// Bổ sung chuyên đề bám sát Task 1.1 và 1.2; không thay API demo đã có.
// Số câu + rubric cho phép test tự động và so sánh với 1.3–1.7.
export type FoundationQuestion = {
  question: string;
  choices: [string, string, string, string];
  correct: number;
  explanation: string;
  concept: string;
};
export type FoundationTopic = {
  title: string;
  english: string;
  explanation: string;
  example?: string;
  examRule: string;
};
export type FoundationLesson = {
  number: 1 | 2;
  goal: string;
  bridge: string;
  topics: FoundationTopic[];
  quiz: FoundationQuestion[];
  source: string;
};

export const foundationLessons: Record<1 | 2, FoundationLesson> = {
  1: {
    number: 1,
    goal: "Hiểu toàn bộ lifecycle của Messages API: Claude quyết định dùng tool, ứng dụng thực thi và giữ history, kết thúc khi stop_reason báo end_turn. Không lấy text hoặc số vòng làm tín hiệu hoàn tất.",
    bridge: "Bài 1.1 là lõi execution loop. Bài 1.2 mở rộng một agent thành nhiều specialist do coordinator điều phối; bản chất mỗi lượt vẫn phải nhận biết đúng tín hiệu hoàn tất.",
    source: "https://claudecertificationguide.com/learn/1-agentic-architecture/1-1-agentic-loops",
    topics: [
      {
        title: "Bốn bước của Agentic Loop", english: "Messages API · agentic loop lifecycle",
        explanation: "Bước 1 gửi messages + tools đến Claude. Bước 2 đọc stop_reason. Bước 3 nếu tool_use thì chạy toàn bộ tool calls, nối assistant response và tool_result (role user) vào history rồi gọi lại. Bước 4 nếu end_turn thì trả final answer. Lưu đầy đủ assistant content, không chỉ text.",
        example: "Request → Claude(tool_use) → execute tools → append tool_result → Claude(end_turn)",
        examRule: "Không dùng text, không dùng max turns để quyết định Claude đã hoàn tất."
      },
      {
        title: "Tín hiệu điều khiển là stop_reason", english: "tool_use · end_turn · protocol-level control",
        explanation: "tool_use nghĩa là còn công việc phải thực thi; end_turn nghĩa là lượt assistant kết thúc. Text block có thể xuất hiện cùng tool_use, kể cả ở vị trí đầu tiên. Vì vậy đọc content[0].type === 'text' rồi return là lỗi premature termination.",
        example: "if (response.stop_reason === 'tool_use') { /* handle tools */ }\nelse if (response.stop_reason === 'end_turn') { /* return answer */ }",
        examRule: "Đề cơ bản kiểm tra tool_use vs end_turn, đây là hai nhánh trọng tâm."
      },
      {
        title: "Tool result đi vào history như thế nào", english: "assistant tool_use · user tool_result · tool_use_id",
        explanation: "Lưu nguyên assistant message có tool_use; thực thi từng tool_use block; thêm một user message chứa tool_result block khớp tool_use_id. Nếu bỏ tool_result, Claude không nhìn thấy kết quả của công cụ ở vòng tiếp theo và không tiếp tục suy luận đúng.",
        example: "messages.push({ role: 'assistant', content: response.content });\nmessages.push({ role: 'user', content: [{ type: 'tool_result', tool_use_id: block.id, content: result }] });",
        examRule: "Nhầm role của tool result hoặc quên ghi assistant tool_use sẽ làm sai protocol."
      },
      {
        title: "Model quyết định tool, code thực thi", english: "model-driven decisions · tool definitions · input_schema",
        explanation: "Khai báo calculator và mock web-search bằng name, description, JSON Schema input_schema. Claude dựa vào tình huống để chọn một hay nhiều tool, không phải developer hard-code tool cố định. Nhưng code phải validate arguments, timeout, xử lý lỗi và side effects.",
        example: "tools = [{ name: 'calculator', description: 'Evaluate safe arithmetic', input_schema: { type: 'object', properties: { expression: { type: 'string' } }, required: ['expression'] } }]",
        examRule: "Model chọn tool ≠ model tự thực thi tool; không eval() biểu thức tùy ý."
      },
      {
        title: "Ba anti-pattern chấm dứt sớm", english: "content-type guessing · natural-language parsing · iteration cap",
        explanation: "Không kết thúc chỉ vì thấy text; không tìm từ khóa 'done' trong câu trả lời; không lấy MAX_ITERATIONS làm số vòng bắt buộc. tool_choice: 'any' có thể ép tool call ngay cả khi đã đủ dữ liệu, gây loop không cần thiết.",
        example: "BAD: if (response.content[0].type === 'text') break;\nGOOD: if (response.stop_reason === 'end_turn') break;",
        examRule: "MAX_ITERATIONS là safety net, không phải completion condition."
      },
      {
        title: "Những stop_reason khác ở production", english: "pause_turn · max_tokens · refusal · stop_sequence",
        explanation: "Bài thi 1.1 tập trung hai giá trị tool_use/end_turn. API thực tế còn có pause_turn (server-tool turn cần tiếp tục), max_tokens và model_context_window_exceeded (output không hoàn chỉnh), refusal và stop_sequence. Không tự suy luận mọi giá trị khác end_turn đều là tool_use; xử lý riêng theo contract SDK.",
        examRule: "Trả lời đề theo hai nhánh trọng tâm nhưng viết production loop phải xử lý trạng thái khác."
      },
      {
        title: "Test chuỗi hai công cụ và giới hạn an toàn", english: "sequential tools · safety cap · observability",
        explanation: "Cho Claude dùng mock search lấy giá, calculator tính tổng rồi mới end_turn. Log stop_reason, số lượt, tool name, kết quả lỗi và lúc safety cap kích hoạt. Tránh log secrets/PII và luôn ném lỗi hoặc báo partial khi chạm cap thay vì giả vờ hoàn tất.",
        examRule: "Bài Build Exercise đúng khi vòng lặp tiếp tục sau ít nhất hai lượt tool_use."
      }
    ],
    quiz: [
      { question: "Claude trả text block rồi tool_use block. Code thấy content[0].type là text nên return ngay. Lỗi ở đâu?", choices: ["Chưa nâng model", "Kiểm tra content thay cho stop_reason", "Thiếu max 30 turns", "Sai nhiệt độ model"], correct: 1, concept: "stop_reason", explanation: "Text và tool_use có thể cùng tồn tại; phải điều khiển theo stop_reason." },
      { question: "Claude trả stop_reason = tool_use với hai tool_use blocks. Ứng dụng nên?", choices: ["Dừng và trả lời", "Chỉ chạy tool đầu tiên", "Thực thi những tool đã yêu cầu và gửi tool_result đúng ID", "Tăng max_tokens rồi bỏ qua"], correct: 2, concept: "tool_use", explanation: "Một response có thể chứa nhiều tool calls; phải xử lý kết quả tương ứng từng tool_use_id." },
      { question: "tool_result của client tool phải được gửi với role nào ở Messages API?", choices: ["assistant", "user", "system", "developer"], correct: 1, concept: "history", explanation: "tool_use nằm trong assistant message; tool_result nằm trong user message tiếp theo." },
      { question: "Để Claude tính giá sau khi tìm sản phẩm, bước quan trọng sau web search là?", choices: ["Bỏ history để giảm tokens", "Append assistant tool_use và user tool_result trước lượt kế", "Dùng tool_choice:any", "Dừng tại search result"], correct: 1, concept: "history", explanation: "Claude cần nhìn thấy dữ liệu search tool trả về để quyết định calculator call." },
      { question: "MAX_ITERATIONS = 20 nên được hiểu là gì?", choices: ["Bắt buộc chạy 20 vòng", "Tín hiệu thành công", "Safety cap chống loop quá dài", "Thay cho end_turn"], correct: 2, concept: "safety cap", explanation: "Loop kết thúc bình thường bằng end_turn; cap chỉ giới hạn rủi ro." },
      { question: "Claude trả end_turn ngay ở vòng 2. Ứng dụng nên?", choices: ["Tiếp tục đến vòng 20", "Ép gọi calculator", "Dừng và trả câu trả lời", "Kiểm tra text chứa 'done'"], correct: 2, concept: "end_turn", explanation: "end_turn là tín hiệu kết thúc authoritative của basic loop." },
      { question: "Tình huống nào minh họa model-driven tool selection?", choices: ["Ứng dụng luôn chạy search rồi calculator dù query gì", "Claude chọn calculator nếu user hỏi phép tính và chọn search khi cần dữ liệu", "Chạy random một tool", "Không khai báo schema"], correct: 1, concept: "tool selection", explanation: "Model đọc task/context rồi chọn công cụ từ danh sách được khai báo." },
      { question: "Claude trả pause_turn trong production. Có nên coi đó là tool_use?", choices: ["Có, mọi giá trị khác end_turn là tool_use", "Không; cần xử lý riêng theo server-tool continuation", "Có, vì có text", "Không, cần bỏ mọi history"], correct: 1, concept: "production nuance", explanation: "Đề 1.1 nhấn mạnh hai nhánh, production API có stop_reason bổ sung." },
      { question: "tool_choice = 'any' có thể gây vấn đề gì?", choices: ["Tự giải quyết lỗi timeout", "Ép tool use dù model đã xong", "Làm tool_result biến mất", "Tự tắt SDK"], correct: 1, concept: "tool choice", explanation: "Ép gọi tool có thể làm loop tiếp tục không cần thiết." },
      { question: "Tool calculator nhận expression là chuỗi. Cách xử lý an toàn?", choices: ["eval(expression) trực tiếp", "Parse giới hạn toán học, validate đầu vào và giới hạn tính toán", "Cho phép bất kỳ JavaScript", "Tin model tuyệt đối"], correct: 1, concept: "tool safety", explanation: "Model-controlled input là không đáng tin; tuyệt đối không eval chuỗi tùy ý." }
    ]
  },
  2: {
    number: 2,
    goal: "Coordinator là hub: chọn subagent phù hợp, phân rã đủ breadth, truyền explicit context, tổng hợp kết quả và refine. Mọi trao đổi giữa specialist trong pattern bài thi phải quay qua coordinator.",
    bridge: "Lesson 1.1 giải quyết lifecycle một agent. Lesson 1.2 giải quyết ai gọi ai trong hệ nhiều agent. Lesson 1.3 chỉ rõ cấu hình Task/Agent tool và cách giữ metadata khi handoff.",
    source: "https://claudecertificationguide.com/learn/1-agentic-architecture/1-2-orchestration-patterns",
    topics: [
      {
        title: "Hub-and-spoke: coordinator ở trung tâm", english: "coordinator · specialist · hub and spoke",
        explanation: "Coordinator sở hữu intake, decomposition, dynamic selection, context routing, result aggregation, error handling và refinement. Subagents chuyên trách search, document hoặc synthesis. Trong pattern của đề thi, agent không truyền trực tiếp kết quả cho agent khác mà quay về hub.",
        example: "User → Coordinator → [Web, Document] → Coordinator → Synthesis",
        examRule: "Lợi ích của hub: observability, consistent error handling, controlled information flow."
      },
      {
        title: "Isolation giữa hai invocation", english: "isolated context · no shared memory",
        explanation: "Một subagent mới không tự thấy system prompt, coordinator history hay kết quả của lần gọi khác. Coordinator phải truyền task, goal, constraints và findings liên quan trong prompt. Kết quả trống hoặc sai có thể bắt nguồn từ input coordinator chứ không nhất thiết model specialist yếu.",
        example: "agentB({ goal, subtopic, priorFindings: resultsFromAgentA })",
        examRule: "Không đoán rằng tồn tại shared memory giữa tất cả subagents."
      },
      {
        title: "Dynamic subagent selection", english: "model-driven routing · select only necessary agents",
        explanation: "Câu hỏi đơn giản chỉ cần một specialist thì không chạy toàn bộ search → analysis → synthesis pipeline. Coordinator chọn agent dựa vào yêu cầu; routing liên quan đến tài nguyên, latency và context được chia sẻ.",
        examRule: "Always call all agents là anti-pattern lãng phí."
      },
      {
        title: "Scope partition và breadth coverage", english: "scope decomposition · disjoint subtasks · coverage",
        explanation: "Chia công việc thành các subtopics bổ sung nhau để tránh duplicate search. Nếu research năng lượng chỉ có solar/wind mà không có geothermal/tidal/biomass trong assignment, lỗi nguồn nằm ở decomposition chứ không phải phần synthesis.",
        example: "tasks = [{topic:'solar'}, {topic:'wind'}, {topic:'geothermal'}, {topic:'tidal'}, {topic:'biomass'}]",
        examRule: "Thiếu cả category → sửa breadth decomposition; một category nông → sửa specialist prompt/source."
      },
      {
        title: "Iterative refinement thay vì one-shot", english: "coverage audit · targeted re-delegation",
        explanation: "Coordinator so sánh research với original topic, đánh dấu well-covered/partial/missing và giao follow-up cho gap. Vòng refinement có ngưỡng quality hoặc safety bound. Đừng tuyên bố 100% evidence coverage chỉ vì một model tự chấm 100% — cần bằng chứng đủ.",
        examRule: "Coordinator là evaluator + router, không chỉ dispatcher một lần."
      },
      {
        title: "Chẩn đoán theo tầng gây lỗi", english: "root cause · decomposition vs retrieval vs synthesis",
        explanation: "Missing entire scope → decomposition. Có scope nhưng findings thiếu sâu → retrieval/context. Findings đủ nhưng report sai → synthesis/handoff. Chữa đúng nguồn gốc thay vì tăng số lượng agent vô mục đích.",
        example: "Missing music/film/writing when researching creative industries → coordinator failed to plan breadth.",
        examRule: "Câu hỏi root cause chọn tầng đầu tiên làm mất thông tin."
      },
      {
        title: "Giới hạn giữa exam pattern và SDK", english: "strict hub and spoke · nested delegation",
        explanation: "Đề thi dùng strict hub-and-spoke và xem direct peer-to-peer communication là sai. Một số sản phẩm Claude Code hiện hỗ trợ nested parent-child delegation, nên đây là quy tắc dành cho kiến trúc tình huống thi, không phải phát biểu mọi sản phẩm đều cấm subagent gọi agent.",
        examRule: "Đừng đánh đồng mô hình kiến trúc được yêu cầu với tất cả khả năng product."
      },
      {
        title: "Lưu ý phân loại scope trong ví dụ năng lượng", english: "example taxonomy · accuracy",
        explanation: "Guide đưa fusion vào test case bao phủ sáu mục. Về khoa học, nuclear fusion là công nghệ năng lượng tiềm năng chứ không tự động được xếp là nguồn năng lượng tái tạo; khi học đáp án cần hiểu nó là một mục do scenario yêu cầu, không suy rộng thành phân loại năng lượng.",
        examRule: "Đọc đúng scope mà đề giao, nhưng tránh lặp lại phân loại khoa học không chính xác."
      }
    ],
    quiz: [
      { question: "Coordinator chỉ giao solar và wind; report bỏ geothermal, tidal, biomass. Root cause?", choices: ["Document agent quá yếu", "Coordinator decomposition thiếu breadth", "Synthesis format markdown lỗi", "Thiếu agent thứ tư"], correct: 1, concept: "breadth", explanation: "Agent chỉ làm theo assignment; các category chưa từng được coordinator giao." },
      { question: "Câu hỏi chỉ yêu cầu phân tích một trang web. Coordinator nên?", choices: ["Luôn chạy toàn bộ 5 agents", "Chọn đúng specialist cần thiết", "Luôn fork 2 session", "Cho web agent nói trực tiếp với doc agent"], correct: 1, concept: "selection", explanation: "Dynamic selection giảm latency/cost mà vẫn đủ nhiệm vụ." },
      { question: "Synthesis không biết kết quả web agent đã xong. Điều gì cần kiểm tra?", choices: ["Context coordinator có truyền explicit findings chưa", "Tăng temperature", "Thay UI", "Xóa hết docs"], correct: 0, concept: "isolation", explanation: "Subagents không tự kế thừa history hoặc peer findings." },
      { question: "Người dùng cần nghiên cứu 2 nguồn độc lập, cách giảm duplication?", choices: ["Giao cả hai agent cùng truy cùng tài liệu", "Partition scope theo nguồn/subtopic", "Bỏ một phần yêu cầu", "Ép tool_choice:any"], correct: 1, concept: "partition", explanation: "Phân chia phạm vi rõ giúp findings đa dạng hơn và tránh làm trùng." },
      { question: "Sau vòng research, còn 2 missing subtopics. Coordinator nên?", choices: ["Dừng vì đã gọi agent", "Giao targeted follow-up rồi kiểm tra coverage lại", "Bắt synthesis bịa phần thiếu", "Tăng số lượt cố định"], correct: 1, concept: "refinement", explanation: "Iterative refinement cho phép phục hồi gaps có chủ đích." },
      { question: "Tại sao strict hub-and-spoke hữu ích?", choices: ["Bảo đảm model không thể sai", "Một điểm quan sát, xử lý lỗi và routing context", "Giảm luôn 100% tokens", "Bỏ JSON schema"], correct: 1, concept: "architecture", explanation: "Hub cung cấp observability, consistent error handling và controlled information flow." },
      { question: "Có scope nhưng specialist phân tích quá nông. Sửa ở đâu trước?", choices: ["Decomposition cho toàn bộ lĩnh vực", "Prompt/context và retrieval cho task hiện có", "Tăng số agent bất kỳ", "Xóa subtopic"], correct: 1, concept: "depth", explanation: "Thiếu depth khi assignment đã có thì kiểm tra nội dung task/source của specialist." },
      { question: "Có 100% theo đánh giá LLM. Có chắc toàn bộ evidence đã đúng?", choices: ["Có, model chấm 100%", "Không; coverage estimate cần kiểm chứng evidence", "Có nếu 6 subtopics", "Có nếu có nhiều calls"], correct: 1, concept: "verification", explanation: "Self-scored coverage không tự chứng minh nội dung research đầy đủ và đúng." },
      { question: "Trong bài thi hub-and-spoke, luồng đúng giữa hai specialist?", choices: ["Web agent gửi trực tiếp cho document agent", "Web → Coordinator → Document/Synthesis", "Các agent dùng global chat memory", "Synthesis luôn gọi tất cả tools"], correct: 1, concept: "routing", explanation: "Theo pattern bài thi, mọi thông tin đi qua coordinator; product có thể hỗ trợ nested delegation ở ngữ cảnh khác." },
      { question: "Một hệ thống luôn gọi 6 agent dù câu hỏi rất đơn giản, vấn đề?", choices: ["Tối ưu", "Bad dynamic selection, lãng phí", "Không có tool definitions", "Sự cố parsing ISO"], correct: 1, concept: "dynamic", explanation: "Coordinator nên chỉ gọi các specialist cần thiết." }
    ]
  }
};
