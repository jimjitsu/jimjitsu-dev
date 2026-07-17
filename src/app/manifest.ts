import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jim Tierney — Frontend Engineer",
    short_name: "jimjitsu",
    description:
      "Portfolio and blog of Jim Tierney, frontend engineer focused on fast, accessible, component-driven UIs.",
    start_url: "/",
    display: "browser",
    background_color: "#F5EFE0",
    theme_color: "#1A1A1A",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
