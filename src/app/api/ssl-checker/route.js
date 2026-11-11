import { apiSuccess, apiError } from "@/lib/api-response";
import tls from "tls";

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

function cleanHost(val) {
  if (!val) return "";
  let s = val.trim().toLowerCase();
  s = s.replace(/^https?:\/\//i, "");
  s = s.replace(/\/.*$/, "");
  s = s.replace(/:(\d+)$/, "");
  return s;
}

function extractPort(val) {
  if (!val) return 443;
  const m = val.trim().match(/:(\d+)$/);
  return m ? parseInt(m[1], 10) : 443;
}

function parseCert(cert) {
  const subject = cert.subject || {};
  const issuer = cert.issuer || {};
  const san = cert.subjectaltname || "";

  const altNames = san
    ? san
        .split(",")
        .map((s) => s.trim().replace(/^DNS:/, "").replace(/^IP Address:/, "IP:"))
        .filter(Boolean)
    : [];

  return {
    subject: subject.CN || null,
    issuer: issuer.O || issuer.CN || null,
    issuerCN: issuer.CN || null,
    validFrom: cert.valid_from || null,
    validTo: cert.valid_to || null,
    altNames,
    serialNumber: cert.serialNumber || null,
    fingerprint: cert.fingerprint || null,
    fingerprint256: cert.fingerprint256 || null,
    bits: cert.bits || null,
  };
}

function checkExpiry(validTo) {
  if (!validTo) return { daysLeft: null, isExpired: false, isExpiringSoon: false };
  const expiry = new Date(validTo);
  const now = new Date();
  const daysLeft = Math.floor((expiry - now) / 86400000);
  return {
    daysLeft,
    isExpired: daysLeft < 0,
    isExpiringSoon: daysLeft >= 0 && daysLeft <= 30,
  };
}

function matchesDomain(hostname, cert) {
  const normalize = (s) => s?.toLowerCase().trim() ?? "";
  const h = normalize(hostname);

  const toCheck = [
    normalize(cert.subject),
    ...cert.altNames.map((n) => normalize(n).replace(/^ip:/, "")),
  ].filter(Boolean);

  return toCheck.some((name) => {
    if (name.startsWith("*.")) {
      const base = name.slice(2);
      const parts = h.split(".");
      return parts.length >= 2 && parts.slice(1).join(".") === base;
    }
    return name === h;
  });
}

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const rawHost = searchParams.get("domain") || searchParams.get("host");
  const host = cleanHost(rawHost);
  const port = extractPort(rawHost);

  if (!host || !/^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(host)) {
    return apiError(
      "A valid domain is required (e.g. ?domain=example.com)",
      400,
      "INVALID_DOMAIN"
    );
  }

  const startTime = performance.now();

  const certData = await new Promise((resolve) => {
    const socket = tls.connect(
      { host, port, servername: host, rejectUnauthorized: false },
      () => {
        const cert = socket.getPeerCertificate(true);
        const protocol = socket.getProtocol();
        const cipher = socket.getCipher();
        socket.destroy();
        resolve({ cert, protocol, cipher, error: null });
      }
    );
    socket.setTimeout(8000, () => {
      socket.destroy();
      resolve({ cert: null, protocol: null, cipher: null, error: "Connection timed out" });
    });
    socket.on("error", (err) => {
      resolve({ cert: null, protocol: null, cipher: null, error: err.message });
    });
  });

  if (certData.error) {
    return apiError(certData.error, 502, "TLS_ERROR");
  }

  if (!certData.cert || !Object.keys(certData.cert).length) {
    return apiError("No certificate returned by server", 502, "NO_CERT");
  }

  const responseTimeMs = Math.round(performance.now() - startTime);
  const cert = parseCert(certData.cert);
  const expiry = checkExpiry(cert.validTo);
  const domainMatch = matchesDomain(host, cert);

  return apiSuccess({
    host,
    port,
    protocol: certData.protocol,
    cipher: certData.cipher?.name || null,
    cert,
    ...expiry,
    domainMatch,
    valid: !expiry.isExpired && domainMatch,
    responseTimeMs,
  });
}
