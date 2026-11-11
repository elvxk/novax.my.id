"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Terminal,
  ChevronRight,
  Sparkles,
  BookOpen,
  Shield,
  Globe,
  MapPin,
  Key,
  Mail,
  Eye,
  Lock,
  Network,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnvelopeSection from "./_components/EnvelopeSection";
import RateLimitSection from "./_components/RateLimitSection";
import DnsLookup from "./_components/endpoints/DnsLookup";
import Whois from "./_components/endpoints/Whois";
import IpGeo from "./_components/endpoints/IpGeo";
import LicenseCheck from "./_components/endpoints/LicenseCheck";
import SmtpSender from "./_components/endpoints/SmtpSender";
import ProxyViewer from "./_components/endpoints/ProxyViewer";
import SslChecker from "./_components/endpoints/SslChecker";
import SubdomainFinder from "./_components/endpoints/SubdomainFinder";

// ── sidebar config ────────────────────────────────────────────────────────────

const RAW_ENDPOINTS = [
  { id: "dns-lookup",       title: "DNS Lookup",         icon: Globe,    method: "GET",  toolId: "dns-lookup",       live: true },
  { id: "whois",            title: "WHOIS / RDAP",       icon: Globe,    method: "GET",  toolId: "dns-lookup",       live: true },
  { id: "ip-geo",           title: "IP Geolocation",     icon: MapPin,   method: "GET",  toolId: "ip-geo",           live: true },
  { id: "license-check",    title: "License Check",      icon: Key,      method: "GET",  toolId: "license-check",    live: true },
  { id: "smtp-sender",      title: "SMTP Sender",        icon: Mail,     method: "POST", toolId: "smtp-sender",      live: true },
  { id: "proxy-viewer",     title: "Proxy Viewer",       icon: Eye,      method: "GET",  toolId: "proxy-viewer",     live: true },
  { id: "ssl-checker",      title: "SSL Checker",        icon: Lock,     method: "GET",  toolId: "ssl-checker",      live: true },
  { id: "subdomain-finder", title: "Subdomain Finder",   icon: Network,  method: "GET",  toolId: "subdomain-finder", live: true },
];

const ENDPOINT_COMPONENTS = {
  "dns-lookup": DnsLookup,
  "whois": Whois,
  "ip-geo": IpGeo,
  "license-check": LicenseCheck,
  "smtp-sender": SmtpSender,
  "proxy-viewer": ProxyViewer,
  "ssl-checker": SslChecker,
  "subdomain-finder": SubdomainFinder,
};

