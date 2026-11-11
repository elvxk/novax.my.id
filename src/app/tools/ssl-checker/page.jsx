"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Search,
  Loader2,
  ChevronRight,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  Fingerprint,
  Globe,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusIcon({ valid, isExpired, isExpiringSoon, domainMatch }) {
  if (isExpired || !domainMatch)
    return <ShieldX size={20} className="text-red-600 shrink-0" />;
  if (isExpiringSoon)
    return <ShieldAlert size={20} className="text-amber-500 shrink-0" />;
  if (valid)
    return <ShieldCheck size={20} className="text-fern shrink-0" />;
  return <ShieldAlert size={20} className="text-amber-500 shrink-0" />;
}

function StatusBanner({ result }) {
  const { valid, isExpired, isExpiringSoon, domainMatch, daysLeft, host } = result;

  let bg = "bg-sage/40 border-ink";
  let title = "Certificate Valid";
  let desc = `SSL certificate for ${host} is valid and trusted.`;

  if (isExpired) {
    bg = "bg-red-100/60 border-ink";
    title = "Certificate Expired";
    desc = `Certificate expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? "s" : ""} ago.`;
  } else if (!domainMatch) {
    bg = "bg-red-100/60 border-ink";
    title = "Domain Mismatch";
    desc = `Certificate is not issued for ${host}.`;
  } else if (isExpiringSoon) {
    bg = "bg-marigold/30 border-ink";
    title = "Expiring Soon";
    desc = `Certificate expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}.`;
  }

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 shadow-[4px_4px_0px_0px_#10380b] ${bg}`}>
      <div className="flex items-start gap-3">
        <StatusIcon {...result} />
        <div>
          <span className="font-extrabold text-sm text-ink block mb-0.5">{title}</span>
          <p className="text-xs text-ink/70 font-medium leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-ink/8 last:border-0">
      <span className="text-xs font-bold text-ink/45 uppercase tracking-wider shrink-0 w-32">
        {label}
      </span>
      <span
        className={`text-xs text-ink font-semibold text-right break-all ${mono ? "font-mono" : ""}`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function CheckRow({ label, ok, okLabel = "Yes", failLabel = "No" }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-ink/8 last:border-0">
      <span className="text-xs font-bold text-ink/45 uppercase tracking-wider">{label}</span>
      <span className={`flex items-center gap-1 text-xs font-bold ${ok ? "text-fern" : "text-red-600"}`}>
        {ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
        {ok ? okLabel : failLabel}
      </span>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-[10px] font-bold bg-ink text-cream px-2 py-1 rounded-lg hover:shadow-[2px_2px_0px_0px_#10380b] transition-all shrink-0"
    >
      {copied ? <Check size={10} className="text-fern" /> : <Copy size={10} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ── inner component ───────────────────────────────────────────────────────────

function SslCheckerInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [domain, setDomain] = useState(() => searchParams.get("domain") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const param = searchParams.get("domain");
    if (param) doCheck(param);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doCheck(d) {
    const cleaned = d.trim();
    if (!cleaned) return;

    setLoading(true);
    setError(null);
    setResult(null);

    router.replace(`?domain=${encodeURIComponent(cleaned)}`, { scroll: false });

    try {
      const res = await fetch(`/api/ssl-checker?domain=${encodeURIComponent(cleaned)}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to check SSL");
      }
      setResult(json.data);
    } catch (err) {
      setError(err.message || "Failed to reach server");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    doCheck(domain);
  }

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
            <span className="text-ink">SSL Checker</span>
          </div>
          {result && (
            <span className="text-xs font-mono font-bold text-ink/50 truncate">
              {result.host}
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
            <Lock size={18} className="text-marigold" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight leading-none">
              SSL Checker
            </h1>
            <p className="text-xs text-ink/40 font-semibold mt-0.5">
              Inspect and validate SSL/TLS certificates for any domain
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
            Domain
          </label>
          <div className="flex gap-2.5">
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              disabled={loading}
              required
              className="flex-1 bg-parchment border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] transition-shadow disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !domain.trim()}
              className="bg-ink text-cream font-bold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none shrink-0"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              {loading ? "Checking…" : "Check SSL"}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-ink/40 font-medium">
            Enter a domain — port defaults to 443
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
                <span className="text-sm font-bold text-ink block">SSL Check Failed</span>
                <span className="text-xs text-ink/70 font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Status Banner */}
              <StatusBanner result={result} />

              {/* Summary chips */}
              <div className="flex flex-wrap gap-2">
                <span className="bg-marigold text-ink font-black px-4 py-1.5 rounded-full text-sm shadow-[3px_3px_0px_0px_#10380b]">
                  {result.host}
                </span>
                {result.protocol && (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full border border-ink/20 bg-parchment text-ink/70">
                    {result.protocol}
                  </span>
                )}
                {result.cipher && (
                  <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded-full border border-ink/20 bg-parchment text-ink/60">
                    {result.cipher}
                  </span>
                )}
                <span className="text-xs font-bold px-3 py-1.5 rounded-full border border-ink/20 bg-parchment text-ink/60">
                  {result.responseTimeMs}ms
                </span>
                <button
                  type="button"
                  onClick={() => doCheck(result.host)}
                  className="ml-auto flex items-center gap-1.5 text-xs font-bold text-ink/40 hover:text-ink transition-colors"
                >
                  <RotateCcw size={11} />
                  Refresh
                </button>
              </div>

              {/* Certificate Details */}
              <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b]">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={16} className="text-ink" />
                  <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                    Certificate Details
                  </span>
                  <div className="flex-1 h-px bg-ink/10" />
                </div>

                <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-10">
                  <div>
                    <InfoRow label="Issued To" value={result.cert.subject} />
                    <InfoRow label="Issued By" value={result.cert.issuer} />
                    <InfoRow label="Valid From" value={formatDate(result.cert.validFrom)} />
                    <InfoRow label="Valid Until" value={formatDate(result.cert.validTo)} />
                    {result.daysLeft !== null && (
                      <InfoRow
                        label="Days Left"
                        value={
                          result.isExpired
                            ? `Expired ${Math.abs(result.daysLeft)}d ago`
                            : `${result.daysLeft} days`
                        }
                      />
                    )}
                  </div>
                  <div>
                    <CheckRow label="Domain Match" ok={result.domainMatch} />
                    <CheckRow label="Not Expired" ok={!result.isExpired} okLabel="Valid" failLabel="Expired" />
                    <CheckRow label="Overall Valid" ok={result.valid} okLabel="Valid" failLabel="Invalid" />
                    <InfoRow label="Key Bits" value={result.cert.bits ? `${result.cert.bits}-bit` : null} />
                    <InfoRow label="Serial" value={result.cert.serialNumber} mono />
                  </div>
                </div>
              </div>

              {/* Subject Alt Names */}
              {result.cert.altNames?.length > 0 && (
                <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b]">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe size={16} className="text-ink" />
                    <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                      Subject Alternative Names
                    </span>
                    <span className="ml-auto text-[10px] font-bold bg-ink text-cream px-2 py-0.5 rounded-full">
                      {result.cert.altNames.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.cert.altNames.map((name, i) => {
                      const isCurrentHost = name.toLowerCase() === result.host ||
                        (name.startsWith("*.") && result.host.endsWith(name.slice(1)));
                      return (
                        <span
                          key={i}
                          className={`font-mono text-[11px] px-2.5 py-1 rounded-lg border font-semibold ${
                            isCurrentHost
                              ? "bg-sage/40 border-fern/50 text-ink"
                              : "bg-cream border-ink/15 text-ink/60"
                          }`}
                        >
                          {name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Fingerprints */}
              {(result.cert.fingerprint || result.cert.fingerprint256) && (
                <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b]">
                  <div className="flex items-center gap-2 mb-4">
                    <Fingerprint size={16} className="text-ink" />
                    <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                      Fingerprints
                    </span>
                    <div className="flex-1 h-px bg-ink/10" />
                  </div>
                  <div className="space-y-3">
                    {result.cert.fingerprint && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink/40 block mb-1">
                          SHA-1
                        </span>
                        <div className="flex items-center justify-between gap-2">
                          <code className="font-mono text-[11px] text-ink/70 break-all">
                            {result.cert.fingerprint}
                          </code>
                          <CopyButton text={result.cert.fingerprint} />
                        </div>
                      </div>
                    )}
                    {result.cert.fingerprint256 && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink/40 block mb-1">
                          SHA-256
                        </span>
                        <div className="flex items-center justify-between gap-2">
                          <code className="font-mono text-[11px] text-ink/70 break-all">
                            {result.cert.fingerprint256}
                          </code>
                          <CopyButton text={result.cert.fingerprint256} />
                        </div>
                      </div>
                    )}
                  </div>
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
            className="text-center py-16 text-sm font-semibold text-ink/30"
          >
            Enter a domain above to inspect its SSL certificate.
          </motion.div>
        )}
      </div>

      <Footer maxWidth="max-w-6xl" />
    </main>
  );
}

export default function SslCheckerPage() {
  return (
    <Suspense>
      <SslCheckerInner />
    </Suspense>
  );
}
