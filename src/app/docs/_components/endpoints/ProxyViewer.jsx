import EndpointCard from "../EndpointCard";

export default function ProxyViewer({ open, onToggle, ...props }) {
  return (
    <EndpointCard
      id="proxy-viewer"
      open={open}
      onToggle={onToggle}
      {...props}
      method="GET"
      path="/api/proxy-viewer?domain=example.com&target=192.0.2.1"
      title="VirtualHost Proxy & Pre-DNS Preview"
      desc="Generates pre-DNS preview endpoints and audits target server reachability via rover.novax.my.id without modifying client hosts files."
      params={[
        { name: "domain", type: "string", required: true, desc: "Target domain configured as the virtual host (e.g. example.com)." },
        { name: "target", type: "string", required: true, desc: "Target server IP or staging hostname (e.g. 192.0.2.1)." },
      ]}
      curlExample={`curl -s 'https://novax.my.id/api/proxy-viewer?domain=example.com&target=192.0.2.1'`}
      jsonResponse={`{
  "success": true,
  "data": {
    "domain": "example.com",
    "target": "192.0.2.1",
    "previewUrl": "https://rover.novax.my.id/192.0.2.1/example.com",
    "publicDnsIps": [
      "104.20.23.154",
      "172.66.147.243"
    ],
    "isAlreadyLive": false,
    "status": 200,
    "responseTimeMs": 142
  }
}`}
    />
  );
}