const METHOD_BADGE = {
  GET:  "bg-fern/20 text-fern border-fern/30",
  POST: "bg-marigold/60 text-ink border-marigold",
};

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ nav, activeId, onSelect }) {
  return (
    <nav className="space-y-6">
      {nav.map((group) => (
        <div key={group.label}>
          <p className="text-[10px] font-black uppercase tracking-widest text-ink/40 mb-2 px-1">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map(({ id, title, icon: Icon, method, live }) => (
              <li key={id}>
                <button
                  onClick={() => { scrollTo(id); onSelect(id); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-sm font-semibold transition-all ${
                    activeId === id
                      ? "bg-ink text-cream shadow-[3px_3px_0px_0px_#10380b]"
                      : "text-ink/70 hover:bg-ink/8 hover:text-ink"
                  }`}
                >
                  <Icon size={13} className="shrink-0" />
                  <span className="flex-1 truncate">{title}</span>
                  {live === false ? (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded border tracking-wider bg-amber-100 text-amber-800 border-amber-300">
                      MAINTENANCE
                    </span>
                  ) : method ? (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded border tracking-wider ${
                        activeId === id
                          ? "bg-cream/20 text-cream border-cream/30"
                          : (METHOD_BADGE[method] ?? "bg-ink/10 text-ink border-ink/20")
                      }`}
                    >
                      {method}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function ApiDocsPage() {
  const [activeId, setActiveId] = useState("envelope");
  const [openId, setOpenId] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toolDefs, setToolDefs] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync endpoint statuses dynamically with PostgreSQL database
  useEffect(() => {
    fetch("/api/tools?all=true")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setToolDefs(json.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoaded(true);
      });
  }, []);

  // Compute endpoints based on live database status (disabled tools are completely excluded)
  const visibleEndpoints = useMemo(() => {
    // Before database response, use baseline endpoints without flicker
    if (!isLoaded || toolDefs.length === 0) {
      return RAW_ENDPOINTS;
    }

    return RAW_ENDPOINTS.filter((ep) => {
      const tool = toolDefs.find((t) => t.id === ep.toolId);
      // Tool must exist in database and must NOT be disabled
      return tool && !tool.disabled;
    }).map((ep) => {
      const tool = toolDefs.find((t) => t.id === ep.toolId);
      return {
        ...ep,
        live: tool ? tool.live : true,
      };
    });
  }, [isLoaded, toolDefs]);

  const liveEndpoints = useMemo(
    () => visibleEndpoints.filter((ep) => ep.live),
    [visibleEndpoints]
  );

  // Only compute maintenance group after database has loaded (prevents flash of maintenance group)
  const maintenanceEndpoints = useMemo(
    () => (isLoaded ? visibleEndpoints.filter((ep) => !ep.live) : []),
    [isLoaded, visibleEndpoints]
  );

  const nav = useMemo(
    () => [
      {
        label: "Overview",
        items: [
          { id: "envelope", title: "Response Envelope", icon: BookOpen },
          { id: "rate-limit", title: "Rate Limiting", icon: Shield },
        ],
      },
      {
        label: "Endpoints",
        items: liveEndpoints,
      },
      ...(maintenanceEndpoints.length > 0
        ? [
            {
              label: "Maintenance",
              items: maintenanceEndpoints,
            },
          ]
        : []),
    ],
    [liveEndpoints, maintenanceEndpoints]
  );

  function handleSelect(id) {
    setActiveId(id);
    setMobileNavOpen(false);
    const isEndpoint = nav.some(
      (g) => g.label !== "Overview" && g.items.some((i) => i.id === id)
    );
    if (isEndpoint) setOpenId((prev) => (prev === id ? null : id));
  }

  function handleEndpointToggle(id, v) {
    if (typeof v === "boolean") {
      setOpenId(v ? id : null);
      if (v) setActiveId(id);
    } else {
      setOpenId((prev) => (prev === id ? null : id));
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar maxWidth="max-w-7xl" />

      {/* Breadcrumb */}
      <div className="sticky top-[53px] z-20 border-b border-ink/15 bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-ink/40 text-xs font-bold">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <ChevronRight size={11} />
            <span className="text-ink">API Documentation</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-ink/40 hidden sm:inline">
              v1.0 · REST API
            </span>
            {/* Mobile nav toggle */}
            <button
              className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-ink/60 hover:text-ink transition-colors"
              onClick={() => setMobileNavOpen((v) => !v)}
            >
              {mobileNavOpen ? <X size={15} /> : <Menu size={15} />}
              <span>Menu</span>
            </button>
          </div>
        </div>

        {/* Mobile sidebar drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden border-t border-ink/10 bg-cream/95 px-4 py-4">
            <Sidebar nav={nav} activeId={activeId} onSelect={handleSelect} />
          </div>
        )}
      </div>

      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 pt-10 pb-20">
        <div className="flex gap-10">

          {/* Desktop sidebar — sticky */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-[108px]">
              <Sidebar nav={nav} activeId={activeId} onSelect={handleSelect} />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-10"
            >
              <div className="inline-flex items-center gap-2 bg-marigold text-ink font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-[3px_3px_0px_0px_#10380b] mb-4">
                <Sparkles size={13} />
                Public REST API
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-ink tracking-tight mb-3">
                API Documentation
              </h1>
              <p className="text-base text-ink/60 font-semibold max-w-2xl leading-relaxed">
                Integrate Nova-X network and security utilities into your own applications,
                bots, and automation workflows. Open, unauthenticated, and CORS-enabled.
              </p>
            </motion.div>

            {/* Overview */}
            <section id="envelope" className="scroll-mt-32 mb-2">
              <SectionHeading icon={BookOpen} label="Response Envelope" />
              <EnvelopeSection />
            </section>

            <section id="rate-limit" className="scroll-mt-32 mb-10">
              <SectionHeading icon={Shield} label="Rate Limiting" />
              <RateLimitSection />
            </section>

            {/* Live Endpoints */}
            {liveEndpoints.length > 0 && (
              <section className="mb-12">
                <div className="mb-6 flex items-center gap-2">
                  <Terminal size={18} className="text-ink" />
                  <h2 className="text-2xl font-black text-ink tracking-tight">Available Endpoints</h2>
                </div>

                {liveEndpoints.map((ep) => {
                  const Comp = ENDPOINT_COMPONENTS[ep.id];
                  if (!Comp) return null;
                  return (
                    <Comp
                      key={ep.id}
                      open={openId === ep.id}
                      onToggle={(v) => handleEndpointToggle(ep.id, v)}
                      live={true}
                    />
                  );
                })}
              </section>
            )}

            {/* Maintenance Endpoints */}
            {maintenanceEndpoints.length > 0 && (
              <section id="maintenance-endpoints" className="mb-10">
                <div className="mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-ink" />
                  <h2 className="text-2xl font-black text-ink tracking-tight">Under Maintenance</h2>
                </div>

                {/* Single global notice banner for all maintenance endpoints */}
                <div className="mb-6 bg-marigold/20 border border-ink text-ink rounded-2xl p-4 flex items-start gap-3 shadow-[4px_4px_0px_0px_#10380b]">
                  <AlertTriangle size={18} className="text-ink shrink-0 mt-0.5" />
                  <div className="text-xs font-semibold leading-relaxed">
                    <strong className="block text-sm font-bold mb-0.5">Endpoints Temporarily Offline</strong>
                    This endpoint is temporarily offline for maintenance. API requests currently return HTTP 503.
                  </div>
                </div>

                {maintenanceEndpoints.map((ep) => {
                  const Comp = ENDPOINT_COMPONENTS[ep.id];
                  if (!Comp) return null;
                  return (
                    <Comp
                      key={ep.id}
                      open={openId === ep.id}
                      onToggle={(v) => handleEndpointToggle(ep.id, v)}
                      live={false}
                    />
                  );
                })}
              </section>
            )}
          </div>
        </div>
      </div>

      <Footer maxWidth="max-w-7xl" />
    </main>
  );
}

function SectionHeading({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className="text-ink/50" />
      <span className="font-black text-xs uppercase tracking-widest text-ink/50">{label}</span>
      <div className="flex-1 h-px bg-ink/10" />
    </div>
  );
}
