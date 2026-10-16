import {compactLesson} from "../domain3-compact.ts";
export const lesson36=compactLesson(6,{
  "title": [
    "CI/CD Integration — Claude Code trong pipeline tự động",
    "Claude Code CI/CD Integration"
  ],
  "subtitle": [
    "Chạy Claude không tương tác bằng -p, xuất JSON có schema, tách reviewer khỏi coder và giảm comment trùng qua các lần push.",
    "Run Claude Code headlessly with -p, structured output, separate review contexts and incremental findings."
  ],
  "bridge": [
    "3.5 giúp cải thiện bằng tests và feedback; 3.6 đưa các nguyên tắc đó vào CI job không có bàn phím, có JSON contracts và quyền hạn rõ ràng.",
    "After iterative refinement, integrate automated code review and generation into non-interactive CI environments."
  ],
  "scenario": [
    "GitHub Actions chạy 'claude \"review this PR\"' rồi treo vì đang chờ terminal input. Khi sửa bằng -p, job lại xuất text dài khó parse, reviewer lặp comment đã chấp nhận qua ba lần push. Cần print mode, structured_output, reviewer session độc lập và prior findings.",
    "A GitHub Actions PR review job hangs because it starts interactive Claude Code. Switching to -p solves input handling, but automation also needs machine-readable JSON, independent review context and prior findings to avoid repeated comments."
  ],
  "slug": "cicd-integration",
  "duration": "45 phút / 45 min",
  "topics": [
    [
      "1. -p (print) là cờ thiết yếu trong CI",
      "1. -p switches Claude Code to non-interactive mode",
      "Claude Code bình thường đợi tương tác qua keyboard. Runner CI không có người gõ, nên 'claude review this code' có thể treo job. 'claude -p ...' chạy prompt không tương tác, in output rồi thoát. Cờ --batch và CLAUDE_HEADLESS không phải lựa chọn thay thế trong guide.",
      "Ordinary Claude Code runs interactively. CI jobs cannot answer prompts, so invoke claude -p or --print to receive output and terminate. This is the directly tested exam fix for a hanging pipeline.",
      "# WRONG in CI:\nclaude 'Review this pull request'\n# CORRECT:\nclaude -p 'Review this pull request'",
      "CI treo vì Claude chờ input → thêm -p, không tự đặt headless environment variables.",
      "In CI, use claude -p, not interactive claude."
    ],
    [
      "2. --output-format json và --json-schema",
      "2. JSON output and schema validation",
      "Trong CI, hệ thống cần trích file, line, severity, message thành objects thay vì parse văn bản model sinh ra. --output-format json tạo envelope gồm result/metadata, còn --json-schema yêu cầu output theo schema. Findings cấu trúc nằm trong structured_output của envelope, không phải top-level findings.",
      "Use --output-format json for machine-readable CLI envelope and --json-schema for structured final output validation. Downstream jobs should inspect the structured_output field; do not assume findings exists at the top-level JSON response.",
      "claude -p --output-format json \\\n  --json-schema '{\"type\":\"object\",\"properties\":{\"findings\":{\"type\":\"array\"}},\"required\":[\"findings\"]}' \\\n  'Review changed code'\n# JSON: {structured_output:{findings:[...]},...}",
      "Machine contract = JSON envelope + structured_output; validate before posting PR comments.",
      "Parse the structured_output field rather than the top-level object."
    ],
    [
      "3. Generation và Review tách context",
      "3. Separate generation and review sessions",
      "Một Claude session vừa code vừa giải thích phương án có nguy cơ ít nghi ngờ quyết định chính nó. Nên chạy một invoker khác, không resume session generation, khi audit. Reviewer đọc diff/code hiện tại cùng tiêu chí riêng chứ không kế thừa toàn bộ lý do của coder.",
      "A model that generated code has context justifying its choices. Use an independent Claude Code invocation for review so the reviewer sees the current code and requirements rather than the generation session's rationale.",
      "# Invocation A: implementation\nclaude -p 'Implement validation for auth route'\n# Invocation B: independent review (do NOT resume A)\nclaude -p 'Review the diff for auth/security issues'",
      "Independent review cần session riêng, không fork lý do của coder vào reviewer.",
      "Independent invocations help reduce generation-context bias."
    ],
    [
      "4. Incremental review dùng prior findings",
      "4. Prior findings enable incremental review",
      "Mỗi push vào PR có thể khiến Claude phát hiện lại lỗi cũ và comment trùng, làm mất tín nhiệm. Lưu prior findings có fingerprint/status, truyền cho review run tiếp theo và chỉ yêu cầu new + still-unresolved issues, phân biệt accepted/suppressed findings.",
      "If every push triggers a full review with no memory of previous comments, duplicate findings annoy developers. Provide prior findings with stable identifiers and statuses, then report genuinely new or still-unresolved issues without reposting acknowledged ones.",
      "// Previous findings JSON from PR bot:\nconst previous=[{file:'src/auth.ts',rule:'MISSING_AUTH',status:'acknowledged'}];\n// Prompt: report NEW or genuinely still-unresolved issues;\n// do not re-post acknowledged findings.",
      "Không đánh đồng 'vẫn còn' với 'chưa ai xem'; cần metadata issue status để chống spam.",
      "Carry forward prior reviewed findings to reduce duplicate PR comments."
    ],
    [
      "5. CLAUDE.md dùng chung cả CI nhưng không bật --bare",
      "5. CLAUDE.md also applies to CI sessions",
      "Khi chạy Claude Code từ project trong CI, CLAUDE.md chứa testing conventions, fixtures và review criteria được nạp như local. Nếu sử dụng --bare sẽ bỏ auto-discovery CLAUDE.md và skills để chạy tối giản, khiến kỳ vọng project context không còn đúng.",
      "Ordinary CI invocations read project CLAUDE.md for testing standards and available fixtures. The --bare mode disables automatic discovery of memory, skills and more, so don't use it if those conventions are required.",
      "# CLAUDE.md\n- Use test/factories for users\n- Test public contracts, not internals\n- Critical finding = exploitable auth bypass\n# CI: invoke claude -p from repository root",
      "CI muốn tận dụng conventions cần đảm bảo CLAUDE.md có sẵn và không dùng mode bỏ context.",
      "CI can reuse project memory; bare mode skips such discovery."
    ],
    [
      "6. Append vs replace prompt và permissions",
      "6. Prompt flags and least-privilege CI permissions",
      "--append-system-prompt bổ sung review criteria và giữ system prompt mặc định. --system-prompt thay thế toàn bộ default instructions, dễ làm mất tool guidance. CI cần giới hạn tools và permissions, không đưa API key vào PR logs; job review nên read-only và tránh chạy script không tin cậy.",
      "Append extra CI criteria with --append-system-prompt while retaining the default coding assistant behaviour. --system-prompt replaces it entirely. Restrict tools with allowed/denied settings and scope GitHub token and secrets carefully.",
      "claude -p --append-system-prompt 'Flag secrets and auth gaps' \\\n  --output-format json 'Review staged diff'\n# Review should be read-only; use least privilege",
      "Giữ default prompt thì append; replace chỉ khi thật sự muốn thay đổi toàn bộ identity.",
      "Use append for additional guidance and enforce CI permissions separately."
    ],
    [
      "7. GitHub Actions và worktrees là phần mở rộng",
      "7. GitHub Actions and worktrees are supporting patterns",
      "Bài thi kiểm tra generic CI/CD: -p, output, session isolation, prior findings và CLAUDE.md. GitHub Actions là implementation thực tế; một job review mới phải giới hạn quyền repo, tránh sự kiện từ PR không tin cậy truy cập secret, và không deploy tự động sửa code.",
      "The foundational exam concerns headless CLI execution and review architecture. GitHub Actions is one integration; use appropriately restricted workflow permissions and never expose secrets to untrusted PR code. Separate worktrees can isolate filesystem edits if needed, unlike sessions alone.",
      "# Workflow example in generated sandbox:\n# .github/workflows/claude-review.example.yml\n# Not automatically active in this repo.",
      "Dùng workflow sandbox và chỉ enable sau khi review quyền/secrets và chi phí.",
      "Do not activate a paid CI workflow without checking secret and repository permissions."
    ]
  ],
  "table": [
    [
      "CI job waits for input",
      "claude -p",
      "Non-interactive"
    ],
    [
      "Machine-readable PR findings",
      "--output-format json + --json-schema",
      "structured_output"
    ],
    [
      "Claude reviews own generated code",
      "Separate invocation",
      "Context isolation"
    ],
    [
      "Repeated PR comments",
      "Prior findings + statuses",
      "Incremental dedupe"
    ],
    [
      "Need default prompt plus criteria",
      "--append-system-prompt",
      "Keep defaults"
    ],
    [
      "Need project testing standards",
      "CLAUDE.md in repo",
      "CI context"
    ]
  ],
  "words": [
    [
      "Print Mode",
      "chế độ không tương tác",
      "claude -p sends prompt, prints result and exits."
    ],
    [
      "JSON Envelope",
      "vỏ JSON",
      "Output object containing structured_output and metadata."
    ],
    [
      "JSON Schema",
      "lược đồ JSON",
      "Contract for final machine-readable output."
    ],
    [
      "Structured Output",
      "đầu ra có cấu trúc",
      "Validated structured_output field."
    ],
    [
      "Session Isolation",
      "cô lập phiên",
      "Generation and review have independent histories."
    ],
    [
      "Incremental Review",
      "review tăng dần",
      "Use previous findings to avoid redundant comments."
    ],
    [
      "Append System Prompt",
      "nối system prompt",
      "Add criteria while preserving default behaviour."
    ],
    [
      "Least Privilege",
      "quyền tối thiểu",
      "Limit CI tokens, tool access and secret exposure."
    ]
  ],
  "questions": [
    [
      "Claude Code CI treo chờ tương tác, sửa gì?",
      "CI job hangs awaiting Claude interaction. What fixes it?",
      "Thêm -p",
      "Use -p",
      "--batch",
      "CLAUDE_HEADLESS",
      "/memory",
      "--batch",
      "CLAUDE_HEADLESS",
      "/memory"
    ],
    [
      "JSON contract cho findings dùng kết hợp gì?",
      "Which flags produce schema-based machine output?",
      "--output-format json + --json-schema",
      "--output-format json + --json-schema",
      "Chỉ --pretty",
      "--batch",
      "--fork-session",
      "--pretty only",
      "--batch",
      "--fork-session"
    ],
    [
      "structured findings nằm ở đâu trong JSON envelope?",
      "Where are validated findings in the JSON envelope?",
      "structured_output",
      "structured_output",
      "Top-level findings luôn",
      "stderr",
      "git log",
      "Always top-level findings",
      "stderr",
      "git log"
    ],
    [
      "Reviewer có nên resume generation session?",
      "Should reviewer resume code generation session?",
      "Không, session độc lập",
      "No, independent session",
      "Có luôn",
      "Chỉ model nhỏ",
      "Chỉ khi nhiều tests",
      "Always yes",
      "Only small models",
      "Only with tests"
    ],
    [
      "Review mỗi push spam cùng comment, dùng gì?",
      "Repeated duplicate PR review comments call for?",
      "Prior findings + incremental review",
      "Previous findings and incremental review",
      "Tăng tokens",
      "Bỏ review",
      "Dùng npm run build thôi",
      "More tokens",
      "Disable review",
      "Only build"
    ],
    [
      "Thêm instructions nhưng giữ default system?",
      "How to add criteria without replacing default system prompt?",
      "--append-system-prompt",
      "--append-system-prompt",
      "--system-prompt",
      "--bare",
      "--resume",
      "--system-prompt",
      "--bare",
      "--resume"
    ],
    [
      "Dùng --bare thì project CLAUDE.md có được tự load?",
      "Does --bare auto-load project CLAUDE.md?",
      "Không",
      "No",
      "Có",
      "Chỉ root",
      "Chỉ Agent SDK",
      "Yes",
      "Root only",
      "Agent SDK only"
    ],
    [
      "Workflow review lấy code PR không tin cậy nên làm gì?",
      "How to secure a CI workflow reviewing untrusted PR code?",
      "Giới hạn permissions/secrets",
      "Restrict permissions and secrets",
      "In key ra log",
      "Bật write toàn repo",
      "Dùng --bypassPermissions",
      "Print key",
      "Grant write everywhere",
      "Use bypassPermissions"
    ]
  ],
  "exercise": [
    [
      "CLI non-interactive",
      "Non-interactive Claude CLI",
      "Chạy claude -p trong local có xác thực và so với lệnh interactive.",
      "Run authenticated claude -p and compare interactive mode."
    ],
    [
      "Structured schema",
      "Structured JSON output",
      "Thử --output-format json --json-schema, parse structured_output.",
      "Use schema output and parse structured_output."
    ],
    [
      "Reviewer mới",
      "Separate review context",
      "Chạy một invocation coder và invocation reviewer khác.",
      "Run distinct generation and review sessions."
    ],
    [
      "Prior findings",
      "Deduplicate reviews",
      "Tạo previous-findings.json, phân biệt new/acknowledged/resolved.",
      "Save prior findings with statuses and avoid duplicates."
    ],
    [
      "CI YAML sandbox",
      "Safe workflow draft",
      "Review permissions và secrets trong workflow mẫu; không tự kích hoạt.",
      "Inspect sandbox GitHub Actions example without enabling a live paid job."
    ]
  ],
  "commands": "npm run lab:domain3 -- 6\ncd domain3-workspaces/lesson36\nnode scripts/check-review.mjs\n# claude -p ... requires authenticated CLI"
});
