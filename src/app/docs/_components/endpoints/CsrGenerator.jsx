import EndpointCard from "../EndpointCard";

export default function CsrGenerator({ open, onToggle, ...props }) {
  return (
    <EndpointCard
      id="csr-generator"
      open={open}
      onToggle={onToggle}
      {...props}
      method="POST"
      path="/api/csr-generator"
      title="CSR Generator (Certificate Signing Request)"
      desc="Generate RSA private keys and Certificate Signing Requests (CSR) for SSL/TLS certificates. Supports subject attributes and Subject Alternative Names (SANs)."
      params={[
        { name: "domain", type: "string", required: true, desc: "Target domain name without protocol (e.g., example.com or *.example.com)." },
        { name: "keySize", type: "number", required: false, desc: "RSA key size in bits: 1024, 2048, or 4096 (default: 2048)." },
        { name: "country", type: "string", required: false, desc: "Two-letter ISO 3166-1 country code (e.g., ID, US, SG)." },
        { name: "state", type: "string", required: false, desc: "State or province name (e.g., DKI Jakarta, California)." },
        { name: "locality", type: "string", required: false, desc: "City or locality name (e.g., Jakarta, San Francisco)." },
        { name: "organization", type: "string", required: false, desc: "Legal organization or company name." },
        { name: "organizationalUnit", type: "string", required: false, desc: "Department or organizational unit (e.g., IT, Security)." },
        { name: "email", type: "string", required: false, desc: "Administrator or contact email address." },
        { name: "subjectAltNames", type: "array | string", required: false, desc: "Array or comma-separated list of Subject Alternative Names (SANs)." },
      ]}
      curlExample={`curl -s -X POST 'https://novax.my.id/api/csr-generator' \\
  -H 'Content-Type: application/json' \\
  -d '{"domain":"example.com","keySize":2048,"country":"ID","organization":"Nova-X","subjectAltNames":["www.example.com"]}'`}
      jsonResponse={`{
  "success": true,
  "data": {
    "csr": "-----BEGIN CERTIFICATE REQUEST-----\\nMIICeDCCAWACAQAwMzEUMBIGA1UEAxMLZXhhbXBsZS5jb20...\\n-----END CERTIFICATE REQUEST-----",
    "privateKey": "-----BEGIN RSA PRIVATE KEY-----\\nMIIEowIBAAKCAQEA7ifeuPKMeycfXy7eEm6o...\\n-----END RSA PRIVATE KEY-----",
    "keySize": 2048,
    "domain": "example.com",
    "subject": {
      "commonName": "example.com",
      "country": "ID",
      "state": null,
      "locality": null,
      "organization": "Nova-X",
      "organizationalUnit": null,
      "email": null
    },
    "sanDns": ["example.com", "www.example.com"],
    "created": "2026-11-12T02:00:00.000Z"
  }
}`}
    />
  );
}