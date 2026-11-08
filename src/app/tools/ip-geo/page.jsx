"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  Loader2,
  ChevronRight,
  AlertCircle,
  RotateCcw,
  Compass,
  Building2,
  Navigation,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-cream/60 font-mono text-xs font-bold text-ink/40">
      Loading interactive map…
    </div>
  ),
});

// ── helpers ──────────────────────────────────────────────────────────────────

function normalizeIP(d) {
  return {
    query: d.ip,
    country: d.country,
    countryCode: d.countryCode || d.country_code,
    region: d.region || d.region_code,
    regionName: d.regionName || d.region,
    city: d.city,
    zip: d.zip || d.postal,
    lat: d.latitude != null ? d.latitude : d.lat,
    lon: d.longitude != null ? d.longitude : d.lon,
    timezone: d.timezone?.id || d.timezone,
    isp: d.isp || d.connection?.isp,
    org: d.org || d.connection?.org,
    as: d.as || (d.connection?.asn ? `AS${d.connection.asn} ${d.connection.org || ""}`.trim() : ""),
    flag: d.flag || d.flag?.emoji || null,
  };
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-ink/8 last:border-0">
      <span className="text-[11px] font-bold text-ink/45 uppercase tracking-wide shrink-0 mt-0.5 w-32">
        {label}
      </span>
      <span
        className={`text-sm font-semibold text-ink text-right break-all ${
          mono ? "font-mono" : ""
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

// ── inner component ──────────────────────────────────────────────────────────

function IPGeoInner() {
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
    const cleaned = (target || "").trim();
    setLoading(true);
    setError(null);
    setResult(null);

    if (cleaned) {
      router.replace(`?ip=${encodeURIComponent(cleaned)}`, { scroll: false });
    }

    try {
      // Use internal standardized API (which proxies upstream with rate limiting & CORS)
      const endpoint = cleaned
        ? `/api/ip-geo?ip=${encodeURIComponent(cleaned)}`
        : `/api/ip-geo`;

      const res = await fetch(endpoint);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Invalid IP address or not found");
      }

      const normalized = normalizeIP(json.data);
      setResult(normalized);
      setQueriedIp(normalized.query);
      if (!cleaned) {
        setIp(normalized.query);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch geolocation data");
    } finally {
      setLoading(false);
    }
  }

  function handleCheckIP(e) {
    e.preventDefault();
    if (!ip.trim()) return;
    doCheck(ip);
  }

  function handleCheckMyIP() {
    setIp("");
    doCheck("");
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
            <span className="text-ink">IP Geolocation</span>
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
            <MapPin size={18} className="text-marigold" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight leading-none">
              IP Geolocation
            </h1>
            <p className="text-xs text-ink/40 font-semibold mt-0.5">
              Check geographic location, ASN, and network routing of any IP
            </p>
          </div>
        </motion.div>

        {/* Input Form */}
        <motion.form
          onSubmit={handleCheckIP}
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
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              id="ip"
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="8.8.8.8 or leave empty for your IP"
              disabled={loading}
              className="flex-1 bg-parchment border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] transition-shadow disabled:opacity-50"
            />
            <div className="flex gap-2">
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
                {loading ? "Checking…" : "Check IP"}
              </button>

              <button
                type="button"
                onClick={handleCheckMyIP}
                disabled={loading}
                className="bg-parchment border border-ink text-ink font-bold text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#10380b] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Navigation size={14} className="text-ink/70" />
                Check My IP
              </button>
            </div>
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
              {/* Result badge header */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-2 bg-marigold text-ink font-black px-4 py-1.5 rounded-full text-sm shadow-[3px_3px_0px_0px_#10380b]">
                  {result.flag ? <span className="text-base">{result.flag}</span> : null}
                  {result.query}
                </span>
                <span className="text-xs text-ink/50 font-semibold">
                  {result.city ? `${result.city}, ` : ""}
                  {result.country}
                </span>
                <button
                  onClick={() => doCheck(result.query)}
                  className="ml-auto flex items-center gap-1.5 text-xs font-bold text-ink/40 hover:text-ink transition-colors"
                >
                  <RotateCcw size={11} />
                  Refresh
                </button>
              </div>

              {/* Grid: Details Card & Interactive Map Card */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Geolocation Details Card */}
                <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b]">
                  <div className="flex items-center gap-2 mb-4">
                    <Compass size={16} className="text-ink" />
                    <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                      Geolocation Details
                    </span>
                    <div className="flex-1 h-px bg-ink/10" />
                  </div>

                  <div className="space-y-0.5">
                    <InfoRow label="IP Address" value={result.query} mono />
                    <InfoRow
                      label="Country"
                      value={
                        result.country
                          ? `${result.country} (${result.countryCode})`
                          : "—"
                      }
                    />
                    <InfoRow
                      label="Region / State"
                      value={
                        result.regionName
                          ? `${result.regionName} (${result.region})`
                          : "—"
                      }
                    />
                    <InfoRow label="City" value={result.city} />
                    <InfoRow label="Postal / ZIP" value={result.zip || "N/A"} mono />
                    <InfoRow label="Timezone" value={result.timezone} />
                    <InfoRow
                      label="Coordinates"
                      value={
                        result.lat != null && result.lon != null
                          ? `${result.lat}, ${result.lon}`
                          : "—"
                      }
                      mono
                    />
                    <InfoRow label="ISP" value={result.isp} />
                    <InfoRow label="Organization" value={result.org} />
                    <InfoRow label="AS Number" value={result.as} mono />
                  </div>
                </div>

                {/* Location Map Card */}
                <div className="rounded-2xl border border-ink bg-parchment p-5 sm:p-6 shadow-[4px_4px_0px_0px_#10380b] flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Navigation size={16} className="text-ink" />
                    <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                      Location Map
                    </span>
                    <div className="flex-1 h-px bg-ink/10" />
                  </div>

                  <div className="h-[360px] sm:h-[420px] w-full rounded-xl border border-ink overflow-hidden shadow-[2px_2px_0px_0px_#10380b]">
                    {result.lat != null && result.lon != null ? (
                      <Map
                        lat={result.lat}
                        lon={result.lon}
                        label={`${result.city || ""}, ${result.country || ""}`}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-cream/60 text-xs font-bold text-ink/40">
                        No coordinates available for mapping.
                      </div>
                    )}
                  </div>
                </div>
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
            Enter an IP address above or click &ldquo;Check My IP&rdquo; to locate geographic coordinates and network routing.
          </motion.div>
        )}
      </div>

      <Footer maxWidth="max-w-6xl" />
    </main>
  );
}

// ── export default with Suspense ─────────────────────────────────────────────

export default function IPGeoPage() {
  return (
    <Suspense>
      <IPGeoInner />
    </Suspense>
  );
}
