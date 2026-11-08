import { apiSuccess, apiError } from "@/lib/api-response";

const VERIFY_URL =
  process.env.VERIFY_CPANEL_URL || "https://verify.cpanel.net/app/verify";
const CLN_URL =
  process.env.CLN_URL || "https://cln.cloudlinux.com/wapi/check/ip";

const PRODUCT_LABELS = {
  cpanel: "cPanel / WHM",
  cloudlinux: "CloudLinux",
  imunify: "Imunify360",
  jetbackup: "JetBackup",
};

const CLN_PRODUCT_LABELS = {
  CLS: "CloudLinux OS Solo",
  KC: "KernelCare",
  IM_1: "Imunify for single user",
  IMAVP: "Imunify AV Plus",
};

const CLN_PRODUCT_KEYS = {
  CLS: "cloudlinux",
  IM_1: "imunify",
  IMAVP: "imunify",
};

const CLN_TYPE_LABELS = {
  IP: "IP-based license",
  KEY: "Key-based license",
};

function clnInstances(data) {
  return (data?.instances || []).map((i) => ({
    ip: i.ip,
    product: i.product,
    productLabel: CLN_PRODUCT_LABELS[i.product] || i.product,
    hostname: i.hostname,
    type: i.type,
    typeLabel: CLN_TYPE_LABELS[i.type] || i.type,
    registered: i.registered_utc
      ? new Date(i.registered_utc * 1000).toISOString()
      : null,
    checkin: i.checkin_utc
      ? new Date(i.checkin_utc * 1000).toISOString()
      : null,
  }));
}

function registryLicense(inst) {
  return {
    package: inst.product,
    partnerNoc: "",
    activity: inst.typeLabel,
    product: inst.productLabel,
    status: inst.checkin ? "active" : "registered",
    productLabel: inst.productLabel,
    hostname: inst.hostname,
    typeLabel: inst.typeLabel,
    source: "registry",
  };
}

const strip = (html) =>
  html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

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
  const ip = request.nextUrl.searchParams.get("ip")?.trim();

  if (!ip || !/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    return apiError("A valid IPv4 address is required", 400, "INVALID_IPV4");
  }
  if (ip.split(".").some((o) => Number(o) > 255)) {
    return apiError("IPv4 octet out of range (0-255)", 400, "INVALID_IPV4_RANGE");
  }

  let html;
  let cln = null;
  let clnError = null;

  try {
    const [res, clnRes] = await Promise.all([
      fetch(`${VERIFY_URL}?ip=${encodeURIComponent(ip)}`, {
        headers: {
          Accept: "text/html",
          "User-Agent": "Mozilla/5.0 (compatible; novax/1.0)",
        },
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
      }),
      fetch(`${CLN_URL}/${encodeURIComponent(ip)}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; novax/1.0)",
        },
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
      }).catch(() => null),
    ]);

    if (!res.ok) {
      return apiError(
        `cPanel license server error (HTTP ${res.status})`,
        502,
        "UPSTREAM_ERROR"
      );
    }
    html = await res.text();

    if (clnRes?.ok) {
      cln = await clnRes.json();
    } else {
      clnError = clnRes
        ? `CloudLinux registry error (HTTP ${clnRes.status})`
        : "Failed to reach CloudLinux registry";
    }
  } catch {
    return apiError(
      "Failed to reach license verification servers",
      502,
      "UPSTREAM_TIMEOUT"
    );
  }

  const licenses = [
    ...html.matchAll(/<tr class="status\d+">([\s\S]*?)<\/tr>/g),
  ].map(([, row]) => {
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(
      ([, cell]) => strip(cell)
    );
    return {
      package: cells[2] || "",
      partnerNoc: cells[3] || "",
      activity: cells[4] || "",
      product: cells[5] || "",
      status: cells[6] || "",
    };
  });

  const instances = clnInstances(cln);

  const fromRegistry = (key) =>
    instances.find((i) => CLN_PRODUCT_KEYS[i.product] === key) || null;

  const pick = (key, re) => {
    const inst = fromRegistry(key);
    return inst
      ? registryLicense(inst)
      : licenses.find((l) => re.test(l.product)) || null;
  };

  return apiSuccess({
    ip,
    licensed: !/Results:\s*Not licensed/i.test(html),
    products: {
      cpanel: pick(null, /cpanel/i),
      cloudlinux: pick("cloudlinux", /cloudlinux/i),
      imunify: pick("imunify", /imunify/i),
      jetbackup: pick(null, /jetbackup/i),
    },
    labels: PRODUCT_LABELS,
    licenses,
    registry: {
      labels: CLN_PRODUCT_LABELS,
      typeLabels: CLN_TYPE_LABELS,
      instances,
      error: clnError,
    },
  });
}
