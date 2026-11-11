"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
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
  AlertTriangle,
  CheckCircle2,
  Clock,
  Server,
  Globe,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function ProxyViewerInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [domain, setDomain] = useState(() => searchParams.get("domain") || "");
  const [target, setTarget] = useState(() => searchParams.get("target") || searchParams.get("server") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewWidth, setPreviewWidth] = useState("100%");
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    const pDomain = searchParams.get("domain");
    const pTarget = searchParams.get("target") || searchParams.get("server");
    if (pDomain && pTarget) {
      doLookup(pDomain, pTarget);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doLookup(d, t) {
    const cleanDomain = d.trim();
    const cleanTarget = t.trim();
    if (!cleanDomain || !cleanTarget) return;

    setLoading(true);
    setError(null);

    router.replace(
      `?domain=${encodeURIComponent(cleanDomain)}&target=${encodeURIComponent(cleanTarget)}`,
      { scroll: false }
    );

    try {
      const res = await fetch(
        `/api/proxy-viewer?domain=${encodeURIComponent(cleanDomain)}&target=${encodeURIComponent(cleanTarget)}`
      );
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to load preview");
      }

      setResult(json.data);
    } catch (err) {
      setError(err.message || "Failed to load preview");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handlePreview(e) {
    e?.preventDefault();
    doLookup(domain, target);
  }

  function clearPreview() {
    setResult(null);
    setError(null);
    router.replace("/tools/proxy-viewer", { scroll: false });
  }

  function handleCopyUrl() {
    if (!result?.previewUrl) return;
    navigator.clipboard.writeText(result.previewUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
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
            <span className="text-ink">Proxy Viewer</span>
          </div>
          {result && (
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-ink/60 truncate">
              <span className="w-2 h-2 rounded-full bg-fern animate-pulse" />
              <span className="hidden sm:inline">Preview Active:</span>
              <span className="truncate">{result.domain} → {result.target}</span>
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
            <Shield size={18} className="text-marigold" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight leading-none">
              Proxy Viewer
            </h1>
            <p className="text-xs text-ink/40 font-semibold mt-0.5">
              Preview websites with manual DNS resolution to a specific IP or hostname before updating public DNS
            </p>
          </div>
        </motion.div>

        {/* Input Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
          className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b] mb-8"
        >
          <form onSubmit={handlePreview} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Domain input */}
              <div>
                <label
                  htmlFor="domain"
                  className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2"
                >
                  Domain
                </label>
                <input
                  type="text"
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com or example.com/path"
                  disabled={loading}
                  required
                  className="w-full bg-cream border border-ink/20 rounded-xl px-4 py-2.5 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:border-ink focus:shadow-[3px_3px_0px_0px_#10380b] transition-all disabled:opacity-50"
                />
                <p className="mt-1.5 text-[11px] text-ink/45 font-medium">
                  Domain you wish to preview (e.g. example.com)
                </p>
              </div>

              {/* Target Server input */}
              <div>
                <label
                  htmlFor="target"
                  className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2"
                >
                  Target IP / Hostname
                </label>
                <input
                  type="text"
                  id="target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="192.0.2.1 or staging.example.com"
                  disabled={loading}
                  required
                  className="w-full bg-cream border border-ink/20 rounded-xl px-4 py-2.5 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:border-ink focus:shadow-[3px_3px_0px_0px_#10380b] transition-all disabled:opacity-50"
                />
                <p className="mt-1.5 text-[11px] text-ink/45 font-medium">
                  Target server IP address or hostname
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-ink/10">
              <span className="text-xs text-ink/50 font-medium">
                Manual Host header override via <code>rover.novax.my.id</code>
              </span>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || !domain.trim() || !target.trim()}
                  className="bg-ink text-cream font-bold text-sm px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
                >
                  {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Search size={14} />
                  )}
                  <span>{loading ? "Connecting…" : "Load Preview"}</span>
                </button>

                {result && (
                  <button
                    type="button"
                    onClick={clearPreview}
                    disabled={loading}
                    className="bg-parchment border border-ink text-ink font-bold text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_0px_#10380b] transition-all disabled:opacity-50"
                  >
                    <RotateCcw size={13} />
                    <span>Clear</span>
                  </button>
                )}
              </div>
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
              className="flex items-start gap-3 bg-parchment border border-ink rounded-xl px-4 py-3 mb-6"
            >
              <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-ink block">Failed to Load Preview</span>
                <span className="text-xs text-ink/70 font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Frame & Diagnostics Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="preview-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* DNS Status Banner */}
              <div
                className={`rounded-2xl border p-4 sm:p-5 shadow-[4px_4px_0px_0px_#10380b] ${result.isAlreadyLive
                  ? "bg-marigold/30 border-ink"
                  : "bg-sage/40 border-ink"
                  }`}
              >
                <div className="flex items-start gap-3">
                  {result.isAlreadyLive ? (
                    <AlertTriangle size={20} className="text-ink shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 size={20} className="text-ink shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-extrabold text-sm text-ink">
                        {result.isAlreadyLive
                          ? "Website Already Live on Target Server"
                          : "Pre-DNS Preview Active"}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-ink text-cream px-2 py-0.5 rounded-full">
                        Status {result.status}
                      </span>
                    </div>

                    <p className="text-xs text-ink/70 font-medium leading-relaxed">
                      {result.isAlreadyLive ? (
                        <>
                          Public DNS records for <strong>{result.domain}</strong> already point to{" "}
                          <code className="font-mono bg-cream px-1 rounded">
                            {result.target}
                            {result.targetIp && result.targetIp !== result.target ? ` (${result.targetIp})` : ""}
                          </code>.
                        </>
                      ) : (
                        <>
                          Public DNS currently points to{" "}
                          <code className="font-mono bg-cream px-1 rounded">
                            {result.publicDnsIps.length > 0
                              ? result.publicDnsIps.join(", ")
                              : "unresolved"}
                          </code>
                          , while this preview is routed directly to target{" "}
                          <code className="font-mono bg-cream px-1 rounded">
                            {result.target}
                            {result.targetIp && result.targetIp !== result.target ? ` (${result.targetIp})` : ""}
                          </code>.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Bar */}
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink bg-parchment px-5 py-3 shadow-[4px_4px_0px_0px_#10380b] flex-wrap">
                <div className="flex items-center gap-2 text-sm font-bold text-ink">
                  <span className="text-ink/40 font-mono text-xs uppercase tracking-wider">Preview:</span>
                  <span className="font-mono bg-cream px-2 py-0.5 rounded-md border border-ink/15 text-xs">
                    {result.domain} → {result.target}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Viewport switchers */}
                  <div className="flex items-center gap-1 bg-cream p-1 rounded-xl border border-ink/15">
                    <button
                      type="button"
                      onClick={() => setPreviewWidth("100%")}
                      className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${previewWidth === "100%"
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
                      className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${previewWidth === "768px"
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
                      className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${previewWidth === "375px"
                        ? "bg-ink text-cream"
                        : "text-ink/60 hover:text-ink"
                        }`}
                      title="Mobile view (375px)"
                    >
                      <Smartphone size={14} />
                      <span className="hidden sm:inline">Mobile</span>
                    </button>
                  </div>

                  <a
                    href={result.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-ink text-cream px-3.5 py-2 rounded-xl hover:shadow-[3px_3px_0px_0px_#10380b] transition-all shrink-0"
                  >
                    <span>Open in new tab</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Sandboxed iframe container */}
              <div className="w-full flex justify-center bg-cream/50 rounded-2xl p-2 sm:p-3 border border-ink shadow-[4px_4px_0px_0px_#10380b] overflow-x-auto">
                <div
                  style={{ width: previewWidth }}
                  className="transition-all duration-200 rounded-xl overflow-hidden border border-ink bg-white h-[620px]"
                >
                  <iframe
                    src={result.previewUrl}
                    className="h-full w-full border-0"
                    title="Website Preview"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                  />
                </div>
              </div>

              {/* Info Details Box */}
              <div className="rounded-2xl border border-ink bg-parchment p-5 shadow-[4px_4px_0px_0px_#10380b]">
                <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                  <div className="text-xs font-bold text-ink">
                    <span className="text-ink/40 uppercase tracking-wider text-[10px] block mb-0.5">Preview Service Endpoint</span>
                    <code className="rounded-md bg-cream border border-ink/15 px-2 py-1 font-mono text-xs break-all">
                      {result.previewUrl}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="inline-flex items-center gap-1 text-xs font-bold bg-ink text-cream px-3 py-1.5 rounded-lg hover:shadow-[2px_2px_0px_0px_#10380b] transition-all shrink-0"
                  >
                    {copiedUrl ? <Check size={12} className="text-fern" /> : <Copy size={12} />}
                    <span>{copiedUrl ? "Copied" : "Copy URL"}</span>
                  </button>
                </div>
                <p className="text-xs text-ink/65 font-medium leading-relaxed">
                  The preview service overrides the Host header to resolve the domain directly to the target server without requiring public DNS changes.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!result && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16 text-sm font-semibold text-ink/30"
          >
            Enter a domain and target IP or hostname above to preview the website.
          </motion.div>
        )}
      </div>

      <Footer maxWidth="max-w-6xl" />
    </main>
  );
}

export default function ProxyViewerPage() {
  return (
    <Suspense>
      <ProxyViewerInner />
    </Suspense>
  );
}
