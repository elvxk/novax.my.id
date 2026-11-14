import { apiSuccess, apiError } from "@/lib/api-response";

// ── bot definitions ─────────────────────────────────────────────────────────

const BOTS = [
  { name: "Googlebot", ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
  { name: "Bingbot", ua: "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)" },
  { name: "Yandex", ua: "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)" },
  { name: "Baiduspider", ua: "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)" },
  { name: "DuckDuckBot", ua: "DuckDuckBot/1.1; (+http://duckduckgo.com/duckduckbot.html)" },
  { name: "Slurp", ua: "Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)" },
  { name: "Applebot", ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/600.2.5 (KHTML, like Gecko) Version/8.0.2 Safari/600.2.5 (Applebot/0.1)" },
  { name: "GPTBot", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)" },
  { name: "ClaudeBot", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)" },
  { name: "FacebookBot", ua: "Mozilla/5.0 (compatible; FacebookBot/1.0; +https://developers.facebook.com/docs/sharing/bot)" },
];

const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/;
const TIMEOUT = 10_000;

// ── robots.txt parser ───────────────────────────────────────────────────────

function parseRobotsTxt(raw) {
  const rules = []; // { agent, paths: { disallow: [], allow: [] }, crawlDelay }
  let current = null;

  for (const rawLine of raw.split("\n")) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;

    const [directive, ...rest] = line.split(":");
    const key = directive.trim().toLowerCase();
    const value = rest.join(":").trim();

    if (key === "user-agent") {
      current = { agent: value, disallow: [], allow: [], crawlDelay: null };
      rules.push(current);
    } else if (current) {
      if (key === "disallow" && value) current.disallow.push(value);
      else if (key === "allow" && value) current.allow.push(value);
      else if (key === "crawl-delay" && value) current.crawlDelay = Number(value) || null;
    }
  }

  return rules;
}

function matchAgent(rules, botName) {
  const lower = botName.toLowerCase();
  // specific match first
  const specific = rules.find((r) =>
    lower.includes(r.agent.toLowerCase()) || r.agent.toLowerCase().includes(lower)
  );
  if (specific) return specific;
  // wildcard fallback
  return rules.find((r) => r.agent === "*") || null;
}

function pathMatches(pattern, path) {
  // convert robots.txt pattern to regex
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\*/g, ".*")
    .replace(/\\\$$/g, "$");
  try {
    return new RegExp(`^${escaped}`).test(path);
  } catch {
    return pattern === path;
  }
}

function isPathAllowed(rule, path) {
  if (!rule) return true;

  // collect all matching rules with specificity (longer pattern = higher specificity)
  let bestMatch = { allowed: true, len: -1 };

  for (const p of rule.allow) {
    if (pathMatches(p, path) && p.length > bestMatch.len) {
      bestMatch = { allowed: true, len: p.length };
    }
  }
  for (const p of rule.disallow) {
    if (pathMatches(p, path) && p.length > bestMatch.len) {
      bestMatch = { allowed: false, len: p.length };
    }
  }

  return bestMatch.allowed;
}

// ── meta / header robots parsing ────────────────────────────────────────────

function parseMetaRobots(html) {
  const tags = [];
  const re = /<meta\s+[^>]*name\s*=\s*["'](robots|googlebot|bingbot|yandex)[^"']*["'][^>]*content\s*=\s*["']([^"']*)["'][^>]*\/?>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    tags.push({ name: m[1].toLowerCase(), content: m[2].toLowerCase() });
  }
  // also match reversed attribute order
  const re2 = /<meta\s+[^>]*content\s*=\s*["']([^"']*)["'][^>]*name\s*=\s*["'](robots|googlebot|bingbot|yandex)[^"']*["'][^>]*\/?>/gi;
  while ((m = re2.exec(html)) !== null) {
    tags.push({ name: m[2].toLowerCase(), content: m[1].toLowerCase() });
  }
  return tags;
}

function extractDirectives(content) {
  const directives = content.split(",").map((d) => d.trim().toLowerCase());
  return {
    noindex: directives.includes("noindex"),
    nofollow: directives.includes("nofollow"),
    noarchive: directives.includes("noarchive"),
    nosnippet: directives.includes("nosnippet"),
    noimageindex: directives.includes("noimageindex"),
    all: directives,
  };
}

