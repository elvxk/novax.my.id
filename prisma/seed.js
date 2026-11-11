import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const INITIAL_TOOLS = [
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
    name: "Proxy Viewer",
    label: "Proxy Viewer",
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
    featured: true,
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
    featured: true,
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
    featured: true,
    tags: ["DNS", "Subdomain", "Enumeration", "Recon"],
  },
];

async function main() {
  console.log("🌱 Starting tool database seeding...");

  for (let i = 0; i < INITIAL_TOOLS.length; i++) {
    const tool = INITIAL_TOOLS[i];
    await prisma.tool.upsert({
      where: { id: tool.id },
      update: {
        name: tool.name,
        label: tool.label,
        desc: tool.desc,
        iconName: tool.iconName,
        href: tool.href,
        apiEndpoints: tool.apiEndpoints,
        live: tool.live,
        disabled: tool.disabled,
        featured: tool.featured,
        tags: tool.tags,
        sortOrder: i,
      },
      create: {
        id: tool.id,
        name: tool.name,
        label: tool.label,
        desc: tool.desc,
        iconName: tool.iconName,
        href: tool.href,
        apiEndpoints: tool.apiEndpoints,
        live: tool.live,
        disabled: tool.disabled,
        featured: tool.featured,
        tags: tool.tags,
        sortOrder: i,
      },
    });
    console.log(`✓ Seeded tool: ${tool.name} (${tool.id})`);
  }

  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
