"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wrench, RotateCcw, Activity } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MaintenancePage() {
  const router = useRouter();
  const [reloading, setReloading] = useState(false);

  function handleReload() {
    setReloading(true);
    router.refresh();
    router.push("/");
  }

  return (
    <main className="min-h-screen flex flex-col justify-between">
      <Navbar maxWidth="max-w-6xl" />

      <section className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xl mx-auto text-center"
        >
          {/* Status Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 bg-marigold text-ink font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-[3px_3px_0px_0px_#10380b]">
              <Wrench size={13} className="animate-spin text-ink" />
              Status 503 • Under Maintenance
            </span>
          </div>

          {/* Big Status Code */}
          <h1 className="text-7xl sm:text-9xl font-black text-ink tracking-tighter leading-none mb-3">
            503
          </h1>

          {/* Generic Epigraph */}
          <p className="text-sm font-semibold text-ink/45 tracking-wide mb-2 font-mono">
            {"// SYSTEM_MAINTENANCE"}
          </p>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-4">
            Under Maintenance
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-ink/65 font-medium max-w-md mx-auto leading-relaxed mb-8">
            We are currently performing routine maintenance and system updates.
            Services will be back online shortly.
          </p>

          {/* Minimal Diagnostic Box */}
          <div className="bg-parchment border border-ink rounded-2xl p-5 shadow-[4px_4px_0px_0px_#10380b] mb-8 max-w-md mx-auto text-left">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-ink/10 text-[10px] font-bold uppercase tracking-wider text-ink/40">
              <span className="flex items-center gap-1.5">
                <Activity size={12} />
                <span>System Status</span>
              </span>
              <span className="text-amber-800 font-black bg-marigold/40 px-2 py-0.5 rounded border border-ink/20">
                UPDATING
              </span>
            </div>
            <div className="font-mono text-xs text-ink/80 space-y-1.5">
              <div>
                <span className="text-ink/40">SERVICE  :</span> Nova-X Engine
              </div>
              <div>
                <span className="text-ink/40">STATUS   :</span> Maintenance in progress
              </div>
              <div>
                <span className="text-ink/40">ACTION   :</span> Automatic recovery in progress
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleReload}
              disabled={reloading}
              className="inline-flex items-center gap-2 bg-ink text-cream font-bold text-sm px-7 py-3.5 rounded-xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150 disabled:opacity-50"
            >
              <RotateCcw size={15} className={reloading ? "animate-spin" : ""} />
              <span>{reloading ? "Checking Status…" : "Refresh"}</span>
            </button>
          </div>
        </motion.div>
      </section>

      <Footer maxWidth="max-w-6xl" />
    </main>
  );
}
