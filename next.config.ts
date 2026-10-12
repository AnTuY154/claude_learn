import type { NextConfig } from "next";

// GitHub Pages chỉ phục vụ HTML/CSS/JS tĩnh, không chạy Next.js API routes.
// Bật STATIC_EXPORT *chỉ trong CI Pages*; dev/server deployment không bị ảnh hưởng.
const isPages = process.env.GITHUB_PAGES_EXPORT === "true";
const basePath = isPages ? "/claude_learn" : "";

const nextConfig: NextConfig = {
  ...(isPages ? { output: "export", basePath, assetPrefix: basePath, trailingSlash: true, images: { unoptimized: true } } : {}),
};
export default nextConfig;
