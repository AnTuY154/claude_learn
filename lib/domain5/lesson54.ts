import {reliabilityLesson} from "../domain5-builder.ts";
export const lesson54=reliabilityLesson(4,{
  "title": [
    "Codebase Exploration — Chống suy giảm context",
    "Codebase Exploration and Context Degradation"
  ],
  "subtitle": [
    "Scratchpad, subagent isolation, summary injection, /compact và state manifest phục hồi.",
    "Protect exact code findings with scratchpads, isolated subagents, phase summaries and recovery manifests."
  ],
  "scenario": [
    "Một agent khám phá hệ thống báo giá nhiều giờ. Ban đầu nêu rõ QuoteRepository.ts, caching trong findById và chuỗi phụ thuộc; về sau chỉ nói 'typical repository pattern' dù chưa hết context tokens. Cần lưu cụ thể phát hiện ngoài hội thoại và tránh làm đầy context coordinator.",
    "After hours exploring a job-costing codebase, an agent stops naming the QuoteRepository class and specific dependency chain, instead making generic claims about a 'typical repository pattern'. Its context is degraded despite spare token capacity."
  ],
  "bridge": [
    "Task 5.4 liên quan việc giữ findings kỹ thuật chính xác qua các phases và sự cố crash; việc đổi model lớn hơn không sửa nguyên nhân dữ liệu bị chôn trong log.",
    "Task 5.4 concerns preserving precise architecture findings through long investigations and crashes. A bigger window alone does not remedy buried evidence."
  ],
  "slug": "codebase-exploration",
  "duration": "60 minutes",
  "topics": [
    [
      "1. Triệu chứng suy giảm context",
      "1. What context degradation looks like",
      "Sau quá nhiều file reads, directory listings và Grep outputs, agent quên class, method, path chính xác đã phát hiện, chuyển sang nói chung chung. Đây là giảm chất lượng chú ý, không nhất thiết do chạm trần token. Nhận diện dấu hiệu trước khi thông tin sai lan vào implementation.",
      "Verbose directory listings, file reads and search outputs accumulate until exact earlier references lose salience. When an agent substitutes 'typical patterns' for specific class names and paths it once knew, context quality has degraded even if capacity remains.",
      "const before={file:'src/repos/quote.ts',method:'findById',cache:true};\nconst after='Usually repositories implement caching';\n// The second statement has lost verifiable specificity.",
      "Đừng đánh đồng attention degradation với tràn token.",
      "Context degradation is loss of specificity, not necessarily token exhaustion."
    ],
    [
      "2. Scratchpad files là cách chính",
      "2. Scratchpad files are the primary remedy",
      "Ghi findings vào file riêng ngay từ đầu: exact file names, class/method, dependency chain, test gaps, unresolved questions. Khi cần agent đọc lại scratchpad thay vì đoán từ history dài. Scratchpad là state nằm ngoài conversation; vẫn phải cập nhật khi code đổi.",
      "Create scratchpad files at the start of extended exploration with precise file paths, class names, methods, dependencies, test gaps and open questions. Re-read them instead of relying on distant conversation memory. A scratchpad persists outside model context but should be refreshed when underlying code changes.",
      "const scratchpad='# Exploration\\n- QuoteRepository: src/repos/quote.ts\\n- findById uses cache\\n- Dependency: QuoteService -> QuoteRepository';\n// Write once, refine after each discovery stage.",
      "Ghi exact findings ra file, đừng chỉ giữ trong chat dài.",
      "Externalise verified details before they are buried by further exploration."
    ],
    [
      "3. Subagents để cách ly context",
      "3. Delegate to isolate verbose work",
      "Thay coordinator tự Grep/Read mọi module, giao specialist các nhiệm vụ rõ: tìm tests, trace payment flow, liệt kê external APIs. Mỗi subagent đọc nhiều tool outputs trong context riêng rồi trả summary cấu trúc có paths/sources; coordinator chỉ nắm findings trọng tâm. Lợi ích chính là isolation, không chỉ concurrency.",
      "Delegate focused tasks such as locating tests, tracing payment dependencies and inspecting external integrations. Each subagent does verbose exploration in isolated context, returning structured findings with paths and evidence. The coordinator retains decision-level summaries. Isolation is more important than parallel speed.",
      "const tasks=['trace payment chain','find related tests','inspect retry patterns'];\nconst findings=await Promise.all(tasks.map(scope=>delegate(scope)));\n// Coordinator receives compact findings, not raw file dumps.",
      "Subagents giảm pollution cho coordinator; không mặc nhiên share history.",
      "Subagents isolate discovery context; their histories are not automatically shared."
    ],
    [
      "4. Summary injection giữa các phases",
      "4. Inject phase summaries into later work",
      "Phase 2 agent mới không biết Phase 1 tìm ra Controllers -> Services -> Repositories -> DB. Hãy tạo summary đầy đủ facts/key dependencies, rồi inject ngay từ initial prompt Phase 2 tránh cold start khám phá lại từ đầu. Không đổ nguyên transcript vào mọi agent.",
      "A Phase 2 specialist starts without Phase 1 history. Inject a focused architectural summary containing verified layers, dependency chains, important issues and the new objective. This avoids redundant cold-start exploration without flooding the new agent with an old transcript.",
      "const phase2Context={architecture:'Controller -> Service -> Repository -> DB',keyFinding:'QuoteRepository caches findById',nextTask:'check invalidation'};\n// Pass explicitly to each phase-two subagent.",
      "Chuyển findings có chọn lọc sang phase sau; không giả có shared memory.",
      "Inject concise, source-grounded phase summaries rather than whole transcripts."
    ],
    [
      "5. /compact dùng chủ động",
      "5. Use /compact proactively",
      "Trong Claude Code, /compact nén context để giảm verbose history khi phiên kéo dài; không cần đợi báo hết tokens mới làm. Tuy nhiên hãy giữ scratchpad và state quan trọng bên ngoài trước khi compact, bởi bản tóm tắt có thể lược chi tiết mà những phase sau cần.",
      "Claude Code's /compact reduces accumulated conversational material during long exploration sessions. Use it before reaching capacity limits. Keep precise findings in scratchpads and manifests first because a compressed narrative can still omit details required for later phases.",
      "const action='/compact';\n// First record paths, key findings, current stage and unanswered questions in durable files.",
      "Compact bảo vệ chất lượng context, nhưng không thay scratchpad.",
      "Proactive compaction helps context quality but does not replace durable exact findings."
    ],
    [
      "6. State manifest giúp phục hồi crash",
      "6. A structured state manifest supports recovery",
      "Lưu manifest ở đường dẫn xác định gồm exploredPaths, searches, keyFindings, phase, nextSteps và unresolved issues. Sau crash, coordinator load manifest rồi truyền ngữ cảnh vào prompts để tiếp tục không mất tiến độ. Đừng chỉ hy vọng lịch sử tự còn nguyên ở mọi môi trường.",
      "Persist a manifest at a known path with explored files, searches, findings, current phase, next steps and unresolved issues. On resume, load it and pass the relevant state into agent prompts. This makes recovery explicit rather than relying on accidental conversation retention.",
      "const state={phase:2,exploredPaths:['src/repos/quote.ts'],keyFindings:['findById cache'],nextSteps:['check invalidation'],questions:[]};\n// Persist as JSON before a crash can wipe transient work.",
      "State manifest có thể tái lập workflow sau interruption.",
      "A manifest preserves progress and pending work across interruptions."
    ],
    [
      "7. Exam Guide vs Current state trong nguồn",
      "7. Distinguish the exam guide and source's current-state note",
      "Guide v1.0 dùng state manifest mà coordinator load khi resume làm đáp án cho crash recovery. Chính bài nguồn ghi chú Claude Code mới có thể resume subagent sau restart và giữ history. Khi trả lời đề dựa Task Statement chọn manifest; khi triển khai nhận biết khả năng resume mà nguồn mô tả, không lẫn hai bối cảnh.",
      "The source explicitly contrasts Exam Guide v1.0's state-manifest answer with a current-state note that Claude Code may resume a subagent after restart with its history. For exam-style questions, choose the manifest recovery pattern; do not confuse that with newer implementation behaviour described by the same curriculum.",
      "const examAnswer='persist structured state manifest';\nconst sourceCurrentNote='resumed subagent may retain history';\n// Label the scope of each statement.",
      "Đọc nhãn Exam Guide/Current state trên chính bài nguồn.",
      "Use the source's explicit exam-versus-current distinction rather than blending behaviours."
    ]
  ],
  "questions": [
    [
      "Agent nói 'typical pattern' thay vì class/path đã tìm thấy. Nguyên nhân chính?",
      "An explorer switches from precise class names to 'typical patterns'. What is happening?",
      "Context degradation do verbose outputs chôn mất details.",
      "Context degradation as verbose outputs bury earlier precise findings.",
      "Hết token ngay tức thì.",
      "Bị thiếu quyền GitHub.",
      "Grep tool bị cấm.",
      "The context window has necessarily run out.",
      "GitHub permissions have expired.",
      "Grep was disabled."
    ],
    [
      "Biện pháp chính giữ dependency chains qua session dài?",
      "What is the PRIMARY way to retain exact dependency chains during long exploration?",
      "Ghi scratchpad files ở ngoài conversation.",
      "Maintain external scratchpad files with exact findings.",
      "Tăng context window đơn thuần.",
      "Tin model sẽ tự nhớ.",
      "Đọc toàn bộ codebase vào initial prompt.",
      "Increase the context window alone.",
      "Rely on the model's memory.",
      "Preload the entire repository."
    ],
    [
      "Coordinator tự đọc 400 files làm context đầy logs. Sửa kiến trúc?",
      "A coordinator reads hundreds of files, filling its own context with logs. Best change?",
      "Giao focused exploration cho subagents có context tách biệt.",
      "Delegate focused exploration to context-isolated subagents.",
      "Copy raw outputs cho mọi agent.",
      "Chỉ dùng một agent lớn hơn.",
      "Tắt logging nhưng vẫn chèn raw tool results.",
      "Copy all raw outputs to each agent.",
      "Always use one larger model.",
      "Hide terminal logs whilst keeping raw results in context."
    ],
    [
      "Phase 2 agent không biết architecture của phase 1. Nên?",
      "A phase-two subagent lacks phase-one architecture findings. What should the coordinator do?",
      "Inject structured phase-one summary cùng mục tiêu mới.",
      "Inject a structured phase-one summary and current objective.",
      "Để agent suy đoán kiến trúc.",
      "Gửi mọi transcript không lọc.",
      "Giả Phase 2 thừa kế context.",
      "Let the agent infer architecture.",
      "Send the full unfiltered transcript.",
      "Assume the second agent inherited all history."
    ],
    [
      "Nên chạy /compact khi nào trong điều tra dài?",
      "When should /compact be used during extended investigation?",
      "Chủ động khi verbose context bắt đầu làm giảm chất lượng.",
      "Proactively when verbose context threatens focus and quality.",
      "Chỉ khi báo hết tokens.",
      "Trước mọi tool call không điều kiện.",
      "Không dùng nếu có subagent.",
      "Only after the token limit is reached.",
      "Before every tool call regardless of need.",
      "Never when subagents are used."
    ],
    [
      "Crash sau Phase 2; cần khôi phục tiến độ có cấu trúc. Cách theo exam guide?",
      "A session crashes after phase two. What is the exam-guide recovery pattern?",
      "Persist manifest gồm explored paths, findings và next steps.",
      "Persist a manifest with explored paths, findings and next steps.",
      "Tự đoán đã làm gì.",
      "Khởi động lại không lưu.",
      "Chỉ phóng to context.",
      "Guess the previous progress.",
      "Restart with no saved state.",
      "Increase context size."
    ],
    [
      "Tại sao chỉ tăng context capacity chưa giải quyết?",
      "Why does a larger context window not reliably fix degradation?",
      "Vấn đề là chú ý phân tán giữa verbose outputs, không chỉ dung lượng.",
      "The issue is lost attention to precise findings, not just capacity.",
      "Vì mọi model luôn giới hạn 8K tokens.",
      "Vì scratchpad không thể đọc.",
      "Vì subagent không tồn tại.",
      "Every model is limited to 8K tokens.",
      "Scratchpads cannot be read.",
      "Subagents do not exist."
    ],
    [
      "Theo note Current state của chính bài nguồn, Claude Code có thể?",
      "According to the curriculum's current-state note, Claude Code can do what after a restart?",
      "Resume một subagent session giữ lịch sử cũ.",
      "Resume a subagent session while retaining its earlier history.",
      "Tự nạp mọi manifest dù không có file.",
      "Bỏ mọi history để tránh stale.",
      "Tự sửa code đã thay đổi.",
      "Automatically load every non-existent manifest.",
      "Erase all history to avoid staleness.",
      "Automatically fix changed source files."
    ]
  ],
  "words": [
    [
      "context degradation",
      "suy giảm chất lượng ngữ cảnh",
      "Loss of precise earlier findings during long exploration."
    ],
    [
      "scratchpad",
      "tệp ghi chú kỹ thuật",
      "External file holding exact discovered paths and relations."
    ],
    [
      "subagent",
      "agent chuyên biệt",
      "Separate context for focused investigation."
    ],
    [
      "context isolation",
      "cách ly ngữ cảnh",
      "Containing verbose exploration away from coordinator."
    ],
    [
      "summary injection",
      "truyền tóm tắt chủ động",
      "Providing earlier-phase findings to a new agent."
    ],
    [
      "cold start",
      "bắt đầu lại thiếu bối cảnh",
      "Redundant exploration due to missing prior context."
    ],
    [
      "/compact",
      "lệnh thu gọn ngữ cảnh",
      "Claude Code command to summarise long sessions."
    ],
    [
      "state manifest",
      "tệp trạng thái có cấu trúc",
      "Persisted record of explored paths, findings and next steps."
    ]
  ],
  "exercise": [
    [
      "Tạo scopes specialist",
      "Create exploration specialist scopes",
      "Phân chia tracing dependency, tests và external API.",
      "Delegate dependency, test and integration investigations."
    ],
    [
      "Ghi scratchpad",
      "Write scratchpad findings",
      "Lưu path/class/method/chain chính xác vào file.",
      "Persist exact class, method, path and dependency details."
    ],
    [
      "Tiêm summary Phase 1",
      "Inject phase-one summary",
      "Chuyển findings và next task sang subagent mới.",
      "Pass verified phase-one findings and new objective."
    ],
    [
      "Tạo state manifest",
      "Persist a state manifest",
      "Ghi exploredPaths, phase, keyFindings, nextSteps.",
      "Write explored paths, current phase, findings and next actions."
    ],
    [
      "Mô phỏng interruption",
      "Simulate crash recovery",
      "Load manifest thay vì đoán và tiếp tục steps chưa xong.",
      "Load the manifest and resume only unfinished steps."
    ]
  ],
  "table": [
    [
      "Quên exact class names",
      "Scratchpad files",
      "Evidence persists outside chat"
    ],
    [
      "Coordinator context quá nhiều",
      "Focused subagents",
      "Isolate verbose discovery"
    ],
    [
      "Crash giữa phase",
      "State manifest",
      "Recover progress with evidence"
    ]
  ],
  "commands": "npm run lab:domain5 -- 4"
});
