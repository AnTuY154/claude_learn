#!/usr/bin/env node
/**
 * BÀI TẬP THẬT: npm run lab -- 1 (đến 7).
 * 
 * - Dùng @anthropic-ai/sdk (Messages API). API requests là THẬT, có token tính phí.
 * - KHÔNG có live web search, giao dịch/refund, hoặc quyền truy cập file thật.
 * - 1.5: pre/post interception minh họa ở application layer, KHÔNG gọi Claude Agent SDK hooks.
 * - 1.7: history branching minh họa app-managed messages, KHÔNG gọi Claude Agent SDK persisted sessions.
 * - Mọi số token được in từ response.usage (không tự bịa số token).
 * - Không log ANTHROPIC_API_KEY. Không commit key vào git.
 */
import Anthropic from "@anthropic-ai/sdk";

const lesson = Number(process.argv[2]);
const bad = process.argv.includes("--bad");
const model = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";
if (!Number.isInteger(lesson) || lesson < 1 || lesson > 7) {
  console.error("Usage: npm run lab -- 1|2|3|4|5|6|7 [--bad]");
  process.exit(1);
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY. Set it locally; never expose it in the browser.");
  process.exit(1);
}
const client = new Anthropic();
let totalIn = 0, totalOut = 0;
const log = (event, obj) => console.log("[" + new Date().toISOString() + "] " + event, obj ?? "");

async function request(label, messages, tools, system, maxTokens=550) {
  log("API REQUEST " + label, { model, message_count: messages.length, tools:tools?.map(t=>t.name)??[] });
  const response = await client.messages.create({
    model, max_tokens:maxTokens, messages,
    ...(tools ? {tools} : {}),
    ...(system ? {system} : {}),
  });
  totalIn += response.usage.input_tokens;
  totalOut += response.usage.output_tokens;
  log("API RESPONSE " + label, {
    id: response.id, stop_reason:response.stop_reason,
    input_tokens:response.usage.input_tokens, output_tokens:response.usage.output_tokens
  });
  // Log toàn bộ text trong DEMO, KHÔNG dùng cho dữ liệu thật chứa thông tin nhạy cảm.
  const text = response.content.filter(b=>b.type==="text").map(b=>b.text).join("\n");
  log("MODEL TEXT " + label, text.slice(0,2300));
  if (response.stop_reason === "max_tokens") log("WARNING", "Response reached max_tokens; incomplete output possible.");
  return response;
}
function asText(message){ return message.content.filter(b=>b.type==="text").map(b=>b.text).join("\n"); }
async function ask(label,prompt,system){
  const result = await request(label,[{role:"user",content:prompt}],undefined,system);
  if(result.stop_reason!=="end_turn") throw Error(label+" requires end_turn; got "+result.stop_reason);
  return asText(result);
}

const mockPrices = { "apple":25000, "rose":12000 };
const tools = [
  {
    name:"lookup_demo_price", description:"Look up a fixed DEMO catalog price in VND (apple or rose).",
    input_schema:{type:"object",properties:{product:{type:"string",enum:["apple","rose"]}},required:["product"],additionalProperties:false}
  },
  {
    name:"calculate_demo_total", description:"Multiply a known unit price by quantity; the app calculates, not the model.",
    input_schema:{type:"object",properties:{unitPrice:{type:"number"},quantity:{type:"integer",minimum:1,maximum:100}},required:["unitPrice","quantity"],additionalProperties:false}
  }
];

