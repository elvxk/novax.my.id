import EndpointCard from "../EndpointCard";

export default function SmtpSender({ open, onToggle }) {
  return (
    <EndpointCard
      id="smtp-sender"
      open={open}
      onToggle={onToggle}
      method="POST"
      path="/api/smtp-sender"
      title="SMTP Delivery Verification"
      desc="Connects to any SMTP server with the supplied credentials and sends a verification email. Supports SSL/TLS, STARTTLS, and plaintext. Returns server response, accepted/rejected addresses, message ID, and round-trip time."
      params={[
        { name: "host", type: "string", required: true, desc: "SMTP server hostname (e.g. smtp.gmail.com)." },
        { name: "port", type: "number", required: true, desc: "SMTP port. Common: 25, 465 (SSL), 587 (STARTTLS), 2525." },
        { name: "user", type: "string", required: true, desc: "SMTP username — typically the sender email address." },
        { name: "pass", type: "string", required: true, desc: "SMTP password or app-specific password." },
        { name: "to", type: "string", required: true, desc: "Recipient email address." },
        { name: "encryption", type: "string", required: false, desc: '"ssl" for SSL/TLS, "tls" for STARTTLS, or omit for none.' },
        { name: "format", type: "string", required: false, desc: '"html" (default) or "plain".' },
        { name: "subject", type: "string", required: false, desc: "Custom subject. Defaults to branded verification subject." },
        { name: "html", type: "string", required: false, desc: "Custom HTML body. Defaults to Nova-X branded template." },
        { name: "text", type: "string", required: false, desc: "Custom plain-text body. Defaults to plain-text template." },
      ]}
      curlExample={`curl -s -X POST 'https://novax.my.id/api/smtp-sender' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "host": "smtp.gmail.com",
    "port": 587,
    "user": "sender@gmail.com",
    "pass": "app-password",
    "to": "recipient@domain.com",
    "encryption": "tls",
    "format": "html"
  }'`}
      jsExample={`const res = await fetch("https://novax.my.id/api/smtp-sender", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    host: "smtp.gmail.com",
    port: 587,
    user: "sender@gmail.com",
    pass: "app-password",
    to: "recipient@domain.com",
    encryption: "tls",
    format: "html",
  }),
});
const data = await res.json();
console.log(data);`}
      jsonResponse={`{
  "success": true,
  "data": {
    "accepted": ["recipient@domain.com"],
    "rejected": [],
    "messageId": "<abc123@smtp.gmail.com>",
    "response": "250 2.0.0 OK  1731000000 — gsmtp",
    "elapsedMs": 834
  }
}`}
    />
  );
}
