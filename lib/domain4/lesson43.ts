import {promptEngineeringLesson} from "../domain4-builder.ts";
export const lesson43=promptEngineeringLesson(3,{
  "title": [
    "Structured Output — Tool Use và JSON Schema",
    "Structured Output with Tool Use"
  ],
  "subtitle": [
    "Điều khiển đầu ra có cấu trúc, chọn tool_choice phù hợp, thiết kế null/unclear và kiểm tra lỗi ngữ nghĩa độc lập.",
    "Choose the right structured-output mechanism and schema, without mistaking valid JSON for valid facts."
  ],
  "bridge": [
    "Sau 4.2 ổn định hành vi bằng examples, 4.3 thiết lập contract cho phần mềm downstream parse đúng fields và types.",
    "After teaching consistent outputs with examples, establish machine-readable contracts that downstream systems can validate."
  ],
  "scenario": [
    "Nền tảng kế toán tự trích xuất hóa đơn, biên nhận và hợp đồng. Dù JSON parse được, model đôi lúc bịa purchase order hoặc đặt ngày thanh toán vào ô ngày phát hành. Hệ thống cần schema rõ, nullable fields, tool selection hợp lý và semantic validation.",
    "An accounting platform extracts invoices, receipts and contracts. Some responses are malformed JSON, whilst others invent purchase-order numbers or swap valid date fields. The pipeline needs the appropriate schema, tool selection and separate semantic checks."
  ],
  "slug": "structured-output",
  "duration": "45 phút / 45 minutes",
  "topics": [
    [
      "1. JSON text và tool input là hai cơ chế",
      "1. Text JSON versus structured tool inputs",
      "Yêu cầu 'return JSON' trong prompt chỉ khiến model cố gắng viết văn bản trông giống JSON; parser vẫn có thể gặp dấu phẩy thừa hay key không có quote. Tool use cho model tạo tool call kèm object input được kiểm tra theo schema; với strict tool use thì yêu cầu về hình dạng được bảo đảm theo schema hỗ trợ. Không bảo đảm giá trị đúng tài liệu.",
      "Asking for JSON in ordinary text is only an instruction: malformed keys or punctuation remain possible. A tool call supplies typed arguments checked against its input schema; supported strict tool use gives stronger structural guarantees. Neither approach proves that extracted facts match the document.",
      "const extractTool={name:'extract_invoice',description:'Extract invoice fields',strict:true,input_schema:{type:'object',properties:{invoice_id:{type:'string'}},required:['invoice_id'],additionalProperties:false}};",
      "Bảo đảm cấu trúc khác với bảo đảm nội dung; strict schema không xác minh invoice đúng.",
      "Schema compliance is distinct from factual and business-rule correctness."
    ],
    [
      "2. tool_choice auto / any / tool",
      "2. Tool-choice modes and exam decisions",
      "Theo taxonomy trong guide thi: auto để model tự chọn gọi tool hay trả text; any buộc chọn một tool trong danh sách; tool buộc tên tool cụ thể. Nếu tài liệu chưa rõ thuộc invoice, receipt hay contract thì bài thi thường chọn any. Một lần forced tool chỉ áp dụng request đó; vòng kế tiếp nên chọn chế độ phù hợp.",
      "The exam guide distinguishes auto (model may answer in prose), any (must choose a tool) and a named tool (must call that tool). With several extraction tools for unknown document types, the guide's intended answer is any. Tool choice applies per request; do not accidentally force the same first-step tool in every subsequent turn.",
      "const examChoices=[{type:'auto'},{type:'any'},{type:'tool',name:'extract_invoice'}];\\n// A forced choice is not a persistent conversation setting.",
      "Nhớ ba mode theo guide, và buộc tool cụ thể khi cần bước bắt buộc.",
      "Distinguish optional tool use, forced tool selection and forced named-tool invocation."
    ],
    [
      "3. Lưu ý API hiện hành: strict và hạn chế forced choice",
      "3. Current API caveats: strict and forced choice",
      "Tài liệu nguồn cập nhật tháng 10/2026 ghi rõ một số model mới từ chối forced any/tool; còn strict:true đảm bảo tool inputs đúng schema với giới hạn hỗ trợ. Structured response có thể dùng output_config.format khi cần JSON mà không thực thi tool. Phân biệt câu hỏi 'theo guide chứng chỉ' và triển khai thực tế: luôn kiểm tra khả năng của model và docs SDK trước khi deploy.",
      "The source guide's October 2026 note says certain newer models reject forced any or named-tool modes. For deployed code, check model-specific support and use strict tool schemas with auto where appropriate, or output_config.format for constrained direct JSON. Answer exam questions according to the stated guide assumptions, but do not hard-code outdated SDK compatibility.",
      "// Exam-style request: tool_choice: {type:'any'}\\n// Deployment: confirm your model supports forced choice; prefer\\n// strict tools with auto or supported output_config.format as needed.",
      "Tài liệu thi không đồng nhất hoàn toàn với hỗ trợ mới nhất của từng model.",
      "Distinguish the exam's abstract choices from live model-specific API support."
    ],
    [
      "4. Nullable fields tránh ép bịa dữ liệu",
      "4. Nullable fields allow honest absence",
      "Nếu receipt không có purchase_order, required string ép model cung cấp một giá trị dù nguồn không có. Thiết kế field có thể null và hướng dẫn không điền khi thiếu; với strict structured output có thể giữ key trong required nhưng type cho phép null, tuỳ subset schema được hỗ trợ. Tránh nhầm nullable với field hoàn toàn được phép bỏ khỏi object.",
      "Making every field a compulsory non-null string encourages fabrication when source data is absent. Represent genuinely missing information with nullable types and explicit instructions. In strict structured-output schemas, a key may still be required yet accept null; 'nullable' need not mean the property itself is omitted.",
      "const invoiceSchema={type:'object',properties:{id:{type:'string'},purchase_order:{type:['string','null']}},required:['id','purchase_order'],additionalProperties:false};",
      "Đừng bắt model phát minh trường không xuất hiện trong nguồn; cho phép null một cách có chủ đích.",
      "Use nullable values for absent data, even when a strict schema requires the key."
    ],
    [
      "5. Enum unclear và other + detail",
      "5. Represent uncertainty and new categories",
      "Nếu tài liệu quét mờ không phân loại được, enum invoice/receipt/contract bắt model lựa đại; thêm unclear. Với loại thật sự nằm ngoài danh sách, thêm other và category_detail tự do để lưu trường hợp mở rộng. Không nên dùng other cho mọi unknown khi thông tin quá mờ; unclear diễn tả không đủ bằng chứng.",
      "An enum containing only invoice, receipt and contract forces a classification when a scan is unreadable. Add unclear for ambiguous evidence. Add other plus a free-text detail field for real document types outside the known set. These are different failure modes: uncertainty versus genuinely novel categories.",
      "const kind={type:'string',enum:['invoice','receipt','contract','unclear','other']};\\nconst detail={type:['string','null']}; // explain 'other' in prompt",
      "Unclear biểu thị thiếu chắc chắn; other biểu thị loại ngoài taxonomy.",
      "'Unclear' means insufficient evidence; 'other' captures a valid new category."
    ],
    [
      "6. Chuẩn hóa định dạng không chỉ ở schema",
      "6. Normalise field formats with instructions",
      "Schema type string không bảo đảm chuỗi ngày theo ISO 8601, và number không tự xác minh tỷ giá. Kèm quy tắc format trong prompt: YYYY-MM-DD, số thập phân không chứa ký hiệu tiền, null khi thiếu. Sau đó dùng validator JS hoặc Pydantic để kiểm tra logic, ví dụ tổng các dòng có khớp declared total hay không.",
      "A string type does not, by itself, ensure ISO dates; a number type does not verify amounts. Pair schema shape with explicit normalisation instructions, then run deterministic validation for cross-field rules such as whether line items add up to the stated total.",
      "function validateInvoice(x){const sum=x.items.reduce((v,i)=>v+i.amount,0);return Math.abs(sum-x.total)<0.01;}\\n// Valid JSON can still fail this check.",
      "Prompt định dạng + schema cấu trúc + validator ngữ nghĩa là ba lớp khác nhau.",
      "Separate format instructions, structural constraints and semantic validation."
    ],
    [
      "7. Tool result chưa phải câu trả lời cuối",
      "7. Tool call output is not automatically a verified final answer",
      "Tool input là bản trích xuất có cấu trúc, nhưng khi xử lý thật vẫn phải đọc đúng tool_use block, validate nội dung và quyết định có gọi hệ thống ngoài hay không. Nếu làm bước metadata trước enrichment, request tiếp theo cần cấu hình tool_choice lại để tránh lặp forced call. Không bao giờ đưa API key vào bundle frontend static.",
      "A structured tool input must still be extracted from the tool_use block, validated and, where appropriate, passed to the relevant backend operation. If metadata extraction is only the first step, change tool_choice in the next request to avoid forcing the identical tool indefinitely. Keep API secrets on the server or local machine.",
      "const toolBlocks=response.content.filter(block=>block.type==='tool_use');\\nfor(const block of toolBlocks){/* validate block.input against business rules */}",
      "Đúng schema không tự động an toàn, không tự gọi tool, không bảo đảm sự thật.",
      "A valid tool-call shape is not a business validation or a permission to perform side effects."
    ]
  ],
  "table": [
    [
      "Chỉ trả JSON text",
      "Prompt-based JSON",
      "Không bảo đảm cấu trúc"
    ],
    [
      "Tài liệu loại chưa biết (theo guide)",
      "tool_choice any",
      "Buộc chọn một schema"
    ],
    [
      "Tài liệu thiếu một field",
      "Nullable value / null",
      "Không ép bịa"
    ],
    [
      "JSON đúng nhưng tổng sai",
      "Semantic validator + feedback",
      "Schema không so chéo fields"
    ]
  ],
  "words": [
    [
      "JSON Schema",
      "lược đồ JSON",
      "Defines expected fields, types and constraints."
    ],
    [
      "Tool use",
      "lời gọi công cụ",
      "Model produces a tool invocation with inputs."
    ],
    [
      "tool_choice",
      "chế độ chọn công cụ",
      "Controls whether and which tools are called."
    ],
    [
      "Strict mode",
      "chế độ nghiêm ngặt",
      "Supported schema-constrained tool input generation."
    ],
    [
      "Nullable",
      "có thể nhận null",
      "Represents intentionally missing values."
    ],
    [
      "Enum",
      "tập giá trị định sẵn",
      "Restricts permissible category labels."
    ],
    [
      "Semantic validation",
      "kiểm tra ngữ nghĩa",
      "Cross-field checks against source and business rules."
    ],
    [
      "Output format",
      "định dạng đầu ra",
      "Representation expected by downstream code."
    ],
    [
      "Fabrication",
      "bịa dữ liệu",
      "Inventing a field value not present in source."
    ]
  ],
  "questions": [
    [
      "JSON prompt text có guaranteed syntax không?",
      "Does requesting JSON in a text prompt guarantee syntax?",
      "Không; đó vẫn là text model tự sinh",
      "No; it is still ordinary generated text",
      "Có với mọi model",
      "Chỉ khi temperature=0",
      "Chỉ khi nhiều examples",
      "Yes on every model",
      "Only at temperature zero",
      "Only with many examples"
    ],
    [
      "Theo guide, loại tài liệu chưa rõ với 3 tools chọn gì?",
      "Under the exam guide, which choice fits three tools and unknown document type?",
      "tool_choice any",
      "tool_choice any",
      "tool_choice auto để bắt buộc",
      "Named-tool bắt invoice",
      "Không cần tools",
      "auto to force a call",
      "Force invoice specifically",
      "No tools"
    ],
    [
      "Mode cho phép trả lời text không gọi tool?",
      "Which mode permits a textual reply with no tool call?",
      "auto",
      "auto",
      "any",
      "tool named",
      "forced only",
      "any",
      "named-tool",
      "forced only"
    ],
    [
      "Một bước nhất định phải gọi extract_metadata theo guide?",
      "How does the guide force extract_metadata?",
      "tool_choice với named tool",
      "Named tool_choice",
      "tool_choice auto",
      "Xoá tools",
      "Chỉ viết prompt",
      "auto",
      "Remove the tool list",
      "Only write instructions"
    ],
    [
      "Receipt không có PO number thì xử lý field ra sao?",
      "What if a receipt genuinely has no purchase order?",
      "Cho nullable và ghi null",
      "Use a nullable value and return null",
      "Bịa PO gần đúng",
      "Bắt string bất kỳ",
      "Bỏ validation",
      "Invent a plausible PO",
      "Force any string",
      "Disable validation"
    ],
    [
      "Scan không đọc được, enum nên có gì?",
      "Which enum value covers an unreadable document?",
      "unclear",
      "unclear",
      "invoice",
      "receipt",
      "error_text",
      "invoice",
      "receipt",
      "error_text"
    ],
    [
      "JSON hợp schema nhưng sum items sai thì sao?",
      "JSON fits schema but line totals disagree. What next?",
      "Chạy semantic validator",
      "Run semantic validation",
      "Tin schema tuyệt đối",
      "Giảm số field",
      "Bỏ dữ liệu gốc",
      "Trust schema completely",
      "Reduce fields",
      "Discard source"
    ],
    [
      "Theo ghi chú API 10/2026, mọi model đều nhận forced any?",
      "Per the source's Oct 2026 caveat, do all models accept forced any?",
      "Không; phải kiểm tra hỗ trợ model",
      "No; check model-specific support",
      "Có, luôn",
      "Chỉ JSON text mới lỗi",
      "Chỉ khác temperature",
      "Yes, always",
      "Only text JSON fails",
      "Only temperature matters"
    ]
  ],
  "exercise": [
    [
      "Viết schema",
      "Design a schema",
      "Tạo schema invoice có trường required và nullable, enum unclear/other.",
      "Write an invoice schema with required and nullable fields plus unclear/other."
    ],
    [
      "Thử dữ liệu thiếu",
      "Test absent fields",
      "Dùng fixture receipt thiếu PO, yêu cầu null thay vì giá trị giả.",
      "Use a missing-PO fixture and require null rather than invention."
    ],
    [
      "So sánh tool choice",
      "Compare tool-choice modes",
      "Liệt kê auto, any, named và kiểm tra ghi chú tương thích model trước khi dùng live.",
      "Explain auto, any and named modes; check model support before live calls."
    ],
    [
      "Thêm business validation",
      "Add business checks",
      "Viết hàm kiểm tổng line items và stated total.",
      "Implement cross-field total consistency checks."
    ],
    [
      "Ghi rõ giới hạn",
      "Document guarantees",
      "Phân biệt syntax/schema với semantic accuracy trong README lab.",
      "Explain structural guarantees versus factual correctness in the lab README."
    ]
  ],
  "commands": "npm run lab:domain4 -- 3\\ncd domain4-workspaces/lesson43\\nnode check.mjs"
});
