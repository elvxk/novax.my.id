import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getToolByPath } from "@/lib/tool-registry";

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const isToolPage = pathname.startsWith("/tools/") && pathname !== "/tools";

  // ── Centralized Tool Status Guard ──────────────────────────────────────────
  if (isApi || isToolPage) {
    const tool = getToolByPath(pathname);
    if (tool) {
      // 1. Tool completely disabled -> 404 Not Found
      if (tool.disabled) {
        if (isApi) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "NOT_FOUND",
                message: "The requested endpoint was not found or is disabled.",
              },
            },
            {
              status: 404,
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
              },
            }
          );
        }
        return NextResponse.rewrite(new URL("/not-found", request.url));
      }

      // 2. Tool offline / maintenance (live === false) -> 503 Service Unavailable
      if (!tool.live) {
        if (isApi) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "SERVICE_UNAVAILABLE",
                message: `${tool.name} is temporarily offline for maintenance.`,
              },
            },
            {
              status: 503,
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
              },
            }
          );
        }
        // Redirect browser to tools catalog with notice
        return NextResponse.redirect(
          new URL(`/tools?maintenance=${tool.id}`, request.url)
        );
      }
    }
  }

  // Non-API routes pass through without rate limiting
  if (!isApi) {
    return NextResponse.next();
  }

  // ── Handle CORS preflight OPTIONS requests without consuming rate limit ──
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // ── Rate Limiter ───────────────────────────────────────────────────────────
  const ip = getClientIp(request);
  const rate = checkRateLimit(ip);
  const windowSec = parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || "60", 10);

  // Common international rate limit & CORS headers
  const rateLimitHeaders = {
    // IETF draft-ietf-httpapi-ratelimit-headers
    "RateLimit-Limit": rate.limit.toString(),
    "RateLimit-Remaining": rate.remaining.toString(),
    "RateLimit-Reset": rate.resetSeconds.toString(),
    "RateLimit-Policy": `${rate.limit};w=${windowSec}`,
    // Standard legacy headers
    "X-RateLimit-Limit": rate.limit.toString(),
    "X-RateLimit-Remaining": rate.remaining.toString(),
    "X-RateLimit-Reset": rate.resetTimestamp.toString(),
    // Standard CORS
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (!rate.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: `Too many requests. Limit is ${rate.limit} requests per ${windowSec} seconds. Retry in ${rate.resetSeconds} seconds.`,
        },
      },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders,
          "Retry-After": rate.resetSeconds.toString(),
        },
      }
    );
  }

  const response = NextResponse.next();
  for (const [key, val] of Object.entries(rateLimitHeaders)) {
    response.headers.set(key, val);
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*", "/tools/:path*"],
};
