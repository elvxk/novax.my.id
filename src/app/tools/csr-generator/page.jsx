"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeySquare,
  Search,
  Loader2,
  ChevronRight,
  AlertCircle,
  RotateCcw,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Lock,
  FileText,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-ink/8 last:border-0">
      <span className="text-xs font-bold text-ink/45 uppercase tracking-wider shrink-0 w-36">
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
      className="inline-flex items-center gap-1.5 text-xs font-bold bg-ink text-cream px-3 py-1.5 rounded-lg hover:shadow-[2px_2px_0px_0px_#10380b] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
    >
      {copied ? <Check size={13} className="text-fern" /> : <Copy size={13} />}
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
}

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function CsrGeneratorInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [domain, setDomain] = useState(() => searchParams.get("domain") || "");
  const [keySize, setKeySize] = useState(() => searchParams.get("keySize") || "2048");
  const [country, setCountry] = useState(() => searchParams.get("country") || "");
  const [state, setState] = useState(() => searchParams.get("state") || "");
  const [locality, setLocality] = useState(() => searchParams.get("locality") || "");
  const [organization, setOrganization] = useState(() => searchParams.get("organization") || "");
  const [organizationalUnit, setOrganizationalUnit] = useState(() => searchParams.get("organizationalUnit") || "");
  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  const [subjectAltNames, setSubjectAltNames] = useState(() => searchParams.get("subjectAltNames") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const param = searchParams.get("domain");
    if (param) doGenerate(param);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doGenerate(d) {
    const cleaned = d.trim();
    if (!cleaned) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const body = {
      domain: cleaned,
      keySize: parseInt(keySize, 10) || 2048,
      country: country.trim() || undefined,
      state: state.trim() || undefined,
      locality: locality.trim() || undefined,
      organization: organization.trim() || undefined,
      organizationalUnit: organizationalUnit.trim() || undefined,
      email: email.trim() || undefined,
      subjectAltNames: subjectAltNames
        ? subjectAltNames.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
    };

    router.replace(`?domain=${encodeURIComponent(cleaned)}`, { scroll: false });

    try {
      const res = await fetch("/api/csr-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to generate CSR");
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
    doGenerate(domain);
  }

  function clearResult() {
    setResult(null);
    setError(null);
    router.replace("/tools/csr-generator", { scroll: false });
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar maxWidth="max-w-6xl" />

      {/* Sticky breadcrumb */}
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
            <span className="text-ink">CSR Generator</span>
          </div>
          {result && (
            <span className="text-xs font-mono font-bold text-ink/50 truncate">
              {result.domain}
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
            <KeySquare size={18} className="text-marigold" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight leading-none">
              CSR Generator
            </h1>
            <p className="text-xs text-ink/40 font-semibold mt-0.5">
              Generate PKCS#10 Certificate Signing Requests and matching RSA Private Keys for SSL/TLS certificates
            </p>
          </div>
        </motion.div>

        {/* Input Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
          className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b] mb-8"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full sm:col-span-2">
              <label
                htmlFor="domain"
                className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2"
              >
                Domain (Common Name) <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-2.5">
                <input
                  id="domain"
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com or *.example.com"
                  disabled={loading}
                  required
                  className="flex-1 bg-cream border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] transition-shadow disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !domain.trim()}
                  className="bg-ink text-cream font-bold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none shrink-0 cursor-pointer"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                  {loading ? "Generating…" : "Generate CSR"}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-ink/40 font-medium">
                Primary fully qualified domain name (FQDN) or wildcard for the SSL certificate
              </p>
            </div>

            <div>
              <label
                htmlFor="keySize"
                className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2"
              >
                Key Size
              </label>
              <select
                id="keySize"
                value={keySize}
                onChange={(e) => setKeySize(e.target.value)}
                disabled={loading}
                className="w-full bg-cream border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink outline-none focus:shadow-[4px_4px_0px_0px_#10380b] disabled:opacity-50"
              >
                <option value="1024">1024-bit (Legacy)</option>
                <option value="2048">2048-bit (Standard Recommended)</option>
                <option value="4096">4096-bit (High Security)</option>
              </select>
              <p className="mt-1.5 text-[11px] text-ink/40 font-medium">
                RSA bit length (2048 is industry standard)
              </p>
            </div>

            <div>
              <label
                htmlFor="country"
                className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2"
              >
                Country Code (C)
              </label>
              <input
                id="country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="ID, US, SG"
                maxLength={2}
                disabled={loading}
                className="w-full bg-cream border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] disabled:opacity-50"
              />
              <p className="mt-1 text-[10px] text-ink/40 font-medium">
                Two-letter ISO 3166-1 country code
              </p>
            </div>

            <div>
              <label
                htmlFor="state"
                className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2"
              >
                State / Province (ST)
              </label>
              <input
                id="state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="DKI Jakarta, California"
                disabled={loading}
                className="w-full bg-cream border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="locality"
                className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2"
              >
                City / Locality (L)
              </label>
              <input
                id="locality"
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="Jakarta, San Francisco"
                disabled={loading}
                className="w-full bg-cream border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="organization"
                className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2"
              >
                Organization (O)
              </label>
              <input
                id="organization"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Company / Legal Entity Name"
                disabled={loading}
                className="w-full bg-cream border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="organizationalUnit"
                className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2"
              >
                Org Unit (OU)
              </label>
              <input
                id="organizationalUnit"
                type="text"
                value={organizationalUnit}
                onChange={(e) => setOrganizationalUnit(e.target.value)}
                placeholder="IT, Security, Engineering"
                disabled={loading}
                className="w-full bg-cream border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2"
              >
                Contact Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                disabled={loading}
                className="w-full bg-cream border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] disabled:opacity-50"
              />
            </div>

            <div className="col-span-full">
              <label
                htmlFor="subjectAltNames"
                className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2"
              >
                Subject Alternative Names (SANs)
              </label>
              <input
                id="subjectAltNames"
                type="text"
                value={subjectAltNames}
                onChange={(e) => setSubjectAltNames(e.target.value)}
                placeholder="www.example.com, api.example.com, dev.example.com"
                disabled={loading}
                className="w-full bg-cream border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] disabled:opacity-50"
              />
              <p className="mt-1 text-[10px] text-ink/40 font-medium">
                Additional domains covered by this certificate (comma-separated)
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-5 pt-4 border-t border-ink/10">
            {result && (
              <button
                type="button"
                onClick={clearResult}
                disabled={loading}
                className="bg-parchment border border-ink text-ink font-bold text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#10380b] transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw size={13} />
                <span>Reset Form</span>
              </button>
            )}
          </div>
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
              <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-ink block">Failed to Generate CSR</span>
                <span className="text-xs text-ink/70 font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Summary Header */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="bg-marigold text-ink font-black px-4 py-1.5 rounded-full text-sm shadow-[3px_3px_0px_0px_#10380b]">
                  {result.domain}
                </span>
                <span className="text-xs text-ink/50 font-bold bg-cream border border-ink/20 px-3 py-1 rounded-full">
                  RSA {result.keySize}-bit
                </span>
                <span className="text-xs font-mono font-bold bg-fern/20 text-ink border border-fern px-3 py-1 rounded-full">
                  PKCS#10 Ready
                </span>
              </div>

              {/* Private Key Security Notice */}
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 text-amber-900 shadow-[3px_3px_0px_0px_#d97706] flex items-start gap-3">
                <AlertTriangle size={18} className="shrink-0 text-amber-700 mt-0.5" />
                <div className="text-xs sm:text-sm font-medium leading-relaxed space-y-1">
                  <div className="font-extrabold text-amber-950">
                    Important: Save Your Private Key Now
                  </div>
                  <div>
                    Nova-X does not store your private keys on our servers. Download or copy both the <strong>CSR</strong> and <strong>Private Key</strong> immediately. You will need this private key to install the SSL certificate once signed by your Certificate Authority.
                  </div>
                </div>
              </div>

              {/* Subject Breakdown Card */}
              <div className="rounded-2xl border border-ink bg-parchment p-5 shadow-[4px_4px_0px_0px_#10380b]">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={16} className="text-ink" />
                  <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                    Certificate Subject Details
                  </span>
                </div>
                <div className="grid gap-1 sm:grid-cols-2">
                  <InfoRow label="Common Name (CN)" value={result.subject?.commonName} mono />
                  <InfoRow label="Country (C)" value={result.subject?.country} />
                  <InfoRow label="State (ST)" value={result.subject?.state} />
                  <InfoRow label="Locality (L)" value={result.subject?.locality} />
                  <InfoRow label="Organization (O)" value={result.subject?.organization} />
                  <InfoRow label="Org Unit (OU)" value={result.subject?.organizationalUnit} />
                  <InfoRow label="Email" value={result.subject?.email} />
                  <InfoRow label="Key Algorithm" value={`RSA ${result.keySize}-bit`} />
                </div>

                {result.sanDns && result.sanDns.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-ink/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink/40 mb-2 block">
                      Subject Alternative Names (SANs) ({result.sanDns.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.sanDns.map((san) => (
                        <span
                          key={san}
                          className="text-xs font-mono font-semibold text-ink bg-cream border border-ink/15 px-2.5 py-1 rounded-lg"
                        >
                          {san}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Certificate Signing Request (CSR) Card */}
              <div className="rounded-2xl border border-ink bg-parchment p-5 shadow-[4px_4px_0px_0px_#10380b]">
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-fern" />
                    <span className="text-xs font-extrabold text-ink uppercase tracking-wider">
                      Certificate Signing Request (CSR)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyButton text={result.csr} label="Copy CSR" />
                    <button
                      type="button"
                      onClick={() => downloadFile(result.csr, `${result.domain}.csr`)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-parchment border border-ink text-ink px-3 py-1.5 rounded-lg hover:shadow-[2px_2px_0px_0px_#10380b] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Download .csr</span>
                    </button>
                  </div>
                </div>
                <textarea
                  readOnly
                  rows={8}
                  value={result.csr}
                  className="w-full bg-cream border border-ink/20 rounded-xl p-3.5 font-mono text-xs text-ink leading-relaxed outline-none select-all resize-y"
                />
                <p className="mt-2 text-[11px] text-ink/50 font-medium">
                  Submit this CSR block to your SSL provider (Let&apos;s Encrypt, DigiCert, Sectigo, ZeroSSL, etc.).
                </p>
              </div>

              {/* Private Key Card */}
              <div className="rounded-2xl border border-ink bg-parchment p-5 shadow-[4px_4px_0px_0px_#10380b]">
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Lock size={15} className="text-amber-800" />
                    <span className="text-xs font-extrabold text-ink uppercase tracking-wider">
                      Private Key (KEEP CONFIDENTIAL)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyButton text={result.privateKey} label="Copy Key" />
                    <button
                      type="button"
                      onClick={() => downloadFile(result.privateKey, `${result.domain}.key`)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-parchment border border-ink text-ink px-3 py-1.5 rounded-lg hover:shadow-[2px_2px_0px_0px_#10380b] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Download .key</span>
                    </button>
                  </div>
                </div>
                <textarea
                  readOnly
                  rows={8}
                  value={result.privateKey}
                  className="w-full bg-cream border border-ink/20 rounded-xl p-3.5 font-mono text-xs text-ink leading-relaxed outline-none select-all resize-y"
                />
                <p className="mt-2 text-[11px] text-red-700 font-semibold">
                  Never share this private key with anyone. Store it securely on your destination server.
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
            Enter your domain name above and click Generate CSR to produce your signing request and private key.
          </motion.div>
        )}
      </div>

      <Footer maxWidth="max-w-6xl" />
    </main>
  );
}

export default function CsrGeneratorPage() {
  return (
    <Suspense>
      <CsrGeneratorInner />
    </Suspense>
  );
}
