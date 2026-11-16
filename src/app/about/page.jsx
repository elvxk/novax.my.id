"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Heart,
  Shield,
  Code,
  GitBranch,
  Sparkles,
  MessageSquare,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TOOLS } from "@/lib/tools";

const TECH_STACK = [
  "Next.js 16",
  "React 19",
  "Bun",
  "Tailwind CSS 4",
  "Framer Motion",
  "Lucide Icons",
  "Node-Forge",
  "Nodemailer",
  "Leaflet",
];

const HIGHLIGHTS = [
  {
    icon: Shield,
    title: "All-in-One Toolkit",
    desc: "DNS, SSL, proxy, crawl test, subdomain finder, SMTP, license check, and HTTP client — all in one place.",
  },
  {
    icon: Code,
    title: "Built for Speed",
    desc: "Next.js 16 App Router and Bun runtime deliver fast diagnostics with no install step.",
  },
  {
    icon: GitBranch,
    title: "Open & CORS-enabled",
    desc: "Unauthenticated public REST API, rate-limited at 60 requests per minute per IP (RFC 6585).",
  },
];

const FEEDBACK_TYPES = [
  { value: "suggestion", label: "Suggestion" },
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "tool", label: "Tool Recommendation" },
];

export default function AboutPage() {
  const [feedback, setFeedback] = useState({
    type: "suggestion",
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | pending | success | error
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!feedback.message.trim()) return;

    setStatus("pending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMessage(json.error?.message || "Submission failed.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setFeedback({ type: "suggestion", name: "", email: "", message: "" });
    } catch {
      setErrorMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  const submitting = status === "pending";

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar maxWidth="max-w-6xl" />

      {/* Breadcrumb */}
      <div className="sticky top-[53px] z-10 border-b border-ink/15 bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2.5 flex items-center gap-1.5 text-ink/40 text-xs font-bold">
          <Link href="/" className="hover:text-ink transition-colors">
            Home
          </Link>
          <ChevronRight size={11} />
          <span className="text-ink">About</span>
        </div>
      </div>

      <div className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 pt-10 pb-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            {/* <div className="w-10 h-10 rounded-xl bg-marigold border border-ink/20 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#10380b]"> */}
            {/*   <Heart size={20} className="text-ink" /> */}
            {/* </div> */}
            <div className="flex flex-col justify-center items-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight leading-none">
                About Nova-X
              </h1>
              <p className="text-xs text-ink/40 font-semibold mt-1">
                Network &amp; security diagnostics platform
              </p>
              <p className="text-sm sm:text-base text-ink/70 font-medium leading-relaxed text-center mt-4">
                Nova-X is a lightweight, open platform for network and security diagnostics. It
                gathers the utilities a developer or sysadmin reaches for most often — DNS, TLS,
                geolocation, proxying, SMTP, crawler checks — into one fast, CORS-enabled surface
                with a matching public REST API.
              </p>

            </div>
          </div>

        </motion.div>

        {/* Highlights */}
        <section className="mt-12">
          <div className="flex items-center justify-center gap-2 bg-marigold/20 text-ink font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-[2px_2px_0px_0px_#10380b] mb-4 w-fit mx-auto">
            <Shield size={13} />
            Why Nova-X
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-ink bg-parchment p-5 shadow-[4px_4px_0px_0px_#10380b]"
              >
                <div className="w-10 h-10 rounded-lg bg-marigold border border-ink/20 flex items-center justify-center mb-3">
                  <Icon size={18} className="text-ink" />
                </div>
                <h3 className="font-extrabold text-ink text-sm mb-1.5">{title}</h3>
                <p className="text-xs text-ink/70 font-medium leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech stack */}
        <section className="mt-12">
          <div className="flex items-center justify-center gap-2 bg-marigold/20 text-ink font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-[2px_2px_0px_0px_#10380b] mb-4 w-fit mx-auto">
            <Code size={13} />
            Tech Stack
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {TECH_STACK.map((tech) => (
              <span
                key={tech}
                className="text-[11px] font-mono font-bold text-ink/60 bg-cream border border-ink/15 px-2.5 py-1 rounded-md whitespace-nowrap"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Tools catalog */}
        <section className="mt-12">
          <div className="flex items-center justify-center gap-2 bg-marigold/20 text-ink font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-[2px_2px_0px_0px_#10380b] mb-4 w-fit mx-auto">
            <Sparkles size={13} />
            Available Tools
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="flex items-center gap-3 rounded-xl border border-ink/20 bg-parchment p-3.5 hover:border-ink hover:shadow-[3px_3px_0px_0px_#10380b] transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-marigold border border-ink/20 flex items-center justify-center text-ink shrink-0">
                    <Icon size={16} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-extrabold text-ink truncate">
                      {tool.name}
                    </span>
                    <span className="block text-[11px] font-medium text-ink/50 truncate">
                      {tool.tags.slice(0, 3).join(" · ")}
                    </span>
                  </div>
                  <ChevronRight size={13} className="shrink-0 text-ink/30" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Feedback */}
        <section className="mt-16 pt-10 border-t border-ink/10 item">
          <div className="flex items-center justify-center gap-2 bg-marigold/20 text-ink font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-[2px_2px_0px_0px_#10380b] mb-4 w-fit mx-auto">
            <MessageSquare size={13} />
            Feedback &amp; Tool Requests
          </div>
          <div className="flex justify-center items-center my-4">
            <p className="text-xs sm:text-sm text-ink/60 font-medium max-w-2xl leading-relaxed text-center">
              Found a bug, or have an idea for a tool Nova-X should include? Send it below — every
              submission is delivered straight to the maintainers.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-ink bg-parchment p-5 shadow-[4px_4px_0px_0px_#10380b] w-full"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="feedback-type"
                  className="block text-[10px] font-black uppercase tracking-widest text-ink/50 mb-1.5"
                >
                  Feedback Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FEEDBACK_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      disabled={submitting}
                      onClick={() => setFeedback({ ...feedback, type: t.value })}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 ${feedback.type === t.value
                        ? "bg-ink text-cream border-ink"
                        : "bg-cream text-ink/60 border-ink/15 hover:text-ink"
                        }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="feedback-name"
                  className="block text-[10px] font-black uppercase tracking-widest text-ink/50 mb-1.5"
                >
                  Name <span className="text-ink/30">(optional)</span>
                </label>
                <input
                  id="feedback-name"
                  type="text"
                  value={feedback.name}
                  onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                  disabled={submitting}
                  maxLength={80}
                  placeholder="Your name"
                  className="w-full bg-cream border border-ink/20 rounded-lg px-3 py-2 text-xs font-mono text-ink placeholder:text-ink/30 outline-none focus:border-ink transition-colors disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="feedback-email"
                  className="block text-[10px] font-black uppercase tracking-widest text-ink/50 mb-1.5"
                >
                  Email <span className="text-ink/30">(optional)</span>
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  value={feedback.email}
                  onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                  disabled={submitting}
                  maxLength={160}
                  placeholder="you@example.com"
                  className="w-full bg-cream border border-ink/20 rounded-lg px-3 py-2 text-xs font-mono text-ink placeholder:text-ink/30 outline-none focus:border-ink transition-colors disabled:opacity-50"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="feedback-message"
                  className="block text-[10px] font-black uppercase tracking-widest text-ink/50 mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="feedback-message"
                  value={feedback.message}
                  onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                  disabled={submitting}
                  rows={5}
                  maxLength={2000}
                  placeholder="Describe the issue, idea, or tool you'd like to see…"
                  className="w-full bg-cream border border-ink/20 rounded-lg px-3 py-2 text-xs font-mono text-ink placeholder:text-ink/30 outline-none focus:border-ink transition-colors resize-y disabled:opacity-50"
                />
                <span className="block text-right text-[10px] font-mono text-ink/30 mt-1">
                  {feedback.message.length}/2000
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 mt-4">
              <button
                type="submit"
                disabled={submitting || !feedback.message.trim()}
                className="bg-ink text-cream font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <MessageSquare size={14} />
                    Submit Feedback
                  </>
                )}
              </button>

              {status === "success" && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1.5 text-xs font-bold text-fern"
                >
                  <Check size={14} strokeWidth={3} />
                  Thanks — feedback received.
                </motion.span>
              )}
              {status === "error" && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-700"
                >
                  <AlertCircle size={14} />
                  {errorMessage}
                </motion.span>
              )}
            </div>
          </form>
        </section>
      </div>

      <Footer maxWidth="max-w-6xl" />
    </main>
  );
}
