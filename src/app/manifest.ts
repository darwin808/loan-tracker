import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FinTrack — Personal Finance Tracker",
    short_name: "FinTrack",
    description:
      "Track loans, bills, income, and savings. Free personal finance tracker.",
    start_url: "/",
    display: "standalone",
    theme_color: "#282828",
    background_color: "#1d2021",
  };
}