async function loopDemo1(){
  // Chỉ dùng giá từ catalog đã lookup, không tin unitPrice do model tự nhập.
  let verifiedUnitPrice = null;
  const messages=[{role:"user",content:"Find the demo price of apple, then calculate the total for 3 apples. Use the tools. Answer in Vietnamese."}];
  for(let turn=1;turn<=8;turn++){
    log("LOOP turn",turn);
    const r=await request("lesson1.turn"+turn,messages,tools);
    if(r.stop_reason==="end_turn"){log("FINAL",asText(r));return;}
    if(r.stop_reason!=="tool_use") throw Error("Unexpected stop_reason: "+r.stop_reason);
    messages.push({role:"assistant",content:r.content});
    const results = r.content.filter(b=>b.type==="tool_use").map(call=>{
      let value;
      if(call.name==="lookup_demo_price"){
        const item=call.input?.product;
        if(!Object.hasOwn(mockPrices,item)) value={error:"Unknown demo product"};
        else { verifiedUnitPrice=mockPrices[item]; value={product:item,unitPrice:verifiedUnitPrice,currency:"VND"}; }
      } else if(call.name==="calculate_demo_total") {
        const {unitPrice,quantity}=call.input??{};
        value=verifiedUnitPrice !== null && unitPrice===verifiedUnitPrice && Number.isInteger(quantity)&&quantity>0&&quantity<=100
          ? {total:verifiedUnitPrice*quantity,currency:"VND"} : {error:"Run lookup_demo_price first and use its trusted unit price"};
      } else value={error:"Tool not supported"};
      log("TOOL RUN "+call.name,{tool_use_id:call.id,input:call.input,result:value});
      return {type:"tool_result",tool_use_id:call.id,content:JSON.stringify(value),...(value.error?{is_error:true}:{})};
    });
    messages.push({role:"user",content:results});
    log("TOOL RESULTS APPENDED",{results:results.length,message_count:messages.length});
  }
  throw Error("Reached safety cap before end_turn (not success).");
}

async function loopDemo4(){
  // Mock refund KHÔNG gọi bất kỳ payment API nào.
  const session={verifiedCustomerId:null};
  function guardedRefund(customerId,amount) {
    if(session.verifiedCustomerId!==customerId) return {status:"BLOCKED",error:"VERIFY_CUSTOMER_FIRST"};
    if(!Number.isFinite(amount)||amount<=0) return {status:"BLOCKED",error:"INVALID_AMOUNT"};
    return {status:"APPROVED_IN_DEMO",amount}; // KHÔNG xử lý tiền thật
  }
  log("GATE PROBE BEFORE VERIFICATION",guardedRefund("C-101",250000));
  const refundTools=[
    {name:"verify_customer",description:"DEMO identity check for customer C-101, with a fixed sample verification code 1234.",
      input_schema:{type:"object",properties:{customerId:{type:"string"},demoCode:{type:"string"}},required:["customerId","demoCode"]}},
    {name:"process_demo_refund",description:"Simulated refund only; requires prior verification and cannot transfer real money.",
      input_schema:{type:"object",properties:{customerId:{type:"string"},amount:{type:"number"}},required:["customerId","amount"]}}
  ];
  const messages=[{role:"user",content:"Demo scenario: verify customer C-101 with code 1234 then process a DEMO refund of 250000 VND. Explain the tool stages in Vietnamese."}];
  for(let turn=1;turn<=8;turn++){
    const r=await request("lesson4.turn"+turn,messages,refundTools);
    if(r.stop_reason==="end_turn"){log("FINAL",asText(r));break;}
    if(r.stop_reason!=="tool_use") throw Error("Unexpected stop: "+r.stop_reason);
    messages.push({role:"assistant",content:r.content});
    const results=r.content.filter(b=>b.type==="tool_use").map(call=>{
      let output;
      if(call.name==="verify_customer"){
        output=call.input.customerId==="C-101" && call.input.demoCode==="1234"
          ? {status:"VERIFIED",customerId:"C-101"}:{status:"DENIED"};
        if(output.status==="VERIFIED")session.verifiedCustomerId="C-101";
      }else if(call.name==="process_demo_refund"){
        output=guardedRefund(call.input.customerId,call.input.amount);
      }else output={status:"BLOCKED"};
      log("GATE/TOOL "+call.name,output);
      return {type:"tool_result",tool_use_id:call.id,content:JSON.stringify(output)};
    });
    messages.push({role:"user",content:results});
    if(turn===8) throw Error("Safety cap hit");
  }
  log("STRUCTURED HUMAN HANDOFF", {
    customerId:"C-101",summary:"Demo refund request 250000 VND",rootCause:"Verification prerequisite",
    refundAmount:250000,recommendedAction:"Confirm user authorization; no real refund processed"
  });
}

