// Exam concept checklists independently paraphrased from the matching /learn Task Statements.
// One truth source: claudecertificationguide.com/learn.
export type SourceChecklist = Record<string,[string,string][]>;
export const sourceLearningObjectives: SourceChecklist = {
  "1.1": [
    [
      "stop_reason điều khiển vòng lặp",
      "stop_reason controls the agent loop"
    ],
    [
      "tool_use tiếp tục, end_turn kết thúc",
      "tool_use continues; end_turn finishes"
    ],
    [
      "Thêm tool_result và ID vào history",
      "Append tool_result and IDs to history"
    ],
    [
      "Model chọn tool, code thực thi",
      "The model chooses; the application executes"
    ],
    [
      "Không parse text hoặc lấy iteration cap làm tín hiệu xong",
      "Never treat text or iteration caps as completion"
    ]
  ],
  "1.2": [
    [
      "Hub-and-spoke: coordinator là điểm điều phối",
      "Hub-and-spoke uses a coordinator hub"
    ],
    [
      "Phân tách đầy đủ phạm vi trước khi giao việc",
      "Cover the full research breadth during decomposition"
    ],
    [
      "Subagents không tự chia sẻ history",
      "Subagents do not automatically share context"
    ],
    [
      "Chọn agent động theo yêu cầu",
      "Select specialists dynamically"
    ],
    [
      "Refinement cho coverage gaps và tổng hợp findings",
      "Refine uncovered topics and synthesise findings"
    ]
  ],
  "1.3": [
    [
      "Task/Agent invocation và allowedTools theo ngữ cảnh guide",
      "Task/Agent invocation and exam-guide allowedTools"
    ],
    [
      "AgentDefinition: description, prompt, tools",
      "AgentDefinition: description, prompt, tools"
    ],
    [
      "Handoff findings kèm structured metadata có nguồn",
      "Pass findings with source metadata"
    ],
    [
      "Parallel tool calls cho các agent độc lập",
      "Parallel tool calls for independent agents"
    ],
    [
      "Fork khác resume và không giống spawn",
      "Fork differs from resume and spawning"
    ]
  ],
  "1.4": [
    [
      "Prompt guidance khác programmatic prerequisite gate",
      "Prompt guidance differs from a programmatic gate"
    ],
    [
      "Refund/identity/compliance cần chặn trước side effect",
      "Financial, security and compliance actions need precondition gates"
    ],
    [
      "Fail-closed trên trạng thái đã xác minh",
      "Fail closed on trusted verification state"
    ],
    [
      "Escalation đến người có lý do rõ ràng",
      "Escalate with an explicit reason"
    ],
    [
      "Self-contained handoff gồm context và việc còn lại",
      "Self-contained handoff contains context and next action"
    ]
  ],
  "1.5": [
    [
      "PreToolUse chặn/sửa input trước tool",
      "PreToolUse intercepts the call before execution"
    ],
    [
      "PostToolUse chuẩn hóa output sau tool",
      "PostToolUse normalises the result after execution"
    ],
    [
      "updatedToolOutput và output shape cần đúng contract",
      "Use the documented updatedToolOutput contract"
    ],
    [
      "Timezones, status enums, null và lỗi không được bóp méo",
      "Preserve the meaning of timezones, status enums and errors"
    ],
    [
      "Không dùng post-hook để chặn side effect đã xảy ra",
      "A post-hook cannot prevent an executed side effect"
    ]
  ],
  "1.6": [
    [
      "Fixed prompt chaining cho các bước dự đoán được",
      "Fixed prompt chaining suits predictable steps"
    ],
    [
      "Adaptive decomposition khi findings thay đổi kế hoạch",
      "Adaptive decomposition revises tasks from evidence"
    ],
    [
      "Local file pass tránh attention dilution",
      "Local file passes reduce attention dilution"
    ],
    [
      "Integration pass kiểm cross-file consistency",
      "An integration pass checks cross-file consistency"
    ],
    [
      "Không nhầm độ rộng công việc với khả năng chia song song",
      "Do not equate broad scope with independent parallel work"
    ]
  ],
  "1.7": [
    [
      "Resume giữ conversation và tool results cũ",
      "Resume retains conversation history and tool results"
    ],
    [
      "Fork tạo nhánh từ baseline chung",
      "Fork branches from a shared baseline"
    ],
    [
      "Fresh + curated summary bỏ history không cần thiết",
      "Fresh plus curated summary replaces cluttered history"
    ],
    [
      "Stale tool results cần đọc lại file đã đổi",
      "Stale tool results require targeted re-reads"
    ],
    [
      "Reanalyse files thay đổi cùng dependencies",
      "Reanalyse changed files and affected dependencies"
    ]
  ],
  "2.1": [
    [
      "Descriptions là tín hiệu chính để chọn tool",
      "Descriptions are the primary tool-selection signal"
    ],
    [
      "5 phần: purpose, inputs, examples, edge, boundaries",
      "Five-part descriptions: purpose, inputs, examples, edges, boundaries"
    ],
    [
      "Sửa misrouting bằng description trước classifier",
      "Fix weak descriptions before adding a classifier"
    ],
    [
      "Tách tool đa nhiệm rộng khi trách nhiệm không rõ",
      "Split overly broad tools into focused operations"
    ],
    [
      "Kiểm conflict keywords trong system prompt",
      "Check system prompt wording for misrouting"
    ]
  ],
  "2.2": [
    [
      "Protocol error khác tool execution error",
      "Protocol failures differ from tool execution errors"
    ],
    [
      "MCP isError=true khi tool chạy lỗi",
      "MCP tool execution failures use isError=true"
    ],
    [
      "Phân loại validation, transient, permission và business",
      "Distinguish validation, transient, permission and business errors"
    ],
    [
      "Retry guidance có thể dựa isRetryable custom field",
      "Application isRetryable metadata can guide recovery"
    ],
    [
      "Empty valid result không phải lỗi",
      "A legitimate empty result is not an error"
    ]
  ],
  "2.3": [
    [
      "Tool overload khi một agent thấy quá nhiều tools",
      "Large toolkits increase selection complexity"
    ],
    [
      "Phân phối tools theo scope của specialist",
      "Distribute tools by specialist responsibilities"
    ],
    [
      "Hợp nhất công cụ gần giống thành parameterised tool",
      "Consolidate near-duplicate tools through parameters"
    ],
    [
      "tool_choice auto / any / named theo bài thi",
      "Exam framing for auto, any and named tool choice"
    ],
    [
      "Coordinator xác nhận tool phù hợp và giới hạn quyền",
      "Coordinator checks tool scope and authority"
    ]
  ],
  "2.4": [
    [
      "Project .mcp.json chia sẻ qua git",
      "Project .mcp.json is team-shared"
    ],
    [
      "User ~/.claude.json giữ tích hợp cá nhân",
      "User ~/.claude.json is personal"
    ],
    [
      "ENV interpolation tránh lộ credentials",
      "Use environment references instead of committed credentials"
    ],
    [
      "Tools khác MCP resources và prompts",
      "Separate MCP tools, resources and prompts"
    ],
    [
      "Community server trước custom proprietary server",
      "Evaluate existing servers before custom proprietary integrations"
    ]
  ],
  "2.5": [
    [
      "Grep tìm text nội dung file",
      "Grep searches file contents"
    ],
    [
      "Glob tìm đường dẫn/tên file",
      "Glob matches file paths"
    ],
    [
      "Read trước khi sửa khi cần context",
      "Read to understand context before editing"
    ],
    [
      "Edit thay đoạn exact text duy nhất",
      "Edit replaces a uniquely identified span"
    ],
    [
      "Write toàn file khác với targeted edit; Bash chạy tests",
      "Write replaces files; Bash runs tests"
    ]
  ],
  "3.1": [
    [
      "User, project, directory CLAUDE.md scopes",
      "User, project and directory CLAUDE.md scopes"
    ],
    [
      "Không có guaranteed override giữa memory files",
      "No guaranteed memory-file override"
    ],
    [
      "@ import nạp nội dung cùng memory",
      "@ imports load with memory"
    ],
    [
      "CLAUDE.local.md dùng notes cá nhân",
      "CLAUDE.local.md holds local personal guidance"
    ],
    [
      "Exam /memory khác current /context",
      "Exam /memory versus current /context"
    ]
  ],
  "3.2": [
    [
      ".claude/skills/name/SKILL.md canonical",
      "Canonical .claude/skills/name/SKILL.md"
    ],
    [
      ".claude/commands/name.md alias vẫn dùng",
      "Legacy .claude/commands/name.md still works"
    ],
    [
      "Project và user scope không giống nhau",
      "Project and user scope differ"
    ],
    [
      "Frontmatter description, context: fork",
      "Frontmatter description and context: fork"
    ],
    [
      "Skills on-demand khác CLAUDE.md always-on",
      "On-demand skills differ from standing CLAUDE.md"
    ]
  ],
  "3.3": [
    [
      ".claude/rules/ với YAML paths",
      "Rules in .claude/rules/ with YAML paths"
    ],
    [
      "** glob khớp nhiều directory levels",
      "Recursive ** globs span directories"
    ],
    [
      "Test patterns match .test.ts và .test.tsx",
      "Test patterns include .test.ts and .test.tsx"
    ],
    [
      "Rule conditional khác root CLAUDE.md",
      "Conditional rules differ from root CLAUDE.md"
    ],
    [
      "Rule khác Skill chạy quy trình chủ động",
      "Rules differ from explicitly invoked skills"
    ]
  ],
  "3.4": [
    [
      "Plan mode khi kiến trúc chưa rõ",
      "Plan mode for uncertain architecture"
    ],
    [
      "Direct execution khi path và fix đã xác định",
      "Direct execution for known, narrow fixes"
    ],
    [
      "CLI /plan, Shift+Tab hoặc --permission-mode plan",
      "Use /plan, Shift+Tab or --permission-mode plan"
    ],
    [
      "Không bật mode chỉ bằng prose 'in plan mode'",
      "Prose alone does not change permission mode"
    ],
    [
      "Hybrid: plan trước, sau đó execute được duyệt",
      "Hybrid workflows plan before approved execution"
    ]
  ],
  "3.5": [
    [
      "Input/output examples cho transformation không nhất quán",
      "Input/output examples for inconsistent transformations"
    ],
    [
      "Failing tests làm feedback có căn cứ",
      "Failing tests provide grounded feedback"
    ],
    [
      "Interview pattern hỏi rõ yêu cầu trước khi code",
      "Interview pattern clarifies requirements before coding"
    ],
    [
      "Batch feedback cho independent fixes",
      "Batch feedback for independent changes"
    ],
    [
      "Sequential feedback cho các sửa đổi phụ thuộc",
      "Sequential feedback for dependent changes"
    ]
  ],
  "3.6": [
    [
      "claude -p trong CI không tương tác",
      "claude -p for non-interactive CI"
    ],
    [
      "--output-format json tạo envelope",
      "--output-format json creates an envelope"
    ],
    [
      "--json-schema và structured_output field",
      "--json-schema with structured_output"
    ],
    [
      "Reviewer độc lập với generation context",
      "Independent review context"
    ],
    [
      "Prior findings và quyền hạn tối thiểu trong CI",
      "Prior findings and least-privilege CI"
    ]
  ],
  "4.1": [
    [
      "Explicit report và skip categories",
      "Explicit report and skip categories"
    ],
    [
      "Comments chỉ báo khi behaviour mismatch",
      "Flag comments only for behaviour mismatch"
    ],
    [
      "Severity định nghĩa bằng code examples",
      "Severity calibrated through code examples"
    ],
    [
      "Category false positives phá trust toàn review",
      "Noisy categories damage trust in all review output"
    ],
    [
      "Tạm disable category lỗi; confidence chỉ hỗ trợ routing",
      "Disable noisy categories; confidence is for routing"
    ]
  ],
  "4.2": [
    [
      "2–4 examples input/output có reasoning",
      "Two to four worked examples with reasoning"
    ],
    [
      "Few-shot sửa drift trong output formatting",
      "Few-shot addresses output format drift"
    ],
    [
      "Ambiguous tool routing cần rationale",
      "Ambiguous tool routes benefit from rationale"
    ],
    [
      "Extraction từ narrative không chỉ table",
      "Teach extraction from narrative as well as tables"
    ],
    [
      "Few-shot khác schema, nullable và semantic validation",
      "Distinguish few-shot from schema and validation"
    ]
  ],
  "4.3": [
    [
      "Tool-use schema khác JSON text prompt",
      "Tool-use schemas differ from JSON text prompts"
    ],
    [
      "tool_choice auto / any / named",
      "tool_choice auto, any and named"
    ],
    [
      "strict schema và model compatibility caveat",
      "Strict schemas and model compatibility caveats"
    ],
    [
      "Nullable fields cho giá trị nguồn không có",
      "Nullable fields represent absent facts"
    ],
    [
      "Enums unclear và other + detail",
      "Enums unclear and other plus detail"
    ]
  ],
  "4.4": [
    [
      "Syntax/schema vs semantic validation",
      "Syntax/schema versus semantic validation"
    ],
    [
      "Retry có source + failed output + explicit error",
      "Retry with source, failed output and explicit error"
    ],
    [
      "Có dữ liệu nhưng đọc sai thì retry",
      "Retry when source evidence was misread"
    ],
    [
      "Thiếu dữ liệu thật thì null/human escalation",
      "Absent evidence requires null or human escalation"
    ],
    [
      "stated_total, calculated_total, conflict flags",
      "Stated/calculated totals and conflict flags"
    ]
  ],
  "4.5": [
    [
      "Batch discount 50% và window tối đa 24 giờ theo nguồn",
      "Guide's 50% discount and up to 24-hour window"
    ],
    [
      "Blocking sync vs latency-tolerant batch",
      "Blocking synchronous versus delayed batch"
    ],
    [
      "custom_id map output theo document",
      "custom_id correlates results with documents"
    ],
    [
      "Retry failed/expired only",
      "Retry failed or expired items only"
    ],
    [
      "Client tool loops vs server tools caveat",
      "Client tool-loop versus server tool caveat"
    ]
  ],
  "4.6": [
    [
      "Self-review bias do shared decision history",
      "Self-review bias from shared decision history"
    ],
    [
      "Fresh reviewer instance tách generation context",
      "Fresh reviewer instance separates generation context"
    ],
    [
      "Local pass kiểm từng file",
      "Local pass reviews each file"
    ],
    [
      "Integration pass kiểm cross-file contracts",
      "Integration pass checks cross-file contracts"
    ],
    [
      "Confidence phải calibrated trước auto routing",
      "Confidence must be calibrated before automatic routing"
    ]
  ]
};
