import { TOOL_DEFINITIONS } from "@/lib/tool-registry";

export default function sitemap() {
  const baseUrl = "https://novax.my.id";
  const now = new Date();

  const toolRoutes = TOOL_DEFINITIONS.filter((t) => !t.disabled).map((t) => ({
    url: `${baseUrl}${t.href}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...toolRoutes,
  ];
}
