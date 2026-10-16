import {compactLesson} from "../domain3-compact.ts";
export const lesson31=compactLesson(1,{
  "title": [
    "CLAUDE.md Hierarchy — Tổ chức instructions theo cấp",
    "CLAUDE.md Hierarchy and Instruction Scope"
  ],
  "subtitle": [
    "Vì sao người mới clone cùng repo nhưng Claude Code không tuân thủ conventions? Hiểu user/project/directory, @ imports và loaded memory.",
    "Why a teammate cloning the same repository misses Claude Code conventions; learn user/project/directory scoping."
  ],
  "bridge": [
    "Tiếp nối tools của Domain 2, cấu hình CLAUDE.md giúp team áp dụng tiêu chuẩn lâu dài nhưng không thể thay thế permission gate.",
    "After tool design, CLAUDE.md provides persistent team guidance, not hard tool enforcement."
  ],
  "scenario": [
    "Developer A viết chuẩn API Next.js trong ~/.claude/CLAUDE.md nên Claude Code của A luôn tạo {data,error}. Developer B mới clone repo nhưng không nhận quy tắc. Lỗi nằm ở cấp lưu hướng dẫn: config cá nhân của A không được version control.",
    "Developer A stores API response conventions in ~/.claude/CLAUDE.md. Developer B clones the same Next.js project but doesn't inherit them because user-level memory isn't shared in git."
  ],
  "slug": "claude-md-hierarchy",
  "duration": "30 phút / 30 min",
  "topics": [
    [
      "1. User, project, directory là gì?",
      "1. User, project and directory scope",
      "User-level ~/.claude/CLAUDE.md áp dụng cho một developer. Root CLAUDE.md hoặc .claude/CLAUDE.md đi theo git và dành cho team. Nested packages/api/CLAUDE.md chỉ định quy ước riêng của package. Vì thế hai người clone giống nhau nhưng user memory khác nhau vẫn nhận khác rules.",
      "Personal ~/.claude/CLAUDE.md stays in the developer's home. Repository root or .claude/CLAUDE.md is team-shared, while nested directory CLAUDE.md narrows conventions to a package.",
      "# root CLAUDE.md: shared team standards\n# packages/api/CLAUDE.md: API-specific\n# ~/.claude/CLAUDE.md: personal preferences",
      "Team → project, personal → user, package-specific → directory.",
      "Team conventions belong in git; personal preferences do not."
    ],
    [
      "2. CLAUDE.md không có strict override precedence",
      "2. No strict override precedence between memory files",
      "Các file CLAUDE.md tìm thấy được nối vào context theo thứ tự tải. Không tồn tại quy tắc đảm bảo rằng file gần thư mục hơn luôn thắng khi có hai instructions mâu thuẫn. Nếu root nói dùng tabs và nested nói spaces, phải loại bỏ mâu thuẫn.",
      "Memory files are concatenated into context rather than resolved with deterministic override precedence. Loading later does not guarantee a conflicting nested instruction wins.",
      "// BAD: root says 'use tabs' and api says 'use spaces'\n// FIX: remove conflict; enforce via Prettier/ESLint",
      "Mâu thuẫn không được xử lý bằng thứ tự nạp; settings/hooks mới là chỗ enforce.",
      "Loading order is not guaranteed precedence; enforce hard policy in settings/hooks."
    ],
    [
      "3. @ imports để module hóa conventions",
      "3. Eager @ imports for modular instructions",
      "Sử dụng @./standards/testing.md ngay trong CLAUDE.md để chia một file lớn thành nhiều modules dễ cập nhật. Đây là reference path, không phải keyword @import; referenced content vẫn đi vào context ngay khi CLAUDE.md được nạp.",
      "Add @./standards/testing.md references in CLAUDE.md to keep documentation modular. The referenced file is eagerly included; this is not a lazy, token-saving import.",
      "# CLAUDE.md\n@./standards/naming.md\n@./standards/testing.md\n# Not: @import ./standards/testing.md",
      "@ imports giúp bảo trì chứ không tự giảm context; muốn conditional dùng rules/paths.",
      "@ imports modularise files but are eagerly loaded into context."
    ],
    [
      "4. CLAUDE.local.md và .claude/rules",
      "4. Local notes and reusable rules",
      "CLAUDE.local.md dùng notes riêng trên máy, nên gitignore để không đẩy vào repo. Trong .claude/rules/ có thể tạo testing.md hoặc api.md; khi có YAML paths, chỉ áp dụng khi Claude làm việc với file tương ứng, khác root CLAUDE.md.",
      "CLAUDE.local.md is generally a gitignored per-project personal note. Files under .claude/rules/ can use YAML paths patterns to conditionally load instructions for relevant file types.",
      "# .gitignore\nCLAUDE.local.md\n# .claude/rules/testing.md\n# ---\n# paths: ['**/*.test.tsx']\n# ---",
      "File local dành cá nhân; path-specific rules giải quyết patterns trải nhiều thư mục.",
      "Local memory is personal, while rules/paths target file types across directories."
    ],
    [
      "5. /memory và /context là chẩn đoán",
      "5. Diagnose loaded instructions with /memory and /context",
      "Bài thi cũ thường đáp án /memory khi hỏi cách xem những file CLAUDE.md liên quan. Trong Claude Code hiện tại, /memory giúp duyệt memory locations; /context cho biết Memory files nào thực sự được nạp trong phiên. Không lệnh nào được dùng để bật nạp config.",
      "The older exam guide references /memory for inspection. Current Claude Code offers /context to show loaded memory files. Neither command triggers the automatic loading mechanism.",
      "/memory    # browse memory files\n/context   # inspect loaded Memory files",
      "Hãy tìm file trong git, scope đúng và loaded context trước khi đổ lỗi model.",
      "Inspect file location and actual loaded context before blaming the model."
    ],
    [
      "6. Compaction và instruction reliability",
      "6. Memory reloading after compaction",
      "Sau khi /compact, root CLAUDE.md có thể được đọc lại từ disk, còn nested memory và conditional rules có thể chỉ xuất hiện lại khi file phù hợp được đọc. Những quy định bắt buộc như chặn tool phải đặt ở settings.json hoặc hooks vì CLAUDE.md chỉ là hướng dẫn ngôn ngữ.",
      "After /compact, root instructions can be reread from disk; nested and path-scoped files may be reintroduced on demand. Deterministic tool restrictions must live in permission settings or hooks, not prose.",
      "/compact\n/context\n# Read src/Button.test.tsx, then /context again",
      "Không nhầm instruction guidance với runtime-enforced security policy.",
      "Memory guidance is not the same as client-enforced permission policy."
    ]
  ],
  "table": [
    [
      "Team convention",
      "root CLAUDE.md",
      "Git shared"
    ],
    [
      "Personal preference",
      "~/.claude/CLAUDE.md",
      "Not shared"
    ],
    [
      "Package-specific",
      "packages/api/CLAUDE.md",
      "Directory scope"
    ],
    [
      "Across many test folders",
      ".claude/rules/ with paths",
      "Conditional loading"
    ],
    [
      "Hard tool denial",
      "settings.json/hook",
      "Runtime enforcement"
    ]
  ],
  "words": [
    [
      "Hierarchy",
      "hệ thống cấp bậc",
      "User/project/directory configuration levels."
    ],
    [
      "User-level",
      "cấp cá nhân",
      "Home-level memory specific to one developer."
    ],
    [
      "Project-level",
      "cấp dự án",
      "Version-controlled instructions shared by teammates."
    ],
    [
      "Directory-level",
      "cấp thư mục",
      "Instructions for a package subtree."
    ],
    [
      "Eager Import",
      "nạp ngay",
      "An @ path reference included with CLAUDE.md."
    ],
    [
      "Precedence",
      "ưu tiên",
      "The absence of deterministic memory override semantics."
    ],
    [
      "Compaction",
      "nén context",
      "Summarisation of context with memory reloading."
    ],
    [
      "Conditional Rules",
      "rules có điều kiện",
      "Instructions enabled when file paths match."
    ]
  ],
  "questions": [
    [
      "B clone repo nhưng thiếu chuẩn của A. Nguyên nhân?",
      "Why did developer B miss developer A's standards?",
      "User-level không share qua git",
      "User memory is not shared in git",
      "Do chưa chạy /memory",
      "Thiếu MCP",
      "Chưa build",
      "/memory not run",
      "MCP missing",
      "Not built"
    ],
    [
      "Team standards nên đặt ở đâu?",
      "Where should team-wide standards live?",
      "root CLAUDE.md",
      "Project root CLAUDE.md",
      "User home",
      "CLAUDE.local.md",
      "Chat message",
      "User home",
      "Local notes",
      "Chat"
    ],
    [
      "Nested CLAUDE.md có luôn thắng root khi conflict?",
      "Does nested CLAUDE.md always override root?",
      "Không chắc chắn",
      "No guaranteed winner",
      "Có",
      "Chỉ với /compact",
      "Chỉ trên Linux",
      "Yes",
      "After compact",
      "On Linux"
    ],
    [
      "@ imports có lazy load giảm token tự động?",
      "Are @ imports automatically lazy and token-saving?",
      "Không; được nạp cùng memory",
      "No, eagerly loaded",
      "Có",
      "Chỉ khi path matching",
      "Chỉ khi có CI",
      "Yes",
      "Only path match",
      "CI only"
    ],
    [
      "Lệnh nào xem memory thực sự đã loaded?",
      "Which command reveals loaded Memory files?",
      "/context",
      "/context",
      "/login",
      "/model",
      "/clear",
      "/login",
      "/model",
      "/clear"
    ],
    [
      "Rule tests nằm 50 thư mục nên ở đâu?",
      "Where to put test rules across 50 folders?",
      ".claude/rules/ với paths",
      "Path-scoped .claude/rules/",
      "User home",
      "50 CLAUDE.md copies",
      "One skill manually",
      "User home",
      "50 copies",
      "Manual skill"
    ],
    [
      "Nếu cần chặn Bash chắc chắn?",
      "How do you enforce a Bash denial?",
      "settings.json / hook",
      "settings.json / hook",
      "CLAUDE.md nói không",
      "Thêm @ import",
      "Slash command",
      "Prose only",
      "Add @ import",
      "Slash command"
    ],
    [
      "CLAUDE.local.md có guaranteed override?",
      "Does CLAUDE.local.md guarantee override?",
      "Không",
      "No",
      "Có",
      "Chỉ project",
      "Chỉ GitHub",
      "Yes",
      "Project only",
      "GitHub only"
    ]
  ],
  "exercise": [
    [
      "Tạo team memory",
      "Create team memory",
      "Tạo root CLAUDE.md gồm naming, errors và tests.",
      "Write a project CLAUDE.md with naming/errors/testing rules."
    ],
    [
      "Module hóa standards",
      "Modularise standards",
      "Tạo @ references đến standards/testing.md và naming.md.",
      "Add @ references to individual standard files."
    ],
    [
      "Nested API memory",
      "Nested API conventions",
      "Tạo packages/api/CLAUDE.md cho API pattern.",
      "Create packages/api/CLAUDE.md."
    ],
    [
      "Local notes",
      "Local notes",
      "Tạo CLAUDE.local.md và gitignore.",
      "Create a gitignored CLAUDE.local.md."
    ],
    [
      "Kiểm tra thực tế",
      "Verify in Claude Code",
      "Mở Claude Code và chạy /memory và /context sau khi Read API file.",
      "Run /memory and /context after accessing relevant files."
    ]
  ],
  "commands": "npm run lab:domain3 -- 1\ncd domain3-workspaces/lesson31\nclaude"
});
