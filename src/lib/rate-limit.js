/**
 * International Standard API Rate Limiter
 * Follows IETF draft-ietf-httpapi-ratelimit-headers & RFC 6585 (HTTP 429)
 * Default: 60 requests per 60 seconds per IP
 */

const WINDOW_MS =
  (parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || "60", 10)) * 1000;
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || "60", 10);

const ipStore = new Map();

/**
 * Check rate limit for a client IP
 * @param {string} ip
 * @returns {{
 *   allowed: boolean,
 *   limit: number,
 *   remaining: number,
 *   resetSeconds: number,
 *   resetTimestamp: number
 * }}
 */
export function checkRateLimit(ip = "127.0.0.1") {
  const now = Date.now();

  // Lazy garbage collection when map grows
  if (ipStore.size > 5000) {
    for (const [storedIp, entry] of ipStore.entries()) {
      if (now - entry.startTime > WINDOW_MS) {
        ipStore.delete(storedIp);
      }
    }
  }

  const record = ipStore.get(ip);

  // New window
  if (!record || now - record.startTime >= WINDOW_MS) {
    ipStore.set(ip, {
      count: 1,
      startTime: now,
    });

    const resetSeconds = Math.ceil(WINDOW_MS / 1000);
    const resetTimestamp = Math.floor((now + WINDOW_MS) / 1000);

    return {
      allowed: true,
      limit: MAX_REQUESTS,
      remaining: MAX_REQUESTS - 1,
      resetSeconds,
      resetTimestamp,
    };
  }

  // Existing window
  record.count += 1;
  const elapsed = now - record.startTime;
  const resetSeconds = Math.max(1, Math.ceil((WINDOW_MS - elapsed) / 1000));
  const resetTimestamp = Math.floor((record.startTime + WINDOW_MS) / 1000);
  const remaining = Math.max(0, MAX_REQUESTS - record.count);

  if (record.count > MAX_REQUESTS) {
    return {
      allowed: false,
      limit: MAX_REQUESTS,
      remaining: 0,
      resetSeconds,
      resetTimestamp,
    };
  }

  return {
    allowed: true,
    limit: MAX_REQUESTS,
    remaining,
    resetSeconds,
    resetTimestamp,
  };
}

/**
 * Extracts real client IP address from standard proxy headers
 */
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();
  return "127.0.0.1";
}
