# Nova-X

> Network utilities, server security auditing, and web diagnostic platform.

[![Runtime](https://img.shields.io/badge/Runtime-Bun-f472b6?style=flat-square&logo=bun)](https://bun.sh)
[![Framework](https://img.shields.io/badge/Framework-Next.js%2016-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

Live at **[novax.my.id](https://novax.my.id)** · API Documentation: **[novax.my.id/docs](https://novax.my.id/docs)**

---

## Tools

| Tool | Route | Description |
| :--- | :--- | :--- |
| **DNS Lookup** | `/tools/dns-lookup` | Authoritative DNS records (A, AAAA, MX, NS, TXT, CNAME, SOA), PTR, and RDAP/WHOIS. |
| **Bot & Crawler Test** | `/tools/crawl-test` | Test website accessibility for search engine and AI bots (robots.txt, meta, cloaking). |
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

All utilities are accessible via unauthenticated, CORS-enabled REST endpoints adhering to IETF RFC 6585 rate limiting (60 req/min).

```bash
# Example: Bot crawler accessibility test
curl -s 'https://novax.my.id/api/crawl-test?url=example.com'

# Example: DNS lookup
curl -s 'https://novax.my.id/api/dns-lookup?domain=example.com'
```

Full interactive playground: **[novax.my.id/docs](https://novax.my.id/docs)**

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

## License

Released under the [MIT License](LICENSE).
