import {compactLesson} from "../domain3-compact.ts";
export const lesson33=compactLesson(3,{
  "title": [
    "Path-Specific Rules — Rules có điều kiện bằng Glob",
    "Path-Specific Rules for Conditional Loading"
  ],
  "subtitle": [
    "Viết một rule test áp dụng cho *.test.tsx trên 50 thư mục mà không phải tạo 50 CLAUDE.md hoặc tốn context cho file khác.",
    "Apply the same test conventions across dozens of directories without duplicating CLAUDE.md files."
  ],
  "bridge": [
    "3.1 nói cách đặt hướng dẫn chung; 3.2 tách workflows thành skills. 3.3 là hướng dẫn tự động áp dụng với đúng LOẠI FILE đang sửa.",
    "3.1 scoped persistent memory; 3.2 used on-demand skills. 3.3 conditions conventions on matching file paths."
  ],
  "scenario": [
    "Dự án Next.js có Button.test.tsx trong components, auth.test.ts trong api, format.test.ts trong utils và Dashboard.spec.tsx trong pages. Team muốn cùng quy tắc naming, mocking, assertions. Nếu copy CLAUDE.md vào mỗi thư mục sẽ dễ drift và khó bảo trì.",
    "A Next.js monorepo has co-located component tests, API tests and utility tests across fifty directories. One shared test convention should apply to every matching test filename without flooding unrelated tasks with instructions."
  ],
  "slug": "path-specific-rules",
  "duration": "30 phút / 30 min",
  "topics": [
    [
      "1. .claude/rules/ và frontmatter paths",
      "1. Path-scoped rule files and frontmatter",
      "Mỗi file rule có thể đặt dưới .claude/rules/testing.md, phần đầu YAML có paths: ['**/*.test.tsx', '**/*.test.ts']. Khi Claude Code đọc hoặc chỉnh file match pattern, rules được nạp vào context; khi làm file khác không cần mang rule test vào.",
      "Rules files use YAML paths frontmatter to constrain when instructions apply. Matching .test.tsx or .test.ts files trigger test conventions, keeping unrelated tasks free of these rules.",
      "---\npaths:\n  - '**/*.test.ts'\n  - '**/*.test.tsx'\n---\n# Test rules\n- Cover happy path and error path\n- Mock external modules at boundaries",
      "Rule nằm trong .claude/rules và YAML paths điều khiển conditional inclusion.",
      "A paths array scopes the guidance to matching file types."
    ],
    [
      "2. Glob matching xuyên directory",
      "2. Recursive globs work across directories",
      "Pattern **/*.test.tsx match cả src/Button.test.tsx và app/dashboard/Chart.test.tsx ở thư mục khác nhau. Nếu bạn chỉ dùng components/*.test.tsx, sẽ bỏ sót nested folders và tests phía API. Cần chọn glob tương ứng layout codebase.",
      "Recursive ** matches nested paths, letting one rule cover co-located tests across the repository. Narrow component-folder patterns would miss nested or API tests.",
      "# Match tests recursively:\npaths: ['**/*.test.tsx','**/*.spec.tsx','**/*.test.ts']\n# Match only terraform:\n# paths: ['terraform/**/*','**/*.tf']",
      "Giải bài thi tests rải nhiều nơi: một path-specific rule với **/*.test.tsx.",
      "Use recursive glob patterns for scattered file types."
    ],
    [
      "3. Vì sao không dùng root CLAUDE.md?",
      "3. Why root CLAUDE.md is inefficient",
      "Root CLAUDE.md luôn được nạp với sessions của repo. Nếu chứa 200 dòng test conventions, Claude phải nhìn chúng ngay cả lúc sửa README hoặc React component không liên quan, gây tốn context window. Chuyển sang conditional file làm giảm thông tin nhiễu.",
      "Root CLAUDE.md loads for broad work. Detailed test and Terraform conventions there consume context even when editing unrelated React files. Path-scoped files preserve context budget.",
      "# BAD root CLAUDE.md: 100 lines about Terraform\n# BETTER .claude/rules/terraform.md:\n# paths: ['terraform/**/*','**/*.tf']",
      "Rules/paths là context optimization, không chỉ là tổ chức file.",
      "Path-specific rules reduce unrelated instruction context."
    ],
    [
      "4. Vì sao không copy directory CLAUDE.md?",
      "4. Why not duplicate nested CLAUDE.md",
      "Directory CLAUDE.md phù hợp riêng packages/api, nhưng test nằm trong 50 thư mục thì phải chép cùng hướng dẫn 50 lần. Một thay đổi về mocking yêu cầu cập nhật mọi bản, dễ bị phiên bản lệch và mâu thuẫn.",
      "Nested CLAUDE.md files work for one package subtree, but copying conventions to fifty directories creates maintenance drift. One glob rule covers new folders automatically.",
      "# AVOID:\n# src/a/CLAUDE.md, src/b/CLAUDE.md, ... (50 copies)\n# PREFER one .claude/rules/testing.md with paths",
      "Nhiều thư mục + cùng file extension → dùng paths glob, không nhân bản CLAUDE.md.",
      "For cross-directory file conventions, prefer one glob rule."
    ],
    [
      "5. Rules, Skills, CLAUDE.md không thay thế nhau",
      "5. Rules vs skills vs root memory",
      "Root CLAUDE.md chứa team standards luôn đúng. Directory CLAUDE.md chứa quy tắc một package. Path rules tự áp dụng mỗi khi file pattern liên quan. Skill /review là một nhiệm vụ có thể được gọi explicit hoặc theo intent, không phải convention nền cho mọi lần edit tests.",
      "Shared project norms are always-loaded memory; directory-specific norms can use nested memory; file-type norms use path rules; workflow procedures like /review belong in skills.",
      "# Always-on: CLAUDE.md\n# Conditional: .claude/rules/testing.md\n# On-demand workflow: .claude/skills/review/SKILL.md",
      "Đọc câu hỏi xem muốn convention tự động hay workflow được kích hoạt.",
      "Choose the mechanism based on whether guidance is universal, file-scoped or task-triggered."
    ],
    [
      "6. Kiểm chứng với /context và token footprint",
      "6. Verify actual loading and context efficiency",
      "Sau khi tạo rules testing, API, Terraform, mở Claude Code rồi Read file Button.test.tsx và chạy /context xem Memory files. Sau đó làm việc với src/api/handler.ts rồi kiểm tra lại. Không suy từ tên glob rằng runtime chắc chắn đã nạp đúng nếu chưa quan sát.",
      "To verify configuration, actually open a matching test file in Claude Code and inspect /context, then repeat with an API handler. Compare the loaded memory files and context footprint. A JS glob test alone cannot prove Claude Code loaded rules.",
      "/context\n# Read src/Button.test.tsx\n/context\n# Read src/api/handler.ts\n/context",
      "Phải quan sát runtime /context để xác nhận rules matching, không tự bịa token savings.",
      "Use the actual CLI to validate which scoped rules are loaded."
    ]
  ],
  "table": [
    [
      "Team coding standards",
      "Root CLAUDE.md",
      "Always-on"
    ],
    [
      "Rules for one API package",
      "packages/api/CLAUDE.md",
      "Directory scope"
    ],
    [
      "*.test.tsx anywhere",
      ".claude/rules/testing.md",
      "Glob paths"
    ],
    [
      "Terraform only",
      ".claude/rules/terraform.md",
      "Relevant files only"
    ],
    [
      "Task-specific code review",
      ".claude/skills/review/SKILL.md",
      "On-demand"
    ],
    [
      "Check loaded rules",
      "/context",
      "Runtime diagnostics"
    ]
  ],
  "words": [
    [
      "Path-Specific Rule",
      "quy tắc theo đường dẫn",
      "Convention loaded for matching path patterns."
    ],
    [
      "Glob Pattern",
      "mẫu đường dẫn file",
      "Recursive filename/path matcher."
    ],
    [
      "YAML Frontmatter",
      "metadata YAML đầu file",
      "Rule's paths field before Markdown body."
    ],
    [
      "Conditional Loading",
      "nạp có điều kiện",
      "Loads only when relevant files are touched."
    ],
    [
      "Context Footprint",
      "dung lượng ngữ cảnh",
      "Tokens consumed by instructions."
    ],
    [
      "Co-located Test",
      "test cạnh source",
      "Test files next to their implementation."
    ],
    [
      "Directory Rule",
      "rule theo thư mục",
      "Applicable to one package subtree."
    ],
    [
      "Rule Drift",
      "lệch quy ước",
      "Duplicated rules become inconsistent across folders."
    ]
  ],
  "questions": [
    [
      "Tests trong 50 thư mục, một chuẩn chung?",
      "Tests across fifty directories need one convention?",
      ".claude/rules/testing.md có paths",
      "A paths-scoped rule",
      "Root CLAUDE.md dài",
      "50 bản CLAUDE.md",
      "Skill thủ công",
      "Long root CLAUDE.md",
      "50 copies",
      "Manual skill"
    ],
    [
      "Pattern bắt mọi *.test.tsx nested?",
      "Which pattern matches nested *.test.tsx?",
      "**/*.test.tsx",
      "**/*.test.tsx",
      "components/*.tsx",
      "*.css",
      "docs/*",
      "components/*.tsx",
      "*.css",
      "docs/*"
    ],
    [
      "Rule path được khai báo ở đâu?",
      "Where do rules declare matching files?",
      "YAML frontmatter paths",
      "YAML frontmatter paths",
      "Footer JSON",
      "Environment token",
      "package.json scripts",
      "JSON footer",
      "Env token",
      "Npm scripts"
    ],
    [
      "Đặt Terraform rules trong root có nhược điểm?",
      "Why avoid Terraform rules in root CLAUDE.md?",
      "Tốn context khi sửa React",
      "Consumes context on unrelated work",
      "Không có git",
      "Không hỗ trợ YAML",
      "Không chạy Windows",
      "No git",
      "No YAML",
      "No Windows"
    ],
    [
      "Dùng nested CLAUDE.md cho tests rải 50 nơi?",
      "Why not copy nested CLAUDE.md in 50 folders?",
      "Trùng lặp và drift",
      "Duplication and drift",
      "Không được dùng CLAUDE.md",
      "Chạy chậm npm",
      "Không hỗ trợ React",
      "CLAUDE.md forbidden",
      "Slow npm",
      "React unsupported"
    ],
    [
      "Muốn procedure /review khi user yêu cầu?",
      "A triggered /review procedure belongs where?",
      "Skill SKILL.md",
      "Skill SKILL.md",
      "Path rule always-on",
      "Root comment",
      "User test fixture",
      "Always-on path rule",
      "Root comment",
      "Test fixture"
    ],
    [
      "Làm sao biết testing.md thực sự loaded?",
      "How to check testing.md actually loaded?",
      "/context sau khi làm file match",
      "/context after matching file",
      "Chạy npm test",
      "Chỉ đọc gitignore",
      "Đọc README",
      "Run npm test",
      "Read gitignore",
      "Read README"
    ],
    [
      "Rules có paths và file không match thì sao?",
      "What about paths rules on unrelated files?",
      "Không cần nạp rule đó",
      "Rule need not load",
      "Luôn nạp",
      "Tự chạy skill",
      "Viết lại CLAUDE.md",
      "Always load",
      "Runs skill",
      "Rewrites CLAUDE.md"
    ]
  ],
  "exercise": [
    [
      "Tạo rule tests",
      "Create test rule",
      "Tạo .claude/rules/testing.md với patterns test/spec đa thư mục.",
      "Create testing.md with recursive test/spec globs."
    ],
    [
      "Tạo rule APIs",
      "Create API rules",
      "Thêm api-conventions.md cho app/api và src/api routes.",
      "Create API rule for matching handlers."
    ],
    [
      "Tạo Terraform rule",
      "Create IaC rule",
      "Viết .claude/rules/terraform.md chỉ cho *.tf.",
      "Restrict Terraform convention to infrastructure paths."
    ],
    [
      "Kiểm tra test file",
      "Inspect test file",
      "Mở *.test.tsx bằng Claude Code rồi /context.",
      "Read a test file then inspect /context."
    ],
    [
      "Kiểm tra API file",
      "Inspect API handler",
      "Đọc app/api/*/route.ts và so sánh /context.",
      "Read API handler and compare loaded memory."
    ],
    [
      "Đo sự khác biệt",
      "Compare context",
      "So sánh output /context khi root chứa toàn rules và paths-scoped.",
      "Compare runtime context footprint for always-on vs scoped rules."
    ]
  ],
  "commands": "npm run lab:domain3 -- 3\ncd domain3-workspaces/lesson33\nclaude"
});
