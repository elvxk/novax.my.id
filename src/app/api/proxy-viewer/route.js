import { apiSuccess, apiError } from "@/lib/api-response";
import dns from "dns/promises";

const PREVIEW_BASE =
  process.env.PREVIEW_SERVICE_URL || "https://rover.novax.my.id";

const DOH_BASE = process.env.DOH_BASE_URL || "https://dns.google/resolve";

function cleanInput(val) {
  if (!val) return { host: "", path: "" };
  let s = val.trim();
  s = s.replace(/^https?:\/\//i, "");
  const slashIdx = s.indexOf("/");
  const path = slashIdx !== -1 ? s.slice(slashIdx) : "";
  let host = (slashIdx !== -1 ? s.slice(0, slashIdx) : s).toLowerCase();
  host = host.replace(/:\d+$/, "");
  return { host, path };
}

async function getPublicDnsIps(domain) {
  try {
    const res = await fetch(
      `${DOH_BASE}?name=${encodeURIComponent(domain)}&type=A`,
      {
        headers: { Accept: "application/dns-json" },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.Answer || [])
      .filter((a) => a.type === 1)
      .map((a) => a.data);
  } catch {
    return [];
  }
}

async function resolveTargetIps(target) {
  // If already an IPv4 address
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(target)) {
    return [target];
  }
  // If hostname, resolve via Node dns and fallback to DoH
  try {
    const res = await dns.lookup(target, { all: true, family: 4 });
    const ips = res.map((r) => r.address).filter(Boolean);
    if (ips.length > 0) return ips;
  } catch {
    // fallback
  }
  return await getPublicDnsIps(target);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const rawDomain = searchParams.get("domain");
  const rawTarget = searchParams.get("target") || searchParams.get("server");

  const { host: domain, path: domainPath } = cleanInput(rawDomain);
  const { host: target } = cleanInput(rawTarget);

  if (!domain || !/^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(domain)) {
    return apiError(
      "A valid domain name is required (e.g. ?domain=example.com)",
      400,
      "INVALID_DOMAIN"
    );
  }

  if (!target) {
    return apiError(
      "A target server IP or hostname is required (e.g. ?target=192.0.2.1)",
      400,
      "INVALID_TARGET"
    );
  }

  const previewUrl = `${PREVIEW_BASE}/${encodeURIComponent(target)}/${encodeURIComponent(domain)}${domainPath}`;

  try {
    const startTime = performance.now();

    // Query domain public DNS, resolve target IPs, and test preview service concurrently
    const [publicDnsIps, targetIps, previewRes] = await Promise.all([
      getPublicDnsIps(domain),
      resolveTargetIps(target),
      fetch(previewUrl, {
        method: "HEAD",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; NovaX/1.0)" },
        signal: AbortSignal.timeout(8000),
      }).catch(() => null),
    ]);

    const responseTimeMs = Math.round(performance.now() - startTime);
    const targetIp = targetIps[0] || target;
    const isAlreadyLive = targetIps.some((tip) => publicDnsIps.includes(tip));

    return apiSuccess({
      domain,
      target,
      targetIp,
      targetIps,
      previewUrl,
      publicDnsIps,
      isAlreadyLive,
      status: previewRes?.status || 200,
      responseTimeMs,
    });
  } catch (err) {
    return apiError(
      err.message || "Failed to reach preview service",
      502,
      "PREVIEW_SERVICE_ERROR"
    );
  }
}
