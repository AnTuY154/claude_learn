import type { MetadataRoute } from "next";

// Static export cho GitHub Pages cần metadata route được prerender lúc build.
// Không đánh dấu force-static, Next.js sẽ từ chối /manifest.webmanifest.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Claude Learning Lab",
    short_name: "Claude Lab",
    description: "Ôn Claude Certified Architect: 7 bài Agentic Architecture.",
    start_url: process.env.GITHUB_PAGES_EXPORT === "true" ? "/claude_learn/" : "/",
    display: "standalone",
    background_color: "#eef5ff",
    theme_color: "#1557ff",
    lang: "vi",
    icons: [
      { src: `${process.env.GITHUB_PAGES_EXPORT === "true" ? "/claude_learn" : ""}/icon.svg`, sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
