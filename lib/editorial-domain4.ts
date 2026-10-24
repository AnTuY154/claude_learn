import type {EditorialLesson} from "./editorial-domain12.ts";
export const domain4Editorial:EditorialLesson[] = [
  {
    "id": "4.1",
    "source": "https://claudecertificationguide.com/learn/4-prompt-engineering/4-1-system-prompts",
    "mechanism": [
      "System prompt cho các quy tắc thường trực; 'be conservative' hoặc 'only high-confidence' không tạo decision boundary. Nêu rõ phải báo bug/security, bỏ qua style/local pattern và chỉ flag comment nếu mô tả trái hành vi code. Đây là cách giảm false positives theo Task 4.1.",
      "System prompts supply standing criteria. 'Be conservative' and 'only high-confidence' fail to define reportable findings. Define explicit bug/security inclusion, style exclusions and a rule to flag comments only when their claimed behaviour contradicts the code."
    ],
    "example": [
      "Reviewer CI báo 40% false positive ở documentation mismatch làm developer bỏ qua cả cảnh báo security đúng. Tạm tắt category lỗi, thử lại bằng examples có nhãn rồi bật lại sau khi precision tốt hơn, thay vì thêm một lời nhắc confidence.",
      "If documentation-mismatch findings have a 40% false-positive rate, developers may ignore even accurate security findings. Pause that category, refine with labelled examples and restore it after improvement rather than relying on a confidence slogan."
    ],
    "distinction": [
      "Severity cần snippets cụ thể: SQL với input không an toàn là ví dụ critical; naming không ảnh hưởng behaviour là ví dụ minor hoặc skip tùy phạm vi. Confidence tự báo không thay tiêu chí; nếu dùng thì dành cho routing người review sau khi đã định nghĩa ranh giới.",
      "Calibrate severity with concrete code, such as unsanitised SQL input for critical and harmless naming for minor or excluded style. Self-reported confidence is not a replacement for categorical criteria; route uncertain findings to human review after those criteria exist."
    ],
    "examTrap": [
      "Bẫy theo nguồn: giữ mọi category đang gây noise, coi confidence threshold là cách chữa false positive và thay explicit criteria bằng 'use your judgement'.",
      "Source-based traps: keeping noisy categories active, treating confidence thresholds as false-positive cures or replacing specific criteria with 'use your judgement'."
    ]
  },
  {
    "id": "4.2",
    "source": "https://claudecertificationguide.com/learn/4-prompt-engineering/4-2-few-shot-prompting",
    "mechanism": [
      "Few-shot đưa 2–4 examples input/output kèm reasoning khi output format không nhất quán, phân loại mơ hồ hoặc bỏ sót thông tin vốn có trong prose. Example chất lượng phải giải thích vì sao một tool/action đúng hơn lựa chọn gần giống; không chỉ minh họa mặt chữ.",
      "Few-shot prompting adds two to four targeted input/output examples with reasoning when format varies, decisions are ambiguous or extraction misses facts present in narrative text. A strong example explains why the selected outcome is better than a plausible alternative."
    ],
    "example": [
      "Query 'check order #12345' chọn lookup_order vì có identifier của order, không phải get_customer. Invoice viết 'twelve kilos at nine pounds' bằng câu prose cần ví dụ extraction narrative, không ép pre-processing thành table nếu đề yêu cầu giữ nguồn nguyên.",
      "A request about order #12345 selects lookup_order due to the order identifier rather than a generic customer lookup. For a narrative invoice describing twelve kilos at nine pounds, include an example that extracts facts from prose without changing the original document."
    ],
    "distinction": [
      "So sánh đúng theo bảng trong giáo trình: inconsistent format → few-shot; malformed JSON → tool_use schema; missing source field bị bịa → nullable; sum mismatch → validation-retry; misrouting do mô tả nghèo nàn → sửa tool descriptions trước.",
      "Use the guide's decision table: formatting drift calls for few-shot demonstrations; malformed JSON for schema-constrained tool use; fabricated missing fields for nullable schemas; mismatched totals for validation/retry; weak tool descriptions should be repaired before adding few-shot routing examples."
    ],
    "examTrap": [
      "Bẫy: thêm thật nhiều examples gần giống nhau; chỉ tăng temperature hoặc lặp instruction; dùng few-shot để chữa field thực sự không có nguồn.",
      "Traps: adding many near-identical examples, tuning temperature or restating instructions instead of demonstrating outputs, or expecting few-shot examples to reconstruct data absent from the source."
    ]
  },
  {
    "id": "4.3",
    "source": "https://claudecertificationguide.com/learn/4-prompt-engineering/4-3-structured-output",
    "mechanism": [
      "Tool-use schema định nghĩa fields/types rõ hơn yêu cầu JSON trong text; guide dùng strict:true khi cần cấu trúc được ràng buộc. tool_choice auto cho model được trả text, any buộc chọn một tool, named buộc tool cụ thể, theo điều kiện model hỗ trợ mà chính guide ghi chú.",
      "A tool schema specifies fields and types more reliably than requesting JSON prose; the guide calls for strict:true when reliable schema conformance is required. In its exam framing, tool_choice auto permits text, any forces one of several tools, and named tool choice selects a specific tool, subject to the site's model-support caveats."
    ],
    "example": [
      "Ba schema extract_invoice / extract_receipt / extract_contract và loại giấy tờ chưa biết: theo bài thi chọn any. Một bước metadata bắt buộc sử dụng named tool. Nếu receipt không có purchase_order thì dùng nullable null; enum thêm unclear cho scan không rõ và other + detail cho loại khác.",
      "For invoice, receipt and contract schemas with unknown document type, the guide's answer is any. A mandatory metadata extraction uses a named tool. Model missing purchase-order fields with nullable null, unreadable scans with unclear, and genuinely new types with other plus detail."
    ],
    "distinction": [
      "JSON đúng schema vẫn có thể nhầm ngày, amount hay tự tạo PO. Cần định dạng chuẩn và semantic validator riêng. Phần Current state trong nguồn ghi forced choice không tương thích với một số model mới; khi học nhớ bài thi và giới hạn được trang nguồn phân biệt.",
      "A schema-valid object can still contain wrong dates or amounts. Use format instructions and independent semantic checks. The curriculum's Current state note distinguishes exam-choice conventions from model-specific forced-choice restrictions."
    ],
    "examTrap": [
      "Bẫy: tưởng 'return JSON' bảo đảm parser chạy, nhầm auto với any, buộc mọi field phải có giá trị dù tài liệu thiếu, hay xem strict schema đồng nghĩa fact accuracy.",
      "Traps: assuming a 'return JSON' instruction guarantees parseable output, confusing auto with any, forcing invented values for absent fields or equating strict schema with factual correctness."
    ]
  },
  {
    "id": "4.4",
    "source": "https://claudecertificationguide.com/learn/4-prompt-engineering/4-4-validation-retry-loops",
    "mechanism": [
      "Validation-retry cần phân biệt structural syntax (JSON sai/thiếu key/sai type) với semantic (fields đúng type nhưng sai nội dung, tổng không khớp). Retry đúng đưa ba thành phần: tài liệu gốc, extraction lỗi, thông báo rule vi phạm cụ thể.",
      "Validation and retry separate structural failures (malformed JSON, missing keys, wrong types) from semantic failures (correctly typed but inconsistent values). A useful retry includes the original source, failed extraction and precise validation diagnostic."
    ],
    "example": [
      "Nếu invoice ghi 500 nhưng extracted lines chỉ 450 trong khi nguồn có dòng còn lại, retry với thông báo mismatch và đối chiếu từng item. Nếu nguồn thực sự không có matter reference, retry không có tác dụng: null/human escalation hoặc yêu cầu nguồn bổ sung.",
      "If the source lists £500 but extraction totals £450 because a source line was missed, retry with the exact discrepancy. If a matter reference never appears, repeated prompts cannot recover it: use null, human escalation or request missing evidence."
    ],
    "distinction": [
      "Schema nên lưu stated_total và calculated_total, total_discrepancy flag; tài liệu mâu thuẫn về payment terms cần conflict_detected và giữ evidence. Field-specific validation dùng app code/Pydantic theo guide; detected_pattern giúp xác định loại findings bị dismiss.",
      "Expose stated_total, calculated_total and a discrepancy flag; preserve contradictory payment terms and use conflict_detected. Field-specific validation can use application code/Pydantic; detected_pattern helps diagnose frequently dismissed review findings."
    ],
    "examTrap": [
      "Bẫy: retry 'try again' không có source/error, sửa total bằng cách tự đoán, coi missing evidence là recoverable, hoặc nhận JSON hợp schema là đúng ngữ nghĩa.",
      "Traps: saying only 'try again' without source and error, guessing a new total, retrying truly absent evidence or treating valid JSON as semantically verified."
    ]
  },
  {
    "id": "4.5",
    "source": "https://claudecertificationguide.com/learn/4-prompt-engineering/4-5-batch-processing",
    "mechanism": [
      "Message Batches giảm khoảng 50% chi phí theo guide, nhưng có cửa sổ xử lý tối đa 24 giờ và không cam kết latency. Synchronous cần cho bước blocking như pre-merge review hay nhân viên đang trả lời khách; batch dùng cho audit/extraction overnight chịu chờ.",
      "Message Batches offer the guide's stated 50% processing discount but have a processing window up to 24 hours without a guaranteed latency SLA. Use synchronous calls for blocking pre-merge or live customer tasks and batch for delayed audits or extraction."
    ],
    "example": [
      "Mỗi request trong batch gắn custom_id unique để nối về đúng document; kết quả không dựa vào thứ tự. Khi một phần expired hoặc errored, chỉ resubmit failed custom IDs có sửa nguyên nhân. SLA 30h - 24h window - 4h cadence còn 2h buffer.",
      "Give every batch request a unique custom_id to reconcile results independently of return order. Resubmit only failed or expired items, changing the cause when possible. A 30-hour target minus a 24-hour window and four-hour submission cadence leaves two hours of buffer."
    ],
    "distinction": [
      "Guide v1.0 nói không chạy multi-turn tool loop trong một batch item. Trang nguồn Current state có ghi một số server-side tools tương thích batch, nhưng client-side tools do ứng dụng thực thi không thể tự tiếp tục trong một batch request; cần synchronous hoặc workflow chia giai đoạn.",
      "The exam guide says a batch item cannot execute a multi-turn tool loop. Its Current state note clarifies that some server-side tools can operate in batches, whereas an application-managed client-tool loop cannot run itself inside one request. Choose synchronous or staged orchestration as needed."
    ],
    "examTrap": [
      "Bẫy: dùng batch để chặn merge, hứa results trả trong vài phút, retry toàn bộ succeeded requests hoặc dùng position thay custom_id.",
      "Traps: batching blocking merge gates, promising minute-scale results, resubmitting successful items or matching responses by array index rather than custom_id."
    ]
  },
  {
    "id": "4.6",
    "source": "https://claudecertificationguide.com/learn/4-prompt-engineering/4-6-multi-pass-review",
    "mechanism": [
      "Self-review trong cùng conversation chứa history quyết định ban đầu nên dễ xác nhận lựa chọn cũ; reviewer độc lập phải là instance mới không nhận reasoning history của generator. Attention dilution khiến một pass review nhiều files đánh giá không đồng đều.",
      "Same-session self-review retains the generator's original decision history and tends to confirm those decisions. Independent review requires a new model invocation without the generation reasoning history. Attention dilution makes a large one-pass review uneven and inconsistent."
    ],
    "example": [
      "Với codebase 14 files: local pass riêng theo từng file để tìm bug logic/security, sau đó integration pass xem APIs và data flows qua file; findings có file, line, evidence và pattern. Một lỗi contract controller gọi chargePayment nhưng service chỉ export reservePayment sẽ bị pass tích hợp bắt.",
      "For fourteen changed files, run focused local reviews for bugs and security, then an integration pass over cross-file APIs and data flow. Preserve file, line, evidence and pattern. A controller calling chargePayment while its service exports reservePayment is an integration mismatch."
    ],
    "distinction": [
      "Confidence score model tự báo không mặc nhiên là tỉ lệ đúng. Dùng dữ liệu reviewer có nhãn để calibration và đưa low-confidence sang human review. Extra review calls có cost, nên áp dụng cho rủi ro cao thay vì mọi typo.",
      "A self-reported confidence score is not a calibrated correctness probability. Calibrate against labelled reviewer judgements before routing lower-confidence findings to a human. Extra review passes cost time and tokens and should be justified by risk."
    ],
    "examTrap": [
      "Bẫy: nói 'review carefully' trong session cũ thay reviewer mới, chỉ tăng context window để chữa attention dilution, hoặc tự động publish theo confidence chưa hiệu chuẩn.",
      "Traps: saying 'review carefully' in the generator's session instead of using an independent reviewer, assuming a larger context window solves attention dilution, or automatically publishing on an uncalibrated score."
    ]
  }
];
