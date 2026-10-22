import {promptEngineeringLesson} from "../domain4-builder.ts";
export const lesson44=promptEngineeringLesson(4,{
  "title": [
    "Validation & Retry — Sửa lỗi nhờ phản hồi cụ thể",
    "Validation, Retry and Feedback Loops"
  ],
  "subtitle": [
    "Phân biệt lỗi schema và lỗi nội dung; retry đúng khi có dữ liệu để sửa, dừng khi nguồn thiếu hoặc mâu thuẫn.",
    "Distinguish structural errors from semantic ones; retry with actionable evidence, and stop when information is absent."
  ],
  "bridge": [
    "Bài 4.3 giúp tạo output đúng hình dạng. 4.4 bổ sung quy tắc nghiệp vụ và vòng phản hồi khi giá trị hợp schema vẫn sai.",
    "A structurally valid extraction can still be wrong; this lesson adds validators, repair prompts and clear escalation boundaries."
  ],
  "scenario": [
    "Phần mềm ghi nhận hóa đơn có ba dòng hàng nhưng model trích chỉ hai dòng, khiến calculated_total khác stated_total. Một hóa đơn khác hoàn toàn không có mã dự án, nhưng pipeline cứ retry và bịa mã. Hệ thống cần tự sửa lỗi có thể giải quyết và chuyển người xử lý lỗi thiếu nguồn.",
    "An invoice pipeline misses a line item, so extracted totals do not match the invoice. Another invoice truly lacks its project reference, yet blind retries keep inventing one. The system should repair fixable omissions whilst escalating missing source information."
  ],
  "slug": "validation-retry-loops",
  "duration": "45 phút / 45 minutes",
  "topics": [
    [
      "1. Structural errors khác semantic errors",
      "1. Structural versus semantic errors",
      "JSON parse lỗi, sai type và thiếu key thuộc lỗi cấu trúc. Tool strict schema có thể giảm/chặn những lỗi này với subset schema được hỗ trợ. Ngược lại, các con số đúng type nhưng cộng không ra tổng hay ngày bắt đầu sau ngày kết thúc là lỗi semantic. Muốn bắt buộc phải dùng logic riêng ngoài model.",
      "Malformed JSON, missing required keys and wrong types are structural errors. Strict schema tooling addresses supported structural constraints, but cannot guarantee business correctness. An arithmetic mismatch, swapped date or contradictory total is a semantic error requiring application-side logic.",
      "function validate(x){const sum=x.items.reduce((n,v)=>n+v.amount,0);return Math.abs(sum-x.stated_total)<0.01;}\\n// This catches validly typed but inconsistent numbers.",
      "Không dùng JSON Schema làm thay semantic validator.",
      "Structural validation and semantic validation solve different problems."
    ],
    [
      "2. Retry phải gửi lại đúng ba phần",
      "2. Retry with source, failed output and precise error",
      "Một retry kiểu 'hãy thử lại' không chỉ ra sai ở đâu. Đúng mẫu: gửi tài liệu ban đầu để re-examine, extraction bị lỗi để Claude thấy vị trí sai, và thông báo validator cụ thể ví dụ tổng các dòng £450 thay vì £500. Giới hạn số retry và lưu log của từng lần để tránh vòng lặp vô hạn.",
      "A blind 'try again' prompt gives no diagnosis. A useful retry contains the original document, the failed extraction and the specific validation error, such as a £450 line-item sum against a £500 stated total. Bound retry attempts and record outcomes to avoid endless repeats.",
      "const retry={source:originalDocument,failed:extraction,error:'Sum 450 differs from stated total 500'};\\n// Re-extract from source, rather than mutating total blindly.",
      "Ba phần là source + failed extraction + validation error.",
      "Send original evidence, incorrect output and an explicit failed rule."
    ],
    [
      "3. Lỗi có thể sửa: format, mapping, toán",
      "3. Retry only repairable errors",
      "Retry hữu ích khi nguồn thật sự chứa dữ liệu nhưng model đọc sai: đơn vị tiền không nhất quán, nested field sai, amount lấy nhầm cột hoặc bỏ sót line item. Với case tổng lệch, model được yêu cầu kiểm lại từng dòng trong tài liệu; chỉ chấp nhận khi số đã khớp qua phép tính độc lập.",
      "Retries can repair formatting inconsistencies, wrong nesting, values mapped into the wrong field and arithmetic omissions where all source details are available. In an under-totalled invoice, re-check line items against the original document and accept only after deterministic verification succeeds.",
      "const repairable=new Set(['format','wrong-field','missing-existing-line','arithmetic']);\\nif(repairable.has(error.kind)) return 'retry-with-feedback';",
      "Chỉ retry khi bằng chứng tồn tại trong input.",
      "A retry can correct use of available information, not manufacture missing evidence."
    ],
    [
      "4. Dữ liệu thật sự thiếu thì không retry",
      "4. Missing evidence requires null or escalation",
      "Nếu hóa đơn gốc không có purchase order hoặc reference, model không thể tự khám phá tài liệu khác chỉ qua retry. Trả null khi schema cho phép; nếu nghiệp vụ bắt buộc thì đưa hàng đợi human review hoặc yêu cầu bổ sung tài liệu. Lặp request chỉ tăng phí và khả năng hallucination.",
      "If the source genuinely lacks a purchase order, project reference or an external attachment, repeating the same prompt cannot recover the absent fact. Return null when allowed; otherwise route to human review or request the missing evidence. Repetition increases cost and fabrication risk.",
      "function decide(error){return error.missingFromSource?'human-review-or-null':'retry';}\\n// Do not invent data to make an invoice pass checks.",
      "Ranh giới thi hay hỏi: available-but-misread thì retry; absent thì escalate.",
      "Retry misread evidence, not genuinely absent data."
    ],
    [
      "5. Extract stated vs calculated và conflict flags",
      "5. Expose totals and conflicts in output",
      "Thêm stated_total lấy nguyên từ hóa đơn, calculated_total tính từ line items và total_discrepancy khi lệch. Nếu hóa đơn ghi thời hạn 30 ngày ở trang đầu nhưng 60 ngày ở trang cuối, giữ hai giá trị, đánh dấu conflict_detected thay vì chọn một. Boolean giúp downstream đưa case vào review.",
      "Expose both source-stated and calculated totals and flag discrepancies instead of silently overwriting one. For contradictions within the document, such as payment terms of both 30 and 60 days, preserve both values and set conflict_detected. Validation can then route the case to an operator.",
      "const out={stated_total:500,calculated_total:450,total_discrepancy:true,conflict_detected:false};\\n// A conflict in original source must not be 'fixed' by guessing.",
      "Schema nên hiển thị cả hai vế của mâu thuẫn để reviewer quyết định.",
      "Make discrepancies visible, not silently resolved."
    ],
    [
      "6. Validator code/Pydantic cung cấp lỗi chính xác",
      "6. Validators produce field-specific feedback",
      "Một lớp validation dùng JSON Schema hoặc Pydantic để bắt type; custom checks bắt các bất biến như end_date >= start_date, tổng tiền và mã tham chiếu hợp lệ. Thay vì log 'invalid', trả code lỗi, tên field, actual/expected để model hoặc người vận hành biết đúng hành động cần làm.",
      "Use schema validation or a Pydantic model for basic types, then custom field and cross-field checks for totals, chronological order and business references. Produce machine-readable error details containing the path, actual value and violated constraint rather than an opaque 'invalid' flag.",
      "function totalError(x){const got=x.lines.reduce((n,a)=>n+a.amount,0);return Math.abs(got-x.total)>0.01?{path:'total',expected:got,actual:x.total}:null;}",
      "Validator tốt sinh phản hồi cụ thể, retry vì thế mới có tác dụng.",
      "Field-specific diagnostics make correction actionable."
    ],
    [
      "7. Ghi detected_pattern để cải thiện review",
      "7. Use detected patterns for improvement loops",
      "Trong code review, finding nên có detected_pattern (cấu trúc code kích hoạt), file và line. Tổng hợp các pattern bị dismiss để phát hiện rule hay báo sai; sau đó quay lại tối ưu prompt, đánh giá trên tập có nhãn. Vòng lặp dài hạn không chỉ retry từng document mà còn cải thiện cả policy.",
      "For code-review outputs, record detected_pattern, file and line. Aggregate dismissed findings by triggering pattern to identify rules with poor precision. Revise those criteria and evaluate on labelled cases. This is continuous prompt improvement beyond retries on individual documents.",
      "const finding={file:'users.ts',line:42,detected_pattern:'unsanitised SQL concatenation',severity:'critical'};\\n// Measure dismissed findings grouped by detected_pattern.",
      "Đưa error và pattern vào dữ liệu giúp lặp cải tiến có đo lường.",
      "Retain explicit trigger patterns for measurable iterative refinement."
    ]
  ],
  "table": [
    [
      "JSON/type không hợp",
      "Schema/strict parsing",
      "Cấu trúc sai"
    ],
    [
      "Line items sót nhưng còn trong nguồn",
      "Retry + error cụ thể",
      "Có thể sửa"
    ],
    [
      "Reference hoàn toàn không có",
      "null hoặc human review",
      "Không tạo từ hư không"
    ],
    [
      "Hai thời hạn mâu thuẫn trong nguồn",
      "conflict_detected + review",
      "Không tự đoán bên đúng"
    ]
  ],
  "words": [
    [
      "Validation loop",
      "vòng kiểm chứng",
      "Check output against defined rules."
    ],
    [
      "Semantic error",
      "lỗi ngữ nghĩa",
      "Valid types but wrong or inconsistent values."
    ],
    [
      "Retry with feedback",
      "thử lại có phản hồi",
      "Re-run with source, failed output and specific error."
    ],
    [
      "Cross-field invariant",
      "bất biến giữa trường",
      "Rule involving multiple values."
    ],
    [
      "Pydantic",
      "thư viện kiểm chứng dữ liệu Python",
      "Typed model and validators."
    ],
    [
      "Stated total",
      "tổng ghi trên hóa đơn",
      "Total from the original document."
    ],
    [
      "Calculated total",
      "tổng tính từ dòng hàng",
      "Sum independently computed from items."
    ],
    [
      "Conflict detected",
      "đã phát hiện mâu thuẫn",
      "Flag for contradictory source statements."
    ],
    [
      "Detected pattern",
      "mẫu code kích hoạt",
      "Construct linked to a review finding."
    ]
  ],
  "questions": [
    [
      "Schema hợp lệ nhưng total sai là lỗi gì?",
      "A schema-valid invoice has a wrong total. Error type?",
      "Semantic validation error",
      "A semantic validation error",
      "JSON syntax error",
      "Missing required key",
      "Tool routing error",
      "JSON syntax error",
      "Missing required key",
      "Tool routing error"
    ],
    [
      "Retry hiệu quả cần những gì?",
      "What does an effective retry contain?",
      "Nguồn, output cũ, lỗi cụ thể",
      "Source, failed output and precise error",
      "Chỉ 'try again'",
      "Chỉ thông báo lỗi",
      "Chỉ output cũ",
      "Only 'try again'",
      "Only error text",
      "Only prior output"
    ],
    [
      "Line item bị sót nhưng có trong nguồn: làm gì?",
      "A source line item was omitted. What now?",
      "Retry với chi tiết tổng lệch",
      "Retry with the exact total discrepancy",
      "Bịa item",
      "Đánh dấu thành công",
      "Bỏ validator",
      "Invent an item",
      "Declare success",
      "Remove the validator"
    ],
    [
      "Không có mã tham chiếu trong nguồn: làm gì?",
      "The reference is absent from the source. What now?",
      "null hoặc chuyển người kiểm tra",
      "Return null or escalate",
      "Retry vô hạn",
      "Tự tạo mã hợp lệ",
      "Lấy từ tài liệu khác không có",
      "Retry indefinitely",
      "Invent a valid reference",
      "Guess from unrelated files"
    ],
    [
      "Hai payment terms khác nhau trong nguồn?",
      "Source text states conflicting payment terms. What now?",
      "Giữ hai giá trị, đánh dấu conflict",
      "Preserve both and flag a conflict",
      "Chọn ngẫu nhiên",
      "Tin trang đầu luôn",
      "Ép model tự quyết",
      "Choose at random",
      "Always trust first page",
      "Force model to guess"
    ],
    [
      "Cặp stated/calculated total có ích vì?",
      "Why capture stated and calculated totals separately?",
      "Phát hiện discrepancy minh bạch",
      "Expose discrepancies explicitly",
      "Thay mọi validation",
      "Giảm token luôn",
      "Bắt tool call tự động",
      "Replace all validation",
      "Always reduce token use",
      "Force a tool call"
    ],
    [
      "Lỗi 'invalid' chung chung kém ở đâu?",
      "Why is a generic 'invalid' error unhelpful?",
      "Không chỉ rõ field và rule vi phạm",
      "It omits the failed field and rule",
      "Luôn làm model chậm",
      "Chỉ áp dụng JSON",
      "Không lưu được log",
      "It always slows the model",
      "Only applies to JSON",
      "Cannot be logged"
    ],
    [
      "detected_pattern hỗ trợ quy trình nào?",
      "What is detected_pattern useful for?",
      "Tìm rule gây false positives",
      "Identifying frequently dismissed trigger patterns",
      "Tự tạo vulnerability",
      "Thay auth",
      "Vô hiệu schema",
      "Invent vulnerabilities",
      "Replace authorisation",
      "Disable schemas"
    ]
  ],
  "exercise": [
    [
      "Viết validator",
      "Write a validator",
      "Tạo hàm so sum(items) và stated_total có tolerance nhỏ.",
      "Implement a small-tolerance total comparison."
    ],
    [
      "Tạo retry payload",
      "Build a repair payload",
      "Đưa source, failed result và thông báo tổng lệch vào object.",
      "Include original source, failed extraction and a concrete error."
    ],
    [
      "Phân loại retryable",
      "Classify recoverability",
      "Chỉ retry khi evidence tồn tại, còn thiếu nguồn thì escalate.",
      "Retry only recoverable failures and escalate absent data."
    ],
    [
      "Tạo conflict flag",
      "Add conflict detection",
      "Giữ hai terms khác nhau; không chọn ngẫu nhiên.",
      "Preserve contradictory payment terms and flag the conflict."
    ],
    [
      "Kiểm tra đầu ra",
      "Verify repair results",
      "Chạy check.mjs và ghi lại pass/fail của fixture.",
      "Run check.mjs and record the fixture outcomes."
    ]
  ],
  "commands": "npm run lab:domain4 -- 4\\ncd domain4-workspaces/lesson44\\nnode check.mjs"
});
