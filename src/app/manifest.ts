import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JWTForge — JWT Security Toolkit",
    short_name: "JWTForge",
    description:
      "Client-side JWT security toolkit: decode, audit, and forge attack tokens. Nothing leaves your browser.",
    start_url: "/",
    display: "standalone",
    background_color: "#070912",
    theme_color: "#070912",
    icons: [
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
    categories: ["security", "developer", "utilities"],
  };
}
