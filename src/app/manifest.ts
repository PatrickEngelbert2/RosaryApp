import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Walk the Rosary",
    short_name: "Walk Rosary",
    description:
      "Walk the Rosary helps individuals and groups pray, lead, and print Rosary guides.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf0",
    theme_color: "#102a56",
    icons: [
      {
        src: "/faviconRiver.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
