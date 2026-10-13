import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

// Test thật phần scaffold/fix, KHÔNG gọi Claude CLI và KHÔNG gọi Anthropic API.
// Script bị chạy trong thư mục tạm, không đụng workspace của người dùng.
const script = path.resolve("scripts/lesson7-workshop.mjs");
function run(cwd:string,command:string) {
  return spawnSync(process.execPath,[script,command],{cwd,encoding:"utf8"});
}
function jsFiles(dir:string):string[]{
  return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const p=path.join(dir,entry.name);
    return entry.isDirectory()?jsFiles(p):(p.endsWith(".js")?[p]:[]);
  });
}

test("Lesson 1.7 workshop: 10 baseline files, summary prerequisite and exactly 3 safe fixes", () => {
  const root=mkdtempSync(path.join(tmpdir(),"lesson7-course-test-"));
  try {
    const workspace=path.join(root,"lesson7-session-workspace");
    const initial=run(root,"setup");
    assert.equal(initial.status,0,initial.stderr);
    const src=path.join(workspace,"src");
    const files=jsFiles(src);
    assert.equal(files.length,10,"The official exercise requires exactly 10 source files");
    const original=Object.fromEntries(files.map(f=>[path.relative(workspace,f),readFileSync(f,"utf8")]));
    assert.match(original["src/auth/permissions.js"],/return true/);
    assert.match(original["src/auth/session.js"],/role: 'admin'/);
    assert.match(original["src/api/orders.js"],/o.id === orderId/);

    // Setup must never destroy previously recorded findings.
    assert.notEqual(run(root,"setup").status,0,"setup refuses to overwrite workspace");

    // Without a real completed summary, allow no mutations.
    assert.notEqual(run(root,"fix").status,0,"fix must require a completed summary");
    assert.equal(readFileSync(path.join(workspace,"src/auth/permissions.js"),"utf8"),original["src/auth/permissions.js"]);

    // Simulate a user COMPLETING the summary; don't claim this is Claude output.
    const summaryPath=path.join(workspace,"findings-summary.md");
    const filled=readFileSync(summaryPath,"utf8").replace(/\[FILL[^\]]*\]/g,"Manual review done");
    writeFileSync(summaryPath,filled);
    const fixed=run(root,"fix");
    assert.equal(fixed.status,0,fixed.stderr);
    assert.match(fixed.stdout,/exactly 3\/10/);

    const changed=files.map(f=>path.relative(workspace,f)).filter(rel=>readFileSync(path.join(workspace,rel),"utf8")!==original[rel]);
    assert.deepEqual(changed.sort(),["src/api/orders.js","src/auth/permissions.js","src/auth/session.js"]);
    assert.match(readFileSync(path.join(workspace,"src/auth/permissions.js"),"utf8"),/user\?\.role === 'admin'/);
    assert.match(readFileSync(path.join(workspace,"src/api/orders.js"),"utf8"),/o\.userId === user\?\.id/);

    const status=run(root,"status");
    assert.equal(status.status,0,status.stderr);
    assert.equal((status.stdout.match(/^\[FILE\].* FIXED$/gm)??[]).length,3);
    assert.equal((status.stdout.match(/^\[FILE\].* BASELINE$/gm)??[]).length,7);
    assert.notEqual(run(root,"fix").status,0,"cannot silently apply patch twice");
  } finally {
    rmSync(root,{recursive:true,force:true});
  }
});
