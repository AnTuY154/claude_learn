import {reliabilityLesson} from "../domain5-builder.ts";
export const lesson56=reliabilityLesson(6,{
  "title": [
    "Information Provenance — Giữ nguồn qua nhiều agent",
    "Information Provenance and Multi-Source Synthesis"
  ],
  "subtitle": [
    "Claim-source mapping, conflict annotation, publication dates và dạng trình bày phù hợp.",
    "Keep claim-source attribution through synthesis, annotate disagreements and preserve dates."
  ],
  "scenario": [
    "Một kỹ sư tổng hợp báo giá vật tư từ nhiều nhà cung cấp. Source A báo tăng giá 12% giai đoạn 2023, source B báo 8% giai đoạn khác. Synthesis tự lấy bản mới nhất hoặc tính trung bình 10%, lại xóa hết URL/ngày nên báo cáo đẹp nhưng không còn căn cứ kiểm tra.",
    "A heating engineer compares supplier reports with 12% and 8% rises measured over different periods. A synthesiser arbitrarily chooses the latest or averages them, discarding URLs and dates. The report sounds authoritative but the reader cannot trace the figures."
  ],
  "bridge": [
    "Task 5.6 tập trung provenance của từng claim, conflict giữ nguyên và temporal context; không tự phát minh số liệu trung bình hay chọn một nguồn nếu điều kiện không cho.",
    "Task 5.6 centres on claim-level provenance, explicit conflict reporting and temporal context instead of arbitrary value selection."
  ],
  "slug": "information-provenance",
  "duration": "60 minutes",
  "topics": [
    [
      "1. Provenance là đường dẫn chứng cứ của từng claim",
      "1. Provenance traces each claim to evidence",
      "Mỗi nhận định cần cấu trúc 5 trường: claim, sourceUrl, documentName, relevantExcerpt và publicationDate (hoặc ngày dữ liệu). Việc chỉ gắn một link cuối báo cáo không chứng minh câu cụ thể; đoạn nguồn phải trực tiếp hỗ trợ ý khẳng định. Đây là nền tảng có thể audit.",
      "Every finding needs a claim-source map containing claim, source URL, document name, relevant excerpt and publication date. A link at the end of a report is not enough: evidence must support the specific assertion. This data structure makes verification possible.",
      "const finding={claim:'Delivery fee increased',sourceUrl:'https://example.invalid/report',documentName:'Supplier terms',relevantExcerpt:'Delivery fee changed from 5 to 6',publicationDate:'2026-01-15'};\n// Illustrative evidence only.",
      "Claim cần evidence gắn riêng và đủ 5 metadata fields.",
      "Attach five provenance fields to each distinct claim."
    ],
    [
      "2. Attribution dễ mất ở synthesis",
      "2. Attribution often disappears during synthesis",
      "Research agent thu nhận nguồn, Analysis agent đánh giá, Synthesis agent diễn giải lại, Report agent xuất bản. Trong lúc nén/prose rewriting, URL/excerpt/date dễ mất. Bắt tất cả stages preserve và merge claim-source mappings; report cuối cần inline citations hoặc references chỉ rõ claim nào trỏ về đâu.",
      "Research, analysis, synthesis and reporting stages can lose source details when rewriting prose. Require each downstream stage to carry forward original mappings and link final claims to a source through inline citations or structured references. Paraphrasing must not sever attribution.",
      "const synthesis=inputs.map(f=>({claim:f.claim,sources:[{url:f.sourceUrl,excerpt:f.relevantExcerpt,date:f.publicationDate}]}));\n// Never drop the mappings during paraphrase.",
      "Nguồn được giữ từ đầu pipeline đến output cuối.",
      "Preserve original claim-source mappings through every stage."
    ],
    [
      "3. Conflicts: đừng chọn, đừng trung bình",
      "3. Report conflicts rather than picking a number",
      "Hai sources đáng tin cho 12% và 8% không được tự chọn số mới nhất, lấy average 10% hoặc chọn publisher nổi tiếng nhất. Ghi rõ cả hai giá trị cùng source và dates, chú giải khả năng khác reporting period/methodology rồi để coordinator/người đọc đánh giá. Không biến 10% thành published number.",
      "If two credible sources report 12% and 8%, do not select the newer one, take their mean or choose a publisher without justification. Report both with their attribution, dates and methodological context, making the conflict visible for the coordinator or consumer.",
      "const conflict={conflictDetected:true,values:[{value:'12%',source:'A',period:'2023'},{value:'8%',source:'B',period:'2024'}]};\n// Do not invent '10% reported growth'.",
      "Không giải quyết mâu thuẫn bằng cách tạo con số thứ ba.",
      "Annotate both published values rather than inventing an average."
    ],
    [
      "4. Publication date và temporal context",
      "4. Dates distinguish trends from contradictions",
      "Hai số khác nhau có thể thuộc các giai đoạn dữ liệu khác nhau, không thực sự mâu thuẫn. Giữ publicationDate và data period trong findings, so sánh cùng measure và time range trước khi gắn nhãn conflict. Cần chỉ ra bối cảnh phương pháp nếu dữ kiện có.",
      "Different values may describe different reporting periods rather than contradictory measures. Carry publication and data-collection dates, compare the measurement periods and preserve methodology before concluding that sources disagree. A trend can be mistaken for an inconsistency if dates vanish.",
      "const observations=[{growth:8,period:'2023'},{growth:12,period:'2024'}];\n// Time-separated measurements may form a trend, not a conflict.",
      "Thiếu ngày có thể khiến cùng xu hướng bị hiểu sai thành conflict.",
      "Retain temporal context before deciding whether two numbers conflict."
    ],
    [
      "5. Hoàn thành phân tích với conflict intact",
      "5. Complete analysis with disagreements intact",
      "Document Analysis Agent không được dừng task chỉ vì thấy invoice có hai total hay tự chọn một. Trả conflictDetected: true, cả hai values, source contexts và possibleExplanation chưa xác nhận. Coordinator có thể tiếp tục thu nguồn hoặc chuyển người; output cuối vẫn phải nêu giới hạn nếu chưa giải quyết.",
      "A document-analysis agent should finish its task with a structured conflict record rather than aborting or silently deciding between totals. Include both values, original contexts and a clearly qualified possible explanation. The coordinator may investigate further or escalate, preserving unresolved status.",
      "const discrepancy={field:'annualRevenue',conflictDetected:true,values:[{value:'4.2M',source:'audited report'},{value:'3.8M',source:'preliminary filing'}],possibleExplanation:'different accounting basis'};",
      "Tạo record conflict có bằng chứng, không ép một giá trị duy nhất.",
      "Carry discrepancies to the coordinator without fabricating resolution."
    ],
    [
      "6. Established findings khác contested findings",
      "6. Separate established and contested findings",
      "Nếu ba sources độc lập cùng xác nhận giá tăng còn một source đơn lẻ nói nguồn cung thiếu, phần report phải phân nhóm well-established và contested; giữ caveats và provenance thay vì khẳng định tất cả ngang nhau. Attribution tốt giúp người đọc tự cân nhắc độ mạnh của evidence.",
      "Three independent sources supporting a price change are different from one uncorroborated shortage claim. Clearly separate established from contested findings, maintaining original qualifications, citations and methodological context. The reporting language should reflect support strength rather than flattening uncertainty.",
      "const report={established:[{claim:'price rise',sources:['A','B','C']}],contested:[{claim:'shortage',sources:['D']}]} ;\n// Keep evidence strength visible.",
      "Độ tin cậy phụ thuộc nguồn và mức xác nhận, không chỉ giọng văn.",
      "Distinguish corroborated findings from claims supported by only one source."
    ],
    [
      "7. Content-appropriate rendering",
      "7. Choose rendering for the content type",
      "Financial values và trends dùng tables để dễ so; current events cần prose giải thích trình tự; technical findings dùng structured lists giúp thấy hierarchy. Không ép toàn bộ thành một định dạng chỉ vì tiện UI. Dạng trình bày giúp nhận diện sự khác biệt nhưng không thay provenance.",
      "Financial comparisons and trends work best in tables; news and changing events require explanatory prose; technical architecture is clearer in structured lists. Do not force all data into a single format. Good rendering improves comprehension but cannot substitute for source-level attribution.",
      "function renderMode(kind){return kind==='financial'?'table':kind==='news'?'prose':'structured-list';}\n// Rendering choice does not validate sources.",
      "Chọn format theo loại nội dung và giữ citations qua render.",
      "Adapt presentation to the material whilst preserving citations."
    ]
  ],
  "questions": [
    [
      "Research claim phải chứa những field nào để truy nguồn?",
      "Which fields are essential for an auditable claim-source record?",
      "Claim, URL, document name, excerpt và publication date.",
      "Claim, URL, document name, excerpt and publication date.",
      "Chỉ claim và confidence.",
      "Chỉ file title.",
      "Chỉ số lượng nguồn.",
      "Claim and model confidence only.",
      "Document title alone.",
      "A count of sources without references."
    ],
    [
      "Synthesis diễn giải lại làm rơi URLs. Cách sửa?",
      "A synthesiser paraphrases findings and drops URLs. Best solution?",
      "Preserve/merge claim-source mappings qua mỗi stage.",
      "Preserve and merge claim-source mappings through every stage.",
      "Thêm prose dài hơn không metadata.",
      "Gắn một URL bất kỳ cuối report.",
      "Cho report không cần citations.",
      "Write longer prose without metadata.",
      "Attach an arbitrary URL at the end.",
      "Remove citations from the report."
    ],
    [
      "Hai nguồn báo 12% và 8% khác kỳ đo. Xử lý?",
      "Two credible sources show 12% and 8% for different periods. What is appropriate?",
      "Đưa cả hai số cùng nguồn, ngày và period.",
      "Report both values with their sources, dates and periods.",
      "Lấy trung bình 10%.",
      "Luôn chọn bản mới nhất.",
      "Dừng hoàn toàn báo cáo.",
      "Average them into 10%.",
      "Always choose the newest.",
      "Terminate the entire report."
    ],
    [
      "Vì sao không lấy trung bình 10%?",
      "Why must the synthesiser not report an invented 10% average?",
      "Vì không nguồn nào công bố 10%, làm sai provenance.",
      "Neither source published 10%, so it breaks provenance.",
      "Vì 10% quá lớn.",
      "Vì hệ thống chỉ được phép dùng một nguồn.",
      "Vì dates luôn bằng nhau.",
      "Because 10% is too high.",
      "Because only one source is allowed.",
      "Because both dates must be equal."
    ],
    [
      "8% ở 2023 và 12% ở 2024 có thể biểu thị gì?",
      "An 8% figure from 2023 and 12% from 2024 might represent what?",
      "Xu hướng thay đổi theo thời gian, không chắc conflict.",
      "A trend over time rather than necessarily a contradiction.",
      "Sự bịa đặt chắc chắn.",
      "Hai tài liệu giống hệt về kỳ đo.",
      "Một nguồn phải bị xóa.",
      "Definite fabrication.",
      "Identical reporting periods.",
      "One source must be deleted."
    ],
    [
      "Document agent thấy hai total không khớp. Nên?",
      "A document agent finds two inconsistent totals. What should it return?",
      "Structured conflictDetected với values/sources và possible reason.",
      "A structured conflict record with both values, sources and a qualified explanation.",
      "Chọn total lớn hơn.",
      "Thay bằng trung bình.",
      "Giấu một bản trước synthesis.",
      "Choose the larger total.",
      "Replace both with the mean.",
      "Hide one before synthesis."
    ],
    [
      "Một claim có ba nguồn, claim khác chỉ một nguồn. Report?",
      "One claim has three independent sources; another has only one. How should the report reflect them?",
      "Phân biệt established và contested cùng evidence cụ thể.",
      "Distinguish established and contested findings with their evidence.",
      "Viết mức chắc chắn như nhau.",
      "Xóa claim có một nguồn.",
      "Bỏ tất cả source metadata.",
      "Use equally confident wording for both.",
      "Delete every single-source claim.",
      "Drop all source details."
    ],
    [
      "Bảng tài chính và technical API specifications nên render thế nào?",
      "How should financial comparisons and technical API specifications be presented?",
      "Financial = table; technical = structured list, giữ citations.",
      "Financial comparisons as tables and technical findings as structured lists, retaining citations.",
      "Mọi thứ luôn dạng prose.",
      "Mọi thứ luôn dạng table.",
      "Bỏ nội dung technical cho ngắn.",
      "Everything in prose.",
      "Everything in tables regardless of type.",
      "Omit technical content for brevity."
    ]
  ],
  "words": [
    [
      "provenance",
      "xuất xứ thông tin",
      "Traceability of a specific claim to its evidence."
    ],
    [
      "claim-source mapping",
      "ánh xạ nhận định đến nguồn",
      "Structured connection between assertion and supporting passage."
    ],
    [
      "source excerpt",
      "đoạn trích nguồn",
      "Relevant passage backing a claim."
    ],
    [
      "attribution",
      "ghi nguồn cho nhận định",
      "Maintaining source identity through synthesis."
    ],
    [
      "conflictDetected",
      "cờ mâu thuẫn nguồn",
      "Explicit record of differing reported values."
    ],
    [
      "temporal context",
      "bối cảnh thời gian",
      "Publication and data-collection periods of measurements."
    ],
    [
      "established finding",
      "kết quả đã xác lập",
      "Finding corroborated by robust supporting sources."
    ],
    [
      "content-appropriate rendering",
      "trình bày theo nội dung",
      "Tables for financial data, prose for news, lists for technical work."
    ]
  ],
  "exercise": [
    [
      "Tạo schema claim-source",
      "Design claim-source mapping",
      "Ghi đầy đủ 5 fields và excerpt trong mỗi finding.",
      "Include all five required provenance fields."
    ],
    [
      "Synthesis có attribution",
      "Preserve mappings through synthesis",
      "Gộp findings nhưng vẫn giữ sourceId, excerpt, date.",
      "Aggregate findings whilst retaining source IDs, excerpts and dates."
    ],
    [
      "Bắt conflict và time periods",
      "Represent conflicts and time periods",
      "Nếu 12%/8% thì giữ hai số không average.",
      "Preserve the two numbers with source dates, without averaging."
    ],
    [
      "Tạo sections established/contested",
      "Separate established and contested results",
      "Dựa số nguồn xác nhận, chưa biến single-source thành chắc chắn.",
      "Distinguish corroborated findings from single-source claims."
    ],
    [
      "Render đúng loại dữ liệu",
      "Choose formats based on evidence",
      "Table cho financial, prose cho news, list cho technical.",
      "Render financial comparisons as tables, news as prose and technical findings as lists."
    ]
  ],
  "table": [
    [
      "Credible conflicting figures",
      "Show both + dates",
      "Do not invent averages"
    ],
    [
      "Attribution lost in synthesis",
      "Claim-source mapping",
      "Preserve citations across stages"
    ],
    [
      "Mixed content report",
      "Content-aware rendering",
      "Tables, prose and structured lists"
    ]
  ],
  "commands": "npm run lab:domain5 -- 6"
});
