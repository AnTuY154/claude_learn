import type { Domain2Content } from "../domain2-types";
export const lesson21:Record<"vi"|"en",Domain2Content> = {
  "vi": {
    "title": "Tool Interface Design — Thiết kế giao diện công cụ",
    "subtitle": "Vì sao Claude chọn nhầm get_customer khi người dùng hỏi đơn hàng #12345, và cách sửa tận gốc bằng tool descriptions?",
    "bridge": "Ở Domain 1 bạn học agentic loop: Claude chọn tool → ứng dụng thực thi → trả tool_result. Domain 2.1 đi sâu bước đầu tiên: nhờ thông tin gì Claude biết nên chọn công cụ nào?",
    "scenarioTitle": "Một chatbot Next.js gọi sai công cụ",
    "scenario": "Website thương mại điện tử có hai tool get_customer và lookup_order. Khách nhắn 'Kiểm tra đơn hàng #12345'. Claude lại gọi get_customer, nhận customerId sai định dạng rồi không tra được đơn. Hai description hiện chỉ ghi 'Retrieves customer information' và 'Retrieves order details'. Lỗi chủ yếu nằm ở cách diễn đạt ranh giới công cụ.",
    "sections": [
      {
        "title": "1. Tool description là giao diện ra quyết định",
        "explanation": [
          "Claude được cung cấp danh sách công cụ qua định nghĩa gồm name, description và input_schema. Description không chỉ là mô tả tài liệu cho developer; nó là tín hiệu ngôn ngữ chính để model quyết định tool nào phù hợp với yêu cầu người dùng.",
          "Khi hai tool có tên hoặc mô tả gần giống, model có thể nhầm chức năng ngay cả khi handler backend của cả hai đều đúng. Bước đầu phải kiểm tra mô tả trước khi đổ lỗi model hoặc viết bộ định tuyến mới."
        ],
        "code": "// MÔ TẢ MƠ HỒ — Claude thiếu ranh giới lựa chọn\nconst tools = [\n  { name: 'get_customer', description: 'Retrieves customer information', input_schema: {/* ... */} },\n  { name: 'lookup_order', description: 'Retrieves order details', input_schema: {/* ... */} }\n];",
        "keyPoint": "Root cause của misrouting giữa vài tool tương tự thường là description thiếu input, output và boundaries."
      },
      {
        "title": "2. Năm thành phần của production-grade description",
        "explanation": [
          "Một description đủ tốt phải có 5 phần: (1) chức năng chính, (2) input định dạng/giới hạn, (3) ví dụ yêu cầu phù hợp, (4) edge cases & limitations, (5) ranh giới rõ ràng với tool gần giống.",
          "Ví dụ get_customer nhận email, phone, customer ID để xác minh hồ sơ người dùng, KHÔNG dùng kiểm tra trạng thái đơn. lookup_order nhận mã #NNNNN hoặc tracking ID để trả về order status, items, shipping và khả năng refund, KHÔNG dùng xác minh danh tính."
        ],
        "code": "const lookupOrder = {\n  name: 'lookup_order',\n  description: [\n    'Finds one order by order number (#NNNNN) or tracking ID.',\n    'Returns status, items, shipping, and refund eligibility.',\n    'Example: check my order #12345.',\n    'If the identifier is invalid, return a validation error.',\n    'Do NOT use for customer identity; use get_customer.'\n  ].join(' '),\n  input_schema: {\n    type: 'object',\n    properties: { orderId: { type: 'string', pattern: '^#[0-9]{5}$' } },\n    required: ['orderId'], additionalProperties: false\n  }\n};",
        "keyPoint": "Description và JSON Schema phối hợp: description giúp model chọn đúng tool; schema ràng buộc cấu trúc tham số."
      },
      {
        "title": "3. Misrouting: sửa mô tả trước khi over-engineer",
        "explanation": [
          "Tình huống guide: agent thường gọi get_customer cho câu hỏi liên quan order. Nếu chỉ có hai công cụ với mô tả mơ hồ, giải pháp hiệu quả đầu tiên là làm rõ từng description và đo lại hiệu quả.",
          "Few-shot examples có thể hỗ trợ nhưng tăng token mà chưa chữa nguyên nhân. Routing classifier bổ sung hệ thống phức tạp. Gộp hai tool thành một cũng thay đổi contract nhiều hơn cần thiết. Chỉ cân nhắc biện pháp lớn khi descriptions tốt mà vẫn lỗi, hoặc có quá nhiều tools."
        ],
        "code": "// CASES cần đo trước/sau (đây KHÔNG phải kết quả mô hình)\nconst cases = [\n  { query: 'Check order #12345', expected: 'lookup_order' },\n  { query: 'Verify customer john@example.com', expected: 'get_customer' },\n  { query: 'Where is tracking ABC-9?', expected: 'lookup_order' }\n];\n// Sau từng request: lưu actualTool và so sánh với expected.",
        "keyPoint": "Diagnose first: toolkit nhỏ và descriptions giống nhau → làm rõ descriptions, không tăng kiến trúc.",
        "pitfall": "Không hứa mô tả mới chắc chắn đạt 10/10; phải gọi API thật và ghi actual tool_use của mỗi query."
      },
      {
        "title": "4. Khi nào cần tách tool và đổi tên?",
        "explanation": [
          "Một tool analyze_document trả lời đủ thứ: trích dữ liệu, tóm tắt, xác minh claim. Claude khó biết contract chính và handler khó xác thực output. Nếu chức năng có input/output khác bản chất, nên tách thành extract_data_points, summarize_content, verify_claim_against_source.",
          "Nếu hai tool làm việc khác nhau nhưng tên gần trùng, rename để nhấn vào domain. Ví dụ analyze_content không rõ là phân tích web hay file, đổi thành extract_web_results giúp giảm nhầm lẫn mà không phải đổi implementation."
        ],
        "code": "const capabilities = [\n  'extract_data_points',     // trả fields có cấu trúc\n  'summarize_content',       // trả tóm tắt văn bản\n  'verify_claim_against_source' // trả evidence đồng ý/phản bác\n];",
        "keyPoint": "Tách khi nhiều trách nhiệm KHÁC nhau; không gộp bừa chỉ để giảm số tool (so sánh Lesson 2.3)."
      },
      {
        "title": "5. Xung đột system prompt có thể làm mô tả tốt mất tác dụng",
        "explanation": [
          "System prompt ghi 'always check customer details before proceeding' có thể thúc đẩy model gọi get_customer cho mọi câu chứa 'customer', kể cả đơn hàng. Lúc này descriptions đúng vẫn bị chỉ dẫn mức cao hơn kéo lệch.",
          "Sau khi sửa tool descriptions, rà lại system prompt, test với câu chứa nhiều tín hiệu và nêu tiêu chí trước/sau rõ ràng. Nếu điều kiện xác minh thật sự bắt buộc vì bảo mật, enforcement phải đặt trong application/backend, không chỉ dựa vào mô tả."
        ],
        "code": "// MƠ HỒ: 'Always check customer details before anything.'\n// RÕ: 'Use lookup_order for order-specific queries.\n// Call get_customer only when identity lookup is needed.\n// If an action requires verification, backend must enforce it.'",
        "keyPoint": "Tool descriptions và system prompt phải nhất quán; bảo mật cần gate phía ứng dụng."
      },
      {
        "title": "6. Mối liên hệ giữa schema, selection và execution",
        "explanation": [
          "Đừng nhầm ba thời điểm: lựa chọn tool (Claude dựa vào mô tả), tạo arguments (input_schema gợi ý/ràng buộc cấu trúc), và chạy thật (tool handler phía ứng dụng phải validate mọi input và kiểm tra quyền).",
          "Dù một tool có JSON Schema chi tiết, model vẫn có thể chọn nhầm nếu description không nêu ranh giới. Ngược lại, mô tả xuất sắc cũng không được thay thế kiểm tra quyền và input server-side."
        ],
        "code": "// Tool handler phải validate lại, KHÔNG tin input do model đưa\nfunction lookupOrderHandler(input) {\n  if (!/^#[0-9]{5}$/.test(input?.orderId ?? '')) {\n    return { isError: true, code: 'INVALID_ORDER_ID' };\n  }\n  // Demo: kiểm tra quyền và truy vấn DB ở backend thật\n  return { orderId: input.orderId, status: 'DEMO_ONLY' };\n}",
        "keyPoint": "Description → chọn tool. Schema → shape tham số. Handler → validate, authorize và thực thi."
      }
    ],
    "table": {
      "headers": [
        "Triệu chứng",
        "Chẩn đoán",
        "Giải pháp ưu tiên"
      ],
      "rows": [
        [
          "Hai tool ít nhưng hay nhầm nhau",
          "Description overlap",
          "Viết đủ 5 phần và negative boundaries"
        ],
        [
          "Tool quá đa năng",
          "Trách nhiệm pha trộn",
          "Tách thành tool theo purpose"
        ],
        [
          "Names giống nhau",
          "Ambiguous naming",
          "Rename rõ domain"
        ],
        [
          "Description tốt nhưng vẫn chọn sai",
          "System prompt conflict",
          "Rà soát chỉ dẫn cấp cao"
        ],
        [
          "Trên 20 tool cùng agent",
          "Tool overload",
          "Scope hoặc consolidate — Lesson 2.3"
        ]
      ]
    },
    "vocabulary": [
      [
        "Tool Description",
        "mô tả công cụ",
        "Mô tả ngôn ngữ tự nhiên Claude dùng để lựa chọn công cụ."
      ],
      [
        "Input Schema",
        "lược đồ đầu vào",
        "JSON Schema nêu fields, type, required, format, constraints."
      ],
      [
        "Misrouting",
        "định tuyến sai",
        "Model gọi sai tool so với ý định của user."
      ],
      [
        "Boundary",
        "ranh giới công cụ",
        "Quy định khi dùng và khi KHÔNG dùng tool."
      ],
      [
        "Edge Case",
        "trường hợp biên",
        "Dữ liệu hoặc tình huống ngoài đường đi thông thường."
      ],
      [
        "Few-shot",
        "ví dụ mẫu trong prompt",
        "Một số ví dụ nhằm hướng dẫn hành vi model."
      ],
      [
        "Tool Splitting",
        "tách công cụ",
        "Chia tool đa năng thành các công cụ chức năng hẹp."
      ],
      [
        "System Prompt Conflict",
        "xung đột system prompt",
        "Chỉ dẫn cấp cao vô tình khiến tool selection lệch."
      ]
    ],
    "summary": [
      "Tool descriptions là yếu tố chính để model phân biệt khi nào gọi từng công cụ.",
      "Một description production-grade đủ mục đích, input, ví dụ, edge cases, boundaries.",
      "Toolkit nhỏ mà chọn sai → sửa description trước routing classifier hoặc few-shot.",
      "Tool có nhiều trách nhiệm khác nhau → tách; tên gây nhầm → đổi tên.",
      "Rà system prompt khi mô tả tốt mà model vẫn gọi sai.",
      "Phân biệt selection với validation và authorization lúc thực thi."
    ],
    "quiz": [
      {
        "question": "Hai tool get_customer và lookup_order bị nhầm, mỗi tool chỉ có mô tả một câu. Bước đầu hiệu quả nhất?",
        "choices": [
          "Thêm classifier riêng",
          "Mở rộng mô tả có boundaries",
          "Gộp hai tool thành một",
          "Bắt model luôn gọi get_customer"
        ],
        "correct": 1,
        "explanation": "Vấn đề gốc là hai mô tả mơ hồ. Sửa mô tả có input, ví dụ, edge case và ranh giới là can thiệp nhỏ, trực tiếp."
      },
      {
        "question": "Một description production-grade có bao nhiêu nhóm thông tin cốt lõi theo guide?",
        "choices": [
          "2",
          "3",
          "5",
          "8"
        ],
        "correct": 2,
        "explanation": "Gồm purpose, inputs, example queries, edge cases/limitations và explicit boundaries."
      },
      {
        "question": "'Use lookup_order, not get_customer, for #NNNNN' thể hiện phần nào?",
        "choices": [
          "Output schema",
          "Boundary",
          "Transport",
          "Authorization"
        ],
        "correct": 1,
        "explanation": "Boundary phân biệt chức năng giữa hai tool gần giống."
      },
      {
        "question": "Một tool analyze_document vừa extract, summarize vừa fact-check. Giải pháp hợp lý?",
        "choices": [
          "Đổi sang Opus",
          "Tách theo purpose",
          "Bỏ input_schema",
          "Chỉ tăng max_tokens"
        ],
        "correct": 1,
        "explanation": "Các chức năng khác contract nên tách purpose-specific tools."
      },
      {
        "question": "Đã sửa descriptions nhưng system prompt có 'always check customer details'. Cần làm gì?",
        "choices": [
          "Rà xung đột system prompt",
          "Xóa JSON Schema",
          "Cấm mọi tool",
          "Chạy classifier trước tất cả request"
        ],
        "correct": 0,
        "explanation": "Chỉ dẫn cấp cao có thể tạo liên kết từ khóa không mong muốn; phải xem lại prompt."
      },
      {
        "question": "Điều nào KHÔNG được mặc định?",
        "choices": [
          "Mô tả giúp model chọn tool",
          "Handler cần validate input",
          "Mô tả mới chắc chắn đúng 10/10",
          "Schema mô tả input"
        ],
        "correct": 2,
        "explanation": "Tool choice là hành vi model; cần đo bằng các request thực."
      },
      {
        "question": "JSON Schema có pattern #NNNNN thì backend còn phải validate không?",
        "choices": [
          "Không",
          "Có",
          "Chỉ khi model nhỏ",
          "Chỉ khi tool có hai input"
        ],
        "correct": 1,
        "explanation": "Dữ liệu model sinh ra không phải nguồn tin cậy; server vẫn kiểm tra schema và quyền."
      },
      {
        "question": "Nếu toolkit có 22 tool nhưng chọn sai nhiều, làm gì trước?",
        "choices": [
          "Chỉ tăng description mỗi tool",
          "Chẩn đoán overload và scope/consolidate",
          "Thêm 100 few-shot",
          "Bỏ tool_choice"
        ],
        "correct": 1,
        "explanation": "Lượng tool lớn gây decision complexity; Lesson 2.3 nói đến scope theo role hoặc gộp biến thể tương tự."
      }
    ],
    "lab": {
      "title": "Đo misrouting trước và sau khi cải thiện descriptions",
      "duration": "30 phút",
      "goal": "Tạo get_customer/lookup_order descriptions mơ hồ, chạy 10 queries thật bằng Claude Messages API và ghi actual tool selections; sửa đủ 5 yếu tố rồi so sánh.",
      "steps": [
        {
          "title": "Khai báo hai tool descriptions mơ hồ",
          "instruction": "Tool definitions giống nhau ở mức tối thiểu; handler demo không truy xuất dữ liệu thật.",
          "why": "Tái hiện nguyên nhân misrouting ở mức giao diện.",
          "expected": "Hai tools có name, input_schema nhưng descriptions chưa nêu boundary."
        },
        {
          "title": "Chạy 10 câu hỏi, ghi actual tool_use",
          "instruction": "Không gán cứng kết quả; cho model tự chọn tool_choice:auto.",
          "why": "Đo baseline bằng dữ liệu thực để tránh xác nhận thiên lệch.",
          "expected": "Bảng query/expected/actual, có thể có 0 hoặc nhiều lỗi (không bắt buộc 2-3)."
        },
        {
          "title": "Sửa 5 thành phần mô tả",
          "instruction": "Bổ sung purpose, input format, examples, limitations, do-not-use boundaries.",
          "why": "Xử lý trực tiếp tín hiệu chọn tool.",
          "expected": "Hai descriptions phân biệt rõ order và customer."
        },
        {
          "title": "Chạy lại 10 queries",
          "instruction": "So sánh accuracy và log token usage của hai lượt.",
          "why": "Kiểm chứng cải thiện bằng đo thực tế.",
          "expected": "Tính được accuracy trước/sau; không đảm bảo phải tăng."
        },
        {
          "title": "Audit system prompt",
          "instruction": "Kiểm tra câu 'always check customer details' và test lại với prompt không xung đột.",
          "why": "Chỉ dẫn system có thể ghi đè ý định tool description.",
          "expected": "Một danh sách conflict và cách viết lại rõ ràng."
        }
      ],
      "commands": "npm run lab:domain2 -- 1",
      "source": "scripts/domain2-labs.mjs",
      "disclaimer": "Cần ANTHROPIC_API_KEY và model hợp lệ; script gọi API thực và có thể phát sinh chi phí. Không giả mạo accuracy hoặc số lỗi."
    }
  },
  "en": {
    "title": "Tool Interface Design — Choosing the right tool",
    "subtitle": "Why does Claude call get_customer for an order query, and how do carefully written tool descriptions fix the underlying ambiguity?",
    "bridge": "Domain 1 explained the agentic loop. Task 2.1 focuses on how the model chooses a tool BEFORE the application executes it.",
    "scenarioTitle": "A Next.js support bot calls the wrong tool",
    "scenario": "A shopping assistant has get_customer and lookup_order. The user asks to check order #12345; Claude invokes get_customer instead. Both descriptions are vague, so the model lacks clear input and purpose boundaries.",
    "sections": [
      {
        "title": "1. Tool descriptions drive tool selection",
        "explanation": [
          "Claude receives tool definitions containing names, natural-language descriptions and input_schema. Descriptions are not decorative documentation: they guide the model in deciding which tool matches the request.",
          "With overlapping descriptions, selection can fail even when both backend implementations are correct. Diagnose the interface before building an extra router."
        ],
        "code": "// MÔ TẢ MƠ HỒ — Claude thiếu ranh giới lựa chọn\nconst tools = [\n  { name: 'get_customer', description: 'Retrieves customer information', input_schema: {/* ... */} },\n  { name: 'lookup_order', description: 'Retrieves order details', input_schema: {/* ... */} }\n];",
        "keyPoint": "Weak descriptions are a primary explanation for misrouting among a small collection of similar tools."
      },
      {
        "title": "2. Five elements of a production-grade description",
        "explanation": [
          "Include the tool's purpose, input formats and constraints, example user queries, edge cases/limitations, and explicit when-not-to-use boundaries.",
          "get_customer verifies identity through customer identifiers. lookup_order retrieves order details through order numbers such as #NNNNN. Each description should explicitly direct order queries away from the customer tool, and vice versa."
        ],
        "code": "const lookupOrder = {\n  name: 'lookup_order',\n  description: [\n    'Finds one order by order number (#NNNNN) or tracking ID.',\n    'Returns status, items, shipping, and refund eligibility.',\n    'Example: check my order #12345.',\n    'If the identifier is invalid, return a validation error.',\n    'Do NOT use for customer identity; use get_customer.'\n  ].join(' '),\n  input_schema: {\n    type: 'object',\n    properties: { orderId: { type: 'string', pattern: '^#[0-9]{5}$' } },\n    required: ['orderId'], additionalProperties: false\n  }\n};",
        "keyPoint": "Descriptions guide tool choice; JSON Schema expresses expected argument structure."
      },
      {
        "title": "3. Fix ambiguous descriptions before overengineering",
        "explanation": [
          "With just two confusingly described tools, improving descriptions is a low-effort fix addressing the root cause.",
          "Few-shot prompting adds context cost, a routing classifier adds infrastructure, and consolidation changes contracts. Use those only when evidence shows a more fundamental problem."
        ],
        "code": "// CASES cần đo trước/sau (đây KHÔNG phải kết quả mô hình)\nconst cases = [\n  { query: 'Check order #12345', expected: 'lookup_order' },\n  { query: 'Verify customer john@example.com', expected: 'get_customer' },\n  { query: 'Where is tracking ABC-9?', expected: 'lookup_order' }\n];\n// Sau từng request: lưu actualTool và so sánh với expected.",
        "keyPoint": "Evaluate actual selected tools on the same test queries before and after.",
        "pitfall": "Never claim a guaranteed 9/10 result without real model calls."
      },
      {
        "title": "4. When to split and rename tools",
        "explanation": [
          "A generic analyze_document may perform extraction, summarisation and evidence verification, each with different output contracts. Splitting such responsibilities makes the interface clear.",
          "A confusing name such as analyze_content can instead be renamed extract_web_results when that better reflects its existing role."
        ],
        "code": "const capabilities = [\n  'extract_data_points',     // trả fields có cấu trúc\n  'summarize_content',       // trả tóm tắt văn bản\n  'verify_claim_against_source' // trả evidence đồng ý/phản bác\n];",
        "keyPoint": "Split distinct responsibilities; rename ambiguous domain names."
      },
      {
        "title": "5. System prompts can conflict with tool descriptions",
        "explanation": [
          "An instruction such as 'always check customer details' may spur the model to call get_customer too broadly.",
          "Review system prompts after improving descriptions. Mandatory verification must be enforced by the application/backend, not merely by a prompt."
        ],
        "code": "// MƠ HỒ: 'Always check customer details before anything.'\n// RÕ: 'Use lookup_order for order-specific queries.\n// Call get_customer only when identity lookup is needed.\n// If an action requires verification, backend must enforce it.'",
        "keyPoint": "Tool interface and higher-priority instructions must work together."
      },
      {
        "title": "6. Selection, schema and execution are different stages",
        "explanation": [
          "The model selects a tool using descriptions, proposes structured arguments against the input schema, and the backend executes a handler.",
          "A good description does not eliminate the need for backend validation, access control or error handling."
        ],
        "code": "// Tool handler phải validate lại, KHÔNG tin input do model đưa\nfunction lookupOrderHandler(input) {\n  if (!/^#[0-9]{5}$/.test(input?.orderId ?? '')) {\n    return { isError: true, code: 'INVALID_ORDER_ID' };\n  }\n  // Demo: kiểm tra quyền và truy vấn DB ở backend thật\n  return { orderId: input.orderId, status: 'DEMO_ONLY' };\n}",
        "keyPoint": "Selection is not authorization; always validate model-generated inputs."
      }
    ],
    "table": {
      "headers": [
        "Symptom",
        "Diagnosis",
        "First remedy"
      ],
      "rows": [
        [
          "Two tools confused",
          "Description overlap",
          "Add full descriptions and negative boundaries"
        ],
        [
          "Overloaded generic tool",
          "Mixed purposes",
          "Split by purpose"
        ],
        [
          "Names are ambiguous",
          "Naming collision",
          "Rename with clear domain"
        ],
        [
          "Good descriptions still misroute",
          "System-prompt conflict",
          "Review higher-priority instructions"
        ],
        [
          "More than 20 tools",
          "Choice overload",
          "Scope or consolidate — Task 2.3"
        ]
      ]
    },
    "vocabulary": [
      [
        "Tool Description",
        "mô tả công cụ",
        "Natural-language signal helping the model select tools."
      ],
      [
        "Input Schema",
        "lược đồ đầu vào",
        "JSON Schema for parameters and constraints."
      ],
      [
        "Misrouting",
        "định tuyến sai",
        "Selecting a tool that does not fit the request."
      ],
      [
        "Boundary",
        "ranh giới",
        "When to use or avoid a tool."
      ],
      [
        "Edge Case",
        "trường hợp biên",
        "An unusual or limiting input condition."
      ],
      [
        "Few-shot",
        "ví dụ mẫu",
        "Examples embedded in prompts."
      ],
      [
        "Tool Splitting",
        "tách công cụ",
        "Dividing a mixed-purpose tool into focused tools."
      ],
      [
        "System Prompt Conflict",
        "xung đột prompt",
        "A higher-level instruction unintentionally biases selection."
      ]
    ],
    "summary": [
      "Descriptions are the main tool-selection signal.",
      "Five parts: purpose, inputs, examples, edge cases and boundaries.",
      "Fix unclear descriptions first when the toolkit is small.",
      "Split genuinely different responsibilities; rename unclear tools.",
      "Audit system prompts for keyword-triggered misrouting.",
      "Validate all model-proposed arguments on the backend."
    ],
    "quiz": [
      {
        "question": "With get_customer and lookup_order described vaguely, what's the best first fix?",
        "choices": [
          "Build a classifier",
          "Clarify descriptions and boundaries",
          "Consolidate immediately",
          "Force get_customer"
        ],
        "correct": 1,
        "explanation": "A small toolkit with weak descriptions needs purpose and boundary clarification first."
      },
      {
        "question": "How many key description elements does the guide identify?",
        "choices": [
          "2",
          "3",
          "5",
          "8"
        ],
        "correct": 2,
        "explanation": "The five are purpose, inputs, example queries, edge cases, and boundaries."
      },
      {
        "question": "'Use lookup_order, not get_customer, for #NNNNN' specifies what?",
        "choices": [
          "Output schema",
          "Tool boundary",
          "Transport",
          "Authorization"
        ],
        "correct": 1,
        "explanation": "It distinguishes correct from incorrect use of similar tools."
      },
      {
        "question": "A generic analyze_document extracts, summarises and fact-checks. What next?",
        "choices": [
          "Switch models",
          "Split by purpose",
          "Remove schemas",
          "Increase token budget"
        ],
        "correct": 1,
        "explanation": "Different input/output purposes should be separated."
      },
      {
        "question": "Descriptions improved, but the system prompt says 'always check customer'. What next?",
        "choices": [
          "Audit system-prompt conflicts",
          "Remove JSON Schema",
          "Disable all tools",
          "Build a routing classifier"
        ],
        "correct": 0,
        "explanation": "Higher-priority instructions can bias routing."
      },
      {
        "question": "Which assumption is unsafe?",
        "choices": [
          "Descriptions guide selection",
          "Backend validates",
          "Guaranteed 10/10 after rewrite",
          "Schemas shape inputs"
        ],
        "correct": 2,
        "explanation": "Model decisions require measurement; there is no guaranteed score."
      },
      {
        "question": "Does backend validation remain necessary with a JSON Schema?",
        "choices": [
          "No",
          "Yes",
          "Only for small models",
          "Only with two fields"
        ],
        "correct": 1,
        "explanation": "Never trust model-provided tool inputs without application validation."
      },
      {
        "question": "An agent has 22 tools and frequently misroutes. What should be diagnosed?",
        "choices": [
          "Rewrite all descriptions only",
          "Tool overload and role scope",
          "Add 100 few-shot examples",
          "Remove tool_choice"
        ],
        "correct": 1,
        "explanation": "High tool count adds decision complexity independent of individual description quality."
      }
    ],
    "lab": {
      "title": "Measure ambiguous vs production-grade tool descriptions",
      "duration": "30 minutes",
      "goal": "Run 10 real Messages API queries, measure actual selected tool names, improve descriptions and re-measure.",
      "steps": [
        {
          "title": "Define vague tools",
          "instruction": "Create two named tools with weak descriptions.",
          "why": "Reproduce an ambiguous interface.",
          "expected": "Tool definitions lack explicit boundaries."
        },
        {
          "title": "Run 10 queries",
          "instruction": "Use tool_choice:auto and log the actual tool_use name.",
          "why": "Establish a factual baseline.",
          "expected": "A table of expected vs actual selection, not invented results."
        },
        {
          "title": "Rewrite descriptions",
          "instruction": "Add purpose, formats, examples, limitations and boundaries.",
          "why": "Improve the selection signal.",
          "expected": "Tools are clearly differentiated."
        },
        {
          "title": "Repeat and compare",
          "instruction": "Run the same ten queries and print score and token usage.",
          "why": "Check whether the change helped.",
          "expected": "Real accuracy metrics, improvement not guaranteed."
        },
        {
          "title": "Check system prompt",
          "instruction": "Remove confusing keyword associations and retest.",
          "why": "Avoid conflicting instructions.",
          "expected": "Documented prompt revisions."
        }
      ],
      "commands": "npm run lab:domain2 -- 1",
      "source": "scripts/domain2-labs.mjs",
      "disclaimer": "Requires a paid Anthropic API key and available model; live results vary. No fabricated accuracy numbers."
    }
  }
};
