"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ArrowRight,
  Sparkles,
  Lock,
  AlertTriangle,
  Wrench,
  Search,
  Grid,
  List,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TOOLS } from "@/lib/tools";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

function ToolCard({ tool, variant = "grid" }) {
  const Icon = tool.icon;
  const CardWrapper = tool.live ? Link : "div";

  // Limit tags to fit in 1 row: show max 3 tags + "+N" badge
  const maxTags = 3;
  const visibleTags = tool.tags.slice(0, maxTags);
  const remainingTags = tool.tags.length - maxTags;

  // Minimal info for list variant
  if (variant === "list") {
    return (
      <CardWrapper
        href={tool.live ? tool.href : undefined}
        className={[
          "w-full flex flex-row items-center gap-4 rounded-2xl border border-ink p-4 transition-all duration-150 select-none",
          tool.live
            ? "bg-parchment shadow-[4px_4px_0px_0px_#10380b] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax cursor-pointer group"
            : "bg-parchment/60 opacity-60 cursor-not-allowed border-ink/30",
        ].join(" ")}
      >
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-marigold border border-ink/20 flex items-center justify-center text-ink shrink-0 shadow-[2px_2px_0px_0px_#10380b]">
          <Icon size={18} strokeWidth={2.2} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title + status */}
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-ink tracking-tight truncate">
              {tool.name}
            </h3>
            {tool.live ? (
              <span className="text-[9px] font-black uppercase tracking-wider bg-fern/20 text-ink border border-fern px-2 py-0.5 rounded-full">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-fern animate-pulse" />
                Live
              </span>
            ) : (
              <span className="text-[9px] font-black uppercase tracking-wider bg-ink/10 text-ink/50 px-2 py-0.5 rounded-full border border-ink/15">
                Maintenance
              </span>
            )}
          </div>

          {/* Minimal description */}
          <p className="text-[11px] text-ink/60 font-medium leading-snug mt-1 line-clamp-2">
            {tool.desc}
          </p>

          {/* Minimal action */}
          <div className="flex items-center justify-between text-[11px] font-bold text-ink pt-2">
            <span>{tool.live ? "Open Tool" : "Under Maintenance"}</span>
            {tool.live ? (
              <ArrowRight
                size={12}
                className="group-hover:translate-x-1 transition-transform"
              />
            ) : (
              <Lock size={10} className="opacity-40" />
            )}
          </div>
        </div>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      href={tool.live ? tool.href : undefined}
      className={[
        "h-full flex flex-col justify-between rounded-2xl border border-ink p-5 sm:p-6 transition-all duration-150 select-none",
        tool.live
          ? "bg-parchment shadow-[4px_4px_0px_0px_#10380b] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax cursor-pointer group"
          : "bg-parchment/60 opacity-60 cursor-not-allowed border-ink/30",
      ].join(" ")}
    >
      <div>
        {/* Header: Icon & Badge */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-marigold border border-ink/20 flex items-center justify-center text-ink shrink-0 shadow-[2px_2px_0px_0px_#10380b]">
            <Icon size={20} strokeWidth={2.2} />
          </div>

          {tool.live ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-fern/20 text-ink border border-fern px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-fern animate-pulse" />
              Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-ink/10 text-ink/50 px-2.5 py-0.5 rounded-full border border-ink/15">
              <Lock size={10} />
              Maintenance
            </span>
          )}
        </div>

        {/* Tool Name */}
        <h2 className="text-xl font-extrabold text-ink tracking-tight mb-2 group-hover:underline">
          {tool.name}
        </h2>

        {/* Tool Description - exactly 2 lines with inline "More" */}
        <div className="mb-4">
          <p className="text-xs sm:text-sm text-ink/70 font-medium leading-relaxed line-clamp-2 relative pr-14">
            {tool.desc}
            <span className="absolute bottom-0 right-0 bg-gradient-to-l from-parchment to-transparent px-2 text-[10px] font-bold text-ink/40">
              …
            </span>
          </p>
        </div>
      </div>

      <div>
        {/* Tags - strictly 1 row, no wrap */}
        <div className="flex gap-1.5 pt-3 border-t border-ink/10 mb-4 overflow-x-auto no-scrollbar">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono font-bold text-ink/60 bg-cream border border-ink/15 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0"
            >
              {tag}
            </span>
          ))}
          {remainingTags > 0 && (
            <span className="text-[10px] font-mono font-bold text-ink/50 bg-cream border border-ink/15 px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
              +{remainingTags}
            </span>
          )}
        </div>

        {/* Action link */}
        <div className="flex items-center justify-between text-xs font-bold text-ink pt-1">
          <span>{tool.live ? "Open Tool" : "Under Maintenance"}</span>
          {tool.live ? (
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          ) : (
            <Lock size={12} className="opacity-40" />
          )}
        </div>
      </div>
    </CardWrapper>
  );
}

