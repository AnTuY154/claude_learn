import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quầy giá · Claude Tools",
    short_name: "Quầy giá",
    description: "Tra sản phẩm, xem giá và tính toán với Claude.",
    start_url: "/",
    display: "standalone",
    background_color: "#eef5ff",
    theme_color: "#1557ff",
    lang: "vi",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
