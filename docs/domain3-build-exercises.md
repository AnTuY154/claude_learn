# Domain 3 — Claude Code Configuration & Workflows

**6 Build Exercises theo [Claude Certification Guide](https://claudecertificationguide.com/learn/exercises/3-claude-code-config).**

Các bài 3.1–3.6 được học trong Claude Learning Lab bằng tiếng Việt và tiếng Anh. Mỗi bài có ví dụ Next.js, code/comment, 8 quiz và 5–6 nhiệm vụ thực hành. Mọi link trong mục "Nguồn" trỏ về bài gốc; nội dung trên website là phần biên soạn giải thích để tự học.

## Chuẩn bị chung

~~~powershell
npm ci
npm test

# Tạo MỘT workspace giả lập, ví dụ 3.1 (không gọi Claude API):
npm run lab:domain3 -- 1

# Kiểm tra CLI cài sẵn (tự làm trên máy):
claude --version
claude auth status
~~~

Các script trên chỉ tạo project mẫu trong `domain3-workspaces/lesson3N/`, nằm trong `.gitignore`. Không tự chỉnh `~/.claude`, không kích hoạt GitHub Actions trong repository đang host website và **không tiêu thụ token của Claude**. Khi vào Claude Code CLI thật, bạn cần có đăng nhập/quota hoặc API billing hợp lệ.

Để tạo lại một workspace đã tồn tại, **tự backup rồi xóa workspace**, script sẽ không ghi đè dữ liệu học tập của bạn.

## Lesson 3.1 — CLAUDE.md Hierarchy, Scoping, Modular Organisation (30 phút)

Nguồn: https://claudecertificationguide.com/learn/3-claude-code-config/3-1-claude-md-hierarchy

~~~powershell
npm run lab:domain3 -- 1
cd domain3-workspaces/lesson31
claude
~~~

1. Đọc `CLAUDE.md` chứa standards chung cho team, hướng dẫn được tham chiếu bằng `@./standards/testing.md`.
2. Mở `packages/api/CLAUDE.md` và giải thích vì sao API-specific conventions không nên đặt trong user home.
3. Kiểm tra `CLAUDE.local.md` được ignore và không phải team policy.
4. Trong phiên Claude, gõ `/memory` để xem file cấu hình và `/context` để quan sát những Memory files thực sự được nạp.
5. Sau khi Claude xem `packages/api/route.js`, kiểm tra `/context` lần nữa.

**Bẫy:** Không có strict winner-takes-all precedence giữa các CLAUDE.md mâu thuẫn. Nếu cần chặn tools, dùng permission settings hoặc hooks. `@ imports` module hóa nội dung nhưng vẫn eagerly load cùng CLAUDE.md.

## Lesson 3.2 — Custom Slash Commands & Skills (30 phút)

Nguồn: https://claudecertificationguide.com/learn/3-claude-code-config/3-2-slash-commands-skills

~~~powershell
# Từ root repo:
npm run lab:domain3 -- 2
cd domain3-workspaces/lesson32
claude
~~~

1. Kiểm tra thư mục canonical `.claude/skills/review/SKILL.md`, gọi `/review src/auth.js`.
2. Đối chiếu với flat command `.claude/commands/deploy-check.md`, gọi `/deploy-check` để học backward compatibility.
3. Xem skill `.claude/skills/analyse-feature/SKILL.md` có YAML `description`, `context: fork`, `allowed-tools` và `argument-hint`.
4. Gọi `/analyse-feature src/auth.js` để quan sát subagent discovery output được cô lập; không coi fork này là git branch.
5. So sánh project skills (qua git) với user skills (`~/.claude/skills/`, không commit).
6. Nêu khác biệt **bài thi cũ vs runtime hiện tại**: `allowed-tools` hiện là pre-approval, còn hard-deny cần `disallowed-tools` hoặc permissions. `argument-hint` hiện là gợi ý autocomplete, không tự mở form.

## Lesson 3.3 — Path-Specific Rules (30 phút)

Nguồn: https://claudecertificationguide.com/learn/3-claude-code-config/3-3-path-specific-rules

~~~powershell
npm run lab:domain3 -- 3
cd domain3-workspaces/lesson33
claude
~~~

1. Đọc `.claude/rules/testing.md` và YAML `paths: ['**/*.test.ts', '**/*.test.tsx']`.
2. Tạo hoặc đọc test file `src/Button.test.tsx` rồi dùng `/context` ghi nhận rules đã load.
3. Đọc `src/api/orders/route.ts`, xem `.claude/rules/api.md` có được áp dụng khi file matching không.
4. Làm tương tự với `terraform/main.tf` và rule Terraform.
5. So sánh root CLAUDE.md (always-on) với path-specific rules (conditionally loaded). Không tự công bố giảm 30% tokens nếu chưa đo trong CLI thật.

**Bẫy:** Tests rải khắp 50 directories không nên tạo 50 CLAUDE.md trùng nhau, cũng không cần skill chạy thủ công mỗi lần sửa test.

## Lesson 3.4 — Plan Mode vs Direct Execution (45 phút)

**Đây là bài 3.4 mà danh sách ban đầu bị thiếu.**

Nguồn: https://claudecertificationguide.com/learn/3-claude-code-config/3-4-plan-mode-execution

~~~powershell
npm run lab:domain3 -- 4
cd domain3-workspaces/lesson34

# Chế độ Plan THẬT, không chỉ ghi 'plan mode' trong prompt:
claude --permission-mode plan
~~~

1. Đưa nhiệm vụ migration `oldDate` trong nhiều file, yêu cầu Claude tìm call sites/imports và đưa ra strategy mà **chưa sửa code**.
2. Kiểm tra git diff để xác nhận quá trình planning không chỉnh files.
3. Chuyển direct execution để fix bug null guard rõ nguyên nhân ở `src/profile.js`.
4. Duyệt plan migration, sau đó switch sang direct và apply các thay đổi thống nhất, chạy tests.
5. Nhờ Explore subagent nếu discovery log dài và đối chiếu main context với summary.
6. Tự ghi decision framework: ambiguous/multi-file/multiple valid approaches → Plan; known location/cause/limited scope → Direct.

**Quan trọng:** Plan → Execute là một quy trình hybrid, không phải lựa chọn chỉ dùng một mode.

## Lesson 3.5 — Iterative Refinement (30 phút)

Nguồn: https://claudecertificationguide.com/learn/3-claude-code-config/3-5-iterative-refinement

~~~powershell
npm run lab:domain3 -- 5
cd domain3-workspaces/lesson35

# ĐÂY LÀ TEST CỐ Ý THẤT BẠI (Red):
npm test

# Sau đó mở Claude để sửa trên bằng chứng test fail:
claude
~~~

1. Quan sát test `null preserved` fail vì `normalise(null)` trả chuỗi rỗng.
2. Cho Claude thấy actual assertion output, yêu cầu sửa case null; chạy lại `npm test` để kiểm chứng Green.
3. Đọc `examples.md`: hai cặp before/after chuyển Promise<T> thành Promise<Result<T,ApiError>>.
4. Thử unseen function để kiểm tra generalisation, thêm edge case khi cần.
5. Sử dụng interview pattern khi thiếu kiến thức caching: TTL, invalidation, consistency, fallback.
6. Feedback liên quan error shape/log/client type → gửi cùng một batch. Naming và indentation độc lập → xử lý từng lần.

**Bẫy:** Inconsistent transformation → examples cụ thể trước, không tiếp tục viết prose dài. Complex edge cases → test-driven iteration.

## Lesson 3.6 — CI/CD Integration (45 phút)

Nguồn: https://claudecertificationguide.com/learn/3-claude-code-config/3-6-cicd-integration

~~~powershell
npm run lab:domain3 -- 6
cd domain3-workspaces/lesson36

# Local demo lọc findings cũ: KHÔNG gọi Claude model
node scripts/check-review.mjs

# Ví dụ CLI thật — chỉ chạy khi có Claude Code auth:
claude -p "Review the changes for security and regression issues"
~~~

1. Đọc YAML mẫu `.github/workflows/claude-review.example.yml` **BÊN TRONG** thư mục lesson36: không phải GitHub workflow đang chạy. Muốn dùng thật phải cài CLI trên runner và xem lại secrets, GitHub permissions, billing.
2. Phân biệt `claude -p` non-interactive với `claude "..."` interactive.
3. Dùng `--output-format json` và `--json-schema` rồi đọc trường `structured_output` trong JSON envelope.
4. Để giảm reviewer bias, dùng một invocation mới để review thay vì resume session vừa generate code.
5. Xem `previous-findings.json` và output script demo; chỉ comment issue mới hoặc chưa được xử lý, không spam issue đã acknowledged.
6. Dùng project CLAUDE.md làm CI context testing, nhưng nhớ chế độ `--bare` có thể bỏ qua auto-load cấu hình.
7. Nếu chỉ bổ sung tiêu chí review, dùng `--append-system-prompt` thay vì thay thế default system instructions.

**Giới hạn thực hành:** Node dedupe là deterministic local demonstration, **không** phải kết quả đã được Claude phân tích. Workflow YAML không phải pipeline production đầy đủ và phải được review trước khi bật.

## Tổng kết 3.1–3.6 để ôn thi

| Tình huống | Đáp án nên nghĩ đến |
| --- | --- |
| Teammate thiếu shared conventions | Đưa user CLAUDE.md về project CLAUDE.md |
| Verbose workflow cần chạy theo yêu cầu | Skill SKILL.md + context: fork |
| Test rules ở nhiều thư mục | .claude/rules/testing.md với paths glob |
| Architectural migration nhiều file | Plan → Direct |
| Claude hiểu transformation không ổn định | 2–3 cặp I/O examples |
| Tests fail edge cases | Test-driven iteration |
| Unknown caching/business domain | Interview pattern |
| CI chờ input mãi | claude -p |
| CI cần structured findings | JSON output + JSON Schema, structured_output |
| Reviewer tự thiên vị hoặc comment trùng | Session riêng và previous findings |

**Tài liệu CLI chính thức:** https://code.claude.com/docs/en/cli-reference
**Tài liệu Skills:** https://code.claude.com/docs/en/skills
**Tài liệu Memory:** https://code.claude.com/docs/en/memory

Các lệnh chạy trên local CLI có thể dùng quota/credits. Website tĩnh + npm scaffold không sử dụng token.