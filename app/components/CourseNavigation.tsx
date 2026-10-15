"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// HEADER CHUNG: sử dụng Next Link để basePath của GitHub Pages được tự động thêm.
// Có thể cuộn ngang trên màn hình nhỏ; aria-current đánh dấu bài đang học.
const items = [
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
] as const;

export default function CourseNavigation() {
  const pathname = usePathname();
  return (
    <div className="course-header">
      <div className="course-header-inner">
        <Link href="/" className="course-logo" aria-label="Claude Learning Lab — Trang chủ">
          <span>CL</span><strong>Claude Learning Lab</strong>
        </Link>
        <nav className="course-nav" aria-label="Điều hướng Claude Certification Domains 1 và 2">
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
