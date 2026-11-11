"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
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
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ExternalLink,
  Layers,
  Filter,
  AlertTriangle,
  Globe,
  Radio,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex items-center gap-1 text-[11px] font-bold bg-ink text-cream px-2.5 py-1 rounded-lg hover:shadow-[2px_2px_0px_0px_#10380b] transition-all shrink-0"
    >
      {copied ? <Check size={11} className="text-fern" /> : <Copy size={11} />}
      <span>{copied ? "Copied" : label || "Copy"}</span>
    </button>
  );
}

function SslBadge({ ssl }) {
  if (!ssl) return <span className="text-ink/30 text-xs font-mono">—</span>;

  if (ssl.status === "SECURE") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black bg-fern/20 text-ink border border-fern/50 uppercase tracking-wider">
        <ShieldCheck size={11} className="text-fern" />
        SECURE
      </span>
    );
  }
  if (ssl.status === "EXPIRED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black bg-red-100 text-red-700 border border-red-300 uppercase tracking-wider">
        <ShieldX size={11} className="text-red-600" />
        EXPIRED
      </span>
    );
  }
  if (ssl.status === "MISMATCH") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black bg-marigold/40 text-ink border border-ink/30 uppercase tracking-wider">
        <ShieldAlert size={11} className="text-ink" />
        MISMATCH
      </span>
    );
  }
  if (ssl.status === "NO_SSL" || ssl.status === "NO_CERT") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-ink/5 text-ink/40 border border-ink/15 uppercase tracking-wider">
        NO SSL
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-marigold/30 text-ink border border-ink/20 uppercase tracking-wider">
      <ShieldAlert size={11} />
      {ssl.status}
    </span>
  );
}

function SubdomainFinderInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [domain, setDomain] = useState(() => searchParams.get("domain") || "");
  const [mode, setMode] = useState(() => searchParams.get("mode") || "hybrid");
  const [checkSsl, setCheckSsl] = useState(true);

  // Results split: Active vs Inactive
  const [activeNodes, setActiveNodes] = useState([]);
  const [inactiveNodes, setInactiveNodes] = useState([]);
  const [checked, setChecked] = useState(0);
  const [total, setTotal] = useState(0);
  const [durationMs, setDurationMs] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [scanning, setScanning] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [done, setDone] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [error, setError] = useState(null);

  // Tab switcher: "active" | "inactive"
  const [activeTab, setActiveTab] = useState("active");

  // Filters
  const [filterText, setFilterText] = useState("");
  const [sslFilter, setSslFilter] = useState("all"); // all | secure | expired | nossl

  const abortRef = useRef(null);
  const readerRef = useRef(null);

  useEffect(() => {
    const param = searchParams.get("domain");
    if (param) doScan(param, mode, checkSsl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doScan(targetDomain, scanMode, shouldCheckSsl) {
    const cleaned = targetDomain.trim();
    if (!cleaned) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setScanning(true);
    setStopping(false);
    setDone(false);
    setStopped(false);
    setError(null);
    setActiveNodes([]);
    setInactiveNodes([]);
    setChecked(0);
    setTotal(0);
    setDurationMs(null);
    setStatusMsg("Querying Certificate Transparency & threat intelligence logs...");

    router.replace(
      `?domain=${encodeURIComponent(cleaned)}&mode=${encodeURIComponent(scanMode)}`,
      { scroll: false }
    );

    try {
      const url = `/api/subdomain-finder?domain=${encodeURIComponent(cleaned)}&mode=${encodeURIComponent(scanMode)}&check_ssl=${shouldCheckSsl}`;
      const res = await fetch(url, { signal: controller.signal });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error?.message || "Failed to start subdomain scan");
      }

      const reader = res.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        if (controller.signal.aborted) break;

        let readResult;
        try {
          readResult = await reader.read();
        } catch (readErr) {
          if (controller.signal.aborted || readErr.name === "AbortError") break;
          throw readErr;
        }

        const { done: streamDone, value } = readResult;
        if (streamDone || controller.signal.aborted) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop();

        for (const line of lines) {
          if (controller.signal.aborted) break;
          if (!line.trim()) continue;
          try {
            const msg = JSON.parse(line);
            if (msg.event === "status") {
              setStatusMsg(msg.data.message);
            } else if (msg.event === "init") {
              setTotal(msg.data.total);
              setStatusMsg("");
            } else if (msg.event === "node") {
              const node = msg.data;
              if (node.status === "active") {
                setActiveNodes((prev) => [...prev, node]);
              } else {
                setInactiveNodes((prev) => [...prev, node]);
              }
              setChecked((n) => n + 1);
            } else if (msg.event === "progress") {
              setChecked(msg.data.checked);
            } else if (msg.event === "complete") {
              setDone(true);
              setDurationMs(msg.data.durationMs);
            }
          } catch {
            // ignore malformed line
          }
        }
      }
    } catch (err) {
      if (
        controller.signal.aborted ||
        err.name === "AbortError" ||
        err.message?.includes("aborted")
      ) {
        return;
      }
      setError(err.message || "Scan failed");
    } finally {
      readerRef.current = null;
      setScanning(false);
      setStopping(false);
      setDone(true);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (scanning || stopping) return;
    doScan(domain, mode, checkSsl);
  }

  function handleStop(e) {
    e?.preventDefault();
    e?.stopPropagation();
    if (stopping || !scanning) return;
    setStopping(true);
    setStopped(true);
    if (readerRef.current) {
      readerRef.current.cancel().catch(() => {});
      readerRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }

  const progress = total > 0 ? Math.round((checked / total) * 100) : 0;

  // Check if current results contain SSL evaluation data
  const hasSslData = useMemo(
    () => activeNodes.some((n) => n.ssl !== null),
    [activeNodes]
  );

  // Filtered Active Nodes
  const filteredActive = useMemo(() => {
    return activeNodes.filter((item) => {
      const matchesText =
        filterText === "" ||
        item.subdomain.toLowerCase().includes(filterText.toLowerCase()) ||
        item.ips.some((ip) => ip.includes(filterText)) ||
        (item.ssl?.issuer && item.ssl.issuer.toLowerCase().includes(filterText.toLowerCase()));

      let matchesSsl = true;
      if (sslFilter === "secure") matchesSsl = item.ssl?.status === "SECURE";
      if (sslFilter === "expired") matchesSsl = item.ssl?.status === "EXPIRED";
      if (sslFilter === "nossl") matchesSsl = !item.ssl || item.ssl?.status === "NO_SSL" || item.ssl?.status === "NO_CERT";

      return matchesText && matchesSsl;
    });
  }, [activeNodes, filterText, sslFilter]);

  // Filtered Inactive Nodes
  const filteredInactive = useMemo(() => {
    return inactiveNodes.filter((item) => {
      return (
        filterText === "" ||
        item.subdomain.toLowerCase().includes(filterText.toLowerCase()) ||
        (item.source && item.source.toLowerCase().includes(filterText.toLowerCase()))
      );
    });
  }, [inactiveNodes, filterText]);

  const activeText = useMemo(() => activeNodes.map((n) => n.subdomain).join("\n"), [activeNodes]);
  const inactiveText = useMemo(() => inactiveNodes.map((n) => n.subdomain).join("\n"), [inactiveNodes]);
  const allText = useMemo(
    () => [...activeNodes, ...inactiveNodes].map((n) => n.subdomain).join("\n"),
    [activeNodes, inactiveNodes]
  );

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
            <span className="text-ink">Subdomain Finder</span>
          </div>
          {(scanning || done || stopped) && (
            <div className="flex items-center gap-3 text-xs font-mono font-bold text-ink/60">
              {scanning ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-fern font-black">
                    <span className="w-2 h-2 rounded-full bg-fern animate-pulse" />
                    {activeNodes.length} active
                  </span>
                  <span>·</span>
                  <span className="text-ink/40">{inactiveNodes.length} inactive</span>
                </div>
              ) : stopped ? (
                <span className="flex items-center gap-1.5 text-amber-800 font-bold bg-marigold/30 px-2.5 py-0.5 rounded-md border border-ink/20 font-sans text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  Stopped ({activeNodes.length} active, {inactiveNodes.length} inactive)
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-fern font-black">
                    <span className="w-2 h-2 rounded-full bg-fern" />
                    {activeNodes.length} active
                  </span>
                  <span>·</span>
                  <span className="text-ink/40">{inactiveNodes.length} inactive</span>
                </div>
              )}
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
            <Network size={18} className="text-marigold" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight leading-none">
              Subdomain Finder
            </h1>
            <p className="text-xs text-ink/40 font-semibold mt-0.5">
              Multi-source subdomain reconnaissance via Certificate Transparency logs and DNS resolution
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Domain Input */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="domain"
                  className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2"
                >
                  Root Domain
                </label>
                <input
                  id="domain"
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="pradipta.dev or example.com"
                  disabled={scanning}
                  required
                  className="w-full bg-cream border border-ink/20 rounded-xl px-4 py-2.5 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:border-ink focus:shadow-[3px_3px_0px_0px_#10380b] transition-all disabled:opacity-50"
                />
              </div>

              {/* Scan Mode */}
              <div>
                <label
                  htmlFor="mode"
                  className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2"
                >
                  Discovery Method
                </label>
                <select
                  id="mode"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  disabled={scanning}
                  className="w-full bg-cream border border-ink/20 rounded-xl px-3 py-2.5 font-sans font-bold text-sm text-ink outline-none focus:border-ink focus:shadow-[3px_3px_0px_0px_#10380b] transition-all disabled:opacity-50"
                >
                  <option value="hybrid">Hybrid (CT Logs + Wordlist)</option>
                  <option value="ct">Certificate Transparency Only</option>
                  <option value="bruteforce">DNS Wordlist Only</option>
                </select>
              </div>
            </div>

            {/* Options & Action Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-ink/10">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-ink/70 hover:text-ink">
                <input
                  type="checkbox"
                  checked={checkSsl}
                  onChange={(e) => setCheckSsl(e.target.checked)}
                  disabled={scanning}
                  className="w-4 h-4 accent-ink rounded cursor-pointer"
                />
                <span>Perform TLS Handshake & Certificate Validation (Port 443)</span>
              </label>

              <div className="flex gap-2">
                {scanning ? (
                  <button
                    type="button"
                    onClick={handleStop}
                    disabled={stopping}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-75 text-cream font-bold text-sm px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[2px_2px_0px_0px_#10380b] shrink-0"
                  >
                    {stopping ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Stopping…</span>
                      </>
                    ) : (
                      <>
                        <StopCircle size={15} />
                        <span>Stop Scan</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!domain.trim() || stopping}
                    className="bg-ink text-cream font-bold text-sm px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none shrink-0"
                  >
                    <Search size={14} />
                    <span>Discover Subdomains</span>
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
              <AlertCircle size={15} className="shrink-0 text-red-600 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-ink block">Reconnaissance Failed</span>
                <span className="text-xs text-ink/70 font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Progress Card */}
        <AnimatePresence>
          {(scanning || (done && total > 0)) && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-ink bg-parchment p-4 sm:p-5 shadow-[4px_4px_0px_0px_#10380b] mb-6"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  {scanning ? (
                    <Loader2 size={16} className="animate-spin text-ink shrink-0" />
                  ) : stopped ? (
                    <StopCircle size={18} className="text-amber-700 shrink-0" />
                  ) : (
                    <CheckCircle2 size={18} className="text-fern shrink-0" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-ink block leading-tight">
                      {stopped
                        ? "Scan Stopped by User"
                        : scanning
                        ? statusMsg || "Validating live DNS & SSL nodes..."
                        : "Reconnaissance Complete"}
                    </span>
                    {stopped && (
                      <span className="text-[11px] text-ink/65 font-medium block mt-0.5">
                        Evaluation paused. Preserved {activeNodes.length} active and {inactiveNodes.length} inactive subdomains found so far.
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-bold text-ink/60">
                    {total > 0 ? `${checked}/${total} evaluated (${progress}%)` : "Aggregating sources..."}
                  </span>
                </div>
              </div>

              <div className="w-full bg-ink/10 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    stopped ? "bg-amber-600" : "bg-ink"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Stats badges */}
              <div className="mt-4 pt-3 border-t border-ink/10 flex items-center justify-between gap-3 flex-wrap text-xs font-semibold">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-sage/40 border border-fern/50 text-ink px-3 py-1 rounded-lg font-bold">
                    {activeNodes.length} Active Nodes
                  </span>
                  <span className="bg-cream border border-ink/20 text-ink/70 px-3 py-1 rounded-lg font-bold">
                    {inactiveNodes.length} Inactive Nodes
                  </span>
                  {durationMs && !stopped && (
                    <span className="text-ink/40 font-mono text-[11px]">
                      {(durationMs / 1000).toFixed(1)}s elapsed
                    </span>
                  )}
                  {stopped && (
                    <span className="text-amber-800 font-mono text-[11px] font-bold bg-marigold/30 px-2.5 py-0.5 rounded border border-ink/20">
                      Halted at {checked} of {total}
                    </span>
                  )}
                </div>

                {activeNodes.length + inactiveNodes.length > 0 && (
                  <CopyButton text={allText} label="Copy All Discovered" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results with Two Dedicated Tabs */}
        <AnimatePresence>
          {activeNodes.length + inactiveNodes.length > 0 && (
            <motion.div
              key="results-tabs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Tab Navigation & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-ink bg-parchment p-3 sm:px-5 shadow-[4px_4px_0px_0px_#10380b]">
                {/* Tab Switcher */}
                <div className="flex items-center gap-1.5 bg-cream p-1 rounded-xl border border-ink/15 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab("active")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                      activeTab === "active"
                        ? "bg-ink text-cream shadow-[2px_2px_0px_0px_#10380b]"
                        : "text-ink/60 hover:text-ink"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-fern" />
                    <span>Active Nodes</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                      {activeNodes.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("inactive")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                      activeTab === "inactive"
                        ? "bg-ink text-cream shadow-[2px_2px_0px_0px_#10380b]"
                        : "text-ink/60 hover:text-ink"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-marigold" />
                    <span>Inactive / Historical</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                      {inactiveNodes.length}
                    </span>
                  </button>
                </div>

                {/* Search & Filter */}
                <div className="flex items-center gap-2 flex-1 max-w-md sm:ml-auto">
                  <div className="relative flex-1">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                    <input
                      type="text"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      placeholder={
                        activeTab === "active"
                          ? "Filter active hosts, IP, CA..."
                          : "Filter inactive hosts..."
                      }
                      className="w-full bg-cream border border-ink/15 rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono font-semibold text-ink placeholder:text-ink/30 outline-none focus:border-ink"
                    />
                  </div>

                  {activeTab === "active" && hasSslData && (
                    <div className="flex items-center gap-1 shrink-0">
                      {[
                        { id: "all", label: "All" },
                        { id: "secure", label: "Secure" },
                        { id: "expired", label: "Expired" },
                      ].map((btn) => (
                        <button
                          key={btn.id}
                          type="button"
                          onClick={() => setSslFilter(btn.id)}
                          className={`text-[10px] font-bold px-2 py-1.5 rounded-lg border transition-all ${
                            sslFilter === btn.id
                              ? "bg-ink text-cream border-ink"
                              : "bg-cream text-ink/60 border-ink/15 hover:text-ink"
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* TAB 1: ACTIVE NODES TABLE */}
              {activeTab === "active" && (
                <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b]">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Radio size={16} className="text-fern" />
                      <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                        Active Resolving Hosts ({filteredActive.length} of {activeNodes.length})
                      </span>
                    </div>

                    {activeNodes.length > 0 && (
                      <CopyButton text={activeText} label="Copy Active Subdomains" />
                    )}
                  </div>

                  {filteredActive.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-ink/15">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-cream/60 border-b border-ink/10 font-sans">
                          <tr>
                            <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">
                              Subdomain Host
                            </th>
                            <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">
                              IP Resolution
                            </th>
                            {hasSslData && (
                              <>
                                <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">
                                  SSL Status
                                </th>
                                <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">
                                  Certificate CA
                                </th>
                              </>
                            )}
                            <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px] text-right font-sans">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/8 bg-parchment">
                          {filteredActive.map((item, idx) => (
                            <tr key={idx} className="hover:bg-cream/50 transition-colors">
                              <td className="py-2.5 px-3 font-bold text-ink">
                                <a
                                  href={`https://${item.subdomain}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:underline flex items-center gap-1 group"
                                >
                                  <span>{item.subdomain}</span>
                                  <ExternalLink
                                    size={10}
                                    className="text-ink/30 group-hover:text-ink transition-colors"
                                  />
                                </a>
                              </td>
                              <td className="py-2.5 px-3 text-ink/70 text-[11px]">
                                {item.ips.join(", ")}
                              </td>
                              {hasSslData && (
                                <>
                                  <td className="py-2.5 px-3">
                                    <SslBadge ssl={item.ssl} />
                                  </td>
                                  <td className="py-2.5 px-3 text-ink/60 text-[11px] truncate max-w-[180px]">
                                    {item.ssl?.issuer || "—"}
                                  </td>
                                </>
                              )}
                              <td className="py-2.5 px-3 text-right">
                                <CopyButton text={item.subdomain} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs font-semibold text-ink/40">
                      No active subdomains match the current filter.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: INACTIVE / HISTORICAL NODES TABLE */}
              {activeTab === "inactive" && (
                <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b] space-y-4">
                  {/* Context Banner */}
                  <div className="rounded-xl border border-ink/20 bg-marigold/15 p-3.5 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-ink shrink-0 mt-0.5" />
                    <div className="text-xs text-ink/75 font-medium leading-relaxed">
                      <strong className="text-ink font-bold block mb-0.5">
                        Historical Certificate Transparency Records
                      </strong>
                      These subdomains were historically issued public SSL certificates or logged in threat intelligence feeds, but currently have no active DNS A records (<code className="font-mono bg-cream px-1 rounded">NXDOMAIN</code>). Useful for detecting orphaned services or dangling DNS records.
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Layers size={16} className="text-ink/60" />
                      <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                        Historical Inactive Nodes ({filteredInactive.length} of {inactiveNodes.length})
                      </span>
                    </div>

                    {inactiveNodes.length > 0 && (
                      <CopyButton text={inactiveText} label="Copy Inactive Subdomains" />
                    )}
                  </div>

                  {filteredInactive.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-ink/15">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-cream/60 border-b border-ink/10 font-sans">
                          <tr>
                            <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">
                              Subdomain Host
                            </th>
                            <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">
                              Discovery Source
                            </th>
                            <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">
                              DNS Status
                            </th>
                            <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px] text-right font-sans">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/8 bg-parchment">
                          {filteredInactive.map((item, idx) => (
                            <tr key={idx} className="hover:bg-cream/50 transition-colors">
                              <td className="py-2.5 px-3 font-bold text-ink/80">
                                {item.subdomain}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-ink/5 text-ink/60 border border-ink/15 uppercase tracking-wider font-sans">
                                  {item.source === "threat_intel" ? "Threat Intel" : "CT Log"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ink/40 uppercase tracking-wider">
                                  <XCircle size={11} className="text-red-500" />
                                  Unresolved (NXDOMAIN)
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <CopyButton text={item.subdomain} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs font-semibold text-ink/40">
                      No inactive subdomains match the current filter.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Zero results */}
          {done && !stopped && activeNodes.length + inactiveNodes.length === 0 && !error && (
            <motion.div
              key="zero-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-ink/20 bg-parchment p-8 text-center shadow-[4px_4px_0px_0px_#10380b]"
            >
              <XCircle size={32} className="text-ink/20 mx-auto mb-2" />
              <p className="text-base font-bold text-ink/50">
                No subdomains identified across all intelligence sources.
              </p>
              <p className="text-xs text-ink/40 font-medium mt-1">
                Verify the domain spelling or try running with the DNS Wordlist mode.
              </p>
            </motion.div>
          )}

          {/* Stopped with zero results */}
          {stopped && activeNodes.length + inactiveNodes.length === 0 && (
            <motion.div
              key="stopped-zero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-ink/20 bg-parchment p-8 text-center shadow-[4px_4px_0px_0px_#10380b]"
            >
              <StopCircle size={32} className="text-amber-600 mx-auto mb-2" />
              <p className="text-base font-bold text-ink/70">
                Scan stopped before results were discovered.
              </p>
              <p className="text-xs text-ink/40 font-medium mt-1">
                You can start a new scan anytime using the form above.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state before scan */}
        {!scanning && !done && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-center py-16 text-sm font-semibold text-ink/30"
          >
            Enter a domain above to map active and historical subdomains.
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
