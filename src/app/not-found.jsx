"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, FileCode2, Radio } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
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
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 bg-marigold text-ink font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-[3px_3px_0px_0px_#10380b]">
              <Radio size={13} className="animate-pulse" />
              Status 404 • Signal Lost
            </span>
          </div>

          {/* Big 404 */}
          <h1 className="text-7xl sm:text-9xl font-black text-ink tracking-tighter leading-none mb-3">
            404
          </h1>

          {/* Diagnostic epigraph */}
          <p className="text-sm font-semibold text-ink/45 tracking-wide mb-2 font-mono">
            // 404_TARGET_UNREACHABLE
          </p>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-4">
            Host Unreachable
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-ink/65 font-medium max-w-md mx-auto leading-relaxed mb-8">
            The route or resource you are looking for does not exist, has moved,
            or was dropped in transit.
          </p>

          {/* Monospace diagnostic card */}
          <div className="bg-parchment border border-ink rounded-2xl p-4 shadow-[4px_4px_0px_0px_#10380b] mb-8 max-w-md mx-auto text-left">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-ink/10 text-[10px] font-bold uppercase tracking-wider text-ink/40">
              <span>Diagnostic Trace</span>
              <span className="text-red-600 font-black">ERR_ROUTE_UNMAPPED</span>
            </div>
            <div className="font-mono text-xs text-ink/80 space-y-1">
              <div><span className="text-ink/40">QUERY  :</span> GET /*</div>
              <div><span className="text-ink/40">RESULT :</span> 0 records matched</div>
              <div><span className="text-ink/40">ACTION :</span> Reroute to valid origin</div>
            </div>
          </div>

          {/* Navigation CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-ink text-cream font-bold text-sm px-6 py-3 rounded-xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150"
            >
              <Home size={15} />
              Return Home
            </Link>

            <Link
              href="/docs"
              className="inline-flex items-center gap-2 bg-parchment border border-ink text-ink font-bold text-sm px-6 py-3 rounded-xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#10380b] transition-all duration-150"
            >
              <FileCode2 size={15} />
              API Docs
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer maxWidth="max-w-6xl" />
    </main>
  );
}
