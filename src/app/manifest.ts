import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PesoTrack — Personal Finance Tracker",
    short_name: "PesoTrack",
    description:
      "Track loans, bills, income, and savings. Free personal finance app for Filipinos.",
    start_url: "/",
    display: "standalone",
    theme_color: "#282828",
    background_color: "#1d2021",
  };
}