async function lesson2(){
  const goal="Overview of demo renewable energy topics: solar, wind, geothermal, tidal, biomass, fusion (fusion is included as a scenario topic, not classified as renewable).";
  const assigned=["solar","wind","geothermal","tidal","biomass","fusion"];
  log("COORDINATOR PLAN",{goal,assigned});
  const [web,doc]=await Promise.all([
    ask("web-research", "Discuss solar, wind and geothermal at a high level. No live browsing; do not invent references. Scope: "+goal),
    ask("document-research","Discuss tidal, biomass and fusion at a high level. No external document is supplied; do not claim one was read. Scope: "+goal)
  ]);
  log("SPECIALISTS COMPLETE",{webLength:web.length,documentLength:doc.length});
  // Đây là HEURISTIC COVERAGE CHECK theo keyword, KHÔNG chứng minh evidence đúng.
  const combined=(web+" "+doc).toLowerCase();
  const missing=assigned.filter(topic=>!combined.includes(topic));
  log("COVERAGE KEYWORD AUDIT",{assigned,missing,verifiedSources:false});
  let refinement=null;
  if(missing.length) {
    // Targeted refinement: chỉ hỏi về phần chưa được nhắc tới, không nghiên cứu lại hết.
    refinement=await ask("targeted-refinement","Discuss these missing example categories without fabricating citations: "+missing.join(", "));
    log("REFINEMENT COMPLETE",{requested:missing});
  }
  const report=await ask("coordinator-synthesis",JSON.stringify({goal,assigned,web,document:doc,refinement})+"\\nCombine without inventing sources. Say unverified where needed.");
  log("FINAL SYNTHESIS",report);
}

async function lesson3(){
  const sourceA={claim:"Example claim A: an app framework supports server-rendered pages.",source_url:"https://example.org/demo",document_name:null,page_number:null,retrieved_by:"web-research"};
  const sourceB={claim:"Example claim B: the internal team plans to measure performance.",source_url:null,document_name:"internal-demo-report.md",page_number:2,retrieved_by:"document-research"};
  const [web,doc]=await Promise.all([
    ask("web-specialist","Analyze this illustrative input ONLY. Do not claim live browsing: "+JSON.stringify(sourceA)),
    ask("document-specialist","Analyze this illustrative note ONLY. Do not claim a real file was read: "+JSON.stringify(sourceB))
  ]);
  const findings=[{...sourceA,analysis:web.slice(0,900)},{...sourceB,analysis:doc.slice(0,900)}];
  // Giữ metadata (GOOD) hoặc chủ động lược bỏ (BAD) để quan sát attribution failure.
  const passed=bad?findings.map(({claim,analysis})=>({claim,analysis})):findings;
  log("COORDINATOR HANDOFF",{mode:bad?"BAD":"GOOD",payload:passed});
  const report=await ask("synthesis", "Synthesize illustrative findings. Only cite provided source metadata. If none is supplied, say citations are unavailable. Do not claim you verified URLs.\n"+JSON.stringify(passed));
  log("FINAL REPORT",report);
}

