import tls from "tls";
import { apiSuccess, apiError } from "@/lib/api-response";

const DOH = process.env.DOH_BASE_URL || "https://dns.google/resolve";

// In-memory candidate cache (TTL 30 minutes)
// Key: domain, Value: { candidates: Map<string, string>, expiresAt: number }
const CANDIDATE_CACHE = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000;

const WORDLIST = [
  // Web & Core
  "www", "mail", "smtp", "pop", "pop3", "imap", "ftp", "sftp", "ssh", "mx", "ns", "ns1", "ns2", "ns3", "ns4",
  // Hosting & Panels
  "cpanel", "whm", "webmail", "autodiscover", "autoconfig", "webuzo", "plesk", "directadmin", "panel", "cp",
  // API & Gateway
  "api", "api2", "api-dev", "api-staging", "api-prod", "v1", "v2", "v3", "ws", "wss", "graphql", "grpc", "rest",
  // Environments & Apps
  "app", "apps", "dev", "staging", "stage", "stagging", "beta", "alpha", "demo", "test", "testing", "testernya",
  "qa", "uat", "sandbox", "preview", "lab", "labs", "poc",
  // Admin & Portal
  "admin", "dashboard", "portal", "console", "manage", "manager", "control", "root",
  // DevOps & Microservices
  "git", "gitlab", "github", "ci", "cd", "jenkins", "build", "deploy", "portainer", "docker", "k8s", "kube",
  "n8n", "caddy", "traefik", "nginx", "apache", "acme", "cert", "ssl", "sslnya",
  // Cloud & Storage
  "cloud", "s3", "storage", "bucket", "repo", "registry", "assets", "static", "cdn", "img", "images", "media", "files",
  // Databases & Caches
  "db", "database", "mysql", "postgres", "redis", "mongo", "mongodb", "elastic", "search", "sql", "memcached",
  // Observability & Security
  "status", "monitor", "monitoring", "ping", "grafana", "kibana", "prometheus", "alert", "alerts", "eye", "log", "logs",
  "vpn", "remote", "rdp", "gateway", "proxy", "fw", "firewall", "router", "resolve", "lookup", "ip",
  // Auth & Identity
  "auth", "login", "sso", "id", "oauth", "clerk", "keycloak", "identity", "account", "accounts", "member", "members",
  // Business & Communication
  "shop", "store", "cart", "checkout", "pay", "payment", "billing", "invoice", "crm", "erp",
  "blog", "news", "docs", "wiki", "help", "support", "helpdesk", "ticket", "faq",
  "chat", "meet", "video", "voice", "stream", "live", "forum", "community", "mail2", "relay",
  "tracker", "analytics", "stats", "metrics", "data", "hub", "node", "server", "host",
  // Project / Node Names
  "artemis", "nebula", "luna", "blast", "split", "rolling", "projects", "tools", "word", "wordnew", "shift", "hook"
];

async function lookupA(name) {
  try {
    const res = await fetch(`${DOH}?name=${encodeURIComponent(name)}&type=A`, {
      headers: { Accept: "application/dns-json" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.Answer || []).filter((r) => r.type === 1).map((r) => r.data);
  } catch {
    return [];
  }
}

function checkSsl(host, port = 443, timeout = 3500) {
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host, port, servername: host, rejectUnauthorized: false },
      () => {
        try {
          const cert = socket.getPeerCertificate();
          socket.destroy();
          if (!cert || !Object.keys(cert).length) {
            return resolve({ status: "NO_CERT", issuer: null, validTo: null, daysLeft: null });
          }
          const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
          const now = new Date();
          const isExpired = validTo ? validTo < now : false;
          const issuer = cert.issuer?.O || cert.issuer?.CN || "Unknown CA";

          // Verify whether certificate covers this specific hostname
          const h = host.toLowerCase().trim();
          const san = (cert.subjectaltname || "")
            .split(",")
            .map((s) => s.trim().replace(/^DNS:/, "").toLowerCase())
            .filter(Boolean);
          const cn = (cert.subject?.CN || "").toLowerCase().trim();
          const namesToCheck = [cn, ...san];

          const matches = namesToCheck.some((pattern) => {
            if (pattern.startsWith("*.")) {
              const base = pattern.slice(2);
              const parts = h.split(".");
              return parts.length >= 2 && parts.slice(1).join(".") === base;
            }
            return pattern === h;
          });

          let status = "SECURE";
          if (isExpired) {
            status = "EXPIRED";
          } else if (!matches) {
            status = "MISMATCH";
          }

          resolve({
            status,
            issuer,
            validTo: validTo ? validTo.toISOString() : null,
            daysLeft: validTo ? Math.floor((validTo - now) / 86400000) : null,
          });
        } catch {
          resolve({ status: "NO_SSL", issuer: null, validTo: null, daysLeft: null });
        }
      }
    );
    socket.setTimeout(timeout, () => {
      socket.destroy();
      resolve({ status: "TIMEOUT", issuer: null, validTo: null, daysLeft: null });
    });
    socket.on("error", () => resolve({ status: "NO_SSL", issuer: null, validTo: null, daysLeft: null }));
  });
}

