"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Loader2,
  ChevronRight,
  AlertCircle,
  Check,
  Copy,
  KeyRound,
  ListChecks,
  Send,
  ShieldCheck,
  Server,
  Download,
  Lock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  splitCertificateChain,
  certificateFilenames,
} from "@/lib/ssl-generator";
import { downloadFile } from "@/lib/download";

const SAMPLE_DOMAIN = "example.com";

// The CA issues a single string containing leaf + intermediates
const FULL_CHAIN_FILE = "fullchain.pem";

function CopyButton({ text, label = "Copy" }) {
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
      className="inline-flex items-center gap-1 text-[10px] font-bold bg-ink text-cream px-2 py-1 rounded-lg hover:shadow-[2px_2px_0px_0px_#10380b] transition-all shrink-0 cursor-pointer"
    >
      {copied ? <Check size={10} className="text-fern" /> : <Copy size={10} />}
      {copied ? "Copied" : label}
    </button>
  );
}

// RFC 7468 registers application/pem-certificate-chain for PEM certificate chains
function DownloadButton({ content, filename, label, mime = "application/pem-certificate-chain" }) {
  return (
    <button
      type="button"
      onClick={() => downloadFile(content, filename, mime)}
      title={`Download ${filename}`}
      className="inline-flex items-center gap-1 text-[10px] font-bold border border-ink/25 bg-parchment text-ink px-2 py-1 rounded-lg hover:shadow-[2px_2px_0px_0px_#10380b] hover:border-ink transition-all shrink-0 cursor-pointer"
    >
      <Download size={10} />
      {label || "Download"}
    </button>
  );
}

function PemBlock({
  label,
  value,
  filename,
  mime = "application/pem-certificate-chain",
}) {
  return (
    <div className="rounded-xl border border-ink/20 bg-cream overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-ink/10 bg-ink/5">
        <span className="font-black text-[10px] uppercase tracking-widest text-ink/50">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          <CopyButton text={value} />
          {filename && (
            <DownloadButton content={value} filename={filename} mime={mime} />
          )}
        </div>
      </div>
      <pre className="p-3 text-[11px] font-mono text-ink/80 overflow-x-auto max-h-72 leading-relaxed">
        <code>{value}</code>
      </pre>
    </div>
  );
}

function ErrorBox({ message, title = "Request Failed" }) {
  return (
    <div className="flex items-start gap-3 bg-parchment border border-ink rounded-xl px-4 py-3 shadow-[3px_3px_0px_0px_#10380b]">
      <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
      <div className="space-y-0.5">
        <span className="text-sm font-bold text-ink block">{title}</span>
        <span className="text-xs text-ink/70 font-medium">{message}</span>
      </div>
    </div>
  );
}

// ── Tab 1: Order Challenge ────────────────────────────────────────────────────

