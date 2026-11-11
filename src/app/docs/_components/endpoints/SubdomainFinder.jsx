import EndpointCard from "../EndpointCard";

export default function SubdomainFinder({ open, onToggle }) {
  return (
    <EndpointCard
      id="subdomain-finder"
      open={open}
      onToggle={onToggle}
      method="GET"
      path="/api/subdomain-finder?domain=example.com&mode=hybrid&check_ssl=true"
      title="Subdomain Reconnaissance & SSL Audit"
      desc="Discovers all associated active and historical subdomains by aggregating Certificate Transparency logs (crt.sh, subdomain.center, threat intel) with DNS brute-forcing, verifying active A-records and auditing SSL status on all live nodes."
      params={[
        { name: "domain", type: "string", required: true, desc: "Root domain name to inspect (e.g. example.com)." },
        { name: "mode", type: "string", required: false, desc: "Enumeration technique: 'hybrid' (default), 'ct' (Certificate Transparency only), or 'bruteforce' (DNS wordlist only)." },
        { name: "check_ssl", type: "boolean", required: false, desc: "Whether to validate TLS handshakes and certificates on active nodes (defaults to true)." },
        { name: "stream", type: "boolean", required: false, desc: "Set to false to receive standard JSON response instead of newline-delimited JSON stream (defaults to true)." },
      ]}
      curlExample={`# Standard JSON envelope response:\ncurl -s 'https://novax.my.id/api/subdomain-finder?domain=example.com&mode=hybrid&stream=false'\n\n# Streaming NDJSON response:\ncurl -N -s 'https://novax.my.id/api/subdomain-finder?domain=example.com'`}
      jsonResponse={`{
  "success": true,
  "data": {
    "domain": "example.com",
    "stats": {
      "totalEvaluated": 84,
      "activeCount": 2,
      "inactiveCount": 1,
      "durationMs": 1420
    },
    "active": [
      {
        "subdomain": "api.example.com",
        "status": "active",
        "ips": ["93.184.216.34"],
        "ssl": {
          "status": "SECURE",
          "issuer": "DigiCert Global Root G2",
          "validTo": "2027-01-15T23:59:59.000Z",
          "daysLeft": 65
        },
        "source": "ct_log"
      },
      {
        "subdomain": "www.example.com",
        "status": "active",
        "ips": ["93.184.216.34"],
        "ssl": {
          "status": "SECURE",
          "issuer": "DigiCert Global Root G2",
          "validTo": "2027-01-15T23:59:59.000Z",
          "daysLeft": 65
        },
        "source": "wordlist"
      }
    ],
    "inactive": [
      {
        "subdomain": "legacy.example.com",
        "status": "inactive",
        "ips": [],
        "ssl": null,
        "source": "ct_log"
      }
    ]
  },
  "meta": {
    "mode": "hybrid",
    "checkSsl": true,
    "timestamp": "2026-11-11T05:36:43.548Z"
  }
}`}
    />
  );
}