async function fetchSubdomainCenter(domain) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 600));
      const res = await fetch(`https://api.subdomain.center/?domain=${encodeURIComponent(domain)}`, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; NovaX/1.0)" },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {}
  }
  return [];
}

async function gatherTransparencyLogs(domain) {
  const cached = CANDIDATE_CACHE.get(domain);
  const now = Date.now();

  // If valid cache exists within TTL, return immediately
  if (cached && cached.expiresAt > now && cached.candidates.size > 0) {
    return new Map(cached.candidates);
  }

  const map = new Map();

  // Seed with stale cache if available so queries never return 0 on transient network timeout
  if (cached && cached.candidates.size > 0) {
    for (const [h, s] of cached.candidates) {
      map.set(h, s);
    }
  }

  const addHost = (name, source) => {
    if (!name) return;
    const clean = name.trim().toLowerCase().replace(/^\*\./, "");
    // Must be a subdomain of domain, not the apex domain itself
    if (clean.endsWith("." + domain) && clean !== domain) {
      if (!map.has(clean)) {
        map.set(clean, source);
      }
    }
  };

  await Promise.allSettled([
    // 1. subdomain.center (Aggregated CT logs with retry)
    fetchSubdomainCenter(domain)
      .then((arr) => {
        arr.forEach((h) => addHost(h, "ct_log"));
      })
      .catch(() => {}),

    // 2. crt.sh (Public Certificate Transparency via indexed dNSName)
    fetch(`https://crt.sh/?dNSName=%25.${encodeURIComponent(domain)}&output=json`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NovaX/1.0)" },
      signal: AbortSignal.timeout(8000),
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          data.forEach((item) => (item.name_value || "").split("\n").forEach((n) => addHost(n, "ct_log")));
        }
      })
      .catch(() => {}),

    // 3. HackerTarget (Threat Intel)
    fetch(`https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(domain)}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NovaX/1.0)" },
      signal: AbortSignal.timeout(4000),
    })
      .then((r) => r.text())
      .then((text) => {
        if (!text.includes("error check your search") && !text.includes("API count exceeded")) {
          text.split("\n").forEach((line) => {
            const [host] = line.split(",");
            addHost(host, "threat_intel");
          });
        }
      })
      .catch(() => {}),

    // 4. CertSpotter (Public CT issuances)
    fetch(
      `https://api.certspotter.com/v1/issuances?domain=${encodeURIComponent(domain)}&include_subdomains=true&expand=dns_names`,
      {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; NovaX/1.0)" },
        signal: AbortSignal.timeout(4000),
      }
    )
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          data.forEach((item) => (item.dns_names || []).forEach((n) => addHost(n, "ct_log")));
        }
      })
      .catch(() => {}),
  ]);

  // Persist discovered candidate hosts to cache
  if (map.size > 0) {
    CANDIDATE_CACHE.set(domain, {
      candidates: new Map(map),
      expiresAt: now + CACHE_TTL_MS,
    });
  }

  return map;
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
  const rawDomain = searchParams.get("domain") || "";
  const mode = searchParams.get("mode") || "hybrid"; // hybrid | ct | bruteforce
  const checkSslOption = searchParams.get("check_ssl") !== "false";
  const wantsStream = searchParams.get("stream") !== "false";

  const domain = rawDomain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");

  if (!domain || !/^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(domain)) {
    return apiError("A valid root domain is required (e.g. ?domain=example.com)", 400, "INVALID_DOMAIN");
  }

  const startTime = performance.now();

  // If user requested standard non-streaming JSON:
  if (!wantsStream) {
    const candidateMap = new Map();
    if (mode === "hybrid" || mode === "ct") {
      const ctMap = await gatherTransparencyLogs(domain);
      for (const [host, source] of ctMap) {
        candidateMap.set(host, source);
      }
    }
    if (mode === "hybrid" || mode === "bruteforce") {
      WORDLIST.forEach((w) => {
        const h = `${w}.${domain}`;
        if (!candidateMap.has(h)) candidateMap.set(h, "wordlist");
      });
    }

    const candidates = Array.from(candidateMap.entries());
    const active = [];
    const inactive = [];
    const CONCURRENCY = 10;

    for (let i = 0; i < candidates.length; i += CONCURRENCY) {
      const batch = candidates.slice(i, i + CONCURRENCY).map(async ([subdomain, source]) => {
        const ips = await lookupA(subdomain);
        if (ips.length === 0) {
          if (source !== "wordlist") {
            inactive.push({ subdomain, status: "inactive", ips: [], ssl: null, source });
          }
          return;
        }

        let ssl = null;
        if (checkSslOption) {
          ssl = await checkSsl(subdomain);
        }

        active.push({
          subdomain,
          status: "active",
          ips,
          ssl,
          source,
        });
      });
      await Promise.all(batch);
    }

    const durationMs = Math.round(performance.now() - startTime);

    return apiSuccess(
      {
        domain,
        stats: {
          totalEvaluated: candidates.length,
          activeCount: active.length,
          inactiveCount: inactive.length,
          durationMs,
        },
        active,
        inactive,
      },
      {
        mode,
        checkSsl: checkSslOption,
        timestamp: new Date().toISOString(),
      }
    );
  }

  // Streaming NDJSON response
  const encoder = new TextEncoder();
  const CONCURRENCY = 8;

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      // Abort immediately if client disconnected before start
      if (request.signal?.aborted) {
        try {
          controller.close();
        } catch {}
        return;
      }

      request.signal?.addEventListener("abort", () => {
        isClosed = true;
        try {
          controller.close();
        } catch {}
      });

      const emit = (event, data) => {
        if (isClosed || request.signal?.aborted) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify({ event, data }) + "\n"));
        } catch {
          isClosed = true;
        }
      };

      emit("status", { message: "Gathering Certificate Transparency and threat intelligence logs..." });

      const candidateMap = new Map();

      // Gather from CT / Threat Intelligence
      if (mode === "hybrid" || mode === "ct") {
        if (isClosed || request.signal?.aborted) return;
        const ctMap = await gatherTransparencyLogs(domain);
        for (const [host, source] of ctMap) {
          candidateMap.set(host, source);
        }
      }

      if (isClosed || request.signal?.aborted) return;

      // Gather from Wordlist
      if (mode === "hybrid" || mode === "bruteforce") {
        WORDLIST.forEach((w) => {
          const h = `${w}.${domain}`;
          if (!candidateMap.has(h)) candidateMap.set(h, "wordlist");
        });
      }

      const candidates = Array.from(candidateMap.entries());
      let activeCount = 0;
      let inactiveCount = 0;
      let checkedCount = 0;

      emit("init", {
        domain,
        total: candidates.length,
        mode,
        checkSsl: checkSslOption,
      });

      // Run concurrency batches
      for (let i = 0; i < candidates.length; i += CONCURRENCY) {
        if (isClosed || request.signal?.aborted) break;

        const batch = candidates.slice(i, i + CONCURRENCY).map(async ([subdomain, source]) => {
          if (isClosed || request.signal?.aborted) return;

          const ips = await lookupA(subdomain);
          checkedCount++;

          if (isClosed || request.signal?.aborted) return;

          if (ips.length === 0) {
            // If candidate came from verified CT logs / threat intel, emit as inactive node
            if (source !== "wordlist") {
              inactiveCount++;
              emit("node", {
                subdomain,
                status: "inactive",
                ips: [],
                ssl: null,
                source,
              });
            } else {
              // Wordlist miss — just progress
              emit("progress", { checked: checkedCount, total: candidates.length });
            }
            return;
          }

          // Active node (DNS resolved)
          activeCount++;
          let ssl = null;
          if (checkSslOption) {
            ssl = await checkSsl(subdomain);
          }

          if (isClosed || request.signal?.aborted) return;

          emit("node", {
            subdomain,
            status: "active",
            ips,
            ssl,
            source,
          });
        });

        await Promise.all(batch);
      }

      if (isClosed || request.signal?.aborted) return;

      const durationMs = Math.round(performance.now() - startTime);

      emit("complete", {
        total: candidates.length,
        activeCount,
        inactiveCount,
        durationMs,
      });

      if (!isClosed) {
        try {
          controller.close();
        } catch {
          // ignore
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
