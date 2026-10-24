import type {EditorialLesson} from "./editorial-domain12.ts";
export const domain3Editorial:EditorialLesson[] = [
  {
    "id": "3.1",
    "source": "https://claudecertificationguide.com/learn/3-claude-code-config/3-1-claude-md-hierarchy",
    "mechanism": [
      "CLAUDE.md là instructions cho Claude Code, gồm user-level ~/.claude/CLAUDE.md, project-level root hoặc .claude/CLAUDE.md, và nested directory CLAUDE.md. Các file áp dụng được ghép vào context, không có cơ chế override đảm bảo khi mâu thuẫn. Không nhầm với settings.json có chính sách quyền.",
      "CLAUDE.md provides Claude Code guidance at user, project and directory scopes. Applicable files are concatenated into context, not resolved by guaranteed overrides. Permission policies belong in settings.json or enforced hooks instead."
    ],
    "example": [
      "Hai dev clone cùng repo: team naming chuẩn phải đặt trong root project file, không phải user home; API package có thể có nested rules. @./standards/testing.md chia nhỏ nội dung nhưng import lúc file memory được nạp, không tự tiết kiệm tokens. CLAUDE.local.md là ghi chú cá nhân thường gitignore.",
      "Two developers must share team naming through project-level CLAUDE.md, not one person's home file. Package instructions can be nested. @ imports modularise files but do not automatically reduce context tokens. CLAUDE.local.md is normally gitignored personal project guidance."
    ],
    "distinction": [
      "Sau compaction, root file có thể được nạp lại; nested rules theo paths chỉ được nạp khi làm việc với file phù hợp. Theo exam guide /memory là câu trả lời về tìm memory; trang nguồn giải thích /context cho biết files đã nạp trong Claude Code hiện hành.",
      "After compaction, project-root instructions may be reloaded; nested path rules return on demand. The curriculum distinguishes exam-guide /memory as the keyed command from current /context for loaded memory-file diagnostics."
    ],
    "examTrap": [
      "Bẫy: giả định file nested luôn thắng root, tưởng @ imports là lazy, nghĩ /memory khởi động việc load, và dùng CLAUDE.md thay hard permission settings.",
      "Traps: assuming nested instructions always win, treating @ imports as lazy, believing /memory activates loading or expecting prose to enforce tool permissions."
    ]
  },
  {
    "id": "3.2",
    "source": "https://claudecertificationguide.com/learn/3-claude-code-config/3-2-slash-commands-skills",
    "mechanism": [
      "Skills và custom slash commands là cơ chế workflow tái sử dụng. .claude/skills/<skill>/SKILL.md là cách canonical; .claude/commands/<name>.md vẫn hoạt động kiểu tương thích. Project paths chia sẻ qua git, ~/.claude/skills và ~/.claude/commands là cá nhân.",
      "Skills and custom slash commands share a unified reusable workflow system. The canonical structure is .claude/skills/<skill>/SKILL.md; flat .claude/commands/<name>.md remains a compatibility path. Project scope is shared via git; home paths are personal."
    ],
    "example": [
      "Team dùng skill triển khai chuẩn có SKILL.md và supporting files; developer có skill kiểm tra chuyên biệt trong home. Skill được gọi theo yêu cầu hoặc tự discover khi có description phù hợp. Nếu command và skill trùng tên, skill được ưu tiên theo trang nguồn.",
      "A team may commit a deploy skill with its SKILL.md and supporting files; a developer may keep a personal review skill. Suitable skills can be discovered or invoked explicitly. The curriculum states a skill takes precedence over a same-named command."
    ],
    "distinction": [
      "Frontmatter như description và context: fork ảnh hưởng cách tìm và chạy skill; việc viết 'context: fork' khác đặt một hướng dẫn chung trong CLAUDE.md. Không áp dụng mọi frontmatter cho mọi CLI version mà không nhìn cấu trúc được trang nguồn mô tả.",
      "Frontmatter such as description and context: fork governs discovery and execution context. This differs from standing CLAUDE.md conventions that load without deliberate invocation."
    ],
    "examTrap": [
      "Bẫy: đặt SKILL.md sai vị trí, dùng user-scope cho workflow team, tưởng một skill run-on-demand luôn tự load như project memory, hoặc đọc commands cũ như cấu trúc bắt buộc duy nhất.",
      "Traps: a misplaced SKILL.md, using personal scope for team workflows, treating on-demand skills as always-loaded project memory, or assuming only the legacy commands path works."
    ]
  },
  {
    "id": "3.3",
    "source": "https://claudecertificationguide.com/learn/3-claude-code-config/3-3-path-specific-rules",
    "mechanism": [
      ".claude/rules/*.md có YAML frontmatter paths để chỉ áp dụng convention khi thao tác trên đường dẫn match glob. Pattern **/*.test.tsx dùng cho test files rải nhiều thư mục; terraform/**/* cho Terraform. Đây là conditional rule, không phải một lệnh chạy từ /slash.",
      "Rules in .claude/rules/*.md use YAML paths frontmatter to apply conventions only when relevant paths match glob patterns. Use **/*.test.tsx across dispersed test folders or terraform/**/* for Terraform. This scopes guidance rather than running an on-demand command."
    ],
    "example": [
      "Website có src/components/Button.test.tsx và app/api/auth.test.ts: dùng một testing rule gồm cả **/*.test.ts và **/*.test.tsx thay vì chép 50 CLAUDE.md. Quy định naming/tagging cho Terraform đặt ở path rule; một workflow migration audit có bước thực hiện là skill.",
      "With tests scattered through src and app, create one rule matching both **/*.test.ts and **/*.test.tsx instead of fifty CLAUDE.md copies. Terraform naming conventions belong in a path rule; an explicitly initiated migration audit belongs in a skill."
    ],
    "distinction": [
      "Glob ở frontmatter là cách chọn files chịu instruction, khác tool Glob dùng tìm filenames trong 2.5. Không có paths nghĩa rule file có thể áp dụng toàn cục; dùng /context kiểm tra trường hợp rule chưa nạp.",
      "A glob in rule frontmatter scopes an instruction, unlike the Glob file-search tool from 2.5. Without path conditions the guidance may load generally; inspect the active context when troubleshooting."
    ],
    "examTrap": [
      "Bẫy: không match file .test.ts lẫn .test.tsx, nhầm skills với rules, cho convention conditional vào root CLAUDE.md làm phình context.",
      "Traps: covering only one test extension, confusing skills with conditional rules, or putting every file-specific convention into root CLAUDE.md."
    ]
  },
  {
    "id": "3.4",
    "source": "https://claudecertificationguide.com/learn/3-claude-code-config/3-4-plan-mode-execution",
    "mechanism": [
      "Plan mode cho phép khám phá và chọn kiến trúc trước khi chỉnh file; direct execution sửa ngay những thay đổi rõ địa điểm và giải pháp. Ưu tiên mức độ mơ hồ, số phương án đúng và độ rộng dependency hơn là gắn nhãn 'task khó'.",
      "Plan mode explores and designs the approach before editing, whereas direct execution makes a known, narrow change immediately. Ambiguity, competing approaches and dependency breadth matter more than vague difficulty labels."
    ],
    "example": [
      "Migration logging library trên 30–45 files có nhiều API contracts: dùng plan, inspect imports và đề xuất strategy trước. Sửa condition trong một function đã có stack trace và test fail rõ: direct execution rồi chạy tests.",
      "A multi-file logging migration requires dependency exploration and a shared strategy before edits. A single-function bug with a clear failing test and location fits direct execution followed by verification."
    ],
    "distinction": [
      "Theo trang nguồn có ba cách bật: claude --permission-mode plan, Shift+Tab, hoặc /plan trước prompt. Chỉ viết 'in plan mode' trong phần prose không chuyển mode. Hybrid workflow dùng plan trước rồi chuyển sang execute được chấp thuận.",
      "The guide lists claude --permission-mode plan, Shift+Tab and a /plan prefix as actual entry mechanisms. Writing 'in plan mode' inside prompt prose does not switch mode. Planning first and executing after approval is a sensible hybrid."
    ],
    "examTrap": [
      "Bẫy: plan mọi thay đổi nhỏ, hoặc bắt đầu refactor rộng bằng direct execution vì mỗi edit nhìn có vẻ đơn giản. Chọn chiến lược dựa trên mức độ mơ hồ và ảnh hưởng toàn hệ thống, không chỉ số file.",
      "Traps: using plan mode for a trivial known fix or skipping exploration for a broad refactor because each local edit appears simple."
    ]
  },
  {
    "id": "3.5",
    "source": "https://claudecertificationguide.com/learn/3-claude-code-config/3-5-iterative-refinement",
    "mechanism": [
      "Iterative refinement dùng feedback để dần khớp mục tiêu, gồm concrete input/output, test-driven iteration, interview pattern và lựa chọn batch versus sequential feedback. Ví dụ trước/sau hữu ích nhất khi yêu cầu biến đổi code diễn giải mơ hồ; failing tests hữu ích khi nhiều edge cases.",
      "Iterative refinement uses measurable feedback: concrete before/after examples, test-driven iterations, the interview pattern, and batched or sequential feedback. Examples are most helpful for ambiguous transformations; failing tests establish behaviour across edge cases."
    ],
    "example": [
      "Chuyển Promise<User> thành Promise<Result<User,ApiError>> trên nhiều hàm: đưa 2–3 cặp input/output; sau đó chạy tests để bắt null/error cases. Với yêu cầu sản phẩm chưa rõ, yêu cầu Claude hỏi về scope, acceptance criteria và edge cases trước khi sửa.",
      "For transforming Promise<User> into Promise<Result<User,ApiError>> repeatedly, supply two or three input/output pairs and run tests for null and error behaviour. For vague product requirements, use an interview to clarify scope and acceptance criteria before implementing."
    ],
    "distinction": [
      "Batch feedback nhóm nhiều sửa đổi liên quan trong một lượt, giảm qua lại khi đã xác định độc lập; sequential feedback phù hợp khi kết quả chỉnh A ảnh hưởng cách định nghĩa B. Đừng trộn nhiều góp ý mâu thuẫn vào một prompt thiếu tiêu chí hoàn thành.",
      "Batched feedback collects independent corrections into one message; sequential feedback is better when each change influences the next decision. Avoid dumping conflicting requests into a vague instruction without acceptance criteria."
    ],
    "examTrap": [
      "Bẫy: chỉ thêm chữ 'robust' hoặc 'be careful', bỏ tests cho transformation phức tạp, hoặc dùng một giant feedback batch khi cần học từ kết quả bước trước.",
      "Traps: replacing precise demonstrations with more adjectives, omitting tests for complex changes or batching dependent corrections that require observation between steps."
    ]
  },
  {
    "id": "3.6",
    "source": "https://claudecertificationguide.com/learn/3-claude-code-config/3-6-cicd-integration",
    "mechanism": [
      "Claude Code là CLI tương tác theo mặc định; trong CI cần claude -p/--print để không chờ input. --output-format json cung cấp envelope metadata; --json-schema kiểm cấu trúc kết quả và structured_output nằm bên trong envelope, không phải root findings.",
      "Claude Code is interactive by default; CI needs claude -p/--print for non-interactive execution. --output-format json provides a metadata envelope; --json-schema constrains the final structured data in structured_output, not in a top-level findings field."
    ],
    "example": [
      "Pipeline review PR tách lần gọi coder và reviewer để tránh anchoring. Lưu previous findings để chỉ đưa comment lỗi mới, không spam lặp lại qua push. Chạy CLI trong CI với quyền tối thiểu, secrets bảo vệ và output parser kiểm tra schema trước khi đăng comment.",
      "A PR pipeline should separate generating and reviewing invocations, carry previous findings forward to avoid reposting duplicates, limit CI permissions and secrets, and validate structured findings before posting comments."
    ],
    "distinction": [
      "Thêm tiêu chí mới trong Claude Code dùng --append-system-prompt để bảo toàn hướng dẫn mặc định; --system-prompt thay thế, --bare ảnh hưởng automatic loading. Chọn cờ theo output/runtime được trang nguồn mô tả, không dùng một cờ mơ hồ như --batch.",
      "The curriculum distinguishes --append-system-prompt (preserves defaults), --system-prompt (replaces defaults) and --bare (changes automatic loading). Do not substitute an invented flag such as --batch for headless execution."
    ],
    "examTrap": [
      "Bẫy: parse findings ở root JSON, resume generation session để review, hoặc cho untrusted PR code quyền write và secrets vượt nhu cầu.",
      "Traps: parsing findings from the wrong JSON level, reviewing within the generator's previous context or granting untrusted PR code excessive write permissions and secrets."
    ]
  }
];
