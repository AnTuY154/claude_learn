import type { Domain2Content } from "../domain2-types";
export const lesson25:Record<"vi"|"en",Domain2Content> = {
  "vi": {
    "title": "Built-in Tools — Grep, Glob, Read, Write, Edit và Bash",
    "subtitle": "Tìm đúng file, lần theo các lời gọi gián tiếp và refactor với lượng context tối thiểu.",
    "bridge": "Lesson 2.4 cho phép Claude Code kết nối thêm MCP tools. Nhưng trước khi xây search tool riêng, bạn cần hiểu công cụ có sẵn và khi nào dùng từng cái cho codebase Next.js.",
    "scenarioTitle": "Đổi tên processLegacyOrder nhưng ba nơi sử dụng bị bỏ sót",
    "scenario": "Trong dự án React, processLegacyOrder() được export trực tiếp ở orders.ts, đồng thời barrel utils/index.ts export lại dưới tên submitOrder. Hai caller gọi processLegacyOrder, ba caller khác dùng submitOrder. Tìm đúng chuỗi gốc bằng Grep chỉ phát hiện một phần các nơi cần sửa.",
    "sections": [
      {
        "title": "1. Sáu built-in tools và mục đích",
        "explanation": [
          "Guide tập trung sáu công cụ Claude Code: Read để xem nội dung file, Write để ghi file mới/ghi lại toàn file, Edit để thay đổi đoạn văn bản cụ thể, Bash để chạy lệnh shell, Grep để tìm chuỗi trong nội dung, Glob để tìm đường dẫn file theo pattern.",
          "Tên và quyền có thể thay đổi giữa môi trường Agent SDK, Claude Code và host. Đây là bộ công cụ Claude Code trong bài học, không phải sáu endpoint Claude Messages API. Claude có thể kết hợp theo chuỗi để khảo sát code an toàn."
        ],
        "code": "// Khi làm việc với Claude Code, yêu cầu dưới đây là Ý ĐỊNH,\n// không phải lời gọi JavaScript đến sáu methods SDK:\n// 'Find every file containing processLegacyOrder and related tests.'\n// → Grep(content) → Glob(paths) → Read(relevant files)",
        "keyPoint": "Phân biệt công cụ thao tác file, tìm text, tìm path và chạy shell."
      },
      {
        "title": "2. Grep tìm NỘI DUNG; Glob tìm TÊN hoặc ĐƯỜNG DẪN",
        "explanation": [
          "Grep dùng tìm function calls, import statements, error strings, class names hay nội dung regex. Nếu hỏi 'file nào gọi processLegacyOrder()' thì phải dùng Grep; tên file không chứa tên hàm.",
          "Glob dùng pattern đường dẫn như **/*.test.tsx, app/**/page.tsx, **/config.*. Nếu hỏi 'mọi test file .test.tsx' thì dùng Glob; không phải Grep. Kết hợp đúng sẽ giảm việc đọc file không liên quan."
        ],
        "code": "// Grep content: tìm chỗ nhắc đến function\nconst grepPattern='processLegacyOrder';\n\n// Glob paths: tìm test files theo naming convention\nconst globPattern='**/*.test.tsx';\n\n// Sai: Glob('**/*processLegacyOrder*') để tìm callers\n// Sai: Grep('test.tsx') để tìm files chỉ dựa vào phần mở rộng",
        "keyPoint": "Một câu cần học thuộc khi thi: Grep = bên TRONG files, Glob = TÊN/PATH files."
      },
      {
        "title": "3. Incremental codebase understanding",
        "explanation": [
          "Không nên Read toàn bộ 200 file upfront vì lãng phí context window và khó tập trung. Bắt đầu từ function/error mà task nhắc đến, dùng Grep tìm entry point, rồi Read các file liên quan để hiểu imports, exports và luồng dữ liệu.",
          "Sau khi thấy wrapper hoặc alias, Grep lại theo tên mới để mở rộng có kiểm soát. Chỉ Read file có lý do dựa trên dấu vết trước đó. Kỹ thuật này gắn với Lesson 1.6 về targeted decomposition và Lesson 1.7 về re-analysis file thay đổi."
        ],
        "code": "// Quy trình khám phá tăng dần\nconst steps=[\n  'Grep processLegacyOrder',\n  'Read orders.ts and matching callers',\n  'Read utils/index.ts (barrel export)',\n  'Grep submitOrder (alias)',\n  'Glob **/*.test.tsx for related tests',\n  'Read only the relevant tests'\n];",
        "keyPoint": "Search first → Read relevant → follow imports/wrappers → search aliases → inspect tests."
      },
      {
        "title": "4. Tracing wrapper và barrel file",
        "explanation": [
          "Giả sử orders.ts export processLegacyOrder, utils/index.ts re-export thành submitOrder. Grep chỉ chuỗi processLegacyOrder tìm definition, barrel và hai direct callers, nhưng có thể KHÔNG thấy ba nơi chỉ ghi submitOrder.",
          "Phải Read barrel để phát hiện tên export mới rồi Grep tiếp submitOrder. Nếu wrapper tên applyLegacyOrder gọi function cũ, cần Grep wrapper name để thấy indirect consumers và tests dù chúng không đề cập chuỗi gốc."
        ],
        "code": "// src/orders.ts\nexport function processLegacyOrder(id) { return {id}; }\n\n// src/utils/index.ts — barrel re-export alias\nexport { processLegacyOrder as submitOrder } from '../orders';\n\n// src/components/Checkout.tsx\nimport { submitOrder } from '../utils';\n// Grep('processLegacyOrder') sẽ KHÔNG match dòng import trên!",
        "keyPoint": "Một tên hàm có thể xuất hiện gián tiếp qua alias/barrel/wrapper; không dừng ở lần Grep đầu."
      },
      {
        "title": "5. Tìm test files cho các callers",
        "explanation": [
          "Guide đưa dạng câu hỏi: tìm mọi caller của function deprecated và những test file tương ứng. Trình tự: Grep function call để phát hiện source files; Glob file tests dựa trên tên caller; nếu có wrapper, Grep thêm tên wrapper và test gọi gián tiếp.",
          "Ví dụ Grep phát hiện OrderProcessor.tsx và RefundHandler.tsx; Glob **/OrderProcessor.test.* và **/RefundHandler.test.*. Test có thể import component thay vì trực tiếp import processLegacyOrder, nên không xuất hiện trong Grep ban đầu."
        ],
        "code": "// Grep: 'processLegacyOrder'\n// → OrderProcessor.tsx, RefundHandler.tsx, utils/index.ts\n\n// Glob: '**/OrderProcessor.test.*' và '**/RefundHandler.test.*'\n// → tìm tests theo path, kể cả không chứa function string\n\n// Grep thêm 'submitOrder'/'applyLegacyOrder' nếu đã thấy alias/wrapper.",
        "keyPoint": "Grep callers → Glob sibling tests → Grep wrapper names khi có indirect usage."
      },
      {
        "title": "6. Edit, Read + Write và trường hợp non-unique anchor",
        "explanation": [
          "Edit thay một đoạn text bằng old_string/new_string, tiết kiệm context và giảm phạm vi sửa. Nếu old_string xuất hiện ở nhiều nơi, Edit có thể từ chối vì không xác định vị trí duy nhất — đây là cơ chế an toàn.",
          "Guide thi thường chốt fallback là Read toàn file rồi Write phiên bản đã sửa khi Edit không tìm được unique anchor. Trong Claude Code hiện tại, thường nên thử mở rộng old_string bằng context xung quanh hoặc replace_all:true nếu THẬT SỰ muốn thay toàn bộ trước khi phải Read+Write. Phân biệt đáp án guide và best practice production."
        ],
        "code": "// Edit dùng unique old_string thay đúng vị trí\n// old_string: 'processLegacyOrder(orderId)'\n// new_string: 'processOrder(orderId, { validate: true })'\n\n// Nếu nhiều match: nới old_string bằng surrounding context.\n// Nếu cố ý sửa TẤT CẢ: replace_all:true sau khi review.\n// Nếu không xác định được: Read full file → Write full modified file.",
        "keyPoint": "Thi: Edit ưu tiên, Read+Write là fallback. Thực tế: widen anchor trước khi trả giá context của full-file rewrite."
      },
      {
        "title": "7. Bash khi nào phù hợp, khi nào không?",
        "explanation": [
          "Bash cho phép chạy npm test, git diff, scripts, lint và thao tác shell. Tuy nhiên nếu chỉ cần tìm nội dung/tên file, built-in Grep/Glob thường rõ scope, giảm lệnh phức tạp và dùng tool đúng mục đích.",
          "Sau Edit nên chạy tests và review git diff qua Bash nếu được cấp phép. Không dùng Bash để vượt qua permission của Read/Edit hay thực hiện script không đáng tin. Cẩn trọng side effects và môi trường chạy."
        ],
        "code": "// Ví dụ lệnh shell chỉ chạy KHI đã có quyền và phù hợp:\n// npm test\n// git diff -- src/orders.ts src/utils/index.ts\n// Không chạy rm -rf, script chưa được review hoặc tool để bypass gate.",
        "keyPoint": "Bash phù hợp verification/build, không phải lựa chọn thay thế mặc định cho Grep/Glob."
      }
    ],
    "table": {
      "headers": [
        "Yêu cầu",
        "Tool ưu tiên",
        "Vì sao"
      ],
      "rows": [
        [
          "File nào gọi submitOrder",
          "Grep",
          "Tên hàm nằm trong nội dung"
        ],
        [
          "Tìm mọi *.test.tsx",
          "Glob",
          "Tên/path pattern"
        ],
        [
          "Xem dòng import/export",
          "Read",
          "Cần nội dung liên quan"
        ],
        [
          "Đổi một đoạn code duy nhất",
          "Edit",
          "Targeted replacement"
        ],
        [
          "Edit báo non-unique",
          "Edit rộng hơn; sau đó Read+Write",
          "Thi guide: Read+Write fallback"
        ],
        [
          "Tạo/ghi lại cả file",
          "Write",
          "Whole-file write"
        ],
        [
          "Chạy tests hoặc git diff",
          "Bash",
          "Shell command"
        ]
      ]
    },
    "vocabulary": [
      [
        "Grep",
        "tìm chuỗi trong file",
        "Search contents for text/regex."
      ],
      [
        "Glob",
        "khớp đường dẫn file",
        "Search path/name patterns such as **/*.test.tsx."
      ],
      [
        "Read",
        "đọc file",
        "Load file content for analysis."
      ],
      [
        "Edit",
        "sửa đoạn text",
        "Targeted old_string/new_string replacement."
      ],
      [
        "Write",
        "ghi file",
        "Write complete file contents."
      ],
      [
        "Bash",
        "chạy shell",
        "Execute commands with appropriate permissions."
      ],
      [
        "Incremental Discovery",
        "khám phá tăng dần",
        "Search and open only necessary code."
      ],
      [
        "Barrel File",
        "file re-export tập trung",
        "index.ts exposing module exports under possibly different names."
      ],
      [
        "Wrapper",
        "hàm/lớp bao",
        "An abstraction that calls another function."
      ],
      [
        "Non-unique Anchor",
        "chuỗi neo không duy nhất",
        "old_string matches more than one location."
      ],
      [
        "Context Budget",
        "ngân sách ngữ cảnh",
        "Amount of file/text content sent into model context."
      ]
    ],
    "summary": [
      "Grep tìm trong file; Glob tìm tên và path files.",
      "Read dùng sau khi tìm vị trí cần thiết, không đọc hết dự án upfront.",
      "Theo dõi wrapper, alias và barrel export bằng vòng Grep → Read → Grep.",
      "Tìm callers bằng Grep, sibling tests bằng Glob.",
      "Edit là lựa chọn đầu; guide dùng Read+Write khi anchor không duy nhất, real-world nên widen anchor trước.",
      "Bash dùng chạy test/diff có kiểm soát, không bypass permissions."
    ],
    "quiz": [
      {
        "question": "Tìm file nào gọi processLegacyOrder() bằng tool nào?",
        "choices": [
          "Glob",
          "Grep",
          "Write",
          "Bash bắt buộc"
        ],
        "correct": 1,
        "explanation": "Tên hàm xuất hiện trong file contents; Grep dành cho content search."
      },
      {
        "question": "Tìm tất cả file **/*.test.tsx bằng tool nào?",
        "choices": [
          "Grep",
          "Glob",
          "Read",
          "Edit"
        ],
        "correct": 1,
        "explanation": "Pattern đường dẫn thuộc Glob."
      },
      {
        "question": "Tại sao Grep processLegacyOrder có thể bỏ sót caller sử dụng submitOrder?",
        "choices": [
          "Grep bị giới hạn 2 files",
          "Có alias/barrel re-export",
          "Do TypeScript lỗi",
          "Vì tool_choice:auto"
        ],
        "correct": 1,
        "explanation": "Consumer chỉ chứa chuỗi submitOrder nên Grep tên gốc không match."
      },
      {
        "question": "Trình tự tìm deprecated function và tests thích hợp?",
        "choices": [
          "Read mọi file",
          "Glob trước tên hàm",
          "Grep callers → Glob tests → follow aliases",
          "Write tests trước"
        ],
        "correct": 2,
        "explanation": "Đúng purpose search: content trước, path test sau, alias/wrapper sau khi phát hiện."
      },
      {
        "question": "Nên Read 200 file trước khi biết bug ở đâu?",
        "choices": [
          "Có",
          "Không, nên incremental discovery",
          "Bắt buộc do MCP",
          "Chỉ với Bash"
        ],
        "correct": 1,
        "explanation": "Read ồ ạt tốn context và nhiễu; dùng Grep/Glob khám phá hẹp."
      },
      {
        "question": "Edit old_string xuất hiện 3 nơi và bạn chỉ muốn sửa một. Hành động thực tế đầu tiên?",
        "choices": [
          "replace_all:true ngay",
          "Mở rộng anchor cho duy nhất",
          "Xóa file",
          "Chạy npm build"
        ],
        "correct": 1,
        "explanation": "Widen old_string với surrounding context giúp Edit đúng chỗ; fallback Read+Write khi không giải quyết được."
      },
      {
        "question": "Nếu đề thi hỏi fallback trong guide khi Edit không tìm unique anchor?",
        "choices": [
          "Bash rm",
          "Read rồi Write full file",
          "Grep toàn disk",
          "Không được sửa"
        ],
        "correct": 1,
        "explanation": "Guide dùng Read+Write làm fallback; phân biệt với ưu tiên widen anchor trong thực tế."
      },
      {
        "question": "Bạn muốn xác minh code sau khi sửa, tool nào phù hợp chạy npm test?",
        "choices": [
          "Glob",
          "Write",
          "Bash",
          "Grep"
        ],
        "correct": 2,
        "explanation": "Bash thực thi lệnh test có kiểm soát, trong khi Grep/Glob chỉ tìm kiếm."
      }
    ],
    "lab": {
      "title": "Trace và refactor function deprecated bằng built-in tools",
      "duration": "30 phút",
      "goal": "Tạo repo demo có direct caller, barrel alias và tests; dùng Grep/Glob/Read/Edit theo đúng thứ tự, sau đó kiểm chứng bằng tests.",
      "steps": [
        {
          "title": "Grep tất cả call sites",
          "instruction": "Dùng Claude Code với Grep tìm processLegacyOrder trong fixture, ghi file/dòng match.",
          "why": "Tìm trực tiếp nội dung thay vì đoán tên file.",
          "expected": "Definition, direct callers và barrel export xuất hiện."
        },
        {
          "title": "Glob tests của callers",
          "instruction": "Dùng Glob patterns **/*.test.tsx và các sibling names.",
          "why": "Tìm test theo path không nhất thiết chứa tên hàm.",
          "expected": "Test files của callers được phát hiện."
        },
        {
          "title": "Read callers và phát hiện alias",
          "instruction": "Đọc imports/exports, thấy submitOrder trong barrel rồi Grep theo alias.",
          "why": "Không bỏ sót indirect consumers.",
          "expected": "Tìm cả các caller không chứa processLegacyOrder."
        },
        {
          "title": "Edit targeted call sites",
          "instruction": "Dùng Edit cho từng nơi cần sửa, widen anchor nếu trùng, chỉ Read+Write làm fallback.",
          "why": "Giảm context và tránh sửa nhầm.",
          "expected": "Các call sites được chuyển sang API mới mà không phá code."
        },
        {
          "title": "Chạy tests và diff",
          "instruction": "Dùng Bash chạy node --test/npm test và git diff, ghi các file đã đổi.",
          "why": "Xác minh correctness bằng output thật.",
          "expected": "Không còn deprecated calls, tests pass nếu đã migrate đúng."
        }
      ],
      "commands": "npm run lab:domain2 -- 5\n# Mở workspace demo với Claude Code:\ncd domain2-builtins-workspace\nclaude",
      "source": "scripts/domain2-labs.mjs",
      "disclaimer": "Script tạo fixture local và không tự chạy Claude/không lấy key. Việc Grep/Glob/Edit và test là nhiệm vụ thực hành thật của người học."
    }
  },
  "en": {
    "title": "Built-in Tools — Grep, Glob, Read, Write, Edit and Bash",
    "subtitle": "Find call sites, trace indirect aliases, and refactor with minimal context usage.",
    "bridge": "Task 2.4 adds MCP tools. Task 2.5 explains when Claude Code's built-in file/search tools already do the job.",
    "scenarioTitle": "A refactor misses three callers behind a barrel export",
    "scenario": "processLegacyOrder is exported from orders.ts and re-exported as submitOrder from utils/index.ts. Two consumers use the original name, while three use the alias. Searching only for processLegacyOrder misses those three indirect consumers.",
    "sections": [
      {
        "title": "1. Six tools and their responsibilities",
        "explanation": [
          "Read opens files, Write writes full file contents, Edit makes targeted replacements, Bash runs commands, Grep searches file contents, and Glob matches file paths.",
          "These are Claude Code tool capabilities, not six Anthropic Messages API HTTP endpoints."
        ],
        "code": "// Khi làm việc với Claude Code, yêu cầu dưới đây là Ý ĐỊNH,\n// không phải lời gọi JavaScript đến sáu methods SDK:\n// 'Find every file containing processLegacyOrder and related tests.'\n// → Grep(content) → Glob(paths) → Read(relevant files)",
        "keyPoint": "Choose content search, path search, file modification or shell execution deliberately."
      },
      {
        "title": "2. Grep is CONTENT; Glob is PATH",
        "explanation": [
          "Grep searches function calls, imports, error messages or any matching text inside files.",
          "Glob finds files by extension, name or directory patterns such as **/*.test.tsx or app/**/page.tsx. Using Glob to find call sites is a category error."
        ],
        "code": "// Grep content: tìm chỗ nhắc đến function\nconst grepPattern='processLegacyOrder';\n\n// Glob paths: tìm test files theo naming convention\nconst globPattern='**/*.test.tsx';\n\n// Sai: Glob('**/*processLegacyOrder*') để tìm callers\n// Sai: Grep('test.tsx') để tìm files chỉ dựa vào phần mở rộng",
        "keyPoint": "Remember: Grep searches inside files; Glob finds paths."
      },
      {
        "title": "3. Understand codebases incrementally",
        "explanation": [
          "Do not Read hundreds of files upfront. Start with a narrow Grep to locate entry points, then Read relevant imports/exports.",
          "Search again for wrappers or aliases uncovered by those reads. Each new file read should be justified by evidence."
        ],
        "code": "// Quy trình khám phá tăng dần\nconst steps=[\n  'Grep processLegacyOrder',\n  'Read orders.ts and matching callers',\n  'Read utils/index.ts (barrel export)',\n  'Grep submitOrder (alias)',\n  'Glob **/*.test.tsx for related tests',\n  'Read only the relevant tests'\n];",
        "keyPoint": "Grep → Read → trace dependencies/aliases → Grep again."
      },
      {
        "title": "4. Wrapper functions and barrel exports hide consumers",
        "explanation": [
          "A barrel can re-export a function under a new name. Grep for the original function finds the re-export but cannot match consumers referencing only the alias.",
          "Read the barrel to discover submitOrder, then Grep for submitOrder and wrapper names to recover hidden call sites."
        ],
        "code": "// src/orders.ts\nexport function processLegacyOrder(id) { return {id}; }\n\n// src/utils/index.ts — barrel re-export alias\nexport { processLegacyOrder as submitOrder } from '../orders';\n\n// src/components/Checkout.tsx\nimport { submitOrder } from '../utils';\n// Grep('processLegacyOrder') sẽ KHÔNG match dòng import trên!",
        "keyPoint": "One grep pass is not enough across renamed exports."
      },
      {
        "title": "5. Use Glob to find adjacent tests",
        "explanation": [
          "Grep for deprecated calls to locate source callers. Glob for nearby *.test.tsx files by path. Grep wrapper names if tests exercise the call indirectly.",
          "A component test can import its component without ever mentioning the deprecated function string."
        ],
        "code": "// Grep: 'processLegacyOrder'\n// → OrderProcessor.tsx, RefundHandler.tsx, utils/index.ts\n\n// Glob: '**/OrderProcessor.test.*' và '**/RefundHandler.test.*'\n// → tìm tests theo path, kể cả không chứa function string\n\n// Grep thêm 'submitOrder'/'applyLegacyOrder' nếu đã thấy alias/wrapper.",
        "keyPoint": "Content search for callers, filename matching for tests, then alias tracing."
      },
      {
        "title": "6. Edit, non-unique anchors and Write",
        "explanation": [
          "Edit performs precise string replacement. If old_string is not unique, the operation may reject the ambiguous change for safety.",
          "The exam guide gives Read + Write as the fallback. In current Claude Code, widening old_string or deliberately using replace_all can often avoid a full rewrite; use Read+Write when needed."
        ],
        "code": "// Edit dùng unique old_string thay đúng vị trí\n// old_string: 'processLegacyOrder(orderId)'\n// new_string: 'processOrder(orderId, { validate: true })'\n\n// Nếu nhiều match: nới old_string bằng surrounding context.\n// Nếu cố ý sửa TẤT CẢ: replace_all:true sau khi review.\n// Nếu không xác định được: Read full file → Write full modified file.",
        "keyPoint": "Edit first; widen ambiguous anchors; Read+Write is the documented fallback."
      },
      {
        "title": "7. Use Bash for validation",
        "explanation": [
          "Bash is useful for npm test, git diff and controlled scripts rather than replacing Grep/Glob for routine discovery.",
          "Respect tool permissions and review side effects before executing shell commands."
        ],
        "code": "// Ví dụ lệnh shell chỉ chạy KHI đã có quyền và phù hợp:\n// npm test\n// git diff -- src/orders.ts src/utils/index.ts\n// Không chạy rm -rf, script chưa được review hoặc tool để bypass gate.",
        "keyPoint": "Use shell verification intentionally, not to bypass a blocked operation."
      }
    ],
    "table": {
      "headers": [
        "Task",
        "Preferred tool",
        "Reason"
      ],
      "rows": [
        [
          "Find submitOrder callers",
          "Grep",
          "File contents"
        ],
        [
          "Find all *.test.tsx",
          "Glob",
          "Path pattern"
        ],
        [
          "Inspect imports/exports",
          "Read",
          "Need source context"
        ],
        [
          "Change one unique expression",
          "Edit",
          "Targeted replacement"
        ],
        [
          "Non-unique Edit anchor",
          "Widen; then Read+Write",
          "Exam fallback is Read+Write"
        ],
        [
          "Write full file",
          "Write",
          "Whole-file operation"
        ],
        [
          "Run npm test / git diff",
          "Bash",
          "Shell execution"
        ]
      ]
    },
    "vocabulary": [
      [
        "Grep",
        "tìm chuỗi trong file",
        "Search contents for text/regex."
      ],
      [
        "Glob",
        "khớp đường dẫn file",
        "Search path/name patterns such as **/*.test.tsx."
      ],
      [
        "Read",
        "đọc file",
        "Load file content for analysis."
      ],
      [
        "Edit",
        "sửa đoạn text",
        "Targeted old_string/new_string replacement."
      ],
      [
        "Write",
        "ghi file",
        "Write complete file contents."
      ],
      [
        "Bash",
        "chạy shell",
        "Execute commands with appropriate permissions."
      ],
      [
        "Incremental Discovery",
        "khám phá tăng dần",
        "Search and open only necessary code."
      ],
      [
        "Barrel File",
        "file re-export tập trung",
        "index.ts exposing module exports under possibly different names."
      ],
      [
        "Wrapper",
        "hàm/lớp bao",
        "An abstraction that calls another function."
      ],
      [
        "Non-unique Anchor",
        "chuỗi neo không duy nhất",
        "old_string matches more than one location."
      ],
      [
        "Context Budget",
        "ngân sách ngữ cảnh",
        "Amount of file/text content sent into model context."
      ]
    ],
    "summary": [
      "Grep searches contents; Glob matches paths.",
      "Use Read incrementally instead of loading every file.",
      "Track aliases/wrappers and barrel exports via iterative search.",
      "Grep callers, Glob adjacent tests.",
      "Edit first; distinguish the exam's Read+Write fallback from widening anchors in current practice.",
      "Bash is for intentional command execution and verification."
    ],
    "quiz": [
      {
        "question": "Find files that call processLegacyOrder. Which tool?",
        "choices": [
          "Glob",
          "Grep",
          "Write",
          "Only Bash"
        ],
        "correct": 1,
        "explanation": "Function references are file contents, so Grep is correct."
      },
      {
        "question": "Find **/*.test.tsx paths. Which tool?",
        "choices": [
          "Grep",
          "Glob",
          "Read",
          "Edit"
        ],
        "correct": 1,
        "explanation": "Filename patterns belong to Glob."
      },
      {
        "question": "Why can searching processLegacyOrder miss consumers of submitOrder?",
        "choices": [
          "Grep only searches two files",
          "Barrel alias re-export",
          "TypeScript failure",
          "tool_choice:auto"
        ],
        "correct": 1,
        "explanation": "Consumers using submitOrder do not contain the original function string."
      },
      {
        "question": "What's the correct caller-and-test discovery sequence?",
        "choices": [
          "Read every file",
          "Glob by function name",
          "Grep callers → Glob tests → trace aliases",
          "Write tests first"
        ],
        "correct": 2,
        "explanation": "Content discovery, then test path matching, then indirect aliases."
      },
      {
        "question": "Should you Read all 200 files upfront?",
        "choices": [
          "Yes",
          "No, incremental discovery",
          "Required by MCP",
          "Only Bash"
        ],
        "correct": 1,
        "explanation": "Loading all files wastes context budget."
      },
      {
        "question": "Edit's old_string matches three places, but you need one. First practical step?",
        "choices": [
          "replace_all immediately",
          "Widen anchor",
          "Delete file",
          "Run npm build"
        ],
        "correct": 1,
        "explanation": "Use more surrounding context to make a unique targeted edit."
      },
      {
        "question": "What is the guide's exam fallback for non-unique Edit anchors?",
        "choices": [
          "Bash rm",
          "Read then Write entire file",
          "Grep everything",
          "Cannot edit"
        ],
        "correct": 1,
        "explanation": "The guide specifies Read+Write as fallback; current practice can widen anchors first."
      },
      {
        "question": "Which tool runs npm test?",
        "choices": [
          "Glob",
          "Write",
          "Bash",
          "Grep"
        ],
        "correct": 2,
        "explanation": "Bash executes controlled test commands."
      }
    ],
    "lab": {
      "title": "Trace and refactor a deprecated function with built-in tools",
      "duration": "30 minutes",
      "goal": "Use a controlled fixture with direct calls, barrel aliases and tests; perform Grep/Glob/Read/Edit in the right order.",
      "steps": [
        {
          "title": "Grep direct call sites",
          "instruction": "Search the fixture for processLegacyOrder.",
          "why": "Find content references.",
          "expected": "Function, direct callers and barrel are found."
        },
        {
          "title": "Glob relevant test paths",
          "instruction": "Match sibling test filenames via path patterns.",
          "why": "Tests may not mention the deprecated function.",
          "expected": "Related tests located."
        },
        {
          "title": "Read and trace aliases",
          "instruction": "Inspect imports/exports and grep submitOrder.",
          "why": "Find indirect consumers.",
          "expected": "Aliased call sites found."
        },
        {
          "title": "Edit callers",
          "instruction": "Use targeted replacements; widen non-unique anchors as needed.",
          "why": "Minimise accidental rewrites.",
          "expected": "No old call sites remain."
        },
        {
          "title": "Run tests and diff",
          "instruction": "Use Bash to verify changes.",
          "why": "Check actual outcomes.",
          "expected": "Tests pass when refactor is complete."
        }
      ],
      "commands": "npm run lab:domain2 -- 5\n# Mở workspace demo với Claude Code:\ncd domain2-builtins-workspace\nclaude",
      "source": "scripts/domain2-labs.mjs",
      "disclaimer": "The local fixture generator does not run Claude or require API credentials. Tool execution is the learner's hands-on step."
    }
  }
};
