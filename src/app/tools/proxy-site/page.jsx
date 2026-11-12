"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Search,
  Loader2,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Laptop,
  Tablet,
  Smartphone,
  Copy,
  Check,
  AlertCircle,
  ShieldCheck,
  Globe,
  Lock,
  Code2,
  FileText,
  Clock,
  Server,
  Layers,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SAMPLE_SITES = [
  { label: "example.com", url: "https://example.com" },
  { label: "wikipedia.org", url: "https://en.wikipedia.org" },
  { label: "news.ycombinator.com", url: "https://news.ycombinator.com" },
  { label: "httpbin.org/html", url: "https://httpbin.org/html" },
];

function HeaderBadge({ label, ok }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
        ok
          ? "bg-fern/15 text-ink border-fern/40"
          : "bg-ink/5 text-ink/40 border-ink/15"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-fern" : "bg-ink/30"}`} />
      {label}
    </span>
  );
}

function ProxySiteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [inputUrl, setInputUrl] = useState(() => searchParams.get("url") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewWidth, setPreviewWidth] = useState("100%");
  const [activeTab, setActiveTab] = useState("preview"); // "preview" | "headers" | "source"
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const paramUrl = searchParams.get("url");
    if (paramUrl) {
      doFetch(paramUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doFetch(target) {
    const clean = target.trim();
    if (!clean) return;

    setLoading(true);
    setError(null);
    setResult(null);

    router.replace(`?url=${encodeURIComponent(clean)}`, { scroll: false });

    try {
      const res = await fetch(`/api/proxy-site?url=${encodeURIComponent(clean)}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to proxy website");
      }

      setResult(json.data);
    } catch (err) {
      setError(err.message || "Failed to reach target server via proxy");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    doFetch(inputUrl);
  }

  function handleClear() {
    setResult(null);
    setError(null);
    setInputUrl("");
    router.replace("/tools/proxy-site", { scroll: false });
  }

  function handleCopySource() {
    if (!result?.html) return;
    navigator.clipboard.writeText(result.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReloadIframe() {
    if (iframeRef.current && result?.html) {
      iframeRef.current.srcdoc = result.html;
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar maxWidth="max-w-6xl" />

      {/* Sticky breadcrumb sub-header */}
      <div className="sticky top-[53px] z-10 border-b border-ink/15 bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-ink/40 text-xs font-bold">
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <ChevronRight size={11} />
            <Link href="/tools" className="hover:text-ink transition-colors">
              Tools
            </Link>
            <ChevronRight size={11} />
            <span className="text-ink">Proxy Site</span>
          </div>
          {result && (
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-ink/60 truncate">
              <span className="w-2 h-2 rounded-full bg-fern animate-pulse" />
              <span className="hidden sm:inline">Active Proxy:</span>
              <span className="truncate">{result.finalUrl || result.url}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 pt-10 pb-20">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 bg-ink rounded-xl flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#10380b]">
            <Compass size={18} className="text-marigold" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight leading-none">
              Proxy Site
            </h1>
            <p className="text-xs text-ink/40 font-semibold mt-0.5">
              Browse and preview any website anonymously through an encrypted web proxy directly on this page
            </p>
          </div>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
          className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b] mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="proxy-url"
                className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2"
              >
                Website URL to Browse
              </label>
              <div className="flex gap-2.5">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink/40">
                    <Globe size={16} />
                  </div>
                  <input
                    id="proxy-url"
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="example.com or https://news.ycombinator.com"
                    disabled={loading}
                    required
                    className="w-full bg-cream border border-ink rounded-xl pl-10 pr-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] transition-shadow disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !inputUrl.trim()}
                  className="bg-ink text-cream font-bold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none shrink-0 cursor-pointer"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                  <span>{loading ? "Proxying…" : "Browse Site"}</span>
                </button>
              </div>
            </div>

            {/* Quick Sample Links & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-ink/10">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink/40 mr-1">
                  Try Sample:
                </span>
                {SAMPLE_SITES.map((sample) => (
                  <button
                    key={sample.url}
                    type="button"
                    onClick={() => {
                      setInputUrl(sample.url);
                      doFetch(sample.url);
                    }}
                    disabled={loading}
                    className="text-xs font-mono font-bold bg-cream hover:bg-parchment border border-ink/15 hover:border-ink text-ink px-2.5 py-1 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              {result && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={loading}
                  className="text-xs font-bold text-ink/50 hover:text-ink flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Error notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 bg-parchment border border-ink rounded-xl px-4 py-3 mb-6 shadow-[3px_3px_0px_0px_#10380b]"
            >
              <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-ink block">Proxy Connection Failed</span>
                <span className="text-xs text-ink/70 font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ON-PAGE PREVIEW & DIAGNOSTICS SECTION ── */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="preview-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Diagnostic Meta Banner */}
              <div className="rounded-2xl border border-ink bg-parchment p-4 sm:p-5 shadow-[4px_4px_0px_0px_#10380b]">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-marigold text-ink font-black px-3.5 py-1 rounded-full text-xs shadow-[2px_2px_0px_0px_#10380b]">
                      HTTP {result.status} {result.statusText}
                    </span>
                    <span className="text-xs font-bold text-ink/50 bg-cream border border-ink/15 px-2.5 py-0.5 rounded-full">
                      {result.responseTimeMs} ms
                    </span>
                    <span className="text-xs font-mono font-bold text-ink/60 truncate max-w-md">
                      {result.title}
                    </span>
                  </div>

                  {/* Security Header Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <HeaderBadge label="HSTS" ok={!!result.securityHeaders?.strictTransportSecurity} />
                    <HeaderBadge label="CSP" ok={!!result.securityHeaders?.contentSecurityPolicy} />
                    <HeaderBadge label="X-Frame" ok={!!result.securityHeaders?.xFrameOptions} />
                    <HeaderBadge label="Nosniff" ok={!!result.securityHeaders?.xContentTypeOptions} />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-ink/65 pt-2 border-t border-ink/10 break-all">
                  <span className="font-bold text-ink/40 shrink-0">TARGET:</span>
                  <span>{result.finalUrl || result.url}</span>
                  {result.contentType && (
                    <span className="ml-auto text-[11px] text-ink/40 font-semibold shrink-0">
                      {result.contentType}
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation & Viewport Controls Bar */}
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink bg-parchment px-4 sm:px-5 py-3 shadow-[4px_4px_0px_0px_#10380b] flex-wrap">
                {/* View Tabs */}
                <div className="flex items-center gap-1 bg-cream p-1 rounded-xl border border-ink/15">
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === "preview"
                        ? "bg-ink text-cream shadow-sm"
                        : "text-ink/60 hover:text-ink"
                    }`}
                  >
                    <Compass size={13} />
                    <span>Web Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("headers")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === "headers"
                        ? "bg-ink text-cream shadow-sm"
                        : "text-ink/60 hover:text-ink"
                    }`}
                  >
                    <FileText size={13} />
                    <span>Headers</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("source")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === "source"
                        ? "bg-ink text-cream shadow-sm"
                        : "text-ink/60 hover:text-ink"
                    }`}
                  >
                    <Code2 size={13} />
                    <span>HTML Source</span>
                  </button>
                </div>

                {/* Viewport switchers & Refresh button (active in preview mode) */}
                <div className="flex items-center gap-2.5">
                  {activeTab === "preview" && (
                    <>
                      <div className="flex items-center gap-1 bg-cream p-1 rounded-xl border border-ink/15">
                        <button
                          type="button"
                          onClick={() => setPreviewWidth("100%")}
                          className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            previewWidth === "100%"
                              ? "bg-ink text-cream"
                              : "text-ink/60 hover:text-ink"
                          }`}
                          title="Desktop view (100%)"
                        >
                          <Laptop size={14} />
                          <span className="hidden sm:inline">Desktop</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewWidth("768px")}
                          className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            previewWidth === "768px"
                              ? "bg-ink text-cream"
                              : "text-ink/60 hover:text-ink"
                          }`}
                          title="Tablet view (768px)"
                        >
                          <Tablet size={14} />
                          <span className="hidden sm:inline">Tablet</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewWidth("375px")}
                          className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            previewWidth === "375px"
                              ? "bg-ink text-cream"
                              : "text-ink/60 hover:text-ink"
                          }`}
                          title="Mobile view (375px)"
                        >
                          <Smartphone size={14} />
                          <span className="hidden sm:inline">Mobile</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleReloadIframe}
                        className="p-2 rounded-xl border border-ink/15 bg-cream hover:bg-parchment text-ink transition-all cursor-pointer"
                        title="Reload Preview Frame"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </>
                  )}

                  {activeTab === "source" && (
                    <button
                      type="button"
                      onClick={handleCopySource}
                      className="inline-flex items-center gap-1 text-xs font-bold bg-ink text-cream px-3 py-1.5 rounded-xl hover:shadow-[2px_2px_0px_0px_#10380b] transition-all cursor-pointer"
                    >
                      {copied ? <Check size={13} className="text-fern" /> : <Copy size={13} />}
                      <span>{copied ? "Copied" : "Copy Source"}</span>
                    </button>
                  )}

                  <a
                    href={result.finalUrl || result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-ink text-cream px-3.5 py-2 rounded-xl hover:shadow-[3px_3px_0px_0px_#10380b] transition-all shrink-0 cursor-pointer"
                  >
                    <span>Direct Site</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* ── TAB 1: INTERACTIVE WEB PREVIEW (SAME PAGE IFRAME) ── */}
              {activeTab === "preview" && (
                <div className="w-full flex flex-col items-center bg-cream/60 rounded-2xl p-2 sm:p-3 border border-ink shadow-[4px_4px_0px_0px_#10380b]">
                  {/* Browser Mockup Chrome Bar */}
                  <div className="w-full flex items-center gap-2 pb-2 px-2 border-b border-ink/10 mb-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500" />
                    </div>
                    <div className="flex-1 mx-2 bg-cream border border-ink/15 rounded-lg px-3 py-1 text-xs font-mono text-ink/70 flex items-center gap-1.5 truncate">
                      <Lock size={11} className="text-fern shrink-0" />
                      <span className="truncate">{result.finalUrl || result.url}</span>
                    </div>
                  </div>

                  {/* Sandboxed Interactive Iframe Container */}
                  <div
                    style={{ width: previewWidth }}
                    className="transition-all duration-200 rounded-xl overflow-hidden border border-ink bg-white h-[660px] max-w-full"
                  >
                    <iframe
                      ref={iframeRef}
                      srcDoc={result.html}
                      className="w-full h-full border-0"
                      title={`Proxy Preview of ${result.title || result.url}`}
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    />
                  </div>
                </div>
              )}

              {/* ── TAB 2: RESPONSE HEADERS ── */}
              {activeTab === "headers" && (
                <div className="rounded-2xl border border-ink bg-parchment p-5 shadow-[4px_4px_0px_0px_#10380b]">
                  <div className="flex items-center justify-between gap-3 mb-4 border-b border-ink/10 pb-3">
                    <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                      HTTP Response Headers
                    </span>
                    <span className="text-xs font-mono text-ink/40 font-bold">
                      {Object.keys(result.headers || {}).length} Headers Received
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-xs">
                    {Object.entries(result.headers || {}).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b border-ink/5 last:border-0"
                      >
                        <span className="font-bold text-ink/50 sm:w-56 shrink-0 break-all uppercase text-[11px]">
                          {key}
                        </span>
                        <span className="text-ink break-all font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TAB 3: PROCESSED HTML SOURCE ── */}
              {activeTab === "source" && (
                <div className="rounded-2xl border border-ink bg-parchment p-5 shadow-[4px_4px_0px_0px_#10380b]">
                  <div className="flex items-center justify-between gap-3 mb-3 border-b border-ink/10 pb-3">
                    <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                      Rendered HTML Payload (With &lt;base&gt; Injection)
                    </span>
                    <span className="text-xs font-mono text-ink/40 font-bold">
                      {Math.round((result.html?.length || 0) / 1024)} KB
                    </span>
                  </div>
                  <textarea
                    readOnly
                    rows={20}
                    value={result.html}
                    className="w-full bg-cream border border-ink/20 rounded-xl p-4 font-mono text-xs text-ink leading-relaxed outline-none select-all resize-y"
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!result && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-20 text-sm font-semibold text-ink/30"
          >
            Enter any public website URL above or click a sample link to preview it via the web proxy.
          </motion.div>
        )}
      </div>

      <Footer maxWidth="max-w-6xl" />
    </main>
  );
}

export default function ProxySitePage() {
  return (
    <Suspense>
      <ProxySiteInner />
    </Suspense>
  );
}
