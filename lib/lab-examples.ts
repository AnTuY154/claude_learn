// These snippets match the *concepts* in scripts/live-labs.mjs.
// Actual execution and API token usage happen in the Node.js CLI, NOT React.
// Comments are Vietnamese so the learner can relate each snippet to the logged step.
export const labExamples: Record<number,{title:string;code:string}> = {
  1: {title:"Agentic loop: tool_use → tool_result",code:`// Claude quyết định gọi tool; code JS phải thực thi tool đó.
const response = await client.messages.create({ model, max_tokens: 600, tools, messages });
console.log("stop_reason", response.stop_reason, "usage", response.usage);
if (response.stop_reason === "tool_use") {
  messages.push({role:"assistant", content:response.content});
  // Mỗi tool_result phải khớp đúng tool_use_id.
  messages.push({role:"user", content: results });
}
if (response.stop_reason === "end_turn") return response;`},
  2: {title:"Coordinator / hub-and-spoke",code:`// Hai specialist độc lập có thể chạy parallel.
const [web, doc] = await Promise.all([
  askClaude(webPrompt, "web-research"),
  askClaude(docPrompt, "document-analysis")
]);
// Coordinator là nơi tập hợp và chuyển context.
const report = await askClaude(JSON.stringify({web,doc}), "synthesis");`},
  3: {title:"Handoff giữ nguồn trích dẫn",code:`// KHÔNG bỏ source_url / document_name khi chuyển sang synthesis.
const findings = [
  {claim:"Demo claim",source_url:"https://example.org",document_name:null}
];
const payload = mode === "bad"
  ? findings.map(({claim}) => ({claim})) // cố tình sai để so sánh
  : findings;                            // đúng: giữ metadata
await askClaude(JSON.stringify({findings:payload}), "synthesis");`},
  4: {title:"Prerequisite gate trước simulated refund",code:`// Chỉ code xác minh mới thay đổi verifiedCustomerId (không tin model).
function authorizeRefund(session, customerId) {
  if(session.verifiedCustomerId !== customerId) {
    console.log("[GATE] BLOCKED");
    return {ok:false,error:"VERIFY_CUSTOMER_FIRST"};
  }
  console.log("[GATE] APPROVED_IN_DEMO"); // không chuyển tiền thật
  return {ok:true};
}`},
  5: {title:"Pre/Post middleware analogy (NOT Agent SDK hooks)",code:`// Mô phỏng điểm chặn ở APPLICATION LAYER (không phải SDK Hook callback).
if (tool.name === "restricted_action" && !isAuthorized(tool.input)) {
  return {error:"BLOCKED_BY_PRE_EXECUTION_GUARD"};
}
const rawOutput = await executeDemoTool(tool);
const normalized = normalizeRawOutput(rawOutput); // POST execution
console.log("[NORMALIZED]", normalized); // Claude chỉ nhận normalized.`},
  6: {title:"Local review rồi cross-file integration",code:`// Local passes: độc lập → chạy parallel và in usage mỗi call.
const local = await Promise.all(files.map(async file =>
  askClaude(reviewPrompt(file), "review:" + file.name)
));
// Integration phụ thuộc findings từ tất cả files.
const crossFile = await askClaude(JSON.stringify(local), "integration");
console.log("[cross-file]", crossFile);`},
  7: {title:"Messages history analogy (NOT SDK sessions)",code:`// Chỉ là mảng messages trong APPLICATION LAYER, không phải Agent SDK session.
const baseline = [{role:"user",content:"Analyze this code"}];
const prior = await askClaude(baseline,"baseline");
const resumeLike = [...baseline,{role:"assistant",content:prior},
                    {role:"user",content:"Continue"}];
const forkA = [...resumeLike], forkB = [...resumeLike];
// Fresh: chỉ inject summary được kiểm chứng, tránh old stale tool results.`},
};
