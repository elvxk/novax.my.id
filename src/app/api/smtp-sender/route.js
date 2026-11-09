import nodemailer from "nodemailer";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";

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
  const ip = getClientIp(request);
  const rl = checkRateLimit(`smtp:${ip}`);
  if (!rl.allowed) {
    return apiError("Rate limit exceeded. Please wait before retrying.", 429, "RATE_LIMITED");
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const { host, port, user, pass, to, encryption, format, subject, text, html } = body;

  if (!host || !port || !user || !pass || !to) {
    return apiError("Missing required fields: host, port, user, pass, to", 400, "MISSING_FIELDS");
  }

  const portNum = parseInt(port, 10);
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    return apiError("Invalid port number", 400, "INVALID_PORT");
  }

  // Map encryption to nodemailer options
  let secure = false;
  let requireTLS = false;
  if (encryption === "ssl" || portNum === 465) {
    secure = true;
  } else if (encryption === "tls" || portNum === 587) {
    requireTLS = true;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: portNum,
    secure,
    requireTLS,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: { rejectUnauthorized: false },
  });

  const startedAt = Date.now();

  try {
    await transporter.verify();

    const mailOptions = {
      from: `"Nova-X Tools" <${user}>`,
      to,
      subject: subject || "SMTP Delivery Verification",
      ...(format === "html"
        ? { html: html || buildDefaultHtml(user, to, host) }
        : { text: text || buildDefaultText(user, to, host) }),
    };

    const info = await transporter.sendMail(mailOptions);
    const elapsed = Date.now() - startedAt;

    return apiSuccess({
      accepted: info.accepted,
      rejected: info.rejected,
      messageId: info.messageId,
      response: info.response,
      elapsedMs: elapsed,
    });
  } catch (err) {
    const elapsed = Date.now() - startedAt;
    return apiError(
      `${err.message || "SMTP connection or delivery failed"} (${elapsed}ms)`,
      502,
      "SMTP_ERROR"
    );
  }
}

function buildDefaultText(from, to, host) {
  const now = new Date().toUTCString();
  return [
    "──────────────────────────────",
    "  SMTP Delivery Verification",
    "──────────────────────────────",
    "",
    "This message confirms that your SMTP configuration is working correctly.",
    "",
    `  Sent at   : ${now}`,
    `  From      : ${from}`,
    `  To        : ${to}`,
    `  Via host  : ${host}`,
    "",
    "If you received this message, your mail server is accepting and routing",
    "outbound messages without any issues.",
    "",
    "──────────────────────────────",
    "Sent by Nova-X Tools · novax.my.id",
    "──────────────────────────────",
  ].join("\n");
}

function buildDefaultHtml(from, to, host) {
  const now = new Date().toUTCString();
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>SMTP Delivery Verification</title>
</head>
<body style="margin:0;padding:0;background:#f0ead0;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ead0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fdf8ed;border:2px solid #2d4a28;border-radius:16px;box-shadow:5px 5px 0 #2d4a28;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#2d4a28;padding:28px 32px;">
              <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#e8c94a;opacity:0.7;">Nova-X Tools</p>
              <h1 style="margin:6px 0 0;font-size:22px;font-weight:900;color:#e8c94a;line-height:1.2;">SMTP Delivery Verification</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 20px;font-size:14px;color:#2d4a28;line-height:1.6;">
                Your SMTP configuration is working correctly. This message confirms that your mail server accepted and routed the outbound message without any issues.
              </p>
              <!-- Info table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #2d4a28;border-radius:10px;overflow:hidden;margin-bottom:24px;">
                <tr style="background:#f0ead0;">
                  <td style="padding:10px 14px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#2d4a28;opacity:0.5;width:120px;border-bottom:1px solid #2d4a2822;">Timestamp</td>
                  <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#2d4a28;border-bottom:1px solid #2d4a2822;font-family:monospace;">${now}</td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#2d4a28;opacity:0.5;border-bottom:1px solid #2d4a2822;">From</td>
                  <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#2d4a28;border-bottom:1px solid #2d4a2822;font-family:monospace;">${from}</td>
                </tr>
                <tr style="background:#f0ead0;">
                  <td style="padding:10px 14px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#2d4a28;opacity:0.5;border-bottom:1px solid #2d4a2822;">To</td>
                  <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#2d4a28;border-bottom:1px solid #2d4a2822;font-family:monospace;">${to}</td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#2d4a28;opacity:0.5;">SMTP Host</td>
                  <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#2d4a28;font-family:monospace;">${host}</td>
                </tr>
              </table>
              <p style="margin:0;font-size:12px;color:#2d4a28;opacity:0.5;line-height:1.5;">
                If you did not initiate this verification, you can safely disregard this message. No action is required.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f0ead0;border-top:1.5px solid #2d4a2825;padding:16px 32px;">
              <p style="margin:0;font-size:11px;font-weight:700;color:#2d4a28;opacity:0.4;">Sent by Nova-X Tools · novax.my.id</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
