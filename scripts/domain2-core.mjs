/**
 * Domain 2 — reusable, deterministic DEMO business rules.
 * No API keys, no network requests, no customer PII, no real refunds.
 * Imported by the REAL MCP server (2.2) and the local deterministic exercise.
 */

// MCP standard CallToolResult envelope (not a Messages API tool_result).
// The metadata inside structuredContent is APP-DEFINED, not required by MCP.
export function toolError(errorCategory, isRetryable, description) {
  return {
    isError: true,
    content: [{type:"text",text:description}],
    structuredContent: {errorCategory,isRetryable,description}
  };
}

const CUSTOMERS=[
  {id:"C001",name:"Demo Customer A",status:"active"},
  {id:"C002",name:"Demo Customer B",status:"active"}
];

// User-provided failureMode is a DEMONSTRATION control. Never expose a mode
// that bypasses real authentication/authorisation in production!
export function customerLookup({customerId,failureMode="none"}) {
  if(failureMode==="transient")
    return toolError("transient",true,"Simulated upstream timeout. Retry safely with backoff.");
  // This is business-meaningful validation after the MCP shape is accepted.
  if(!/^C[0-9]{3}$/.test(customerId))
    return toolError("validation",false,"Customer ID must match C001 format. Correct input.");
  if(failureMode==="business")
    return toolError("business",false,"Simulated refund exceeds the policy limit. Human approval required.");
  if(failureMode==="permission")
    return toolError("permission",false,"Simulated access denied. Request valid authorisation.");
  const customer=CUSTOMERS.find(x=>x.id===customerId);
  return {
    isError:false,
    content:[{type:"text",text:customer?"Customer found":"Query succeeded: no matching customers"}],
    structuredContent:{resultCount:customer?1:0,customers:customer?[customer]:[]}
  };
}

export const TOOL_ROLES=Object.freeze({
  web:Object.freeze(["search_web","fetch_page","extract_links","save_snippet"]),
  document:Object.freeze(["extract_metadata","extract_data_points","summarize_content","verify_claim"]),
  synthesis:Object.freeze(["compile_report","format_citation","assess_coverage","verify_fact"])
});

export const TOOL_CHOICES=Object.freeze({
  initial:{type:"tool",name:"extract_metadata"},
  later:{type:"auto"},
  any:{type:"any"}
});

// Demo is deliberately narrower than a general fetch_url.
// This validation alone is not a production SSRF defense: redirect, DNS,
// resolved IP ranges, ports, data exfiltration and network egress still matter.
export function isAllowedDocumentUrl(raw) {
  try {
    const u=new URL(raw);
    return u.protocol==="https:"&&u.hostname==="docs.example.test"&&u.port===""&&
      u.pathname.startsWith("/approved/")&&!u.username&&!u.password;
  } catch {return false;}
}

// Agent-side recovery POLICY. The MCP consumer can be a CLI client, an MCP
// host, or your own application; the model does not need to be invoked to test
// these deterministic safety rules.
export async function recover(call,{maximumAttempts=3,wait=async()=>{}}={}) {
  let last=null;
  for(let attempt=1;attempt<=maximumAttempts;attempt++){
    last=await call(attempt);
    if(!last.isError)return {action:"RETURN_RESULT",attempt,result:last};
    const details=last.structuredContent??{};
    if(details.errorCategory==="transient"&&details.isRetryable===true){
      if(attempt<maximumAttempts){await wait(100*2**(attempt-1));continue;}
      return {action:"ESCALATE_TIMEOUT",attempt,result:last};
    }
    if(details.errorCategory==="validation")
      return {action:"CORRECT_INPUT_THEN_NEW_CALL",attempt,result:last};
    if(details.errorCategory==="business")
      return {action:"HUMAN_APPROVAL",attempt,result:last};
    if(details.errorCategory==="permission")
      return {action:"REQUEST_AUTHORISED_ACCESS",attempt,result:last};
    return {action:"UNKNOWN_ERROR",attempt,result:last};
  }
  return {action:"ESCALATE_TIMEOUT",attempt:maximumAttempts,result:last};
}
