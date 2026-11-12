import { describe, expect, it } from "bun:test";
import { POST } from "./route";

describe("CSR Generator API", () => {
  it("rejects request with invalid or missing domain", async () => {
    const req = new Request("http://localhost/api/csr-generator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: "" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INVALID_DOMAIN");
  });

  it("rejects unsupported key size", async () => {
    const req = new Request("http://localhost/api/csr-generator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: "example.com", keySize: 512 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INVALID_KEY_SIZE");
  });

  it("successfully generates CSR and Private Key with valid payload", async () => {
    const req = new Request("http://localhost/api/csr-generator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: "test.example.com",
        keySize: 1024, // Use 1024-bit for rapid unit test execution
        country: "ID",
        organization: "Nova-X Security",
        subjectAltNames: ["test.example.com", "sub.example.com"],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.csr).toStartWith("-----BEGIN CERTIFICATE REQUEST-----");
    expect(json.data.privateKey).toStartWith("-----BEGIN RSA PRIVATE KEY-----");
    expect(json.data.domain).toBe("test.example.com");
    expect(json.data.sanDns).toContain("test.example.com");
    expect(json.data.sanDns).toContain("sub.example.com");
  });
});
