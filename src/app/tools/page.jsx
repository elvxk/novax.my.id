"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  ArrowRight,
  Sparkles,
  Lock,
  AlertTriangle,
  Wrench,
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

function ToolCard({ tool }) {
  const Icon = tool.icon;
  const CardWrapper = tool.live ? Link : "div";

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

        {/* Tool Description */}
        <p className="text-xs sm:text-sm text-ink/70 font-medium leading-relaxed mb-4">
          {tool.desc}
        </p>
      </div>

      <div>
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-ink/10 mb-4">
          {tool.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono font-bold text-ink/60 bg-cream border border-ink/15 px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
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

  const activeTools = TOOLS.filter((t) => t.live);
  const maintenanceTools = TOOLS.filter((t) => !t.live);

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
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {activeTools.map((tool) => (
              <motion.div key={tool.id} variants={item}>
                <ToolCard tool={tool} />
              </motion.div>
            ))}
          </motion.div>
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
                  <ToolCard tool={tool} />
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
