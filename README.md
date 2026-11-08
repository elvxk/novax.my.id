# Nova-X (`novax.my.id`)

> Network and security diagnostic tools for developers, sysadmins, and security researchers.

Built with **Next.js 16 (Turbopack)**, **Tailwind CSS v4**, **Framer Motion**, and powered by **Bun**. Styled in a retro botanical almanac aesthetic with warm cream canvas, deep forest ink, marigold accents, and hard offset shadows.

---

## ⚡ Features & Tools

- **DNS Lookup (`/tools/dns-lookup`)**: Authoritative DNS resolution for A, AAAA, MX, NS, TXT, CNAME, and SOA records via Google DoH.
- **Proxy Viewer (`/tools/proxy-viewer`)**: Preview and test virtual hosts on specific server IPs or hostnames before changing public DNS records.
- **IP Geolocation (`/tools/ip-geo`)**: Geographic location coordinates, interactive OpenStreetMap Leaflet visualization, ASN, and ISP routing data.
- **License Checker (`/tools/license-check`)**: Multi-registry verification of cPanel/WHM, CloudLinux OS, Imunify360, and JetBackup registrations.
- **Reverse DNS (PTR)**: Automatic IPv4 extraction from A/TXT records and reverse in-addr.arpa lookup.
- **WHOIS / RDAP**: ICANN RDAP bootstrap routing for registrar information, registrant details, domain status locks, and expiration alerts.
- **API Documentation (`/docs`)**: Interactive developer documentation for consuming Nova-X tools programmatically.

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) (mandatory default runtime and package manager)

### Installation

1. Clone repository:
   ```bash
   git clone https://github.com/elvxk/novax.git
   cd novax
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Setup environment variables:
   ```bash
   cp .env.example .env
   ```

4. Run development server:
   ```bash
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Public REST API Documentation

All Nova-X tools are consumable as public, unauthenticated, CORS-enabled REST APIs.

### Base URL

```
Production: https://novax.my.id/api
Localhost:  http://localhost:3000/api
```

---

### Standard Response Envelope

Every endpoint adheres to a unified JSON response structure:

#### Success Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```

#### Error Response (`HTTP 4xx / 5xx`)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_DOMAIN",
    "message": "Human readable error description."
  }
}
```

---

### ⏱️ International Rate Limiting Standard

Nova-X implements the **IETF HTTP RateLimit Standard** (`draft-ietf-httpapi-ratelimit-headers`) and **RFC 6585** (`HTTP 429 Too Many Requests`).

- **Policy**: `60 requests per 60 seconds` per client IP address.
- **Headers returned on every request**:
  | Header | Standard | Description |
  |---|---|---|
  | `RateLimit-Limit` | IETF Draft | Maximum requests allowed in current window (`60`) |
  | `RateLimit-Remaining` | IETF Draft | Remaining requests quota in current window |
  | `RateLimit-Reset` | IETF Draft | Seconds remaining until the quota resets |
  | `RateLimit-Policy` | IETF Draft | Quota policy definition (`60;w=60`) |
  | `X-RateLimit-Limit` | Legacy / RFC | Max requests limit |
  | `X-RateLimit-Remaining` | Legacy / RFC | Available requests remaining |
  | `X-RateLimit-Reset` | Legacy / RFC | Epoch timestamp (seconds) of window reset |

#### Rate Limit Exceeded (`HTTP 429 Too Many Requests`)
When throttled, the API returns header `Retry-After: <seconds>` and payload:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Limit is 60 requests per 60 seconds. Retry in 35 seconds."
  }
}
```

---

### Endpoints

#### 1. DNS Lookup & Reverse DNS
Resolve authoritative DNS records and reverse DNS (PTR) for any domain.

