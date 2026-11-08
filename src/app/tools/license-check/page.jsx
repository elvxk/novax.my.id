"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Search,
  Loader2,
  ChevronRight,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Server,
  Layers,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TARGET_ORDER = ["cpanel", "cloudlinux", "imunify"];

function openCentered(url, name, width = 900, height = 720) {
  if (typeof window === "undefined") return;
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);
  window.open(
    url,
    name,
    `popup=yes,width=${width},height=${height},left=${Math.round(left)},top=${Math.round(top)}`
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }) {
  const s = status || "";
  let badgeStyle = "bg-ink/8 text-ink/40 border-ink/15";
  let label = "Not found";

  if (/^active|active on/i.test(s)) {
    badgeStyle = "bg-fern/20 text-ink border-fern/50 font-black";
    label = "Active";
  } else if (/expired/i.test(s)) {
    badgeStyle = "bg-red-100 text-red-700 border-red-300 font-bold";
    label = "Expired";
  } else if (/removed/i.test(s)) {
    badgeStyle = "bg-marigold text-ink border-ink/30 font-bold";
    label = "Removed";
  } else if (/^registered/i.test(s)) {
    badgeStyle = "bg-sage text-ink border-ink/20 font-bold";
    label = "Registered";
  }

  return (
    <span
      className={`inline-block text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeStyle}`}
      title={s || undefined}
    >
      {label}
    </span>
  );
}

function ProductCard({ label, license }) {
  return (
    <div className="rounded-xl border border-ink/15 bg-cream p-4 flex flex-col justify-between gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-extrabold text-sm text-ink truncate">
          {license?.productLabel || label}
        </span>
        <StatusBadge status={license?.status} />
      </div>

      {license ? (
        <div className="space-y-1 text-xs text-ink/70">
          {license.hostname && (
            <div className="font-mono text-[11px] text-ink/50 break-all">
              {license.hostname}
            </div>
          )}
          {license.source !== "registry" && license.package && (
            <div className="font-medium text-ink break-all">
              {license.package}
            </div>
          )}
          <div className="text-[11px] text-ink/55 font-semibold">
            {license.typeLabel || license.activity || "Registered instance"}
          </div>
        </div>
      ) : (
        <span className="text-xs text-ink/35 font-medium">
          No license recorded for this service
        </span>
      )}
    </div>
  );
}

// ── inner component ──────────────────────────────────────────────────────────

function LicenseCheckInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ip, setIp] = useState(() => searchParams.get("ip") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queriedIp, setQueriedIp] = useState("");

  useEffect(() => {
    const paramIp = searchParams.get("ip");
    if (paramIp) {
      doCheck(paramIp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doCheck(target) {
    const cleaned = target.trim();
    if (!cleaned) return;

    setLoading(true);
    setError(null);
    setResult(null);

    router.replace(`?ip=${encodeURIComponent(cleaned)}`, { scroll: false });

    try {
      const res = await fetch(`/api/license-check?ip=${encodeURIComponent(cleaned)}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to check license");
      }

      const data = json.data;

      // PTR lookup via public Google DoH
      try {
        const rev = `${cleaned.split(".").reverse().join(".")}.in-addr.arpa`;
        const doh = await fetch(
          `https://dns.google/resolve?name=${encodeURIComponent(rev)}&type=PTR`
        ).then((r) => r.json());
        data.ptr = doh.Answer?.[0]?.data || null;
      } catch {
        data.ptr = null;
      }

      setResult(data);
      setQueriedIp(data.ip);
    } catch (err) {
      setError(err.message || "Failed to reach license verification servers");
    } finally {
      setLoading(false);
    }
  }

  function handleCheck(e) {
    e.preventDefault();
    if (!ip.trim()) return;
    doCheck(ip);
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
            <span className="text-ink">License Checker</span>
          </div>
          {queriedIp && (
            <span className="text-xs font-mono font-bold text-ink/50 truncate">
              {queriedIp}
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
            <Key size={18} className="text-marigold" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight leading-none">
              License Checker
            </h1>
            <p className="text-xs text-ink/40 font-semibold mt-0.5">
              Verify cPanel, CloudLinux, Imunify, and JetBackup license registrations from any IP address
            </p>
          </div>
        </motion.div>

        {/* Input Form */}
        <motion.form
          onSubmit={handleCheck}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
          className="mb-8"
        >
          <label
            htmlFor="ip"
            className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2"
          >
            IP Address
          </label>
          <div className="flex gap-2.5">
            <input
              id="ip"
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="8.8.8.8"
              disabled={loading}
              className="flex-1 bg-parchment border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] transition-shadow disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !ip.trim()}
              className="bg-ink text-cream font-bold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none shrink-0"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Search size={15} />
              )}
              {loading ? "Checking…" : "Check License"}
            </button>
          </div>
        </motion.form>

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
              <span className="text-sm font-semibold text-ink">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result view */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Summary row */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="bg-marigold text-ink font-black px-4 py-1.5 rounded-full text-sm shadow-[3px_3px_0px_0px_#10380b]">
                  {result.ip}
                </span>
                {result.ptr && (
                  <span className="text-xs font-mono font-semibold text-ink/50 truncate">
                    {result.ptr}
                  </span>
                )}
                <span className="text-xs font-bold px-3 py-1 rounded-full border border-ink/20 bg-parchment text-ink/70">
                  {result.licensed ? "Licenses Registered" : "No Registered Licenses"}
                </span>
                <button
                  onClick={() => doCheck(result.ip)}
                  className="ml-auto flex items-center gap-1.5 text-xs font-bold text-ink/40 hover:text-ink transition-colors"
                >
                  <RotateCcw size={11} />
                  Refresh
                </button>
              </div>

              {/* License Status Card: 4 Product Cards Grid */}
              <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b]">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck size={16} className="text-ink" />
                  <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                    Product License Status
                  </span>
                  <div className="flex-1 h-px bg-ink/10" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {TARGET_ORDER.map((key) => (
                    <ProductCard
                      key={key}
                      label={result.labels[key]}
                      license={result.products[key]}
                    />
                  ))}

                  {/* JetBackup Verification Card with Popup trigger */}
                  <div className="rounded-xl border border-ink/15 bg-cream p-4 flex flex-col justify-between gap-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-sm text-ink">
                        JetBackup
                      </span>
                      <span className="text-[10px] font-bold text-ink/40 uppercase">
                        External Verify
                      </span>
                    </div>
                    <p className="text-xs text-ink/65 font-medium leading-relaxed">
                      JetBackup maintains a dedicated billing registry. Verify license status directly on their portal:
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        openCentered(
                          `https://billing.jetbackup.com/verify.php?ip=${encodeURIComponent(result.ip)}`,
                          "jetbackup-verify",
                          900,
                          720
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 bg-ink text-cream font-bold text-xs px-4 py-2 rounded-lg hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#10380b] transition-all duration-150"
                    >
                      <span>Verify JetBackup License</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>

                {!result.licensed && (
                  <p className="mt-4 text-xs font-semibold text-ink/40">
                    No active license registrations found on authoritative registries for this IP.
                  </p>
                )}
              </div>

              {/* License History (from cPanel verification) */}
              {result.licenses?.length > 0 && (
                <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b]">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Layers size={16} className="text-ink" />
                      <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                        License History (cPanel Verify)
                      </span>
                    </div>
                    <a
                      href={`https://verify.cpanel.net/app/verify?ip=${encodeURIComponent(result.ip)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-ink/60 hover:text-ink transition-colors"
                      title="Open verify.cpanel.net"
                    >
                      <span>verify.cpanel.net</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-ink/15">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-cream/60 border-b border-ink/10">
                        <tr>
                          <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">
                            Product
                          </th>
                          <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">
                            Package
                          </th>
                          <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">
                            Partner NOC
                          </th>
                          <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">
                            Activity
                          </th>
                          <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/8 bg-parchment">
                        {result.licenses.map((lic, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 px-3 font-bold text-ink">
                              {lic.product}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-ink/70 break-all text-[11px]">
                              {lic.package}
                            </td>
                            <td className="py-2.5 px-3 text-ink/65 font-medium">
                              {lic.partnerNoc}
                            </td>
                            <td className="py-2.5 px-3 text-ink/65 font-medium">
                              {lic.activity}
                            </td>
                            <td className="py-2.5 px-3">
                              <StatusBadge status={lic.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CloudLinux Registry Table */}
              {(result.registry?.error ||
                result.registry?.instances?.length > 0) && (
                <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b]">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Server size={16} className="text-ink" />
                      <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                        CloudLinux Registry Instances
                      </span>
                    </div>
                    <a
                      href={`https://cln.cloudlinux.com/console/check-license?ip=${encodeURIComponent(result.ip)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-ink/60 hover:text-ink transition-colors"
                      title="Open console.cloudlinux.com"
                    >
                      <span>cln.cloudlinux.com</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  {result.registry.error ? (
                    <p className="text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                      {result.registry.error}
                    </p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-ink/15">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-cream/60 border-b border-ink/10">
                          <tr>
                            <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">
                              Product
                            </th>
                            <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">
                              License Type
                            </th>
                            <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">
                              Hostname
                            </th>
                            <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">
                              Registered
                            </th>
                            <th className="py-2.5 px-3 font-bold text-ink uppercase tracking-wider text-[10px]">
                              Last Check-in
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/8 bg-parchment">
                          {result.registry.instances.map((inst, idx) => (
                            <tr key={idx}>
                              <td className="py-2.5 px-3 font-bold text-ink">
                                {inst.productLabel}
                              </td>
                              <td className="py-2.5 px-3 text-ink/70 font-medium">
                                {inst.typeLabel}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-ink/60 break-all">
                                {inst.hostname}
                              </td>
                              <td className="py-2.5 px-3 text-ink/70 font-medium whitespace-nowrap">
                                {formatDate(inst.registered)}
                              </td>
                              <td className="py-2.5 px-3 text-ink/70 font-medium whitespace-nowrap">
                                {formatDate(inst.checkin)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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
            Enter an IP address above to verify software license registrations.
          </motion.div>
        )}
      </div>

      <Footer maxWidth="max-w-6xl" />
    </main>
  );
}

// ── export default with Suspense ─────────────────────────────────────────────

export default function LicenseCheckPage() {
  return (
    <Suspense>
      <LicenseCheckInner />
    </Suspense>
  );
}
