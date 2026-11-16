import { apiSuccess, apiError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const TYPE_LABELS = {
  suggestion: "Suggestion",
  bug: "Bug Report",
  feature: "Feature Request",
  tool: "Tool Recommendation",
};

const MAX_MESSAGE = 2000;
const MAX_NAME = 80;
const MAX_EMAIL = 160;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const rl = checkRateLimit(getClientIp(request));
  if (!rl.allowed) {
    return apiError(
      `Too many submissions. Try again in ${rl.resetSeconds}s.`,
      429,
      "RATE_LIMITED"
    );
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return apiError(
      "Feedback is temporarily unavailable.",
      503,
      "FEEDBACK_DISABLED"
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400, "INVALID_JSON");
  }

  const message = String(payload.message || "").trim();
  const name = String(payload.name || "").trim().slice(0, MAX_NAME);
  const email = String(payload.email || "").trim().slice(0, MAX_EMAIL);
  const type = TYPE_LABELS[payload.type] ? payload.type : "suggestion";

  if (!message) {
    return apiError("A message is required.", 400, "MISSING_MESSAGE");
  }
  if (message.length > MAX_MESSAGE) {
    return apiError(
      `Message exceeds ${MAX_MESSAGE} characters.`,
      413,
      "MESSAGE_TOO_LONG"
    );
  }
  if (email && !EMAIL_RE.test(email)) {
    return apiError("Invalid email address.", 400, "INVALID_EMAIL");
  }

  // Discord embed hard limit: field value 1024 chars
  const embed = {
    title: "New Feedback / Tool Request",
    color: 0x5865f2, // Discord blurple
    fields: [
      { name: "Type", value: TYPE_LABELS[type], inline: true },
      { name: "Name", value: name || "Anonymous", inline: true },
      { name: "Email", value: email || "N/A", inline: true },
      {
        name: "Message",
        value: message.length > 1000 ? `${message.slice(0, 1000)}…` : message,
        inline: false,
      },
    ],
    footer: { text: "Nova-X Feedback" },
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return apiError(
        "Could not deliver feedback right now. Please try again.",
        502,
        "DELIVERY_FAILED"
      );
    }

    return apiSuccess({ received: true });
  } catch {
    return apiError(
      "Could not deliver feedback right now. Please try again.",
      502,
      "DELIVERY_FAILED"
    );
  }
}