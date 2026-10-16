import {compactLesson} from "../domain3-compact.ts";
export const lesson32=compactLesson(2,{
  "title": [
    "Custom Slash Commands & Skills — Workflow tái sử dụng",
    "Custom Slash Commands and Skills"
  ],
  "subtitle": [
    "Phân biệt chuẩn luôn nạp trong CLAUDE.md với skill gọi khi cần, cấu trúc SKILL.md, fork và cơ chế cấp quyền.",
    "Separate always-on team rules from task-triggered skills, frontmatter, isolated context and permissions."
  ],
  "bridge": [
    "Lesson 3.1 hướng dẫn CLAUDE.md luôn nạp. Lesson 3.2 giải quyết một quy trình review/deploy chỉ nên kích hoạt khi có nhiệm vụ tương ứng.",
    "Lesson 3.1 covered recurring memory; 3.2 covers reusable procedures activated on demand."
  ],
  "scenario": [
    "Team Next.js thường phải chạy code review trước deploy, kiểm tra staged diff, coverage và secrets. Nếu nhét quy trình 30 bước vào root CLAUDE.md, mọi lượt sửa CSS đều chịu context dư thừa. Tách thành /review skill, chỉ load đầy đủ nội dung khi developer yêu cầu.",
    "A Next.js team repeatedly reviews staged diffs and checks test coverage before releases. Putting the entire checklist in root CLAUDE.md wastes context on simple UI edits. An on-demand /review skill fits better."
  ],
  "slug": "slash-commands-skills",
  "duration": "30 phút / 30 min",
  "topics": [
    [
      "1. Commands và Skills hiện đã thống nhất",
      "1. Slash commands and skills are unified",
      "File .claude/commands/review.md tạo slash /review theo kiểu flat command tương thích cũ. Cách khuyên dùng hiện tại là .claude/skills/review/SKILL.md: một thư mục có SKILL.md, hỗ trợ thêm script và reference files. File .claude/skills/review.md đơn lẻ KHÔNG tạo skill hợp lệ.",
      "Legacy flat commands at .claude/commands/review.md and canonical skills in .claude/skills/review/SKILL.md both offer /review. Skills can contain supporting files and automatic discovery; a loose review.md under skills/ is not a valid skill.",
      ".claude/commands/review.md          # legacy /review\n.claude/skills/review/SKILL.md      # canonical /review\n.claude/skills/review.md            # WRONG",
      "Skill là directory/SKILL.md; command cũ là flat .md trong commands/.",
      "Skills use a directory with SKILL.md; legacy commands use flat files."
    ],
    [
      "2. Project scope và User scope",
      "2. Project vs personal skill scope",
      "Skill ở .claude/skills/ trong repository là workflow team và được git version control. Skill ở ~/.claude/skills/ thuộc một developer, không đi theo clone. Tên cá nhân nên khác tên project nếu không có ý định gây va chạm.",
      "Repository-local .claude/skills/ contains shared team procedures. ~/.claude/skills/ stores private personal workflows. Avoid accidental naming conflicts with team skills.",
      "# Shared:\n.claude/skills/review/SKILL.md\n# Personal:\n~/.claude/skills/deep-review/SKILL.md",
      "Workflow cho mọi người → project scope; workflow riêng → user scope.",
      "Share team skills through git; keep personal workflows in home."
    ],
    [
      "3. Frontmatter: description, context: fork",
      "3. Frontmatter for discovery and isolated execution",
      "Frontmatter YAML có description để Claude nhận biết khi nào phù hợp và có thể tự kích hoạt. context: fork chạy skill trong context subagent, kết quả discovery dài không làm đầy main conversation. Fork context này không đồng nghĩa git branch hay filesystem độc lập.",
      "Use YAML description so Claude can match a user request to a skill. context: fork runs verbose analysis in isolated subagent context and returns a concise result, protecting the main conversation from noisy search traces.",
      "---\ndescription: Analyse source code and report key risks\ncontext: fork\nargument-hint: '[feature path]'\n---\nReview $ARGUMENTS and return concise findings.",
      "description hỗ trợ discovery; context: fork cô lập context dài, không fork disk.",
      "Descriptions guide discovery; context: fork isolates verbose exploration."
    ],
    [
      "4. allowed-tools KHÔNG phải hard deny",
      "4. allowed-tools pre-approves; it does not deny other tools",
      "Exam guide cũ nói allowed-tools hạn chế quyền. Nhưng Claude Code hiện tại mô tả allowed-tools là danh sách được pre-approve mà không hỏi xác nhận. Tool không nằm trong danh sách vẫn có thể được gọi theo permission settings; muốn chặn thật phải dùng disallowed-tools hoặc deny rules.",
      "The exam's older wording says allowed-tools restricts skill access. Current Claude Code uses it for pre-approval: other tools can still be called under normal permission checks. Use disallowed-tools or policy deny rules for hard restrictions.",
      "---\nallowed-tools:\n  - Read\n  - Grep\n  - Glob\n# For true exclusion: disallowed-tools / permissions deny\n---",
      "Phân biệt bài thi version cũ và runtime: allowed-tools ≠ sandbox whitelist.",
      "Current allowed-tools is pre-approval, not a strict available-tools whitelist."
    ],
    [
      "5. argument-hint là gợi ý autocomplete",
      "5. argument-hint provides autocomplete guidance",
      "argument-hint: '[module path]' hiển thị cách dùng và tham số mong đợi trong autocomplete của slash command. Nó không phải interactive prompt bắt người dùng nhập nếu thiếu. Trong body, skill có thể tham chiếu $ARGUMENTS để nhận input người gọi.",
      "argument-hint documents expected arguments during completion; it does not pause execution and ask for missing values. The skill body can reference $ARGUMENTS and should handle the empty case explicitly.",
      "---\nargument-hint: '[module path]'\n---\nAnalyse $ARGUMENTS\n# Handle empty args in instructions.",
      "argument-hint không tự validate input hoặc bật form; skill cần xử lý missing args.",
      "argument-hint is a usage hint, not an interactive validator."
    ],
    [
      "6. Skill vs CLAUDE.md vs path rule",
      "6. Choose skill, project memory or path rule",
      "Mọi commit phải tuân thủ naming convention → root CLAUDE.md. Mọi *.test.tsx tuân thủ test pattern → path rule .claude/rules/testing.md. Developer muốn /review-staged hoặc /deploy-check khi cần → skill. Không copy cả thủ tục review nhiều bước vào CLAUDE.md.",
      "Put universal standards in CLAUDE.md; file-type conventions in .claude/rules/ paths; and episodic workflows in skills. The complete skill body loads only when used, while its description can support discovery.",
      "# Team standard: CLAUDE.md\n# Tests scattered in folders: .claude/rules/testing.md\n# One-off review workflow: .claude/skills/review/SKILL.md",
      "Thủ tục theo yêu cầu → skill, quy tắc luôn áp dụng → CLAUDE.md/rules.",
      "Use skills for on-demand workflows and memory/rules for conventions."
    ]
  ],
  "table": [
    [
      "Team command",
      ".claude/skills/review/SKILL.md",
      "Tracked by git"
    ],
    [
      "Legacy flat command",
      ".claude/commands/review.md",
      "Backward compatible"
    ],
    [
      "Personal workflow",
      "~/.claude/skills/...",
      "User only"
    ],
    [
      "Verbose analysis",
      "context: fork",
      "Keep main context focused"
    ],
    [
      "Pre-approved tools",
      "allowed-tools",
      "Not a hard deny"
    ],
    [
      "Hard tool exclusion",
      "disallowed-tools / settings",
      "Permission enforcement"
    ]
  ],
  "words": [
    [
      "Skill",
      "kỹ năng tái sử dụng",
      "Named workflow with SKILL.md."
    ],
    [
      "Slash Command",
      "lệnh bắt đầu dấu /",
      "Manual invocation such as /review."
    ],
    [
      "Frontmatter",
      "metadata YAML đầu file",
      "Configuration fields between --- markers."
    ],
    [
      "Context Fork",
      "context riêng cho subagent",
      "Isolate verbose work, not filesystem."
    ],
    [
      "allowed-tools",
      "công cụ được pre-approve",
      "Tools permitted without prompts in current Claude Code."
    ],
    [
      "disallowed-tools",
      "công cụ bị cấm",
      "Tools explicitly excluded for the workflow."
    ],
    [
      "Argument Hint",
      "gợi ý tham số",
      "Completion hint, not an input prompt."
    ],
    [
      "On-demand",
      "khi cần mới nạp",
      "Complete skill body loads only when used."
    ]
  ],
  "questions": [
    [
      "Skill chuẩn tạo /review đặt ở đâu?",
      "Where is the canonical /review skill located?",
      ".claude/skills/review/SKILL.md",
      ".claude/skills/review/SKILL.md",
      ".claude/skills/review.md",
      "CLAUDE.md",
      "~/.claude/rules/review.md",
      ".claude/skills/review.md",
      "CLAUDE.md",
      "~/.claude/rules/review.md"
    ],
    [
      "Flat command legacy tạo /review ở đâu?",
      "Where does a legacy flat /review command live?",
      ".claude/commands/review.md",
      ".claude/commands/review.md",
      ".claude/skills/review.md",
      ".claude/rules/review.md",
      ".claude/review.json",
      ".claude/skills/review.md",
      ".claude/rules/review.md",
      ".claude/review.json"
    ],
    [
      "Workflow review chung toàn team nên ở đâu?",
      "Where should a team-shared review workflow live?",
      "Project .claude/skills/",
      "Project .claude/skills/",
      "User home",
      "Browser storage",
      "Session prompt only",
      "User home",
      "Browser storage",
      "Session prompt only"
    ],
    [
      "context: fork có tác dụng gì?",
      "What is context: fork intended for?",
      "Cô lập verbose subagent work",
      "Isolate verbose subagent output",
      "Tạo git branch",
      "Copy filesystem",
      "Bật Claude API free",
      "Creates git branch",
      "Copies filesystem",
      "Free API mode"
    ],
    [
      "allowed-tools hiện nay có hard-deny tool khác?",
      "Does allowed-tools hard-deny every omitted tool today?",
      "Không; pre-approval",
      "No, it pre-approves listed tools",
      "Có, whitelist tuyệt đối",
      "Tự disable MCP",
      "Luôn cấm Bash",
      "Always strict whitelist",
      "Disables MCP",
      "Always denies Bash"
    ],
    [
      "argument-hint khi bỏ trống có bắt nhập ngay?",
      "Does argument-hint interactively prompt for missing arguments?",
      "Không, gợi ý autocomplete",
      "No, autocomplete hint only",
      "Có, luôn dừng",
      "Tự sinh argument",
      "Đổi model",
      "Always pauses",
      "Auto-generates arguments",
      "Switches model"
    ],
    [
      "Chuẩn test áp dụng mọi *.test.tsx nằm ở đâu?",
      "Where do cross-directory test conventions belong?",
      ".claude/rules/ có paths",
      "Path-scoped rules",
      "Skill thủ công",
      "User command",
      "Chỉ CI",
      "Manually invoked skill",
      "User command",
      "Only CI"
    ],
    [
      "Muốn Claude tự tìm skill phù hợp, field nào quan trọng?",
      "Which field helps automatic skill discovery?",
      "description",
      "description",
      "argument-hint",
      "context",
      "allowed-tools",
      "argument-hint",
      "context",
      "allowed-tools"
    ]
  ],
  "exercise": [
    [
      "Tạo /review skill",
      "Create /review skill",
      "Tạo .claude/skills/review/SKILL.md có description, checklist và argument hint.",
      "Create canonical SKILL.md with description and arguments."
    ],
    [
      "Thử command legacy",
      "Create legacy command",
      "Tạo .claude/commands/deploy-check.md để thấy flat alias.",
      "Create a flat .claude/commands/deploy-check.md."
    ],
    [
      "Fork cho verbose output",
      "Fork verbose research",
      "Tạo /analyse-feature có context: fork và Read/Grep/Glob.",
      "Make an analyse-feature skill with context: fork."
    ],
    [
      "Kiểm tra scope",
      "Check project vs personal scope",
      "Phân biệt path trong repo và ~/.claude/skills/; không sửa home tự động.",
      "Compare repository and user-home scope without modifying home."
    ],
    [
      "Thực hành CLI",
      "Test real skill invocation",
      "Mở Claude Code chạy /review và /analyse-feature với path cụ thể.",
      "Run skills in real Claude Code and inspect output."
    ]
  ],
  "commands": "npm run lab:domain3 -- 2\ncd domain3-workspaces/lesson32\nclaude"
});
