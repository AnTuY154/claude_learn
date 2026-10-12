#!/usr/bin/env node
/**
 * LESSON 1.7 — CLAUDE AGENT SDK SESSIONS THẬT (query() V1 interface).
 * npm install --no-save --package-lock=false @anthropic-ai/claude-agent-sdk
 *
 * Lưu ý: forkSession sao chép CONVERSATION HISTORY, không cách ly filesystem.
 * Script này chỉ hỏi lý thuyết, không yêu cầu agent ghi file.
 * SDK Docs: https://code.claude.com/docs/en/agent-sdk/sessions
 */
if(!process.env.ANTHROPIC_API_KEY){console.error("Set ANTHROPIC_API_KEY locally.");process.exit(1);}
let query;
try{({query}=await import("@anthropic-ai/claude-agent-sdk"));}
catch{console.error("Install the optional Claude Agent SDK before running.");process.exit(1);}
const model=process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";
async function run(label,prompt,extraOptions={}){
  let id;
  console.log("[SESSION STEP]",label);
  for await(const message of query({prompt,options:{model,maxTurns:3,allowedTools:[],...extraOptions}})){
    if(message.type==="system"&&message.subtype==="init") {
      id=message.session_id; console.log("[SESSION ID]",id);
    }
    if(message.type==="assistant") console.log("[ASSISTANT]",message.message?.content?.filter(x=>x.type==="text").map(x=>x.text).join("\n")?.slice(0,1200));
    if(message.type==="result")console.log("[USAGE/COST]",{subtype:message.subtype,usage:message.usage,total_cost_usd:message.total_cost_usd});
  }
  return id;
}
try{
  // START: tạo một session thật và nhận session_id do SDK trả.
  const original=await run("baseline","Analyze this short sample: function total(price,qty){return price*qty}. Do not edit files.");
  if(!original)throw Error("SDK did not provide session ID.");
  // FORK: giữ session nguồn không thay đổi, tạo independent session history.
  const fork=await run("fork","Explore validation as an alternative design. Do not edit files.",{resume:original,forkSession:true});
  console.log("[FORK RESULT]",{original,fork,distinct:!!fork&&fork!==original});
  // RESUME: tiếp tục vào session gốc.
  await run("resume-original","Continue the original analysis, without changing any files.",{resume:original});
  // FRESH: không reuse old raw tool output; inject curated summary/new code.
  await run("fresh-curated-summary","Validated prior summary: total multiplies price and quantity. Current implementation has changed: function total(price,qty){ if(qty<1) throw Error('qty'); return price*qty; }. Analyze this CURRENT source only.");
}catch(e){console.error("[SDK SESSION ERROR]",e instanceof Error?e.message:String(e));process.exitCode=1;}
