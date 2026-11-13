import EndpointCard from "../EndpointCard";

export default function SslGeneratorIssue({ open, onToggle, ...props }) {
  return (
    <EndpointCard
      id="ssl-generator-issue"
      open={open}
      onToggle={onToggle}
      {...props}
      method="POST"
      path="/api/ssl-generator/issue/{id}"
      title="Issue SSL Certificate"
      desc="Validates the deployed DNS TXT record and issues the signed certificate. Returns the certificate chain and the matching private key in PEM format, plus a status message. The request ID is passed as a path parameter and no request body is required. The upstream authority polls for DNS propagation, so this call can block for up to 60 seconds and answers 409 while the TXT record has not propagated yet."
      params={[
        {
          name: "id",
          type: "string",
          required: true,
          desc: "Path parameter — the request ID returned by the challenge endpoint (e.g. 0dbadd11-92fe-452f-b38b-75febd17fa3c).",
        },
      ]}
      curlExample={`curl -s -X POST \\
  'https://novax.my.id/api/ssl-generator/issue/0dbadd11-92fe-452f-b38b-75febd17fa3c'`}
      jsExample={`const id = "0dbadd11-92fe-452f-b38b-75febd17fa3c";
const res = await fetch(\`https://novax.my.id/api/ssl-generator/issue/\${id}\`, {
  method: "POST",
});
const { data } = await res.json();
console.log(data.certificate, data.privateKey);`}
      jsonResponse={`{
  "success": true,
  "data": {
    "id": "0dbadd11-92fe-452f-b38b-75febd17fa3c",
    "domains": ["example.com", "www.example.com"],
    "certificate": "-----BEGIN CERTIFICATE-----\\nMIIF...\\n-----END CERTIFICATE-----\\n-----BEGIN CERTIFICATE-----\\nMIIE...\\n-----END CERTIFICATE-----",
    "privateKey": "-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----",
    "message": "Certificate issued"
  }
}`}
    />
  );
}