function OrderChallenge({ initialDomain }) {
  const [domains, setDomains] = useState(initialDomain);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const list = domains
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    if (list.length === 0) {
      setResult(null);
      setError("Enter at least one domain");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ssl-generator/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domains: list }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to order challenge");
      }
      setResult(json.data);
    } catch (err) {
      setError(err.message || "Failed to reach server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Order form — the submit button stays here, above the result cards */}
      <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b]">
        <h2 className="text-xl font-extrabold text-ink tracking-tight text-center mb-6">
          Order Challenge
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="domains"
              className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2"
            >
              Input Domains (comma separated)
            </label>
            <input
              id="domains"
              type="text"
              value={domains}
              onChange={(e) => setDomains(e.target.value)}
              placeholder={`${SAMPLE_DOMAIN}, www.${SAMPLE_DOMAIN}`}
              disabled={loading}
              className="w-full bg-cream border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] transition-shadow disabled:opacity-50"
            />
            <p className="mt-1.5 text-[11px] text-ink/40 font-medium">
              Wildcards are supported (e.g. *.{SAMPLE_DOMAIN})
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !domains.trim()}
            className="w-full bg-ink text-cream font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none cursor-pointer"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <ListChecks size={15} />}
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>

      {/* Result cards */}
      <AnimatePresence>
        {error && !result && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <ErrorBox message={error} title="Challenge Failed" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Request ID card */}
            <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b]">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={16} className="text-fern" />
                <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                  Challenge Ordered
                </span>
                <div className="flex-1 h-px bg-ink/10" />
                <span className="text-[10px] font-black uppercase tracking-wider bg-fern/20 text-ink border border-fern/40 px-2.5 py-0.5 rounded-full">
                  Success
                </span>
              </div>

              <p className="text-xs text-ink/70 font-medium mb-3 leading-relaxed">
                Save the request ID below — it is required for the Issue step.
              </p>

              <div className="flex items-center justify-between gap-2 rounded-xl border border-fern/50 bg-sage/40 px-3 py-2.5">
                <code className="font-mono text-xs text-ink break-all font-semibold">
                  {result.id}
                </code>
                <CopyButton text={result.id} label="Copy ID" />
              </div>
            </div>

            {/* DNS records card */}
            {result.dns?.length > 0 && (
              <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b]">
                <div className="flex items-center gap-2 mb-1.5">
                  <Server size={16} className="text-ink" />
                  <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                    DNS Records
                  </span>
                  <span className="ml-auto text-[10px] font-bold bg-ink text-cream px-2 py-0.5 rounded-full">
                    {result.dns.length}
                  </span>
                </div>
                <p className="text-xs text-ink/60 font-medium mb-4 leading-relaxed">
                  Create {result.dns.length > 1 ? "these TXT records" : "this TXT record"} at your
                  DNS provider, wait for propagation, then continue to the Issue tab.
                </p>

                <div className="space-y-3">
                  {result.dns.map((rec, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-ink/20 bg-cream overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-ink/10 bg-ink/5">
                        <span className="font-mono font-bold text-[11px] text-ink">
                          {rec.type}
                        </span>
                        <span className="text-[10px] font-bold text-ink/40">
                          Record {i + 1} of {result.dns.length}
                        </span>
                      </div>

                      <div className="p-3 space-y-3">
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-ink/40 mb-1">
                            Record Name
                          </span>
                          <div className="flex items-center justify-between gap-2">
                            <code className="font-mono text-xs text-ink break-all">
                              {rec.record}
                            </code>
                            <CopyButton text={rec.record} />
                          </div>
                        </div>

                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-ink/40 mb-1">
                            Value
                          </span>
                          <div className="flex items-center justify-between gap-2">
                            <code className="font-mono text-xs text-ink break-all">
                              {rec.value}
                            </code>
                            <CopyButton text={rec.value} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Tab 2: Issue SSL ──────────────────────────────────────────────────────────

function IssueSsl({ initialId }) {
  const [requestId, setRequestId] = useState(initialId);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const id = requestId.trim();

    if (!id) {
      setResult(null);
      setError("Enter the request ID from the Challenge step");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/ssl-generator/issue/${encodeURIComponent(id)}`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to issue certificate");
      }
      setResult(json.data);
    } catch (err) {
      setError(err.message || "Failed to reach server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Issue form — the submit button stays here, above the result cards */}
      <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b]">
        <h2 className="text-xl font-extrabold text-ink tracking-tight text-center mb-6">
          Issue SSL
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="request-id"
              className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2"
            >
              Input ID
            </label>
            <input
              id="request-id"
              type="text"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              placeholder="0dbadd11-92fe-452f-b38b-75febd17fa3c"
              disabled={loading}
              className="w-full bg-cream border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] transition-shadow disabled:opacity-50"
            />
            <p className="mt-1.5 text-[11px] text-ink/40 font-medium">
              Paste the request ID returned by the Challenge tab
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !requestId.trim()}
            className="w-full bg-ink text-cream font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none cursor-pointer"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>

      {/* Result cards */}
      <AnimatePresence>
        {error && !result && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <ErrorBox message={error} title="Issuance Failed" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Issuance summary card */}
            <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b]">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={16} className="text-fern" />
                <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                  Certificate Issued
                </span>
                <div className="flex-1 h-px bg-ink/10" />
                <span className="text-[10px] font-black uppercase tracking-wider bg-fern/20 text-ink border border-fern/40 px-2.5 py-0.5 rounded-full">
                  Success
                </span>
              </div>

              <p className="text-sm font-bold text-ink mb-1">
                {result.message || "Certificate issued successfully"}
              </p>
              <p className="text-xs text-ink/60 font-medium mb-4 leading-relaxed">
                Install the certificate and private key on your server, then keep the key secure.
              </p>

              <div className="flex flex-wrap gap-1.5">
                {result.domains.map((d) => (
                  <span
                    key={d}
                    className="font-mono text-[11px] px-2.5 py-1 rounded-lg border border-ink/20 bg-cream text-ink font-semibold"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* PEM material card */}
            <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b]">
              <div className="flex items-center gap-2 mb-4">
                <KeyRound size={16} className="text-ink" />
                <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                  PEM Material
                </span>
                <div className="flex-1 h-px bg-ink/10" />
              </div>

              {(() => {
                const { leaf, bundle } = splitCertificateChain(result.certificate);
                const names = certificateFilenames(result.domains);

                return (
                  <div className="space-y-3">
                    {/* Convenience bundle for nginx fullchain deployments */}
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-ink bg-cream px-3 py-2.5">
                      <div className="min-w-0">
                        <span className="font-black text-[10px] uppercase tracking-widest text-ink/50 block">
                          Full Chain (leaf + intermediates)
                        </span>
                        <code className="font-mono text-[11px] text-ink/60">{FULL_CHAIN_FILE}</code>
                      </div>
                      <DownloadButton
                        content={result.certificate}
                        filename={FULL_CHAIN_FILE}
                        label="Download"
                      />
                    </div>

                    <PemBlock label="Leaf Certificate" value={leaf} filename={names.leaf} />
                    {bundle && (
                      <PemBlock
                        label="Certificate Bundle (Intermediate)"
                        value={bundle}
                        filename={names.bundle}
                      />
                    )}
                    <PemBlock
                      label="Private Key"
                      value={result.privateKey}
                      filename={names.key}
                      mime="application/pkcs8"
                    />
                  </div>
                );
              })()}

              <div className="mt-4 flex items-start gap-2 rounded-xl border border-ink/20 bg-cream px-3 py-2.5">
                <Lock size={13} className="text-ink/50 shrink-0 mt-0.5" />
                <p className="text-[11px] text-ink/60 font-medium leading-relaxed">
                  The private key grants full control of these domains. Store it with{" "}
                  <code className="font-mono text-ink">chmod 600</code> (or{" "}
                  <code className="font-mono text-ink">0600</code>), never commit it to version
                  control, and transmit it over an encrypted channel only.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── page shell ────────────────────────────────────────────────────────────────

function SslGeneratorInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialDomain = searchParams.get("domain") || "";
  const initialId = searchParams.get("id") || "";

  const [tab, setTab] = useState(() => (searchParams.get("tab") === "issue" ? "issue" : "challenge"));

  useEffect(() => {
    router.replace(tab === "issue" ? `?tab=issue` : "", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const TABS = [
    { id: "challenge", label: "Challenge", icon: ListChecks },
    { id: "issue", label: "Issue", icon: KeyRound },
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar maxWidth="max-w-4xl" />

      {/* Sticky breadcrumb */}
      <div className="sticky top-[53px] z-10 border-b border-ink/15 bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-ink/40 text-xs font-bold">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <ChevronRight size={11} />
            <Link href="/tools" className="hover:text-ink transition-colors">Tools</Link>
            <ChevronRight size={11} />
            <span className="text-ink">SSL Generator</span>
          </div>
          <Link
            href="/docs#ssl-generator-challenge"
            className="text-xs font-bold text-ink/50 hover:text-ink transition-colors"
          >
            API Docs
          </Link>
        </div>
      </div>

      <div className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 pt-10 pb-20">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 bg-ink rounded-xl flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#10380b]">
            <Award size={18} className="text-marigold" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight leading-none">
              SSL Generator
            </h1>
            <p className="text-xs text-ink/40 font-semibold mt-0.5">
              Order an ACME DNS-01 challenge and issue a free trusted certificate
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1.5 bg-parchment border border-ink rounded-2xl p-1.5 mb-6 shadow-[4px_4px_0px_0px_#10380b]">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                tab === id ? "bg-ink text-cream shadow-sm" : "text-ink/60 hover:text-ink"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {tab === "challenge" ? (
          <OrderChallenge initialDomain={initialDomain} />
        ) : (
          <IssueSsl initialId={initialId} />
        )}
      </div>

      <Footer maxWidth="max-w-4xl" />
    </main>
  );
}

export default function SslGeneratorPage() {
  return (
    <Suspense>
      <SslGeneratorInner />
    </Suspense>
  );
}
