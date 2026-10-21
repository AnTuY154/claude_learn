import {promptEngineeringLesson} from "../domain4-builder.ts";
export const lesson46=promptEngineeringLesson(6,{
  "title": [
    "Multi-Pass Review — Reviewer độc lập và nhiều lượt",
    "Multi-Instance and Multi-Pass Review"
  ],
  "subtitle": [
    "Tách người tạo và người kiểm tra, review từng file rồi tích hợp; hiệu chuẩn confidence trước khi tự động routing.",
    "Use independent review invocations, focused local passes, cross-file integration and calibrated escalation."
  ],
  "bridge": [
    "Các bài trước xây chính sách, kiểm chứng, retry và tối ưu workload. Bài 4.6 kết hợp chúng thành kiến trúc review chất lượng cao cho code và tài liệu quan trọng.",
    "Combine explicit criteria, structured findings and validators into a review architecture that challenges original decisions."
  ],
  "scenario": [
    "Một PR Next.js sửa 14 files. Claude trong cùng session vừa tạo patch rồi tự review, khen hầu hết thay đổi; khi quét 14 files một lượt thì bỏ sót bug ở giữa và đánh giá cùng pattern hai cách khác nhau. Cần reviewer độc lập và hai lượt local/integration.",
    "A Next.js pull request changes 14 files. The same Claude conversation both writes the patch and reviews it, tending to confirm prior choices. A single broad review also skims middle files and contradicts itself. Independent reviewers and two focused passes are needed."
  ],
  "slug": "multi-pass-review",
  "duration": "50 phút / 50 minutes",
  "topics": [
    [
      "1. Self-review cùng session dễ thiên lệch",
      "1. Same-session self-review carries bias",
      "Khi model vừa viết code xong, context còn chứa quyết định và lập luận đã đưa ra. Prompt 'review carefully' không tách được bối cảnh đó, nên model có xu hướng bảo vệ giải pháp của chính mình. Mở invocation mới chỉ nhận code cần review và tiêu chí, không nạp lịch sử từng bước viết code.",
      "A generating model has its earlier choices and explanations in context. Asking it to review carefully in the same conversation does not remove that anchoring. Create a fresh invocation with the artefact, requirements and review criteria, but not the generator's decision history.",
      "const generated = await generateCode(task);\\nconst review = await reviewInFreshInvocation({code:generated,criteria:reviewRules});\\n// Never resume the generation conversation for independent review.",
      "Reviewer muốn độc lập phải có context mới, không chỉ prompt nhấn mạnh.",
      "Independent critique needs a fresh context, not stronger instructions inside the creator's session."
    ],
    [
      "2. Attention dilution ở review lớn",
      "2. One large review dilutes attention",
      "Context window lớn có thể chứa 14 files nhưng không bảo đảm model kiểm tra chúng với độ sâu ngang nhau. Dấu hiệu: file đầu nhận nhiều góp ý, file giữa bị bỏ sót, một mẫu lỗi được báo nơi này nhưng bỏ nơi khác. Chia công việc theo phạm vi kiểm tra cụ thể thay vì đơn thuần chọn model lớn hơn.",
      "A larger context window makes it possible to supply more code, not to guarantee uniform attention. Uneven findings, missed mid-file bugs and contradictory judgements signal attention dilution. Restructure the workload into focused passes rather than merely upgrading the model.",
      "const reviewUnits=files.map(file=>({name:file.name,scope:'local logic and security'}));\\n// Each unit gets an independent, focused review.",
      "Vấn đề là chất lượng phân bổ chú ý, không chỉ kích thước context.",
      "Attention quality requires focused passes, not just more context capacity."
    ],
    [
      "3. Pass 1: local review theo từng file",
      "3. Pass one: focused per-file analysis",
      "Gọi reviewer mới cho từng file và yêu cầu tìm bug, security issues, logic errors trong chính file đó. Có thể parallel nếu các file độc lập. Kết quả phải có file, line, severity, evidence và detected_pattern; giữ nguồn để pass hai xác minh. Không bắt local reviewer tự suy đoán toàn bộ dependency.",
      "Run a focused, preferably independent review on each file for local correctness, security and edge cases. Where units are independent, invoke them concurrently. Capture filenames, locations, evidence and trigger patterns so the next pass can validate and join findings without losing provenance.",
      "const local = await Promise.all(files.map(f=>reviewFileFresh({file:f,criteria:rules})));\\n// Keep per-file evidence and original file names.",
      "Lượt local bảo đảm từng file được soi riêng với depth tương đương.",
      "Local passes improve coverage and consistency of per-file scrutiny."
    ],
    [
      "4. Pass 2: kiểm tra tích hợp cross-file",
      "4. Pass two: cross-file integration",
      "Bug có thể nằm giữa controller và service dù từng file riêng không sai. Lượt integration nhận kết quả local và những đoạn code/contract liên quan, kiểm tra data flow, API mismatch, dependency conflicts và findings mâu thuẫn. Nếu chỉ đưa summary quá ngắn mà không có contract, reviewer không có đủ evidence; truyền phần liên quan một cách có chọn lọc.",
      "Integration defects can exist between individually plausible files: mismatched service contracts, incompatible assumptions or duplicate contradictory findings. The second pass receives per-file results plus relevant interface contracts and source excerpts. Avoid stripping essential evidence when compacting findings.",
      "const integrated = await reviewIntegrationFresh({localFindings:local,contracts:apiContracts});\\n// Check cross-file data flow and contradictory local conclusions.",
      "Hai pass khác vai trò: local tìm lỗi nội bộ, integration tìm lỗi giữa các phần.",
      "Local and integration passes test distinct classes of failure."
    ],
    [
      "5. Confidence dùng để routing, không coi là xác suất đúng",
      "5. Confidence is for routing, not proof",
      "Một finding có confidence 0.65 chỉ là tự đánh giá của model. Nếu muốn đưa low confidence cho người duyệt còn high confidence hiển thị trực tiếp, phải hiệu chuẩn trên tập finding đã được con người gắn nhãn; đo score có thực sự tương quan với tỉ lệ đúng. Không đặt ngưỡng 0.8 chỉ vì nghe hợp lý.",
      "A confidence field is a model-generated signal, not guaranteed statistical accuracy. Before routing high-confidence findings automatically and low-confidence ones to people, use labelled examples to check the relationship between scores and correctness. An arbitrary 0.8 threshold without calibration is not a defensible safety gate.",
      "const route = f => f.meetsExplicitCriteria && f.calibratedScore >= reviewedThreshold ? 'publish' : 'human-review';\\n// reviewedThreshold must come from labelled evaluation.",
      "Tiêu chí phát hiện phải tường minh và ngưỡng confidence phải được hiệu chuẩn.",
      "Explicit criteria plus labelled calibration, not a bare confidence number."
    ],
    [
      "6. Khi nào đáng chi phí nhiều lượt",
      "6. Spend extra review calls when stakes warrant it",
      "Review độc lập và nhiều lượt tốn thêm token, độ trễ và bước orchestration. Đáng triển khai với CI quan trọng, code liên quan tiền/riêng tư, compliance hoặc pipeline tài chính; không nhất thiết cho typo trong README. Có thể giới hạn theo rủi ro và tập trung review vào file thay đổi thật.",
      "Independent invocations and multi-pass review cost extra tokens, time and orchestration. They are worthwhile for release gates, financial processing, security-sensitive changes and compliance checks. A low-risk documentation typo may not justify the overhead. Apply focused review according to risk.",
      "function reviewDepth(change){return change.risk==='high'?'independent-multi-pass':'lightweight';}",
      "Chi phí phải tương xứng tác động của lỗi bỏ sót.",
      "Reserve expensive independent review for work where missed defects are consequential."
    ],
    [
      "7. Kết hợp với criteria, validation và feedback loop",
      "7. Combine criteria, validators and feedback loops",
      "Thiết kế hoàn chỉnh: generator tạo bản nháp; reviewer mới kiểm tra từng file với criteria đã chốt; lượt integration tìm lỗi cross-file; validator kiểm tra contract; finding mơ hồ chuyển người; kết quả dismiss quay lại cải thiện tiêu chí và calibration. Không để reviewer tự chạy thay đổi có side effects nếu chưa được cấp quyền.",
      "A robust pipeline generates an artefact, reviews units in fresh contexts against explicit criteria, checks integration across units, validates structured findings and escalates uncertainty. Reviewer dismissals feed back into criteria and confidence calibration. Keep review read-only unless explicit permissions authorise modifications.",
      "const pipeline=['generate','independent-local-review','integration-review','validate','route-or-escalate'];\\n// Audit each stage; grant review-only access by default.",
      "Review đáng tin cậy là kiến trúc nhiều lớp chứ không phải câu 'please double-check'.",
      "Reliable review is a layered workflow, not an exhortation to double-check."
    ]
  ],
  "table": [
    [
      "Model review chính output trong session cũ",
      "Fresh independent instance",
      "Giảm thiên lệch xác nhận"
    ],
    [
      "14 files bị review nông và bất đều",
      "One local pass per file",
      "Chống attention dilution"
    ],
    [
      "Bug ở ranh giới service/controller",
      "Cross-file integration pass",
      "Kiểm tra contract giữa files"
    ],
    [
      "Finding confidence thấp",
      "Human review sau calibration",
      "Không xem score thô là xác suất"
    ]
  ],
  "words": [
    [
      "Self-review",
      "tự kiểm tra",
      "Model critiques its own output in the same context."
    ],
    [
      "Independent instance",
      "lần gọi độc lập",
      "Fresh model invocation without generator history."
    ],
    [
      "Attention dilution",
      "phân tán chú ý",
      "Uneven attention over broad material."
    ],
    [
      "Local pass",
      "lượt duyệt từng phần",
      "Focused review of one file or unit."
    ],
    [
      "Integration pass",
      "lượt duyệt tích hợp",
      "Checks consistency across units."
    ],
    [
      "Cross-file issue",
      "lỗi giữa nhiều file",
      "Defect in interactions between modules."
    ],
    [
      "Confidence routing",
      "định tuyến theo độ tin cậy",
      "Send findings to auto-report or human review."
    ],
    [
      "Labelled validation set",
      "tập kiểm chứng có nhãn",
      "Human-verified examples for threshold calibration."
    ],
    [
      "Review bias",
      "thiên lệch đánh giá",
      "Tendency to confirm existing decisions."
    ]
  ],
  "questions": [
    [
      "Vì sao self-review trong cùng session kém?",
      "Why is same-session self-review less reliable?",
      "Còn bối cảnh quyết định cũ",
      "It retains the generator's decisions and anchoring",
      "Vì JSON sai",
      "Vì token luôn hết",
      "Vì tool_choice auto",
      "Because JSON breaks",
      "Because tokens always run out",
      "Because of auto tool choice"
    ],
    [
      "Giải pháp review độc lập là gì?",
      "What makes a reviewer independent?",
      "Invocation mới không chứa history generation",
      "A fresh invocation without generation history",
      "Thêm 'carefully' vào session cũ",
      "Tăng temperature",
      "Chỉ gọi cùng session hai lần",
      "Say 'carefully' in the same session",
      "Increase temperature",
      "Repeat in the same session"
    ],
    [
      "Single-pass 14 files hay bỏ sót do gì?",
      "What causes uneven coverage across 14 files?",
      "Attention dilution",
      "Attention dilution",
      "Không đủ nút UI",
      "Thiếu JSON keys",
      "Không có custom_id",
      "Missing UI controls",
      "Missing JSON keys",
      "No custom_id"
    ],
    [
      "Pass 1 nên làm gì?",
      "What should the first review pass do?",
      "Review từng file để tìm local issues",
      "Review each file for local issues",
      "Đăng PR comments trước",
      "Tổng hợp cross-file trước",
      "Tự merge",
      "Post comments first",
      "Integrate first",
      "Merge automatically"
    ],
    [
      "Pass 2 kiểm tra gì?",
      "What does integration review focus on?",
      "Contract và data flow giữa file",
      "Cross-file contracts and data flow",
      "Chỉ tên biến từng file",
      "Chỉ format HTML",
      "Chỉ latency batch",
      "Local names only",
      "HTML formatting only",
      "Batch latency only"
    ],
    [
      "Context window lớn có tự xử lý attention dilution?",
      "Does a larger context window solve attention dilution?",
      "Không; vẫn cần các lượt tập trung",
      "No; focused passes are still needed",
      "Có, luôn",
      "Có nếu >1 triệu tokens",
      "Có nếu structured JSON",
      "Yes, always",
      "If over a million tokens",
      "With structured JSON"
    ],
    [
      "Confidence 0.9 đủ để auto-publish không?",
      "Does a reported confidence of 0.9 justify auto-publishing?",
      "Chưa; cần calibrated threshold",
      "Not without a calibrated threshold",
      "Có, là 90% độ đúng",
      "Có nếu cùng session",
      "Có nếu review lớn",
      "Yes, it proves 90% accuracy",
      "Yes in the same session",
      "Yes for large reviews"
    ],
    [
      "Khi nào nhiều lượt đáng chi phí?",
      "When is multi-pass review worth its extra cost?",
      "Thay đổi ảnh hưởng production/security",
      "High-impact production or security changes",
      "Mọi typo trong README",
      "Chỉ dự án cực nhỏ",
      "Không bao giờ",
      "Every README typo",
      "Only tiny projects",
      "Never"
    ]
  ],
  "exercise": [
    [
      "Chuẩn bị codebase nhỏ",
      "Create a small codebase",
      "Dùng fixture nhiều module có API contract để kiểm tra.",
      "Use multi-module fixtures with an API contract mismatch."
    ],
    [
      "Review độc lập",
      "Separate generation from review",
      "Tách prompt người tạo và người duyệt, không nối history cũ.",
      "Create separate generator and reviewer prompts without shared history."
    ],
    [
      "Local pass",
      "Run per-file checks",
      "Kiểm từng file riêng và ghi findings có đường dẫn nguồn.",
      "Inspect each file separately and record located findings."
    ],
    [
      "Integration pass",
      "Run integration checks",
      "So sánh contract giữa modules và các findings mâu thuẫn.",
      "Compare module contracts and contradictory findings."
    ],
    [
      "Định tuyến findings",
      "Route uncertain findings",
      "Dùng labelled examples để thảo luận calibration; không dùng số thô làm chứng cứ.",
      "Discuss score calibration against labelled cases; do not treat raw scores as proof."
    ]
  ],
  "commands": "npm run lab:domain4 -- 6\\ncd domain4-workspaces/lesson46\\nnode check.mjs"
});
