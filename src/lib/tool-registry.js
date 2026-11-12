/**
 * Nova-X Tool Configuration & Registry
 * Central single source of truth for tool states.
 *
 * Flags:
 * - live: boolean (false = under maintenance / offline. API returns 503, UI shows Maintenance)
 * - disabled: boolean (true = completely hidden from catalog, search, docs, and returns 404)
 */

export const TOOL_DEFINITIONS = [
  {
    id: "dns-lookup",
    name: "DNS Lookup",
    label: "DNS Lookup",
    desc: "Inspect DNS records (A, AAAA, MX, NS, TXT, CNAME, SOA), reverse DNS PTR, and domain registration WHOIS / RDAP.",
    iconName: "Globe",
    href: "/tools/dns-lookup",
    apiEndpoints: ["/api/dns-lookup", "/api/whois"],
    live: true,
    disabled: false,
    featured: true,
    tags: ["DNS", "WHOIS", "RDAP", "PTR"],
  },
  {
    id: "ip-geo",
    name: "IP Geolocation",
    label: "IP Geolocation",
    desc: "Lookup country, city, ASN, ISP details, and geographic coordinates for any IPv4 or IPv6 address.",
    iconName: "MapPin",
    href: "/tools/ip-geo",
    apiEndpoints: ["/api/ip-geo"],
    live: true,
    disabled: false,
    featured: true,
    tags: ["GeoIP", "ASN", "ISP"],
  },
  {
    id: "proxy-viewer",
    name: "Manual Resolve",
    label: "Manual Resolve",
    desc: "Preview websites on specific server IPs or staging hostnames before changing public DNS records.",
    iconName: "Shield",
    href: "/tools/proxy-viewer",
    apiEndpoints: ["/api/proxy-viewer"],
    live: true,
    disabled: false,
    featured: true,
    tags: ["DNS Preview", "Manual Resolver", "Resolver"],
  },
  {
    id: "license-check",
    name: "License Checker",
    label: "License Check",
    desc: "Verify cPanel, CloudLinux, Imunify, and JetBackup license registrations from any IP address.",
    iconName: "Key",
    href: "/tools/license-check",
    apiEndpoints: ["/api/license-check"],
    live: true,
    disabled: false,
    featured: false,
    tags: ["cPanel", "CloudLinux", "Imunify", "JetBackup"],
  },
  {
    id: "smtp-sender",
    name: "SMTP Sender",
    label: "SMTP Sender",
    desc: "Verify outbound email delivery through any SMTP server with custom credentials and encryption settings.",
    iconName: "Mail",
    href: "/tools/smtp-sender",
    apiEndpoints: ["/api/smtp-sender"],
    live: true,
    disabled: false,
    featured: true,
    tags: ["SMTP", "Email", "Deliverability", "SSL", "TLS"],
  },
  {
    id: "ssl-checker",
    name: "SSL Checker",
    label: "SSL Checker",
    desc: "Inspect and validate SSL/TLS certificates — expiry, domain match, issuer, SANs, and fingerprints.",
    iconName: "Lock",
    href: "/tools/ssl-checker",
    apiEndpoints: ["/api/ssl-checker"],
    live: true,
    disabled: false,
    featured: false,
    tags: ["SSL", "TLS", "Certificate", "HTTPS"],
  },
  {
    id: "subdomain-finder",
    name: "Subdomain Finder",
    label: "Subdomain Finder",
    desc: "Enumerate subdomains of any root domain via DNS brute-force against a common wordlist.",
    iconName: "Network",
    href: "/tools/subdomain-finder",
    apiEndpoints: ["/api/subdomain-finder"],
    live: true,
    disabled: false,
    featured: false,
    tags: ["DNS", "Subdomain", "Enumeration", "Recon"],
  },
];

/**
 * Fast lookup helper for middleware / proxy guard
 */
export function getToolByPath(pathname) {
  if (!pathname) return null;

  // Exact matching for /tools/:id
  if (pathname.startsWith("/tools/")) {
    const slug = pathname.replace(/^\/tools\//, "").split("/")[0];
    return TOOL_DEFINITIONS.find((t) => t.id === slug) || null;
  }

  // Exact matching for API endpoints
  if (pathname.startsWith("/api/")) {
    const endpoint = pathname.split("?")[0];
    return (
      TOOL_DEFINITIONS.find((t) => t.apiEndpoints.includes(endpoint)) || null
    );
  }

  return null;
}
