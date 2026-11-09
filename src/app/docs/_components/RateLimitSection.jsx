import CodeBlock from "./CodeBlock";

export default function RateLimitSection() {
  return (
    <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b] mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-black text-xs uppercase tracking-widest text-ink/50">
          International Rate Limit Standard (IETF RFC 6585)
        </span>
        <div className="flex-1 h-px bg-ink/10" />
      </div>
      <p className="text-xs sm:text-sm text-ink/70 font-medium mb-4 leading-relaxed">
        All endpoints enforce{" "}
        <strong className="text-ink font-bold">60 requests per minute</strong> per client IP.
        Every response returns standard RFC rate limit headers:
      </p>

      <div className="grid gap-4 sm:grid-cols-2 mb-4">
        <div className="bg-cream/60 rounded-xl border border-ink/15 p-3.5 space-y-1.5">
          <span className="text-[11px] font-bold text-ink uppercase tracking-wider block">
            IETF Headers
          </span>
          <div className="font-mono text-xs space-y-1 text-ink/80">
            <div><code className="font-bold text-ink">RateLimit-Limit</code>: 60</div>
            <div><code className="font-bold text-ink">RateLimit-Remaining</code>: 59</div>
            <div><code className="font-bold text-ink">RateLimit-Reset</code>: 60</div>
            <div><code className="font-bold text-ink">RateLimit-Policy</code>: 60;w=60</div>
          </div>
        </div>
        <div className="bg-cream/60 rounded-xl border border-ink/15 p-3.5 space-y-1.5">
          <span className="text-[11px] font-bold text-ink uppercase tracking-wider block">
            Legacy Headers &amp; HTTP 429
          </span>
          <div className="font-mono text-xs space-y-1 text-ink/80">
            <div><code className="font-bold text-ink">X-RateLimit-Limit</code>: 60</div>
            <div><code className="font-bold text-ink">X-RateLimit-Remaining</code>: 59</div>
            <div><code className="font-bold text-ink">X-RateLimit-Reset</code>: 1731000000</div>
            <div><code className="font-bold text-ink">Retry-After</code>: 60 (on 429)</div>
          </div>
        </div>
      </div>

      <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50 block mb-1">
        HTTP 429 Too Many Requests
      </span>
      <CodeBlock
        code={`{\n  "success": false,\n  "error": {\n    "code": "RATE_LIMIT_EXCEEDED",\n    "message": "Too many requests. Limit is 60 requests per 60 seconds. Retry in 42 seconds."\n  }\n}`}
        language="json"
      />
    </div>
  );
}
