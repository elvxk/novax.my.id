import { apiSuccess, apiError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import puppeteer from "puppeteer";

const MAX_HTML_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TIMEOUT = 60_000;
const DEFAULT_TIMEOUT = 30_000;

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request) {
  // ── rate limit ──────────────────────────────────────────────────────────────
  const clientIp = getClientIp(request);
  const rl = checkRateLimit(clientIp);
  if (!rl.allowed) {
    return apiError(
      `Rate limit exceeded. Try again in ${rl.resetSeconds}s.`,
      429,
      "RATE_LIMITED"
    );
  }

  // ── parse request ───────────────────────────────────────────────────────────
  let payload;
  try {
    payload = await request.json();
  } catch {
    return apiError("Invalid JSON request body", 400, "INVALID_JSON");
  }

  const {
    html,
    url,
    format = "A4",
    landscape = false,
    printBackground = true,
    margin = {},
    scale = 1,
    preferCSSPageSize = false,
    timeout = DEFAULT_TIMEOUT,
    waitUntil = "networkidle0",
    emulateMedia = "print",
    filename = "document.pdf",
  } = payload;

  // ── validate input ──────────────────────────────────────────────────────────
  const hasHtml = html && typeof html === "string";
  const hasUrl = url && typeof url === "string";

  if (!hasHtml && !hasUrl) {
    return apiError(
      "Either 'html' (string) or 'url' (string) is required",
      400,
      "MISSING_CONTENT"
    );
  }

  if (hasHtml && hasUrl) {
    return apiError(
      "Provide either 'html' or 'url', not both",
      400,
      "CONFLICTING_INPUT"
    );
  }

  if (hasHtml && html.length > MAX_HTML_SIZE) {
    return apiError(
      `HTML content exceeds maximum size of ${MAX_HTML_SIZE} bytes`,
      400,
      "HTML_TOO_LARGE"
    );
  }

  if (hasUrl) {
    try {
      new URL(url);
    } catch {
      return apiError("Invalid URL format", 400, "INVALID_URL");
    }
  }

  // ── validate options ────────────────────────────────────────────────────────
  const validFormats = [
    "Letter",
    "Legal",
    "Tabloid",
    "Ledger",
    "A0",
    "A1",
    "A2",
    "A3",
    "A4",
    "A5",
    "A6",
  ];
  if (!validFormats.includes(format)) {
    return apiError(
      `Invalid format. Allowed: ${validFormats.join(", ")}`,
      400,
      "INVALID_FORMAT"
    );
  }

  const validWaitUntil = ["load", "domcontentloaded", "networkidle0", "networkidle2"];
  if (!validWaitUntil.includes(waitUntil)) {
    return apiError(
      `Invalid waitUntil. Allowed: ${validWaitUntil.join(", ")}`,
      400,
      "INVALID_WAIT_UNTIL"
    );
  }

  const validEmulateMedia = ["screen", "print"];
  if (!validEmulateMedia.includes(emulateMedia)) {
    return apiError(
      `Invalid emulateMedia. Allowed: ${validEmulateMedia.join(", ")}`,
      400,
      "INVALID_EMULATE_MEDIA"
    );
  }

  const clampedTimeout = Math.min(Math.max(1000, Number(timeout) || DEFAULT_TIMEOUT), MAX_TIMEOUT);

  const pdfOptions = {
    format,
    landscape: Boolean(landscape),
    printBackground: Boolean(printBackground),
    scale: Math.min(Math.max(0.1, Number(scale) || 1), 2),
    preferCSSPageSize: Boolean(preferCSSPageSize),
    margin: {
      top: margin?.top || "0",
      right: margin?.right || "0",
      bottom: margin?.bottom || "0",
      left: margin?.left || "0",
    },
  };

  // ── generate PDF ────────────────────────────────────────────────────────────
  let browser;
  let page;
  try {
    const browserWSEndpoint = process.env.BROWSER_WS_ENDPOINT;
    if (!browserWSEndpoint) {
      return apiError(
        "Browser WebSocket endpoint not configured (BROWSER_WS_ENDPOINT)",
        500,
        "MISSING_BROWSER_ENDPOINT"
      );
    }

    browser = await puppeteer.connect({
      browserWSEndpoint,
    });

    page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });

    // Emulate media type
    await page.emulateMediaType(emulateMedia);

    if (hasHtml) {
      await page.setContent(html, { waitUntil, timeout: clampedTimeout });
    } else {
      await page.goto(url, { waitUntil, timeout: clampedTimeout });
    }

    const pdfBuffer = await page.pdf(pdfOptions);

    // Convert to base64 for JSON response
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

    return apiSuccess({
      filename,
      size: pdfBuffer.length,
      format,
      landscape: Boolean(landscape),
      pages: pdfBuffer.length > 0 ? 1 : 0,
      contentType: "application/pdf",
      base64: pdfBase64,
    });
  } catch (err) {
    if (err?.name === "TimeoutError") {
      return apiError(
        `PDF generation timed out after ${clampedTimeout}ms`,
        504,
        "GENERATION_TIMEOUT"
      );
    }

    if (err?.message?.includes("Navigation timeout")) {
      return apiError(
        `Page navigation timed out after ${clampedTimeout}ms`,
        504,
        "NAVIGATION_TIMEOUT"
      );
    }

    return apiError(
      `Failed to generate PDF: ${err?.message || "Unknown error"}`,
      500,
      "GENERATION_FAILED"
    );
  } finally {
    if (page) {
      try {
        await page.close();
      } catch {
        // Ignore cleanup errors
      }
    }
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}