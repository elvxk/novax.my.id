import { describe, expect, it, afterEach } from "bun:test";
import { POST as orderChallenge } from "./challenge/route";
import { POST as issueCert } from "./issue/[id]/route";
import {
  normalizeDomains,
  isValidRequestId,
  splitCertificateChain,
  certificateFilenames,
} from "@/lib/ssl-generator";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function jsonRequest(url, body) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("ssl-generator domain validation", () => {
  it("normalizes, lowercases, and dedupes a comma-separated list", () => {
    const { domains } = normalizeDomains(" Example.com , www.example.com, example.com ");
    expect(domains).toEqual(["example.com", "www.example.com"]);
  });

  it("accepts wildcard domains", () => {
    expect(normalizeDomains(["*.example.com"]).domains).toEqual(["*.example.com"]);
  });

  it("rejects empty input and malformed domains", () => {
    expect(normalizeDomains("").error).toBeDefined();
    expect(normalizeDomains(["not_a_domain"]).error).toBeDefined();
    expect(normalizeDomains(["example.com", "bad..domain"]).error).toContain("bad..domain");
  });

  it("validates request IDs against path-safe characters", () => {
    expect(isValidRequestId("0dbadd11-92fe-452f-b38b-75febd17fa3c")).toBe(true);
    expect(isValidRequestId("../../etc/passwd")).toBe(false);
    expect(isValidRequestId("")).toBe(false);
  });

  it("splits a PEM chain into leaf and intermediate bundle", () => {
    const pem =
      "-----BEGIN CERTIFICATE-----\nLEAF\n-----END CERTIFICATE-----\n" +
      "-----BEGIN CERTIFICATE-----\nINTERMEDIATE\n-----END CERTIFICATE-----";

    const { leaf, bundle } = splitCertificateChain(pem);
    // RFC 7468: a line break must follow the post-encapsulation boundary
    expect(leaf).toBe("-----BEGIN CERTIFICATE-----\nLEAF\n-----END CERTIFICATE-----\n");
    expect(bundle).toContain("INTERMEDIATE");
    expect(bundle).not.toContain("LEAF");

    // A single-certificate chain has no bundle
    expect(splitCertificateChain(leaf).bundle).toBe("");
  });

  it("derives PEM filenames from the first domain", () => {
    const names = certificateFilenames(["hi.example.com", "www.hi.example.com"]);
    expect(names).toEqual({
      leaf: "hi.example.com.crt",
      bundle: "hi.example.com-ca-bundle.crt",
      key: "hi.example.com.key",
    });
  });

  it("strips the wildcard label that is illegal in filenames", () => {
    expect(certificateFilenames(["*.example.com"]).leaf).toBe("example.com.crt");
  });

  it("falls back to a safe name when no domain is present", () => {
    expect(certificateFilenames([]).leaf).toBe("certificate.crt");
    expect(certificateFilenames(undefined).key).toBe("certificate.key");
  });
});

describe("SSL Generator API (/api/ssl-generator)", () => {
  it("orders a challenge and returns the request ID with DNS records", async () => {
    globalThis.fetch = async (url, init) => {
      expect(url).toEndWith("/challenge");
      expect(JSON.parse(init.body).domains).toEqual(["example.com"]);
      return jsonResponse({
        status: "success",
        data: {
          id: "0dbadd11-92fe-452f-b38b-75febd17fa3c",
          dns: [
            {
              type: "TXT",
              record: "_acme-challenge.example.com",
              value: "Pottc4dJjxn5h09zyaeoOgu8KGUGJJLJwySTXdwxcE",
            },
          ],
        },
      });
    };

    const res = await orderChallenge(jsonRequest("http://localhost/api/ssl-generator/challenge", { domains: ["example.com"] }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBe("0dbadd11-92fe-452f-b38b-75febd17fa3c");
    expect(json.data.dns[0].record).toBe("_acme-challenge.example.com");
  });

  it("rejects a challenge with no domains before calling upstream", async () => {
    globalThis.fetch = async () => {
      throw new Error("upstream must not be called");
    };

    const res = await orderChallenge(jsonRequest("http://localhost/api/ssl-generator/challenge", { domains: [] }));
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error.code).toBe("INVALID_DOMAINS");
  });

  it("surfaces the upstream cause instead of the generic message", async () => {
    globalThis.fetch = async () =>
      jsonResponse(
        {
          code: 500,
          status: "error",
          message: "Internal server error",
          error: 'Error creating new order :: Cannot issue for "example.com"',
        },
        500
      );

    const res = await orderChallenge(jsonRequest("http://localhost/api/ssl-generator/challenge", { domains: ["example.com"] }));
    expect(res.status).toBe(502);

    const json = await res.json();
    expect(json.error.code).toBe("UPSTREAM_ERROR");
    expect(json.error.message).toContain("Cannot issue");
  });

  it("returns 502 when the upstream service is unreachable", async () => {
    globalThis.fetch = async () => {
      throw new Error("ECONNREFUSED");
    };

    const res = await orderChallenge(jsonRequest("http://localhost/api/ssl-generator/challenge", { domains: ["example.com"] }));
    expect(res.status).toBe(502);
    expect((await res.json()).error.code).toBe("UPSTREAM_ERROR");
  });

  it("issues a certificate using the path request ID and no request body", async () => {
    globalThis.fetch = async (url, init) => {
      expect(url).toEndWith("/issue/0dbadd11-92fe-452f-b38b-75febd17fa3c");
      expect(init.body).toBeUndefined();
      return jsonResponse({
        status: "success",
        message: "Certificate issued successfully",
        data: {
          domains: ["example.com"],
          certificate: "-----BEGIN CERTIFICATE-----\nMIIF\n-----END CERTIFICATE-----",
          privateKey: "-----BEGIN PRIVATE KEY-----\nMIIE\n-----END PRIVATE KEY-----",
        },
      });
    };

    const res = await issueCert(new Request("http://localhost/api/ssl-generator/issue/0dbadd11-92fe-452f-b38b-75febd17fa3c", { method: "POST" }), {
      params: Promise.resolve({ id: "0dbadd11-92fe-452f-b38b-75febd17fa3c" }),
    });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.domains).toEqual(["example.com"]);
    expect(json.data.certificate).toStartWith("-----BEGIN CERTIFICATE-----");
    expect(json.data.privateKey).toStartWith("-----BEGIN PRIVATE KEY-----");
    expect(json.data.message).toBe("Certificate issued successfully");
  });

  it("rejects an unsafe request ID without calling upstream", async () => {
    globalThis.fetch = async () => {
      throw new Error("upstream must not be called");
    };

    const res = await issueCert(new Request("http://localhost/api/ssl-generator/issue/..%2Fetc", { method: "POST" }), {
      params: Promise.resolve({ id: "../../etc" }),
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("INVALID_REQUEST_ID");
  });

  it("maps an unknown request ID to 502 with the upstream cause", async () => {
    globalThis.fetch = async () =>
      jsonResponse({ code: 500, status: "error", message: "Internal server error", error: "Invalid or expired ID" }, 500);

    const res = await issueCert(new Request("http://localhost/api/ssl-generator/issue/unknown-id", { method: "POST" }), {
      params: Promise.resolve({ id: "unknown-id" }),
    });
    expect(res.status).toBe(502);
    expect((await res.json()).error.message).toContain("Invalid or expired ID");
  });
});
