"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowRight, FileCode2, Globe } from "lucide-react";
import { FEATURED_TOOLS, ICON_MAP } from "@/lib/tools";

/** Returns smoothed x/y transforms for a parallax layer with independent axis factors. */
function useParallax(factorX = 10, factorY = 10, spring = { stiffness: 60, damping: 20 }) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(useTransform(rawX, (v) => v * factorX), spring);
  const y = useSpring(useTransform(rawY, (v) => v * factorY), spring);

  useEffect(() => {
    const onMove = (e) => {
      rawX.set(e.clientX / window.innerWidth - 0.5);
      rawY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [rawX, rawY]);

  return { x, y };
}

/** Decorative corner network — top-right */
function CornerNetwork({ side = "right" }) {
  const flip = side === "left" ? "scale(-1,1)" : undefined;
  return (
    <svg
      viewBox="0 0 220 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute top-0 pointer-events-none select-none"
      style={{ [side]: 0, width: 220, height: 200, transform: flip }}
      aria-hidden="true"
    >
      {/* lines */}
      <line x1="160" y1="20" x2="90" y2="80" stroke="#10380b" strokeWidth="1.2" opacity="0.2" />
      <line x1="90" y1="80" x2="160" y2="140" stroke="#10380b" strokeWidth="1.2" opacity="0.2" />
      <line x1="90" y1="80" x2="30" y2="130" stroke="#10380b" strokeWidth="1.2" opacity="0.15" />
      <line x1="160" y1="20" x2="210" y2="60" stroke="#10380b" strokeWidth="1" opacity="0.12" />
      <line x1="160" y1="140" x2="210" y2="170" stroke="#10380b" strokeWidth="1" opacity="0.12" />
      {/* nodes */}
      <circle cx="160" cy="20" r="14" fill="#fce519" stroke="#10380b" strokeWidth="1.5" opacity="0.9" />
      <circle cx="90" cy="80" r="10" fill="#fefde6" stroke="#10380b" strokeWidth="1.5" />
      <circle cx="160" cy="140" r="8" fill="#dbe8ac" stroke="#10380b" strokeWidth="1.5" />
      <circle cx="30" cy="130" r="6" fill="#fce519" stroke="#10380b" strokeWidth="1" opacity="0.6" />
      <circle cx="210" cy="60" r="4" fill="#10380b" opacity="0.3" />
      <circle cx="210" cy="170" r="4" fill="#10380b" opacity="0.3" />
      {/* ping rings */}
      <circle cx="160" cy="20" r="22" stroke="#10380b" strokeWidth="0.75" opacity="0.1" />
      <circle cx="160" cy="20" r="32" stroke="#10380b" strokeWidth="0.5" opacity="0.06" />
      {/* label */}
      <rect x="130" y="68" width="58" height="18" rx="9" fill="#10380b" />
      <text x="159" y="80" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#f2ee98" fontWeight="700">novax.my.id</text>
    </svg>
  );
}

/** Floating ping chip — absolute positioned */
function PingChip({ label, top, left, right, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      style={{ top, left, right }}
      className="absolute hidden sm:flex items-center gap-1.5 bg-parchment border border-ink rounded-full px-3 py-1 shadow-[3px_3px_0px_0px_#10380b] pointer-events-none select-none"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-fern" />
      <span className="font-mono font-bold text-[10px] text-ink">{label}</span>
    </motion.div>
  );
}

export default function HeroSection() {
  const [featuredList, setFeaturedList] = useState(FEATURED_TOOLS);

  // Sync with PostgreSQL database
  useEffect(() => {
    fetch("/api/tools")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const featured = json.data
            .filter((t) => t.featured && t.live && !t.disabled)
            .map((t) => ({
              ...t,
              icon: ICON_MAP[t.iconName] || Globe,
            }));
          setFeaturedList(featured);
        }
      })
      .catch(() => {});
  }, []);

  // corner networks: strong horizontal, moderate vertical, sluggish spring
  const deco = useParallax(-28, -16, { stiffness: 45, damping: 18 });
  // ping chips: unequal axes so each chip feels independent, snappier
  const chips = useParallax(-20, -36, { stiffness: 80, damping: 22 });

  return (
    <section className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 relative overflow-hidden">

      {/* Corner decorations */}
      <motion.div style={{ x: deco.x, y: deco.y }} className="absolute inset-0 pointer-events-none">
        <CornerNetwork side="right" />
        <CornerNetwork side="left" />
      </motion.div>

      {/* Floating ping chips */}
      <motion.div style={{ x: chips.x, y: chips.y }} className="absolute inset-0 pointer-events-none">
        <PingChip label="8.8.8.8 → US" top="18%" right="6%" delay={0.7} />
        <PingChip label="A  76.76.21.21" top="38%" left="4%" delay={0.85} />
        <PingChip label="TLS 1.3 ✓" top="62%" right="5%" delay={1.0} />
        <PingChip label="proxy: none" top="75%" left="5%" delay={1.1} />
      </motion.div>

      {/* Main content */}
      <div className="w-full max-w-6xl relative z-10 flex flex-col items-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 bg-marigold text-ink font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-[4px_4px_0px_0px_#10380b]">
            <span className="w-1.5 h-1.5 bg-ink rounded-full" />
            Network Tools
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="text-center text-5xl sm:text-6xl md:text-7xl font-extrabold text-ink leading-[0.92] tracking-tighter mb-5"
        >
          The Network.<br />
          <em className="not-italic">Illuminated.</em>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="text-center text-ink font-semibold text-base sm:text-lg opacity-70 leading-relaxed mb-6 max-w-lg mx-auto tracking-wide"
        >
          Una fuente única para todas las herramientas
        </motion.p>

        {/* Featured Tools Header — Placed above the pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-center gap-3 mb-3 w-full max-w-xs mx-auto"
        >
          <div className="flex-1 h-px bg-ink/15" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-ink/50 select-none whitespace-nowrap">
            Featured Tools
          </span>
          <div className="flex-1 h-px bg-ink/15" />
        </motion.div>

        {/* Featured Tool Pills — spans horizontally across the navbar width */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.24 }}
          className="w-full max-w-6xl flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-10"
        >
          {featuredList.map((t) => {
            const Icon = t.icon;

            return (
              <a
                key={t.id}
                href={t.href}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 select-none whitespace-nowrap bg-parchment border border-ink text-ink hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#10380b] cursor-pointer"
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-marigold text-ink">
                  <Icon size={11} strokeWidth={2.4} />
                </span>
                <span>{t.label || t.name}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-fern" />
              </a>
            );
          })}
        </motion.div>

        {/* Lengthened CTA Button to /tools */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="w-full flex flex-col items-center justify-center"
        >
          <motion.a
            href="/tools"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            className="group w-full max-w-xs sm:max-w-md inline-flex items-center justify-between bg-ink text-cream font-extrabold text-sm sm:text-base px-6 sm:px-8 py-4 rounded-full border border-ink shadow-[4px_4px_0px_0px_#10380b] hover:shadow-novax hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-marigold animate-pulse" />
              <span className="tracking-normal group-hover:tracking-wider transition-all duration-200">
                Explore All Tools
              </span>
            </div>
            <span className="w-8 h-8 rounded-full bg-marigold flex items-center justify-center text-ink shrink-0 group-hover:scale-110 group-hover:rotate-[-45deg] group-hover:shadow-[2px_2px_0px_0px_#10380b] transition-all duration-200">
              <ArrowRight size={16} strokeWidth={2.6} />
            </span>
          </motion.a>

          {/* Underneath: API Docs as a subtle text link */}
          <a
            href="/docs"
            className="group mt-3.5 inline-flex items-center gap-1.5 text-xs font-bold text-ink/60 hover:text-ink transition-colors select-none"
          >
            <FileCode2 size={13} className="text-ink/50 group-hover:text-ink transition-colors" />
            <span className="underline decoration-ink/30 underline-offset-4 group-hover:decoration-ink">
              API Documentation
            </span>
            <span className="text-[10px] opacity-50 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all">
              →
            </span>
          </a>
        </motion.div>

      </div>
    </section>
  );
}
