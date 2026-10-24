import {reliabilityLesson} from "../domain5-builder.ts";
export const lesson52=reliabilityLesson(2,{
  "title": [
    "Escalation & Ambiguity — Khi nào phải chuyển người?",
    "Escalation and Ambiguity Resolution"
  ],
  "subtitle": [
    "Ba trigger hợp lệ, hai trigger thiếu tin cậy và cách tránh chọn nhầm customer ID.",
    "Use three valid escalation triggers; reject sentiment-based routing and unsafe customer matching."
  ],
  "scenario": [
    "Một hãng sửa chữa nhà có bot hỗ trợ. Khách tức giận vì giao gạch trễ nhưng bot có thể đặt lại đơn; khách khác bình tĩnh xin giá ưu đãi mà policy chưa quy định. Bot lại dùng sentiment/confidence để chuyển nhầm ca dễ và tự xử lý ca policy gap.",
    "A home-improvement support agent sees an angry customer with a simple delayed delivery and a calm customer requesting an unaddressed price exception. Using sentiment or self-rated confidence routes the easy case to humans whilst improvising policy on the hard one."
  ],
  "bridge": [
    "Task 5.2 tập trung tiêu chí quyết định xử lý tự động hay bàn giao con người; không thêm classifier phức tạp khi lỗi cơ bản là policy trong system prompt chưa rõ.",
    "Task 5.2 concerns explicit autonomy versus handoff decisions. Do not deploy complex classifiers before repairing unclear policy boundaries."
  ],
  "slug": "escalation-ambiguity",
  "duration": "40 minutes",
  "topics": [
    [
      "1. Ba điều kiện escalation hợp lệ",
      "1. Three valid human-escalation triggers",
      "Theo đúng Task 5.2, (1) khách yêu cầu người thật; (2) policy exception hoặc gap chưa được quy định; (3) agent không thể tiến triển sau nỗ lực thực tế. Chỉ ba nhóm này được bài gốc liệt kê là trigger. Mục tiêu là giữ resolution rate tốt mà không tự tạo luật.",
      "The curriculum identifies three triggers: (1) an explicit request for a human, (2) a policy exception or undocumented gap, and (3) inability to make meaningful progress after genuine attempts. This prevents both unnecessary handoffs and unsupported autonomous policy decisions.",
      "const handoff=({humanRequest,policyGap,blocked})=>humanRequest?'human-request':policyGap?'policy-gap':blocked?'no-progress':'resolve';",
      "Không thay trigger bằng cảm xúc hoặc điểm tự tin.",
      "Do not replace explicit triggers with emotion or uncalibrated confidence."
    ],
    [
      "2. Explicit human request phải được tôn trọng ngay",
      "2. Honour explicit human requests immediately",
      "Người dùng nói 'I want to speak to a person' là điều kiện đủ chuyển ngay trong câu trả lời này. Không yêu cầu khách thử tự động trước, không trì hoãn điều tra, không gợi ý bot giúp rồi mới chuyển; đó là vi phạm ưu tiên rõ ràng của khách.",
      "A customer saying 'I want to speak to a person' must be handed to a human in that reply. Do not first offer a bot resolution, investigate further or renegotiate the request. This absolute rule in the lesson is distinct from mere frustration.",
      "if (/want.*(human|person|agent)/i.test(message)) return {action:'handoff',reason:'explicit request'};\n// Demonstration only; production language intent recognition is richer.",
      "Yêu cầu con người là escalation ngay, khác giận dữ thông thường.",
      "An explicit human request triggers immediate handoff, unlike frustration alone."
    ],
    [
      "3. Policy gap khác policy violation",
      "3. A policy gap is not a policy violation",
      "Vi phạm policy đã có quy tắc rõ: refund ngoài 30 ngày -> từ chối đúng quy định. Gap là chưa có chính sách về yêu cầu mới: đối chiếu giá đối thủ không có trong chính sách -> con người quyết định ngoại lệ. Agent không tự phát minh điều lệ.",
      "A policy violation already has a documented answer, such as declining an out-of-window refund. A policy gap concerns a situation with no defined rule, such as an unauthorised competitor price match. The model cannot invent an exception; a person must decide.",
      "const outcome=policy.ruleExists?evaluateDocumentedRule(request):{action:'handoff',reason:'policy gap'};\n// Denial under a known rule is not itself escalation.",
      "Policy silence => escalate; policy says no => agent có thể từ chối.",
      "Escalate on policy silence; decline autonomously when the policy already answers."
    ],
    [
      "4. Không thể tiến triển sau genuine attempt",
      "4. Escalate inability to progress after a genuine attempt",
      "Khi tool không truy cập được sau retry có giới hạn, hệ thống thiếu quyền hoặc bug cần kỹ sư, agent ghi lại attempts và chuyển người. Chỉ dự đoán 'tôi có thể không xử lý được' chưa chứng minh bế tắc; cần thử biện pháp phù hợp và ghi rõ lý do.",
      "Persistent tool failures after bounded retries, missing access or an engineering defect can block progress. Record what was attempted and then escalate. A speculative fear that a case might be difficult does not qualify without a real attempt.",
      "const progress={attempts:3,error:'booking tool timeout',alternativeTried:true};\nconst result={action:'handoff',reason:'no meaningful progress',progress};",
      "Lỗi thực tế chưa sửa được mới là trigger, không phải dự cảm.",
      "Escalate demonstrated lack of progress, not anticipated difficulty."
    ],
    [
      "5. Frustration không phải trigger",
      "5. Sentiment and frustration are not escalation criteria",
      "Khách nổi nóng vì đơn trễ vẫn có thể được bot xử lý ngay: nhận lỗi và cung cấp lựa chọn reship. Nếu họ nói rõ muốn người thật thì chuyển ngay. Phân tích sentiment không đo độ phức tạp: người bình tĩnh vẫn có policy gap.",
      "A furious customer may still have a straightforward reshipment request. Acknowledge frustration and resolve it if permitted. If they explicitly ask for a person, transfer immediately. Sentiment is emotional tone, not a trustworthy measure of whether the case requires human judgement.",
      "const caseInfo={angry:true,reshipAllowed:true,humanRequested:false};\nconst decision=caseInfo.humanRequested?'handoff':'offer reship';",
      "Frustrated but resolvable => hỗ trợ; explicit human => chuyển.",
      "Resolve a frustrated-but-routine case; transfer on explicit human preference."
    ],
    [
      "6. Self-reported confidence chưa hiệu chuẩn",
      "6. Model self-confidence is an unreliable trigger",
      "Model tự chấm 9/10 có thể vẫn sai ở policy exception và chấm thấp ở việc dễ. Không lấy threshold tự bịa để chuyển người. Trước khi xây classifier hay sentiment pipeline, bổ sung escalation criteria tường minh và few-shot case dễ, gap, human request vào system prompt.",
      "A model's 9/10 self-assessment can be wrong on complex exceptions, while easy tasks can receive low scores. Do not route on an arbitrary threshold. First provide explicit system-level boundaries and few-shot demonstrations of routine, gap and explicit-human cases before adding classifier infrastructure.",
      "const examples=[{case:'I want a person',route:'human'},{case:'late tiles; reship allowed',route:'resolve'},{case:'unwritten discount',route:'human'}];\n// Examples specify decisions, not confidence scores.",
      "Sửa prompt/few-shot trước architecture bổ sung.",
      "Repair criteria and few-shot demonstrations before a new routing architecture."
    ],
    [
      "7. Ambiguous customer matching phải hỏi lại",
      "7. Disambiguate customer records before acting",
      "Tra 'John Smith' thấy ba records không được tự chọn record mới nhất hoặc hoạt động nhiều nhất, bởi có thể lộ dữ liệu hoặc hoàn tiền nhầm. Cần hỏi thêm email, số điện thoại, order number, xác minh trước khi truy cập hồ sơ. Đây là clarification, không mặc nhiên escalation.",
      "If a lookup returns multiple John Smith records, never choose the newest or most active. This risks leaking someone else's data or acting on the wrong account. Ask for a disambiguating email, phone number or order number. Clarification is distinct from an automatic human escalation.",
      "if (matches.length!==1) return {action:'clarify',askFor:['email','phone','orderId']};\nreturn {action:'continue',candidate:matches[0]};",
      "Không dùng heuristic tự chọn khi danh tính mơ hồ.",
      "Ask for identifiers rather than choosing a matching customer heuristically."
    ]
  ],
  "questions": [
    [
      "Khách nói rõ 'cho tôi gặp nhân viên'. Bot nên?",
      "A customer explicitly asks for a human. What should the bot do?",
      "Chuyển ngay ở lượt phản hồi hiện tại.",
      "Hand off immediately in the current response.",
      "Đề nghị bot thử thêm hai lần.",
      "Chỉ chuyển nếu sentiment thấp.",
      "Xin tự chấm confidence trước.",
      "Offer two more automated attempts.",
      "Wait for strongly negative sentiment.",
      "Ask itself for a confidence score first."
    ],
    [
      "Refund ngoài cửa sổ cho phép đã có policy rõ. Hành động?",
      "A documented policy rules out refunds after the allowed window. What is appropriate?",
      "Giải thích và từ chối theo policy đã định.",
      "Explain and decline according to the documented policy.",
      "Chuyển vì mọi policy violation cần nhân viên.",
      "Tự nới cửa sổ hoàn tiền.",
      "Chọn khách hàng khác để hoàn.",
      "Escalate every documented policy violation.",
      "Invent a more generous refund window.",
      "Issue a refund to another account."
    ],
    [
      "Policy không đề cập so giá đối thủ. Bot phải?",
      "The policy is silent on matching competitor prices. What should the agent do?",
      "Bàn giao người có quyền quyết định ngoại lệ.",
      "Escalate to someone authorised to decide the exception.",
      "Tự quyết giảm 10%.",
      "Từ chối vì mặc định policy cấm.",
      "Dùng sentiment để quyết.",
      "Invent a 10% discount.",
      "Assume the silence means the request is prohibited.",
      "Route based on the customer's emotional tone."
    ],
    [
      "Bot nghi booking tool lỗi nhưng chưa thử. Escalate ngay?",
      "The bot suspects its booking tool might fail but has not tried it. Best response?",
      "Thử xử lý có kiểm soát rồi chuyển nếu không tiến triển.",
      "Attempt a bounded resolution, escalating only if progress genuinely fails.",
      "Chuyển ngay vì có thể khó.",
      "Thông báo thành công không cần thử.",
      "Đòi khách hàng tự giải quyết.",
      "Escalate immediately because the case may be hard.",
      "Claim the booking succeeded without checking.",
      "Tell the customer to solve it independently."
    ],
    [
      "Khách nổi nóng vì giao hàng muộn; bot có quyền reship. Phản hồi?",
      "A customer is furious about late delivery; the agent may reship. What should it do?",
      "Thừa nhận khó chịu và đề xuất reship ngay.",
      "Acknowledge frustration and offer the authorised reshipment.",
      "Chuyển vì sentiment âm.",
      "Bỏ qua cảm xúc và từ chối.",
      "Chuyển nếu confidence dưới 7.",
      "Escalate on negative sentiment alone.",
      "Ignore the concern and refuse.",
      "Escalate whenever self-confidence is below seven."
    ],
    [
      "Model tự chấm 9/10 cho ca policy gap. Có nên để tự xử lý?",
      "The model rates itself 9/10 on a policy gap. Should it resolve autonomously?",
      "Không, policy gap vẫn phải chuyển người.",
      "No; a policy gap requires human judgement.",
      "Có, trên 9 là đủ.",
      "Chỉ cần tăng threshold lên 10.",
      "Dùng sentiment thay confidence.",
      "Yes, a high self-score overrides the policy gap.",
      "Raise the arbitrary threshold to ten.",
      "Replace confidence with sentiment."
    ],
    [
      "Tra tên trả về ba khách trùng. Chọn gì?",
      "A customer lookup returns three matches for one name. What next?",
      "Hỏi thêm identifier như email hoặc order ID.",
      "Ask for a disambiguating identifier such as email or order ID.",
      "Chọn record gần nhất.",
      "Chọn record có hoạt động nhiều nhất.",
      "Tự kết hợp dữ liệu cả ba.",
      "Select the newest record.",
      "Select the most active record.",
      "Merge details from all three records."
    ],
    [
      "Resolution rate thấp do chuyển ca dễ nhưng giữ ca policy gap. Thứ tự sửa?",
      "Escalation routing is reversed for routine and policy-gap cases. Best initial improvement?",
      "Thêm explicit criteria và few-shot examples trong system prompt.",
      "Add explicit escalation criteria and few-shot examples to the system prompt.",
      "Đào tạo classifier trước.",
      "Chuyển tất cả ca cho người.",
      "Dùng sentiment threshold.",
      "Train a separate classifier first.",
      "Escalate every case.",
      "Deploy sentiment-based thresholds."
    ]
  ],
  "words": [
    [
      "escalation",
      "bàn giao con người",
      "Handing an agent case to authorised human staff."
    ],
    [
      "trigger",
      "điều kiện kích hoạt",
      "Explicit condition that causes a routing decision."
    ],
    [
      "policy gap",
      "khoảng trống chính sách",
      "No documented rule for the requested situation."
    ],
    [
      "policy violation",
      "trường hợp vi phạm chính sách",
      "An existing rule expressly disallows the request."
    ],
    [
      "meaningful progress",
      "tiến triển thực chất",
      "A genuine attempt to advance the case."
    ],
    [
      "sentiment",
      "sắc thái cảm xúc",
      "Emotion measurement unrelated to policy complexity."
    ],
    [
      "self-reported confidence",
      "mức tự tin tự báo",
      "Uncalibrated model self-assessment."
    ],
    [
      "disambiguation",
      "làm rõ định danh",
      "Asking for identifiers when several records match."
    ]
  ],
  "exercise": [
    [
      "Viết policy routing tường minh",
      "Write explicit routing rules",
      "Mô tả đủ ba valid triggers và hai anti-pattern.",
      "Define three valid triggers and two prohibited shortcuts."
    ],
    [
      "Thêm three few-shot cases",
      "Add three targeted examples",
      "Tạo ca human request, ca angry-resolvable và policy gap.",
      "Demonstrate explicit request, frustrated routine case and policy gap."
    ],
    [
      "Implement identity clarification",
      "Implement customer disambiguation",
      "Khi matches >1 trả yêu cầu thêm identifier; không chọn ngầm.",
      "Ask for further identifiers on multiple matches."
    ],
    [
      "Simulate bounded recovery",
      "Simulate bounded recovery attempts",
      "Thử một thao tác và chỉ chuyển khi attempts thất bại.",
      "Attempt a controlled recovery and escalate persistent failure."
    ],
    [
      "Test routing decisions",
      "Test the routing decisions",
      "Assert rằng sentiment và confidence không tự kích hoạt escalation.",
      "Assert that sentiment and raw confidence do not trigger escalation."
    ]
  ],
  "table": [
    [
      "Human request",
      "Escalate now",
      "Explicit preference"
    ],
    [
      "Documented refund denial",
      "Resolve/decline",
      "Policy already answers"
    ],
    [
      "Multiple customer matches",
      "Ask identifier",
      "Avoid privacy breach"
    ]
  ],
  "commands": "npm run lab:domain5 -- 2"
});
