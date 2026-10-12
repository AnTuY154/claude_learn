import Link from "next/link";

// Trang chủ tĩnh để GitHub Pages render được, không dùng server redirect().
export default function Home() {
  return (
    <main style={{ maxWidth: 900, margin: "60px auto", padding: 24 }}>
      <h1>Claude Learning Lab</h1>
      <p>Học Agentic Architecture bằng lý thuyết, ví dụ TypeScript và quiz.</p>
      <ul>
        <li><Link href="/lesson1">Lesson 1 — Agentic Loops</Link></li>
        <li><Link href="/lesson2">Lesson 2 — Coordinator & Subagents</Link></li>
        <li><Link href="/lesson3">Lesson 3 — Context Passing + Quiz</Link></li>
      </ul>
    </main>
  );
}
