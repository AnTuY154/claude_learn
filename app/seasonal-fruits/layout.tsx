import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hỏi mùa, pha vị",
  description: "Trợ lý tìm trái cây theo mùa và công thức đồ uống có nguồn.",
};

export default function SeasonalFruitsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
