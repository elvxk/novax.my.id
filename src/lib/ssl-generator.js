/**
 * Shared client for the upstream ACME SSL generator service.
 * Upstream contract: POST {BASE}/challenge {domains:[...]} and POST {BASE}/issue/{id}
 */
const BASE_URL =
  process.env.SSL_GENERATOR_API_URL || "https://api.pradipta.dev/ssl";

// RFC 1035 labels with optional wildcard prefix (same rule the upstream ACME service accepts)
const DOMAIN_RE = /^(?:\*\.)?(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/;

// Request IDs are opaque to us; allow only URL-safe chars so they can't escape the upstream path
const REQUEST_ID_RE = /^[A-Za-z0-9._-]{1,64}$/;

/** Accepts an array or a comma-separated string of domains. */
export function normalizeDomains(input) {
  const list = (Array.isArray(input) ? input : String(input ?? "").split(","))
    .map((d) => String(d).trim().toLowerCase())
    .filter(Boolean);

  if (list.length === 0) {
    return { error: "At least one domain is required (e.g. example.com, www.example.com)" };
  }

  const invalid = list.filter((d) => !DOMAIN_RE.test(d));
  if (invalid.length > 0) {
    return { error: `Invalid domain name(s): ${invalid.join(", ")}` };
  }

  return { domains: [...new Set(list)] };
}

export function isValidRequestId(id) {
  return typeof id === "string" && REQUEST_ID_RE.test(id);
}

/**
 * Conventional filenames for the issued PEM material, derived from the first domain.
 * Wildcards are stripped because "*." is not valid in a filename.
 */
export function certificateFilenames(domains) {
  const primary = (Array.isArray(domains) ? domains[0] : domains) || "";
  const base = String(primary).trim().toLowerCase().replace(/^\*\./, "") || "certificate";

  return {
    leaf: `${base}.crt`,
    bundle: `${base}-ca-bundle.crt`,
    key: `${base}.key`,
  };
}

/**
 * Splits a PEM chain into the leaf certificate and the intermediate bundle.
 * RFC 7468 §2 requires a line break after the post-encapsulation boundary,
 * so every returned block keeps a trailing newline.
 */
export function splitCertificateChain(pem) {
  const blocks = String(pem || "")
    .split(/-----END CERTIFICATE-----\n?/g)
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => `${c}\n-----END CERTIFICATE-----\n`);

  return { leaf: blocks[0] || "", bundle: blocks.slice(1).join("") };
}

/**
 * POST to the upstream service.
 * The ACME service blocks on DNS propagation, so issuance needs a wider timeout than ordering.
 * @returns {Promise<{ok: true, data: object} | {ok: false, status: number|null, message: string}>}
 */
export async function callUpstream(path, body, timeoutMs = 20000) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      // No body (issue endpoint) means no Content-Type: upstream rejects empty JSON bodies
      ...(body === undefined
        ? {}
        : {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return { ok: false, status: null, message: "SSL generator service is unreachable" };
  }

  const json = await res.json().catch(() => null);

  if (!res.ok || !json || json.status === "error" || json.error) {
    // Upstream wraps precise causes in `error` and uses `message` for generic text
    const message =
      json?.message && json.message !== "Internal server error"
        ? json.message
        : json?.error || json?.message || `Upstream request failed (HTTP ${res.status})`;
    return { ok: false, status: res.status, message };
  }

  // `message` is a top-level upstream field, not part of `data`
  return { ok: true, data: json.data ?? json, message: json.message };
}

/** Maps an upstream failure to the HTTP status our API returns. */
export function upstreamErrorStatus(status) {
  return status >= 400 && status < 500 ? status : 502;
}
