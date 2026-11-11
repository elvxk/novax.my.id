"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network,
  Search,
  Loader2,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  StopCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex items-center gap-1 text-[10px] font-bold bg-ink text-cream px-2 py-0.5 rounded-lg hover:shadow-[2px_2px_0px_0px_#10380b] transition-all shrink-0"
    >
      {copied ? <Check size={10} className="text-fern" /> : <Copy size={10} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function SubdomainFinderInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [domain, setDomain] = useState(() => searchParams.get("domain") || "");
  const [found, setFound] = useState([]);
  const [checked, setChecked] = useState(0);
  const [total, setTotal] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const param = searchParams.get("domain");
    if (param) doScan(param);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doScan(d) {
    const cleaned = d.trim();
    if (!cleaned) return;

    // Abort any in-progress scan
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setScanning(true);
    setDone(false);
    setError(null);
    setFound([]);
    setChecked(0);
    setTotal(0);

    router.replace(`?domain=${encodeURIComponent(cleaned)}`, { scroll: false });

    try {
      const res = await fetch(
        `/api/subdomain-finder?domain=${encodeURIComponent(cleaned)}`,
        { signal: controller.signal }
      );

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to start scan");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop(); // keep incomplete line

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const msg = JSON.parse(line);
            if (msg.type === "start") {
              setTotal(msg.total);
            } else if (msg.type === "found") {
              setFound((prev) => [...prev, { subdomain: msg.subdomain, ips: msg.ips }]);
              setChecked((n) => n + 1);
            } else if (msg.type === "miss") {
              setChecked((n) => n + 1);
            } else if (msg.type === "done") {
              setDone(true);
            }
          } catch {
            // malformed line, skip
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Scan failed");
    } finally {
      setScanning(false);
      setDone(true);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    doScan(domain);
  }

  function handleStop() {
    abortRef.current?.abort();
    setScanning(false);
    setDone(true);
  }

  const progress = total > 0 ? Math.round((checked / total) * 100) : 0;

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar maxWidth="max-w-6xl" />

      {/* Sticky breadcrumb */}
      <div className="sticky top-[53px] z-10 border-b border-ink/15 bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-ink/40 text-xs font-bold">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <ChevronRight size={11} />
            <Link href="/tools" className="hover:text-ink transition-colors">Tools</Link>
            <ChevronRight size={11} />
            <span className="text-ink">Subdomain Finder</span>
          </div>
          {(scanning || done) && (
            <span className="text-xs font-mono font-bold text-ink/50 truncate">
              {found.length} found · {checked}/{total}
            </span>
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
            <Network size={18} className="text-marigold" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight leading-none">
              Subdomain Finder
            </h1>
            <p className="text-xs text-ink/40 font-semibold mt-0.5">
              Enumerate subdomains via DNS brute-force against a ~100-entry wordlist
            </p>
          </div>
        </motion.div>

        {/* Input Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
          className="mb-8"
        >
          <label
            htmlFor="domain"
            className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2"
          >
            Root Domain
          </label>
          <div className="flex gap-2.5">
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              disabled={scanning}
              required
              className="flex-1 bg-parchment border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] transition-shadow disabled:opacity-50"
            />
            {scanning ? (
              <button
                type="button"
                onClick={handleStop}
                className="bg-ink text-cream font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150 shrink-0"
              >
                <StopCircle size={15} />
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!domain.trim()}
                className="bg-ink text-cream font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none shrink-0"
              >
                <Search size={15} />
                Scan
              </button>
            )}
          </div>
          <p className="mt-1.5 text-[11px] text-ink/40 font-medium">
            Enter root domain only — no protocol or path
          </p>
        </motion.form>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 bg-parchment border border-ink rounded-xl px-4 py-3 mb-6"
            >
              <AlertCircle size={15} className="shrink-0 text-red-600 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-ink block">Scan Failed</span>
                <span className="text-xs text-ink/70 font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress + Results */}
        <AnimatePresence>
          {(scanning || done || found.length > 0) && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Progress bar */}
              {(scanning || (done && total > 0)) && (
                <div className="rounded-2xl border border-ink bg-parchment p-4 sm:p-5 shadow-[4px_4px_0px_0px_#10380b]">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      {scanning ? (
                        <Loader2 size={14} className="animate-spin text-ink/60" />
                      ) : (
                        <CheckCircle2 size={14} className="text-fern" />
                      )}
                      <span className="text-xs font-bold text-ink">
                        {scanning ? "Scanning…" : "Scan Complete"}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-ink/50">
                      {checked}/{total} · {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-ink/8 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-ink h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {done && (
                    <p className="mt-2 text-xs font-semibold text-ink/50">
                      Found <span className="text-ink font-black">{found.length}</span> subdomain{found.length !== 1 ? "s" : ""} out of {total} checked.
                    </p>
                  )}
                </div>
              )}

              {/* Results table */}
              {found.length > 0 && (
                <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b]">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 size={16} className="text-ink" />
                    <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                      Discovered Subdomains
                    </span>
                    <span className="ml-auto text-[10px] font-bold bg-ink text-cream px-2 py-0.5 rounded-full">
                      {found.length}
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-ink/15">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-cream/60 border-b border-ink/10">
                        <tr>
                          <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">
                            Subdomain
                          </th>
                          <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">
                            IP Address(es)
                          </th>
                          <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px] text-right">
                            Copy
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/8 bg-parchment">
                        {found.map((item, i) => (
                          <tr key={i}>
                            <td className="py-2.5 px-3 font-mono font-semibold text-ink">
                              {item.subdomain}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-ink/60 text-[11px]">
                              {item.ips.join(", ")}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <CopyButton text={item.subdomain} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Done + no results */}
              {done && found.length === 0 && !error && (
                <div className="rounded-2xl border border-ink/20 bg-parchment p-6 text-center shadow-[4px_4px_0px_0px_#10380b]">
                  <XCircle size={28} className="text-ink/20 mx-auto mb-2" />
                  <p className="text-sm font-bold text-ink/40">
                    No subdomains found in the wordlist.
                  </p>
                  <p className="text-xs text-ink/30 font-medium mt-1">
                    The domain may use custom or less common subdomain names.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!scanning && !done && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16 text-sm font-semibold text-ink/30"
          >
            Enter a root domain above to discover its subdomains.
          </motion.div>
        )}
      </div>

      <Footer maxWidth="max-w-6xl" />
    </main>
  );
}

export default function SubdomainFinderPage() {
  return (
    <Suspense>
      <SubdomainFinderInner />
    </Suspense>
  );
}
