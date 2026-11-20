import { describe, expect, it } from "bun:test";
import { OPTIONS, POST } from "./route";
import { getToolByPath } from "@/lib/tool-registry";

describe("html-to-pdf API", () => {
  it("resolves from tool-registry by web path and api endpoint", () => {
    const webTool = getToolByPath("/tools/html-to-pdf");
    expect(webTool).not.toBeNull();
    expect(webTool?.id).toBe("html-to-pdf");

    const apiTool = getToolByPath("/api/html-to-pdf");
    expect(apiTool).not.toBeNull();
    expect(apiTool?.id).toBe("html-to-pdf");
  });

  it("handles OPTIONS preflight with 204 and CORS headers", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
  });

  it("rejects request with invalid JSON with 400 INVALID_JSON", async () => {
    const req = new Request("http://localhost/api/html-to-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not valid json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INVALID_JSON");
  });

  it("rejects request without html or url with 400 MISSING_CONTENT", async () => {
    const req = new Request("http://localhost/api/html-to-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("MISSING_CONTENT");
  });

  it("rejects request with both html and url with 400 CONFLICTING_INPUT", async () => {
    const req = new Request("http://localhost/api/html-to-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: "<html></html>", url: "https://example.com" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("CONFLICTING_INPUT");
  });

  it("rejects request with invalid URL format with 400 INVALID_URL", async () => {
    const req = new Request("http://localhost/api/html-to-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "not-a-valid-url" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INVALID_URL");
  });

  it("rejects request with invalid format with 400 INVALID_FORMAT", async () => {
    const req = new Request("http://localhost/api/html-to-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: "<html></html>", format: "InvalidFormat" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INVALID_FORMAT");
  });

  it("rejects request with invalid waitUntil with 400 INVALID_WAIT_UNTIL", async () => {
    const req = new Request("http://localhost/api/html-to-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: "<html></html>", waitUntil: "invalid" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INVALID_WAIT_UNTIL");
  });

  it("rejects request with invalid emulateMedia with 400 INVALID_EMULATE_MEDIA", async () => {
    const req = new Request("http://localhost/api/html-to-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: "<html></html>", emulateMedia: "invalid" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INVALID_EMULATE_MEDIA");
  });

  it("accepts valid html request and attempts PDF generation", async () => {
    const req = new Request("http://localhost/api/html-to-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: "<!DOCTYPE html><html><body><h1>Test</h1></body></html>" }),
    });
    const res = await POST(req);
    const json = await res.json();
    // If BROWSER_WS_ENDPOINT is set and reachable, it may succeed
    // Otherwise it should fail with a specific error code
    if (json.success) {
      expect(json.data).toBeDefined();
      expect(json.data.base64).toBeDefined();
      expect(json.data.contentType).toBe("application/pdf");
    } else {
      expect(["MISSING_BROWSER_ENDPOINT", "GENERATION_FAILED", "NAVIGATION_TIMEOUT", "GENERATION_TIMEOUT"]).toContain(json.error.code);
    }
  });
});