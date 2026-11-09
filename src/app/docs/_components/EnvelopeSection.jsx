import CodeBlock from "./CodeBlock";

export default function EnvelopeSection() {
  return (
    <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b] mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-black text-xs uppercase tracking-widest text-ink/50">
          Standard Response Envelope
        </span>
        <div className="flex-1 h-px bg-ink/10" />
      </div>
      <p className="text-xs sm:text-sm text-ink/70 font-medium mb-4 leading-relaxed">
        All Nova-X API endpoints adhere to a standardized JSON envelope for both
        successful responses and errors.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <span className="text-xs font-bold text-fern flex items-center gap-1.5 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-fern" />
            Success Schema (HTTP 200)
          </span>
          <CodeBlock
            code={`{\n  "success": true,\n  "data": { ... },\n  "meta": { ... } // optional\n}`}
            language="json"
          />
        </div>
        <div>
          <span className="text-xs font-bold text-red-600 flex items-center gap-1.5 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            Error Schema (HTTP 4xx / 5xx)
          </span>
          <CodeBlock
            code={`{\n  "success": false,\n  "error": {\n    "code": "INVALID_DOMAIN",\n    "message": "Human readable explanation"\n  }\n}`}
            language="json"
          />
        </div>
      </div>
    </div>
  );
}
