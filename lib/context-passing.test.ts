import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSynthesisContext, normalizeFindings } from "./context-passing.ts";

test("Giữ source URL khi normalize web findings", () => {
  const findings = normalizeFindings({ findings: [{
    claim: "Test claim", analysis: "Test analysis", source_url: "https://example.com",
    confidence: "high"
  }] }, "web");
  assert.equal(findings[0].source_url, "https://example.com");
  assert.equal(findings[0].retrieved_by, "web");
});
test("Document không có page được ghi null, không bịa số trang", () => {
  const findings = normalizeFindings({ findings: [{
    claim: "Demo", analysis: "Evidence", document_name: "report.txt"
  }] }, "document");
  assert.equal(findings[0].page_number, null);
});
test("Thiếu URL ở web source phải bị từ chối", () => {
  assert.throws(() => normalizeFindings({ findings: [{
    claim: "Demo", analysis: "Test"
  }] }, "web"), /source_url/);
});
test("Bad context làm mất URL, Good context giữ URL", () => {
  const finding = normalizeFindings({ findings: [{
    claim: "Demo", analysis: "Test", source_url: "https://example.com"
  }] }, "web");
  assert.doesNotMatch(buildSynthesisContext(finding, "bad"), /example.com/);
  assert.match(buildSynthesisContext(finding, "good"), /example.com/);
});
