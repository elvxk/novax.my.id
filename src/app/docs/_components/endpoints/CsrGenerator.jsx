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
        { name: "domain", type: "string", required: true, desc: "Target domain name (e.g., example.com)." },
        { name: "keySize", type: "number", required: false, desc: "RSA key size in bits. Must be 512, 1024, 2048, or 4096. Default: 2048." },
        { name: "country", type: "string", required: false, desc: "Two-letter ISO country code (e.g., US, ID)." },
        { name: "state", type: "string", required: false, desc: "State or province name." },
        { name: "locality", type: "string", required: false, desc: "City or locality name." },
        { name: "organization", type: "string", required: false, desc: "Organization name." },
        { name: "organizationalUnit", type: "string", required: false, desc: "Organizational unit name." },
        { name: "email", type: "string", required: false, desc: "Email address for the certificate contact." },
        { name: "subjectAltNames", type: "array", required: false, desc: "Array of domain names for SANs (e.g., ['www.example.com', 'api.example.com'])." },
      ]}
      curlExample={`curl -s -X POST 'https://novax.my.id/api/csr-generator' \\
  -H 'Content-Type: application/json' \\
  -d '{"domain":"example.com","keySize":2048,"country":"US","organization":"My Company"}'`}
      jsonResponse={`{
  "success": true,
  "pem": "-----BEGIN CERTIFICATE REQUEST-----\nMIIBI... (truncated)\n-----END CERTIFICATE REQUEST-----",
  "keySize": 2048,
  "domain": "example.com",
  "subject": "CN=example.com, O=My Company, C=US",
  "sanDns": ["www.example.com"],
  "created": "2024-01-15T10:30:00.000Z",
  "message": "Certificate Signing Request generated successfully"
}`}
    />
  );
}