#!/usr/bin/env node
/**
 * LESSON 1.5 — CLAUDE AGENT SDK HOOKS THẬT.
 * Phụ thuộc OPTIONAL (không nằm trong Next.js/GitHub Pages build):
 * npm install --no-save --package-lock=false @anthropic-ai/claude-agent-sdk
 * ANTHROPIC_API_KEY và ANTHROPIC_MODEL được cấp ở local CLI.
 * Chỉ cho phép Claude ĐỌC README.md; tuyệt đối không sửa file.
 *
 * SDK Docs: https://code.claude.com/docs/en/agent-sdk/hooks
 */
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Provide ANTHROPIC_API_KEY locally before running the SDK lab.");
  process.exit(1);
}
let query;
try { ({ query } = await import("@anthropic-ai/claude-agent-sdk")); }
catch { console.error("Install optional package: npm install --no-save --package-lock=false @anthropic-ai/claude-agent-sdk"); process.exit(1); }

// PreToolUse chạy TRƯỚC khi Read tool thực thi; có thể ngăn quyền truy cập.
async function preRead(input) {
  if (input.hook_event_name !== "PreToolUse") return {};
  const path=String(input.tool_input?.file_path??"");
  console.log("[PreToolUse]",{tool:input.tool_name,requestedPath:path});
  // Chặn bí mật, chỉ chấp nhận README.md trong chính repository.
  if (!/(^|[/\\])README\.md$/.test(path) || path.includes("..")) {
    console.log("[PreToolUse] DENY",path);
    return {hookSpecificOutput:{
      hookEventName:"PreToolUse",permissionDecision:"deny",
      permissionDecisionReason:"Demo only permits README.md"
    }};
  }
  return {}; // allowedTools/permission system vẫn quyết định quyền.
}
// PostToolUse chạy SAU khi Read trả output; thay đổi ở đây KHÔNG rollback lần đọc.
async function postRead(input){
  if(input.hook_event_name !== "PostToolUse") return {};
  console.log("[PostToolUse]",{tool:input.tool_name,tool_use_id:input.tool_use_id});
  return {hookSpecificOutput:{
    hookEventName:"PostToolUse",
    additionalContext:"[DEMO] Tool output was inspected by a PostToolUse hook."
  }};
}
console.log("[SDK] Start real hook lifecycle demo");
try {
  for await(const message of query({
    prompt:"Read README.md in this repository and summarize two facts. Do not edit anything.",
    options:{
      model:process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
      cwd:process.cwd(), maxTurns:4,
      allowedTools:["Read"],
      hooks:{
        PreToolUse:[{matcher:"Read",hooks:[preRead]}],
        PostToolUse:[{matcher:"Read",hooks:[postRead]}]
      }
    }
  })){
    if(message.type==="system"&&message.subtype==="init")
      console.log("[SDK SESSION]",message.session_id);
    if(message.type==="assistant")
      console.log("[SDK ASSISTANT]",message.message?.content?.filter(x=>x.type==="text").map(x=>x.text).join("\n")?.slice(0,1200));
    if(message.type==="result")
      console.log("[SDK RESULT]",{
        subtype:message.subtype,usage:message.usage,total_cost_usd:message.total_cost_usd
      });
  }
}catch(e){console.error("[SDK ERROR]",e instanceof Error?e.message:String(e));process.exitCode=1;}
