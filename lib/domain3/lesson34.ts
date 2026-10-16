import {compactLesson} from "../domain3-compact.ts";
export const lesson34=compactLesson(4,{
  "title": [
    "Plan Mode vs Direct Execution — Chọn chiến lược sửa code",
    "Plan Mode vs Direct Execution"
  ],
  "subtitle": [
    "Một lỗi trong 1 function có thể sửa ngay; migration 40 file cần lập kế hoạch. Tiêu chí quyết định là mức độ mơ hồ, không chỉ độ khó.",
    "Use plan mode for ambiguous architectural work and direct execution for known, well-scoped fixes."
  ],
  "bridge": [
    "3.1–3.3 chuẩn hóa instructions và scoped rules; 3.4 giải quyết việc khi nào Claude chỉ nên khám phá và lập kế hoạch, khi nào được sửa file.",
    "Earlier lessons covered configuration. Now choose between read-only planning and direct implementation."
  ],
  "scenario": [
    "Bạn cần migration từ dayjs sang date-fns trong 36 file của dự án Next.js, nhiều format timezone và tests liên quan. Đồng thời có một lỗi null pointer ở một function với stack trace chỉ rõ nguyên nhân. Không nên dùng cùng workflow cho cả hai: migration phải phân tích dependencies trước, còn lỗi đơn file sửa ngay.",
    "A Next.js app needs a dayjs-to-date-fns migration across 36 files, including timezone and test concerns. Separately, a single function has a clear null-pointer bug. These tasks deserve different execution modes."
  ],
  "slug": "plan-mode-execution",
  "duration": "45 phút / 45 min",
  "topics": [
    [
      "1. Plan mode khi có ambiguity và ảnh hưởng rộng",
      "1. Plan mode for ambiguous wide-scope changes",
      "Plan mode giúp Claude Code đọc cấu trúc codebase, thống kê dependencies, so sánh phương án và tạo strategy trước khi thực thi sửa file. Dùng khi refactor module chính, migration nhiều file, nhiều phương án đều hợp lý hoặc còn thiếu hiểu biết về kiến trúc.",
      "Plan mode explores modules and dependencies and proposes a strategy without making code changes in its planning phase. It fits uncertain architecture choices, multi-file refactors and migrations with competing approaches.",
      "claude --permission-mode plan\n# Or Shift+Tab until the UI says Plan\n# Or use /plan before the request",
      "Có nhiều phương án và dependency chưa rõ → vào Plan mode ngay từ đầu.",
      "Start planning upfront when the task is inherently ambiguous or architectural."
    ],
    [
      "2. Direct execution cho fix đã hiểu rõ",
      "2. Direct execution for known scoped fixes",
      "Nếu stack trace chỉ ra file src/auth.ts và dòng kiểm tra user undefined, phương án cần thay đổi đã rõ và chỉ ảnh hưởng một function, direct execution giúp tiết kiệm overhead. Độ khó thuật toán có thể cao nhưng nếu cause/location/approach rõ thì không cần plan dài.",
      "A bug with a clear stack trace, known function and known fix is appropriate for direct execution. Task difficulty itself is not the deciding factor; ambiguity and architectural uncertainty matter more.",
      "// Small known fix\nif (!user) return {ok:false,error:'UNAUTHENTICATED'};\n// Verify with unit tests after edit.",
      "Known location + known solution + narrow scope → direct execution.",
      "Known cause, path and approach support direct execution."
    ],
    [
      "3. Không thể bật plan chỉ bằng cách nói 'in plan mode'",
      "3. Enter plan mode through the actual control",
      "Lời yêu cầu tiếng Anh 'in plan mode' trong body prompt không tự thay đổi permission mode. Dùng claude --permission-mode plan khi bắt đầu, Shift+Tab trong phiên, hoặc /plan theo cú pháp Claude Code hiện tại. Xác nhận UI hiển thị Plan trước khi tin sẽ không sửa file.",
      "Merely saying 'please work in plan mode' in free text does not activate the permission mode. Use --permission-mode plan, the interactive mode switch, or the /plan mechanism, and check the UI state.",
      "# Correct:\nclaude --permission-mode plan\n# Or within session: Shift+Tab → Plan\n# The prompt body is not a permission switch.",
      "Mệnh lệnh mode là tính năng CLI, không phải chỉ dẫn văn bản cho model.",
      "Mode selection must be configured, not inferred from prose."
    ],
    [
      "4. Hybrid Plan → Execute cho migration nhiều file",
      "4. Hybrid plan-then-execute strategy",
      "Với migration dayjs, bước Plan dùng Grep và Read để tìm 36 file imports, map format/timezone API, lập kế hoạch xử lý các trường hợp biên. Sau khi review và phê duyệt kế hoạch, đổi sang direct execution để sửa từng nhóm file và chạy tests.",
      "For a library migration, planning maps imports, dependencies, API changes and regressions. Once the strategy is approved, direct execution performs the consistent changes, followed by test verification.",
      "# Phase A: plan migration, no file edits\n# Phase B: implement approved replacements\n# Phase C: npm test / typecheck and review diff",
      "Không phải chọn Plan HOẶC Direct mãi mãi; multi-file migration dùng cả hai theo thứ tự.",
      "Use plan THEN direct execution for a well-researched multi-file migration."
    ],
    [
      "5. Explore subagent giữ main context gọn",
      "5. Explore subagent isolates verbose discovery",
      "Codebase exploration tạo rất nhiều glob matches, import chains và log. Dùng Explore subagent để nghiên cứu độc lập và chỉ trả lại bản tóm tắt relevant findings cho cuộc hội thoại chính, tránh làm loãng context dành cho implementation.",
      "Extensive code discovery produces noisy listings and dependency notes. Delegating read-only exploration to an Explore subagent isolates verbose observations and returns concise findings to the main session.",
      "# Plan prompt:\n# Use Explore subagent for dependency mapping.\n# Return only affected paths, risks and recommendations.",
      "Subagent cô lập context, không tự tạo bản copy Git branch hoặc filesystem.",
      "Explore isolates discovery output; it does not automatically isolate filesystem."
    ],
    [
      "6. Bẫy chọn mode theo difficulty",
      "6. Ambiguity matters more than difficulty",
      "Một fix trong 1 function dù logic khó nhưng cause rõ vẫn nên direct. Một yêu cầu 'thêm user profile' nghe đơn giản nhưng liên quan authentication, role, database và nhiều kiến trúc khác nhau nên plan. Đừng bắt đầu direct rồi chờ tới khi đụng khó mới bật plan nếu đề đã cho biết phức tạp.",
      "A difficult but well-defined single-function fix can be direct, while a seemingly easy user-profile request with multiple viable architectures may require planning. Recognise upfront complexity from the requirements rather than waiting for surprises.",
      "function chooseMode({scope,alternatives,knownFix}) {\n  return alternatives>1 || (scope==='multi'&&!knownFix) ? 'plan' : 'direct';\n} // Illustration, not Claude SDK API",
      "Chọn mode theo ambiguity, scope, dependencies và kiến thức hiện có.",
      "Choose mode by ambiguity and dependencies, not by perceived difficulty."
    ]
  ],
  "table": [
    [
      "Restructure monolith",
      "Plan",
      "Architecture choices"
    ],
    [
      "Single known bug",
      "Direct",
      "Fix already identified"
    ],
    [
      "Migration across 36 files",
      "Plan → Direct",
      "Explore then implement"
    ],
    [
      "Multiple valid approaches",
      "Plan",
      "Compare trade-offs"
    ],
    [
      "Verbose discovery",
      "Explore subagent",
      "Isolate main context"
    ],
    [
      "Small config update",
      "Direct",
      "Known change"
    ]
  ],
  "words": [
    [
      "Plan Mode",
      "chế độ lập kế hoạch",
      "Read and design before file edits."
    ],
    [
      "Direct Execution",
      "thực thi trực tiếp",
      "Apply known changes without planning phase."
    ],
    [
      "Ambiguity",
      "độ mơ hồ",
      "Unknown solution or competing approaches."
    ],
    [
      "Hybrid Workflow",
      "kết hợp 2 pha",
      "Plan first, implement afterward."
    ],
    [
      "Explore Subagent",
      "agent phụ khám phá",
      "Isolated codebase discovery."
    ],
    [
      "Dependency Mapping",
      "lập bản đồ phụ thuộc",
      "Determine what a change will affect."
    ],
    [
      "Trade-off",
      "đánh đổi phương án",
      "Compare advantages and limitations."
    ],
    [
      "Permission Mode",
      "chế độ quyền",
      "CLI setting controlling what actions run."
    ]
  ],
  "questions": [
    [
      "Restructure monolith cần mode nào?",
      "Which mode for a monolith restructure?",
      "Plan",
      "Plan",
      "Direct ngay",
      "Không cần Claude",
      "Random",
      "Immediate direct",
      "No Claude",
      "Random"
    ],
    [
      "Fix null pointer biết rõ file và cause?",
      "Fix a clear single-function null pointer?",
      "Direct",
      "Direct",
      "Plan 2h",
      "Fork session",
      "Tạo MCP",
      "Plan for hours",
      "Fork session",
      "Add MCP"
    ],
    [
      "Migration 36 files nên làm gì?",
      "A library migration across 36 files calls for?",
      "Plan rồi Execute",
      "Plan then Execute",
      "Direct toàn bộ",
      "Không test",
      "Chỉ Explore",
      "Only direct",
      "Skip tests",
      "Explore only"
    ],
    [
      "Viết 'in plan mode' vào prompt có bật mode?",
      "Does writing 'in plan mode' enable plan mode?",
      "Không",
      "No",
      "Có",
      "Chỉ mobile",
      "Chỉ API",
      "Yes",
      "Mobile only",
      "API only"
    ],
    [
      "Cách CLI bật plan lúc start?",
      "How to start Claude Code in plan mode?",
      "--permission-mode plan",
      "--permission-mode plan",
      "--headless",
      "--fork",
      "--json-schema",
      "--headless",
      "--fork",
      "--json-schema"
    ],
    [
      "Explore subagent hữu ích vì sao?",
      "Why delegate verbose discovery to Explore?",
      "Giữ main context gọn",
      "Keep main context focused",
      "Tạo git branch",
      "Bỏ tests",
      "Không dùng tokens",
      "Creates git branch",
      "Skips tests",
      "No tokens"
    ],
    [
      "Mode phụ thuộc difficulty hay ambiguity?",
      "Does mode depend chiefly on difficulty or ambiguity?",
      "Ambiguity",
      "Ambiguity",
      "Difficulty",
      "Số token",
      "Tên file",
      "Difficulty",
      "Tokens",
      "Filename"
    ],
    [
      "Task yêu cầu thay kiến trúc 40 file, khi nào vào plan?",
      "When to plan a known-large architectural task?",
      "Ngay từ đầu",
      "From the beginning",
      "Đợi error",
      "Sau deploy",
      "Sau khi code hết",
      "After error",
      "After deploy",
      "After writing all code"
    ]
  ],
  "exercise": [
    [
      "Plan một migration",
      "Plan a migration",
      "Trong fixture, lập plan chuyển API oldDate() sang formatDate() qua nhiều files, không sửa.",
      "Plan multi-file migration and inspect dependencies without edits."
    ],
    [
      "Fix bug trực tiếp",
      "Direct small bugfix",
      "Yêu cầu sửa một lỗi null guard có test rõ.",
      "Fix a known one-function bug without planning overhead."
    ],
    [
      "Thử hybrid",
      "Use plan then execute",
      "Duyệt plan, chuyển direct rồi áp dụng migration.",
      "Approve plan then implement migration."
    ],
    [
      "Explore độc lập",
      "Explore isolation",
      "Yêu cầu Explore liệt kê dependencies và báo tóm tắt.",
      "Use Explore for verbose codebase scanning and concise findings."
    ],
    [
      "Viết decision framework",
      "Write mode decision rules",
      "Ghi 4 tiêu chí chọn plan và 3 tiêu chí direct kèm ví dụ.",
      "Document mode-choice criteria and concrete cases."
    ]
  ],
  "commands": "npm run lab:domain3 -- 4\ncd domain3-workspaces/lesson34\nclaude --permission-mode plan"
});
