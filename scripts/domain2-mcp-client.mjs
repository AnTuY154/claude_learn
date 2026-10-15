#!/usr/bin/env node
/**
 * LESSON 2.2 — REAL MCP CLIENT + deterministic recovery POLICY.
 *
 * This is an actual MCP client calling a real MCP server over stdio JSON-RPC.
 * It does NOT call the Claude model. Later you can pass client.listTools()
 * definitions to Claude and dispatch model tool calls through client.callTool().
 *
 * npm install --no-save --package-lock=false @modelcontextprotocol/server @modelcontextprotocol/client zod
 * npm run lab:domain2:mcp:client
 */
import {recover} from "./domain2-core.mjs";
let Client,StdioClientTransport;
try{
  ({Client}=await import("@modelcontextprotocol/client"));
  ({StdioClientTransport}=await import("@modelcontextprotocol/client/stdio"));
}catch{
  console.error("Install optional MCP SDK v2 packages first (see docs/domain2-build-exercises.md).");
  process.exit(1);
}

const client=new Client({name:"domain2-exercise-client",version:"1.0.0"});
const transport=new StdioClientTransport({
  command:process.execPath,
  args:["scripts/domain2-mcp-server.mjs"],
  cwd:process.cwd()
});
try{
  // MCP handshake, server subprocess starts automatically.
  await client.connect(transport);
  const tools=await client.listTools();
  console.log("[MCP TOOLS]",tools.tools.map(t=>({name:t.name,description:t.description?.slice(0,80)})));
  const resources=await client.listResources();
  console.log("[MCP RESOURCES]",resources.resources.map(r=>r.uri));
  const schema=await client.readResource({uri:"demo://customers/schema"});
  console.log("[MCP RESOURCE READ]",schema.contents);

  async function lookup(args){
    // Actual JSON-RPC tools/call via SDK, NOT a direct JS handler invocation.
    const result=await client.callTool({name:"customer_lookup",arguments:args});
    console.log("[TOOL RESULT]",JSON.stringify({input:args,isError:result.isError,structuredContent:result.structuredContent}));
    return result;
  }

  // TRANSIENT: first two attempts simulate timeout. Third is success.
  const transient=await recover(
    attempt=>lookup({customerId:"C001",failureMode:attempt<3?"transient":"none"}),
    {maximumAttempts:3,wait:async ms=>new Promise(resolve=>setTimeout(resolve,ms))}
  );
  console.log("[TRANSIENT RECOVERY]",{action:transient.action,attempts:transient.attempt});

  // VALIDATION: retries with same input are NOT useful. Change input.
  const invalid=await recover(()=>lookup({customerId:"abc"}));
  console.log("[VALIDATION DECISION]",{action:invalid.action,attempts:invalid.attempt});
  if(invalid.action==="CORRECT_INPUT_THEN_NEW_CALL"){
    const corrected=await lookup({customerId:"C001"});
    console.log("[VALIDATION CORRECTED]",corrected.structuredContent);
  }

  // BUSINESS: do not bypass policy, do not retry same call.
  const business=await recover(()=>lookup({customerId:"C001",failureMode:"business"}));
  console.log("[BUSINESS DECISION]",{action:business.action,attempts:business.attempt});

  // PERMISSION: needs legitimate authorisation, not a different userId field.
  const permission=await recover(()=>lookup({customerId:"C001",failureMode:"permission"}));
  console.log("[PERMISSION DECISION]",{action:permission.action,attempts:permission.attempt});

  // EMPTY SUCCESS: do not retry. This differs from access failure.
  const empty=await recover(()=>lookup({customerId:"C999"}));
  console.log("[VALID EMPTY]",{action:empty.action,resultCount:empty.result.structuredContent?.resultCount});

  console.log("[LAB 2.2 COMPLETE] MCP server/client and recovery policy tested (NO model invocation).");
}catch(error){
  console.error("[MCP CLIENT ERROR]",error instanceof Error?error.message:String(error));
  process.exitCode=1;
}finally{
  await client.close();
}
