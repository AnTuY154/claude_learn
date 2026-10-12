import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quầy giá · Claude Tools",
  description: "Tra sản phẩm, xem giá và tính toán với Claude.",
  applicationName: "Quầy giá",
  icons: { icon: `${process.env.GITHUB_PAGES_EXPORT === "true" ? "/claude_learn" : ""}/icon.svg`, apple: `${process.env.GITHUB_PAGES_EXPORT === "true" ? "/claude_learn" : ""}/icon.svg` },
};

export const viewport: Viewport = {
  themeColor: "#1557ff",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{process.env.NEXT_PUBLIC_STATIC_HOSTING === "true" && <aside role="status" style={{ padding: "10px 16px", background: "#fef3c7", color: "#713f12", textAlign: "center", fontSize: 14 }}>GitHub Pages: nội dung và quiz hoạt động; các bài thực hành gọi Claude API cần backend riêng. API key không được đưa lên trình duyệt.</aside>}{children}</body>
    </html>
  );
}