function parseDateDMY(raw){
  const m=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
  if(!m) throw Error("Invalid DD/MM/YYYY");
  const iso=`${m[3]}-${m[2]}-${m[1]}T00:00:00.000Z`;
  if(new Date(iso).toISOString()!==iso)throw Error("Invalid calendar date");
  return iso;
}
async function lesson5(){
  const tool={name:"get_demo_status",description:"Return a sample shipping status in source-specific formats.",
    input_schema:{type:"object",properties:{source:{type:"string",enum:["unix","regional"]}},required:["source"]}};
  const messages=[{role:"user",content:"Use get_demo_status for sources unix and regional, then summarize normalized dates and statuses in Vietnamese."}];
  for(let turn=1;turn<=7;turn++){
    const r=await request("lesson5.turn"+turn,messages,[tool]);
    if(r.stop_reason==="end_turn"){log("FINAL",asText(r));return;}
    if(r.stop_reason!=="tool_use") throw Error("Unexpected stop: "+r.stop_reason);
    messages.push({role:"assistant",content:r.content});
    const output=r.content.filter(b=>b.type==="tool_use").map(call=>{
      // PreToolUse-ANALOGY: guard before execution (NOT actual Claude Agent SDK hook).
      if(!["unix","regional"].includes(call.input?.source)){
        log("PRE-EXECUTION DENY",call.input);
        return {type:"tool_result",tool_use_id:call.id,content:JSON.stringify({error:"Invalid source"}),is_error:true};
      }
      const raw=call.input.source==="unix"
        ? {source:"unix",timestamp:1781395200,status_code:200}
        : {source:"regional",date:"14/06/2026",status:"P"};
      log("RAW TOOL RESULT",raw);
      // PostToolUse-ANALOGY: normalize result BEFORE model receives it.
      const normalized=raw.source==="unix"
        ? {date:new Date(raw.timestamp*1000).toISOString(),status:"active"}
        : {date:parseDateDMY(raw.date),status:"pending"};
      log("POST-EXECUTION NORMALIZED",normalized);
      return {type:"tool_result",tool_use_id:call.id,content:JSON.stringify(normalized)};
    });
    messages.push({role:"user",content:output});
  }
  throw Error("Safety cap reached.");
}
async function lesson6(){
  const files=[
    {name:"order.ts",content:"export function total(x){ return x.price * x.qty; }"},
    {name:"discount.ts",content:"export const discount=(n)=>n*0.10;"},
    {name:"checkout.ts",content:"import {total} from './order'; export function checkout(x){return total(x);}"},
  ];
  const local=await Promise.all(files.map(async file=>{
    const findings=await ask("local-review:"+file.name,"Review this illustrative TypeScript source. Identify concrete local issues only, no invented line numbers: "+JSON.stringify(file));
    return {file:file.name,findings};
  }));
  log("LOCAL PASSES COMPLETE",local.map(x=>x.file));
  const integrated=await ask("cross-file-integration","Review the cross-file implications, API compatibility and contradictions across these local findings. Do not invent code not shown.\n"+JSON.stringify({files,local}));
  log("INTEGRATED REVIEW",integrated);
}
async function lesson7(){
  // Messages API KHÔNG có persisted Agent SDK session ở đây.
  const initial=[{role:"user",content:"Analyze this illustrative line: const total = price * qty. Explain briefly."}];
  const baseline=await request("baseline",initial);
  const baselineAssistant={role:"assistant",content:baseline.content};
  const common=[...initial,baselineAssistant];
  const tasks=[
    ["resume-like",[...common,{role:"user",content:"Continue analyzing the same code."}]],
    ["fork-A",[...common,{role:"user",content:"Explore refactor strategy A: validation."}]],
    ["fork-B",[...common,{role:"user",content:"Explore refactor strategy B: domain types."}]],
    ["fresh-summary",[{role:"user",content:"Prior validated summary: a simple total function multiplies price and qty. The implementation has CHANGED: it now validates qty >= 1. Analyze ONLY current code: function total(price,qty){ if(qty<1) throw Error('qty'); return price*qty; }"}]]
  ];
  for(const [label,messages] of tasks){
    log("APPLICATION HISTORY "+label,{message_count:messages.length, persistedSDKSession:false});
    const r=await request(label,messages);
    if(r.stop_reason!=="end_turn") log("WARNING",label+" stopped with "+r.stop_reason);
  }
}

log("LAB 1."+lesson+" START",{model,requiresCredits:true,mode:bad?"BAD":"GOOD"});
try {
  if(lesson===1)await loopDemo1();
  if(lesson===2)await lesson2();
  if(lesson===3)await lesson3();
  if(lesson===4)await loopDemo4();
  if(lesson===5)await lesson5();
  if(lesson===6)await lesson6();
  if(lesson===7)await lesson7();
  log("LAB 1."+lesson+" COMPLETE",{total_input_tokens:totalIn,total_output_tokens:totalOut});
}catch(error){
  log("LAB 1."+lesson+" ERROR",error instanceof Error?error.message:String(error));
  log("USAGE BEFORE ERROR",{total_input_tokens:totalIn,total_output_tokens:totalOut});
  process.exitCode=1;
}
