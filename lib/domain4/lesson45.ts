import {promptEngineeringLesson} from "../domain4-builder.ts";
export const lesson45=promptEngineeringLesson(5,{
  "title": [
    "Batch Processing — Chọn đúng công việc để giảm chi phí",
    "Batch Processing Strategies"
  ],
  "subtitle": [
    "Phân biệt blocking và latency-tolerant, thiết kế SLA dựa trên 24 giờ, custom_id và chỉ retry các item lỗi.",
    "Separate blocking from latency-tolerant work, plan for the batch window and recover only failed requests."
  ],
  "bridge": [
    "Bài 4.4 giúp sửa từng extraction. 4.5 tối ưu hàng nghìn công việc độc lập mà không khiến người dùng phải chờ batch trong request tương tác.",
    "Once individual extractions are reliable, decide which can run asynchronously at lower cost without blocking live users."
  ],
  "scenario": [
    "Một công ty bảo hiểm cần kết quả rà soát hồ sơ tức thời khi nhân viên đang nghe điện thoại, đồng thời phải trích xuất hàng nghìn hợp đồng để báo cáo sáng hôm sau. Quản lý muốn chuyển mọi request sang Message Batches để tiết kiệm 50%, nhưng kiểm tra trực tiếp không thể đợi tới 24 giờ.",
    "An insurer handles real-time customer calls and overnight renewal-file extraction. A manager wants to batch everything for a 50% saving, but live callers cannot wait for the potentially 24-hour batch processing window."
  ],
  "slug": "batch-processing",
  "duration": "45 phút / 45 minutes",
  "topics": [
    [
      "1. Batches dành cho công việc không chặn người dùng",
      "1. Batch is for latency-tolerant work",
      "Synchronous API trả kết quả trong workflow đang chờ: reviewer trước khi merge PR hoặc nhân viên cần trả lời khách ngay. Message Batches gom nhiều request có thể xử lý sau; chi phí được giảm theo cơ chế batch nhưng không có latency SLA như tương tác trực tiếp. Chọn dựa trên người/việc có bị chặn bởi kết quả hay không.",
      "A synchronous request belongs in the path of a user or pipeline waiting for its result. Message Batches suit independent jobs consumed later, such as nightly extraction. The guide cites a 50% reduction in API processing cost, but not a predictable response time. Choose by whether work is blocking, not by its size alone.",
      "function chooseWorkload(job){return job.blocksUserOrCI?'synchronous':'message-batch';}\\n// PR merge gate → synchronous; overnight audit → batch",
      "Quy tắc thi: blocking = sync; latency-tolerant = batch.",
      "Batch only when delayed completion does not block the current workflow."
    ],
    [
      "2. 50% savings không thay thời gian phản hồi",
      "2. Savings do not create a latency guarantee",
      "Batch request có thể hoàn thành trong vài phút nhưng bạn phải dự phòng toàn bộ cửa sổ tối đa 24 giờ theo hướng dẫn. Nếu bị quá cửa sổ, batch có thể trả trạng thái expired; không thiết kế SLA theo cảm giác 'lần trước chạy nhanh'. Thời gian chờ đến lần submit tiếp theo cũng cần tính.",
      "A batch may complete in minutes, but that observation is not a latency commitment. The guide plans around a processing window of up to 24 hours and treats overrun requests as expired. A job's total elapsed time also includes queueing until the next submission.",
      "const maxBatchHours=24;\\nconst totalWorstCase = submissionIntervalHours + maxBatchHours;\\n// Ensure this fits the business SLA with a safety buffer.",
      "Đừng coi thời gian batch thường gặp là SLA.",
      "Plan around the documented processing window, not best-case observations."
    ],
    [
      "3. custom_id giữ mối liên kết request/response",
      "3. custom_id identifies each request and result",
      "Một batch có hàng trăm tài liệu, output không nên giả định giữ nguyên thứ tự input. Gán custom_id ổn định và unique cho mỗi item, lưu map về document gốc, rồi nối kết quả hoặc trạng thái lỗi bằng ID. Khi cần retry nên sinh ID mới có dấu retry và ghi liên hệ ID trước đó.",
      "A batch contains many independent messages, so processing order must not be treated as the mapping key. Give each request a unique custom_id and keep an ID-to-document registry. Use the identifier to reconcile results, errors and resubmissions, including a retry suffix.",
      "const requests=docs.map((doc,i)=>({custom_id:`renewal-${i}`,params:{model:MODEL,max_tokens:1024,messages:[{role:'user',content:doc}]}}));\\n// Match results by custom_id, not array position.",
      "Không dựa vào index trong response; dùng custom_id.",
      "Correlate results with source documents by custom_id."
    ],
    [
      "4. Giới hạn multi-turn client tools trong batch",
      "4. Batch limitations for client-side tool loops",
      "Câu hỏi thi theo guide thường nói không chạy multi-turn tool loop bên trong một batch item. Trong API hiện hành có khác biệt: một số server-side tools có thể chạy trong batch, nhưng client tools phải do ứng dụng thực thi sau khi nhận tool_use nên không hoàn thành cả vòng trong cùng item. Nếu cần database lookup do code của bạn chạy giữa chừng, thiết kế sync hoặc nhiều giai đoạn.",
      "The exam guide treats multi-turn tool execution inside a batch item as unsupported. Current API notes distinguish server-side tools, some of which can run in batches, from client-side tools that your application must execute after receiving tool_use. A workflow requiring an internal database lookup mid-turn therefore needs synchronous orchestration or staged processing.",
      "// Client-tool loop needs your process to execute tool_use, then send tool_result.\\n// A single batch item cannot run your local database function for you.",
      "Khi thi theo guide chọn sync cho vòng tool do ứng dụng tự chạy; triển khai cần kiểm tra loại tool.",
      "Client-executed tools cannot silently complete inside a batch request."
    ],
    [
      "5. SLA: tính ngược và chọn cadence có buffer",
      "5. Work backwards from delivery SLAs",
      "Ví dụ cần kết quả trong 30 giờ: trừ 24 giờ cửa sổ batch thì còn 6 giờ cho thời gian chờ lần gửi tiếp theo và biên độ lỗi. Nếu cứ 6 giờ mới submit, tài liệu đến sau lần gửi sẽ tiêu hết buffer; gửi mỗi 4 giờ chừa 2 giờ dư. Đây là bài toán worst-case, không phải đảm bảo luôn xong đúng hạn.",
      "For a 30-hour delivery target, subtract the 24-hour processing window to obtain six hours for submission delay and operational margin. If submissions happen every six hours, a document arriving just after one run uses the entire buffer. Four-hour submissions retain some slack. This is capacity planning, not a guaranteed API latency SLA.",
      "const sla=30, batchWindow=24, cadence=4;\\nconst slack=sla-batchWindow-cadence; // 2 hours",
      "Cadence phải nhỏ hơn phần SLA còn sau khi trừ cửa sổ batch.",
      "Leave time for collection, validation and failures after worst-case batch processing."
    ],
    [
      "6. Chỉ retry lỗi/expired qua custom_id",
      "6. Retry only errored and expired items",
      "Lấy kết quả batch và lọc các record errored hoặc expired; giữ nguyên successes, không gửi lại tất cả. Với mỗi item lỗi, sửa nguyên nhân trước: chia document quá dài, thêm few-shot cho loại khó, nâng giới hạn hợp lý hoặc cải thiện schema. Thử lại cả batch sẽ vừa tốn tiền vừa tạo bản trùng gây khó đối chiếu.",
      "When results arrive, collect failed and expired custom IDs and resubmit those items only. Modify the input or prompt to address the failure: chunk an overlong document, clarify an unusual format, or fix the schema. Re-running successful items wastes the intended cost savings and complicates correlation.",
      "const failed = results.filter(x=>['errored','expired'].includes(x.result.type)).map(x=>x.custom_id);\\nconst retryDocs=failed.map(id=>documentsById[id]);",
      "Chi phí tối ưu = không gửi lại những tài liệu đã thành công.",
      "Retry failed units with targeted changes; preserve completed work."
    ],
    [
      "7. Test trên sample trước khi submit lớn",
      "7. Optimise on representative samples first",
      "Trước khi chạy 1.000 hồ sơ, chọn khoảng 5–10 mẫu khác format, loại document và edge cases. Chạy đồng bộ để chỉnh prompt, schema và few-shot, đo mức thành công rồi mới gửi batch lớn. Nếu xác suất đúng lượt đầu tăng từ 60% lên 90%, số item phải xử lý lại giảm mạnh.",
      "Before sending a large batch, use about five to ten representative samples across document formats and edge cases. Test prompts, schema design and few-shot examples in a quicker development loop, then submit the bulk workload. Higher first-pass accuracy sharply reduces resubmission costs.",
      "const sample=chooseRepresentativeSamples(documents,10);\\n// Evaluate extraction accuracy before bulk batch submission.",
      "Tối ưu prompt trên sample trước giúp batch ít retry hơn.",
      "Refine and validate representative inputs before bulk submission."
    ]
  ],
  "table": [
    [
      "Review PR đang chặn merge",
      "Synchronous Messages API",
      "Không chờ batch"
    ],
    [
      "Trích xuất hợp đồng qua đêm",
      "Message Batches API",
      "Không cần kết quả tức thì"
    ],
    [
      "Tài liệu lỗi trong batch",
      "Retry failed custom_id only",
      "Không trả phí xử lý lại success"
    ],
    [
      "Job dùng client tool giữa quá trình",
      "Sync / staged orchestration",
      "Ứng dụng phải chạy tool"
    ]
  ],
  "words": [
    [
      "Message Batches API",
      "API xử lý lô",
      "Bulk latency-tolerant Messages requests."
    ],
    [
      "Blocking workflow",
      "luồng công việc bị chặn",
      "Work cannot proceed until completion."
    ],
    [
      "Latency-tolerant",
      "chịu được độ trễ",
      "Result may be consumed later."
    ],
    [
      "SLA",
      "cam kết mức dịch vụ",
      "Delivery or response-time agreement."
    ],
    [
      "Processing window",
      "cửa sổ xử lý",
      "Time allowed for batch completion."
    ],
    [
      "custom_id",
      "mã yêu cầu riêng",
      "Correlates each request with its result."
    ],
    [
      "Expired",
      "hết hạn xử lý",
      "Batch item exceeded processing window."
    ],
    [
      "Resubmission",
      "gửi lại yêu cầu",
      "Retrying selected failed work."
    ],
    [
      "Client tool",
      "tool chạy trong ứng dụng",
      "Application must execute model-requested operation."
    ]
  ],
  "questions": [
    [
      "Pre-merge check cần chờ kết quả, dùng gì?",
      "Which API suits a blocking pre-merge check?",
      "Synchronous Messages API",
      "Synchronous Messages API",
      "Message Batches cho tất cả",
      "Chờ batch 24 giờ",
      "Bỏ kiểm tra",
      "Batch everything",
      "Wait up to 24 hours",
      "Skip review"
    ],
    [
      "Nightly audit không ai chờ, dùng gì?",
      "Best option for an overnight audit?",
      "Message Batches API",
      "Message Batches API",
      "Buộc synchronous",
      "Chạy trong browser",
      "Bỏ logging",
      "Always synchronous",
      "Run in the browser",
      "Disable logging"
    ],
    [
      "Theo guide, batch tiết kiệm khoảng bao nhiêu?",
      "What batch cost saving does the guide cite?",
      "50%",
      "50%",
      "5%",
      "100%",
      "0%",
      "5%",
      "100%",
      "0%"
    ],
    [
      "Kết quả batch nên nối về tài liệu bằng gì?",
      "How to correlate batch results to documents?",
      "Unique custom_id",
      "Unique custom_id",
      "Vị trí trả về",
      "Tên model",
      "Thời điểm fetch",
      "Result order",
      "Model name",
      "Retrieval time"
    ],
    [
      "SLA 30 giờ, batch window 24 giờ, cadence 4 giờ còn?",
      "30h SLA, 24h batch window and 4h cadence leave?",
      "2 giờ buffer",
      "Two hours of buffer",
      "0 giờ",
      "6 giờ processing guaranteed",
      "30 giờ buffer",
      "No buffer",
      "Six hours guaranteed",
      "Thirty hours"
    ],
    [
      "Một số item expired, retry cái gì?",
      "Some batch items expired. What should be retried?",
      "Chỉ failed/expired với thay đổi phù hợp",
      "Only failed/expired items with targeted changes",
      "Cả batch",
      "Không item nào",
      "Random một nửa",
      "The whole batch",
      "None of them",
      "A random half"
    ],
    [
      "Một client tool cần chạy database giữa turn, có tự chạy trong batch item?",
      "Can a client-side DB tool execute itself inside a batch item?",
      "Không; cần orchestration ngoài",
      "No; application orchestration is required",
      "Có trong mọi batch",
      "Chỉ cần custom_id",
      "Chỉ cần temperature=0",
      "Yes, automatically",
      "Only custom_id is needed",
      "Only temperature zero is needed"
    ],
    [
      "Nên làm gì trước khi xử lý 1.000 documents?",
      "What should happen before batching 1,000 documents?",
      "Tinh chỉnh prompt trên sample đa dạng",
      "Refine prompts on representative samples",
      "Submit nguyên bản rồi đoán",
      "Bỏ schema",
      "Cố bắt buộc real-time",
      "Submit untested",
      "Remove schema",
      "Require real-time"
    ]
  ],
  "exercise": [
    [
      "Phân loại workload",
      "Classify workloads",
      "Tạo danh sách real-time vs overnight và lý do.",
      "List blocking versus overnight tasks with justifications."
    ],
    [
      "Tạo batch requests",
      "Build requests",
      "Tạo object params và unique custom_id cho mỗi tài liệu.",
      "Create request parameter objects with unique custom IDs."
    ],
    [
      "Tính SLA",
      "Calculate an SLA",
      "Tính window 24h, cadence 4h và buffer 2h cho 30h.",
      "Calculate 24h window, 4h cadence and 2h buffer for 30h SLA."
    ],
    [
      "Lọc failures",
      "Filter failures",
      "Từ fixture kết quả JSONL chỉ lấy errored/expired.",
      "Filter errored and expired entries in a mock result set."
    ],
    [
      "Chọn retry cải tiến",
      "Plan targeted retries",
      "Gắn lý do sửa cho từng failed item, không retry success.",
      "Attach a remedial action to failed IDs only."
    ]
  ],
  "commands": "npm run lab:domain4 -- 5\\ncd domain4-workspaces/lesson45\\nnode check.mjs"
});
