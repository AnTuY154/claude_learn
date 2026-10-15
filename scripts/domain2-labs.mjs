#!/usr/bin/env node
/**
 * DOMAIN 2 — FIVE EXERCISES
 * npm run lab:domain2 -- 1 : REAL Anthropic API tool selection (20 requests)
 * npm run lab:domain2 -- 2 : local error recovery preview
 * npm run lab:domain2 -- 3 : role scoping + tool_choice demo
 * npm run lab:domain2 -- 4 : MCP configuration safety checks
 * npm run lab:domain2 -- 5 : create codebase for Grep/Glob/Read/Edit practice
 *
 * Only lab 1 calls Claude and incurs token charges. Labs 2–5 never call an LLM.
 * For REAL MCP JSON-RPC tool execution, use lab:domain2:mcp:client.
 */
import fs from "node:fs";
import path from "node:path";
import {customerLookup,recover,TOOL_ROLES,TOOL_CHOICES,isAllowedDocumentUrl} from "./domain2-core.mjs";
const task=process.argv[2];
const cases=[
["Check order #12345","lookup_order"],
["Find customer by email jane@example.com","get_customer"],
["Where is the shipment for order #98765?","lookup_order"],
["Is customer C001 active?","get_customer"],
["Track shipping ID TRK-123","lookup_order"],
["Verify account holder phone +15550101","get_customer"],
["What items are in order #33333?","lookup_order"],
["Look up customer loyalty tier by ID 9001","get_customer"],
["Is order #44444 eligible for refund?","lookup_order"],
["What is customer account status for C002?","get_customer"]
];
const input_schema={type:"object",properties:{identifier:{type:"string"}},required:["identifier"],additionalProperties:false};
function definitions(improved){
  return improved?[
    {name:"get_customer",description:"Find a customer by ID, email or phone. Returns profile, status and loyalty tier. Example: Find jane@example.com. No match returns an empty result. NEVER use for order IDs, tracking or refund status; use lookup_order.",input_schema},
    {name:"lookup_order",description:"Look up order #NNNNN or tracking identifier TRK-NNN. Returns items, shipping status and refund eligibility. Example: Check order #12345. Invalid order IDs cause validation errors. NEVER use for identity, contacts or loyalty tier; use get_customer.",input_schema}
  ]:[
    {name:"get_customer",description:"Retrieves customer information.",input_schema},
    {name:"lookup_order",description:"Retrieves order details.",input_schema}
  ];
}
async function lesson21(){
  if(!process.env.ANTHROPIC_API_KEY||!process.env.ANTHROPIC_MODEL)
    throw Error("Set ANTHROPIC_API_KEY and ANTHROPIC_MODEL locally for Lesson 2.1; this lab makes 20 paid API requests.");
  const {default:Anthropic}=await import("@anthropic-ai/sdk");
  const client=new Anthropic();
  for(const improved of [false,true]){
    const label=improved?"IMPROVED":"BASELINE";
    let correct=0,notSelected=0;
    for(const [index,[question,expected]] of cases.entries()){
      // tool_choice:auto means TEXT is legal. Never fabricate a tool selection.
      const response=await client.messages.create({
        model:process.env.ANTHROPIC_MODEL,max_tokens:200,
        tool_choice:{type:"auto"},tools:definitions(improved),
        messages:[{role:"user",content:question}]
      });
      const selected=response.content.find(x=>x.type==="tool_use")?.name??"NONE";
      correct+=Number(selected===expected);notSelected+=Number(selected==="NONE");
      console.log(JSON.stringify({label,index:index+1,question,expected,selected,
        stop_reason:response.stop_reason,input_tokens:response.usage.input_tokens,
        output_tokens:response.usage.output_tokens}));
    }
    console.log("[ACTUAL SELECTION SCORE]",{label,correct,total:cases.length,notSelected});
  }
  console.log("[NOTE] This measures model-selected tool names; it does not run backend handlers or guarantee improvement.");
}
async function lesson22(){
  for(const [label,args] of [
    ["transient",{customerId:"C001",failureMode:"transient"}],
    ["validation",{customerId:"bad"}],
    ["business",{customerId:"C001",failureMode:"business"}],
    ["permission",{customerId:"C001",failureMode:"permission"}],
    ["valid_empty",{customerId:"C999"}]
  ]){
    const result=customerLookup(args);
    const decision=await recover(async()=>result,{wait:async()=>{}});
    console.log("[2.2 LOCAL]",{label,isError:result.isError,structuredContent:result.structuredContent,
      action:decision.action,attempt:decision.attempt});
  }
  const resolved=await recover(async attempt=>customerLookup({
    customerId:"C001",failureMode:attempt<3?"transient":"none"
  }),{wait:async()=>{}});
  console.log("[2.2 RECOVERED ON 3rd CALL]",{action:resolved.action,attempts:resolved.attempt});
  console.log("[NEXT] npm run lab:domain2:mcp:client  // actual MCP transport, no Claude model");
}
function lesson23(){
  for(const [role,tools] of Object.entries(TOOL_ROLES)){
    if(tools.length<4||tools.length>5)throw Error("Role tool count unexpected: "+role);
    console.log("[2.3 ROLE]",role,tools);
  }
  console.log("[TOOL_CHOICE CONFIGURATIONS]",TOOL_CHOICES);
  console.log("[CAVEAT] Newer Claude models may reject tool_choice any or named forcing. Check model docs.");
  for(const url of ["https://docs.example.test/approved/report.pdf","https://docs.example.test/private/key",
      "http://docs.example.test/approved/a","https://evil.example.test/approved/a"]){
    console.log("[SCOPED load_document]",url,isAllowedDocumentUrl(url));
  }
  console.log("[SECURITY] This allowlist is a teaching example, not complete SSRF protection.");
}
function lesson24(){
  const file=path.resolve("examples/domain2/mcp-project.example.json");
  const cfg=JSON.parse(fs.readFileSync(file,"utf8"));
  if(!cfg.mcpServers||Object.keys(cfg.mcpServers).length===0)throw Error("Missing mcpServers");
  const text=JSON.stringify(cfg);
  if(!text.includes("$"+"{TEAM_MCP_TOKEN}"))throw Error("Missing env variable placeholder");
  for(const [name,server] of Object.entries(cfg.mcpServers)){
    if(server.url&&server.type!=="http")throw Error("Remote server needs type:http: "+name);
    if(!server.url&&!server.command)throw Error("Server needs URL or command: "+name);
    console.log("[2.4]",name,server.url?"Remote HTTP":"Local stdio");
  }
  console.log("[SCOPE] project .mcp.json shared; user ~/.claude.json personal; local scope supported.");
  console.log("[MCP RESOURCE] demo://customers/schema served by scripts/domain2-mcp-server.mjs");
  console.log("[NOTE] Template contains no real tokens or real remote service. No network call occurred.");
}
const files={
  "package.json":JSON.stringify({private:true,type:"module",scripts:{test:"node --test"}},null,2)+"\n",
  "src/orders.js":"export function processOrder(id,{validate=true}={}) { if(validate&&typeof id!=='string')throw Error('INVALID_ORDER_ID'); return {id,status:'ok'}; }\n// Deprecated\nexport function processLegacyOrder(id){ return processOrder(id,{validate:false}); }\n",
  "src/utils/index.js":"// Barrel alias; grep for submitOrder after reading this file.\nexport {processLegacyOrder as submitOrder} from '../orders.js';\n",
  "src/OrderProcessor.js":"import {processLegacyOrder} from './orders.js';\nexport const processIncoming=id=>processLegacyOrder(id);\n",
  "src/RefundHandler.js":"import {processLegacyOrder} from './orders.js';\nexport const retryRefund=id=>processLegacyOrder(id);\n",
  "src/Checkout.js":"import {submitOrder} from './utils/index.js';\nexport const checkout=id=>submitOrder(id);\n",
  "src/Cart.js":"import {submitOrder} from './utils/index.js';\nexport const cartCheckout=id=>submitOrder(id);\n",
  "src/QuickBuy.js":"import {submitOrder} from './utils/index.js';\nexport const quickBuy=id=>submitOrder(id);\n",
  "src/OrderProcessor.test.js":"import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport {processIncoming} from './OrderProcessor.js';\ntest('order processor',()=>assert.equal(processIncoming('A1').id,'A1'));\n",
  "src/Checkout.test.js":"import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport {checkout} from './Checkout.js';\ntest('checkout',()=>assert.equal(checkout('B1').id,'B1'));\n",
  "README.md":"# Lesson 2.5 codebase fixture\n\n1. Grep processLegacyOrder to find direct callers and definition.\n2. Glob **/*.test.js to find caller tests.\n3. Read src/utils/index.js and find alias submitOrder.\n4. Grep submitOrder to find Checkout, Cart, QuickBuy.\n5. Edit each caller to processOrder(id,{validate:true}), including barrel.\n6. Bash: npm test; review git diff. Do not read all files upfront.\n"
};
function lesson25(){
  const dir=path.resolve("domain2-builtins-workspace");
  if(fs.existsSync(dir))throw Error("Workspace already exists, refusing to overwrite: "+dir);
  fs.mkdirSync(dir,{recursive:true});
  for(const [relative,source] of Object.entries(files)){
    const file=path.join(dir,relative);fs.mkdirSync(path.dirname(file),{recursive:true});
    fs.writeFileSync(file,source,{flag:"wx"});
  }
  console.log("[2.5] Created",Object.keys(files).length,"files in",dir);
  console.log("[NEXT] cd domain2-builtins-workspace && npm test && claude");
  console.log("[PROMPT] Grep -> Glob tests -> Read barrel -> Grep alias -> Edit -> Bash tests.");
}
try{
  if(task==="1")await lesson21();
  else if(task==="2")await lesson22();
  else if(task==="3")lesson23();
  else if(task==="4")lesson24();
  else if(task==="5")lesson25();
  else throw Error("Usage: npm run lab:domain2 -- <1|2|3|4|5>");
}catch(error){
  console.error("[DOMAIN2 LAB ERROR]",error instanceof Error?error.message:String(error));
  process.exitCode=1;
}
