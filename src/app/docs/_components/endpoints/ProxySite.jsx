import EndpointCard from "../EndpointCard";

export default function ProxySite({ open, onToggle, ...props }) {
  return (
    <EndpointCard
      id="proxy-site"
      open={open}
      onToggle={onToggle}
      {...props}
      method="GET"
      path="/api/proxy-site?url=https://example.com"
      title="Web Proxy & Site Preview"
      desc="Fetches and previews any remote website through an anonymous secure proxy with SSRF protection, HTTP header analysis, and automatic relative URL base rewriting."
      params={[
        {
          name: "url",
          type: "string",
          required: true,
          desc: "Target website URL to fetch through the proxy (e.g. https://example.com or example.com).",
        },
        {
          name: "mode",
          type: "string",
          required: false,
          desc: "Output format: 'json' (default) returns diagnostic metadata & processed HTML; 'raw' returns text/html directly for iframe rendering.",
        },
      ]}
      curlExample={`curl -s 'https://novax.my.id/api/proxy-site?url=https://example.com'`}
      jsonResponse={`{
  "success": true,
  "data": {
    "url": "https://example.com",
    "finalUrl": "https://example.com/",
    "status": 200,
    "statusText": "OK",
    "contentType": "text/html; charset=UTF-8",
    "responseTimeMs": 114,
    "title": "Example Domain",
    "headers": {
      "server": "ECAcc (iad/0150)",
      "content-type": "text/html; charset=UTF-8",
      "cache-control": "max-age=604800"
    },
    "securityHeaders": {
      "xFrameOptions": null,
      "contentSecurityPolicy": null,
      "strictTransportSecurity": "max-age=31536000",
      "xContentTypeOptions": "nosniff",
      "referrerPolicy": null
    },
    "html": "<!doctype html>\\n<html><head>\\n<base href=\\"https://example.com/\\" target=\\"_blank\\">...\\n</html>"
  }
}`}
    />
  );
}
