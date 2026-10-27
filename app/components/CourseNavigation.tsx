"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// HEADER CHUNG: sử dụng Next Link để basePath của GitHub Pages được tự động thêm.
// Có thể cuộn ngang trên màn hình nhỏ; aria-current đánh dấu bài đang học.
const items = [
  ["QB", "Question Bank · 7 đề thi", "/question-bank"],
  ["1.1", "Agentic Loops", "/lesson1"],
  ["1.2", "Orchestration", "/lesson2"],
  ["1.3", "Context Passing", "/lesson3"],
  ["1.4", "Enforcement", "/lesson4"],
  ["1.5", "SDK Hooks", "/lesson5"],
  ["1.6", "Decomposition", "/lesson6"],
  ["1.7", "Sessions", "/lesson7"],
  ["2.1", "Tool Interface", "/domain2/lesson1"],
  ["2.2", "Error Responses", "/domain2/lesson2"],
  ["2.3", "Tool Choice", "/domain2/lesson3"],
  ["2.4", "MCP Integration", "/domain2/lesson4"],
  ["2.5", "Built-in Tools", "/domain2/lesson5"],
  ["3.1", "CLAUDE.md", "/domain3/lesson1"],
  ["3.2", "Skills", "/domain3/lesson2"],
  ["3.3", "Path Rules", "/domain3/lesson3"],
  ["3.4", "Plan Mode", "/domain3/lesson4"],
  ["3.5", "Refinement", "/domain3/lesson5"],
  ["3.6", "CI/CD", "/domain3/lesson6"],
  ["4.1", "System Prompts", "/domain4/lesson1"],
  ["4.2", "Few-Shot", "/domain4/lesson2"],
  ["4.3", "Structured Output", "/domain4/lesson3"],
  ["4.4", "Validation & Retry", "/domain4/lesson4"],
  ["4.5", "Batch Processing", "/domain4/lesson5"],
  ["4.6", "Multi-Pass Review", "/domain4/lesson6"],
  ["5.1", "Context Window", "/domain5/lesson1"],
  ["5.2", "Escalation", "/domain5/lesson2"],
  ["5.3", "Error Propagation", "/domain5/lesson3"],
  ["5.4", "Codebase Exploration", "/domain5/lesson4"],
  ["5.5", "Human Calibration", "/domain5/lesson5"],
  ["5.6", "Provenance", "/domain5/lesson6"],
] as const;

export default function CourseNavigation() {
  const pathname = usePathname();
  return (
    <div className="course-header">
      <div className="course-header-inner">
        <Link href="/" className="course-logo" aria-label="Claude Learning Lab — Trang chủ">
          <span>CL</span><strong>Claude Learning Lab</strong>
        </Link>
        <nav className="course-nav" aria-label="Điều hướng bài học và Question Bank">
          {items.map(([number, title, href]) => (
            <Link key={number} href={href} className={pathname === href || pathname?.startsWith(href + "/") ? "active" : ""}
              aria-current={pathname === href || pathname?.startsWith(href + "/") ? "page" : undefined}
              title={title}>
              <b>{number}</b><span>{title}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
