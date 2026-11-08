"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Code2,
  Terminal,
  Copy,
  Check,
  ChevronRight,
  Globe,
  Search,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ── helpers ──────────────────────────────────────────────────────────────────

function CodeBlock({ code, language = "bash" }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="relative group rounded-xl border border-ink/20 bg-cream/90 overflow-hidden my-2">
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-ink/10 bg-ink/5">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink/40">
          {language}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copy snippet"
          className="flex items-center gap-1 text-[11px] font-bold text-ink/60 hover:text-ink transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-fern" />
              <span className="text-ink">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-xs font-mono text-ink overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ParamTable({ params }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-ink/15 my-3">
      <table className="w-full text-left text-xs">
        <thead className="bg-cream/60 border-b border-ink/10">
          <tr>
            <th className="py-2 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">Parameter</th>
            <th className="py-2 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">Type</th>
            <th className="py-2 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">Required</th>
            <th className="py-2 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/8 bg-parchment">
          {params.map((p) => (
            <tr key={p.name}>
              <td className="py-2.5 px-3 font-mono font-bold text-ink">{p.name}</td>
              <td className="py-2.5 px-3 text-ink/60 font-mono text-[11px]">{p.type}</td>
              <td className="py-2.5 px-3">
                {p.required ? (
                  <span className="text-[10px] font-black uppercase text-red-600 bg-red-100/60 px-2 py-0.5 rounded-full border border-red-200">
                    Yes
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-ink/40">Optional</span>
                )}
              </td>
              <td className="py-2.5 px-3 text-ink/80 font-medium leading-relaxed">{p.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EndpointCard({
  method = "GET",
  path,
  title,
  desc,
  params,
  curlExample,
  jsonResponse,
  badge = "Live",
}) {
  const [tab, setTab] = useState("curl");

  const jsExample = `const res = await fetch("https://novax.my.id${path}");
const data = await res.json();
console.log(data);`;

  return (
    <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b] mb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="bg-ink text-cream font-black text-xs px-2.5 py-1 rounded-lg tracking-wider">
            {method}
          </span>
          <code className="text-sm sm:text-base font-mono font-bold text-ink">
            {path}
          </code>
        </div>
        <span className="text-[11px] font-black bg-marigold text-ink px-3 py-1 rounded-full border border-ink/20 shadow-[2px_2px_0px_0px_#10380b]">
          {badge}
        </span>
      </div>

      <h3 className="text-lg font-extrabold text-ink mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-ink/70 font-medium mb-4 leading-relaxed">
        {desc}
      </p>

      {/* Query Parameters */}
      {params && params.length > 0 && (
        <div className="mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50">
            Query Parameters
          </span>
          <ParamTable params={params} />
        </div>
      )}

      {/* Request Example */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50">
            Request Example
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setTab("curl")}
              className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
                tab === "curl"
                  ? "bg-ink text-cream"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              cURL
            </button>
            <button
              onClick={() => setTab("js")}
              className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
                tab === "js"
                  ? "bg-ink text-cream"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              JavaScript
            </button>
          </div>
        </div>
        <CodeBlock
          code={tab === "curl" ? curlExample : jsExample}
          language={tab === "curl" ? "bash" : "javascript"}
        />
      </div>

      {/* Response Preview */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50 block mb-1">
          Response (200 OK)
        </span>
        <CodeBlock code={jsonResponse} language="json" />
      </div>
    </div>
  );
}

// ── main page ────────────────────────────────────────────────────────────────

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar maxWidth="max-w-6xl" />

      {/* Breadcrumb sub-header */}
      <div className="sticky top-[53px] z-10 border-b border-ink/15 bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-ink/40 text-xs font-bold">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <ChevronRight size={11} />
            <span className="text-ink">API Documentation</span>
          </div>
          <span className="text-xs font-mono font-bold text-ink/40 hidden sm:inline">
            v1.0 • REST API
          </span>
        </div>
      </div>

      <div className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 pt-10 pb-20">

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-marigold text-ink font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-[3px_3px_0px_0px_#10380b] mb-4">
            <Sparkles size={13} />
            Public REST API
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-ink tracking-tight mb-3">
            API Documentation
          </h1>
          <p className="text-base text-ink/60 font-semibold max-w-2xl leading-relaxed">
            Integrate Nova-X network and security utilities into your own applications,
            bots, and automation workflows. Open, unauthenticated, and CORS-enabled.
          </p>
        </motion.div>

        {/* Standard Envelope Specification Card */}
        <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b] mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-black text-xs uppercase tracking-widest text-ink/50">
              Standard Response Envelope
            </span>
            <div className="flex-1 h-px bg-ink/10" />
          </div>
          <p className="text-xs sm:text-sm text-ink/70 font-medium mb-4 leading-relaxed">
            All Nova-X API endpoints adhere to a standardized JSON envelope for both
            successful responses and errors.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <span className="text-xs font-bold text-fern flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-fern" />
                Success Schema (HTTP 200)
              </span>
              <CodeBlock
                code={`{
  "success": true,
  "data": { ... },
  "meta": { ... } // optional
}`}
                language="json"
              />
            </div>

            <div>
              <span className="text-xs font-bold text-red-600 flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                Error Schema (HTTP 4xx / 5xx)
              </span>
              <CodeBlock
                code={`{
  "success": false,
  "error": {
    "code": "INVALID_DOMAIN",
    "message": "Human readable explanation"
  }
}`}
                language="json"
              />
            </div>
          </div>
        </div>

        {/* Rate Limiting Card */}
        <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b] mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-black text-xs uppercase tracking-widest text-ink/50">
              International Rate Limit Standard (IETF RFC 6585)
            </span>
            <div className="flex-1 h-px bg-ink/10" />
          </div>
          <p className="text-xs sm:text-sm text-ink/70 font-medium mb-4 leading-relaxed">
            All endpoints enforce an international standard rate limit of{" "}
            <strong className="text-ink font-bold">60 requests per minute</strong> per client IP address.
            Every API response returns standard RFC rate limit headers for client throttlers and bot management:
          </p>

          <div className="grid gap-4 sm:grid-cols-2 mb-4">
            <div className="bg-cream/60 rounded-xl border border-ink/15 p-3.5 space-y-1.5">
              <span className="text-[11px] font-bold text-ink uppercase tracking-wider block">
                IETF Headers (draft-ietf-httpapi-ratelimit-headers)
              </span>
              <div className="font-mono text-xs space-y-1 text-ink/80">
                <div><code className="font-bold text-ink">RateLimit-Limit</code>: 60</div>
                <div><code className="font-bold text-ink">RateLimit-Remaining</code>: 59</div>
                <div><code className="font-bold text-ink">RateLimit-Reset</code>: 60</div>
                <div><code className="font-bold text-ink">RateLimit-Policy</code>: 60;w=60</div>
              </div>
            </div>

            <div className="bg-cream/60 rounded-xl border border-ink/15 p-3.5 space-y-1.5">
              <span className="text-[11px] font-bold text-ink uppercase tracking-wider block">
                Legacy Headers & HTTP 429
              </span>
              <div className="font-mono text-xs space-y-1 text-ink/80">
                <div><code className="font-bold text-ink">X-RateLimit-Limit</code>: 60</div>
                <div><code className="font-bold text-ink">X-RateLimit-Remaining</code>: 59</div>
                <div><code className="font-bold text-ink">X-RateLimit-Reset</code>: 1731000000</div>
                <div><code className="font-bold text-ink">Retry-After</code>: 60 (on 429)</div>
              </div>
            </div>
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50 block mb-1">
            HTTP 429 Too Many Requests (Sample Response)
          </span>
          <CodeBlock
            code={`{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Limit is 60 requests per 60 seconds. Retry in 42 seconds."
  }
}`}
            language="json"
          />
        </div>

        {/* Section: Live Endpoints */}
        <div className="mb-6 flex items-center gap-2">
          <Terminal size={18} className="text-ink" />
          <h2 className="text-2xl font-black text-ink tracking-tight">Available Endpoints</h2>
        </div>

        {/* Endpoint 1: DNS Lookup */}
        <EndpointCard
          method="GET"
          path="/api/dns-lookup?domain=example.com"
          title="DNS Lookup & Reverse DNS"
          desc="Fetches all authoritative DNS records (A, AAAA, MX, NS, TXT, CNAME, SOA) via Google DoH, and automatically resolves reverse DNS (PTR) for all discovered IPv4 addresses."
          params={[
            {
              name: "domain",
              type: "string",
              required: true,
              desc: "Target domain name without protocol (e.g. example.com).",
            },
            {
              name: "type",
              type: "string",
              required: false,
              desc: "Optional specific DNS record type: A, AAAA, MX, NS, TXT, CNAME, SOA, or ALL (default).",
            },
          ]}
          curlExample="curl -s 'https://novax.my.id/api/dns-lookup?domain=example.com'"
          jsonResponse={`{
  "success": true,
  "data": {
    "domain": "example.com",
    "totalRecords": 10,
    "records": {
      "A": [
        { "name": "example.com.", "type": 1, "TTL": 300, "data": "104.20.23.154" },
        { "name": "example.com.", "type": 1, "TTL": 300, "data": "172.66.147.243" }
      ],
      "AAAA": [
        { "name": "example.com.", "type": 28, "TTL": 300, "data": "2606:4700:10::6814:179a" },
        { "name": "example.com.", "type": 28, "TTL": 300, "data": "2606:4700:10::ac42:93f3" }
      ],
      "MX": [
        { "name": "example.com.", "type": 15, "TTL": 300, "data": "0 ." }
      ],
      "NS": [
        { "name": "example.com.", "type": 2, "TTL": 21600, "data": "elliott.ns.cloudflare.com." },
        { "name": "example.com.", "type": 2, "TTL": 21600, "data": "hera.ns.cloudflare.com." }
      ],
      "TXT": [
        { "name": "example.com.", "type": 16, "TTL": 300, "data": "\"v=spf1 -all\"" }
      ],
      "CNAME": [],
      "SOA": [
        { "name": "example.com.", "type": 6, "TTL": 1800, "data": "elliott.ns.cloudflare.com. dns.cloudflare.com. 2418004112 10000 2400 604800 1800" }
      ]
    },
    "ptr": []
  }
}`}
        />

        {/* Endpoint 2: WHOIS / RDAP */}
        <EndpointCard
          method="GET"
          path="/api/whois?domain=example.com"
          title="WHOIS / RDAP Domain Registration"
          desc="Queries the authoritative ICANN RDAP registry bootstrap router for domain ownership metadata, registrar details, registration dates, expiration status, and domain lifecycle locks."
          params={[
            {
              name: "domain",
              type: "string",
              required: true,
              desc: "Target domain name without protocol (e.g. example.com).",
            },
          ]}
          curlExample="curl -s 'https://novax.my.id/api/whois?domain=example.com'"
          jsonResponse={`{
  "success": true,
  "data": {
    "domain": "EXAMPLE.COM",
    "handle": "2336799_DOMAIN_COM-VRSN",
    "status": [
      "client delete prohibited",
      "client transfer prohibited",
      "client update prohibited"
    ],
    "events": {
      "registration": "1995-08-14T04:00:00Z",
      "expiration": "2027-08-13T04:00:00Z",
      "lastChanged": "2026-08-14T08:01:43Z"
    },
    "registrar": "RESERVED-Internet Assigned Numbers Authority",
    "registrant": null,
    "nameservers": [
      "ELLIOTT.NS.CLOUDFLARE.COM",
      "HERA.NS.CLOUDFLARE.COM"
    ]
  }
}`}
        />

        {/* Endpoint 3: IP Geolocation */}
        <EndpointCard
          method="GET"
          path="/api/ip-geo?ip=8.8.8.8"
          title="IP Geolocation & Network Routing"
          desc="Resolves geographic location, country, city, postal code, ASN, ISP routing, and latitude/longitude coordinates for any IPv4 or IPv6 address. Omit the ?ip parameter to detect caller's public IP."
          params={[
            {
              name: "ip",
              type: "string",
              required: false,
              desc: "Target IPv4 or IPv6 address (e.g. 8.8.8.8). If omitted, automatically resolves caller's public IP.",
            },
          ]}
          curlExample="curl -s 'https://novax.my.id/api/ip-geo?ip=8.8.8.8'"
          jsonResponse={`{
  "success": true,
  "data": {
    "ip": "8.8.8.8",
    "country": "United States",
    "countryCode": "US",
    "region": "CA",
    "regionName": "California",
    "city": "San Jose",
    "zip": "95025",
    "latitude": 37.3393939,
    "longitude": -121.8949553,
    "timezone": "America/Los_Angeles",
    "isp": "Google LLC",
    "org": "Google LLC",
    "as": "AS15169 Google LLC",
    "flag": "🇺🇸",
    "flagUrl": "https://cdn.ipwhois.io/flags/us.svg"
  }
}`}
        />

        {/* Endpoint 4: License Checker */}
        <EndpointCard
          method="GET"
          path="/api/license-check?ip=8.8.8.8"
          title="Hosting & OS License Verification"
          desc="Simultaneously audits cPanel/WHM licensing status via verify.cpanel.net and CloudLinux/Imunify registry instances via cln.cloudlinux.com."
          params={[
            {
              name: "ip",
              type: "string",
              required: true,
              desc: "Target IPv4 address to audit (e.g. 8.8.8.8).",
            },
          ]}
          curlExample="curl -s 'https://novax.my.id/api/license-check?ip=8.8.8.8'"
          jsonResponse={`{
  "success": true,
  "data": {
    "ip": "8.8.8.8",
    "licensed": true,
    "products": {
      "cpanel": null,
      "cloudlinux": null,
      "imunify": {
        "package": "IMAVP",
        "product": "Imunify AV Plus",
        "status": "registered",
        "hostname": "N/D"
      },
      "jetbackup": null
    },
    "licenses": [
      {
        "product": "cPanel",
        "package": "cPanel Premier",
        "partnerNoc": "Example Partner NOC",
        "activity": "Active",
        "status": "active"
      }
    ],
    "registry": {
      "instances": [
        {
          "product": "IMAVP",
          "productLabel": "Imunify AV Plus",
          "hostname": "N/D",
          "type": "IP",
          "typeLabel": "IP-based license",
          "registered": "2023-07-18T17:45:36.000Z",
          "checkin": null
        }
      ]
    }
  }
}`}
        />

        {/* Endpoint 5: Proxy Viewer (Pre-DNS Preview) */}
        <EndpointCard
          method="GET"
          path="/api/proxy-viewer?domain=example.com&target=192.0.2.1"
          title="VirtualHost Proxy & Pre-DNS Preview"
          desc="Generates pre-DNS preview endpoints and audits target server reachability via rover.novax.my.id without modifying client hosts files."
          params={[
            {
              name: "domain",
              type: "string",
              required: true,
              desc: "Target domain name configured as the virtual host (e.g. example.com).",
            },
            {
              name: "target",
              type: "string",
              required: true,
              desc: "Target server IP address or staging hostname (e.g. 192.0.2.1 or server.staging.com).",
            },
          ]}
          curlExample="curl -s 'https://novax.my.id/api/proxy-viewer?domain=example.com&target=192.0.2.1'"
          jsonResponse={`{
  "success": true,
  "data": {
    "domain": "example.com",
    "target": "192.0.2.1",
    "previewUrl": "https://rover.novax.my.id/192.0.2.1/example.com",
    "publicDnsIps": [
      "104.20.23.154",
      "172.66.147.243"
    ],
    "isAlreadyLive": false,
    "status": 200,
    "responseTimeMs": 142
  }
}`}
        />

      </div>

      <Footer />
    </main>
  );
}
