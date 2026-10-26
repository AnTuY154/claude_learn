#!/usr/bin/env node
/**
 * Claude Code Domain 3 — local exercises.
 * Run: npm run lab:domain3 -- <1|2|3|4|5|6>
 * Never uses API keys, Claude models, home config or a real CI workflow.
 */
import fs from "node:fs";
import path from "node:path";
const id=Number(process.argv[2]);
if(!Number.isInteger(id)||id<1||id>6){console.error("Expected lesson 1..6");process.exit(1);}
const dir=path.resolve("domain3-workspaces","lesson3"+id);
if(fs.existsSync(dir)){console.error("Workspace exists; refusing to overwrite: "+dir);process.exit(1);}
const files={};
function add(p,t){files[p]=t.trim()+"\n";}
const steps=[];
if(id===1){
  add("CLAUDE.md","# Team conventions\nUse PascalCase for React components.\nAPI errors use { data, error }.\n@./standards/testing.md\n@./standards/naming.md");
  add("standards/testing.md","# Testing standards\nTest success and error cases.\nMock network dependencies.");
  add("standards/naming.md","# Naming\nUse camelCase for functions and PascalCase for components.");
  add("packages/api/CLAUDE.md","# Package-specific rules\nValidate API inputs server-side.");
  add("packages/api/route.js","export const GET=()=>({data:[],error:null});");
  add("CLAUDE.local.md","# Local-only personal notes\nPrefer concise answers.");
  add(".gitignore","CLAUDE.local.md");
  steps.push("Inspect root and nested CLAUDE.md, and @ imports.","Keep CLAUDE.local.md gitignored.","Run claude and inspect /memory and /context.","Read packages/api/route.js and inspect /context again.");
}
if(id===2){
  add("CLAUDE.md","# Shared team conventions\nKeep code readable, test changed public contracts.");
  add(".claude/skills/review/SKILL.md","---\ndescription: Review staged code changes for bugs and secrets.\nargument-hint: '[file or directory]'\n---\nReview $ARGUMENTS, return findings with file and evidence.");
  add(".claude/skills/analyse-feature/SKILL.md","---\ndescription: Trace feature dependencies and return a concise summary.\ncontext: fork\nallowed-tools:\n  - Read\n  - Grep\n  - Glob\nargument-hint: '[feature path]'\n---\nAnalyse $ARGUMENTS. Return only affected files and risks.\nNote: allowed-tools is pre-approval, not strict security denial.");
  add(".claude/commands/deploy-check.md","Review deployment readiness for $ARGUMENTS. Do not deploy.");
  add("src/auth.js","export const canRead=user=>Boolean(user?.id);");
  steps.push("Compare a flat .claude/commands/*.md command with a directory SKILL.md.","Run /review src/auth.js in Claude Code.","Run /analyse-feature src/auth.js; inspect forked output.","Explain why allowed-tools does not deny other tools.");
}
if(id===3){
  add("CLAUDE.md","# Always-on conventions\nSpecific rules live in .claude/rules/.");
  add(".claude/rules/testing.md","---\npaths: ['**/*.test.ts','**/*.test.tsx','**/*.spec.ts']\n---\n# Test rules\nTest success and failure paths; mock network boundaries.");
  add(".claude/rules/api.md","---\npaths: ['src/api/**/*','app/api/**/*']\n---\n# API rules\nValidate inputs, return {data,error}, log request IDs.");
  add(".claude/rules/terraform.md","---\npaths: ['terraform/**/*','**/*.tf']\n---\n# IaC rules\nUse remote state and tagged resources.");
  add("src/Button.test.tsx","// Test-rule example\nexport const testName='renders Button';");
  add("src/api/orders/route.ts","// API-rule example\nexport const GET=()=>({data:[],error:null});");
  add("terraform/main.tf",'terraform { required_version = ">= 1.5" }');
  steps.push("Inspect the YAML frontmatter globs in three rules.","Read src/Button.test.tsx then run /context.","Read src/api/orders/route.ts then run /context.","Read terraform/main.tf then run /context and compare loaded rules.");
}
if(id===4){
  add("CLAUDE.md","# Planning lab\nPlan the multi-file migration before editing. Test the implemented changes.");
  add("src/legacy-date.js","export const oldDate=ms=>new Date(ms).toISOString().slice(0,10);");
  for(const name of ["orders","invoice","report"])
    add("src/"+name+".js","import {oldDate} from './legacy-date.js';\nexport const "+name+"Date=ms=>oldDate(ms);");
  add("src/profile.js","// Known bug: null user throws. Direct execution is appropriate.\nexport const displayName=user=>user.name.toUpperCase();");
  add("package.json",JSON.stringify({type:"module",scripts:{test:"node --test"}},null,2));
  steps.push("Start claude --permission-mode plan; confirm Plan in UI.","Plan oldDate migration across three callers; do not edit during Plan.","Use direct execution for the known null guard in profile.js.","Approve migration plan; implement, then verify tests and diff.","Use Explore to isolate verbose file discovery if needed.");
}
if(id===5){
  add("CLAUDE.md","# Iterative refinement workshop\\nUse before/after demonstrations and treat failing tests as objective feedback.");
  add("src/migrate.js",`// INTENTIONALLY INCORRECT implementation; fix after reading the failing tests.
export function normalise(value){
  if(value===null) return "";
  if(Array.isArray(value)) return value.length===0 ? ["placeholder"] : value;
  return value;
}
export async function loadAndMap(fetcher){
  try {
    const response=await fetcher();
    return {ok:true,data:normalise(response)};
  } catch(error) {
    return {ok:false,error:"unknown"};
  }
}`);
  add("src/migrate.test.js",`import test from "node:test";
import assert from "node:assert/strict";
import {normalise,loadAndMap} from "./migrate.js";
test("success: existing value preserved",()=>assert.equal(normalise("ready"),"ready"));
test("null: null must remain null",()=>assert.equal(normalise(null),null));
test("empty list: empty remains empty",()=>assert.deepEqual(normalise([]),[]));
test("successful fetch: returns source data",async()=>{
  assert.deepEqual(await loadAndMap(async()=>["booking"]),{ok:true,data:["booking"]});
});
test("rejected fetch: explicit error code mapping",async()=>{
  const result=await loadAndMap(async()=>{throw Object.assign(new Error("Timed out"),{code:"ETIMEDOUT"});});
  assert.deepEqual(result,{ok:false,error:"ETIMEDOUT"});
});`);
  add("package.json",JSON.stringify({type:"module",scripts:{test:"node --test src/migrate.test.js"}},null,2));
  add("before-after.md",`# Concrete transformation pairs (written for this workshop)
Input: getBooking(id: string): Promise<Booking>
Expected: getBooking(id: string): Promise<Result<Booking, ApiError>>

Input: listGuests(bookingId: string): Promise<Guest[]>
Expected: listGuests(bookingId: string): Promise<Result<Guest[], ApiError>>

Unseen verification case: fetchRoom(id: string): Promise<Room>
What result should the new signature produce?`);
  add("experiment.md",`# Lesson 3.5: practice log
## 1. Prose-only test: record actual output from three attempts
Attempt 1:
Attempt 2:
Attempt 3:
## 2. Concrete examples: compare another three attempts and an unseen function
Attempt 1:
Attempt 2:
Attempt 3:
Unseen function:
## 3. Share the REAL npm test failure with Claude Code
Tests initially fail for null, empty list and rejected fetch mapping.
Do not claim all tests were successful until npm test passes.
## 4. Interview unfamiliar caching requirements
Ask about TTL, invalidation, consistency, capacity and failure behaviour BEFORE coding.
## 5. Batch interacting corrections
Change {error.code} response shape, logger format and client types in one message.
Compare the complete contracts after the change.`);
  steps.push("Run npm test and keep the actual failure output; do not fabricate model behaviour.");
  steps.push("Run the same prose-only transformation three times and record the real variations, if any.");
  steps.push("Use the 2–3 examples from before-after.md; repeat three times and verify an unseen input.");
  steps.push("Share failing null/empty/error tests with Claude until each actual failing assertion passes.");
  steps.push("Interview the developer about unfamiliar caching constraints; then batch interdependent error/log/type changes.");
}
if(id===6){
  add("CLAUDE.md","# CI review conventions\nReview current code with evidence. Do not print credentials.");
  add("previous-findings.json",JSON.stringify({findings:[{file:"src/auth.js",rule:"AUTH_BYPASS",status:"acknowledged"}]},null,2));
  add("src/auth.js","export const canRead=user=>Boolean(user?.id);");
  add("scripts/check-review.mjs","import fs from 'node:fs';\nconst prev=JSON.parse(fs.readFileSync('previous-findings.json','utf8'));\nconst all=[{file:'src/auth.js',rule:'AUTH_BYPASS'},{file:'src/auth.js',rule:'MISSING_AUDIT'}];\nconst prior=new Set(prev.findings.filter(x=>x.status==='acknowledged').map(x=>x.file+':'+x.rule));\nconsole.log(JSON.stringify({newFindings:all.filter(x=>!prior.has(x.file+':'+x.rule))},null,2));\n// Deterministic dedupe DEMO: does not call Claude or validate code.");
  add(".github/workflows/claude-review.example.yml",[
    "# Sandbox template only. Install Claude CLI and review permissions before enabling.",
    "name: Claude Review Example","on:","  workflow_dispatch:","permissions:","  contents: read",
    "jobs:","  review:","    runs-on: ubuntu-latest","    steps:",
    "      - uses: actions/checkout@v4",
    "      - name: Review (requires Claude CLI installed on runner)",
    "        env:","          ANTHROPIC_API_KEY: $"+"{{ secrets.ANTHROPIC_API_KEY }}",
    "        run: |",
    "          claude -p --output-format json --json-schema '{\"type\":\"object\",\"properties\":{\"findings\":{\"type\":\"array\"}},\"required\":[\"findings\"]}' 'Review current code' > result.json",
    "          node -e \"console.log(require('./result.json').structured_output)\""
  ].join("\n"));
  steps.push("Inspect the sandbox workflow; it is NOT activated in the website repository.","Understand -p, --output-format json, --json-schema and structured_output.","Run node scripts/check-review.mjs to observe deterministic deduplication.","Use a separate fresh invocation to review generated code.","Review CI secrets, costs and permissions before running real pipelines.");
}
add("README.md",["# Claude Code Lesson 3."+id,"","Generated local sandbox. No API/model calls have occurred.","Use an authenticated CLI for real /context, skills, plan and -p observations.","",...steps.map((s,i)=>(i+1)+". "+s)].join("\n"));
for(const [rel,data] of Object.entries(files)){
 const p=path.join(dir,rel);fs.mkdirSync(path.dirname(p),{recursive:true});
 fs.writeFileSync(p,data,{flag:"wx"});
}
console.log("[DOMAIN3] Created",Object.keys(files).length,"files in",dir);
console.log("[NEXT] cd domain3-workspaces/lesson3"+id);
console.log("[NO API] No Claude model was invoked.");
