import { apiSuccess, apiError } from "@/lib/api-response";
import { getClientIp } from "@/lib/rate-limit";

const IP_API_BASE = process.env.IP_API_URL || "https://ipwho.is";

function isPrivateOrLocal(ip) {
  if (!ip || ip === "127.0.0.1" || ip === "::1") return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
  if (ip.startsWith("169.254.") || ip.startsWith("100.64.")) return true;
  return false;
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
  let targetIp = searchParams.get("ip")?.trim();

  // If no IP supplied, detect caller's client IP
  if (!targetIp) {
    const callerIp = getClientIp(request);
    // Only pass targetIp if public; private/local resolves upstream directly
    if (callerIp && !isPrivateOrLocal(callerIp)) {
      targetIp = callerIp;
    }
  }

  const endpoint = targetIp
    ? `${IP_API_BASE}/${encodeURIComponent(targetIp)}`
    : `${IP_API_BASE}/`;

  try {
    const res = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; novax/1.0)",
      },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });

    if (!res.ok) {
      return apiError(
        `Upstream IP service error (HTTP ${res.status})`,
        502,
        "UPSTREAM_ERROR"
      );
    }

    const data = await res.json();

    if (!data.success) {
      return apiError(
        data.message || "Invalid IP address or host not found",
        400,
        "INVALID_IP"
      );
    }

    const normalized = {
      ip: data.ip,
      country: data.country,
      countryCode: data.country_code,
      region: data.region_code,
      regionName: data.region,
      city: data.city,
      zip: data.postal || null,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone?.id || null,
      isp: data.connection?.isp || null,
      org: data.connection?.org || null,
      as: data.connection?.asn
        ? `AS${data.connection.asn} ${data.connection.org || ""}`.trim()
        : null,
      flag: data.flag?.emoji || null,
      flagUrl: data.flag?.img || null,
    };

    return apiSuccess(normalized);
  } catch {
    return apiError(
      "Failed to reach geolocation provider",
      502,
      "UPSTREAM_TIMEOUT"
    );
  }
}
