import EndpointCard from "../EndpointCard";

export default function SslChecker({ open, onToggle }) {
  return (
    <EndpointCard
      id="ssl-checker"
      open={open}
      onToggle={onToggle}
      method="GET"
      path="/api/ssl-checker?domain=example.com"
      title="SSL / TLS Certificate Validation"
      desc="Performs a direct TLS handshake on port 443, extracts X.509 certificate metadata, verifies domain matching (including wildcard coverage), calculates expiration status, and extracts SHA-1 and SHA-256 fingerprints."
      params={[
        { name: "domain", type: "string", required: true, desc: "Target hostname or domain name (e.g. example.com or api.example.com)." },
        { name: "port", type: "number", required: false, desc: "Target TLS port (defaults to 443)." },
      ]}
      curlExample={`curl -s 'https://novax.my.id/api/ssl-checker?domain=example.com'`}
      jsonResponse={`{
  "success": true,
  "data": {
    "host": "example.com",
    "port": 443,
    "protocol": "TLSv1.3",
    "cipher": "TLS_AES_256_GCM_SHA384",
    "cert": {
      "subject": "example.com",
      "issuer": "DigiCert Global Root G2",
      "issuerCN": "DigiCert Global G2 TLS RSA SHA256 2020 CA1",
      "validFrom": "Jan 15 00:00:00 2026 GMT",
      "validTo": "Jan 15 23:59:59 2027 GMT",
      "altNames": [
        "example.com",
        "www.example.com"
      ],
      "serialNumber": "0E3B6D8C43098E93B182470094F74A6A",
      "fingerprint": "36:7E:F3:D4:58:24:D9:6D:E6:B3:2C:9E:0E:64:36:69:AA:89:C8:CE",
      "fingerprint256": "9E:4B:C7:E2:4C:EB:4A:17:35:E8:4A:E6:74:9C:62:38:F5:BD:78:E5:26:A1:6A:F9:64:9C:FD:0C:03:02:69:D7",
      "bits": 2048
    },
    "daysLeft": 65,
    "isExpired": false,
    "isExpiringSoon": false,
    "domainMatch": true,
    "valid": true,
    "responseTimeMs": 112
  }
}`}
    />
  );
}
