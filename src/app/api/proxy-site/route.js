import { apiSuccess, apiError } from "@/lib/api-response";
import dns from "dns/promises";

/**
 * SSRF & IP Security Filter
 * Blocks access to loopback, link-local, cloud metadata, and RFC 1918 private subnets.
 */
function isPrivateOrForbiddenHost(host) {
  if (!host) return true;
  const h = host.trim().toLowerCase();
  if (h === "localhost" || h === "127.0.0.1" || h === "::1" || h === "0.0.0.0") return true;
  if (h.endsWith(".local") || h.endsWith(".internal") || h.endsWith(".arpa") || h.endsWith(".localhost")) return true;
  // Cloud metadata services (AWS, GCP, DigitalOcean, Azure)
  if (h === "169.254.169.254" || h === "metadata.google.internal" || h === "instance-data") return true;
  if (h.startsWith("10.") || h.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true;
  if (h.startsWith("169.254.") || h.startsWith("100.64.")) return true;
  if (/^(fc|fd)[0-9a-f]{2}:/i.test(h) || /^fe[89ab][0-9a-f]:/i.test(h)) return true;
  return false;
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

async function handleProxyRequest(targetInput, wantsRaw = false) {
  if (!targetInput || typeof targetInput !== "string" || !targetInput.trim()) {
    return apiError("A valid target URL is required (e.g. ?url=https://example.com)", 400, "INVALID_URL");
  }

  let targetUrl = targetInput.trim();
  // If no URI scheme is provided (e.g. "example.com" or "example.com/path"), default to https://
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(targetUrl)) {
    targetUrl = "https://" + targetUrl;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return apiError("Malformed URL format", 400, "INVALID_URL");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return apiError("Only HTTP and HTTPS protocols are supported", 400, "UNSUPPORTED_PROTOCOL");
  }

  if (isPrivateOrForbiddenHost(parsedUrl.hostname)) {
    return apiError("Access to internal, loopback, or private network hosts is forbidden", 403, "FORBIDDEN_HOST");
  }

  // DNS validation for SSRF prevention
  try {
    const resolved = await dns.lookup(parsedUrl.hostname, { all: true });
    const hasForbiddenIp = resolved.some((r) => isPrivateOrForbiddenHost(r.address));
    if (hasForbiddenIp) {
      return apiError("Target domain resolves to a private or restricted IP address", 403, "FORBIDDEN_IP");
    }
  } catch {
    return apiError("Failed to resolve target domain DNS records", 502, "DNS_LOOKUP_FAILED");
  }

  try {
    const startTime = performance.now();
    const res = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 (NovaX ProxySite/1.0)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });

    const responseTimeMs = Math.round(performance.now() - startTime);
    const finalUrl = res.url || targetUrl;
    const contentType = res.headers.get("content-type") || "text/html";

    // Extract headers
    const headerMap = {};
    const trackedHeaders = [
      "server",
      "content-type",
      "date",
      "cache-control",
      "etag",
      "last-modified",
      "content-encoding",
      "x-frame-options",
      "content-security-policy",
      "strict-transport-security",
      "x-content-type-options",
      "referrer-policy",
    ];
    for (const h of trackedHeaders) {
      const val = res.headers.get(h);
      if (val) headerMap[h] = val;
    }

    const securityHeaders = {
      xFrameOptions: res.headers.get("x-frame-options"),
      contentSecurityPolicy: res.headers.get("content-security-policy"),
      strictTransportSecurity: res.headers.get("strict-transport-security"),
      xContentTypeOptions: res.headers.get("x-content-type-options"),
      referrerPolicy: res.headers.get("referrer-policy"),
    };

    let rawHtml = await res.text();

    // Extract page title
    const titleMatch = rawHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : parsedUrl.hostname;

    // Process HTML for same-page preview:
    // 1. Injects <base href="..."> so relative paths (CSS, images, links) load from origin
    // 2. Disarms frame-busting scripts so preview stays inside iframe
    let processedHtml = rawHtml.replace(/<base[^>]*>/gi, "");
    const baseInjection = `<base href="${finalUrl}" target="_blank">
<script>
// Prevent frame-busting scripts from hijacking the top-level window
try {
  Object.defineProperty(window, 'top', { get: function() { return window.self; } });
  Object.defineProperty(window, 'parent', { get: function() { return window.self; } });
} catch(e) {}
</script>`;

    if (/<head[^>]*>/i.test(processedHtml)) {
      processedHtml = processedHtml.replace(/<head[^>]*>/i, (m) => `${m}\n${baseInjection}`);
    } else {
      processedHtml = `${baseInjection}\n${processedHtml}`;
    }

    // Direct HTML response requested
    if (wantsRaw) {
      return new Response(processedHtml, {
        status: res.status,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "X-Frame-Options": "SAMEORIGIN",
        },
      });
    }

    return apiSuccess({
      url: targetUrl,
      finalUrl,
      status: res.status,
      statusText: res.statusText || "OK",
      contentType,
      responseTimeMs,
      title,
      headers: headerMap,
      securityHeaders,
      html: processedHtml,
    });
  } catch (err) {
    if (err.name === "TimeoutError" || err.message?.includes("timeout")) {
      return apiError("Request to target website timed out after 12 seconds", 504, "UPSTREAM_TIMEOUT");
    }
    return apiError(err.message || "Failed to fetch target website via proxy", 502, "PROXY_FETCH_ERROR");
  }
}

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const rawUrl = searchParams.get("url");
  const wantsRaw = searchParams.get("mode") === "raw" || searchParams.get("raw") === "true";

  return handleProxyRequest(rawUrl, wantsRaw);
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const { searchParams } = request.nextUrl;
  const wantsRaw = searchParams.get("mode") === "raw" || searchParams.get("raw") === "true";

  return handleProxyRequest(body?.url, wantsRaw);
}
