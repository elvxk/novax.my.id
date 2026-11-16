import EndpointCard from "../EndpointCard";

export default function HttpClient({ open, onToggle, ...props }) {
  return (
    <EndpointCard
      id="http-client"
      open={open}
      onToggle={onToggle}
      {...props}
      method="POST"
      path="/api/http-client"
      title="HTTP API Client"
      desc="Proxy HTTP requests to any URL with custom method, headers, and body. Returns the full response including status, headers, body, timing, and size. Useful for testing APIs behind CORS restrictions."
      params={[
        { name: "url", type: "string", required: true, desc: "Target URL to send the request to (must include protocol, e.g. https://api.example.com/users)." },
        { name: "method", type: "string", required: false, desc: "HTTP method: GET (default), POST, PUT, PATCH, DELETE, HEAD, OPTIONS." },
        { name: "headers", type: "object", required: false, desc: "Custom request headers as key-value pairs (e.g. {\"Authorization\": \"Bearer token\"})." },
        { name: "body", type: "string", required: false, desc: "Request body content (for POST, PUT, PATCH). Ignored for GET, HEAD, OPTIONS." },
        { name: "timeout", type: "number", required: false, desc: "Request timeout in milliseconds (default: 10000, max: 30000)." },
      ]}
      curlExample={`curl -s -X POST 'https://novax.my.id/api/http-client' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "url": "https://httpbin.org/get",
    "method": "GET",
    "headers": { "Accept": "application/json" }
  }'`}
      jsonResponse={`{
  "success": true,
  "data": {
    "url": "https://httpbin.org/get",
    "method": "GET",
    "status": 200,
    "statusText": "OK",
    "headers": {
      "content-type": "application/json",
      "access-control-allow-origin": "*"
    },
    "body": "{\\n  \\"args\\": {},\\n  \\"headers\\": {\\n    \\"Accept\\": \\"application/json\\"\\n  },\\n  \\"origin\\": \\"1.2.3.4\\",\\n  \\"url\\": \\"https://httpbin.org/get\\"\\n}",
    "timing": 342,
    "size": 256,
    "truncated": false
  }
}`}
    />
  );
}
