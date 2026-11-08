"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Search,
  Loader2,
  ChevronRight,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ── constants ───────────────────────────────────────────────────────────────

const RECORD_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA"];

// ── helpers ──────────────────────────────────────────────────────────────────

function isIPv4(str) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(str);
}
function extractIPv4(str) {
  return str.match(/\b(\d{1,3}\.){3}\d{1,3}\b/g) || [];
}
function reverseIPv4(ip) {
  return ip.split(".").reverse().join(".");
}
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function isExpiringSoon(iso) {
  if (!iso) return false;
  return new Date(iso) - Date.now() < 30 * 24 * 60 * 60 * 1000;
}
function ttlLabel(s) {
  if (s >= 3600) return `${s / 3600}h`;
  if (s >= 60) return `${Math.round(s / 60)}m`;
  return `${s}s`;
}

// ── WhoisCard ────────────────────────────────────────────────────────────────

function WhoisRow({ label, value, highlight, wide }) {
  return (
    <div className={`flex flex-col gap-1 ${wide ? "md:col-span-2" : ""}`}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">
        {label}
      </span>
      <span
        className={`break-all text-sm font-semibold ${
          highlight ? "text-red-600" : "text-ink"
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function WhoisCard({ whois }) {
  if (!whois) return null;
  return (
    <div className="rounded-2xl border border-ink bg-parchment p-5 shadow-[4px_4px_0px_0px_#10380b]">
      <div className="flex items-center gap-2 mb-4">
        <span className="font-black text-xs uppercase tracking-widest text-ink/50">
          WHOIS / RDAP
        </span>
        <div className="flex-1 h-px bg-ink/10" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <WhoisRow label="Domain"       value={whois.domain} />
        <WhoisRow label="Handle"       value={whois.handle} />
        <WhoisRow label="Registrar"    value={whois.registrar} />
        <WhoisRow label="Registrant"   value={whois.registrant} />
        <WhoisRow label="Registered"   value={fmtDate(whois.events?.registration)} />
        <WhoisRow
          label="Expires"
          value={fmtDate(whois.events?.expiration)}
          highlight={isExpiringSoon(whois.events?.expiration)}
        />
        <WhoisRow label="Last Changed" value={fmtDate(whois.events?.lastChanged)} />
        {whois.nameservers?.length > 0 && (
          <WhoisRow
            label="Name Servers"
            value={whois.nameservers.join(", ")}
            wide
          />
        )}
        {whois.status?.length > 0 && (
          <div className="md:col-span-2 flex flex-wrap gap-1.5 pt-1">
            {whois.status.map((s) => (
              <span
                key={s}
                className="text-[10px] font-bold bg-sage text-ink px-2.5 py-0.5 rounded-full border border-ink/20 uppercase tracking-wide"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── RecordCard ────────────────────────────────────────────────────────────────

function RecordCard({ type, answers }) {
  return (
    <div className="rounded-2xl border border-ink bg-parchment p-5 shadow-[4px_4px_0px_0px_#10380b]">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-marigold text-ink font-black text-xs px-3 py-0.5 rounded-full uppercase tracking-wider shadow-[2px_2px_0px_0px_#10380b]">
          {type}
        </span>
        <span className="text-xs text-ink/40 font-semibold">
          {answers.length} record{answers.length > 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-2">
        {answers.map((rec, i) => (
          <div
            key={i}
            className="rounded-xl border border-ink/15 bg-cream px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-bold text-ink/40 truncate">
                {rec.name}
              </span>
              {rec.TTL != null && (
                <span className="text-[10px] font-bold text-ink/35 bg-ink/8 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                  TTL {ttlLabel(rec.TTL)}
                </span>
              )}
            </div>
            <code className="block text-sm font-mono text-ink break-all leading-relaxed">
              {rec.data}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PTR card ──────────────────────────────────────────────────────────────────

function PtrCard({ ptrResults }) {
  if (!ptrResults?.length) return null;
  return (
    <div className="rounded-2xl border border-ink bg-parchment p-5 shadow-[4px_4px_0px_0px_#10380b]">
      <div className="flex items-center gap-2 mb-4">
        <span className="font-black text-xs uppercase tracking-widest text-ink/50">
          PTR Records (Reverse DNS)
        </span>
        <div className="flex-1 h-px bg-ink/10" />
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {ptrResults.map(({ ip, ptr }) => (
          <div
            key={ip}
            className="rounded-xl border border-ink/15 bg-cream px-3 py-2.5"
          >
            <div className="text-[10px] font-bold text-ink/40 mb-1">{ip}</div>
            <code className="text-sm font-mono text-ink break-all">{ptr}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── inner page ────────────────────────────────────────────────────────────────

function DNSLookupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [input, setInput]       = useState(() => searchParams.get("domain") || "");
  const [results, setResults]   = useState(null);
  const [ptrResults, setPtrResults] = useState(null);
  const [whois, setWhois]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [queried, setQueried]   = useState(""); // domain that was last looked up

  useEffect(() => {
    const p = searchParams.get("domain");
    if (p) {
      doLookup(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doLookup(target) {
    const domain = target.trim().toLowerCase();
    if (!domain) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setPtrResults(null);
    setWhois(null);
    setQueried(domain);

    // push ?domain= into URL without navigation
    router.replace(`?domain=${encodeURIComponent(domain)}`, { scroll: false });

    try {
      const queries = RECORD_TYPES.map((type) =>
        fetch(
          `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`
        )
          .then((r) => r.json())
          .then((data) => ({ type, data }))
      );

      const [allResults, whoisData] = await Promise.all([
        Promise.all(queries),
        fetch(`/api/whois?domain=${encodeURIComponent(domain)}`)
          .then((r) => r.json())
          .catch(() => null),
      ]);

      const parsedWhois = whoisData?.success
        ? whoisData.data
        : whoisData?.error
        ? null
        : whoisData;
      setWhois(parsedWhois);

      const valid = allResults.filter(
        (r) => r.data.Status === 0 && r.data.Answer
      );

      if (valid.length === 0) {
        setError("No DNS records found for this domain.");
      } else {
        setResults(valid);

        // collect IPs for PTR lookup
        const ips = new Set();
        valid.forEach(({ type, data }) => {
          if (type === "A")
            data.Answer.forEach((rec) => {
              if (isIPv4(rec.data)) ips.add(rec.data);
            });
          if (type === "TXT")
            data.Answer.forEach((rec) =>
              extractIPv4(rec.data).forEach((ip) => ips.add(ip))
            );
        });

        if (ips.size > 0) {
          const ptrData = await Promise.all(
            Array.from(ips).map((ip) =>
              fetch(
                `https://dns.google/resolve?name=${reverseIPv4(ip)}.in-addr.arpa&type=PTR`
              )
                .then((r) => r.json())
                .then((d) => ({ ip, ptr: d.Answer?.[0]?.data || null }))
                .catch(() => ({ ip, ptr: null }))
            )
          );
          setPtrResults(ptrData.filter((r) => r.ptr));
        }
      }
    } catch {
      setError("Failed to fetch DNS data.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    doLookup(input);
  }

  const totalRecords = results?.reduce(
    (n, { data }) => n + (data.Answer?.length ?? 0),
    0
  ) ?? 0;

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar maxWidth="max-w-6xl" />

      {/* sticky sub-header */}
      <div className="sticky top-[53px] z-10 border-b border-ink/15 bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-ink/40 text-xs font-bold">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <ChevronRight size={11} />
            <Link href="/tools" className="hover:text-ink transition-colors">Tools</Link>
            <ChevronRight size={11} />
            <span className="text-ink">DNS Lookup</span>
          </div>
          {queried && (
            <span className="text-xs font-mono font-bold text-ink/50 truncate">
              {queried}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 pt-10 pb-20">

        {/* page title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 bg-ink rounded-xl flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#10380b]">
            <Globe size={18} className="text-marigold" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight leading-none">
              DNS Lookup
            </h1>
            <p className="text-xs text-ink/40 font-semibold mt-0.5">
              Check DNS records from a domain
            </p>
          </div>
        </motion.div>

        {/* form */}
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
            Domain Name
          </label>
          <div className="flex gap-2">
            <input
              id="domain"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="example.com"
              disabled={loading}
              className="flex-1 bg-parchment border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] transition-shadow disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-ink text-cream font-bold text-sm px-5 py-3 rounded-xl flex items-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none shrink-0"
            >
              {loading
                ? <Loader2 size={15} className="animate-spin" />
                : <Search size={15} />}
              {loading ? "Looking up…" : "Lookup DNS"}
            </button>
          </div>
        </motion.form>

        {/* error */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 bg-parchment border border-ink rounded-xl px-4 py-3 mb-6"
            >
              <AlertCircle size={15} className="shrink-0 text-ink/60 mt-0.5" />
              <span className="text-sm font-semibold text-ink">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* results */}
        <AnimatePresence>
          {results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* summary row */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="bg-marigold text-ink font-black px-4 py-1.5 rounded-full text-sm shadow-[3px_3px_0px_0px_#10380b]">
                  {queried}
                </span>
                <span className="text-xs text-ink/40 font-semibold">
                  {totalRecords} record{totalRecords !== 1 ? "s" : ""} across{" "}
                  {results.length} type{results.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => doLookup(queried)}
                  className="ml-auto flex items-center gap-1.5 text-xs font-bold text-ink/40 hover:text-ink transition-colors"
                >
                  <RotateCcw size={11} />
                  Refresh
                </button>
              </div>

              {/* whois */}
              <WhoisCard whois={whois} />

              {/* PTR */}
              <PtrCard ptrResults={ptrResults} />

              {/* DNS record grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {results.map(({ type, data }) => (
                  <RecordCard key={type} type={type} answers={data.Answer} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* empty state */}
        {!results && !loading && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16 text-sm font-semibold text-ink/30"
          >
            Enter a domain above to see its DNS records and WHOIS info.
          </motion.p>
        )}
      </div>

      <Footer />
    </main>
  );
}

// ── page export (Suspense required for useSearchParams) ───────────────────────

export default function DnsLookupPage() {
  return (
    <Suspense>
      <DNSLookupInner />
    </Suspense>
  );
}
