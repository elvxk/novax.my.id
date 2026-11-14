import { describe, expect, it } from "bun:test";
import { OPTIONS, GET } from "./route";
import { getToolByPath } from "@/lib/tool-registry";

describe("crawl-test API", () => {
  it("resolves from tool-registry by web path and api endpoint", () => {
    const webTool = getToolByPath("/tools/crawl-test");
    expect(webTool).not.toBeNull();
    expect(webTool?.id).toBe("crawl-test");

    const apiTool = getToolByPath("/api/crawl-test");
    expect(apiTool).not.toBeNull();
    expect(apiTool?.id).toBe("crawl-test");
  });

  it("handles OPTIONS preflight with 204 and CORS headers", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("GET");
  });

  it("rejects request without url query param with 400 MISSING_URL", async () => {
    const req = {
      nextUrl: new URL("http://localhost/api/crawl-test"),
    };
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("MISSING_URL");
  });

  it("rejects request with invalid domain with 400 INVALID_DOMAIN", async () => {
    const req = {
      nextUrl: new URL("http://localhost/api/crawl-test?url=invalid..domain"),
    };
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INVALID_DOMAIN");
  });
});