function ToolsCatalogInner() {
  const searchParams = useSearchParams();
  const maintenanceId = searchParams.get("maintenance");
  const maintenanceTool = maintenanceId ? TOOLS.find((t) => t.id === maintenanceId) : null;

  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const filteredTools = TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.desc.toLowerCase().includes(query.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
  );

  const activeTools = filteredTools.filter((t) => t.live);
  const maintenanceTools = filteredTools.filter((t) => !t.live);

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar maxWidth="max-w-6xl" />

      {/* Breadcrumb sub-header */}
      <div className="sticky top-[53px] z-10 border-b border-ink/15 bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-ink/40 text-xs font-bold">
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <ChevronRight size={11} />
            <span className="text-ink">Tools</span>
          </div>
          <span className="text-xs font-mono font-bold text-ink/40">
            {activeTools.length} active {maintenanceTools.length > 0 ? `· ${maintenanceTools.length} maintenance` : ""}
          </span>
        </div>
      </div>

      <div className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 pt-10 pb-20">
        {/* Controls: Search & View Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-ink/40" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools..."
                className="w-full bg-parchment border border-ink rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono font-semibold text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] transition-shadow"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink/40 hover:text-ink"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink/40">View:</span>
              <div className="flex gap-1 rounded-xl border border-ink bg-cream p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-ink text-cream shadow-[2px_2px_0px_0px_#10380b]"
                      : "text-ink/60 hover:text-ink hover:bg-ink/5"
                  }`}
                >
                  <Grid size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-ink text-cream shadow-[2px_2px_0px_0px_#10380b]"
                      : "text-ink/60 hover:text-ink hover:bg-ink/5"
                  }`}
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Maintenance notice if redirected */}
        {maintenanceTool && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-2xl border border-ink bg-marigold/20 text-ink flex items-start gap-3 shadow-[4px_4px_0px_0px_#10380b]"
          >
            <AlertTriangle size={18} className="text-ink shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-sm block">Service Offline for Maintenance</span>
              <p className="text-xs text-ink/75 font-medium mt-0.5 leading-relaxed">
                The <strong>{maintenanceTool.name}</strong> utility is temporarily offline. Access to its interactive dashboard and API is paused.
              </p>
            </div>
          </motion.div>
        )}

        {/* Section 1: Active Tools */}
        <section className="mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-marigold text-ink font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-[3px_3px_0px_0px_#10380b] mb-4">
              <Sparkles size={13} />
              Network Toolkit
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-ink tracking-tight mb-3">
              Active Tools
            </h1>
            <p className="text-base text-ink/60 font-semibold max-w-xl leading-relaxed">
              All operational diagnostics, network lookups, and security utilities ready to use.
            </p>
          </motion.div>

          <motion.div
            key={viewMode}
            variants={viewMode === "grid" ? container : {
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.06 } }
            }}
            initial="hidden"
            animate="show"
            exit="hidden"
            className={
              viewMode === "grid"
                ? "grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                : "space-y-4"
            }
          >
            {activeTools.map((tool) => (
              <AnimatePresence key={tool.id}>
                <motion.div variants={item}>
                  <ToolCard tool={tool} variant={viewMode} />
                </motion.div>
              </AnimatePresence>
            ))}
          </motion.div>

          {activeTools.length === 0 && query && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-2xl border border-ink bg-cream/60 text-center"
            >
              <span className="text-sm font-bold text-ink/60">No tools match your search.</span>
            </motion.div>
          )}
        </section>

        {/* Section 2: Under Maintenance / Maintenance Tools */}
        {maintenanceTools.length > 0 && (
          <section className="pt-10 border-t border-ink/10">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-marigold/30 text-ink font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider border border-ink/20 mb-3 shadow-[2px_2px_0px_0px_#10380b]">
                <Wrench size={13} />
                Under Maintenance
              </div>
              <h2 className="text-3xl font-black text-ink tracking-tight mb-2">
                Maintenance Tools
              </h2>
              <p className="text-xs sm:text-sm text-ink/60 font-semibold max-w-xl leading-relaxed">
                These utilities are temporarily offline for scheduled updates and maintenance. Access will be restored soon.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {maintenanceTools.map((tool) => (
                <div key={tool.id}>
                  <ToolCard tool={tool} variant={viewMode} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer maxWidth="max-w-6xl" />
    </main>
  );
}

export default function ToolsCatalogPage() {
  return (
    <Suspense>
      <ToolsCatalogInner />
    </Suspense>
  );
}
