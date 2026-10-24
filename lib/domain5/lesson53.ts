import {reliabilityLesson} from "../domain5-builder.ts";
export const lesson53=reliabilityLesson(3,{
  "title": [
    "Error Propagation — Không được che giấu lỗi của subagent",
    "Error Propagation in Multi-Agent Systems"
  ],
  "subtitle": [
    "Bốn thành phần lỗi có cấu trúc, partial results, retry cục bộ và coverage gaps.",
    "Use structured failures, distinguish true empty results, preserve partial evidence and recover locally."
  ],
  "scenario": [
    "Một pipeline tạo báo giá dùng 5 subagents: giá gạch, vật tư, lịch thợ, việc cũ và lịch sử khách. Giá gạch bị timeout nhưng bốn agent khác xong. Nếu báo [] success, báo giá thiếu gạch mà ai cũng tưởng đầy đủ; nếu kill pipeline thì bỏ phí bốn kết quả.",
    "A builder's quoting workflow delegates to five agents for materials, calendar and history. The brick supplier lookup times out whilst the other four succeed. Returning an empty success hides the loss; terminating all work discards useful results."
  ],
  "bridge": [
    "Task 5.3 dạy truyền lỗi có cấu trúc để coordinator quyết định hồi phục, không bắt cả pipeline chết hoặc giả lập thành công.",
    "Task 5.3 focuses on actionable errors that allow the coordinator to recover without discarding useful work or pretending the lookup succeeded."
  ],
  "slug": "error-propagation",
  "duration": "50 minutes",
  "topics": [
    [
      "1. Error propagation trong multi-agent",
      "1. What error propagation enables",
      "Một coordinator tổng hợp kết quả chỉ biết được sự cố nếu specialist báo rõ tình trạng. Lỗi truy cập nguồn nghĩa query chưa chạy; kết quả rỗng hợp lệ nghĩa query đã chạy và không có match. Đây là khác biệt cốt lõi để quyết định có retry hay không.",
      "A coordinator can only recover intelligently when specialists expose failure states. An access failure means the source was never queried successfully. A valid empty result means a completed query found nothing. Confusing the two causes both missed recovery and wasteful retries.",
      "const outcome=remoteTimedOut?{status:'error',failureType:'transient'}:{status:'success',results:rows};\n// [] under success is valid only for executed queries.",
      "Access failure khác empty success cả về ý nghĩa lẫn hành động.",
      "Access failure and successful emptiness require different decisions."
    ],
    [
      "2. Bốn trường thông tin bắt buộc",
      "2. Four required error-context elements",
      "Structured error phải có: failureType (transient/validation/business/permission), attemptedAction gồm tool và query/parameters, partialResults đã lấy được, alternativeApproaches để coordinator lựa chọn. Chỉ trả 'search unavailable' bỏ hết thông tin quan trọng.",
      "A useful subagent failure includes four elements: failure type, the attempted action and parameters, partial results collected before failure, and suggested alternatives. A generic 'search unavailable' error conceals the information needed for informed recovery.",
      "const failure={failureType:'transient',attemptedAction:{tool:'search_prices',query:'facing brick June'},partialResults:[{vendor:'A',price:43}],alternativeApproaches:['retry source','ask second merchant']};",
      "Nêu rõ đã thử gì và tìm được gì trước khi hỏng.",
      "Preserve attempted parameters, partial findings and fallback strategies."
    ],
    [
      "3. Phân loại failures để chọn recovery",
      "3. Distinguish failure classes",
      "Transient timeout/rate limit có thể retry; validation error cần sửa input; permission error cần quyền thực tế; business error là rule không hợp lệ cần đổi hướng hoặc người duyệt. Không retry permission hay validation vô hạn. Side effects đòi hỏi phòng gọi lặp.",
      "Transient timeouts or rate limits may be retried with bounds. Validation errors need corrected input; permission errors require authorisation; business-rule violations require a different course or human review. Blindly retrying any class is unreliable, especially for side-effectful operations.",
      "function recover(error){switch(error.failureType){case 'transient':return 'bounded-retry';case 'validation':return 'fix-query';case 'permission':return 'request-access';default:return 'review-rule';}}",
      "Failure class chứ không chỉ text message quyết định next step.",
      "The failure class and actual attempt determine recovery, not a generic message."
    ],
    [
      "4. Hai anti-pattern: silent suppression/termination",
      "4. Silent suppression and pipeline termination",
      "Silent suppression biến timeout thành status success/results [] khiến pipeline tạo báo cáo thiếu mà không biết. Workflow termination vứt bốn kết quả khác chỉ vì một subagent lỗi. Cách đúng: coordinator giữ evidence thành công, nhận lỗi có context và quyết định retry/fallback hoặc ghi limitation.",
      "Silent suppression disguises a timeout as 'success, results=[]', hiding a coverage gap. Whole-workflow termination discards the work of all successful specialists. Instead retain completed evidence, propagate a structured failure and let the coordinator choose targeted recovery or a documented limitation.",
      "const quote={mortar:120,sand:80,brick:{status:'partial_failure',attempts:2,partialResults:[43]}};\n// Do not turn brick into {status:'success',results:[]}.",
      "Không tô lỗi thành thành công và không xóa partial work.",
      "Do not disguise failure as success or discard unrelated successes."
    ],
    [
      "5. Local recovery cho transient failures",
      "5. Local recovery for transient failures",
      "Specialist có thể retry vài lần với backoff, thử nguồn khác hay trả degraded partial response trước khi làm phiền coordinator. Nếu vẫn lỗi, báo attempts, partial findings và alternatives. Coordinator không nên phải lập trình retry chi tiết cho mọi chuyên môn.",
      "The specialist should attempt bounded local retry, alternative sources or partial degradation for transient faults. If recovery fails, report attempts and usable partial evidence. This keeps domain-specific retry detail out of the coordinator while making limits visible.",
      "async function lookupWithRecovery(run){for(let n=0;n<3;n++){try{return {status:'success',results:await run()};}catch(e){if(n===2)return {status:'partial_failure',failureType:'transient',attempts:3};}}}",
      "Retry cục bộ trước; propagate khi không phục hồi được.",
      "Recover locally where appropriate, then propagate unresolved failure context."
    ],
    [
      "6. Coverage annotations trong synthesis",
      "6. Annotate unsupported areas in synthesis",
      "Khi giá gạch chưa tìm được, report vẫn nêu phạm vi đã xác minh và chú giải rõ 'brick price section limited because supplier unavailable'. Không được lặng lẽ bỏ chủ đề như không liên quan. Người đọc cần biết độ đầy đủ để quyết định.",
      "When the brick supplier is unavailable, the final report should explicitly label the brick-cost section as incomplete. Preserve what the other four agents established. Omitting the topic silently gives readers a false impression of comprehensive coverage.",
      "const synthesis={findings:successfulAgents,coverage:[{topic:'brick costs',status:'limited',reason:'supplier timed out'}]};\n// Readers can distinguish gaps from absence of evidence.",
      "Coverage gap phải hiển thị cùng phần synthesis.",
      "Surface known coverage gaps and explain their causes."
    ],
    [
      "7. Valid empty results không retry vô ích",
      "7. Do not retry successful empty queries",
      "Nếu hệ thống job history trả status success/results [] cho 'curved wall', đó chính là câu trả lời: không có job phù hợp. Retry chỉ vì array rỗng làm tốn tiền và delay. Với timeout, query chưa hoàn thành thì mới cân nhắc retry.",
      "A successful query that returns an empty array is still a complete answer. Repeating it merely because no items matched wastes resources. By contrast, a timeout means the query could not complete and may merit bounded recovery.",
      "const result={status:'success',results:[],shouldRetry:false};\n// Empty output on an executed query is not a transport failure.",
      "Chỉ retry nếu có lỗi truy cập hoặc điều kiện thực sự có thể phục hồi.",
      "A genuinely empty successful query does not require another attempt."
    ]
  ],
  "questions": [
    [
      "Brick supplier timeout nhưng bốn agents khác trả thành công. Coordinator cần gì?",
      "One of five subagents times out. What should it return for intelligent recovery?",
      "Structured failure có attempted query, partial results, alternatives.",
      "A structured failure with attempted query, partial results and alternatives.",
      "Trả [] với success.",
      "Kill toàn bộ pipeline.",
      "Báo 'unavailable' không chi tiết.",
      "Return an empty successful result.",
      "Terminate the whole pipeline.",
      "Return only a generic unavailable message."
    ],
    [
      "Query đã chạy thành công, không có records. Response đúng?",
      "A query ran successfully and found no matching records. What is the correct result?",
      "status success và results [] không cần retry.",
      "Successful status with an empty results list; no retry needed.",
      "Đánh dấu transient error.",
      "Hỏi lại cùng truy vấn mãi.",
      "Giả một record gần nhất.",
      "Mark as a transient error.",
      "Retry the identical query indefinitely.",
      "Invent the closest matching record."
    ],
    [
      "Validation error vì query sai định dạng. Recovery?",
      "A subagent reports a validation failure due to malformed parameters. What next?",
      "Sửa input trước khi thử lại.",
      "Correct the input before retrying.",
      "Backoff với query y hệt vô hạn.",
      "Yêu cầu tăng quyền.",
      "Giấu lỗi khỏi coordinator.",
      "Back off and repeat unchanged indefinitely.",
      "Request unrelated higher permissions.",
      "Hide the error from the coordinator."
    ],
    [
      "Permission denied khi đọc dữ liệu nguồn. Recovery?",
      "A source access returns permission denied. What is the best next action?",
      "Xin quyền phù hợp hoặc chuyển người có quyền.",
      "Request authorisation or hand off to an authorised person.",
      "Retry vô hạn với token cũ.",
      "Giả kết quả rỗng.",
      "Chọn source value ngẫu nhiên.",
      "Retry forever with the same credentials.",
      "Declare a successful empty result.",
      "Choose a random source value."
    ],
    [
      "Một subagent timeout nhưng đã thu 3 trong 5 sources. Nên?",
      "A subagent timed out after retrieving three of five sources. What should happen?",
      "Giữ 3 nguồn và báo partial failure có context.",
      "Preserve three sources and report a contextual partial failure.",
      "Bỏ toàn bộ vì task hỏng.",
      "Đổi thành full success.",
      "Chuyển 3 sources thành source mới không xác minh.",
      "Discard everything because the task failed.",
      "Mark it as fully successful.",
      "Invent missing sources to fill the set."
    ],
    [
      "Report chỉ ghi kết quả của bốn agents và quên khu vực brick. Vấn đề?",
      "A synthesis omits brick costs after a supplier failure. What is missing?",
      "Coverage annotation mô tả limitation rõ ràng.",
      "A coverage annotation describing the missing supplier evidence.",
      "Bảng giá được đoán.",
      "Một retry vô hạn.",
      "Một summary không cần nguồn.",
      "An invented brick estimate.",
      "An unlimited retry loop.",
      "An uncited summary."
    ],
    [
      "Sau transient retries thành công ở lần 2. Specialist nên?",
      "A transient failure recovers on the second local attempt. What should the specialist do?",
      "Trả success thực và findings, không cần giả failure.",
      "Return the actual successful findings without fabricating a failure.",
      "Báo cả pipeline hỏng.",
      "Chuyển người dù đã thành công.",
      "Ẩn tất cả partial evidence.",
      "Fail the entire pipeline.",
      "Escalate despite successful recovery.",
      "Discard the successful evidence."
    ],
    [
      "Vì sao generic 'search unavailable' là không đủ?",
      "Why is a generic 'search unavailable' message inadequate?",
      "Thiếu loại lỗi, attempted action, partial evidence và alternatives.",
      "It hides the failure type, attempted action, partial evidence and alternatives.",
      "Vì mọi lỗi đều cần kill pipeline.",
      "Vì [] luôn là lỗi.",
      "Vì coordinator biết mọi parameters ngầm.",
      "Because any error must terminate the pipeline.",
      "Because empty arrays are always errors.",
      "Because the coordinator implicitly knows all search parameters."
    ]
  ],
  "words": [
    [
      "error propagation",
      "lan truyền lỗi",
      "Communicating subagent failure to its coordinator."
    ],
    [
      "transient failure",
      "lỗi tạm thời",
      "Potentially recoverable timeout or rate-limit failure."
    ],
    [
      "validation failure",
      "lỗi dữ liệu đầu vào",
      "The supplied query or parameters are invalid."
    ],
    [
      "permission failure",
      "lỗi quyền truy cập",
      "The agent lacks required authorisation."
    ],
    [
      "partial results",
      "kết quả một phần",
      "Evidence retrieved before an operation failed."
    ],
    [
      "silent suppression",
      "che giấu lỗi",
      "Presenting a failed operation as successful."
    ],
    [
      "workflow termination",
      "dừng toàn quy trình",
      "Aborting all agents after a local failure."
    ],
    [
      "coverage annotation",
      "chú giải mức độ bao phủ",
      "Explicitly marking evidence gaps in synthesis."
    ]
  ],
  "exercise": [
    [
      "Định nghĩa error schema",
      "Define the failure schema",
      "Đủ failureType, attemptedAction, partialResults, alternativeApproaches.",
      "Include the four required fields and explain their roles."
    ],
    [
      "Tách access fail và valid empty",
      "Differentiate access failure and empty success",
      "Bài test phải phân biệt timeout và query thành công rỗng.",
      "Test timeouts separately from successful empty results."
    ],
    [
      "Bounded local retries",
      "Add bounded local retries",
      "Thử 3 lượt cho lỗi transient trong specialist.",
      "Attempt up to three local retries for transient failures."
    ],
    [
      "Coordinator recovery choice",
      "Implement coordinator recovery",
      "Dùng failure type và partial evidence để chọn hướng.",
      "Use failures and partial evidence to pick a recovery action."
    ],
    [
      "Annotate synthesis coverage",
      "Annotate synthesis limitations",
      "Đánh dấu missing supplier section thay vì giấu.",
      "Mark missing supplier coverage rather than omitting it."
    ]
  ],
  "table": [
    [
      "Timeout/access failure",
      "Retry or alternative",
      "Query chưa hoàn thành"
    ],
    [
      "Valid empty result",
      "Do not retry",
      "Query đã chạy"
    ],
    [
      "One agent fails",
      "Propagate partial failure",
      "Keep other agents' work"
    ]
  ],
  "commands": "npm run lab:domain5 -- 3"
});