// ── main handler ────────────────────────────────────────────────────────────

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  let target = searchParams.get("url")?.trim();

  if (!target) {
    return apiError(
      "A valid url query parameter is required (e.g. ?url=example.com or ?url=https://example.com/page)",
      400,
      "MISSING_URL"
    );
  }

  // normalize: add https:// if no protocol
  if (!/^https?:\/\//i.test(target)) {
    target = `https://${target}`;
  }

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    return apiError("Invalid URL format", 400, "INVALID_URL");
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!DOMAIN_RE.test(hostname)) {
    return apiError("Invalid domain in URL", 400, "INVALID_DOMAIN");
  }

  const testPath = parsed.pathname || "/";
  const robotsUrl = `${parsed.protocol}//${parsed.host}/robots.txt`;

  try {
    // ── 1. Fetch and parse robots.txt ─────────────────────────────────────
    let robotsTxtRaw = null;
    let robotsTxtStatus = null;
    let robotsRules = [];
    let sitemaps = [];

    try {
      const robotsRes = await fetch(robotsUrl, {
        signal: AbortSignal.timeout(TIMEOUT),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; NovaxBot/1.0)" },
        redirect: "follow",
      });
      robotsTxtStatus = robotsRes.status;

      if (robotsRes.ok) {
        robotsTxtRaw = await robotsRes.text();
        robotsRules = parseRobotsTxt(robotsTxtRaw);

        // extract sitemaps
        const smRe = /^sitemap:\s*(.+)$/gim;
        let sm;
        while ((sm = smRe.exec(robotsTxtRaw)) !== null) {
          sitemaps.push(sm[1].trim());
        }
      }
    } catch {
      robotsTxtStatus = "timeout";
    }

    // ── 2. Test each bot against robots.txt ───────────────────────────────
    const botResults = BOTS.map((bot) => {
      const rule = matchAgent(robotsRules, bot.name);
      const allowed = isPathAllowed(rule, testPath);
      return {
        bot: bot.name,
        userAgent: bot.ua,
        allowed,
        matchedAgent: rule?.agent || null,
        crawlDelay: rule?.crawlDelay || null,
        disallowedPaths: rule?.disallow || [],
        allowedPaths: rule?.allow || [],
      };
    });

    // ── 3. Fetch the target page with a browser UA for meta/headers ──────
    let pageStatus = null;
    let metaRobotsTags = [];
    let xRobotsTag = null;
    let canonicalUrl = null;
    let pageTitle = null;

    try {
      const pageRes = await fetch(target, {
        signal: AbortSignal.timeout(TIMEOUT),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html",
        },
        redirect: "follow",
      });

      pageStatus = pageRes.status;
      xRobotsTag = pageRes.headers.get("x-robots-tag") || null;

      if (pageRes.ok) {
        // only read first 100KB to find meta tags
        const reader = pageRes.body.getReader();
        const chunks = [];
        let totalLen = 0;
        const limit = 100_000;

        while (totalLen < limit) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          totalLen += value.length;
        }
        reader.cancel();

        const html = new TextDecoder().decode(
          chunks.length === 1 ? chunks[0] : Buffer.concat(chunks)
        ).slice(0, limit);

        metaRobotsTags = parseMetaRobots(html);

        // extract canonical
        const canonMatch = html.match(
          /<link\s+[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']*)["']/i
        );
        if (canonMatch) canonicalUrl = canonMatch[1];

        // extract title
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        if (titleMatch) pageTitle = titleMatch[1].trim();
      }
    } catch {
      pageStatus = "timeout";
    }

    // ── 4. Fetch page with Googlebot UA to detect cloaking ───────────────
    let cloakingDetected = false;
    let botPageStatus = null;

    try {
      const botRes = await fetch(target, {
        signal: AbortSignal.timeout(TIMEOUT),
        headers: {
          "User-Agent": BOTS[0].ua, // Googlebot
          Accept: "text/html",
        },
        redirect: "follow",
      });
      botPageStatus = botRes.status;

      if (pageStatus !== "timeout" && botPageStatus !== pageStatus) {
        cloakingDetected = true;
      }
    } catch {
      botPageStatus = "timeout";
    }

    // ── 5. Build summary ─────────────────────────────────────────────────
    const totalBots = botResults.length;
    const allowedCount = botResults.filter((b) => b.allowed).length;
    const blockedCount = totalBots - allowedCount;

    const metaDirectives = metaRobotsTags.map((t) => ({
      name: t.name,
      ...extractDirectives(t.content),
    }));

    const globalNoindex = metaDirectives.some(
      (d) => d.name === "robots" && d.noindex
    );

    return apiSuccess({
      url: target,
      hostname,
      testPath,
      pageTitle: pageTitle || null,
      canonicalUrl,
      summary: {
        totalBots,
        allowed: allowedCount,
        blocked: blockedCount,
        indexable: !globalNoindex,
        cloakingDetected,
      },
      robotsTxt: {
        url: robotsUrl,
        status: robotsTxtStatus,
        found: robotsTxtStatus === 200,
        sitemaps,
        totalRules: robotsRules.length,
      },
      bots: botResults,
      metaRobots: metaDirectives,
      xRobotsTag: xRobotsTag
        ? extractDirectives(xRobotsTag)
        : null,
      page: {
        browserStatus: pageStatus,
        botStatus: botPageStatus,
      },
    });
  } catch {
    return apiError(
      "Failed to complete crawl test",
      502,
      "CRAWL_TEST_ERROR"
    );
  }
}
