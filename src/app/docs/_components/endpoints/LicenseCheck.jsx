import EndpointCard from "../EndpointCard";

export default function LicenseCheck({ open, onToggle, ...props }) {
  return (
    <EndpointCard
      id="license-check"
      open={open}
      onToggle={onToggle}
      {...props}
      method="GET"
      path="/api/license-check?ip=8.8.8.8"
      title="Hosting & OS License Verification"
      desc="Simultaneously audits cPanel/WHM licensing via verify.cpanel.net and CloudLinux/Imunify registry via cln.cloudlinux.com for any IPv4 address."
      params={[
        { name: "ip", type: "string", required: true, desc: "Target IPv4 address to audit (e.g. 8.8.8.8)." },
      ]}
      curlExample={`curl -s 'https://novax.my.id/api/license-check?ip=8.8.8.8'`}
      jsonResponse={`{
  "success": true,
  "data": {
    "ip": "8.8.8.8",
    "licensed": true,
    "products": {
      "cpanel": null,
      "cloudlinux": null,
      "imunify": {
        "package": "IMAVP",
        "product": "Imunify AV Plus",
        "status": "registered",
        "hostname": "N/D"
      },
      "jetbackup": null
    },
    "licenses": [
      {
        "product": "cPanel",
        "package": "cPanel Premier",
        "partnerNoc": "Example Partner NOC",
        "activity": "Active",
        "status": "active"
      }
    ],
    "registry": {
      "instances": [
        {
          "product": "IMAVP",
          "productLabel": "Imunify AV Plus",
          "hostname": "N/D",
          "type": "IP",
          "typeLabel": "IP-based license",
          "registered": "2023-07-18T17:45:36.000Z",
          "checkin": null
        }
      ]
    }
  }
}`}
    />
  );
}
