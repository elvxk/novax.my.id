import EndpointCard from "../EndpointCard";

export default function CrawlTest({ open, onToggle, ...props }) {
  return (
    <EndpointCard
      id="crawl-test"
      open={open}
      onToggle={onToggle}
      {...props}
      method="GET"
      path="/api/crawl-test?url=example.com"
      title="Bot & Crawler Test"
      desc="Tests whether a website allows major search engine and AI crawlers (Googlebot, Bingbot, GPTBot, ClaudeBot, etc.) based on robots.txt parsing, meta tags, and X-Robots-Tag headers. Also detects potential bot cloaking."
      params={[
        {
          name: "url",
          type: "string",
          required: true,
          desc: "Target domain or full URL to test (e.g. example.com or https://example.com/blog).",
        },
      ]}
      curlExample={`curl -s 'https://novax.my.id/api/crawl-test?url=example.com'`}
      jsonResponse={`{
  "success": true,
  "data": {
    "url": "https://example.com/",
    "hostname": "example.com",
    "testPath": "/",
    "pageTitle": "Example Domain",
    "canonicalUrl": null,
    "summary": {
      "totalBots": 10,
      "allowed": 10,
      "blocked": 0,
      "indexable": true,
      "cloakingDetected": false
    },
    "robotsTxt": {
      "url": "https://example.com/robots.txt",
      "status": 404,
      "found": false,
      "sitemaps": [],
      "totalRules": 0
    },
    "bots": [
      {
        "bot": "Googlebot",
        "userAgent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "allowed": true,
        "matchedAgent": null,
        "crawlDelay": null,
        "disallowedPaths": [],
        "allowedPaths": []
      }
    ],
    "metaRobots": [],
    "xRobotsTag": null,
    "page": {
      "browserStatus": 200,
      "botStatus": 200
    }
  }
}`}
    />
  );
}
