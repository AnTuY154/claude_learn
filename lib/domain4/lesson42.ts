import {promptEngineeringLesson} from "../domain4-builder.ts";
export const lesson42=promptEngineeringLesson(2,{
  "title": [
    "Few-Shot Prompting — Dạy bằng ví dụ có lý do",
    "Few-Shot Prompting"
  ],
  "subtitle": [
    "Dùng vài input/output có giải thích để ổn định định dạng, phân loại ranh giới và trích xuất từ văn bản không đều.",
    "Use a small number of worked input–output examples with justifications to stabilise format and judgement."
  ],
  "bridge": [
    "Bài 4.1 xác định tiêu chí. Bài 4.2 cho Claude thấy những trường hợp áp dụng tiêu chí đó, đặc biệt chỗ kết quả không nhất quán.",
    "Lesson 4.1 defines the criteria; this lesson demonstrates what correct application looks like at difficult decision boundaries."
  ],
  "scenario": [
    "Hệ thống quản lý đơn hàng có hai tool lookup_order và get_customer. Câu 'đơn hàng của tôi thế nào?' đôi khi bị route sang hồ sơ khách hàng. Một bộ ví dụ chỉ có input/output không đủ: cần mô tả vì sao số đơn hàng là dấu hiệu quyết định.",
    "An order-support agent has lookup_order and get_customer tools. Requests about a particular order are sometimes routed to a customer-profile lookup. Worked examples need not only the chosen tool but an explanation of why an order reference wins over broader account language."
  ],
  "slug": "few-shot-prompting",
  "duration": "40 phút / 40 minutes",
  "topics": [
    [
      "1. Few-shot là những ca đã làm mẫu",
      "1. Few-shot uses worked examples",
      "Zero-shot chỉ cung cấp chỉ dẫn, few-shot cho một số cặp input/output mẫu trong prompt. Ví dụ có thêm lý do chọn hành động giúp model học quy tắc khái quát chứ không thuộc mặt chữ. Không phải cứ thêm nhiều ví dụ là tốt; chọn đúng chỗ model hay sai.",
      "In zero-shot prompting, the model sees instructions without demonstrations. Few-shot prompting supplies worked input–output pairs. Including a brief decision rationale helps it infer a rule that transfers to novel input rather than merely memorising a phrase. Target observed failures, not every conceivable case.",
      "const examples=[{input:'Status of order #42?',tool:'lookup_order',why:'Specific order reference'}, {input:'Change my billing email',tool:'get_customer',why:'Account-level request'}];",
      "Few-shot nhắm vào ambiguity thực tế; mỗi example cần input, output và lý do.",
      "A useful demonstration includes input, expected output and decision rationale."
    ],
    [
      "2. Giữ format ổn định bằng mẫu đúng định dạng",
      "2. Demonstrate the exact output format",
      "Nếu yêu cầu xuất một bảng 3 cột nhưng model lúc viết danh sách, lúc trả đoạn văn, thêm instruction dài thường không hiệu quả bằng 2–4 mẫu có cùng khung output. Bảo đảm dấu tên field, loại dữ liệu và cách điền unknown đều được thể hiện nhất quán trong mẫu.",
      "When the model alternates between tables, bullets and prose despite detailed instructions, show a handful of outputs with the exact desired layout. Keep keys, types, ordering and unknown-value handling consistent across the examples. Demonstrations teach the pattern more concretely than another paragraph of prose.",
      "Input: 'Late parcel'\\nOutput: {category:'delivery',priority:'normal'}\\nInput: 'Refund not received'\\nOutput: {category:'payment',priority:'normal'}",
      "Lỗi format lặp lại → few-shot có cấu trúc chính xác thường hữu ích nhất.",
      "Repeated formatting drift is a strong signal to add precise demonstrations."
    ],
    [
      "3. Cases ranh giới phải có lý do",
      "3. Teach ambiguous tool routing with reasons",
      "Dạy cả ca có mã đơn hàng và ca chỉ hỏi tài khoản. Ví dụ đầu chọn lookup_order vì id chỉ một đơn cụ thể; ví dụ sau chọn get_customer vì thay đổi thông tin hồ sơ. Giải thích vì sao không chọn tool còn lại, nhất là khi câu có cả từ 'khách hàng' và 'đơn'.",
      "Include ambiguous queries near a routing boundary. If a request contains a specific order identifier, show why order lookup is appropriate despite account-related wording. Conversely, an address update without an order identifier belongs to customer profile management. Explain the plausible alternative that was rejected.",
      "// Example: 'Customer A asks where #953 is'\\n// tool: lookup_order\\n// why: concrete order identifier outweighs generic customer wording",
      "Chỉ ví dụ đầu ra mà không giải thích dễ khiến model khớp từ khóa máy móc.",
      "The rationale should identify the decisive cue and reject plausible alternatives."
    ],
    [
      "4. Trích xuất từ tài liệu nhiều cấu trúc",
      "4. Cover varied source document structures",
      "Document có thể chứa cùng thông tin ở bảng hoặc lời kể. Nếu model trích đúng bảng nhưng bỏ sót dữ liệu nằm trong đoạn văn, thêm example narrative với con số, đơn vị và nguồn; không bịa số khi nguồn không có. Chọn ví dụ đại diện cho format đã quan sát chứ không chỉ loại dễ.",
      "An extraction pipeline may succeed on tables but drop details embedded in prose. Show a narrative example with its extracted quantities, currency and location in the text, as well as a table example. If a field is genuinely absent, demonstrate a null value rather than guessing.",
      "Input: 'We shipped twelve cartons at £9 each.'\\nOutput: {quantity:12,unit:'carton',unit_price:9,missing_reference:null}",
      "Ví dụ đa dạng cấu trúc giúp hạn chế bỏ sót và fabricated values.",
      "Demonstrate extraction from the formats that actually cause omissions."
    ],
    [
      "5. Positive và negative examples để hạn chế cảnh báo sai",
      "5. Contrast genuine findings with acceptable patterns",
      "Code review nên có một ví dụ phải báo và một ví dụ style nên bỏ qua, kèm giải thích tác động. Nếu chỉ dạy các ca xấu, reviewer có thể báo cả những pattern vô hại gần giống. Những cặp đối chiếu này đặc biệt hiệu quả với variable shadowing, kiểm tra null và mức độ severity.",
      "Code reviewers learn better from contrasting examples: one genuine logic fault that must be reported, and one superficially similar but safe pattern that must be ignored. Only showing bad cases may teach the model to flag harmless local conventions. Include explanations tied to actual behaviour.",
      "// REPORT: amount < 0 accepted without validation\\n// IGNORE: inner 'result' shadows a name in an isolated callback with no bug",
      "Few-shot có ca nên báo và không nên báo giúp giảm false positive.",
      "Show both sides of a judgement boundary."
    ],
    [
      "6. Chọn 2–4 ví dụ trúng lỗi phổ biến",
      "6. Prefer two to four targeted demonstrations",
      "Theo hướng dẫn thi, khoảng hai đến bốn ví dụ được chọn kỹ thường đủ chứng minh pattern mà không phình token vô ích. Ưu tiên ví dụ có điểm khác nhau quan trọng và kết quả xác minh rõ, không dùng ví dụ na ná nhau hoặc trích dữ liệu nhạy cảm từ production.",
      "For this exam, two to four well-chosen examples are a practical default. Pick distinct failing patterns with verifiable outputs and avoid redundant near-duplicates. Redact real identifiers before turning production documents into prompt examples, and test whether new edge cases generalise.",
      "const fewShotSet = examples.slice(0,4); // curate, do not randomly truncate in production\\n// Assess hold-out cases separately from demonstration examples.",
      "Chất lượng và tính phân biệt của example quan trọng hơn số lượng.",
      "Diversity and relevance matter more than simply adding examples."
    ],
    [
      "7. Đo chất lượng ngoài tập ví dụ",
      "7. Evaluate on unseen cases",
      "Một model có thể trả đúng y nguyên ví dụ nhưng sai ở câu hỏi mới. Tạo hold-out gồm format bảng/narrative, yêu cầu mơ hồ, dữ liệu thiếu và cases gần giống lỗi thật. Đo accuracy, format compliance và false-positive rate trước/sau; thay ví dụ gây lệch khi thấy sai có hệ thống.",
      "A model may copy demonstration outputs yet fail on unseen inputs. Test with hold-out cases covering prose extraction, missing data and borderline tool routes. Compare correctness, format compliance and false positives before and after adding examples. Replace examples that introduce a systematic bias.",
      "const holdout=[{query:'Has order 77 shipped?',expected:'lookup_order'},{query:'Update phone',expected:'get_customer'}];\\n// Never count training examples as evaluation evidence.",
      "Few-shot phải được kiểm tra khả năng khái quát, không chỉ sao chép mẫu.",
      "Use held-out evaluation to verify generalisation, not memorisation."
    ]
  ],
  "table": [
    [
      "Format lúc bảng lúc prose",
      "2–4 ví dụ output cùng cấu trúc",
      "Tăng format consistency"
    ],
    [
      "Tool routing mơ hồ",
      "Ví dụ gần ranh giới + reasoning",
      "Học điều kiện quyết định"
    ],
    [
      "Trích xuất bỏ sót narrative",
      "Ví dụ từ table và prose",
      "Bao phủ cấu trúc tài liệu"
    ],
    [
      "False positive trong review",
      "Ví dụ report và skip",
      "Phân biệt pattern vô hại"
    ]
  ],
  "words": [
    [
      "Few-shot prompting",
      "gợi ý bằng vài ví dụ",
      "Prompts with worked demonstrations."
    ],
    [
      "Zero-shot",
      "không có ví dụ mẫu",
      "Instructions without demonstrations."
    ],
    [
      "Demonstration",
      "ví dụ đã làm mẫu",
      "An input-output pair showing expected behaviour."
    ],
    [
      "Decision rationale",
      "lý do ra quyết định",
      "Why one answer wins over alternatives."
    ],
    [
      "Ambiguous case",
      "trường hợp mơ hồ",
      "Input with multiple plausible interpretations."
    ],
    [
      "Format consistency",
      "tính nhất quán định dạng",
      "Stable presentation across outputs."
    ],
    [
      "Narrative extraction",
      "trích xuất từ đoạn văn",
      "Reading fields from prose rather than tables."
    ],
    [
      "Hold-out set",
      "tập kiểm thử riêng",
      "Unseen examples for evaluation."
    ],
    [
      "False positive",
      "cảnh báo sai",
      "Finding reported without a real fault."
    ]
  ],
  "questions": [
    [
      "Output thay đổi dạng dù prompt dài, thử gì trước?",
      "Output format drifts despite long instructions. Best next step?",
      "Thêm vài mẫu input/output đúng format",
      "Add a few precise input-output examples",
      "Tăng max_tokens",
      "Chỉ hạ temperature",
      "Thêm câu 'always consistent'",
      "Increase max_tokens",
      "Only lower temperature",
      "Say 'always be consistent'"
    ],
    [
      "Mẫu routing tool cần thêm thông tin nào?",
      "What makes a tool-routing example most useful?",
      "Lý do chọn và loại tool khác",
      "Why this tool beats a plausible alternative",
      "Chỉ câu query",
      "Chỉ tên tool",
      "Confidence tùy ý",
      "Only the query",
      "Only the tool name",
      "An arbitrary confidence score"
    ],
    [
      "Model bỏ sót số trong prose nhưng hiểu bảng: làm gì?",
      "Model extracts tables but misses prose. What helps?",
      "Ví dụ trích xuất từ narrative",
      "Demonstrate narrative extraction",
      "Bắt mọi field required",
      "Bỏ structured output",
      "Tăng retry vô hạn",
      "Make every field required",
      "Drop structured output",
      "Retry indefinitely"
    ],
    [
      "Một example shadowing không phải bug nên có ý nghĩa gì?",
      "Why include benign variable shadowing?",
      "Dạy reviewer khi nào không cần báo",
      "Teach the reviewer when not to flag",
      "Luôn nâng severity",
      "Biến lỗi style thành critical",
      "Giấu code khỏi model",
      "Always raise severity",
      "Make style critical",
      "Hide source code"
    ],
    [
      "Bao nhiêu mẫu được giáo trình gợi ý?",
      "How many worked examples does the guide suggest?",
      "Khoảng 2–4 mẫu có chọn lọc",
      "Roughly two to four targeted examples",
      "Ít nhất 50",
      "Chính xác 1",
      "Càng nhiều càng tốt",
      "At least 50",
      "Exactly one",
      "As many as possible"
    ],
    [
      "Query có order ID rõ ràng, tool nào phù hợp?",
      "A request includes a specific order ID. Which tool?",
      "lookup_order",
      "lookup_order",
      "get_customer",
      "search_everything",
      "create_refund",
      "get_customer",
      "search_everything",
      "create_refund"
    ],
    [
      "Tại sao chỉ test lại chính examples là chưa đủ?",
      "Why not evaluate only on demonstration examples?",
      "Có thể học thuộc mà không khái quát",
      "The model might memorise without generalising",
      "Vì ví dụ luôn sai",
      "Vì thiếu temperature",
      "Vì parser JSON không hoạt động",
      "Examples are always incorrect",
      "Temperature is missing",
      "The JSON parser is broken"
    ],
    [
      "Tài liệu không có purchase order, ví dụ nên thể hiện gì?",
      "The source lacks a purchase order. What should the example show?",
      "Giá trị null thay vì bịa",
      "A null value rather than fabrication",
      "Tạo số tham chiếu giả",
      "Lấy mã gần giống từ tài liệu khác",
      "Giấu field",
      "Invent a reference",
      "Copy a similar number from another file",
      "Suppress the field"
    ]
  ],
  "exercise": [
    [
      "Tạo baseline",
      "Record a baseline",
      "Viết 8 queries gây nhầm lẫn và expected tool.",
      "Write eight ambiguous queries with labelled expected tools."
    ],
    [
      "Viết 3 examples",
      "Author three demonstrations",
      "Mỗi example có input, output và why (lý do).",
      "Each demonstration includes input, output and justification."
    ],
    [
      "Thêm format template",
      "Add format examples",
      "Thể hiện JSON output nhất quán và null khi thiếu dữ liệu.",
      "Demonstrate consistent JSON and null for absent information."
    ],
    [
      "Tách hold-out cases",
      "Reserve unseen examples",
      "Không đưa ca kiểm thử vào prompt; đo lựa chọn trên tập mới.",
      "Keep evaluation examples out of the prompt and score unseen cases."
    ],
    [
      "So sánh trước/sau",
      "Compare outcomes",
      "Điền bảng baseline vs few-shot với sai routing và format.",
      "Compare misroutes and formatting errors before and after."
    ]
  ],
  "commands": "npm run lab:domain4 -- 2\\ncd domain4-workspaces/lesson42\\nnode check.mjs"
});
