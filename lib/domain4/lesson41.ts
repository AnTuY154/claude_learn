import {promptEngineeringLesson} from "../domain4-builder.ts";
export const lesson41=promptEngineeringLesson(1,{
  "title": [
    "System Prompts — Tiêu chí rõ ràng thay vì chỉ dẫn mơ hồ",
    "System Prompts with Explicit Criteria"
  ],
  "subtitle": [
    "Biến yêu cầu 'cẩn thận' thành quy tắc có thể kiểm tra: phải báo gì, bỏ qua gì, severity nào và khi nào chuyển người duyệt.",
    "Turn vague caution into testable inclusion, exclusion, severity and escalation rules."
  ],
  "bridge": [
    "Từ các tool và workflow ở Domain 1–3, bài này chuyển sang thiết kế chỉ dẫn ổn định cho một AI reviewer chạy trên nhiều input.",
    "After tools and workflows, define standing instructions that keep repeated review decisions consistent across inputs."
  ],
  "scenario": [
    "Một đội phát triển thương mại điện tử dùng Claude duyệt pull request. Prompt chỉ viết 'be conservative' khiến model báo hàng loạt tên biến chưa đẹp nhưng bỏ qua lỗi truy cập dữ liệu; developer dần bỏ qua mọi comment, kể cả lỗi security thật.",
    "An e-commerce team asks Claude to be conservative when reviewing pull requests. It floods developers with naming suggestions while missing access-control faults. Developers begin ignoring all comments, including genuine vulnerabilities."
  ],
  "slug": "system-prompts",
  "duration": "40 phút / 40 minutes",
  "topics": [
    [
      "1. System prompt là chỉ dẫn nền",
      "1. System prompts set standing instructions",
      "System prompt đặt vai trò, mục tiêu, phạm vi và quy tắc luôn áp dụng. Trong review code, nói 'chỉ báo vấn đề nghiêm trọng' không định nghĩa ranh giới quyết định. Hãy chuyển thành danh mục lỗi và điều kiện chứng minh được, ví dụ hành vi code trái yêu cầu hoặc thiếu kiểm tra quyền.",
      "A system prompt supplies standing goals, scope and rules. Saying 'only high-confidence issues' does not specify a decision boundary. Name observable defect categories, such as missing authorisation checks or code whose behaviour contradicts a documented requirement.",
      "const reviewPolicy = `Report reproducible bugs and security faults.\\nSkip naming, formatting and local style.\\nFor each finding, cite the exact triggering code.`;",
      "Prompt hữu ích cần tiêu chí quan sát được; tính từ như 'strict' hoặc 'conservative' không đủ.",
      "Operational categories outperform adjectives such as 'strict' or 'conservative'."
    ],
    [
      "2. Nói rõ report và skip",
      "2. Define both inclusion and exclusion criteria",
      "Nếu chỉ liệt kê những thứ phải báo, Claude vẫn có thể tạo noise ở vùng không được đề cập. Nêu hai chiều: report lỗi logic, lỗ hổng và comment nói sai hành vi; skip style không gây lỗi, pattern nội bộ đã chấp nhận và suy đoán không có bằng chứng. Với từng phát hiện phải có file, dòng và cơ sở cụ thể.",
      "An inclusion list alone leaves gaps in which the model may invent issues. Explicitly include functional faults, security vulnerabilities and misleading comments; exclude non-breaking style, accepted local conventions and unsupported speculation. Require location and evidence per finding.",
      "const scope = {report:['functional defect','security vulnerability','misleading behaviour comment'],skip:['naming preference','formatting-only change','unproved conjecture']};",
      "Đề bài hỏi giảm false positive: chỉnh ranh giới báo/bỏ qua, không tăng temperature hay token.",
      "To reduce false positives, fix report/skip boundaries before tuning decoding."
    ],
    [
      "3. Severity phải kèm code mẫu",
      "3. Calibrate severity with concrete examples",
      "Severity nhãn 'critical', 'major', 'minor' sẽ không nhất quán nếu chỉ giải thích chung. Minh họa pattern thật: query SQL nối chuỗi từ input của user là critical; một đổi tên biến không làm đổi behaviour là style và thường bị skip. Ghi rõ các ví dụ chỉ là mẫu phân loại và vẫn phải kiểm tra tác động thực tế.",
      "Severity labels drift when defined by abstract language alone. Anchor them in concrete patterns: concatenating untrusted input into SQL can be critical, whereas a harmless local naming inconsistency belongs to style and is normally excluded. The model still needs to establish an actual impact.",
      "// CRITICAL candidate: db.query('SELECT * FROM users WHERE id='+request.query.id);\\n// SKIP: renaming resultValue to result_value with identical behaviour",
      "Ví dụ gắn nhãn có hiệu lực hơn mô tả severity bằng tính từ.",
      "Severity calibration needs labelled code examples, not merely prose labels."
    ],
    [
      "4. False positive làm sụp niềm tin",
      "4. Noisy categories damage trust globally",
      "Khi reviewer báo hàng trăm lỗi style nhưng đa phần không đúng phạm vi, người dùng quen với việc bỏ qua tất cả. Precision của nhóm security tốt cũng không cứu được niềm tin khi cùng một bảng findings chứa nhiều noise. Hãy tách thống kê chất lượng theo category và đo cả số finding bị bác bỏ.",
      "When a category repeatedly produces bogus findings, developers stop attending to the entire review feed, not just that category. High precision in security findings cannot compensate for a flood of false style alarms. Track acceptance and dismissal rates per category, not only global counts.",
      "const stats = [{category:'style',reported:40,accepted:3},{category:'security',reported:8,accepted:7}];\\nconst precision = stats.map(x=>({category:x.category,value:x.accepted/x.reported}));",
      "Ưu tiên độ tin cậy toàn hệ thống hơn việc bật mọi loại cảnh báo.",
      "Preserve trust across the whole output rather than maximising noisy coverage."
    ],
    [
      "5. Tắt tạm nhóm báo sai, cải tiến rồi mở lại",
      "5. Disable a noisy category while refining it",
      "Nếu 'comment mismatch' liên tục bị bác bỏ, tắt tạm riêng category đó thay vì xóa toàn bộ hệ thống review. Thu thập ví dụ có nhãn đúng/sai, viết lại trigger cụ thể và chạy trên tập đánh giá trước khi bật lại. Không được âm thầm bỏ các loại lỗi quan trọng đã chính xác.",
      "If the misleading-comment category is generating too many false positives, temporarily disable that one category while testing revised criteria on labelled examples. Keep accurate security and functional checks enabled. Re-enable the category only after measured precision has improved.",
      "const enabled = {security:true,bugs:true,commentMismatch:false};\\n// Refine commentMismatch on a labelled evaluation set before restoring it.",
      "Lỗi nằm ở một category thì khoanh vùng category; không phá những nhóm đang hoạt động tốt.",
      "Quarantine the noisy category rather than disabling an otherwise useful reviewer."
    ],
    [
      "6. Confidence không thay thế policy",
      "6. Confidence is not a decision rule",
      "Điểm confidence do model tự báo không tự nhiên tương đương xác suất đúng. Chỉ dẫn 'lọc dưới 0.8' không sửa được ranh giới báo sai. Trước tiên định nghĩa tiêu chí; sau đó mới dùng confidence đã hiệu chuẩn trên dữ liệu gắn nhãn để chuyển trường hợp không chắc chắn cho người kiểm tra.",
      "A model's self-reported confidence is not automatically a calibrated likelihood of correctness. A threshold such as 0.8 does not explain which kinds of issues are valid. Define explicit criteria first; use confidence only for routing to human review once thresholds have been checked against labelled data.",
      "function route(finding){if(!finding.matchesExplicitRule)return 'discard';return finding.calibratedLowConfidence?'human-review':'report';}",
      "Thứ tự đúng: explicit criteria → kiểm chứng → confidence-based routing nếu cần.",
      "The correct order is explicit criteria, evidence, then calibrated routing if useful."
    ],
    [
      "7. Kiểm thử policy trên các trường hợp ranh giới",
      "7. Evaluate policy with boundary cases",
      "Đánh giá reviewer bằng tập mã có lỗi thật, trường hợp style chấp nhận được và trường hợp có thể gây tranh cãi. Gắn nhãn từng category và so precision/recall trước-sau. Lưu căn cứ phát hiện để developer hiểu model đã đối chiếu quy tắc gì; tinh chỉnh lỗi phổ biến nhất trước.",
      "Build a labelled set containing true faults, acceptable patterns and ambiguous boundaries. Measure precision and recall by category before and after changing the policy. Require each finding to point to an observable code pattern so maintainers can audit why it was raised.",
      "const fixtures=[{kind:'sql-injection',shouldReport:true},{kind:'rename-only',shouldReport:false},{kind:'wrong-comment',shouldReport:true}];\\n// Compare reviewer decisions against expected labels.",
      "Không đánh giá theo 'nghe có vẻ cẩn thận'; đánh giá trên các ca đúng/sai có nhãn.",
      "Test the prompt against labelled edge cases rather than judging its wording."
    ]
  ],
  "table": [
    [
      "Chỉ dẫn mơ hồ",
      "Explicit report/skip criteria",
      "Xác định ranh giới đúng/sai"
    ],
    [
      "Nhóm báo sai quá nhiều",
      "Tạm tắt đúng category và đánh giá lại",
      "Giữ niềm tin ở các nhóm tốt"
    ],
    [
      "Severity không ổn định",
      "Ví dụ code được gắn nhãn",
      "Giảm lệch phân loại"
    ],
    [
      "Finding ít chắc chắn",
      "Human review sau khi hiệu chuẩn",
      "Confidence không phải bằng chứng"
    ]
  ],
  "words": [
    [
      "System prompt",
      "chỉ dẫn hệ thống",
      "Standing instruction for repeated calls."
    ],
    [
      "Explicit criteria",
      "tiêu chí tường minh",
      "Observable rules defining valid findings."
    ],
    [
      "False positive",
      "cảnh báo sai",
      "A reported finding that is not a real issue."
    ],
    [
      "Precision",
      "độ chính xác của cảnh báo",
      "Share of reported issues that are truly valid."
    ],
    [
      "Severity",
      "mức độ nghiêm trọng",
      "Impact classification grounded in examples."
    ],
    [
      "Exclusion rule",
      "quy tắc bỏ qua",
      "Conditions under which no finding should be reported."
    ],
    [
      "Confidence calibration",
      "hiệu chuẩn độ tin cậy",
      "Comparing scores to labelled truth."
    ],
    [
      "Human escalation",
      "chuyển người đánh giá",
      "Route uncertain cases to a reviewer."
    ],
    [
      "Decision boundary",
      "ranh giới quyết định",
      "Line separating reportable and ignored issues."
    ]
  ],
  "questions": [
    [
      "Prompt chỉ ghi 'be conservative' thì thiếu gì?",
      "What is missing from a prompt saying 'be conservative'?",
      "Tiêu chí report và skip cụ thể",
      "Specific report and skip criteria",
      "Temperature thấp hơn",
      "Mô hình lớn hơn",
      "Nhiều tokens hơn",
      "Lower temperature",
      "A bigger model",
      "More output tokens"
    ],
    [
      "Claude báo hàng loạt lỗi naming vô hại. Chỉnh gì trước?",
      "Claude keeps flagging harmless naming. What first?",
      "Loại trừ style không ảnh hưởng behaviour",
      "Exclude non-breaking style findings",
      "Thêm 'be careful'",
      "Tăng confidence threshold tùy ý",
      "Bỏ hết security review",
      "Add 'be careful'",
      "Raise an arbitrary confidence threshold",
      "Turn off security review"
    ],
    [
      "Cách ổn định severity tốt nhất?",
      "How do you stabilise severity labels?",
      "Ví dụ code có gắn severity rõ ràng",
      "Labelled severity code examples",
      "Chỉ dùng mô tả 'rất nghiêm trọng'",
      "Giảm max_tokens",
      "Nhờ model đoán mức độ",
      "Use 'very serious' wording only",
      "Reduce max_tokens",
      "Let the model guess"
    ],
    [
      "Vì sao false positive ở style gây nguy hiểm?",
      "Why do style false positives matter beyond style?",
      "Làm developer bỏ qua cả cảnh báo thật",
      "They make developers disregard genuine alerts",
      "Làm tăng chi phí lưu code",
      "Thay đổi quyền GitHub",
      "Giảm context window",
      "They change code storage cost",
      "They change GitHub permissions",
      "They shrink context"
    ],
    [
      "Một category báo sai liên tục, category khác tốt: làm sao?",
      "One category is noisy but others work. What now?",
      "Tạm vô hiệu nhóm sai và tinh chỉnh riêng",
      "Temporarily disable and refine only the noisy category",
      "Tắt tất cả review",
      "Chuyển sang batch",
      "Bỏ log",
      "Disable all review",
      "Switch to batch",
      "Delete logs"
    ],
    [
      "Confidence 0.95 đảm bảo phát hiện đúng không?",
      "Does confidence 0.95 guarantee a correct finding?",
      "Không; confidence tự báo chưa hiệu chuẩn",
      "No; self-reported confidence is uncalibrated",
      "Có, luôn là 95% accuracy",
      "Có nếu dùng tool_use",
      "Có nếu thêm system prompt",
      "Yes, it means 95% accuracy",
      "Yes, with tool_use",
      "Yes, with any system prompt"
    ],
    [
      "Comment nói code gọi API nhưng code chỉ đọc cache: báo không?",
      "Comment claims an API call but code only reads cache. Flag it?",
      "Có, vì mô tả trái hành vi",
      "Yes, claimed behaviour contradicts implementation",
      "Không, comments không bao giờ báo",
      "Chỉ khi code chậm",
      "Chỉ khi tên biến xấu",
      "Never flag comments",
      "Only if slow",
      "Only if names are poor"
    ],
    [
      "Đánh giá thay đổi policy bằng gì?",
      "How should you evaluate a revised policy?",
      "Bộ ví dụ có nhãn và precision từng nhóm",
      "Labelled fixtures and per-category precision",
      "Cảm giác reviewer cẩn thận",
      "Một ví dụ duy nhất",
      "Tăng temperature",
      "Whether it sounds cautious",
      "A single happy-path example",
      "Higher temperature"
    ]
  ],
  "exercise": [
    [
      "Xác định phạm vi",
      "Define review scope",
      "Viết file review-policy.md gồm 3 nhóm report và 3 nhóm skip.",
      "Create review-policy.md with three report categories and three exclusions."
    ],
    [
      "Tạo cases có nhãn",
      "Create labelled cases",
      "Tạo fixture code đúng/sai và expected.json.",
      "Write passing/failing snippets and expected.json outcomes."
    ],
    [
      "Hiệu chuẩn severity",
      "Calibrate severity",
      "Viết ví dụ critical, major, skip và lý do.",
      "Add critical, major and ignored examples with justifications."
    ],
    [
      "Mô phỏng false positive",
      "Measure noisy findings",
      "Chạy script local tổng hợp accepted/rejected theo category.",
      "Run the local script to calculate category-level precision."
    ],
    [
      "Quyết định chuyển người",
      "Choose escalation",
      "Đặt rule đưa finding chưa rõ sang human review thay vì tự nhận chắc chắn.",
      "Route unresolved findings to human review rather than treating raw scores as truth."
    ]
  ],
  "commands": "npm run lab:domain4 -- 1\\ncd domain4-workspaces/lesson41\\nnode check.mjs"
});
