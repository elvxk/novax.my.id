"use client";

import { useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  FileCode,
  Send,
  Loader2,
  ChevronRight,
  AlertCircle,
  Copy,
  Check,
  Download,
  Eye,
  ExternalLink,
  Settings,
  Layers,
  RefreshCw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ── constants ───────────────────────────────────────────────────────────────

const FORMATS = [
  { value: "A4", label: "A4 (210 × 297 mm)" },
  { value: "A3", label: "A3 (297 × 420 mm)" },
  { value: "A5", label: "A5 (148 × 210 mm)" },
  { value: "Letter", label: "Letter (8.5 × 11 in)" },
  { value: "Legal", label: "Legal (8.5 × 14 in)" },
  { value: "Tabloid", label: "Tabloid (11 × 17 in)" },
];

const WAIT_UNTIL_OPTIONS = [
  { value: "networkidle0", label: "Network Idle 0 (no connections)" },
  { value: "networkidle2", label: "Network Idle 2 (≤2 connections)" },
  { value: "load", label: "Load Event" },
  { value: "domcontentloaded", label: "DOM Content Loaded" },
];

const EMULATE_MEDIA_OPTIONS = [
  { value: "print", label: "Print (uses @media print CSS)" },
  { value: "screen", label: "Screen (uses @media screen CSS)" },
];

const PRESETS = [
  {
    label: "Simple Invoice",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { margin: 20mm; }
    body { font-family: system-ui, sans-serif; font-size: 12px; line-height: 1.5; color: #1a1a2e; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #10380b; }
    .logo { font-size: 24px; font-weight: 900; color: #10380b; }
    .invoice-meta { text-align: right; }
    .invoice-title { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #666; }
    .invoice-number { font-size: 18px; font-weight: 700; margin-top: 4px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #10380b; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .address { font-size: 11px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 10px; text-align: left; font-size: 11px; }
    th { background: #f0fdf4; color: #10380b; font-weight: 700; border-bottom: 2px solid #10380b; }
    td { border-bottom: 1px solid #e5e7eb; }
    .text-right { text-align: right; }
    .totals { margin-top: 20px; text-align: right; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 11px; }
    .total-row.grand { font-size: 14px; font-weight: 900; color: #10380b; border-top: 2px solid #10380b; padding-top: 12px; margin-top: 8px; }
    .notes { margin-top: 40px; padding: 15px; background: #fefce8; border-radius: 8px; font-size: 10px; color: #854d0e; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">NOVAX</div>
    <div class="invoice-meta">
      <div class="invoice-title">Invoice</div>
      <div class="invoice-number">INV-2024-001</div>
    </div>
  </div>
  <div class="grid">
    <div class="section">
      <div class="section-title">From</div>
      <div class="address">
        Nova-X Technologies<br>
        123 Innovation Drive<br>
        San Francisco, CA 94105<br>
        USA
      </div>
    </div>
    <div class="section">
      <div class="section-title">Bill To</div>
      <div class="address">
        Acme Corporation<br>
        456 Business Ave<br>
        New York, NY 10001<br>
        USA
      </div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Web Development Services</td>
        <td class="text-right">40</td>
        <td class="text-right">$150.00</td>
        <td class="text-right">$6,000.00</td>
      </tr>
      <tr>
        <td>API Integration & Testing</td>
        <td class="text-right">15</td>
        <td class="text-right">$120.00</td>
        <td class="text-right">$1,800.00</td>
      </tr>
      <tr>
        <td>Maintenance & Support (Monthly)</td>
        <td class="text-right">3</td>
        <td class="text-right">$500.00</td>
        <td class="text-right">$1,500.00</td>
      </tr>
    </tbody>
  </table>
  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span>$9,300.00</span></div>
    <div class="total-row"><span>Tax (8.5%)</span><span>$790.50</span></div>
    <div class="total-row grand"><span>Total Due</span><span>$10,090.50</span></div>
  </div>
  <div class="notes">
    <strong>Payment Terms:</strong> Net 30 days. Please make payment to Nova-X Technologies via bank transfer.
    Thank you for your business!
  </div>
</body>
</html>`,
  },
  {
    label: "Report Card",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { margin: 15mm; }
    body { font-family: system-ui, sans-serif; font-size: 11px; line-height: 1.6; color: #1a1a2e; }
    .card { border: 2px solid #10380b; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #10380b 0%, #166534 100%); color: white; padding: 25px; text-align: center; }
    .school-name { font-size: 18px; font-weight: 900; letter-spacing: 1px; }
    .term { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9; margin-top: 4px; }
    .student-info { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; padding: 20px; background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
    .info-field { font-size: 10px; }
    .info-label { text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; margin-bottom: 2px; }
    .info-value { font-weight: 600; color: #1a1a2e; }
    .grades { padding: 20px; }
    .subject { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .subject:last-child { border-bottom: none; }
    .subject-name { font-weight: 600; }
    .grade-badge { padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 12px; text-transform: uppercase; }
    .grade-a { background: #dcfce7; color: #166534; }
    .grade-b { background: #dbeafe; color: #1e40af; }
    .grade-c { background: #fef9c3; color: #854d0e; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 10px; color: #64748b; border-top: 1px solid #e5e7eb; }
    .signature-line { display: inline-block; width: 150px; border-bottom: 1px solid #94a3b8; margin: 10px 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="school-name">Nova-X Academy</div>
      <div class="term">Fall Semester 2024 — Report Card</div>
    </div>
    <div class="student-info">
      <div class="info-field">
        <div class="info-label">Student</div>
        <div class="info-value">Alex Chen</div>
      </div>
      <div class="info-field">
        <div class="info-label">Grade</div>
        <div class="info-value">10th</div>
      </div>
      <div class="info-field">
        <div class="info-label">Student ID</div>
        <div class="info-value">NX-2024-0892</div>
      </div>
      <div class="info-field">
        <div class="info-label">Homeroom</div>
        <div class="info-value">Room 304</div>
      </div>
    </div>
    <div class="grades">
      <div class="subject">
        <span class="subject-name">Mathematics (Advanced)</span>
        <span class="grade-badge grade-a">A+</span>
      </div>
      <div class="subject">
        <span class="subject-name">Physics</span>
        <span class="grade-badge grade-a">A</span>
      </div>
      <div class="subject">
        <span class="subject-name">Chemistry</span>
        <span class="grade-badge grade-b">B+</span>
      </div>
      <div class="subject">
        <span class="subject-name">Computer Science</span>
        <span class="grade-badge grade-a">A+</span>
      </div>
      <div class="subject">
        <span class="subject-name">English Literature</span>
        <span class="grade-badge grade-b">B+</span>
      </div>
      <div class="subject">
        <span class="subject-name">World History</span>
        <span class="grade-badge grade-a">A-</span>
      </div>
      <div class="subject">
        <span class="subject-name">Physical Education</span>
        <span class="grade-badge grade-a">A</span>
      </div>
      <div class="subject">
        <span class="subject-name">Spanish II</span>
        <span class="grade-badge grade-c">B-</span>
      </div>
    </div>
    <div class="footer">
      <p><strong>GPA: 3.85 / 4.00</strong> | <strong>Class Rank: 12 / 245</strong></p>
      <p style="margin-top: 15px;">
        Parent Signature: <span class="signature-line"></span>
        Date: <span class="signature-line"></span>
      </p>
      <p>This report card is generated electronically and is valid without a physical signature.</p>
    </div>
  </div>
</body>
</html>`,
  },
  {
    label: "Technical Documentation",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { margin: 20mm; @top-center { content: "Nova-X API Reference"; font-size: 9px; color: #666; } @bottom-center { content: "Page " counter(page) " of " counter(pages); font-size: 9px; color: #666; } }
    body { font-family: 'Monospace', monospace; font-size: 10px; line-height: 1.7; color: #1a1a2e; }
    h1 { font-size: 24px; font-weight: 900; color: #10380b; border-bottom: 3px solid #10380b; padding-bottom: 10px; margin-bottom: 30px; }
    h2 { font-size: 16px; font-weight: 800; color: #166534; margin-top: 30px; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #dcfce7; }
    h3 { font-size: 12px; font-weight: 700; color: #1a1a2e; margin-top: 20px; margin-bottom: 10px; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 9px; color: #0f172a; }
    pre { background: #0f172a; color: #e2e8f0; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 16px 0; font-size: 9px; line-height: 1.6; }
    pre code { background: none; padding: 0; color: inherit; }
    .endpoint { display: inline-flex; align-items: center; gap: 8px; padding: 4px 10px; border-radius: 6px; font-size: 9px; font-weight: 700; text-transform: uppercase; }
    .get { background: #dcfce7; color: #166534; }
    .post { background: #fef9c3; color: #854d0e; }
    .table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 9px; }
    .table th, .table td { padding: 8px 10px; text-align: left; border: 1px solid #e5e7eb; }
    .table th { background: #f8fafc; font-weight: 700; color: #374151; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 8px; font-weight: 700; text-transform: uppercase; }
    .required { background: #fee2e2; color: #991b1b; }
    .optional { background: #dcfce7; color: #166534; }
    .note { background: #eff6ff; border-left: 3px solid #3b82f6; padding: 12px; margin: 16px 0; font-size: 9px; color: #1e40af; }
  </style>
</head>
<body>
  <h1>Nova-X HTTP Client API</h1>
  <p><strong>Version:</strong> v1.0 | <strong>Base URL:</strong> <code>https://novax.my.id/api/http-client</code> | <strong>Protocol:</strong> HTTPS</p>
  <p>Send HTTP requests to any API endpoint with custom methods, headers, and body. A lightweight Postman-like tool for testing and debugging APIs.</p>

  <h2>Authentication</h2>
  <p>This endpoint is public and does not require authentication. Rate limiting applies per IP address.</p>

  <h2>Rate Limiting</h2>
  <p>Maximum 60 requests per minute per IP. Exceeding this limit returns HTTP 429 with a <code>Retry-After</code> header.</p>

  <h2>Endpoint</h2>
  <div style="margin: 16px 0;">
    <span class="endpoint post">POST</span> <code>/api/http-client</code>
  </div>

  <h3>Request Parameters</h3>
  <table class="table">
    <thead>
      <tr><th>Parameter</th><th>Type</th><th>Required</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr><td><code>url</code></td><td>string</td><td><span class="badge required">Required</span></td><td>Target URL (must include protocol)</td></tr>
      <tr><td><code>method</code></td><td>string</td><td><span class="badge optional">Optional</span></td><td>HTTP method: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS (default: GET)</td></tr>
      <tr><td><code>headers</code></td><td>object</td><td><span class="badge optional">Optional</span></td><td>Custom request headers as key-value pairs</td></tr>
      <tr><td><code>body</code></td><td>string</td><td><span class="badge optional">Optional</span></td><td>Request body for POST, PUT, PATCH</td></tr>
      <tr><td><code>timeout</code></td><td>number</td><td><span class="badge optional">Optional</span></td><td>Request timeout in ms (default: 10000, max: 30000)</td></tr>
    </tbody>
  </table>

  <h3>Example Request</h3>
  <pre><code>curl -X POST 'https://novax.my.id/api/http-client' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "url": "https://httpbin.org/get",
    "method": "GET",
    "headers": { "Accept": "application/json" }
  }'</code></pre>

  <h3>Response Format</h3>
  <pre><code>{
  "success": true,
  "data": {
    "url": "https://httpbin.org/get",
    "method": "GET",
    "status": 200,
    "statusText": "OK",
    "headers": { "content-type": "application/json" },
    "body": "{...}",
    "timing": 342,
    "size": 256,
    "truncated": false
  }
}</code></pre>

  <div class="note">
    <strong>Note:</strong> Requests to private/internal IP addresses (localhost, 10.x.x.x, 192.168.x.x, 172.16-31.x.x) are blocked for security.
  </div>

  <h2>Error Responses</h2>
  <table class="table">
    <thead>
      <tr><th>Code</th><th>Error Type</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr><td>400</td><td>INVALID_JSON</td><td>Malformed JSON request body</td></tr>
      <tr><td>400</td><td>MISSING_URL</td><td>Required <code>url</code> field missing</td></tr>
      <tr><td>400</td><td>INVALID_URL</td><td>Invalid URL format</td></tr>
      <tr><td>400</td><td>INVALID_PROTOCOL</td><td>Only http/https supported</td></tr>
      <tr><td>403</td><td>PRIVATE_ADDRESS</td><td>Private IP addresses blocked</td></tr>
      <tr><td>400</td><td>INVALID_METHOD</td><td>Unsupported HTTP method</td></tr>
      <tr><td>429</td><td>RATE_LIMITED</td><td>Rate limit exceeded</td></tr>
      <tr><td>504</td><td>REQUEST_TIMEOUT</td><td>Request timed out</td></tr>
      <tr><td>502</td><td>UPSTREAM_ERROR</td><td>Failed to reach target</td></tr>
    </tbody>
  </table>
</body>
</html>`,
  },
];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ── KeyValueEditor for margins ──────────────────────────────────────────────

function MarginEditor({ margins, onChange, disabled }) {
  const fields = [
    { key: "top", label: "Top" },
    { key: "right", label: "Right" },
    { key: "bottom", label: "Bottom" },
    { key: "left", label: "Left" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">
            {f.label}
          </label>
          <input
            type="text"
            value={margins[f.key] || "0"}
            onChange={(e) => onChange({ ...margins, [f.key]: e.target.value })}
            placeholder="0"
            disabled={disabled}
            className="w-full bg-cream border border-ink/20 rounded-lg px-3 py-2 font-mono text-xs text-ink placeholder:text-ink/30 outline-none focus:border-ink transition-colors disabled:opacity-50"
          />
        </div>
      ))}
      <p className="text-[10px] text-ink/40 font-semibold col-span-2 sm:col-span-4 mt-1">
        Values in mm, cm, in, or px (e.g., {"\""}20mm{"\""}, {"\""}1in{"\""}, {"\""}2cm{"\""})
      </p>
    </div>
  );
}

// ── ResponsePanel ────────────────────────────────────────────────────────────

function ResponsePanel({ response, onDownload }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(response.base64);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const byteCharacters = atob(response.base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = response.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-2xl border border-ink bg-parchment shadow-[4px_4px_0px_0px_#10380b] overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-ink/10 flex-wrap bg-fern/10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 bg-fern text-ink font-black text-xs px-3 py-1 rounded-full border border-fern/40">
            <FileText size={12} />
            PDF Generated
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-ink/60">
            <Layers size={11} />
            ~{response.pages} page{response.pages !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-ink/60">
            <Download size={11} />
            {formatBytes(response.size)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-bold text-ink/50 hover:text-ink transition-colors cursor-pointer"
          >
            {copied ? <Check size={12} className="text-fern" /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy Base64"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-cream font-bold text-xs rounded-lg hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-novax transition-all duration-150 cursor-pointer"
          >
            <Download size={12} />
            Download
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-ink/50">Preview</span>
          <a
            href={`data:application/pdf;base64,${response.base64}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-ink/50 hover:text-ink transition-colors cursor-pointer"
          >
            <ExternalLink size={12} />
            Open in New Tab
          </a>
        </div>
        <div className="bg-cream border border-ink/10 rounded-xl overflow-hidden">
          <iframe
            src={`data:application/pdf;base64,${response.base64}`}
            className="w-full h-[500px] border-0"
            title="PDF Preview"
          />
        </div>
      </div>
    </div>
  );
}

// ── EditorTabs ────────────────────────────────────────────────────────────────

function EditorTabs({ activeTab, setActiveTab, children }) {
  return (
    <div className="rounded-2xl border border-ink bg-parchment shadow-[4px_4px_0px_0px_#10380b] overflow-hidden">
      <div className="flex gap-1 px-4 pt-3 pb-1 border-b border-ink/10">
        {["editor", "html-preview", "settings"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === t
                ? "bg-ink text-cream"
                : "text-ink/50 hover:text-ink hover:bg-ink/5"
            }`}
          >
            {t === "editor" && <FileCode size={12} />}
            {t === "html-preview" && <Eye size={12} />}
            {t === "settings" && <Settings size={12} />}
            {t === "editor" ? "Editor" : t === "html-preview" ? "HTML Preview" : "Settings"}
          </button>
        ))}
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

// ── Inner page ────────────────────────────────────────────────────────────────

function HtmlToPdfInner() {
  // Input state
  const [inputMode, setInputMode] = useState("html"); // "html" | "url"
  const [html, setHtml] = useState("");
  const [url, setUrl] = useState("");

  // PDF options
  const [format, setFormat] = useState("A4");
  const [landscape, setLandscape] = useState(false);
  const [printBackground, setPrintBackground] = useState(true);
  const [scale, setScale] = useState(1);
  const [preferCSSPageSize, setPreferCSSPageSize] = useState(false);
  const [margins, setMargins] = useState({ top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" });
  const [waitUntil, setWaitUntil] = useState("networkidle0");
  const [emulateMedia, setEmulateMedia] = useState("print");
  const [timeout, setTimeout] = useState(30000);
  const [filename, setFilename] = useState("document.pdf");

  // UI state
  const [activeTab, setActiveTab] = useState("editor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const generatePdf = useCallback(async () => {
    const input = inputMode === "html" ? html : url;
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    const payload = {
      [inputMode === "html" ? "html" : "url"]: input,
      format,
      landscape,
      printBackground,
      margin: margins,
      scale,
      preferCSSPageSize,
      timeout,
      waitUntil,
      emulateMedia,
      filename,
    };

    try {
      const res = await fetch("/api/html-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || "PDF generation failed");
      } else {
        setResponse(json.data);
      }
    } catch {
      setError("Network error while generating PDF.");
    } finally {
      setLoading(false);
    }
  }, [
    inputMode,
    html,
    url,
    format,
    landscape,
    printBackground,
    margins,
    scale,
    preferCSSPageSize,
    timeout,
    waitUntil,
    emulateMedia,
    filename,
  ]);

  function applyPreset(preset) {
    setInputMode("html");
    setHtml(preset.html);
    setActiveTab("editor");
    generatePdf();
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar maxWidth="max-w-6xl" />

      {/* Breadcrumb */}
      <div className="sticky top-[53px] z-10 border-b border-ink/15 bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-ink/40 text-xs font-bold">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <ChevronRight size={11} />
            <Link href="/tools" className="hover:text-ink transition-colors">Tools</Link>
            <ChevronRight size={11} />
            <span className="text-ink">HTML to PDF</span>
          </div>
        </div>
      </div>

      <div className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 pt-10 pb-20">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 bg-ink rounded-xl flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#10380b]">
            <FileText size={20} className="text-marigold" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight leading-none">HTML to PDF</h1>
            <p className="text-xs text-ink/40 font-semibold mt-0.5">
              Convert HTML markup or web pages to PDF documents
            </p>
          </div>
        </motion.div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left panel - Input & Options */}
          <div className="lg:col-span-7 space-y-4">
            {/* Input Mode Toggle */}
            <div className="rounded-2xl border border-ink bg-parchment shadow-[4px_4px_0px_0px_#10380b] p-4">
              <label className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-3">Input Source</label>
              <div className="flex gap-2">
                {["html", "url"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setInputMode(mode)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                      inputMode === mode
                        ? "bg-ink text-cream border-ink shadow-[3px_3px_0px_0px_#10380b]"
                        : "bg-cream text-ink/70 border-ink/20 hover:border-ink/40 hover:bg-parchment"
                    }`}
                  >
                    {mode === "html" ? <FileCode size={15} /> : <ExternalLink size={15} />}
                    {mode === "html" ? "HTML Markup" : "URL"}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor / URL Input */}
            <EditorTabs activeTab={activeTab} setActiveTab={setActiveTab}>
              {/* Editor Tab */}
              {activeTab === "editor" && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-ink/50">
                    {inputMode === "html" ? "HTML Content" : "Target URL"}
                  </label>

                  {inputMode === "html" ? (
                    <textarea
                      value={html}
                      onChange={(e) => setHtml(e.target.value)}
                      placeholder={`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { margin: 20mm; }
    body { font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
  <h1>Hello PDF</h1>
</body>
</html>`}
                      disabled={loading}
                      rows={20}
                      className="w-full bg-cream border border-ink/20 rounded-xl px-4 py-3 font-mono text-xs text-ink placeholder:text-ink/30 outline-none focus:border-ink transition-colors resize-y disabled:opacity-50"
                      spellCheck={false}
                    />
                  ) : (
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/page-to-convert"
                      disabled={loading}
                      className="w-full bg-cream border border-ink/20 rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:border-ink transition-colors disabled:opacity-50"
                    />
                  )}

                  {/* Preset buttons for HTML mode */}
                  {inputMode === "html" && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-ink/40">Templates:</span>
                      {PRESETS.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => applyPreset(p)}
                          className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border border-ink/20 bg-cream hover:bg-parchment text-ink/70 hover:text-ink transition-colors cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* HTML Preview Tab */}
              {activeTab === "html-preview" && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-ink/50">HTML Preview</label>
                  {inputMode === "html" ? (
                    <div
                      className="w-full min-h-[300px] bg-cream border border-ink/20 rounded-xl p-4 text-sm text-ink outline-none transition-colors [&_p]:mb-2 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold"
                      style={{ lineHeight: 1.6 }}
                      dangerouslySetInnerHTML={{ __html: html || "<p class='text-ink/30 text-center py-8'>No HTML content to preview</p>" }}
                    />
                  ) : (
                    <div className="w-full min-h-[300px] bg-cream border border-ink/20 rounded-xl p-4 text-center text-ink/30">
                      <ExternalLink size={48} className="mx-auto mb-4 text-ink/20" />
                      <p>HTML Preview only available in HTML mode</p>
                      <p className="text-xs mt-1">Switch to HTML Markup input mode to preview</p>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  {/* Page Setup */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-ink mb-4">
                      <Layers size={14} className="text-ink/60" />
                      Page Setup
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">Paper Format</label>
                        <select
                          value={format}
                          onChange={(e) => setFormat(e.target.value)}
                          disabled={loading}
                          className="w-full bg-cream border border-ink/20 rounded-lg px-3 py-2 font-mono text-xs text-ink outline-none focus:border-ink transition-colors disabled:opacity-50"
                        >
                          {FORMATS.map((f) => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">Orientation</label>
                        <div className="flex gap-2">
                          {[
                            { value: false, label: "Portrait", icon: "↕" },
                            { value: true, label: "Landscape", icon: "↔" },
                          ].map((o) => (
                            <button
                              key={o.value}
                              type="button"
                              onClick={() => setLandscape(o.value)}
                              disabled={loading}
                              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                                landscape === o.value
                                  ? "bg-ink text-cream border-ink shadow-[3px_3px_0px_0px_#10380b]"
                                  : "bg-cream text-ink/70 border-ink/20 hover:border-ink/40 hover:bg-parchment"
                              }`}
                            >
                              {o.icon} {o.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-2">Margins</label>
                      <MarginEditor margins={margins} onChange={setMargins} disabled={loading} />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={printBackground}
                          onChange={(e) => setPrintBackground(e.target.checked)}
                          disabled={loading}
                          className="w-4 h-4 rounded border-2 border-ink/30 text-fern focus:ring-2 focus:ring-fern/20 accent-fern cursor-pointer disabled:opacity-50"
                        />
                        <span className="text-sm font-semibold text-ink">Print Background</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferCSSPageSize}
                          onChange={(e) => setPreferCSSPageSize(e.target.checked)}
                          disabled={loading}
                          className="w-4 h-4 rounded border-2 border-ink/30 text-fern focus:ring-2 focus:ring-fern/20 accent-fern cursor-pointer disabled:opacity-50"
                        />
                        <span className="text-sm font-semibold text-ink">Prefer CSS @page Size</span>
                      </label>
                    </div>

                    <div className="mt-4">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">Scale</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.1"
                          max="2"
                          step="0.05"
                          value={scale}
                          onChange={(e) => setScale(Number(e.target.value))}
                          disabled={loading}
                          className="flex-1 accent-fern cursor-pointer disabled:opacity-50"
                        />
                        <span className="text-sm font-mono font-bold text-ink w-16 text-right">{scale.toFixed(2)}x</span>
                      </div>
                    </div>
                  </div>

                  {/* Loading Options */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-ink mb-4">
                      <RefreshCw size={14} className="text-ink/60" />
                      Loading Behavior
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">Wait Until</label>
                        <select
                          value={waitUntil}
                          onChange={(e) => setWaitUntil(e.target.value)}
                          disabled={loading}
                          className="w-full bg-cream border border-ink/20 rounded-lg px-3 py-2 font-mono text-xs text-ink outline-none focus:border-ink transition-colors disabled:opacity-50"
                        >
                          {WAIT_UNTIL_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">Emulate Media</label>
                        <select
                          value={emulateMedia}
                          onChange={(e) => setEmulateMedia(e.target.value)}
                          disabled={loading}
                          className="w-full bg-cream border border-ink/20 rounded-lg px-3 py-2 font-mono text-xs text-ink outline-none focus:border-ink transition-colors disabled:opacity-50"
                        >
                          {EMULATE_MEDIA_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">Timeout (ms)</label>
                      <input
                        type="number"
                        value={timeout}
                        onChange={(e) => setTimeout(Math.min(Math.max(1000, Number(e.target.value) || 30000), 60000))}
                        min="1000"
                        max="60000"
                        step="1000"
                        disabled={loading}
                        className="w-full bg-cream border border-ink/20 rounded-lg px-3 py-2 font-mono text-xs text-ink outline-none focus:border-ink transition-colors disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Output */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-ink mb-4">
                      <FileText size={14} className="text-ink/60" />
                      Output
                    </h3>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">Filename</label>
                      <input
                        type="text"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value || "document.pdf")}
                        placeholder="document.pdf"
                        disabled={loading}
                        className="w-full bg-cream border border-ink/20 rounded-lg px-3 py-2 font-mono text-xs text-ink outline-none focus:border-ink transition-colors disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Tab */}
              {activeTab === "preview" && (
                <div className="text-center py-12">
                  {response ? (
                    <iframe
                      src={`data:application/pdf;base64,${response.base64}`}
                      className="w-full h-[600px] border border-ink/20 rounded-xl bg-cream"
                      title="PDF Preview"
                    />
                  ) : (
                    <div className="text-ink/30 font-semibold">
                      <FileText size={48} className="mx-auto mb-4 text-ink/20" />
                      <p>Generate a PDF to see preview</p>
                    </div>
                  )}
                </div>
              )}
            </EditorTabs>

            {/* Generate Button */}
            <button
              type="button"
              onClick={generatePdf}
              disabled={loading || (inputMode === "html" && !html.trim()) || (inputMode === "url" && !url.trim())}
              className="w-full bg-ink text-cream font-bold text-base px-6 py-4 rounded-xl flex items-center justify-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? "Generating PDF…" : "Generate PDF"}
            </button>
          </div>

          {/* Right panel - Response */}
          <div className="lg:col-span-5">
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-3 bg-red-50 border border-red-300 rounded-xl px-4 py-3 mb-6 shadow-[2px_2px_0px_0px_#991b1b]"
                >
                  <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
                  <div className="text-sm font-semibold text-red-900">{error}</div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {response && !loading && !error && (
                <motion.div
                  key="response"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <ResponsePanel response={response} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state */}
            {!response && !loading && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-ink/20 bg-cream/50 p-8 text-center"
              >
                <FileText size={48} className="mx-auto mb-4 text-ink/20" />
                <p className="text-sm font-semibold text-ink/30 mb-2">Ready to convert</p>
                <p className="text-xs text-ink/20">Enter HTML or a URL and click Generate PDF</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function HtmlToPdfPage() {
  return (
    <Suspense>
      <HtmlToPdfInner />
    </Suspense>
  );
}