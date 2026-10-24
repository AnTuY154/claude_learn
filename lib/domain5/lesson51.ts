import {reliabilityLesson} from "../domain5-builder.ts";
export const lesson51=reliabilityLesson(1,{
  "title": [
    "Context Window Management — Bảo toàn dữ kiện quan trọng",
    "Context Window Management — Protecting Critical Facts"
  ],
  "subtitle": [
    "Giữ số tiền, ngày, mã đơn qua nhiều lượt; hạn chế output dư và tổ chức findings để tránh bỏ sót.",
    "Preserve exact transactional facts across turns, trim verbose results and make key findings prominent."
  ],
  "scenario": [
    "Một trợ lý đặt tour giữ tiền cọc, ngày đi, booking ID và cam kết phòng biển. Sau nhiều lượt tóm tắt, bot chỉ nhớ 'có yêu cầu hoàn tiền' mà quên số tiền và mã đặt chỗ. Ba subagent còn gửi kết quả dài khiến synthesis bỏ sót thông tin giữa đầu vào.",
    "A travel-booking assistant handles deposits, dates, booking references and promised room features. Repeated conversation summaries erase amounts and booking IDs. Three research specialists also send verbose reports, burying important evidence in the middle."
  ],
  "bridge": [
    "Theo Task 5.1: kiểm soát cái gì đi vào context, không chỉ tìm cách tăng cửa sổ token. Dữ kiện giao dịch phải tồn tại ngoài phần hội thoại được tóm tắt.",
    "Task 5.1 asks what should enter context, rather than merely how to enlarge the token window. Preserve transaction facts outside the summarised narrative."
  ],
  "slug": "context-window-management",
  "duration": "45 minutes",
  "topics": [
    [
      "1. Context window chứa những gì?",
      "1. What consumes the context window?",
      "Mỗi lời gọi model nhìn thấy instructions, message history, kết quả tools và tài liệu đưa vào. Kết quả tra đơn 40 fields sẽ được mang theo ở các lượt sau nếu code gửi lại nguyên lịch sử. Cần chọn nội dung có ích cho nhiệm vụ và giữ provenance thay vì nhét toàn bộ dữ liệu.",
      "A request consumes its instructions, supplied conversation, tool outputs and documents. When an order lookup returns forty fields and your application resends history, that unnecessary data keeps occupying context. Preserve what the next decision requires, including source details, rather than passing everything.",
      "const nextPrompt={facts:caseFacts,history:summary,latest:message};\n// Trim irrelevant tool fields before appending results.",
      "Context budget là chất lượng lựa chọn dữ liệu; không chỉ kích cỡ token.",
      "Context quality depends on selective input, not only token capacity."
    ],
    [
      "2. Progressive summarisation làm rơi dữ kiện",
      "2. Progressive summaries can erase exact facts",
      "Tóm tắt hội thoại thường giữ ý chính nhưng làm mất amount, ngày, order number, phần trăm và lời khách hứa. Với refund $247.83 cho #8891, câu 'khách yêu cầu hoàn tiền' là không đủ để xử lý. Đừng yêu cầu model 'hãy nhớ mọi số' như biện pháp duy nhất.",
      "Summaries retain a general storyline but may erase exact amounts, dates, identifiers, percentages and customer expectations. Turning a $247.83 refund on order #8891 into 'the customer wants a refund' loses actionable details. A reminder to retain every figure does not make this safe.",
      "const narrative='Customer discussed a refund';\nconst facts={orderId:'#8891',refundAmount:'$247.83',date:'2024-03-03'};\n// Keep facts outside the summary.",
      "Tóm tắt phù hợp narrative, không phải nơi cất duy nhất của giao dịch.",
      "Summarise narrative, but do not store transactional details only in the summary."
    ],
    [
      "3. Persistent case facts block",
      "3. A persistent case facts block",
      "Tách dữ liệu quan trọng thành cấu trúc độc lập, đặt trong mọi prompt trước history tóm tắt. Mỗi vấn đề của cùng khách có entry riêng gồm customer ID, order ID, amount, date, status và expectations. Cập nhật block bằng dữ liệu đã xác minh; không để hai yêu cầu dùng nhầm số tiền nhau.",
      "Extract critical details into a separately maintained structured case facts block and include it in every request before the summarised conversation. Represent each issue separately, keeping verified customer ID, order ID, amount, dates, status and expectations. This prevents details of two cases from being mixed.",
      "const caseFacts={customerId:'C-4421',issues:[{orderId:'#8891',amount:247.83,status:'pending_refund'}]};\nconst prompt=['## Verified case facts',JSON.stringify(caseFacts),'## Summary',historySummary];",
      "Dữ kiện giao dịch không được đưa vào quá trình summarise narrative.",
      "Never let a narrative summariser become the sole keeper of transactional facts."
    ],
    [
      "4. Lost in the middle",
      "4. Structural mitigation for lost-in-the-middle",
      "Trong đầu vào dài, findings nằm giữa dễ bị giảm chú ý. Cho Key Findings Summary lên đầu rồi mới trình bày chi tiết từng nguồn dưới header riêng; giữ ngày và xuất xứ. Prompt 'đọc tất cả cẩn thận' không thay đổi vị trí evidence nên không phải cách sửa cấu trúc.",
      "In a long aggregated input, findings buried in the middle can receive less attention. Put Key Findings Summary first, followed by detailed results under clear source headings. Keep dates and citations. Repeating 'read carefully' does not change evidence placement.",
      "const document=['## Key findings','- Source A: date and amount','- Source B: eligibility','## Detailed findings',reportA,reportB].join('\\n');\n// Summary FIRST.",
      "Di chuyển key findings lên đầu thay vì nhắc model chú ý.",
      "Move key findings to the front rather than merely requesting more attention."
    ],
    [
      "5. Trim tool results trước khi vào history",
      "5. Trim tool results before they enter history",
      "Tool trả hàng chục trường nội bộ nhưng refund chỉ cần order_id, order_date, total_amount, return_eligible, item_description. Lọc trong tool implementation hay PostToolUse trước khi append tool_result. Đừng mất provenance hoặc loại fields cần cho quyết định. Lọc sau khi đã gửi vào history sẽ không lấy lại ngân sách cũ.",
      "A tool may return forty metadata fields where five are enough for a refund decision: order ID, date, total, eligibility and item description. Filter before appending the tool_result, at the tool boundary or a PostToolUse stage. Keep decision-critical source metadata. Cleaning later does not erase earlier history already sent.",
      "const needed=['order_id','order_date','total_amount','return_eligible','item_description'];\nconst trimmed=Object.fromEntries(Object.entries(raw).filter(([key])=>needed.includes(key)));",
      "Chỉ giữ fields cần thiết trước khi context bị phình.",
      "Keep task-relevant fields before the verbose result enters context."
    ],
    [
      "6. Stateless history và upstream results",
      "6. Stateless API and concise upstream findings",
      "Messages API stateless theo bài: ứng dụng phải chủ động gửi lại conversation history hữu ích ở mỗi request; đừng tự ý cắt turn rồi mong model nhớ. Với pipeline nhiều agent, upstream trả {claim, source, publicationDate, relevance} thay raw chain of thought. Dùng block facts ngoài phần history có thể tóm tắt.",
      "The lesson describes the Messages API as stateless: the application supplies the conversational context needed on every call. Arbitrary history truncation can erase continuity. In multi-agent pipelines, upstream specialists should return structured claims, sources, dates and relevance instead of verbose exploration traces.",
      "const researchFinding={claim:'Supplier revised terms',source:'contract.pdf',date:'2026-05-01'};\n// Synthesiser gets structured evidence, not raw research logs.",
      "Tối ưu từ upstream để downstream nhận dữ kiện chứ không phải hàng loạt log.",
      "Optimise upstream agent outputs to pass findings and provenance rather than raw logs."
    ],
    [
      "7. Prompt caching: đúng phạm vi bài thi",
      "7. Prompt caching and exam scope",
      "Guide giải thích caching tái dùng stable prompt prefix để giảm chi phí xử lý input: tools, system instructions và tài liệu cố định trước; dữ liệu thay đổi sau. Tuy nhiên guide ghi chi tiết triển khai caching vượt phạm vi kiến thức thi của Task 5.1. Trong đề, ưu tiên persistent facts, trimming và summary placement.",
      "The source explains prompt caching as reuse of stable prompt prefixes to reduce repeated input processing. Put stable tools and system material before changing messages. Crucially, the lesson explicitly excludes detailed cache implementation mechanics from exam scope; the exam emphasis remains persistent facts, result trimming and structural placement.",
      "const layout={staticSystem:'policies and reference terms',volatileUser:'new booking change'};\n// Cache awareness is relevant; cache TTL mechanics are not tested here.",
      "Biết tác dụng caching, đừng nhầm TTL hoặc breakpoints thành core exam requirement.",
      "Know what caching achieves without treating TTL mechanics as an exam objective."
    ]
  ],
  "questions": [
    [
      "Sau summarisation, bot quên chính xác số tiền và order ID. Cách tốt nhất?",
      "A summary has dropped the refund amount and order ID. What is the BEST fix?",
      "Tạo persistent case facts block chứa giá trị giao dịch và đưa vào mọi prompt.",
      "Maintain a persistent case facts block and include it in each request.",
      "Yêu cầu tóm tắt dài hơn.",
      "Tăng độ dài context mỗi lần.",
      "Bỏ toàn bộ các lượt chat cũ.",
      "Request a longer summary.",
      "Increase the context window for every request.",
      "Delete all earlier conversation turns."
    ],
    [
      "Một booking có hai khiếu nại với hai số tiền khác nhau. Giải pháp?",
      "A booking session contains two issues with different amounts. What is MOST appropriate?",
      "Lưu mỗi issue trong một entry riêng ở case facts block.",
      "Store each issue as a separate entry in the case facts block.",
      "Gộp hai amount thành tổng chung.",
      "Giữ mỗi issue bằng câu văn ngắn không ID.",
      "Chọn amount gần nhất.",
      "Combine the two amounts into one total.",
      "Keep a brief narrative without identifiers.",
      "Use only the most recent amount."
    ],
    [
      "Synthesis bỏ sót source nằm giữa report dài. Chọn gì?",
      "A synthesiser overlooks a source buried mid-report. Which change best addresses it?",
      "Đưa Key Findings Summary lên đầu và tách headers chi tiết.",
      "Put Key Findings Summary first and separate detailed findings under headings.",
      "Nhắc 'pay attention' ở cuối prompt.",
      "Chỉ tăng temperature.",
      "Bỏ headers để model đọc liên tục.",
      "Add a reminder to pay attention.",
      "Increase temperature.",
      "Remove headings to make a single continuous text."
    ],
    [
      "Tool trả 40 fields, cần 5 fields cho refund. Làm sao?",
      "An order tool returns forty fields but only five matter for refunds. What should you do?",
      "Lọc đúng fields trước khi ghi tool result vào history.",
      "Trim to relevant fields before appending the tool result.",
      "Giữ 40 fields vì có thể cần.",
      "Tóm tắt tool output sau 20 turns.",
      "Loại cả return_eligible.",
      "Keep all forty just in case.",
      "Summarise the tool output twenty turns later.",
      "Remove the return_eligible field too."
    ],
    [
      "Upstream agent gửi 30 trang log cho synthesis. Phương án?",
      "An upstream agent sends thirty pages of search logs to synthesis. Best response?",
      "Trả structured findings có claim, source và ngày.",
      "Return concise structured findings with claims, sources and dates.",
      "Truyền nguyên log sang mọi downstream agent.",
      "Chỉ gửi kết luận bỏ nguồn.",
      "Tăng max_tokens của tất cả calls.",
      "Pass the entire log to every downstream agent.",
      "Return conclusions without their sources.",
      "Increase max_tokens on every call."
    ],
    [
      "Khi tự cắt history ở Messages API, nguy cơ chính là gì?",
      "What is the main risk of arbitrarily dropping history from a stateless Messages API call?",
      "Mất conversational continuity và dữ kiện chưa lưu nơi khác.",
      "Losing conversational coherence and facts not persisted elsewhere.",
      "Claude tự đồng bộ history từ server.",
      "Mọi tool calls bị cấm.",
      "Caching tự phục hồi mọi turn đã xóa.",
      "Claude automatically syncs missing turns from server.",
      "All tool calls become unavailable.",
      "Caching recreates removed history."
    ],
    [
      "Câu hỏi thi hỏi về cache TTL chi tiết trong 5.1. Đọc guide như thế nào?",
      "A 5.1 study item focuses on detailed cache TTL implementation. What does the curriculum say?",
      "Chi tiết thực hiện cache nằm ngoài phạm vi kiểm tra của Task 5.1.",
      "Implementation details of caching are outside Task 5.1's tested scope.",
      "Phải ghi nhớ mọi TTL.",
      "Không cần biết caching tồn tại.",
      "Caching thay thế persistent facts.",
      "Memorise every cache TTL.",
      "Caching need not be understood at all.",
      "Caching replaces persistent case facts."
    ],
    [
      "Research source có citation nhưng bị rút thành một câu không nguồn. Fix?",
      "Synthesis collapses a cited finding into an unsourced sentence. Best mitigation within 5.1?",
      "Upstream truyền metadata nguồn tường minh và downstream bảo tồn nó.",
      "Require structured source metadata upstream and retain it downstream.",
      "Đưa reasoning dài hơn vào synthesis.",
      "Chỉ ghi câu trả lời ngắn nhất.",
      "Tắt headings nguồn.",
      "Send more verbose reasoning chains.",
      "Send the shortest possible answer without context.",
      "Remove source headings."
    ]
  ],
  "words": [
    [
      "context window",
      "cửa sổ ngữ cảnh",
      "Instructions, conversation and tool/doc content read per call."
    ],
    [
      "progressive summarisation",
      "tóm tắt lũy tiến",
      "Compressing prior turns can drop exact transactional fields."
    ],
    [
      "case facts block",
      "khối dữ kiện vụ việc",
      "Independent persistent facts included each turn."
    ],
    [
      "lost in the middle",
      "bỏ sót thông tin giữa",
      "Important findings may receive less attention when buried."
    ],
    [
      "tool trimming",
      "lọc kết quả công cụ",
      "Filtering irrelevant fields before appending results."
    ],
    [
      "stateless API",
      "API không giữ trạng thái hội thoại",
      "The application sends required history on each request."
    ],
    [
      "prompt caching",
      "bộ nhớ đệm prompt",
      "Reuse stable prompt prefixes to save input processing."
    ],
    [
      "upstream agent",
      "agent thượng nguồn",
      "Agent producing evidence for the next processing stage."
    ]
  ],
  "exercise": [
    [
      "Tạo case facts extractor",
      "Build a case facts extractor",
      "Trích orderId, amount, date và status riêng cho từng issue từ dữ liệu có kiểm chứng.",
      "Extract verified order IDs, amounts, dates and statuses into separate issue records."
    ],
    [
      "Giữ facts ngoài narrative summary",
      "Persist facts independently of summaries",
      "Tạo prompt builder đặt case facts trước history đã tóm tắt.",
      "Compose prompts with the case facts block ahead of summarised history."
    ],
    [
      "Trim kết quả tra đơn",
      "Trim the order lookup",
      "Chỉ giữ năm trường phục vụ refund, không lược return eligibility.",
      "Keep the five refund-relevant fields, including return eligibility."
    ],
    [
      "Thử mô phỏng 8 turns",
      "Simulate eight turns",
      "Tóm tắt narrative ở turn 4; xác nhận amount và order ID vẫn nguyên.",
      "Summarise narrative after turn four and assert exact facts survive."
    ],
    [
      "Ưu tiên key findings",
      "Front-load key findings",
      "Gộp nhiều findings với summary ở đầu và headers cho từng nguồn.",
      "Aggregate findings with a summary first and source-specific detailed headings."
    ]
  ],
  "table": [
    [
      "Quên số tiền sau tóm tắt",
      "Persistent case facts",
      "Không phụ thuộc chất lượng prose summary"
    ],
    [
      "Bỏ sót finding giữa context dài",
      "Key findings first",
      "Giảm tác động vị trí"
    ],
    [
      "Kết quả tool quá dài",
      "Trim before history",
      "Giảm token dư trong các turns"
    ]
  ],
  "commands": "npm run lab:domain5 -- 1"
});
