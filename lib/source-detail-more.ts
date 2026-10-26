import type {SourceAdditionalTopic} from "./source-detail-additions.ts";
// Additional independently authored source-scope explanations for curriculum outline coverage.
export const sourceDetailMore:Record<string,SourceAdditionalTopic[]> = {
  "1.4": [
    {
      "title": [
        "SubagentStart / SubagentStop và giới hạn can thiệp",
        "SubagentStart and SubagentStop lifecycle boundaries"
      ],
      "detail": [
        "Theo bài nguồn, SubagentStart quan sát lúc specialist khởi chạy và có thể thêm additionalContext, nhưng không chặn thao tác spawn. Muốn chặn trước, đặt PreToolUse trên tool Agent. SubagentStop kiểm tra kết quả khi specialist định kết thúc; mã thoát 2 có thể giữ agent tiếp tục hoàn thiện, nhưng không trực tiếp viết lại kết quả. Đây là phần mở rộng, không phải trọng tâm Task 1.4 về prerequisite gates.",
        "The source distinguishes a subagent lifecycle event from a tool execution boundary. SubagentStart can add context at launch but is not the enforcement gate for denying the spawn; use PreToolUse on Agent for that. SubagentStop can reject an unfinished output and return the specialist to work, but does not itself transform the returned result. This is supporting detail beyond the core 1.4 exam scope."
      ],
      "example": [
        "Một agent kiểm toán được thêm hướng dẫn trích dẫn lúc khởi chạy; khi kết thúc thiếu sourceUrl, stop hook yêu cầu làm tiếp. Nếu thiếu quyền gọi agent thì pre-tool gate mới là nơi chặn.",
        "A research specialist receives source-attribution guidance at start. Its completion hook rejects findings without references. If permission is missing before launch, the pre-tool gate denies the invocation instead."
      ],
      "trap": [
        "Start không chặn spawn; Stop không sửa output. Đừng nhầm với gate trước khi refund xảy ra.",
        "Start does not deny spawning; Stop does not rewrite output. Neither replaces a pre-refund execution gate."
      ],
      "scope": "supplement"
    }
  ],
  "3.2": [
    {
      "title": [
        "allowed-tools và argument-hint: Exam Guide khác Current state",
        "Skill frontmatter: separate exam wording from current behaviour"
      ],
      "detail": [
        "Bài nguồn nêu rõ Exam Guide v1.0 dùng allowed-tools theo nghĩa giới hạn tool của skill và argument-hint như lời nhắc về tham số thiếu. Mục Current state lại nói allowed-tools pre-approve những tool được liệt kê; disallowed-tools/permission settings mới dùng để deny. argument-hint hiện chỉ là gợi ý trong autocomplete, không tự mở form hỏi. description rất quan trọng cho việc tự khám phá skill.",
        "The curriculum explicitly distinguishes exam-guide wording from the current frontmatter contract. In the guide, allowed-tools is described as restricting skill access and argument-hint as prompting for input. The source's current-state explanation instead treats allowed-tools as pre-approval, with denial handled separately, whilst argument-hint is an autocomplete hint rather than an interactive questionnaire. The description supports automatic discovery."
      ],
      "example": [
        "Skill audit đặt description rõ và context: fork. Chỉ liệt kê Read/Grep/Glob trong allowed-tools không đủ để biến Edit thành unavailable ở runtime được bài nguồn mô tả.",
        "An audit skill has a specific description and context: fork. Listing Read, Grep and Glob for pre-approval does not by itself remove Edit from the runtime's tool availability."
      ],
      "trap": [
        "Phân biệt đáp án bài thi với hành vi phiên bản hiện tại; không biến pre-approval thành hard deny.",
        "Distinguish the source's exam answer from its current-state note; auto-approval is not a hard deny."
      ],
      "scope": "exam"
    }
  ],
  "3.3": [
    {
      "title": [
        "Đối chứng file match và không match để kiểm path rules",
        "Verify conditional rules through contrasting matching files"
      ],
      "detail": [
        "Bài gốc hướng dẫn tạo rule riêng cho tests, API handlers và Terraform, rồi thử chỉnh những file match globs tương ứng. Khi chỉnh Button.test.ts chỉ test conventions được đưa vào; khi chuyển sang routes hoặc *.tf, rule khác mới phù hợp. So với root CLAUDE.md chứa mọi conventions, cơ chế path-scoped giảm instruction không liên quan và tránh việc nhân bản 50 tệp CLAUDE.md.",
        "The original lesson uses separate rules for tests, API handlers and Terraform, then verifies activation with matching files. A test edit should bring only the relevant testing conventions into scope, whereas route and infrastructure edits need different rules. Compared with placing everything in root CLAUDE.md or copying fifty directory files, path rules reduce irrelevant context and maintenance drift."
      ],
      "example": [
        "Đặt testing rule cho **/*.test.ts, API rule cho **/routes/**/* và infrastructure rule cho **/*.tf; kiểm mỗi lượt chỉnh file có các conventions phù hợp thay vì tất cả.",
        "Create a testing rule for **/*.test.ts, an API rule for **/routes/**/* and an infrastructure rule for **/*.tf. Check the active guidance during each contrasting edit."
      ],
      "trap": [
        "Convention tự động theo loại file là rule; workflow audit được gọi chủ động mới phù hợp skill.",
        "Automatic file-type conventions belong in rules; an invoked auditing procedure belongs in a skill."
      ],
      "scope": "exam"
    }
  ],
  "3.4": [
    {
      "title": [
        "Phát hiện ambiguity sớm và cách dùng Explore subagent",
        "Recognise ambiguity before editing and isolate exploration"
      ],
      "detail": [
        "Nếu yêu cầu đã nói đến migration hàng chục file hoặc thay đổi kiến trúc có nhiều phương án, hãy chọn plan mode ngay từ đầu thay vì sửa thử rồi đợi phát sinh lỗi. Phần khám phá chứa nhiều directory listings, Grep và dependency chains có thể giao Explore subagent để main session chỉ nhận findings cần cho implementation. Sau khi duyệt kế hoạch, chuyển sang direct execution theo một chiến lược thống nhất.",
        "A migration across many files or a design decision with several viable approaches already signals ambiguity: enter plan mode before writing edits. Expansive file listings and dependency scans may be isolated in an Explore subagent, preserving concise verified findings for the main context. Once the plan is accepted, direct execution can implement a consistent approach."
      ],
      "example": [
        "Chuyển logging library trong 40 modules cần plan imports, API changes và tests trước; sửa một lỗi null pointer ở một function có stack trace rõ thì direct execution + test phù hợp hơn.",
        "Migrating a logging library across forty modules warrants mapping imports, contract differences and affected tests first. A clearly located null-pointer bug with a failing test favours direct execution."
      ],
      "trap": [
        "Không chọn mode chỉ theo độ khó cảm nhận; và câu prose 'in plan mode' không thay permission mode.",
        "Do not choose solely by perceived difficulty, and do not mistake a prose instruction for switching permission mode."
      ],
      "scope": "exam"
    }
  ]
};
