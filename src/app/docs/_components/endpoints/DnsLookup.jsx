import EndpointCard from "../EndpointCard";

export default function DnsLookup({ open, onToggle }) {
  return (
    <EndpointCard
      id="dns-lookup"
      open={open}
      onToggle={onToggle}
      method="GET"
      path="/api/dns-lookup?domain=example.com"
      title="DNS Lookup & Reverse DNS"
      desc="Fetches all authoritative DNS records (A, AAAA, MX, NS, TXT, CNAME, SOA) via Google DoH, and automatically resolves reverse DNS (PTR) for all discovered IPv4 addresses."
      params={[
        { name: "domain", type: "string", required: true, desc: "Target domain name without protocol (e.g. example.com)." },
        { name: "type", type: "string", required: false, desc: "Specific record type: A, AAAA, MX, NS, TXT, CNAME, SOA, or ALL (default)." },
      ]}
      curlExample={`curl -s 'https://novax.my.id/api/dns-lookup?domain=example.com'`}
      jsonResponse={`{
  "success": true,
  "data": {
    "domain": "example.com",
    "totalRecords": 10,
    "records": {
      "A": [
        { "name": "example.com.", "type": 1, "TTL": 300, "data": "104.20.23.154" }
      ],
      "MX": [
        { "name": "example.com.", "type": 15, "TTL": 300, "data": "0 ." }
      ],
      "NS": [
        { "name": "example.com.", "type": 2, "TTL": 21600, "data": "elliott.ns.cloudflare.com." }
      ],
      "TXT": [
        { "name": "example.com.", "type": 16, "TTL": 300, "data": "\\"v=spf1 -all\\"" }
      ],
      "SOA": [
        { "name": "example.com.", "type": 6, "TTL": 1800, "data": "elliott.ns.cloudflare.com. dns.cloudflare.com. 2418004112 10000 2400 604800 1800" }
      ]
    },
    "ptr": []
  }
}`}
    />
  );
}
