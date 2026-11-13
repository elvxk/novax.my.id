import EndpointCard from "../EndpointCard";

export default function SslGeneratorChallenge({ open, onToggle, ...props }) {
  return (
    <EndpointCard
      id="ssl-generator-challenge"
      open={open}
      onToggle={onToggle}
      {...props}
      method="POST"
      path="/api/ssl-generator/challenge"
      title="Order ACME DNS-01 Challenge"
      desc="Submits one or more domains to the ACME certificate authority and returns a request ID plus the DNS TXT records that prove domain ownership. Deploy the TXT record at your DNS provider before requesting issuance."
      params={[
        {
          name: "domains",
          type: "string[]",
          required: true,
          desc: "Domains to order the challenge for. Accepts an array; a comma-separated string is also accepted (e.g. example.com, www.example.com). Wildcards such as *.example.com are supported.",
        },
      ]}
      curlExample={`curl -s -X POST 'https://novax.my.id/api/ssl-generator/challenge' \\
  -H 'Content-Type: application/json' \\
  -d '{"domains":["example.com","www.example.com"]}'`}
      jsExample={`const res = await fetch("https://novax.my.id/api/ssl-generator/challenge", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ domains: ["example.com", "www.example.com"] }),
});
const { data } = await res.json();
console.log(data.id, data.dns);`}
      jsonResponse={`{
  "success": true,
  "data": {
    "id": "0dbadd11-92fe-452f-b38b-75febd17fa3c",
    "domains": ["example.com", "www.example.com"],
    "dns": [
      {
        "type": "TXT",
        "record": "_acme-challenge.example.com",
        "value": "Pottc4dJjxn5h09zyaeoOgu8KGUGJJLJwySTXdwxcE"
      }
    ]
  }
}`}
    />
  );
}
