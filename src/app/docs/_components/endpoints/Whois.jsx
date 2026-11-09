import EndpointCard from "../EndpointCard";

export default function Whois({ open, onToggle }) {
  return (
    <EndpointCard
      id="whois"
      open={open}
      onToggle={onToggle}
      method="GET"
      path="/api/whois?domain=example.com"
      title="WHOIS / RDAP Domain Registration"
      desc="Queries the authoritative ICANN RDAP registry bootstrap router for domain ownership metadata, registrar details, registration dates, expiration status, and domain lifecycle locks."
      params={[
        { name: "domain", type: "string", required: true, desc: "Target domain name without protocol (e.g. example.com)." },
      ]}
      curlExample={`curl -s 'https://novax.my.id/api/whois?domain=example.com'`}
      jsonResponse={`{
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
}`}
    />
  );
}
