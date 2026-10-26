export type SourceAdditionalTopic = {
 title:[string,string];detail:[string,string];example:[string,string];trap:[string,string];scope:"exam"|"supplement";
};
// Independently authored expansions for concepts exposed by the sole source's chapter outline.
// Explanations do not copy or translate the source article verbatim.
export const sourceDetailAdditions:Record<string,SourceAdditionalTopic[]> = {
  "1.5": [
    {
      "title": [
        "Kết quả callback hook và contract phải khớp điểm can thiệp",
        "Match the hook callback contract to its lifecycle point"
      ],
      "detail": [
        "Một yêu cầu process_refund phải được kiểm ở trước tool call, vì sau khi thanh toán hoàn tất không có hook nào đảo ngược được giao dịch. Trong PreToolUse, contract hỗ trợ quyết định allow, deny, ask hoặc defer tuỳ runtime và chỉnh input qua updatedInput khi phù hợp; phản hồi phải đúng cấu trúc hook-specific, không tự bịa field. PostToolUse tiếp nhận tool_response để chuẩn hoá dữ liệu đã có và có thể trả updatedToolOutput. Tên trường cũ chỉ áp dụng một số tool MCP, cần tách khỏi contract được bài nguồn giới thiệu.",
        "For a financial side effect, check before tool execution. The PreToolUse contract can express an approval or denial decision and may adjust input via updatedInput, but only through the supported hook-specific result shape. PostToolUse runs on an actual returned value and may provide updatedToolOutput. The older MCP-specific output name is not a general contract and should not be mixed with the newer result field."
      ],
      "example": [
        "Ví dụ: tool approve_discount nhận 25% nhưng session chưa có managerApprovalId; PreToolUse từ chối trước khi tạo mã giảm. Tool get_shipping trả status 'P' và ngày '08/11/2026'; PostToolUse chuyển sang status='pending' và một ngày ISO đã xác minh định dạng ngày/tháng.",
        "Example: approve_discount requests 25% without a trusted managerApprovalId, so the pre-execution check denies it before a discount exists. In contrast, get_shipping returns status 'P' and '08/11/2026'; a post-execution normaliser converts the code to 'pending' and parses the date using the declared day-first convention."
      ],
      "trap": [
        "Bẫy: dùng PostToolUse để deny một khoản refund đã thực hiện, hoặc dùng PreToolUse để biến đổi tool_response chưa tồn tại. Không biến tool result lỗi thành kết quả thành công khi chuẩn hoá.",
        "Trap: using PostToolUse to deny a refund after it happened, or asking PreToolUse to transform a result that does not exist yet. Normalisation must not hide genuine tool failures."
      ],
      "scope": "exam"
    },
    {
      "title": [
        "Điểm đặt hook ngoài hai sự kiện chính — chỉ là kiến thức mở rộng",
        "Additional lifecycle events are supporting context, not the core test"
      ],
      "detail": [
        "Trang nguồn mô tả PreCompact và PostCompact ngoài phạm vi trọng tâm Task 1.5. PreCompact xảy ra trước khi lịch sử hội thoại được nén và có thể dùng để sao lưu transcript hoặc can thiệp trước nén; PostCompact diễn ra sau khi bản tóm tắt đã tạo. Việc nắm thêm giúp thiết kế ứng dụng nhưng không thay thế hai lựa chọn PreToolUse cho enforcement và PostToolUse cho normalisation trong câu hỏi thi của bài này.",
        "The curriculum discusses PreCompact and PostCompact as additional lifecycle events beyond the main 1.5 test scope. A pre-compaction hook may capture evidence before old conversation details are compressed; a post-compaction event observes the new condensed state. These do not replace the central exam distinction between PreToolUse enforcement and PostToolUse normalisation."
      ],
      "example": [
        "Trong codebase có hàng trăm tool results, một hook trước compact có thể lưu danh sách file, các lỗi còn mở và mã commit cần đối chiếu. Sau compact, agent đọc bản tóm tắt mới nhưng vẫn có ghi chú kỹ thuật độc lập để tái xác minh.",
        "In a long code investigation, a pre-compaction hook could preserve file paths, outstanding failures and the commit under examination. After compaction, the agent receives a shorter narrative whilst external records retain the exact details needed for re-verification."
      ],
      "trap": [
        "Bẫy thi: chọn PreCompact khi đề hỏi chặn thao tác tài chính hoặc đồng nhất kết quả của tool. Hai việc đó phải gắn đúng PreToolUse hoặc PostToolUse.",
        "Exam trap: selecting PreCompact when the question concerns preventing a payment or normalising returned tool data. Those tasks belong to PreToolUse and PostToolUse respectively."
      ],
      "scope": "supplement"
    }
  ],
  "3.1": [
    {
      "title": [
        "CLAUDE.md là hướng dẫn, settings.json là lớp áp dụng quyền",
        "Distinguish memory instructions from enforceable settings"
      ],
      "detail": [
        "Các tệp CLAUDE.md được nạp vào context như chỉ dẫn nên hai quy tắc trái nhau không có bảo đảm tệp 'gần nhất' sẽ thắng. Trong khi đó settings.json hoặc hook có thể đặt chính sách client áp dụng tại thời điểm thao tác. Đây là ranh giới giữa conventions (văn phong, naming, kiến trúc) và hard permissions (cấm tool hoặc yêu cầu duyệt). Nếu mới gia nhập dự án không thấy naming conventions, kiểm nơi lưu instruction trước; nếu muốn cấm lệnh không an toàn, không giải bằng thêm một đoạn CLAUDE.md.",
        "CLAUDE.md files provide contextual guidance rather than deterministic policy enforcement. Two contradictory instructions do not have a guaranteed winner merely because one appears later or sits deeper in the directory tree. By contrast, settings.json and execution hooks can enforce permissions at the client boundary. Use shared memory for coding conventions and enforced settings for prohibited tools or approval requirements."
      ],
      "example": [
        "Team Next.js đặt test naming vào .claude/CLAUDE.md để cả nhóm clone thấy; riêng package API có CLAUDE.md về REST. Nếu phải cấm chạy Bash xoá bảng dữ liệu, áp dụng cấu hình quyền/hook ở boundary thay vì chỉ viết 'Never run destructive commands' trong file memory.",
        "A Next.js team commits testing conventions in project CLAUDE.md, with REST-specific guidance in the API package. A prohibition on executing destructive Bash actions, however, needs a client-level permission or hook rule rather than a prose instruction saying never to do so."
      ],
      "trap": [
        "Bẫy: tin directory-level CLAUDE.md tự động override root hoặc user-level; không tồn tại cơ chế thắng tuyệt đối cho hướng dẫn ngôn ngữ.",
        "Trap: assuming a nested CLAUDE.md automatically overrides project or user instructions. There is no universal precedence winner for conflicting prose."
      ],
      "scope": "exam"
    },
    {
      "title": [
        "Nạp lại sau compact và xác nhận files đang có hiệu lực",
        "Reloading after compaction and diagnosing active files"
      ],
      "detail": [
        "Theo bài nguồn, project-root memory được tái nạp sau compaction; nested CLAUDE.md và path-specific rules là những loại có thể nạp theo nhu cầu khi file phù hợp được làm việc lại. Vì vậy khi hướng dẫn tưởng biến mất, kiểm lệnh /context để biết những files đã có trong context, đồng thời xem có rule điều kiện đang chờ match đường dẫn. /memory theo Exam Guide được dùng như câu trả lời keyed; trang nguồn phân biệt chính xác hành vi hiện nay của /memory và /context.",
        "The curriculum distinguishes project-root memory being reloaded after compaction from nested instructions and path-scoped rules that become relevant again when matching work occurs. Diagnose an apparent missing instruction by examining the currently loaded memory files and whether the relevant path conditions have been met. The site explicitly separates the exam-guide /memory wording from the current /context diagnostic."
      ],
      "example": [
        "Sau /compact bạn chỉnh README thì test rule với paths '**/*.test.ts' không có lý do nạp; khi chỉnh auth.test.ts mới cần nó. Điều này không có nghĩa file rule đã bị xoá. Nếu ai đó dùng @ import để nhét 500 dòng luôn vào root, split file làm dễ bảo trì nhưng không làm giảm số token được nạp.",
        "After /compact, editing README does not trigger a rule scoped to **/*.test.ts. Editing auth.test.ts later does. The rule has not been deleted; it is conditionally relevant. Likewise, splitting five hundred lines into @ imports improves maintenance but does not inherently reduce the context consumed by eager imports."
      ],
      "trap": [
        "Bẫy: xem /memory là nút bật auto-loading hoặc xem @ imports là lazy để tiết kiệm context. Theo guide, lệnh là chẩn đoán; vị trí file và paths quyết định khi nào nạp.",
        "Exam trap: treating /memory as a loading switch or @ imports as lazy token-saving retrieval. Location and path relevance govern loading, whilst the commands diagnose it."
      ],
      "scope": "exam"
    }
  ],
  "3.6": [
    {
      "title": [
        "Hợp đồng CLI output: envelope khác dữ liệu đã validate",
        "Understand the CI JSON envelope and validated payload"
      ],
      "detail": [
        "Khi gọi claude -p với --output-format json, chương trình nhận envelope chứa kết quả, session và usage thay vì chỉ mảng lỗi. Nếu thêm --json-schema, dữ liệu kiểm theo schema được đặt trong field structured_output. Parser đăng PR comments phải đọc đúng field, xác minh file/line/severity/message rồi mới đăng; nếu parser lầm đọc root.findings có thể bỏ qua mọi lỗi dù tác vụ đã chạy.",
        "With claude -p --output-format json, CI receives a machine-readable envelope containing result and execution metadata. Schema-constrained content is accessed under structured_output when --json-schema is used. The PR comment publisher must validate the extracted file, line, severity and message fields instead of guessing that findings live at the JSON root."
      ],
      "example": [
        "Trong một Next.js pipeline, bước parse dùng jq '.structured_output.findings' và xác minh line chỉ tới diff hợp lệ. Nếu output không hợp schema hoặc file path không tồn tại, job báo lỗi có cấu trúc, không tự đăng một comment sai vị trí.",
        "A Next.js pipeline extracts structured_output.findings and checks that each file and line corresponds to an appropriate changed location. A missing schema-conforming payload should fail visibly rather than posting misleading comments."
      ],
      "trap": [
        "Không nhầm --output-format json với --json-schema: một cờ chọn envelope, cờ còn lại đặt ràng buộc đầu ra. Không chọn --batch hay CLAUDE_HEADLESS để sửa job treo.",
        "Do not confuse JSON envelope selection with schema validation. Neither --batch nor CLAUDE_HEADLESS is the fix for a hanging interactive job."
      ],
      "scope": "exam"
    },
    {
      "title": [
        "Phân biệt các flags giới hạn tool, permission và prompt",
        "Separate tool availability, permission rules and prompt control"
      ],
      "detail": [
        "Bài nguồn liệt kê --tools để thu hẹp bộ tool mà phiên nhìn thấy; --allowedTools đánh dấu những tool/rules có thể chạy mà không phải xin quyền; --disallowedTools tạo deny rules. Đây là các mục khác nhau, không lấy mô tả một flag thay cho flag khác. Với system instructions, --append-system-prompt giữ chỉ dẫn coding mặc định trong khi --system-prompt thay toàn bộ. --bare có thể bỏ auto-discovery CLAUDE.md nên không dùng trong job cần standards của repo.",
        "The curriculum distinguishes restricting which tools are available from permissions that auto-approve or deny specific operations. --tools limits the exposed toolkit, while --allowedTools and --disallowedTools control permissions according to their documented contracts. Likewise, --append-system-prompt preserves default Claude Code guidance, whereas --system-prompt replaces it. A minimal --bare session sacrifices project auto-discovery and is unsuitable when CI depends on CLAUDE.md."
      ],
      "example": [
        "Job review chỉ được Read/Grep/Glob và lệnh git diff có giới hạn, không cấp Write vô điều kiện. File CLAUDE.md nêu conventions kiểm thử; dùng append prompt thêm tiêu chí 'chỉ nêu bug có bằng chứng' thay vì thay cả system prompt.",
        "A review job can expose read-only file inspection and a narrowly scoped git diff command without unguarded Write access. Keep project testing conventions available and append evidence-based review criteria rather than replacing the assistant's entire system guidance."
      ],
      "trap": [
        "Bẫy: coi allowlist auto-approve đồng nghĩa tool không nằm trong list chắc chắn biến mất khỏi context; hoặc coi prompt có thể thay permission layer.",
        "Trap: mistaking an auto-approval list for a complete definition of tool availability, or expecting prose rules to enforce client permissions."
      ],
      "scope": "exam"
    },
    {
      "title": [
        "GitHub Actions integration và worktrees: phần mở rộng của trang nguồn",
        "GitHub Actions and worktrees are labelled supplementary material"
      ],
      "detail": [
        "Trang nguồn 3.6 có phần Beyond the guide về GitHub Actions. Phân biệt workflow có prompt truyền trực tiếp cho claude-code-action (automation) với workflow đợi @claude trong PR/issue comments (interactive trigger), và truyền các CLI flags qua claude_args. Không commit API key; scope permissions và event triggers để tránh PR không tin cậy tiếp cận secrets. Phần worktrees cũng được gắn nhãn mở rộng: mỗi session có thư mục làm việc riêng, giúp tránh đụng file, nhưng khi merge vẫn phải xử lý nhánh và conflict.",
        "The source explicitly labels GitHub Actions and parallel git worktrees as additional knowledge beyond the exam guide. In the described action, automation with an explicit prompt differs from mention-triggered interaction. CLI options belong in claude_args, whilst repository permissions and credentials must be scoped to the intended trigger. Worktrees isolate concurrent filesystem changes but do not magically resolve merge conflicts."
      ],
      "example": [
        "Hai agent xử lý payment và inventory trên hai worktrees tách biệt, sau đó commit độc lập rồi merge có kiểm soát. Khi chỉ cần PR review, dùng một workflow với quyền contents: read và token secret, không tự chạy untrusted code từ PR.",
        "Two agents can edit payment and inventory logic in separate worktrees, commit independently and reconcile changes during review. A simple pull-request review, by contrast, should use restricted permissions and avoid exposing secrets to untrusted code."
      ],
      "trap": [
        "Bẫy: đem chi tiết của action hoặc worktree ngoài guide thành câu trả lời bắt buộc cho Task 3.6. Luôn đọc nhãn Beyond the guide trên nguồn.",
        "Exam trap: treating implementation-specific action or worktree details labelled 'Beyond the guide' as mandatory exam-guide answers."
      ],
      "scope": "supplement"
    },
    {
      "title": [
        "Real-time đối lập Message Batches trong CI",
        "Choose synchronous checks versus delayed Message Batches"
      ],
      "detail": [
        "Nguồn 3.6 phân định rõ: checks chặn merge cần kết quả trong thời gian nhà phát triển chờ thì gọi real-time, còn tổng hợp technical debt hàng tuần hoặc kiểm thử ban đêm có thể dùng Message Batches để tiết kiệm chi phí. Batch có thể mất đến 24 giờ, không có latency SLA; giảm chi phí không phải lý do hợp lệ để biến một pre-merge gate thành batch. Đây cũng là kiến thức nối sang Domain 4.5.",
        "The curriculum treats pre-merge review as a blocking synchronous workflow. Message Batches may reduce processing cost for scheduled, latency-tolerant jobs, but do not promise a quick turnaround within a merge gate. Overnight and weekly audit reports are better candidates for batching. The decision boundary depends on latency requirements, not simply cost."
      ],
      "example": [
        "Pull request vào sáng thứ Hai cần security review trước merge: realtime. Báo cáo technical debt tối Chủ nhật không giữ chân developer: batch với custom identifiers để nối lại từng kết quả.",
        "A Monday pull request needing a security result before merge uses real-time processing. A Sunday evening technical-debt report that can arrive later may be batched, retaining identifiers for result correlation."
      ],
      "trap": [
        "Không chọn Batch API cho pre-merge chỉ vì giảm 50% chi phí xử lý; không có cam kết kết quả đến kịp gate.",
        "Do not select batch processing for a blocking pre-merge check merely because of a 50% cost reduction; there is no suitable latency guarantee."
      ],
      "scope": "exam"
    }
  ]
};
