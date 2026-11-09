"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Send,
  Loader2,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Clock,
  Server,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ENCRYPTION_OPTIONS = [
  { value: "", label: "None" },
  { value: "tls", label: "STARTTLS" },
  { value: "ssl", label: "SSL / TLS" },
];

const COMMON_PORTS = [25, 465, 587, 2525];

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-ink/50">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`bg-parchment border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] transition-shadow disabled:opacity-50 w-full ${className}`}
      {...props}
    />
  );
}

export default function SmtpSenderPage() {
  const [form, setForm] = useState({
    host: "",
    port: "587",
    user: "",
    pass: "",
    to: "",
    encryption: "tls",
    format: "html",
    subject: "",
    body: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { ok, data }
  const [error, setError] = useState(null);

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSend(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const payload = {
      host: form.host.trim(),
      port: form.port.trim(),
      user: form.user.trim(),
      pass: form.pass,
      to: form.to.trim(),
      encryption: form.encryption,
      format: form.format,
      subject: form.subject.trim() || undefined,
      ...(form.format === "html"
        ? { html: form.body.trim() || undefined }
        : { text: form.body.trim() || undefined }),
    };

    try {
      const res = await fetch("/api/smtp-sender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || "Delivery failed");
      } else {
        setResult(json.data);
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar maxWidth="max-w-4xl" />

      {/* Breadcrumb */}
      <div className="sticky top-[53px] z-10 border-b border-ink/15 bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-2.5 flex items-center gap-1.5 text-ink/40 text-xs font-bold">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <ChevronRight size={11} />
          <Link href="/tools" className="hover:text-ink transition-colors">Tools</Link>
          <ChevronRight size={11} />
          <span className="text-ink">SMTP Sender</span>
        </div>
      </div>

      <div className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 pt-10 pb-20">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 bg-ink rounded-xl flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#10380b]">
            <Mail size={18} className="text-marigold" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight leading-none">
              SMTP Sender
            </h1>
            <p className="text-xs text-ink/40 font-semibold mt-0.5">
              Verify outbound email delivery through any SMTP server
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSend}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06 }}
            className="rounded-2xl border border-ink bg-parchment p-6 shadow-[4px_4px_0px_0px_#10380b] space-y-5"
          >
            {/* Section: Server */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Server size={14} className="text-ink" />
                <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                  Server
                </span>
                <div className="flex-1 h-px bg-ink/10" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-4">
                <Field label="Hostname">
                  <Input
                    type="text"
                    placeholder="smtp.domain.com"
                    value={form.host}
                    onChange={set("host")}
                    required
                    disabled={loading}
                  />
                </Field>

                <Field label="Port">
                  <div className="flex flex-col gap-1">
                    <Input
                      type="number"
                      placeholder="587"
                      value={form.port}
                      onChange={set("port")}
                      required
                      disabled={loading}
                      min={1}
                      max={65535}
                      className="w-28"
                    />
                    <div className="flex gap-1 flex-wrap">
                      {COMMON_PORTS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          disabled={loading}
                          onClick={() => setForm((f) => ({ ...f, port: String(p) }))}
                          className={`text-[10px] font-black px-2 py-0.5 rounded-lg border transition-all ${
                            form.port === String(p)
                              ? "bg-ink text-cream border-ink"
                              : "bg-cream/60 text-ink/50 border-ink/20 hover:border-ink/60"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </Field>

                <Field label="Encryption">
                  <select
                    value={form.encryption}
                    onChange={set("encryption")}
                    disabled={loading}
                    className="bg-parchment border border-ink rounded-xl px-4 py-3 font-bold text-sm text-ink outline-none focus:shadow-[4px_4px_0px_0px_#10380b] transition-shadow disabled:opacity-50 appearance-none cursor-pointer"
                  >
                    {ENCRYPTION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>

            {/* Section: Credentials */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                  Credentials
                </span>
                <div className="flex-1 h-px bg-ink/10" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Sender Email">
                  <Input
                    type="email"
                    placeholder="sender@domain.com"
                    value={form.user}
                    onChange={set("user")}
                    required
                    disabled={loading}
                  />
                </Field>

                <Field label="Password">
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.pass}
                      onChange={set("pass")}
                      required
                      disabled={loading}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>
              </div>
            </div>

            {/* Section: Message */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-black text-xs uppercase tracking-widest text-ink/50">
                  Message
                </span>
                <div className="flex-1 h-px bg-ink/10" />
              </div>

              <div className="space-y-4">
                <Field label="Target Email">
                  <Input
                    type="email"
                    placeholder="recipient@domain.com"
                    value={form.to}
                    onChange={set("to")}
                    required
                    disabled={loading}
                  />
                </Field>

                <Field label="Subject (optional)">
                  <Input
                    type="text"
                    placeholder="Leave blank for default subject"
                    value={form.subject}
                    onChange={set("subject")}
                    disabled={loading}
                    className="font-sans"
                  />
                </Field>

                {/* Format toggle */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-ink/50">
                    Format
                  </label>
                  <div className="flex rounded-xl border border-ink overflow-hidden">
                    {["plain", "html"].map((f) => (
                      <button
                        key={f}
                        type="button"
                        disabled={loading}
                        onClick={() => setForm((v) => ({ ...v, format: f }))}
                        className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-colors ${
                          form.format === f
                            ? "bg-ink text-cream"
                            : "bg-parchment text-ink/50 hover:text-ink"
                        }`}
                      >
                        {f === "plain" ? "Plain Text" : "HTML"}
                      </button>
                    ))}
                  </div>
                </div>

                <Field label={`Body (optional — ${form.format === "html" ? "HTML" : "plain text"})`}>
                  <textarea
                    rows={6}
                    placeholder={
                      form.format === "html"
                        ? "Leave blank to use the default branded HTML email"
                        : "Leave blank to use the default plain text message"
                    }
                    value={form.body}
                    onChange={set("body")}
                    disabled={loading}
                    className="bg-parchment border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] transition-shadow disabled:opacity-50 w-full resize-y"
                  />
                </Field>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="bg-ink text-cream font-bold text-sm px-7 py-3 rounded-xl flex items-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {loading ? "Sending…" : "Send Verification Email"}
              </button>
            </div>
          </motion.div>
        </form>

        {/* Result / Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 flex items-start gap-3 bg-parchment border border-ink rounded-xl px-5 py-4 shadow-[4px_4px_0px_0px_#10380b]"
            >
              <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-ink">Delivery Failed</p>
                <p className="text-sm font-semibold text-ink/70 mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 rounded-2xl border border-ink bg-parchment p-6 shadow-[4px_4px_0px_0px_#10380b] space-y-4"
            >
              {/* Status badge */}
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-fern shrink-0" />
                <span className="font-black text-lg text-ink">Email Delivered</span>
                <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-black text-ink/50">
                  <Clock size={11} />
                  {result.elapsedMs}ms
                </span>
              </div>

              <div className="space-y-0">
                {[
                  { label: "Message ID", value: result.messageId, mono: true },
                  { label: "Accepted", value: result.accepted?.join(", ") || "—", mono: true },
                  { label: "Rejected", value: result.rejected?.length ? result.rejected.join(", ") : "None", mono: true },
                  { label: "Server Response", value: result.response, mono: true },
                ].map(({ label, value, mono }) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-4 py-2.5 border-b border-ink/8 last:border-0"
                  >
                    <span className="text-[11px] font-bold text-ink/45 uppercase tracking-wide shrink-0 mt-0.5 w-36">
                      {label}
                    </span>
                    <span
                      className={`text-sm font-semibold text-ink text-right break-all ${mono ? "font-mono" : ""}`}
                    >
                      {value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!result && !error && !loading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12 text-sm font-semibold text-ink/30"
          >
            Fill in your SMTP credentials and a target address, then click Send.
          </motion.p>
        )}
      </div>

      <Footer maxWidth="max-w-4xl" />
    </main>
  );
}
