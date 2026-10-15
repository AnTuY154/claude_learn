import type { Domain2Content } from "../domain2-types";
export const lesson23:Record<"vi"|"en",Domain2Content> = {
  "vi": {
    "title": "Tool Distribution & Tool Choice — Phân phối và lựa chọn công cụ",
    "subtitle": "Khi nào sửa description, khi nào tách agent, khi nào gộp 19 tools và dùng tool_choice nào cho pipeline?",
    "bridge": "Lesson 2.1: toolkit nhỏ nhưng mô tả giống nhau → sửa description. Lesson 2.3: nếu một agent phải chọn giữa 18–22 tools thì vấn đề có thể là decision complexity, không còn chỉ là câu chữ.",
    "scenarioTitle": "Một agent được cấp 22 công cụ và thường chọn sai",
    "scenario": "Nền tảng phân tích dữ liệu có 3 query tools và 19 transformation tools. Team cho Synthesis Agent cả 22 tool. Nó mất thời gian chọn giữa pivot_table, calculate_percentile, normalize_currency... và đôi khi dùng sai. Tách thành agent chuyển đổi với 19 tools vẫn giữ nguyên lỗi.",
    "sections": [
      {
        "title": "1. Tool overload là bài toán kiến trúc",
        "explanation": [
          "Khi agent có quá nhiều tools, tập lựa chọn lớn làm tăng độ khó chọn đúng công cụ. Guide nêu 4–5 tools/agent như heuristic ôn thi, không phải giới hạn cứng của SDK hay chân lý mọi model. Tool được cấp phải gắn trực tiếp với vai trò.",
          "Web Research cần search_web, fetch_page, extract_links; Document Analysis cần extract_metadata, verify_claim; Synthesis ưu tiên compile_report, assess_coverage. Không cấp web_search cho Synthesis nếu nhiệm vụ chỉ dùng findings được bàn giao."
        ],
        "code": "const roles = {\n  web: ['search_web','fetch_page','extract_links','save_snippet'],\n  document: ['extract_metadata','extract_data_points','summarize_content','verify_claim'],\n  synthesis: ['compile_report','format_citation','assess_coverage','verify_fact']\n};\n// Đây là công cụ giả định theo vai trò, KHÔNG tự động đăng ký SDK.",
        "keyPoint": "4–5 tools theo vai trò là guideline trong bài thi, không phải giới hạn kỹ thuật áp dụng mọi nơi."
      },
      {
        "title": "2. Scope theo role hay consolidate?",
        "explanation": [
          "Nếu 22 công cụ làm nhiều loại việc khác nhau (truy vấn, xuất báo cáo, xử lý tài liệu), scope chúng theo specialist. Nhưng nếu 19 tools là các biến thể của cùng một operation 'dataset → transform → result', hãy gộp vào một transform_data có enum transform_type.",
          "Tool consolidation giảm số lựa chọn ở cấp tool mà vẫn cho phép model chọn phép biến đổi ở cấp tham số. Đừng gộp công cụ có business authorization hoặc side effects không giống nhau vào cùng handler chỉ để tối ưu số lượng."
        ],
        "code": "const transformData = {\n  name: 'transform_data',\n  description: 'Transform dataset using the selected transform_type.',\n  input_schema: {type:'object',properties:{\n    dataset:{type:'string'},\n    transform_type:{type:'string',enum:['pivot','percentile','normalise_currency']},\n    options:{type:'object'}\n  },required:['dataset','transform_type']}\n};",
        "keyPoint": "Khác vai trò → distribute; cùng hình dạng/nhiệm vụ → parameterize/consolidate. Đếm số tools được model nhìn thấy."
      },
      {
        "title": "3. Tại sao đổi số MCP server không giải quyết overload?",
        "explanation": [
          "Một app kết nối hai MCP server, mỗi server có 11 công cụ. Nếu client nạp cả 22 tool vào cùng context model, model vẫn thấy 22 lựa chọn. Di chuyển một nửa sang server khác chỉ đổi chỗ chứa, không giảm decision complexity.",
          "Giải pháp đúng phải là giới hạn tools được đưa cho từng agent/turn, thay đổi contract hoặc thiết kế lại role. Server boundary không mặc nhiên là role boundary."
        ],
        "code": "// SAI: chia endpoint nhưng vẫn lộ 22 tools cho một agent\nconst exposed = [...serverA.listTools(), ...serverB.listTools()];\n\n// ĐÚNG: lọc theo role/capability trước khi model thấy tool list\nconst synthesisTools = exposed.filter(t =>\n  ['compile_report','assess_coverage','verify_fact'].includes(t.name)\n );",
        "keyPoint": "Chia tools qua nhiều server không đồng nghĩa model được giảm số lựa chọn."
      },
      {
        "title": "4. tool_choice: auto, any và forced tool",
        "explanation": [
          "tool_choice:auto (mặc định) cho model quyết định trả text hay gọi tool. tool_choice:any ép model gọi ít nhất một tool nhưng cho chọn tool nào. tool_choice:{type:'tool',name:'extract_metadata'} ép gọi một công cụ cụ thể ở lượt đó.",
          "Với document pipeline phải extract_metadata đầu tiên, forced selection bảo đảm model phát ra lời gọi đó trong lượt API có cấu hình tương ứng; tuy nhiên backend vẫn phải xử lý tool call và kiểm soát quyền. Lượt tiếp theo có thể chuyển auto. Kiểm tra khả năng tương thích theo model/API mới."
        ],
        "code": "// Request 1: bắt đầu bằng metadata extraction\nconst firstChoice={type:'tool',name:'extract_metadata'};\n\n// Request tiếp theo: model quyết định các bước còn lại\nconst laterChoice={type:'auto'};\n\n// Bắt buộc CÓ tool nhưng cho model tự chọn tool\nconst structuredChoice={type:'any'};",
        "keyPoint": "auto = may call; any = must call one; named tool = must select a specified tool. Không đồng nhất forced choice với an toàn thực thi."
      },
      {
        "title": "5. Scoped cross-role tool giảm round trips",
        "explanation": [
          "Giả sử 85% câu hỏi xác minh của Synthesis chỉ là lookup đơn giản. Chuyển mọi lần kiểm tra qua Coordinator → Search Agent → Coordinator làm tăng round trips và latency. Có thể cấp một verify_fact đã giới hạn phạm vi cho Synthesis để tra một nguồn được phép.",
          "Các truy vấn phức tạp cần nhiều nguồn hoặc đánh giá vẫn đưa về Coordinator. Scoped cross-role tool không có quyền ngang bản search_web chung; nó phải validate nguồn, input, timeout và scope."
        ],
        "code": "function verifyFactSingleSource({sourceId,claim}) {\n  if (!ALLOWED_SOURCE_IDS.has(sourceId))\n    return {isError:true,error:'SOURCE_NOT_ALLOWED'};\n  // Demo: chỉ kiểm tra từ kho dữ liệu đã được phép truy cập\n  return {status:'NEEDS_EVIDENCE',sourceId,claim};\n}",
        "keyPoint": "High-frequency simple lookup → scoped direct access; complex verification → coordinator. Backend enforce scope thật."
      },
      {
        "title": "6. Least privilege: constrained load_document thay fetch_url",
        "explanation": [
          "Tool fetch_url có thể mở URL bất kỳ, không phù hợp một specialist chỉ nên đọc tài liệu thuộc kho nội bộ. Thay bằng load_document chỉ chấp nhận hostname/path được phép để hạn chế phạm vi truy cập.",
          "Không chỉ check .pdf hoặc startsWith với string tùy tiện. Server phải parse URL, kiểm tra scheme/host allowlist, xử lý redirects và chặn SSRF/private networks nếu có truy xuất mạng. Mô tả tool giúp model chọn, handler enforce ranh giới thật."
        ],
        "code": "function allowedDocumentUrl(raw){\n  const u=new URL(raw);\n  return u.protocol==='https:' && u.hostname==='docs.example.test'\n    && u.pathname.startsWith('/approved/');\n}\n// DEMO kiểm tra URL; production còn phải chặn redirects/SSRF.",
        "keyPoint": "Least privilege áp dụng ở tool capabilities và backend; giới hạn role không chỉ bằng prompt."
      }
    ],
    "table": {
      "headers": [
        "Tình huống",
        "Nguyên nhân",
        "Giải pháp"
      ],
      "rows": [
        [
          "5 tool, hai mô tả giống nhau",
          "Ambiguous descriptions",
          "Viết lại description — 2.1"
        ],
        [
          "22 tools khác vai trò",
          "Role overload",
          "Scope toolsets theo specialist"
        ],
        [
          "19 transformations gần nhau",
          "Duplicate capabilities",
          "Gộp transform_data + enum"
        ],
        [
          "Muốn luôn gọi một tool",
          "Mandatory selection",
          "tool_choice:any"
        ],
        [
          "Muốn extract_metadata đầu tiên",
          "Mandatory specific tool",
          "tool_choice named tool"
        ],
        [
          "Verify đơn giản qua coordinator tốn thời gian",
          "Unnecessary round trips",
          "Scoped verify_fact"
        ]
      ]
    },
    "vocabulary": [
      [
        "Tool Overload",
        "quá nhiều công cụ",
        "Selection complexity khi model có nhiều lựa chọn."
      ],
      [
        "Tool Distribution",
        "phân phối công cụ",
        "Chia tool cho agent có trách nhiệm phù hợp."
      ],
      [
        "Consolidation",
        "gộp công cụ",
        "Gộp các variants giống contract thành parameterized tool."
      ],
      [
        "Parameterised Tool",
        "công cụ có tham số lựa chọn",
        "Dùng enum để chọn phép toán thay vì nhiều tools gần trùng."
      ],
      [
        "tool_choice",
        "cấu hình lựa chọn tool",
        "Cơ chế API xác định model có cần gọi tool."
      ],
      [
        "Scoped Cross-role Tool",
        "công cụ liên vai trò có giới hạn",
        "Cho phép thao tác đơn giản mà không cấp quyền quá rộng."
      ],
      [
        "Least Privilege",
        "đặc quyền tối thiểu",
        "Chỉ cấp quyền đúng phạm vi công việc."
      ],
      [
        "Round Trip",
        "vòng gọi đi-về",
        "Chi phí thời gian điều phối qua coordinator."
      ],
      [
        "SSRF",
        "yêu cầu truy cập server nội bộ trái phép",
        "Rủi ro khi fetch URL không bị kiểm soát."
      ]
    ],
    "summary": [
      "Toolkit lớn làm tăng decision complexity; 4–5 tools/role là heuristic của guide.",
      "Có vài tool mô tả giống nhau thì sửa descriptions; nhiều tool thì scope hoặc consolidate.",
      "Gộp tool cùng dạng qua enum, không gộp bừa side effects không tương đương.",
      "tool_choice auto/any/forced giải quyết ba nhu cầu khác nhau.",
      "Scoped verify_fact giúp giảm coordinator round trips cho tác vụ đơn giản.",
      "Giới hạn khả năng thực thi của tool là phần của least privilege; không dựa vào model tự giác."
    ],
    "quiz": [
      {
        "question": "Một agent được cấp 18 công cụ, chọn nhầm liên tục. Cần chẩn đoán gì trước?",
        "choices": [
          "Prompt thiếu ví dụ",
          "Tool overload",
          "Timeout",
          "Token price"
        ],
        "correct": 1,
        "explanation": "Số lượng lựa chọn tăng decision complexity; scope theo role hoặc consolidate trước khi chỉ sửa từng description."
      },
      {
        "question": "19 công cụ đều là phép biến đổi dataset chung contract. Cách giảm overload?",
        "choices": [
          "Thêm 19 agents",
          "Gộp thành transform_data + enum",
          "Tăng 30 mô tả",
          "Chia ra 19 MCP servers"
        ],
        "correct": 1,
        "explanation": "Parameterized consolidation giảm number of tools; vẫn giữ các phép biến đổi qua enum."
      },
      {
        "question": "Chia 22 tools ra hai MCP servers, một agent vẫn thấy 22. Vì sao?",
        "choices": [
          "MCP không hỗ trợ nhiều servers",
          "Server boundary không giảm exposed tool list",
          "Chưa có API key",
          "Vì Glob"
        ],
        "correct": 1,
        "explanation": "Client có thể cung cấp toàn bộ tool list của mọi server cho model như một danh sách chung."
      },
      {
        "question": "tool_choice:any bảo đảm gì?",
        "choices": [
          "Một tool cụ thể",
          "Model gọi tool nào đó",
          "Không gọi tool",
          "Backend cấp quyền"
        ],
        "correct": 1,
        "explanation": "any bắt buộc tool use nhưng để model chọn công cụ trong tập."
      },
      {
        "question": "Muốn lượt đầu bắt buộc gọi extract_metadata. Dùng gì?",
        "choices": [
          "auto",
          "any",
          "{type:'tool',name:'extract_metadata'}",
          "Không tool_choice"
        ],
        "correct": 2,
        "explanation": "Named tool choice bảo đảm lựa chọn tool được chỉ định ở lượt API đó."
      },
      {
        "question": "85% verification đơn giản qua coordinator làm chậm. Cách tốt?",
        "choices": [
          "Bỏ fact-check",
          "Scoped verify_fact cho synthesis",
          "Cấp unrestricted fetch_url",
          "Bắt model trả lời không evidence"
        ],
        "correct": 1,
        "explanation": "Direct scoped lookup giảm round trips, vẫn giữ complex verification ở coordinator."
      },
      {
        "question": "Một document agent chỉ được đọc tài liệu đã duyệt. Tool nên là?",
        "choices": [
          "fetch_url không giới hạn",
          "load_document có allowlist",
          "Bash mọi quyền",
          "write_all_files"
        ],
        "correct": 1,
        "explanation": "Constrained tool giới hạn khả năng và nên enforce URL/domain thật ở backend."
      },
      {
        "question": "4–5 tools/agent là gì?",
        "choices": [
          "Hard SDK limit",
          "Guideline tối ưu trong bối cảnh guide",
          "MCP bắt buộc",
          "Điều kiện JSON Schema"
        ],
        "correct": 1,
        "explanation": "Heuristic ôn thi, không phải trần kỹ thuật bất biến."
      }
    ],
    "lab": {
      "title": "Phân phối tools cho Web/Document/Synthesis Agents",
      "duration": "45 phút",
      "goal": "Định nghĩa ba agent roles 4–5 tools, thêm scoped verify_fact, forced extract_metadata và constrained load_document.",
      "steps": [
        {
          "title": "Thiết kế ba role-specific toolsets",
          "instruction": "Tạo config Web, Document, Synthesis với công cụ phù hợp, tránh lộ quyền ngoài scope.",
          "why": "Giảm decision complexity và cross-role misuse.",
          "expected": "Mỗi role có 4–5 tools liên quan; không có tool generic nguy hiểm."
        },
        {
          "title": "Thêm scoped verify_fact",
          "instruction": "Synthesis chỉ tra cứu một nguồn cho các kiểm chứng đơn giản; request nhiều nguồn chuyển coordinator.",
          "why": "Giảm round trips mà không cấp full web access.",
          "expected": "Dễ kiểm chứng ranh giới simple vs complex."
        },
        {
          "title": "Bắt buộc extract_metadata",
          "instruction": "Đặt tool_choice:{type:'tool',name:'extract_metadata'} ở lượt đầu; sau đó auto.",
          "why": "Bảo đảm model chọn đúng công cụ khởi đầu.",
          "expected": "Config forced rồi auto được in rõ."
        },
        {
          "title": "Thay fetch_url bằng load_document",
          "instruction": "Thực hiện URL allowlist trong handler mock và kiểm tra ngoài scope bị từ chối.",
          "why": "Enforce least privilege chứ không chỉ ghi prompt.",
          "expected": "URL lạ không được load."
        },
        {
          "title": "Chạy thử tình huống phân quyền",
          "instruction": "Chạy script demo + kiểm tra JSON config; nếu gọi model thật cần API key và chi phí.",
          "why": "Phân biệt kiểm tra deterministic với lựa chọn thật của model.",
          "expected": "Log role, selected toolset, rejection, policy và limits."
        }
      ],
      "commands": "npm run lab:domain2 -- 3",
      "source": "scripts/domain2-labs.mjs",
      "disclaimer": "Script mô phỏng phân phối/phân quyền local để học; không khẳng định đã kiểm chứng accuracy model hay latency 40% thực nghiệm."
    }
  },
  "en": {
    "title": "Tool Distribution & Tool Choice",
    "subtitle": "Decide whether to improve descriptions, scope tools by role, consolidate near-duplicates or force tool selection.",
    "bridge": "Task 2.1 handles ambiguous tool descriptions; Task 2.3 handles too many available choices and the right way to scope them.",
    "scenarioTitle": "An agent with 22 tools frequently misroutes",
    "scenario": "Three query tools and nineteen transformation tools are exposed to a synthesis agent. Splitting out a transformation specialist with all nineteen variants does not reduce that agent's selection complexity.",
    "sections": [
      {
        "title": "1. Tool overload is an architectural concern",
        "explanation": [
          "The guide uses four to five tools per agent as a practical exam heuristic, not a hard API limit. Relevant tool availability should match each specialist's job.",
          "A web specialist should not receive unrelated document tools; a synthesis specialist should work with handed-over findings rather than unnecessarily conducting its own broad searches."
        ],
        "code": "const roles = {\n  web: ['search_web','fetch_page','extract_links','save_snippet'],\n  document: ['extract_metadata','extract_data_points','summarize_content','verify_claim'],\n  synthesis: ['compile_report','format_citation','assess_coverage','verify_fact']\n};\n// Đây là công cụ giả định theo vai trò, KHÔNG tự động đăng ký SDK.",
        "keyPoint": "Tool count and role relevance affect selection."
      },
      {
        "title": "2. Role scoping vs consolidating duplicates",
        "explanation": [
          "Separate capabilities with different jobs should be scoped to separate agents. Nineteen dataset transformations with a shared contract can instead become one transform_data tool taking a transform_type enum.",
          "Do not merge operations with incompatible business permissions or side effects just to lower the count."
        ],
        "code": "const transformData = {\n  name: 'transform_data',\n  description: 'Transform dataset using the selected transform_type.',\n  input_schema: {type:'object',properties:{\n    dataset:{type:'string'},\n    transform_type:{type:'string',enum:['pivot','percentile','normalise_currency']},\n    options:{type:'object'}\n  },required:['dataset','transform_type']}\n};",
        "keyPoint": "Different jobs → distribute; variations of one job → consolidate."
      },
      {
        "title": "3. Splitting across MCP servers does not remove choice overload",
        "explanation": [
          "The model may see all tools exposed by connected servers as one list. Two servers with eleven tools each can still mean twenty-two candidates.",
          "Reduce what a role or turn exposes, not merely how capabilities are packaged into processes."
        ],
        "code": "// SAI: chia endpoint nhưng vẫn lộ 22 tools cho một agent\nconst exposed = [...serverA.listTools(), ...serverB.listTools()];\n\n// ĐÚNG: lọc theo role/capability trước khi model thấy tool list\nconst synthesisTools = exposed.filter(t =>\n  ['compile_report','assess_coverage','verify_fact'].includes(t.name)\n );",
        "keyPoint": "Server boundaries are not automatic role boundaries."
      },
      {
        "title": "4. tool_choice auto, any, and named forced tool",
        "explanation": [
          "auto allows a normal text answer or tool use. any requires a tool call but leaves the choice to the model. A named tool choice requires a specific tool to be selected.",
          "A forced initial extract_metadata call is useful for a known workflow stage. Backend authorization remains necessary even with forced selection."
        ],
        "code": "// Request 1: bắt đầu bằng metadata extraction\nconst firstChoice={type:'tool',name:'extract_metadata'};\n\n// Request tiếp theo: model quyết định các bước còn lại\nconst laterChoice={type:'auto'};\n\n// Bắt buộc CÓ tool nhưng cho model tự chọn tool\nconst structuredChoice={type:'any'};",
        "keyPoint": "Tool selection policy is not execution authorization."
      },
      {
        "title": "5. Scoped cross-role tools avoid coordination overhead",
        "explanation": [
          "If most synthesis fact checks are single-source lookups, passing every request through the coordinator adds unnecessary hops.",
          "Provide a narrow verify_fact tool directly for simple checks and route complex multi-source work back to the coordinator."
        ],
        "code": "function verifyFactSingleSource({sourceId,claim}) {\n  if (!ALLOWED_SOURCE_IDS.has(sourceId))\n    return {isError:true,error:'SOURCE_NOT_ALLOWED'};\n  // Demo: chỉ kiểm tra từ kho dữ liệu đã được phép truy cập\n  return {status:'NEEDS_EVIDENCE',sourceId,claim};\n}",
        "keyPoint": "The cross-role tool must remain narrow and backend-enforced."
      },
      {
        "title": "6. Least-privilege alternatives to generic fetch_url",
        "explanation": [
          "Use load_document restricted to authorised document sources instead of unconstrained fetch_url.",
          "Real URL validation must consider allowed schemes, hosts, redirects and network-access risks, not merely model-facing descriptions."
        ],
        "code": "function allowedDocumentUrl(raw){\n  const u=new URL(raw);\n  return u.protocol==='https:' && u.hostname==='docs.example.test'\n    && u.pathname.startsWith('/approved/');\n}\n// DEMO kiểm tra URL; production còn phải chặn redirects/SSRF.",
        "keyPoint": "Scope must be enforced in handlers, not left to prompts."
      }
    ],
    "table": {
      "headers": [
        "Scenario",
        "Cause",
        "Remedy"
      ],
      "rows": [
        [
          "Five tools, two ambiguous",
          "Overlapping descriptions",
          "Improve descriptions"
        ],
        [
          "22 tools across jobs",
          "Role overload",
          "Distribute by specialist"
        ],
        [
          "19 near-identical transforms",
          "Duplicate choices",
          "Consolidate + enum"
        ],
        [
          "Must call any tool",
          "Mandatory tool use",
          "tool_choice:any"
        ],
        [
          "Must start with metadata",
          "Mandatory named tool",
          "Named tool_choice"
        ],
        [
          "Slow simple verification",
          "Extra coordinator hops",
          "Scoped verify_fact"
        ]
      ]
    },
    "vocabulary": [
      [
        "Tool Overload",
        "quá nhiều công cụ",
        "Selection complexity khi model có nhiều lựa chọn."
      ],
      [
        "Tool Distribution",
        "phân phối công cụ",
        "Chia tool cho agent có trách nhiệm phù hợp."
      ],
      [
        "Consolidation",
        "gộp công cụ",
        "Gộp các variants giống contract thành parameterized tool."
      ],
      [
        "Parameterised Tool",
        "công cụ có tham số lựa chọn",
        "Dùng enum để chọn phép toán thay vì nhiều tools gần trùng."
      ],
      [
        "tool_choice",
        "cấu hình lựa chọn tool",
        "Cơ chế API xác định model có cần gọi tool."
      ],
      [
        "Scoped Cross-role Tool",
        "công cụ liên vai trò có giới hạn",
        "Cho phép thao tác đơn giản mà không cấp quyền quá rộng."
      ],
      [
        "Least Privilege",
        "đặc quyền tối thiểu",
        "Chỉ cấp quyền đúng phạm vi công việc."
      ],
      [
        "Round Trip",
        "vòng gọi đi-về",
        "Chi phí thời gian điều phối qua coordinator."
      ],
      [
        "SSRF",
        "yêu cầu truy cập server nội bộ trái phép",
        "Rủi ro khi fetch URL không bị kiểm soát."
      ]
    ],
    "summary": [
      "4–5 tools per role is a guide heuristic, not a hard limit.",
      "Fix description overlap in small toolkits; scope or consolidate overloaded ones.",
      "Consolidate similar transformations, not unrelated effects.",
      "auto/any/named forced tool choices have distinct meanings.",
      "Scoped verify_fact supports common direct lookups.",
      "Constrain capabilities with enforced least privilege."
    ],
    "quiz": [
      {
        "question": "An agent selects among 18 tools unreliably. Diagnose what?",
        "choices": [
          "Few-shot shortage",
          "Tool overload",
          "Timeout",
          "Price"
        ],
        "correct": 1,
        "explanation": "A large candidate tool set increases decision complexity."
      },
      {
        "question": "Nineteen tools are variants of the same dataset transform. Best fix?",
        "choices": [
          "19 agents",
          "One transform_data with enum",
          "Longer descriptions only",
          "19 MCP servers"
        ],
        "correct": 1,
        "explanation": "Use parameterised consolidation for same-shaped operations."
      },
      {
        "question": "Does splitting 22 tools over two servers reduce model-visible choices automatically?",
        "choices": [
          "MCP forbids multi-server",
          "No; exposed list can still have 22",
          "Need API key",
          "It is a Glob issue"
        ],
        "correct": 1,
        "explanation": "Server packaging does not automatically reduce the model's available tool list."
      },
      {
        "question": "What does tool_choice:any guarantee?",
        "choices": [
          "Specific named tool",
          "Some tool use",
          "No tool",
          "Backend permission"
        ],
        "correct": 1,
        "explanation": "any forces tool use but leaves the tool choice to the model."
      },
      {
        "question": "How do you force extract_metadata on the first turn?",
        "choices": [
          "auto",
          "any",
          "Named tool_choice",
          "No tool_choice"
        ],
        "correct": 2,
        "explanation": "Named forced selection chooses the mandatory first tool."
      },
      {
        "question": "Simple verification through coordinator is slow. Best remedy?",
        "choices": [
          "Skip validation",
          "Scoped verify_fact",
          "Unrestricted fetch_url",
          "No evidence"
        ],
        "correct": 1,
        "explanation": "A scoped local lookup saves coordination hops while preserving safety."
      },
      {
        "question": "A document specialist needs only approved URLs. Use what?",
        "choices": [
          "fetch_url without checks",
          "Allowlisted load_document",
          "Full Bash",
          "write_all_files"
        ],
        "correct": 1,
        "explanation": "Restrict document access by enforcing allowed sources."
      },
      {
        "question": "What is the four-to-five tools guideline?",
        "choices": [
          "SDK hard cap",
          "Exam guideline",
          "MCP requirement",
          "JSON Schema requirement"
        ],
        "correct": 1,
        "explanation": "The guidance is heuristic, not a universal SDK maximum."
      }
    ],
    "lab": {
      "title": "Distribute tools across three agents",
      "duration": "45 minutes",
      "goal": "Scope Web/Document/Synthesis roles, introduce a narrow fact checker, set forced first-step metadata extraction and enforce document URL constraints.",
      "steps": [
        {
          "title": "Define role toolsets",
          "instruction": "Assign four to five relevant tools per specialist.",
          "why": "Reduce selection ambiguity.",
          "expected": "Three clear role configs."
        },
        {
          "title": "Add scoped verification",
          "instruction": "Support simple single-source lookups without full search access.",
          "why": "Reduce coordination overhead.",
          "expected": "Simple and complex requests route differently."
        },
        {
          "title": "Force extract_metadata first",
          "instruction": "Set named tool_choice initially and auto later.",
          "why": "Match workflow ordering.",
          "expected": "Visible configuration."
        },
        {
          "title": "Constrain document fetching",
          "instruction": "Use load_document with strict source allowlist.",
          "why": "Apply least privilege.",
          "expected": "Out-of-scope URLs rejected."
        },
        {
          "title": "Inspect simulation",
          "instruction": "Run policy checks and distinguish deterministic output from actual model decisions.",
          "why": "Avoid fabricated model results.",
          "expected": "Printed tool role and policy diagnostics."
        }
      ],
      "commands": "npm run lab:domain2 -- 3",
      "source": "scripts/domain2-labs.mjs",
      "disclaimer": "Local demonstration validates configuration only; it does not claim measured production selection accuracy or latency."
    }
  }
};
