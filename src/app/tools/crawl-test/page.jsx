"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Search,
  Loader2,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  FileText,
  Globe,
  Info,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ── BotCard Component ─────────────────────────────────────────────────────────

function BotCard({ bot }) {
  const isAllowed = bot.allowed;

  return (
    <div className="rounded-2xl border border-ink bg-parchment p-4 sm:p-5 shadow-[4px_4px_0px_0px_#10380b] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm sm:text-base text-ink">
              {bot.bot}
            </span>
            {bot.crawlDelay && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Delay: {bot.crawlDelay}s
              </span>
            )}
          </div>
          <span
            className={`text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full border shadow-[1px_1px_0px_0px_#10380b] flex items-center gap-1 ${
              isAllowed
                ? "bg-fern/20 text-fern border-fern/40"
                : "bg-red-100 text-red-700 border-red-300"
            }`}
          >
            {isAllowed ? (
              <CheckCircle2 size={12} className="stroke-[3]" />
            ) : (
              <XCircle size={12} className="stroke-[3]" />
            )}
            {isAllowed ? "Allowed" : "Blocked"}
          </span>
        </div>

        <p className="text-[11px] font-mono text-ink/50 bg-cream/80 border border-ink/10 rounded-lg p-2 mb-3 break-all select-all">
          {bot.userAgent}
        </p>

        <div className="space-y-1.5 text-xs text-ink/70">
          <div className="flex items-start justify-between gap-2">
            <span className="text-ink/40 font-bold uppercase text-[10px]">
              Matched Rule:
            </span>
            <span className="font-mono font-semibold text-ink">
              {bot.matchedAgent ? `User-agent: ${bot.matchedAgent}` : "Default (Allow * / No rule)"}
            </span>
          </div>

          {bot.disallowedPaths?.length > 0 && (
            <div className="pt-2 border-t border-ink/10">
              <span className="text-ink/40 font-bold uppercase text-[10px] block mb-1">
                Disallow Rules ({bot.disallowedPaths.length}):
              </span>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                {bot.disallowedPaths.map((p, i) => (
                  <code
                    key={i}
                    className="text-[11px] font-mono bg-red-50 text-red-800 border border-red-200 px-1.5 py-0.5 rounded"
                  >
                    {p}
                  </code>
                ))}
              </div>
            </div>
          )}

          {bot.allowedPaths?.length > 0 && (
            <div className="pt-2 border-t border-ink/10">
              <span className="text-ink/40 font-bold uppercase text-[10px] block mb-1">
                Explicit Allow Rules ({bot.allowedPaths.length}):
              </span>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                {bot.allowedPaths.map((p, i) => (
                  <code
                    key={i}
                    className="text-[11px] font-mono bg-fern/10 text-fern border border-fern/30 px-1.5 py-0.5 rounded"
                  >
                    {p}
                  </code>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Inner Page ────────────────────────────────────────────────────────────────

function CrawlTestInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [input, setInput] = useState(() => searchParams.get("url") || "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queried, setQueried] = useState("");

  useEffect(() => {
    const u = searchParams.get("url");
    if (u) {
      doTest(u);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doTest(targetUrl) {
    const raw = targetUrl.trim();
    if (!raw) return;

    setLoading(true);
    setError(null);
    setData(null);
    setQueried(raw);

    router.replace(`?url=${encodeURIComponent(raw)}`, { scroll: false });

    try {
      const res = await fetch(`/api/crawl-test?url=${encodeURIComponent(raw)}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || "Failed to inspect crawler accessibility.");
      } else {
        setData(json.data);
      }
    } catch {
      setError("Network error while performing crawl test.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    doTest(input);
  }

  const presets = ["google.com", "github.com", "wikipedia.org", "openai.com"];

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar maxWidth="max-w-6xl" />

      {/* Breadcrumb sub-header */}
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
            <span className="text-ink">Bot & Crawler Test</span>
          </div>
          {queried && (
            <span className="text-xs font-mono font-bold text-ink/50 truncate">
              {queried}
            </span>
          )}
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
            <Bot size={20} className="text-marigold" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight leading-none">
              Bot & Crawler Test
            </h1>
            <p className="text-xs text-ink/40 font-semibold mt-0.5">
              Verify website accessibility for search engines and AI crawlers
            </p>
          </div>
        </motion.div>

        {/* Input Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
          className="mb-4"
        >
          <label
            htmlFor="url-input"
            className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2"
          >
            Website URL or Domain
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="url-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="example.com or https://example.com/blog"
              disabled={loading}
              className="flex-1 bg-parchment border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] transition-shadow disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-ink text-cream font-bold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none shrink-0"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Search size={15} />
              )}
              {loading ? "Checking Bots…" : "Test Crawler Access"}
            </button>
          </div>
        </motion.form>

        {/* Preset quick buttons */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          <span className="text-[11px] font-bold text-ink/40">Try:</span>
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setInput(p);
                doTest(p);
              }}
              className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border border-ink/20 bg-cream hover:bg-parchment text-ink/70 hover:text-ink transition-colors cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Error notification */}
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

        {/* Results */}
        <AnimatePresence>
          {data && !loading && !error && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Header summary */}
              <div className="flex items-center justify-between gap-4 flex-wrap bg-parchment border border-ink rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_#10380b]">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="bg-marigold text-ink font-black px-3 py-1 rounded-full text-xs sm:text-sm shadow-[2px_2px_0px_0px_#10380b]">
                      {data.hostname}
                    </span>
                    <span className="text-xs font-mono text-ink/50 font-semibold">
                      Path: {data.testPath}
                    </span>
                  </div>
                  {data.pageTitle && (
                    <p className="text-xs font-bold text-ink/70 truncate max-w-xl">
                      &quot;{data.pageTitle}&quot;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => doTest(queried)}
                    className="flex items-center gap-1.5 text-xs font-bold text-ink/50 hover:text-ink transition-colors cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    Re-test
                  </button>
                </div>
              </div>

              {/* Status KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {/* Bot access summary */}
                <div className="rounded-2xl border border-ink bg-parchment p-4 shadow-[3px_3px_0px_0px_#10380b]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-ink/40 block mb-1">
                    Bot Accessibility
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-ink">
                      {data.summary.allowed}
                    </span>
                    <span className="text-xs text-ink/40 font-bold">
                      / {data.summary.totalBots} allowed
                    </span>
                  </div>
                </div>

                {/* Indexability */}
                <div className="rounded-2xl border border-ink bg-parchment p-4 shadow-[3px_3px_0px_0px_#10380b]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-ink/40 block mb-1">
                    Indexability
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {data.summary.indexable ? (
                      <span className="text-sm font-black text-fern uppercase flex items-center gap-1">
                        <CheckCircle2 size={15} /> Indexable
                      </span>
                    ) : (
                      <span className="text-sm font-black text-red-600 uppercase flex items-center gap-1">
                        <XCircle size={15} /> Noindex
                      </span>
                    )}
                  </div>
                </div>

                {/* Cloaking */}
                <div className="rounded-2xl border border-ink bg-parchment p-4 shadow-[3px_3px_0px_0px_#10380b]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-ink/40 block mb-1">
                    Cloaking Detection
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {data.summary.cloakingDetected ? (
                      <span className="text-sm font-black text-red-600 uppercase flex items-center gap-1">
                        <ShieldAlert size={15} /> Detected
                      </span>
                    ) : (
                      <span className="text-sm font-black text-fern uppercase flex items-center gap-1">
                        <CheckCircle2 size={15} /> Pass (Safe)
                      </span>
                    )}
                  </div>
                </div>

                {/* Robots.txt status */}
                <div className="rounded-2xl border border-ink bg-parchment p-4 shadow-[3px_3px_0px_0px_#10380b]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-ink/40 block mb-1">
                    robots.txt
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-sm font-black uppercase ${
                        data.robotsTxt.found ? "text-fern" : "text-amber-800"
                      }`}
                    >
                      {data.robotsTxt.found ? "Found (200)" : `Missing (${data.robotsTxt.status})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Robots.txt & Directives details */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Robots.txt info */}
                <div className="rounded-2xl border border-ink bg-parchment p-5 shadow-[4px_4px_0px_0px_#10380b]">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-ink/60" />
                      <span className="font-black text-xs uppercase tracking-widest text-ink/60">
                        robots.txt Details
                      </span>
                    </div>
                    <a
                      href={data.robotsTxt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-ink/60 hover:text-ink flex items-center gap-1"
                    >
                      View Raw <ExternalLink size={11} />
                    </a>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-ink/10">
                      <span className="text-ink/40 font-bold">Status:</span>
                      <span className="font-semibold text-ink">
                        HTTP {data.robotsTxt.status}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-ink/10">
                      <span className="text-ink/40 font-bold">Total Rules Defined:</span>
                      <span className="font-semibold text-ink">
                        {data.robotsTxt.totalRules}
                      </span>
                    </div>
                    <div>
                      <span className="text-ink/40 font-bold block mb-1">
                        Sitemaps ({data.robotsTxt.sitemaps?.length || 0}):
                      </span>
                      {data.robotsTxt.sitemaps?.length > 0 ? (
                        <ul className="space-y-1">
                          {data.robotsTxt.sitemaps.map((sm, i) => (
                            <li key={i}>
                              <a
                                href={sm}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-[11px] text-ink hover:underline break-all block"
                              >
                                {sm}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-ink/40 italic">
                          No Sitemap directive found in robots.txt
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* HTTP & Meta Directives */}
                <div className="rounded-2xl border border-ink bg-parchment p-5 shadow-[4px_4px_0px_0px_#10380b]">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe size={16} className="text-ink/60" />
                    <span className="font-black text-xs uppercase tracking-widest text-ink/60">
                      Page Indexing Directives
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-ink/10">
                      <span className="text-ink/40 font-bold">Browser Response:</span>
                      <span className="font-semibold text-ink">
                        HTTP {data.page.browserStatus}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-ink/10">
                      <span className="text-ink/40 font-bold">Googlebot Response:</span>
                      <span className="font-semibold text-ink">
                        HTTP {data.page.botStatus}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-ink/10">
                      <span className="text-ink/40 font-bold">Canonical Link:</span>
                      <span className="font-mono text-[11px] font-semibold text-ink truncate max-w-[200px]">
                        {data.canonicalUrl || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-ink/40 font-bold block mb-1">
                        Meta Robots Tags:
                      </span>
                      {data.metaRobots?.length > 0 ? (
                        <div className="space-y-1">
                          {data.metaRobots.map((m, i) => (
                            <div
                              key={i}
                              className="font-mono text-[11px] bg-cream border border-ink/15 rounded px-2 py-1"
                            >
                              <strong>{m.name}:</strong> {m.all?.join(", ")}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-ink/40 italic">
                          No meta robots directives specified (defaults to index, follow)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bot Breakdown Grid */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Bot size={18} className="text-ink" />
                  <h2 className="text-xl font-black text-ink tracking-tight">
                    Bot Accessibility Matrix
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {data.bots.map((bot) => (
                    <BotCard key={bot.bot} bot={bot} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!queried && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16 text-sm font-semibold text-ink/40 space-y-2"
          >
            <Info size={24} className="mx-auto text-ink/20 mb-2" />
            <p>Enter any website domain or full URL to test crawler accessibility.</p>
            <p className="text-xs text-ink/30">
              Evaluates rules for Googlebot, Bingbot, GPTBot, ClaudeBot, and more.
            </p>
          </motion.div>
        )}
      </div>

      <Footer />
    </main>
  );
}

// ── Export Wrapped in Suspense ────────────────────────────────────────────────

export default function CrawlTestPage() {
  return (
    <Suspense>
      <CrawlTestInner />
    </Suspense>
  );
}
