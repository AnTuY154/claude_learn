import {reliabilityLesson} from "../domain5-builder.ts";
export const lesson55=reliabilityLesson(5,{
  "title": [
    "Human Review & Confidence Calibration — Duyệt có trọng điểm",
    "Human Review and Confidence Calibration"
  ],
  "subtitle": [
    "Không tin accuracy tổng thể hay raw confidence; hiệu chuẩn từng field/doc type và sampling liên tục.",
    "Calibrate by document and field, sample even automated high-confidence outputs and prioritise scarce reviewers."
  ],
  "scenario": [
    "Một hệ thống trích invoice báo 97% accuracy tổng thể nên công ty định tự động toàn bộ. Nhưng hóa đơn in chuẩn đạt gần 99%, trong khi receipt viết tay và bản scan khó đọc chỉ 45–72% ở field ngày/tiền. Nhân viên duyệt ít, cần ưu tiên nhóm dễ sai và kiểm tra cả các kết quả máy tự tin.",
    "An invoice-extraction system reports 97% overall accuracy, but clean printed invoices dominate volumes whilst handwritten receipts and international scans underperform. A small human review team must protect risky fields and catch new errors even in high-confidence automated outputs."
  ],
  "bridge": [
    "Task 5.5 yêu cầu đo độ chính xác theo phân khúc, calibration trên labelled ground truth và kiểm tra liên tục, không tối ưu chỉ theo average.",
    "Task 5.5 demands segment-level accuracy, labelled confidence calibration and ongoing checks instead of trusting an aggregate average."
  ],
  "slug": "human-review-calibration",
  "duration": "55 minutes",
  "topics": [
    [
      "1. Aggregate accuracy che giấu rủi ro",
      "1. Aggregate metrics hide weak segments",
      "Accuracy toàn hệ thống 97% có thể chỉ do standard invoices chiếm đa số. Tách theo document type × field: date, amount, name; receipt viết tay, OCR kém và invoice quốc tế có thể rất thấp. Trước automation phải biết phân khúc nào thực sự đạt tiêu chuẩn.",
      "A 97% overall result can conceal unacceptable accuracy on rare but important document types. Validate per document type and field: dates, amounts and names across printed, handwritten, scanned and international sources. Only segments with demonstrated reliability justify automation.",
      "const segments=[{type:'printed',dateAccuracy:0.995},{type:'handwritten',dateAccuracy:0.60}];\n// Never approve both from one aggregate accuracy.",
      "Độ chính xác tổng thể không thể đại diện cho từng dạng dữ liệu.",
      "Aggregate accuracy is not evidence that every field and document format is reliable."
    ],
    [
      "2. Stratified random sampling",
      "2. Sample every stratum, including high confidence",
      "Lấy mẫu ngẫu nhiên có phân tầng theo loại giấy tờ, confidence band và field type. Không chỉ lấy low confidence: nhóm high confidence được tự động nên ít người nhìn, dễ che giấu novel systematic errors khi template nhà cung cấp đổi. Lấy mẫu định kỳ để đo drift và phát hiện pattern mới.",
      "Stratified random sampling selects cases within document types, confidence bands and field categories. Include high-confidence automated cases: unseen template changes may yield confidently wrong results no one reviews otherwise. Sampling measures sustained accuracy and detects novel failure patterns.",
      "const groups=['standard-high','handwritten-low','international-high','scanned-medium'];\n// Randomly sample within each group, including automated high-confidence records.",
      "Lấy mẫu high-confidence là điều kiện quan trọng của kiểm tra liên tục.",
      "Audit automated high-confidence outputs, not only cases already sent to humans."
    ],
    [
      "3. Field-level confidence không tự hiệu chuẩn",
      "3. Raw confidence is not calibrated probability",
      "Model gắn confidence 0.95 cho amount không đồng nghĩa đúng 95%. Cùng 0.90 ở date có thể đạt accuracy thực khác amount hoặc ở document type khác. Đừng dùng threshold nghe có vẻ hợp lý để quyết định tự động giao dịch.",
      "A model-reported confidence of 0.95 does not guarantee 95% correctness. The same score can correspond to different observed accuracy on dates and amounts or different document formats. Thresholds must be validated before routing decisions.",
      "const raw={date:{confidence:0.90},amount:{confidence:0.90}};\n// Equal scores do not prove equal empirical correctness.",
      "Raw confidence chỉ là tín hiệu, không phải xác suất đã kiểm chứng.",
      "A confidence score needs empirical calibration to become a trustworthy routing signal."
    ],
    [
      "4. Calibrate trên labelled validation set",
      "4. Use labelled ground truth and calibration curves",
      "Thu thập tài liệu có giá trị đúng do người xác nhận; chạy extraction, so từng field dự đoán với ground truth theo các confidence bands. Calibration curve biểu diễn 0.9 tương ứng accuracy thật ở từng segment. Sau đó thiết lập ngưỡng được chứng minh bằng dữ liệu cho automation/human.",
      "Use documents with human-verified correct field values. Compare each model extraction and its reported score to ground truth, grouping by field and confidence band. The resulting calibration curve shows observed accuracy at each score range and supports justified automation thresholds.",
      "const labelled=[{field:'amount',confidence:0.9,correct:false},{field:'date',confidence:0.9,correct:true}];\n// Estimate observed accuracy by field and confidence band.",
      "Hiệu chuẩn theo đúng field/segment thay vì dùng score của model làm sự thật.",
      "Calibrate scores per relevant segment on labelled examples."
    ],
    [
      "5. Routing theo ngưỡng đã hiệu chuẩn",
      "5. Calibrated routing and uncertain cases",
      "Field trên ngưỡng validated được tự động với stratified sampling; dưới ngưỡng hoặc ambiguous/contradictory source thì ưu tiên human. Không cho tất cả nhóm dùng một threshold khi curves khác nhau. Ngưỡng là quyết định dữ liệu/rủi ro, không phải constant tự tưởng tượng.",
      "Automate only the segments and fields whose thresholds have been validated, whilst continuously sampling them. Send under-threshold, ambiguous or contradictory extractions to people. Different field types may require different thresholds and risk considerations.",
      "const route=(field,validatedCutoff)=>field.ambiguous||field.calibratedScore<validatedCutoff?'human':'automate-and-sample';\n// Use a segment-specific validated cutoff.",
      "Routing phải dựa calibrated evidence và mức độ mơ hồ nguồn.",
      "Route based on labelled evidence and ambiguity, not an arbitrary one-size-fits-all score."
    ],
    [
      "6. Ưu tiên capacity cho highest uncertainty",
      "6. Prioritise scarce reviewers by uncertainty",
      "Reviewer ít nên lấy item không chắc nhất trước: low confidence, conflicting document, format từng có accuracy yếu, nguồn có nhiều cách đọc. Queue động sắp theo uncertainty khi công việc tới, không chia đều reviewers hoặc xử lý FIFO nếu có trường hợp nguy hiểm đang chờ.",
      "Limited reviewers should see the highest-uncertainty cases first: low-confidence fields, conflicting or hard-to-read documents, and historically weak formats. Keep the queue dynamically ordered by uncertainty instead of evenly distributing resources or relying blindly on arrival order.",
      "const reviewQueue=cases.filter(x=>x.humanRequired).sort((a,b)=>b.uncertainty-a.uncertainty);\n// Reprioritise as new risky cases arrive.",
      "Năng lực con người dùng nơi rủi ro cao nhất, không chia đều.",
      "Prioritise the most uncertain items dynamically while retaining periodic audits."
    ],
    [
      "7. Thứ tự validation trước automation",
      "7. The correct validation-before-automation sequence",
      "Bước 1 đo accuracy theo document/field; bước 2 hiệu chuẩn confidence bằng labelled set; bước 3 đặt ngưỡng; bước 4 stratified sampling kể cả auto outputs; bước 5 mới giảm human review cho segments bền vững. Đừng nhảy thẳng từ overall 97% sang full automation.",
      "The sequence matters: first measure segment-level accuracy; calibrate on labelled validation sets; choose validated thresholds; establish stratified sampling across automated output; and only then reduce human review for consistently reliable segments. Overall accuracy alone never licenses full automation.",
      "const rollout=['segment audit','labelled calibration','validated thresholds','stratified sampling','controlled automation'];\n// Follow the sequence instead of jumping to full automation.",
      "Không được cắt human review trước khi có segment evidence và sampling.",
      "Reduce human checks only after calibration and ongoing representative sampling."
    ]
  ],
  "questions": [
    [
      "Overall accuracy 97% nhưng receipts viết tay 60%. Quyết định nào?",
      "Overall accuracy is 97%, but handwritten receipts achieve 60%. What should be done?",
      "Đánh giá và route theo từng document type × field.",
      "Evaluate and route separately by document type and field.",
      "Tự động hết vì average cao.",
      "Bỏ số liệu receipt.",
      "Dùng cùng cutoff không hiệu chuẩn.",
      "Fully automate based on the overall figure.",
      "Discard handwritten-receipt results.",
      "Use one unvalidated cutoff for all segments."
    ],
    [
      "Lấy mẫu chỉ low-confidence, điều gì bị bỏ sót?",
      "Sampling only low-confidence extractions misses which risk?",
      "Lỗi hệ thống mới ở nhóm auto high-confidence.",
      "New systematic errors in automatically accepted high-confidence output.",
      "Các field không có tên.",
      "Chi phí của API.",
      "Ý nghĩa của schema.",
      "Fields without names.",
      "API cost figures.",
      "The JSON schema structure."
    ],
    [
      "Confidence 0.95 có chắc accuracy 95%?",
      "Does raw model confidence 0.95 guarantee 95% empirical accuracy?",
      "Không, phải đo trên labelled ground truth theo segment.",
      "No; verify it against labelled ground truth within segments.",
      "Có, đó là định nghĩa của score.",
      "Chỉ với date fields.",
      "Chỉ khi user hỏi.",
      "Yes, by definition.",
      "Only for date fields.",
      "Only when the user asks."
    ],
    [
      "Một date/amount cùng confidence 0.90 nhưng accuracy khác. Biện pháp?",
      "Date and amount fields both score 0.90 but have different observed accuracy. What is appropriate?",
      "Calibrate riêng theo field type và set thresholds phù hợp.",
      "Calibrate by field type and choose supported thresholds.",
      "Áp dụng cutoff chung 0.9.",
      "Bỏ mọi confidence.",
      "Chỉ đếm overall accuracy.",
      "Apply a single universal 0.9 threshold.",
      "Discard all confidence information.",
      "Measure only aggregate accuracy."
    ],
    [
      "Reviewers ít; item nào được xem trước?",
      "Reviewer capacity is limited. Which items should be prioritised?",
      "Nhóm uncertainty cao, nguồn mâu thuẫn, historical weak formats.",
      "High-uncertainty, conflicting and historically weak segments.",
      "Chia đều không theo rủi ro.",
      "FIFO bất kể mức độ.",
      "Chỉ high-confidence sạch.",
      "Distribute capacity evenly.",
      "Use strict first-in-first-out regardless of uncertainty.",
      "Review only clean high-confidence documents."
    ],
    [
      "Calibrated high confidence đã auto. Còn cần gì?",
      "High-confidence segments have validated automated routing. What must still happen?",
      "Stratified random sampling để phát hiện drift hoặc lỗi mới.",
      "Stratified random sampling to detect drift and novel errors.",
      "Ngừng kiểm tra hoàn toàn.",
      "Chỉ review low-confidence.",
      "Giữ cùng threshold vĩnh viễn.",
      "Stop auditing these outputs entirely.",
      "Audit only low-confidence cases.",
      "Freeze thresholds permanently."
    ],
    [
      "Bước nào đứng đầu khi chuẩn bị automation?",
      "What is the FIRST step before reducing human review?",
      "Đo accuracy theo document type và field segment.",
      "Measure accuracy per document type and field segment.",
      "Chọn confidence threshold bất kỳ.",
      "Giảm 80% reviewer ngay.",
      "Tin overall accuracy.",
      "Pick an arbitrary confidence threshold.",
      "Immediately reduce reviewers by 80%.",
      "Trust aggregate accuracy."
    ],
    [
      "Reviewer queue có item mới rủi ro hơn. Cách xử lý?",
      "A new high-risk document arrives in the review queue. What should happen?",
      "Reprioritise động để xử lý uncertainty cao nhất.",
      "Dynamically reprioritise to review the most uncertain item.",
      "Đẩy xuống cuối theo FIFO.",
      "Chia đều các nhân viên bất kể rủi ro.",
      "Tự động approve do deadline.",
      "Always put it last in FIFO.",
      "Spread reviews equally regardless of risk.",
      "Automatically approve because of time pressure."
    ]
  ],
  "words": [
    [
      "aggregate accuracy",
      "độ chính xác tổng hợp",
      "Overall measure that can conceal weak categories."
    ],
    [
      "document segment",
      "phân khúc loại tài liệu",
      "Subset of documents with distinct extraction behaviour."
    ],
    [
      "stratified sampling",
      "lấy mẫu phân tầng",
      "Random sampling within each document/confidence/field stratum."
    ],
    [
      "field-level confidence",
      "độ tự tin theo trường",
      "Model score for one extracted field."
    ],
    [
      "calibration curve",
      "đường cong hiệu chuẩn",
      "Observed accuracy grouped by reported score."
    ],
    [
      "ground truth",
      "đáp án đúng đã xác minh",
      "Human-labelled correct extraction data."
    ],
    [
      "uncertainty queue",
      "hàng đợi theo độ bất định",
      "Human review prioritised by uncertainty."
    ],
    [
      "automation threshold",
      "ngưỡng tự động hoá",
      "Calibrated decision threshold for routing."
    ]
  ],
  "exercise": [
    [
      "Phân nhóm accuracy",
      "Measure segment accuracy",
      "Tách document types và fields; không dựa overall.",
      "Group accuracy by document and field rather than overall."
    ],
    [
      "Lập validation set",
      "Build a labelled set",
      "Chuẩn bị ground-truth date/amount/name.",
      "Prepare human-verified dates, amounts and names."
    ],
    [
      "Tính calibration bands",
      "Evaluate score calibration",
      "So confidence bands với accuracy thực.",
      "Compare observed correctness in confidence bins."
    ],
    [
      "Tạo uncertainty queue",
      "Implement review prioritisation",
      "Sort ambiguous và low-quality documents trước.",
      "Sort uncertain and conflicting cases first."
    ],
    [
      "Lấy mẫu high-confidence",
      "Audit automated segments",
      "Random sample high-confidence outputs để bắt novel errors.",
      "Randomly sample high-confidence automated cases to detect new errors."
    ]
  ],
  "table": [
    [
      "High aggregate, weak minority",
      "Segment accuracy",
      "Avoid hidden critical errors"
    ],
    [
      "Raw confidence 0.9",
      "Ground truth calibration",
      "Score is not probability"
    ],
    [
      "Limited reviewers",
      "Uncertainty-first queue",
      "Spend time where it matters"
    ]
  ],
  "commands": "npm run lab:domain5 -- 5"
});
