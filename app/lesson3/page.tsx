"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { Finding } from "@/lib/context-passing";

type Result = {
  mode: "good" | "bad";
  findings: Finding[];
  passedContext: unknown;
  report: string;
  trace: { step: string; actor: string; note: string; durationMs?: number }[];
  limitation: string;
};

export default function Lesson3Page() {
  const [topic, setTopic] = useState("Next.js và SEO");
  const [webSource, setWebSource] = useState(
    "Source URL: https://nextjs.org/docs/app/building-your-application/rendering\n" +
    "Demo excerpt (do not treat as a verified quotation): Next.js supports server rendering and pre-rendering strategies."
  );
  const [documentSource, setDocumentSource] = useState(
    "Document: internal-seo-report.md\nPage 1\n" +
    "Demo internal note: team plans to measure Core Web Vitals and improve metadata. No measured SEO uplift is available."
  );
  const [mode, setMode] = useState<"good" | "bad">("good");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/context-passing", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, webSource, documentSource, mode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Research thất bại.");
      setResult(data as Result);
    } catch (err) { setError(err instanceof Error ? err.message : "Unknown error"); }
    finally { setLoading(false); }
  }

  return (
    <main style={{ maxWidth: 930, margin: "0 auto", padding: "32px 20px", lineHeight: 1.6 }}>
      <p><Link href="/lesson2">← Lesson 2</Link></p>
      <h1>Lesson 3 — Subagent Invocation &amp; Context Passing</h1>
      <p>Thực hành: 2 research calls song song → Coordinator giữ metadata → Synthesis Agent trích dẫn nguồn.</p>
      <p><strong>Lưu ý:</strong> Đây là mô phỏng subagent bằng Messages API hiện có trong repo, không phải Agent tool của Claude Agent SDK.</p>
      <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
        <label>Research topic
          <input value={topic} maxLength={500} onChange={e => setTopic(e.target.value)} required
            style={{ display: "block", width: "100%", padding: 10 }} />
        </label>
        <label>Web source (phải có URL, nội dung trích đoạn)
          <textarea value={webSource} onChange={e => setWebSource(e.target.value)}
            rows={5} maxLength={8000} required style={{ display: "block", width: "100%", padding: 10 }} />
        </label>
        <label>Document source (tên tài liệu, nội dung, số trang nếu có)
          <textarea value={documentSource} onChange={e => setDocumentSource(e.target.value)}
            rows={5} maxLength={8000} required style={{ display: "block", width: "100%", padding: 10 }} />
        </label>
        <fieldset style={{ padding: 12 }}>
          <legend>Context Passing Mode</legend>
          <label><input type="radio" checked={mode === "good"} onChange={() => setMode("good")} /> GOOD — Truyền đủ metadata</label>
          <div><label><input type="radio" checked={mode === "bad"} onChange={() => setMode("bad")} /> BAD — Cố tình xóa metadata (so sánh lỗi)</label></div>
        </fieldset>
        <button type="submit" disabled={loading} style={{ padding: 12, cursor: "pointer" }}>
          {loading ? "Đang gọi Claude..." : "Run lesson 3"}
        </button>
      </form>
      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
      {result && (
        <section aria-live="polite">
          <h2>1. Findings từ 2 subagent (dữ liệu gốc)</h2>
          <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{JSON.stringify(result.findings, null, 2)}</pre>
          <h2>2. Context thực sự gửi đến synthesis</h2>
          <p>Chuyển GOOD/BAD rồi chạy lại để thấy metadata thay đổi.</p>
          <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{JSON.stringify(result.passedContext, null, 2)}</pre>
          <h2>3. Synthesis report</h2>
          <div style={{ whiteSpace: "pre-wrap" }}>{result.report}</div>
          <h2>4. Coordinator trace</h2>
          <ol>{result.trace.map((item, i) => <li key={i}>{item.actor} / {item.step}: {item.note} {item.durationMs !== undefined ? "(" + item.durationMs + "ms)" : ""}</li>)}</ol>
          <p><em>{result.limitation}</em></p>
        </section>
      )}
    </main>
  );
}
