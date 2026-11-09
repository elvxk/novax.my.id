import EndpointCard from "../EndpointCard";

export default function IpGeo({ open, onToggle }) {
  return (
    <EndpointCard
      id="ip-geo"
      open={open}
      onToggle={onToggle}
      method="GET"
      path="/api/ip-geo?ip=8.8.8.8"
      title="IP Geolocation & Network Routing"
      desc="Resolves geographic location, country, city, postal code, ASN, ISP routing, and coordinates for any IPv4 or IPv6 address. Omit ?ip to auto-detect caller's public IP."
      params={[
        { name: "ip", type: "string", required: false, desc: "Target IPv4 or IPv6 address. If omitted, resolves caller's public IP automatically." },
      ]}
      curlExample={`curl -s 'https://novax.my.id/api/ip-geo?ip=8.8.8.8'`}
      jsonResponse={`{
  "success": true,
  "data": {
    "ip": "8.8.8.8",
    "country": "United States",
    "countryCode": "US",
    "region": "CA",
    "regionName": "California",
    "city": "San Jose",
    "zip": "95025",
    "latitude": 37.3393939,
    "longitude": -121.8949553,
    "timezone": "America/Los_Angeles",
    "isp": "Google LLC",
    "org": "Google LLC",
    "as": "AS15169 Google LLC",
    "flag": "🇺🇸",
    "flagUrl": "https://cdn.ipwhois.io/flags/us.svg"
  }
}`}
    />
  );
}
