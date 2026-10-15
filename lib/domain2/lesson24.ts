import type { Domain2Content } from "../domain2-types";
export const lesson24:Record<"vi"|"en",Domain2Content> = {
  "vi": {
    "title": "MCP Server Integration — Kết nối công cụ vào Claude Code",
    "subtitle": "Thiết kế .mcp.json cho team, quản lý secrets và quyết định dùng server có sẵn hay tự xây.",
    "bridge": "Từ Lesson 2.1: dù MCP server kết nối đúng, mô tả tool mơ hồ vẫn làm Claude chọn sai. Lesson 2.4 bổ sung cách kết nối, phạm vi chia sẻ và cơ chế Resource.",
    "scenarioTitle": "Team Next.js mất một ngày vì mỗi người dùng bộ tools khác nhau",
    "scenario": "Dự án Next.js có 5 lập trình viên. Người A có Jira/GitHub MCP riêng trong cấu hình cá nhân, người B vừa clone repo không thấy tools nào, người C copy token thẳng vào file JSON rồi đẩy lên Git. Vấn đề là cấu hình phạm vi sai và secret bị đưa vào version control.",
    "sections": [
      {
        "title": "1. MCP Server, Client và Host đóng vai trò gì?",
        "explanation": [
          "MCP (Model Context Protocol) là cách chuẩn hóa việc client/host truy cập tools, resources và prompts của server. Claude Code là host/client kết nối đến các MCP servers; mỗi server trình bày capabilities của mình.",
          "Một MCP server không phải Claude model và không tự biến ứng dụng Next.js thành agent. Nó nhận yêu cầu qua transport, chạy logic trên hệ thống được phép và trả kết quả; Claude Code quyết định khi nào cần dùng capability được liệt kê."
        ],
        "code": "// Sơ đồ trách nhiệm: Claude Code (client) ⇄ MCP server ⇄ hệ thống bên ngoài\n// MCP tools: thao tác (search_issues, create_ticket, ...)\n// MCP resources: dữ liệu đọc (schema, document tree, ...)\n// MCP prompts: mẫu prompt được server cung cấp.",
        "keyPoint": "MCP là giao thức nối host/agent với hệ thống, không phải một mô hình AI thay thế API."
      },
      {
        "title": "2. Project-level và User-level: khác mục đích",
        "explanation": [
          "Project scope: file .mcp.json ở root repo, có thể commit để mọi thành viên nhận cùng định nghĩa kết nối. Phù hợp integration team như Jira, GitHub, internal docs khi endpoint không chứa secrets.",
          "User scope: cấu hình lưu ở ~/.claude.json dành cho sở thích và thử nghiệm cá nhân, không nên commit. Tài liệu Claude Code hiện có cả local (mặc định), project và user scopes; bài thi có thể mô tả chủ yếu hai phạm vi project-vs-user, cần phân biệt ngữ cảnh câu hỏi."
        ],
        "code": "// Cấu hình project ở ROOT repo: .mcp.json\nconst projectConfig={mcpServers:{\n  team_docs:{type:'http',url:'https://mcp.example.test/mcp'}\n}};\n// user config: ~/.claude.json (KHÔNG commit)\n// CLI current docs: --scope project | user | local",
        "keyPoint": "Team-shared → .mcp.json; personal → ~/.claude.json. Local scope tồn tại ở Claude Code hiện tại."
      },
      {
        "title": "3. Remote HTTP và local stdio có entry khác nhau",
        "explanation": [
          "Remote MCP server thường có type:'http' cùng URL; local MCP server chạy process và giao tiếp stdio thông qua command/args. Chọn transport đúng để Claude Code khởi chạy/kết nối được.",
          "Ví dụ remote ghép URL + env token header, trong khi filesystem local dùng command:'npx' và args. Lưu ý không phải tất cả URL demo trong tài liệu đều là endpoint sẵn có; khi thực hành cần endpoint MCP thực tế và quyền truy cập."
        ],
        "code": "const mcpConfig = {mcpServers:{\n  remote_demo: {type:'http',url:'https://mcp.example.test/mcp',\n    headers:{Authorization:'Bearer ${TEAM_MCP_TOKEN}'}},\n  local_docs: {command:'node',args:['scripts/local-mcp-server.mjs']}\n}};",
        "keyPoint": "Đừng cấu hình server remote chỉ bằng url mà quên khai báo type đúng theo CLI hỗ trợ."
      },
      {
        "title": "4. Environment variable expansion để không lộ secrets",
        "explanation": [
          "Trong .mcp.json dùng ${VAR_NAME} để placeholder biến môi trường; mỗi developer tự thiết lập token trong môi trường của mình hoặc secrets manager. File được version control chỉ có tên biến, không chứa secret thật.",
          "Đừng chép token vào README, query string, ví dụ public hay commit lịch sử Git. Môi trường thiếu biến có thể không khiến toàn bộ cấu hình dừng theo kỳ vọng; nên kiểm tra tool connectivity và thông báo cấu hình lỗi rõ ràng."
        ],
        "code": "// .mcp.json (chỉ ví dụ JSON hợp lệ)\n{\n  \"mcpServers\": {\n    \"team_api\": {\n      \"type\": \"http\",\n      \"url\": \"https://mcp.example.test/mcp\",\n      \"headers\": {\"Authorization\": \"Bearer ${TEAM_MCP_TOKEN}\"}\n    }\n  }\n}",
        "keyPoint": "Placeholder ${VAR_NAME} giữ token khỏi Git, không tự sinh token hoặc cấp permission."
      },
      {
        "title": "5. MCP Resources khác Tools",
        "explanation": [
          "MCP Resource là nội dung dữ liệu có địa chỉ/URI, ví dụ database schema hoặc danh mục tài liệu. Tool là lời gọi thực hiện một thao tác như search_issues. Resource có thể giảm nhu cầu phải gọi nhiều tools chỉ để khám phá những gì hiện có.",
          "MCP specification gọi resources là application-controlled: server liệt kê chúng, nhưng host/client quyết định khi nào đưa resource vào ngữ cảnh model. Đừng hiểu nhầm 'resources auto-discovered' thành 'Claude luôn đọc hết resources không cần host'."
        ],
        "code": "// Resource concept: app://db/schema -> tên bảng/cột (read-only data)\n// Tool concept: query_customer({customerId}) -> chạy truy vấn\n// Không đưa quyền cập nhật DB vào resource chỉ để tiện truy cập.\nconst resourceUri='app://docs/catalogue';",
        "keyPoint": "Resources cho biết dữ liệu; Tools thực hiện công việc. Host quyết định context exposure."
      },
      {
        "title": "6. Community/official server hay tự xây custom?",
        "explanation": [
          "Với integration chuẩn như GitHub/Jira/Slack, hãy kiểm tra giải pháp official hoặc maintained trước khi phát triển server mới. Chúng tiết kiệm effort nhưng vẫn cần review quyền, uy tín nhà cung cấp, scopes và data handling.",
          "Chỉ viết custom MCP server khi có proprietary API, workflow nội bộ khác biệt hoặc business logic mà server sẵn có không đáp ứng. Không mặc định một community package an toàn chỉ vì có sẵn; luôn audit và pin version khi cần."
        ],
        "code": "function chooseIntegration({standard,hasSafeMaintainedOption,customRules}){\n  if(standard&&hasSafeMaintainedOption&&!customRules)\n    return 'EVALUATE_EXISTING_SERVER_FIRST';\n  return 'DESIGN_CUSTOM_SERVER_WITH_SECURITY_REVIEW';\n}",
        "keyPoint": "Build-vs-use: đánh giá server có sẵn trước; custom chỉ khi có nhu cầu riêng không được đáp ứng."
      },
      {
        "title": "7. Cải thiện descriptions của MCP tools để cạnh tranh built-ins",
        "explanation": [
          "Một MCP tool search_codebase được mô tả chỉ 'Searches code' dễ bị model bỏ qua so với Grep đã có mục đích rõ ràng. Viết description nêu lợi thế thực sự như AST-aware indexing, semantic matches, path/line references và khi nào tốt hơn Grep.",
          "Nếu search chỉ là text matching bình thường, không được mô tả thành semantic search. Description phải trung thực với khả năng backend, không overpromise để model chọn."
        ],
        "code": "const searchCodebaseDescription = [\n 'Semantic repository search using indexed syntax and symbols.',\n 'Returns symbol names, file paths, line numbers, and context.',\n 'Use for intent-based code discovery.',\n 'Use built-in Grep for exact text or regex matches.'\n].join(' ');",
        "keyPoint": "Tool descriptions chi tiết giúp chọn đúng MCP capability, nhưng phải mô tả năng lực thực."
      }
    ],
    "table": {
      "headers": [
        "Bối cảnh",
        "Cấu hình/capability",
        "Quyết định"
      ],
      "rows": [
        [
          "Cả team dùng Jira",
          "Project .mcp.json",
          "Commit config, không commit token"
        ],
        [
          "Thử server riêng",
          "User ~/.claude.json hoặc local scope",
          "Không chia sẻ mặc định"
        ],
        [
          "Remote endpoint",
          "type:http + url",
          "Kiểm tra HTTPS, auth"
        ],
        [
          "Local process",
          "command + args",
          "Stdio transport"
        ],
        [
          "Database schema catalogue",
          "MCP Resource",
          "Host đưa vào context khi cần"
        ],
        [
          "Tích hợp GitHub tiêu chuẩn",
          "Official/maintained server",
          "Đánh giá trước khi custom"
        ],
        [
          "MCP search thua Grep",
          "Mô tả sparse",
          "Viết capabilities và boundaries"
        ]
      ]
    },
    "vocabulary": [
      [
        "MCP Server",
        "máy chủ công cụ MCP",
        "Cung cấp tools/resources/prompts qua giao thức MCP."
      ],
      [
        "MCP Client",
        "thành phần kết nối MCP",
        "Nhận tool definitions và gọi tool/resource qua transport."
      ],
      [
        "Project Scope",
        "phạm vi dự án",
        "Cấu hình .mcp.json có thể chia sẻ trong repository."
      ],
      [
        "User Scope",
        "phạm vi người dùng",
        "Cấu hình cá nhân không được commit cùng repo."
      ],
      [
        "Local Scope",
        "phạm vi local",
        "Cấu hình riêng ngữ cảnh dự án hiện tại trong Claude Code."
      ],
      [
        "Environment Expansion",
        "nội suy biến môi trường",
        "Thay ${VAR_NAME} bằng giá trị runtime, không hardcode secret."
      ],
      [
        "Stdio",
        "giao tiếp input/output process",
        "Transport local MCP qua stdin/stdout."
      ],
      [
        "HTTP Transport",
        "vận chuyển qua HTTP",
        "Kết nối MCP server ở endpoint từ xa."
      ],
      [
        "MCP Resource",
        "tài nguyên MCP",
        "Dữ liệu để client lựa chọn đưa vào context."
      ],
      [
        "Custom MCP Server",
        "MCP server tự xây",
        "Server cho workflow độc quyền hoặc logic nội bộ."
      ],
      [
        "Community MCP Server",
        "MCP server có sẵn",
        "Giải pháp do ecosystem duy trì, cần đánh giá bảo mật."
      ]
    ],
    "summary": [
      "MCP server cung cấp tools/resources; Claude Code là client/host sử dụng capabilities.",
      "Project .mcp.json dùng cho team, user ~/.claude.json dành cá nhân; current CLI còn local scope.",
      "HTTP remote có type và url; stdio local có command và args.",
      "Secrets chỉ đi qua biến môi trường, không commit token.",
      "Resources là application-controlled; client quyết định khi nào cho model thấy nội dung.",
      "Ưu tiên đánh giá official/maintained MCP server cho standard integration; custom khi yêu cầu nội bộ.",
      "Mô tả MCP tools phải đủ capabilities/limitations để model chọn đúng so với built-ins."
    ],
    "quiz": [
      {
        "question": "Cả team cần chung server Jira/GitHub MCP. File phù hợp nhất?",
        "choices": [
          "~/.claude.json cá nhân",
          ".mcp.json ở root repo",
          ".env chứa token",
          "pages/layout.tsx"
        ],
        "correct": 1,
        "explanation": "Project-level .mcp.json có thể version control và chia sẻ định nghĩa kết nối."
      },
      {
        "question": "Tài liệu Claude Code hiện tại hỗ trợ scopes nào?",
        "choices": [
          "Chỉ project",
          "Chỉ user",
          "local, project và user",
          "Chỉ global"
        ],
        "correct": 2,
        "explanation": "Bài gốc nhấn mạnh project/user, nhưng CLI hiện có local scope mặc định."
      },
      {
        "question": "Remote HTTP MCP server cần cấu hình nào?",
        "choices": [
          "Chỉ command",
          "type:http và url",
          "Chỉ prompt",
          "Không auth"
        ],
        "correct": 1,
        "explanation": "Remote HTTP dùng endpoint url và type tương ứng."
      },
      {
        "question": "Đưa token trực tiếp trong .mcp.json có nên không?",
        "choices": [
          "Nên để cả team dùng",
          "Không, dùng ${ENV_VAR}",
          "Chỉ khi repo private",
          "Được nếu base64"
        ],
        "correct": 1,
        "explanation": "Cấu hình chia sẻ không được chứa credential thật; dùng expansion và secrets manager."
      },
      {
        "question": "MCP Resources được model nhìn thấy thế nào?",
        "choices": [
          "Luôn tự động chèn hết",
          "Server liệt kê; client/host chọn expose",
          "Luôn là tool call",
          "Chỉ chứa code"
        ],
        "correct": 1,
        "explanation": "Resources là application-controlled, host quyết định khi nào đưa vào context."
      },
      {
        "question": "Nhu cầu GitHub MCP tiêu chuẩn. Bước đầu hợp lý?",
        "choices": [
          "Build custom ngay",
          "Đánh giá official/maintained server",
          "Bỏ qua bảo mật",
          "Viết Bash gọi token public"
        ],
        "correct": 1,
        "explanation": "Không cần reinvent standard integration; vẫn cần đánh giá trust/permissions."
      },
      {
        "question": "MCP tool semantic search thua built-in Grep do mô tả 'Searches code'. Sửa gì?",
        "choices": [
          "Gỡ Grep",
          "Nêu rõ semantic capabilities/outputs/boundaries",
          "Thêm 20 servers",
          "Đổi token"
        ],
        "correct": 1,
        "explanation": "Tool descriptions là tín hiệu chọn công cụ; mô tả đúng lợi thế thực sự."
      },
      {
        "question": "Local stdio MCP server thường cấu hình bằng gì?",
        "choices": [
          "type:http + url",
          "command + args",
          "JSON-RPC error",
          "model"
        ],
        "correct": 1,
        "explanation": "Stdio chạy process local nên cần command và args."
      }
    ],
    "lab": {
      "title": "Cấu hình .mcp.json có scope, env và resource",
      "duration": "30 phút",
      "goal": "Tạo project-level MCP config an toàn, mô tả user/local scope và một catalog resource mẫu, audit descriptions.",
      "steps": [
        {
          "title": "Tạo cấu hình project-level",
          "instruction": "Copy ví dụ .mcp.json từ docs vào repo sandbox, dùng một server HTTP phù hợp (hoặc mock).",
          "why": "Team cần kết nối cùng bộ capabilities.",
          "expected": "mcpServers object, remote có type và url."
        },
        {
          "title": "Đưa auth qua env var",
          "instruction": "Sử dụng ${TEAM_MCP_TOKEN} trong header và kiểm tra git diff không chứa token thật.",
          "why": "Ngăn lộ secrets khi chia sẻ repo.",
          "expected": "Chỉ có placeholder trong JSON."
        },
        {
          "title": "Thử user/local scope",
          "instruction": "Thêm một server thử nghiệm bằng Claude Code CLI với --scope user hoặc local trong môi trường riêng.",
          "why": "Phân biệt team-shared và personal config.",
          "expected": "Không làm thay đổi project .mcp.json."
        },
        {
          "title": "Mô tả một MCP Resource",
          "instruction": "Tạo ví dụ catalogue chứa tên bảng/schema hoặc tài liệu bằng resource URI.",
          "why": "Giảm các tool calls tìm kiếm cấu trúc sơ bộ.",
          "expected": "Client/host có thể chọn load catalogue."
        },
        {
          "title": "So sánh MCP semantic search với Grep",
          "instruction": "Viết mô tả nêu lúc nên dùng mỗi tool, không hứa capability backend chưa có.",
          "why": "Model cần đủ boundaries để lựa chọn.",
          "expected": "Description có input/output/limitations."
        }
      ],
      "commands": "npm run lab:domain2 -- 4\n# Xem cấu hình an toàn:\ncat examples/domain2/mcp-project.example.json",
      "source": "examples/domain2/mcp-project.example.json",
      "disclaimer": "Chỉ là template không tự kết nối dịch vụ thật. Mỗi MCP endpoint cần quyền riêng; không hardcode token hoặc commit credentials."
    }
  },
  "en": {
    "title": "MCP Server Integration — Scoping, authentication and resources",
    "subtitle": "Configure reproducible team MCP connections while keeping credentials out of source control.",
    "bridge": "Task 2.1 covered tool descriptions; Task 2.4 covers connecting and sharing those capabilities safely.",
    "scenarioTitle": "A Next.js team has inconsistent tools and exposed credentials",
    "scenario": "One developer sets Jira MCP up only in a personal configuration, another clone sees no tools, and someone mistakenly commits a token. The failure is scoping and secret management.",
    "sections": [
      {
        "title": "1. MCP servers, clients and hosts",
        "explanation": [
          "MCP standardises how clients discover and invoke tools, resources and prompts exposed by servers.",
          "Claude Code uses MCP connections but the MCP server itself is not an AI model. A server executes allowed operations on external systems."
        ],
        "code": "// Sơ đồ trách nhiệm: Claude Code (client) ⇄ MCP server ⇄ hệ thống bên ngoài\n// MCP tools: thao tác (search_issues, create_ticket, ...)\n// MCP resources: dữ liệu đọc (schema, document tree, ...)\n// MCP prompts: mẫu prompt được server cung cấp.",
        "keyPoint": "MCP is a connector protocol, not a model."
      },
      {
        "title": "2. Project, user and local scope",
        "explanation": [
          "Commit project-level .mcp.json when the team should share a connection definition. Keep private user setup in ~/.claude.json.",
          "The guide emphasises project/user; current Claude Code documentation also defines local, project and user scopes. Answer according to question context."
        ],
        "code": "// Cấu hình project ở ROOT repo: .mcp.json\nconst projectConfig={mcpServers:{\n  team_docs:{type:'http',url:'https://mcp.example.test/mcp'}\n}};\n// user config: ~/.claude.json (KHÔNG commit)\n// CLI current docs: --scope project | user | local",
        "keyPoint": "Team-shared config belongs at project scope; personal experiments do not."
      },
      {
        "title": "3. HTTP vs stdio server entries",
        "explanation": [
          "Remote MCP servers typically specify type:http and url; local stdio processes specify command and args.",
          "Use real authenticated MCP endpoints in practice. Example domains are placeholders, not working services."
        ],
        "code": "const mcpConfig = {mcpServers:{\n  remote_demo: {type:'http',url:'https://mcp.example.test/mcp',\n    headers:{Authorization:'Bearer ${TEAM_MCP_TOKEN}'}},\n  local_docs: {command:'node',args:['scripts/local-mcp-server.mjs']}\n}};",
        "keyPoint": "Transport configuration must match the server type."
      },
      {
        "title": "4. Environment variable expansion",
        "explanation": [
          "Keep tokens outside version control by referring to ${VAR_NAME} in .mcp.json and configuring variables locally.",
          "Never paste real secrets into examples or commit history. Validate connectivity rather than assuming a missing environment variable always causes fatal loading errors."
        ],
        "code": "// .mcp.json (chỉ ví dụ JSON hợp lệ)\n{\n  \"mcpServers\": {\n    \"team_api\": {\n      \"type\": \"http\",\n      \"url\": \"https://mcp.example.test/mcp\",\n      \"headers\": {\"Authorization\": \"Bearer ${TEAM_MCP_TOKEN}\"}\n    }\n  }\n}",
        "keyPoint": "Shared config can contain variable references, never shared credentials."
      },
      {
        "title": "5. Resources vs tools",
        "explanation": [
          "MCP resources describe data such as database schemas or document catalogues, potentially reducing exploratory tool calls.",
          "Resources are application-controlled: a client/host decides when to expose resource contents to the model. They are not universally auto-injected."
        ],
        "code": "// Resource concept: app://db/schema -> tên bảng/cột (read-only data)\n// Tool concept: query_customer({customerId}) -> chạy truy vấn\n// Không đưa quyền cập nhật DB vào resource chỉ để tiện truy cập.\nconst resourceUri='app://docs/catalogue';",
        "keyPoint": "Resources expose data; tools perform actions."
      },
      {
        "title": "6. Build or reuse a server?",
        "explanation": [
          "Evaluate official or well-maintained implementations for standard Jira/GitHub/Slack integrations before writing a custom MCP server.",
          "Custom is justified by proprietary APIs or team-specific rules. Existing packages still require security and permissions review."
        ],
        "code": "function chooseIntegration({standard,hasSafeMaintainedOption,customRules}){\n  if(standard&&hasSafeMaintainedOption&&!customRules)\n    return 'EVALUATE_EXISTING_SERVER_FIRST';\n  return 'DESIGN_CUSTOM_SERVER_WITH_SECURITY_REVIEW';\n}",
        "keyPoint": "Prefer assessed maintained integrations over unnecessary bespoke implementations."
      },
      {
        "title": "7. Make MCP tool descriptions competitive",
        "explanation": [
          "A sparse description can make an advanced MCP semantic search tool less likely to be selected than built-in Grep.",
          "Accurately explain capabilities, returns and boundaries; never overstate backend functionality."
        ],
        "code": "const searchCodebaseDescription = [\n 'Semantic repository search using indexed syntax and symbols.',\n 'Returns symbol names, file paths, line numbers, and context.',\n 'Use for intent-based code discovery.',\n 'Use built-in Grep for exact text or regex matches.'\n].join(' ');",
        "keyPoint": "Tool descriptions must reflect real implemented strengths."
      }
    ],
    "table": {
      "headers": [
        "Context",
        "Configuration",
        "Action"
      ],
      "rows": [
        [
          "Team-wide Jira connection",
          "Project .mcp.json",
          "Commit config without secrets"
        ],
        [
          "Personal experiment",
          "User/local scope",
          "Keep out of repo"
        ],
        [
          "Remote MCP",
          "HTTP url + type",
          "Auth and HTTPS"
        ],
        [
          "Local MCP process",
          "command + args",
          "Stdio"
        ],
        [
          "Database catalogue",
          "Resource",
          "Host selects context exposure"
        ],
        [
          "Standard GitHub integration",
          "Maintained existing server",
          "Evaluate first"
        ],
        [
          "Weak search description",
          "Tool interface",
          "Clarify capabilities"
        ]
      ]
    },
    "vocabulary": [
      [
        "MCP Server",
        "máy chủ công cụ MCP",
        "Cung cấp tools/resources/prompts qua giao thức MCP."
      ],
      [
        "MCP Client",
        "thành phần kết nối MCP",
        "Nhận tool definitions và gọi tool/resource qua transport."
      ],
      [
        "Project Scope",
        "phạm vi dự án",
        "Cấu hình .mcp.json có thể chia sẻ trong repository."
      ],
      [
        "User Scope",
        "phạm vi người dùng",
        "Cấu hình cá nhân không được commit cùng repo."
      ],
      [
        "Local Scope",
        "phạm vi local",
        "Cấu hình riêng ngữ cảnh dự án hiện tại trong Claude Code."
      ],
      [
        "Environment Expansion",
        "nội suy biến môi trường",
        "Thay ${VAR_NAME} bằng giá trị runtime, không hardcode secret."
      ],
      [
        "Stdio",
        "giao tiếp input/output process",
        "Transport local MCP qua stdin/stdout."
      ],
      [
        "HTTP Transport",
        "vận chuyển qua HTTP",
        "Kết nối MCP server ở endpoint từ xa."
      ],
      [
        "MCP Resource",
        "tài nguyên MCP",
        "Dữ liệu để client lựa chọn đưa vào context."
      ],
      [
        "Custom MCP Server",
        "MCP server tự xây",
        "Server cho workflow độc quyền hoặc logic nội bộ."
      ],
      [
        "Community MCP Server",
        "MCP server có sẵn",
        "Giải pháp do ecosystem duy trì, cần đánh giá bảo mật."
      ]
    ],
    "summary": [
      "MCP servers expose capabilities to hosts/clients.",
      "Project config is shared, user config is personal; local scope also exists in current CLI.",
      "Use proper remote HTTP or local stdio entries.",
      "Keep secrets in environment variables, not Git.",
      "Resources are host-controlled data.",
      "Evaluate maintained integrations first; custom only when necessary.",
      "Write precise MCP tool descriptions."
    ],
    "quiz": [
      {
        "question": "Where should a team-wide Jira MCP server definition live?",
        "choices": [
          "Personal ~/.claude.json",
          "Project .mcp.json",
          "Token in .env",
          "React layout"
        ],
        "correct": 1,
        "explanation": "Project .mcp.json is version-controlled for team sharing."
      },
      {
        "question": "What are current Claude Code MCP scopes?",
        "choices": [
          "Only project",
          "Only user",
          "local/project/user",
          "Only global"
        ],
        "correct": 2,
        "explanation": "Current CLI documents local, project and user."
      },
      {
        "question": "What fields does a remote HTTP MCP server need?",
        "choices": [
          "Only command",
          "type:http + url",
          "Only prompt",
          "No auth"
        ],
        "correct": 1,
        "explanation": "Remote transport needs a type and URL."
      },
      {
        "question": "Should secrets be committed in .mcp.json?",
        "choices": [
          "Yes",
          "No, use env expansion",
          "Private repos only",
          "Base64 tokens are safe"
        ],
        "correct": 1,
        "explanation": "Environment placeholders avoid committing credentials."
      },
      {
        "question": "How does MCP resource content reach the model?",
        "choices": [
          "Always auto-injected",
          "Host controls exposure",
          "Always via a tool call",
          "Only code resources"
        ],
        "correct": 1,
        "explanation": "The client/host decides when to surface resources."
      },
      {
        "question": "For standard GitHub integration, what is the first step?",
        "choices": [
          "Build custom first",
          "Evaluate maintained existing servers",
          "Skip review",
          "Public token Bash"
        ],
        "correct": 1,
        "explanation": "A standard integration should use a maintained option where suitable."
      },
      {
        "question": "A semantic MCP search tool is overlooked because its description is sparse. Fix?",
        "choices": [
          "Disable Grep",
          "Improve accurate capability description",
          "Add 20 servers",
          "Rotate API token"
        ],
        "correct": 1,
        "explanation": "Precise descriptions support correct selection."
      },
      {
        "question": "A local stdio MCP process needs what config?",
        "choices": [
          "type:http + url",
          "command + args",
          "Error response",
          "Model name"
        ],
        "correct": 1,
        "explanation": "Stdio launches a local command with arguments."
      }
    ],
    "lab": {
      "title": "Configure scoped MCP servers and environment variables",
      "duration": "30 minutes",
      "goal": "Create safe project-level config, distinguish user/local scope, expose a conceptual resource catalogue and refine MCP descriptions.",
      "steps": [
        {
          "title": "Create project config",
          "instruction": "Use a .mcp.json template with valid transport settings.",
          "why": "Share team integration definitions.",
          "expected": "mcpServers entries with correct fields."
        },
        {
          "title": "Reference environment secrets",
          "instruction": "Use ${TEAM_MCP_TOKEN} instead of a literal credential.",
          "why": "Keep Git history clean.",
          "expected": "No secrets in config diffs."
        },
        {
          "title": "Use personal scope",
          "instruction": "Experiment with a user/local server outside committed project scope.",
          "why": "Separate personal configuration.",
          "expected": "Project .mcp.json unchanged."
        },
        {
          "title": "Introduce a resource",
          "instruction": "Model a documentation or schema catalogue resource.",
          "why": "Reduce discovery calls.",
          "expected": "Client-selectable resource URI."
        },
        {
          "title": "Audit tool descriptions",
          "instruction": "Explain a semantic MCP tool's genuine advantages over Grep.",
          "why": "Improve selection without misleading Claude.",
          "expected": "Clear capability boundaries."
        }
      ],
      "commands": "npm run lab:domain2 -- 4\n# Xem cấu hình an toàn:\ncat examples/domain2/mcp-project.example.json",
      "source": "examples/domain2/mcp-project.example.json",
      "disclaimer": "The example is a safe template and does not connect an actual private MCP service without user credentials."
    }
  }
};
