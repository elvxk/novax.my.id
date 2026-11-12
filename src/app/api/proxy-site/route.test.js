import { describe, expect, it } from "bun:test";
import { GET, POST } from "./route";

describe("Proxy Site API (/api/proxy-site)", () => {
  it("rejects missing or empty URL parameter", async () => {
    const req = new Request("http://localhost/api/proxy-site?url=");
    req.nextUrl = new URL(req.url);

    const res = await GET(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INVALID_URL");
  });

  it("rejects non-HTTP protocols like file: or ftp:", async () => {
    const req = new Request("http://localhost/api/proxy-site?url=ftp://files.example.com");
    req.nextUrl = new URL(req.url);

    const res = await GET(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNSUPPORTED_PROTOCOL");
  });

  it("blocks SSRF attacks to localhost and private networks", async () => {
    const localhostReq = new Request("http://localhost/api/proxy-site?url=http://localhost:3000");
    localhostReq.nextUrl = new URL(localhostReq.url);

    const res1 = await GET(localhostReq);
    expect(res1.status).toBe(403);
    const json1 = await res1.json();
    expect(json1.error.code).toBe("FORBIDDEN_HOST");

    const privateReq = new Request("http://localhost/api/proxy-site?url=http://192.168.1.1");
    privateReq.nextUrl = new URL(privateReq.url);

    const res2 = await GET(privateReq);
    expect(res2.status).toBe(403);
    const json2 = await res2.json();
    expect(json2.error.code).toBe("FORBIDDEN_HOST");
  });

  it("fetches target webpage and returns diagnostic metadata with injected base tag", async () => {
    const req = new Request("http://localhost/api/proxy-site?url=example.com");
    req.nextUrl = new URL(req.url);

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe(200);
    expect(json.data.title).toBeDefined();
    expect(json.data.html).toContain("<base href=");
    expect(json.data.headers).toBeDefined();
    expect(json.data.securityHeaders).toBeDefined();
  });

  it("handles POST request with JSON body", async () => {
    const req = new Request("http://localhost/api/proxy-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" }),
    });
    req.nextUrl = new URL(req.url);

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.url).toBe("https://example.com");
  });

  it("returns raw HTML directly when mode=raw is specified", async () => {
    const req = new Request("http://localhost/api/proxy-site?url=https://example.com&mode=raw");
    req.nextUrl = new URL(req.url);

    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toStartWith("text/html");

    const html = await res.text();
    expect(html).toContain("<base href=");
  });
});
