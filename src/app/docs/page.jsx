"use client";

import { useState } from "react";
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

const NAV = [
  {
    label: "Overview",
    items: [
      { id: "envelope", title: "Response Envelope", icon: BookOpen },
      { id: "rate-limit", title: "Rate Limiting", icon: Shield },
    ],
  },
  {
    label: "Endpoints",
    items: [
      { id: "dns-lookup",       title: "DNS Lookup",         icon: Globe,   method: "GET"  },
      { id: "whois",            title: "WHOIS / RDAP",       icon: Globe,   method: "GET"  },
      { id: "ip-geo",           title: "IP Geolocation",     icon: MapPin,  method: "GET"  },
      { id: "license-check",    title: "License Check",      icon: Key,     method: "GET"  },
      { id: "smtp-sender",      title: "SMTP Sender",        icon: Mail,    method: "POST" },
      { id: "proxy-viewer",     title: "Proxy Viewer",       icon: Eye,     method: "GET"  },
      { id: "ssl-checker",      title: "SSL Checker",        icon: Lock,    method: "GET"  },
      { id: "subdomain-finder", title: "Subdomain Finder",   icon: Network, method: "GET"  },
    ],
  },
];

const METHOD_BADGE = {
  GET:  "bg-fern/20 text-fern border-fern/30",
  POST: "bg-marigold/60 text-ink border-marigold",
};

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ activeId, onSelect }) {
  return (
    <nav className="space-y-6">
      {NAV.map((group) => (
        <div key={group.label}>
          <p className="text-[10px] font-black uppercase tracking-widest text-ink/40 mb-2 px-1">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map(({ id, title, icon: Icon, method }) => (
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
                  {method && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded border tracking-wider ${
                        activeId === id
                          ? "bg-cream/20 text-cream border-cream/30"
                          : (METHOD_BADGE[method] ?? "bg-ink/10 text-ink border-ink/20")
                      }`}
                    >
                      {method}
                    </span>
                  )}
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

  function handleSelect(id) {
    setActiveId(id);
    setMobileNavOpen(false);
    // only toggle endpoints (not overview sections)
    const isEndpoint = NAV[1].items.some((i) => i.id === id);
    if (isEndpoint) setOpenId((prev) => (prev === id ? null : id));
  }

  function handleEndpointToggle(id, v) {
    setOpenId(v ? id : null);
    if (v) setActiveId(id);
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
            <Sidebar activeId={activeId} onSelect={handleSelect} />
          </div>
        )}
      </div>

      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 pt-10 pb-20">
        <div className="flex gap-10">

          {/* Desktop sidebar — sticky */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-[108px]">
              <Sidebar activeId={activeId} onSelect={handleSelect} />
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

            {/* Endpoints */}
            <div className="mb-6 flex items-center gap-2">
              <Terminal size={18} className="text-ink" />
              <h2 className="text-2xl font-black text-ink tracking-tight">Available Endpoints</h2>
            </div>

            <DnsLookup       open={openId === "dns-lookup"}       onToggle={(v) => handleEndpointToggle("dns-lookup", v)} />
            <Whois           open={openId === "whois"}            onToggle={(v) => handleEndpointToggle("whois", v)} />
            <IpGeo           open={openId === "ip-geo"}           onToggle={(v) => handleEndpointToggle("ip-geo", v)} />
            <LicenseCheck    open={openId === "license-check"}    onToggle={(v) => handleEndpointToggle("license-check", v)} />
            <SmtpSender      open={openId === "smtp-sender"}      onToggle={(v) => handleEndpointToggle("smtp-sender", v)} />
            <ProxyViewer     open={openId === "proxy-viewer"}     onToggle={(v) => handleEndpointToggle("proxy-viewer", v)} />
            <SslChecker      open={openId === "ssl-checker"}      onToggle={(v) => handleEndpointToggle("ssl-checker", v)} />
            <SubdomainFinder open={openId === "subdomain-finder"} onToggle={(v) => handleEndpointToggle("subdomain-finder", v)} />
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
