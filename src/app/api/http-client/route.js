import { apiSuccess, apiError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const MAX_TIMEOUT = 30_000;
const DEFAULT_TIMEOUT = 10_000;
const MAX_BODY_SIZE = 5 * 1024 * 1024; // 5MB

// Headers that must not be forwarded to the target
const BLOCKED_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "proxy-authorization",
  "proxy-connection",
]);

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request) {
  // ── rate limit ──────────────────────────────────────────────────────────────
  const clientIp = getClientIp(request);
  const rl = checkRateLimit(clientIp);
  if (!rl.allowed) {
    return apiError(
      `Rate limit exceeded. Try again in ${rl.resetSeconds}s.`,
      429,
      "RATE_LIMITED"
    );
  }

  // ── parse request ───────────────────────────────────────────────────────────
  let payload;
  try {
    payload = await request.json();
  } catch {
    return apiError("Invalid JSON request body", 400, "INVALID_JSON");
  }

  const {
    url: targetUrl,
    method: rawMethod,
    headers: customHeaders,
    body: reqBody,
    timeout: rawTimeout,
  } = payload;

  // ── validate url ────────────────────────────────────────────────────────────
  if (!targetUrl || typeof targetUrl !== "string") {
    return apiError(
      "A valid url field is required (e.g. https://api.example.com/users)",
      400,
      "MISSING_URL"
    );
  }

  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return apiError("Invalid URL format", 400, "INVALID_URL");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return apiError(
      "Only http and https protocols are supported",
      400,
      "INVALID_PROTOCOL"
    );
  }

  // block requests to private/internal IPs
  const host = parsed.hostname;
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host === "0.0.0.0" ||
    host.endsWith(".local")
  ) {
    return apiError(
      "Requests to private or internal addresses are not allowed",
      403,
      "PRIVATE_ADDRESS"
    );
  }

  // ── validate method ─────────────────────────────────────────────────────────
  const method = (rawMethod || "GET").toUpperCase();
  if (!ALLOWED_METHODS.includes(method)) {
    return apiError(
      `Unsupported HTTP method. Allowed: ${ALLOWED_METHODS.join(", ")}`,
      400,
      "INVALID_METHOD"
    );
  }

  // ── validate timeout ────────────────────────────────────────────────────────
  const timeout = Math.min(
    Math.max(1000, Number(rawTimeout) || DEFAULT_TIMEOUT),
    MAX_TIMEOUT
  );

  // ── build headers ───────────────────────────────────────────────────────────
  const forwardHeaders = {};
  if (customHeaders && typeof customHeaders === "object") {
    for (const [key, value] of Object.entries(customHeaders)) {
      if (!BLOCKED_HEADERS.has(key.toLowerCase())) {
        forwardHeaders[key] = String(value);
      }
    }
  }

  // ── build fetch options ─────────────────────────────────────────────────────
  const fetchOpts = {
    method,
    headers: forwardHeaders,
    signal: AbortSignal.timeout(timeout),
    redirect: "follow",
  };

  // Only attach body for methods that support it
  if (reqBody && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    fetchOpts.body = typeof reqBody === "string" ? reqBody : JSON.stringify(reqBody);
  }

  // ── execute request ─────────────────────────────────────────────────────────
  try {
    const startTime = performance.now();
    const res = await fetch(targetUrl, fetchOpts);
    const elapsed = Math.round(performance.now() - startTime);

    // Read response body with size limit
    const reader = res.body?.getReader();
    const chunks = [];
    let totalLen = 0;
    let truncated = false;

    if (reader && method !== "HEAD") {
      while (totalLen < MAX_BODY_SIZE) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        totalLen += value.length;
        if (totalLen >= MAX_BODY_SIZE) {
          truncated = true;
          break;
        }
      }
      reader.cancel().catch(() => {});
    }

    const bodyText =
      chunks.length > 0
        ? new TextDecoder().decode(
            chunks.length === 1
              ? chunks[0]
              : Buffer.concat(chunks)
          ).slice(0, MAX_BODY_SIZE)
        : "";

    // Collect response headers
    const responseHeaders = {};
    res.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return apiSuccess({
      url: targetUrl,
      method,
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
      body: bodyText,
      timing: elapsed,
      size: totalLen,
      truncated,
    });
  } catch (err) {
    if (err?.name === "TimeoutError" || err?.name === "AbortError") {
      return apiError(
        `Request timed out after ${timeout}ms`,
        504,
        "REQUEST_TIMEOUT"
      );
    }

    const message =
      err?.cause?.code === "ENOTFOUND"
        ? `DNS resolution failed for ${parsed.hostname}`
        : err?.cause?.code === "ECONNREFUSED"
        ? `Connection refused by ${parsed.hostname}`
        : "Failed to complete the HTTP request";

    return apiError(message, 502, "UPSTREAM_ERROR");
  }
}
