import { apiSuccess, apiError } from "@/lib/api-response";

const RDAP_BOOTSTRAP = process.env.RDAP_BASE_URL || "https://rdap.org/domain/";

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
  const domain = request.nextUrl.searchParams
    .get("domain")
    ?.trim()
    .toLowerCase();

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

  try {
    const res = await fetch(
      `${RDAP_BOOTSTRAP}${encodeURIComponent(domain)}`,
      {
        headers: {
          Accept: "application/rdap+json, application/json",
          "User-Agent": "Mozilla/5.0 (compatible; novax/1.0)",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return apiError("Domain registration not found on RDAP registry", 404, "NOT_FOUND");
      }
      return apiError(
        `RDAP registry responded with status ${res.status}`,
        502,
        "UPSTREAM_ERROR"
      );
    }

    const d = await res.json();

    const events = {};
    for (const ev of d.events || []) {
      if (ev.eventAction === "registration") events.registration = ev.eventDate;
      if (ev.eventAction === "expiration")   events.expiration   = ev.eventDate;
      if (ev.eventAction === "last changed") events.lastChanged  = ev.eventDate;
    }

    const registrarEntity = (d.entities || []).find((e) =>
      e.roles?.includes("registrar")
    );
    const registrar =
      registrarEntity?.vcardArray?.[1]?.find((v) => v[0] === "fn")?.[3] ||
      null;

    const registrantEntity = (d.entities || []).find((e) =>
      e.roles?.includes("registrant")
    );
    const registrant =
      registrantEntity?.vcardArray?.[1]?.find((v) => v[0] === "fn")?.[3] ||
      null;

    return apiSuccess({
      domain: d.ldhName || domain,
      handle: d.handle || null,
      status: d.status || [],
      events,
      registrar,
      registrant,
      nameservers: (d.nameservers || [])
        .map((ns) => ns.ldhName)
        .filter(Boolean),
    });
  } catch {
    return apiError("Failed to reach RDAP server", 502, "UPSTREAM_TIMEOUT");
  }
}
