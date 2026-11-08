import { apiSuccess, apiError } from "@/lib/api-response";

const DOH_BASE = process.env.DOH_BASE_URL || "https://dns.google/resolve";
const ALL_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA"];

function isIPv4(str) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(str);
}
function extractIPv4(str) {
  return str.match(/\b(\d{1,3}\.){3}\d{1,3}\b/g) || [];
}
function reverseIPv4(ip) {
  return ip.split(".").reverse().join(".");
}

async function fetchDoh(name, type) {
  try {
    const res = await fetch(
      `${DOH_BASE}?name=${encodeURIComponent(name)}&type=${type}`,
      {
        headers: { Accept: "application/dns-json" },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return { type, answers: [] };
    const json = await res.json();
    return {
      type,
      status: json.Status,
      answers: json.Status === 0 && Array.isArray(json.Answer) ? json.Answer : [],
    };
  } catch {
    return { type, answers: [] };
  }
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
  const domain = searchParams.get("domain")?.trim().toLowerCase();
  const typeParam = searchParams.get("type")?.trim().toUpperCase();

  if (
    !domain ||
    !/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/.test(domain)
  ) {
    return apiError(
      "A valid domain query parameter is required (e.g. ?domain=example.com)",
      400,
      "INVALID_DOMAIN"
    );
  }

  const requestedTypes =
    typeParam && typeParam !== "ALL"
      ? [typeParam]
      : ALL_TYPES;

  try {
    const queryResults = await Promise.all(
      requestedTypes.map((t) => fetchDoh(domain, t))
    );

    const records = {};
    const ips = new Set();

    for (const r of queryResults) {
      records[r.type] = r.answers;
      if (r.type === "A") {
        for (const ans of r.answers) {
          if (isIPv4(ans.data)) ips.add(ans.data);
        }
      }
      if (r.type === "TXT") {
        for (const ans of r.answers) {
          for (const ip of extractIPv4(ans.data)) {
            ips.add(ip);
          }
        }
      }
    }

    let ptr = [];
    if (ips.size > 0) {
      const ptrQueries = Array.from(ips).map(async (ip) => {
        try {
          const rev = `${reverseIPv4(ip)}.in-addr.arpa`;
          const res = await fetchDoh(rev, "PTR");
          const ptrName = res.answers?.[0]?.data || null;
          return ptrName ? { ip, ptr: ptrName } : null;
        } catch {
          return null;
        }
      });
      const resolved = await Promise.all(ptrQueries);
      ptr = resolved.filter(Boolean);
    }

    const totalRecords = Object.values(records).reduce(
      (sum, list) => sum + list.length,
      0
    );

    return apiSuccess({
      domain,
      totalRecords,
      records,
      ptr,
    });
  } catch {
    return apiError("Failed to resolve DNS query", 502, "UPSTREAM_DNS_ERROR");
  }
}
