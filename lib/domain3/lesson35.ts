import {compactLesson} from "../domain3-compact.ts";
export const lesson35=compactLesson(5,{
  "title": [
    "Iterative Refinement — Cải thiện kết quả Claude từng bước",
    "Iterative Refinement Techniques"
  ],
  "subtitle": [
    "Khi Claude biến đổi code mỗi lần một kiểu, dùng ví dụ input/output thay vì mô tả dài; khi có edge cases hãy dùng tests.",
    "Use concrete before/after examples, failing tests and interview questions to improve Claude Code reliability."
  ],
  "bridge": [
    "Sau 3.4 chọn cách plan hoặc direct, 3.5 tập trung vào cách phản hồi để kết quả ngày càng đúng mà không lặp prompt mơ hồ.",
    "After choosing how to execute, refine unreliable outputs with evidence and appropriate feedback."
  ],
  "scenario": [
    "Bạn chuyển functions Next.js từ Promise<Data> sang Promise<Result<Data,ApiError>> trên nhiều file. Viết 'use a robust result type' khiến Claude mỗi lần thêm một kiểu khác nhau. Bạn cung cấp hai ví dụ đầu-vào/đầu-ra rõ ràng và tests cho null, empty, failures để Claude có tiêu chí kiểm chứng.",
    "A Next.js migration turns Promise<Data> functions into Promise<Result<Data,ApiError>>. A prose-only instruction is interpreted inconsistently; exact input/output examples and failing tests provide a measurable target."
  ],
  "slug": "iterative-refinement",
  "duration": "30 phút / 30 min",
  "topics": [
    [
      "1. Khi prose gây hiểu khác nhau, chuyển sang examples",
      "1. Concrete examples beat more vague prose",
      "Với yêu cầu refactor type Result, Claude có thể tạo các biến thể Result<T> không đồng nhất. Thêm 2–3 cặp input/output thể hiện chính xác transformation giúp model học pattern. Thêm cả happy path và một edge case, sau đó thử function thứ ba chưa từng đưa làm ví dụ.",
      "When interpretation varies across runs, stop adding prose qualifiers. Show two or three concrete before/after examples specifying exact signatures and output shapes. Test generalisation on a new function.",
      "// BEFORE: getUser(id): Promise<User>\n// AFTER:  getUser(id): Promise<Result<User, ApiError>>\n// BEFORE: fetchOrders(id): Promise<Order[]>\n// AFTER:  fetchOrders(id): Promise<Result<Order[], ApiError>>",
      "Inconsistent transformation → 2–3 cặp examples chính xác trước tiên.",
      "Concrete examples are the first response to inconsistent interpretation."
    ],
    [
      "2. Test-driven iteration cho edge cases",
      "2. Test-driven iteration for complex cases",
      "Với migration phức tạp, định nghĩa tests trước: success, null, empty list, rejected fetch và error mapping. Cho Claude thấy output thất bại 'expected null, got empty string' sẽ khách quan hơn mô tả 'hãy xử lý cẩn thận'.",
      "Tests are objective feedback for complex transformations. Define successful behaviour, null/empty edge cases and error cases first, then share failing test output so Claude can target the defect.",
      "import assert from 'node:assert/strict';\nassert.equal(normalize(null),null);\nassert.deepEqual(normalize([]),[]);\n// FAIL: expected null, received ''",
      "Test failures cung cấp tín hiệu chính xác hơn lời góp ý mơ hồ.",
      "Failing tests provide unambiguous feedback with expected vs actual."
    ],
    [
      "3. Interview pattern cho domain chưa hiểu",
      "3. Interview before implementation in unfamiliar domains",
      "Nếu bạn chưa hiểu bảo hiểm, caching hoặc quy tắc thanh toán, đừng ép Claude triển khai ngay trên các giả định. Hãy yêu cầu Claude phỏng vấn về các yêu cầu còn ẩn: TTL, invalidation, consistency, audit và failure modes.",
      "When domain knowledge is lacking, ask Claude to interview the developer about constraints and edge cases before implementation. For a cache, ask about TTL, invalidation, consistency and fallback behaviour.",
      "// Prompt\n// 'Before implementing caching for this Next.js API,\n// ask questions about TTL, invalidation, consistency and failure modes.'",
      "Domain unfamiliar → interview; transformation rõ nhưng model không ổn định → examples.",
      "Interviews reveal unknown requirements; examples clarify known transformations."
    ],
    [
      "4. Batch feedback khi các lỗi liên quan nhau",
      "4. Batch interacting feedback into one message",
      "Nếu error response phải thêm code field, logger phải ghi code đó và TypeScript client type phải cập nhật, các sửa đổi liên đới nhau. Gửi feedback trong một message gồm cả ba yêu cầu, để Claude không sửa riêng từng phần và gây trạng thái trung gian mâu thuẫn.",
      "If API error shape, log format and generated SDK typings depend on one another, provide feedback together. The model needs shared constraints to make one coherent change.",
      "// One combined instruction:\n// 1. API errors expose code\n// 2. Logger includes the same code\n// 3. Client Error type defines code",
      "Issues phụ thuộc lẫn nhau → batch cùng một feedback.",
      "Batch corrections when they interact with the same contract."
    ],
    [
      "5. Sequential feedback khi lỗi độc lập",
      "5. Sequence independent fixes",
      "Sai camelCase trong một module và indent 2 spaces là hai vấn đề không liên quan. Có thể sửa lần lượt và kiểm tra mỗi bước, tránh trộn tín hiệu và khó biết yếu tố nào gây lỗi. Batch không luôn tốt hơn.",
      "Unrelated naming and indentation problems can be fixed sequentially, with verification after each change. This isolates causes and makes regressions easier to attribute.",
      "// Iteration 1: rename functions to camelCase\n// Test & review\n// Iteration 2: standardise 2-space indentation",
      "Issues độc lập → sequential feedback, kiểm tra từng kết quả.",
      "Independent corrections can be handled separately."
    ],
    [
      "6. Verify generalisation, đừng chỉ thêm ví dụ",
      "6. Verify generalisation instead of endless examples",
      "Sau 2–3 examples, thử chuyển một function mới mà Claude chưa thấy. Nếu case thường đúng nhưng null sai, bổ sung đúng một ví dụ null hoặc test failure, không cần copy 30 examples vào context. Lưu các rules ổn định thành skill hoặc CLAUDE.md khi thích hợp.",
      "After a few examples, check that the model applies the transformation to an unseen function. Add a targeted edge case if necessary, rather than endlessly expanding examples and context.",
      "// Unseen case:\n// updateProfile(id): Promise<Profile>\n// Expect: Promise<Result<Profile, ApiError>>\n// Verify actual output + tests",
      "Học qua examples phải kiểm chứng trên unseen input để xác nhận generalisation.",
      "Test on unseen inputs to confirm the pattern, not just memorisation."
    ]
  ],
  "table": [
    [
      "Prose interpreted inconsistently",
      "2–3 I/O examples",
      "Concrete pattern"
    ],
    [
      "Complex edge-case transformations",
      "Tests first",
      "Objective failures"
    ],
    [
      "Unfamiliar domain requirements",
      "Interview",
      "Discover constraints"
    ],
    [
      "Interacting error/logging/type issues",
      "Batch feedback",
      "Contract consistency"
    ],
    [
      "Unrelated formatting/naming",
      "Sequential feedback",
      "Independent verification"
    ]
  ],
  "words": [
    [
      "Iterative Refinement",
      "cải thiện qua vòng lặp",
      "Improve output using observation and feedback."
    ],
    [
      "Concrete Example",
      "ví dụ cụ thể",
      "Exact input/output pair."
    ],
    [
      "Test-driven Iteration",
      "lặp dựa vào tests",
      "Use failing tests to guide the next change."
    ],
    [
      "Interview Pattern",
      "mô hình phỏng vấn",
      "Ask requirements questions before coding."
    ],
    [
      "Batch Feedback",
      "góp ý gộp",
      "Combined instruction for interdependent changes."
    ],
    [
      "Sequential Feedback",
      "góp ý từng lần",
      "Apply independent changes in separate iterations."
    ],
    [
      "Generalisation",
      "khả năng tổng quát",
      "Applying learned pattern to unseen cases."
    ],
    [
      "Edge Case",
      "tình huống biên",
      "Null, empty, failed or unusual inputs."
    ]
  ],
  "questions": [
    [
      "Claude hiểu yêu cầu biến đổi mỗi lần một kiểu, ưu tiên gì?",
      "Claude interprets the same transformation inconsistently. What first?",
      "Ví dụ trước/sau",
      "Concrete input/output examples",
      "Thêm prose 500 dòng",
      "Đổi ngôn ngữ",
      "Cấm tool",
      "More prose",
      "Switch language",
      "Deny tools"
    ],
    [
      "Thường cần bao nhiêu examples tốt theo guide?",
      "How many well-chosen examples are usually enough?",
      "2–3",
      "2–3",
      "30–40",
      "100",
      "0",
      "30–40",
      "100",
      "0"
    ],
    [
      "Migration có nhiều null edge cases thì dùng gì?",
      "Complex migration with null edge cases needs?",
      "Test-driven iteration",
      "Test-driven iteration",
      "Chỉ yêu cầu cẩn thận",
      "Bỏ tests",
      "Đổi model",
      "Only cautionary prose",
      "Skip tests",
      "Switch model"
    ],
    [
      "Chưa hiểu caching TTL và invalidation, nên làm gì?",
      "You lack understanding of cache TTL/invalidation. What next?",
      "Interview pattern",
      "Interview pattern",
      "Implement ngay",
      "Gắn prettier",
      "Dùng Glob",
      "Implement instantly",
      "Use formatter",
      "Use Glob"
    ],
    [
      "API error code, logger, client type ảnh hưởng nhau: feedback?",
      "Error shape, logger and client type depend on each other. Feedback?",
      "Batch cùng message",
      "Batch together",
      "Sửa ngẫu nhiên",
      "Đợi deploy",
      "Không cần review",
      "Random edits",
      "Wait for deploy",
      "No review"
    ],
    [
      "Naming và indent độc lập, feedback nào phù hợp?",
      "Independent naming and indentation concerns need?",
      "Sequential",
      "Sequential",
      "Batch luôn luôn",
      "Không sửa",
      "Dùng fork luôn",
      "Always batch",
      "Don't fix",
      "Always fork"
    ],
    [
      "Sau 2 examples model làm đúng, làm sao kiểm chứng?",
      "After two examples, how do you verify the pattern?",
      "Test unseen input",
      "Test unseen input",
      "Tin ngay",
      "Thêm 100 examples",
      "Xóa tests",
      "Trust immediately",
      "Add 100",
      "Delete tests"
    ],
    [
      "Test fail expected null actual empty string, cung cấp gì cho Claude?",
      "Test expects null but got empty string. What feedback?",
      "Actual failing output",
      "Actual failing output",
      "Prompt mơ hồ",
      "Chỉ ảnh đẹp",
      "Bỏ null case",
      "Vague request",
      "Only images",
      "Drop null case"
    ]
  ],
  "exercise": [
  [
    "So sánh một prompt prose qua ba lần chạy",
    "Compare a prose-only prompt across three attempts",
    "Yêu cầu Claude Code sửa kiểu trả về của hai functions bằng một mô tả ngắn; thử ba lần trên cùng input và lưu diff khác nhau, nếu có. Không tuyên bố chắc chắn model sẽ khác nhau.",
    "Ask Claude Code to modify two return types using only prose. Compare three attempts on the same example and record any differences; variability is something to measure, not assume."
  ],
  [
    "Đưa hai hoặc ba ví dụ trước/sau rồi thử lại",
    "Provide two or three before/after pairs and retry",
    "Viết 2–3 cặp chữ ký Promise<T> thành Promise<Result<T, ApiError>>, chạy lại ba lần và so với kết quả prose-only; kiểm chứng thêm một function chưa từng đưa vào ví dụ.",
    "Show two or three exact Promise<T> to Promise<Result<T, ApiError>> pairs; repeat three attempts and test an unseen function for consistent generalisation."
  ],
  [
    "Viết tests trước cho hành vi biên và lỗi",
    "Write tests first for edge cases and errors",
    "Định nghĩa success, null, empty list, rejected fetch và error mapping; chạy npm test để lấy diff expected/actual, đưa failure cho Claude và chạy lại cho tới khi tests xanh.",
    "Define success, null, empty list, rejected fetch and error mapping; run npm test, share the observed expected/actual failure with Claude and re-run until tests pass."
  ],
  [
    "Dùng interview cho phần domain chưa rõ",
    "Use the interview pattern for an unfamiliar area",
    "Đề bài triển khai caching nhưng chưa rõ TTL, invalidation và consistency. Yêu cầu Claude đặt khoảng 5–10 câu hỏi về yêu cầu trước khi đề xuất thay đổi mã.",
    "Ask Claude five to ten questions about caching TTL, invalidation, consistency and failures before implementing a design in an unfamiliar domain."
  ],
  [
    "Gộp ba sửa đổi liên đới vào một feedback",
    "Batch three interdependent changes",
    "Yêu cầu đồng thời thêm error.code ở response, log cùng mã đó và cập nhật client type. Xác minh cả ba chỗ thống nhất; không tách sửa thành ba lượt gây mâu thuẫn.",
    "Send error response code, structured logging and client type adjustments in one request. Check all three contracts remain consistent rather than fixing interacting items separately."
  ]
],
  "commands": "npm run lab:domain3 -- 5\ncd domain3-workspaces/lesson35\nnpm test\nclaude"
});
