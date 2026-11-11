"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import CodeBlock from "./CodeBlock";
import ParamTable from "./ParamTable";

const METHOD_COLOR = {
  GET: "bg-fern/20 text-fern border-fern/30",
  POST: "bg-marigold/60 text-ink border-marigold",
  PATCH: "bg-sage text-ink border-ink/20",
  DELETE: "bg-red-100 text-red-700 border-red-200",
};

export default function EndpointCard({
  id,
  method = "GET",
  path,
  title,
  desc,
  params,
  curlExample,
  jsonResponse,
  badge,
  live = true,
  jsExample: jsExampleProp,
  // controlled open
  open: openProp,
  onToggle,
}) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = openProp !== undefined ? openProp : localOpen;

  function handleToggle() {
    const next = !open;
    if (onToggle) onToggle(next);
    else setLocalOpen(next);
  }

  const [tab, setTab] = useState("curl");

  const jsExample =
    jsExampleProp ??
    `const res = await fetch("https://novax.my.id${path}");
const data = await res.json();
console.log(data);`;

  return (
    <div id={id} className="rounded-2xl border border-ink bg-parchment shadow-[4px_4px_0px_0px_#10380b] mb-5 overflow-hidden scroll-mt-32">
      {/* Accordion header — always visible */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-cream/40 transition-colors"
      >
        <span
          className={`shrink-0 font-black text-[11px] px-2.5 py-1 rounded-lg border tracking-wider ${
            METHOD_COLOR[method] ?? "bg-ink/10 text-ink border-ink/20"
          }`}
        >
          {method}
        </span>
        <code className="flex-1 text-sm font-mono font-bold text-ink truncate">{path}</code>
        {live ? (
          <span className="hidden sm:inline text-[10px] font-black bg-fern/20 text-ink px-2.5 py-0.5 rounded-full border border-fern/40 shadow-[2px_2px_0px_0px_#10380b] shrink-0 uppercase tracking-wider">
            {badge || "Live"}
          </span>
        ) : (
          <span className="hidden sm:inline text-[10px] font-black bg-marigold/30 text-amber-900 px-2.5 py-0.5 rounded-full border border-ink/20 shrink-0 uppercase tracking-wider">
            {badge || "Maintenance"}
          </span>
        )}
        <ChevronDown
          size={16}
          className={`shrink-0 text-ink/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Collapsible body */}
      {open && (
        <div className="px-5 pb-6 pt-1 border-t border-ink/10">
          <h3 className="text-base font-extrabold text-ink mb-1 mt-3">{title}</h3>
          <p className="text-xs sm:text-sm text-ink/70 font-medium mb-5 leading-relaxed">{desc}</p>

          {params && params.length > 0 && (
            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50">
                {method === "POST" ? "Request Body" : "Query Parameters"}
              </span>
              <ParamTable params={params} />
            </div>
          )}

          <div className="mb-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50">
                Request Example
              </span>
              <div className="flex gap-1">
                {["curl", "js"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
                      tab === t ? "bg-ink text-cream" : "text-ink/60 hover:text-ink"
                    }`}
                  >
                    {t === "curl" ? "cURL" : "JavaScript"}
                  </button>
                ))}
              </div>
            </div>
            <CodeBlock
              code={tab === "curl" ? curlExample : jsExample}
              language={tab === "curl" ? "bash" : "javascript"}
            />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50 block mb-1">
              Response (200 OK)
            </span>
            <CodeBlock code={jsonResponse} language="json" />
          </div>
        </div>
      )}
    </div>
  );
}
