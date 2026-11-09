"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CodeBlock({ code, language = "bash" }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="relative rounded-xl border border-ink/20 bg-cream/90 overflow-hidden my-2">
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-ink/10 bg-ink/5">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink/40">
          {language}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copy snippet"
          className="flex items-center gap-1 text-[11px] font-bold text-ink/60 hover:text-ink transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-fern" />
              <span className="text-ink">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-xs font-mono text-ink overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
