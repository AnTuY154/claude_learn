// Decision matrix chung cho 7 bài: hỏi về TRIỆU CHỨNG → chọn kiến trúc → lý do.
// Giúp học theo tình huống thực tế thay vì thuộc lòng keywords.
export type ExamDecision = { symptom: string; action: string; because: string };
export const examDecisions: Record<number, ExamDecision[]> = {
  1: [
    { symptom: "Tool_use xuất hiện sau một text block", action: "Tiếp tục agent loop và xử lý tool_use", because: "stop_reason điều khiển; text không chứng minh hoàn tất." },
    { symptom: "Claude không biết dữ liệu search ở lượt trước", action: "Kiểm tra assistant tool_use + user tool_result đã vào history", because: "Không có tool result thì model không biết output công cụ." },
    { symptom: "Loop dừng sau đúng 5 lượt dù chưa xong", action: "Giữ cap như safety bound, đánh dấu incomplete; không coi là thành công", because: "end_turn mới là completion signal của basic loop." },
    { symptom: "API trả pause_turn hoặc max_tokens", action: "Xử lý stop_reason đặc biệt theo contract SDK", because: "Production có nhiều trạng thái hơn hai nhánh trọng tâm của đề thi." },
  ],
  2: [
    { symptom: "Report chỉ có solar và wind, mất các category khác", action: "Sửa decomposition breadth của coordinator", because: "Specialist làm đúng assignment; categories không được giao." },
    { symptom: "Report có đủ category nhưng một phần rất nông", action: "Refine prompt/context/retrieval của subagent phụ trách", because: "Đây là vấn đề depth, không phải decomposition thiếu breadth." },
    { symptom: "Câu hỏi đơn giản luôn chạy 6 subagents", action: "Dynamic agent selection", because: "Không cần full pipeline khi ít hơn đủ đáp án." },
    { symptom: "Sau synthesis vẫn còn missing category", action: "Targeted follow-up rồi kiểm tra coverage lại", because: "Coordinator phải refine, không chỉ phân việc một lần." },
  ],
  3: [
    { symptom: "Synthesis report mất citations dù research agents có URL/trang", action: "Gửi structured findings đầy đủ kèm metadata", because: "Coordinator stripping metadata gây attribution failure." },
    { symptom: "Subagent không nhớ kết quả agent khác", action: "Pass explicit context qua coordinator", because: "Không có shared memory mặc định giữa independent invocations." },
    { symptom: "Hai independent research agents chạy nối tiếp", action: "Spawn parallel bằng nhiều Agent/Task calls cùng lượt", because: "Không có dependency thì sequential chỉ tăng latency." },
    { symptom: "Muốn thử hai hướng từ cùng analysis", action: "Fork session thay vì đơn thuần resume", because: "Fork tạo independent branches từ shared baseline, khác parallel task spawning." },
  ],
  4: [
    { symptom: "LLM đôi khi gọi refund trước khi xác minh khách hàng", action: "Prerequisite gate ở tool/backend", because: "Prompt không tạo invariant an toàn cho giao dịch tài chính." },
    { symptom: "Khách hỏi trả hàng, đổi địa chỉ và loyalty points", action: "Decompose concerns, điều tra independent song song, unified response", because: "Không bỏ sót concern và không ép dependency chạy song song." },
    { symptom: "Escalate human nhưng human không có transcript", action: "Self-contained structured handoff", because: "Customer ID, summary, root cause, amount và action phải có sẵn." },
    { symptom: "Muốn cấm spawn khi context còn thiếu", action: "PreToolUse matcher Agent", because: "SubagentStart có thể thêm context nhưng không block spawn." },
  ],
  5: [
    { symptom: "Transfer vượt hạn mức hoặc thiếu AML", action: "PreToolUse deny / approval và backend guard", because: "Phải chặn trước side effect." },
    { symptom: "Tool trả date/status nhiều format", action: "PostToolUse updatedToolOutput với parser theo source contract", because: "Normalizing sau tool nhưng trước model tránh diễn giải lẫn lộn." },
    { symptom: "Muốn rollback money transfer bằng PostToolUse", action: "Không thể; dùng PreToolUse và transaction backend", because: "PostToolUse xảy ra sau khi side effect đã được thực hiện." },
    { symptom: "Muốn sao lưu lịch sử trước compaction", action: "PreCompact (ngoài phần trọng tâm của 1.5)", because: "Đây là session event, không phải tool result hook." },
  ],
  6: [
    { symptom: "Biết trước các bước extraction/document pipeline", action: "Fixed pipeline / prompt chaining", because: "Các bước xác định phù hợp consistency và monitoring." },
    { symptom: "Debug legacy code chưa biết dependency", action: "Dynamic adaptive decomposition", because: "Plan phải điều chỉnh khi phát hiện mới." },
    { symptom: "Review file 1–5 sâu nhưng file 10–14 hời hợt", action: "Per-file local pass + cross-file integration", because: "Attention dilution không được giải quyết triệt để chỉ bằng tăng model/context." },
    { symptom: "Chia 14 files thành batches nhưng không so sánh giữa batches", action: "Bổ sung dedicated cross-file integration", because: "Các lỗi consistency/data flow qua nhiều file có thể bị bỏ sót." },
  ],
  7: [
    { symptom: "Tiếp tục hôm qua, code chưa đổi", action: "Resume", because: "Context còn valid; không cần fresh re-analysis." },
    { symptom: "Muốn so sánh hai refactor strategies từ baseline", action: "Fork session", because: "Mỗi nhánh độc lập sau khi fork." },
    { symptom: "3 trong 50 files đã sửa, lời khuyên cũ mâu thuẫn", action: "Fresh session + curated summary + re-read changed files", because: "Resume hay fork vẫn mang raw stale tool results." },
    { symptom: "Vừa nâng dependency ảnh hưởng nhiều modules", action: "Re-evaluate impacted dependency graph, mở rộng scope nếu cần", because: "Targeted re-analysis không đồng nghĩa bỏ qua ảnh hưởng lan truyền." },
  ],
};