- **Method**: `GET`
- **Path**: `/api/dns-lookup`
- **Parameters**:
  - `domain` *(string, required)*: Domain name without protocol (e.g. `example.com`).
  - `type` *(string, optional)*: Specific record type (`A`, `AAAA`, `MX`, `NS`, `TXT`, `CNAME`, `SOA`, or `ALL` default).

**Example Request:**
```bash
curl -s "https://novax.my.id/api/dns-lookup?domain=example.com"
```

**Example Response:**
```json
{
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
        { "name": "example.com.", "type": 28, "TTL": 300, "data": "2606:4700:10::6814:179a" }
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
}
```

---

#### 2. WHOIS / RDAP Registration
Query authoritative ICANN RDAP registry metadata for domain ownership and registration dates.

- **Method**: `GET`
- **Path**: `/api/whois`
- **Parameters**:
  - `domain` *(string, required)*: Target domain name (e.g. `example.com`).

**Example Request:**
```bash
curl -s "https://novax.my.id/api/whois?domain=example.com"
```

**Example Response:**
```json
{
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
}
```

---

#### 3. IP Geolocation & Network Routing
Resolve geographic location, city, country, postal code, ASN, ISP details, and latitude/longitude coordinates.

- **Method**: `GET`
- **Path**: `/api/ip-geo`
- **Parameters**:
  - `ip` *(string, optional)*: Target IPv4 or IPv6 address (e.g. `8.8.8.8`). If omitted, resolves caller's public IP.

**Example Request:**
```bash
curl -s "https://novax.my.id/api/ip-geo?ip=8.8.8.8"
```

**Example Response:**
```json
{
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
}
```

---

#### 4. Hosting & OS License Verification
Simultaneously audits cPanel/WHM licensing via verify.cpanel.net and CloudLinux/Imunify registry instances via cln.cloudlinux.com.

- **Method**: `GET`
- **Path**: `/api/license-check`
- **Parameters**:
  - `ip` *(string, required)*: Target IPv4 address to audit (e.g. `8.8.8.8`).

**Example Request:**
```bash
curl -s "https://novax.my.id/api/license-check?ip=8.8.8.8"
```

**Example Response:**
```json
{
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
}
```

---

#### 5. VirtualHost Proxy & Pre-DNS Preview
Generates pre-DNS preview endpoints and audits target server reachability via rover.novax.my.id without modifying client hosts files.

- **Method**: `GET`
- **Path**: `/api/proxy-viewer`
- **Parameters**:
  - `domain` *(string, required)*: Virtual host domain name (e.g. `example.com`).
  - `target` *(string, required)*: Target server IP or hostname (e.g. `192.0.2.1` or `server.staging.com`).

**Example Request:**
```bash
curl -s "https://novax.my.id/api/proxy-viewer?domain=example.com&target=192.0.2.1"
```

**Example Response:**
```json
{
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
}
```

---

## ⚙️ Configuration (.env)

| Variable | Default | Description |
|---|---|---|
| `DOH_BASE_URL` | `https://dns.google/resolve` | Upstream DNS-over-HTTPS provider endpoint |
| `RDAP_BASE_URL` | `https://rdap.org/domain/` | Upstream RDAP bootstrap router endpoint |
| `IP_API_URL` | `https://ipwho.is` | Upstream IP Geolocation provider endpoint |
| `VERIFY_CPANEL_URL` | `https://verify.cpanel.net/app/verify` | Upstream cPanel verification endpoint |
| `CLN_URL` | `https://cln.cloudlinux.com/wapi/check/ip` | Upstream CloudLinux registry endpoint |
| `PREVIEW_SERVICE_URL` | `https://rover.novax.my.id` | PreviewProxy backend service URL |
| `RATE_LIMIT_MAX` | `60` | Max requests allowed per rate limit window |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | Duration of rate limit window in seconds |

---

## 🛠️ Build & Production

```bash
# Build optimized production bundle
bun run build

# Start production server
bun run start
```

---

## 📄 License

MIT © [Nova-X](https://novax.my.id)
