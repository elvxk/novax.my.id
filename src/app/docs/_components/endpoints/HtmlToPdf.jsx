import EndpointCard from "../EndpointCard";

export default function HtmlToPdf({ open, onToggle, ...props }) {
  return (
    <EndpointCard
      id="html-to-pdf"
      open={open}
      onToggle={onToggle}
      {...props}
      method="POST"
      path="/api/html-to-pdf"
      title="HTML to PDF Converter"
      desc="Convert HTML markup or web pages to PDF documents using headless Chrome. Supports custom page formats, margins, orientation, CSS @page rules, and full print/media emulation."
      params={[
        { name: "html", type: "string", required: false, desc: "HTML markup to convert. Provide either this or 'url', not both." },
        { name: "url", type: "string", required: false, desc: "URL of the web page to convert. Provide either this or 'html', not both." },
        { name: "format", type: "string", required: false, desc: "Paper format: A0-A6, Letter, Legal, Tabloid, Ledger (default: A4)." },
        { name: "landscape", type: "boolean", required: false, desc: "Landscape orientation (default: false)." },
        { name: "printBackground", type: "boolean", required: false, desc: "Print background graphics (default: true)." },
        { name: "margin", type: "object", required: false, desc: "Margins as { top, right, bottom, left } with units (mm, cm, in, px). Default: 20mm each." },
        { name: "scale", type: "number", required: false, desc: "Scale factor 0.1-2 (default: 1)." },
        { name: "preferCSSPageSize", type: "boolean", required: false, desc: "Prefer CSS @page size over format (default: false)." },
        { name: "timeout", type: "number", required: false, desc: "Timeout in ms (default: 30000, max: 60000)." },
        { name: "waitUntil", type: "string", required: false, desc: "Wait condition: load, domcontentloaded, networkidle0, networkidle2 (default: networkidle0)." },
        { name: "emulateMedia", type: "string", required: false, desc: "CSS media type: screen or print (default: print)." },
        { name: "filename", type: "string", required: false, desc: "Output filename (default: document.pdf)." },
      ]}
      curlExample={`curl -s -X POST 'https://novax.my.id/api/html-to-pdf' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "html": "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><style>@page { margin: 20mm; } body { font-family: system-ui, sans-serif; }</style></head><body><h1>Hello PDF</h1></body></html>",
    "format": "A4",
    "landscape": false,
    "printBackground": true,
    "margin": { "top": "20mm", "right": "20mm", "bottom": "20mm", "left": "20mm" }
  }'`}
      jsonResponse={`{
  "success": true,
  "data": {
    "filename": "document.pdf",
    "size": 45821,
    "format": "A4",
    "landscape": false,
    "pages": 1,
    "contentType": "application/pdf",
    "base64": "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+c3RyZWFtCnic... (truncated base64)"
  }
}`}
    />
  );
}