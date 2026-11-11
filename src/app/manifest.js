export default function manifest() {
  return {
    name: "Nova-X — Network & Security Diagnostics",
    short_name: "Nova-X",
    description:
      "Open network diagnostics and server utilities for developers and sysadmins.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf8ed",
    theme_color: "#fdf8ed",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
