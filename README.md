# Nova-X

Network utilities, server security auditing, and web diagnostic platform.

[![Runtime](https://img.shields.io/badge/Runtime-Bun-f472b6?style=flat-square&logo=bun)](https://bun.sh)
[![Framework](https://img.shields.io/badge/Framework-Next.js%2016-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](https://opensource.org/licenses/MIT)

Live at **[novax.my.id](https://novax.my.id)** · API Documentation: **[novax.my.id/docs](https://novax.my.id/docs)**

---

## Overview

Nova-X is an open network diagnostics and server utility platform for developers and sysadmins. It provides fast, privacy-first, CORS-enabled tools for DNS, SSL/TLS, IP geolocation, proxy, SMTP, license verification, crawl testing, subdomain enumeration, and generic HTTP API testing — all without authentication.

All utilities expose an unauthenticated REST API following IETF RFC 6585 rate limiting (60 req/min).

---

## Tools

| Tool | Route | Description |
| :--- | :--- | :--- |
| **HTTP Client** | `/tools/http-client` | Send HTTP requests with custom methods, headers, body, and auth — Postman-like API testing. |
| **DNS Lookup** | `/tools/dns-lookup` | Authoritative DNS records (A, AAAA, MX, NS, TXT, CNAME, SOA), PTR, and RDAP/WHOIS. |
| **Bot & Crawler Test** | `/tools/crawl-test` | Test website accessibility for search engine and AI bots (robots.txt, meta tags, cloaking). |
| **SSL Checker** | `/tools/ssl-checker` | Inspect TLS certificate chains, expiry dates, SANs, and cipher validity. |
| **SSL Generator** | `/tools/ssl-generator` | Free trusted SSL certificates via automated ACME DNS-01 challenges. |
| **CSR Generator** | `/tools/csr-generator` | Generate RSA private keys and Certificate Signing Requests with custom SANs. |
| **IP Geolocation** | `/tools/ip-geo` | Country, city, ASN, ISP info, and interactive Leaflet map for IPv4/IPv6. |
| **Proxy Site** | `/tools/proxy-site` | Anonymous web proxy and live sandboxed website preview. |
| **Manual Resolve** | `/tools/proxy-viewer` | Preview VirtualHosts on specific server IPs before updating public DNS. |
| **Subdomain Finder** | `/tools/subdomain-finder` | Enumerate active subdomains via high-speed DNS brute-force. |
| **SMTP Sender** | `/tools/smtp-sender` | Test outbound email delivery with STARTTLS, SSL/TLS, and custom credentials. |
| **License Check** | `/tools/license-check` | Verify licenses for cPanel, CloudLinux, Imunify360, and JetBackup. |

---

## Public REST API

All utilities are accessible via unauthenticated, CORS-enabled REST endpoints adhering to IETF RFC 6585 rate limiting (60 req/min per IP).

### Example

```bash
# Bot crawler accessibility test
curl -s 'https://novax.my.id/api/crawl-test?url=example.com'

# DNS lookup
curl -s 'https://novax.my.id/api/dns-lookup?domain=example.com'

# HTTP API client (POST)
curl -s -X POST 'https://novax.my.id/api/http-client' \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://httpbin.org/get","method":"GET"}'
```

Full interactive playground: **[novax.my.id/docs](https://novax.my.id/docs)**

---

## Features

- **Tool Catalog** — Grid and list view modes with real-time search (filter by name, description, or tags).
- **HTTP API Client** — Method selector, key-value headers, body editor (JSON/XML/Text/Form), Basic/Bearer auth, response panel with timing/size, and request history.
- **Command Palette** — `Ctrl+K` / `Cmd+K` global quick search across tools, API docs, and navigation.
- **Rate Limiting** — 60 requests per minute per IP with `Retry-After` headers (RFC 6585).
- **Security Headers** — HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy.

---

## Tech Stack

- **Runtime & Package Manager**: [Bun](https://bun.sh)
- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **UI & Styling**: React 19, Tailwind CSS 4, Framer Motion, Lucide Icons
- **Crypto & Network**: Node-Forge (PKI/CSR), Nodemailer, Leaflet

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.1+)

### Development

```bash
# Clone the repository
git clone https://github.com/novaxmyid/novax.git
cd novax

# Install dependencies
bun install

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
bun run build
bun run start
```

### Testing & Linting

```bash
bun test
bun run lint
```

---

## Project Structure

```
src/
├── app/
│   ├── api/<tool>/route.js      # API route handlers (POST proxy, GET lookups, etc.)
│   ├── docs/_components/endpoints/  # Interactive API documentation cards
│   ├── tools/<tool>/page.jsx    # Client-side tool pages
│   └── ...
├── components/                  # Shared UI (Navbar, Footer, HeroSection, CommandPalette)
├── lib/
│   ├── tool-registry.js         # Single source of truth for tool definitions
│   ├── api-response.js          # Standard success/error API envelopes
│   ├── rate-limit.js            # IP-based rate limiter (RFC 6585)
│   └── utils.js
├── config/                      # App configuration
└── proxy.js                     # Node proxy utility
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/your-feature`)
3. Commit your changes (`git commit -m "feat(scope): description"`)
4. Push to the branch (`git push origin feat/your-feature`)
5. Open a Pull Request

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).

---

## License

Released under the [MIT License](https://opensource.org/licenses/MIT).
