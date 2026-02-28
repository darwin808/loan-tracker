import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FinTrak — Personal Finance Tracker",
    short_name: "FinTrak",
    description:
      "Track loans, bills, income, and savings. Free personal finance tracker.",
    start_url: "/",
    display: "standalone",
    theme_color: "#282828",
    background_color: "#1d2021",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
