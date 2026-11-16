"use client";

import { useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Send,
  Loader2,
  ChevronRight,
  AlertCircle,
  Plus,
  Trash2,
  Copy,
  Check,
  Clock,
  ArrowDownUp,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ── constants ───────────────────────────────────────────────────────────────

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

const METHOD_COLORS = {
  GET: "bg-fern/20 text-fern border-fern/40",
  POST: "bg-marigold/60 text-ink border-marigold",
  PUT: "bg-blue-100 text-blue-700 border-blue-300",
  PATCH: "bg-purple-100 text-purple-700 border-purple-300",
  DELETE: "bg-red-100 text-red-700 border-red-300",
  HEAD: "bg-sage text-ink border-ink/20",
  OPTIONS: "bg-sage text-ink border-ink/20",
};

const STATUS_COLORS = {
  2: "bg-fern/20 text-fern border-fern/40",
  3: "bg-blue-100 text-blue-700 border-blue-300",
  4: "bg-amber-100 text-amber-800 border-amber-300",
  5: "bg-red-100 text-red-700 border-red-300",
};

const CONTENT_TYPES = [
  { label: "JSON", value: "application/json" },
  { label: "XML", value: "application/xml" },
  { label: "Text", value: "text/plain" },
  { label: "Form URL-Encoded", value: "application/x-www-form-urlencoded" },
];

const PRESETS = [
  { label: "GET httpbin", method: "GET", url: "https://httpbin.org/get" },
  { label: "POST httpbin", method: "POST", url: "https://httpbin.org/post", body: '{"hello": "world"}', contentType: "application/json" },
  { label: "JSONPlaceholder", method: "GET", url: "https://jsonplaceholder.typicode.com/posts/1" },
  { label: "Headers echo", method: "GET", url: "https://httpbin.org/headers" },
];

// ── helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function tryPrettyJson(str) {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}

// ── KeyValueEditor ───────────────────────────────────────────────────────────

function KeyValueEditor({ pairs, onChange, disabled }) {
  function updatePair(index, field, value) {
    const next = pairs.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    onChange(next);
  }

  function addPair() {
    onChange([...pairs, { key: "", value: "", enabled: true }]);
  }

  function removePair(index) {
    onChange(pairs.filter((_, i) => i !== index));
  }

  function togglePair(index) {
    const next = pairs.map((p, i) =>
      i === index ? { ...p, enabled: !p.enabled } : p
    );
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {pairs.map((pair, i) => (
        <div key={i} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => togglePair(i)}
            disabled={disabled}
            className={`w-4 h-4 rounded border-2 shrink-0 transition-colors cursor-pointer ${
              pair.enabled
                ? "bg-fern border-fern"
                : "bg-transparent border-ink/30"
            }`}
          />
          <input
            type="text"
            value={pair.key}
            onChange={(e) => updatePair(i, "key", e.target.value)}
            placeholder="Key"
            disabled={disabled}
            className="flex-1 bg-cream border border-ink/20 rounded-lg px-3 py-1.5 font-mono text-xs text-ink placeholder:text-ink/30 outline-none focus:border-ink transition-colors disabled:opacity-50"
          />
          <input
            type="text"
            value={pair.value}
            onChange={(e) => updatePair(i, "value", e.target.value)}
            placeholder="Value"
            disabled={disabled}
            className="flex-1 bg-cream border border-ink/20 rounded-lg px-3 py-1.5 font-mono text-xs text-ink placeholder:text-ink/30 outline-none focus:border-ink transition-colors disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => removePair(i)}
            disabled={disabled}
            className="text-ink/30 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addPair}
        disabled={disabled}
        className="flex items-center gap-1.5 text-xs font-bold text-ink/50 hover:text-ink transition-colors cursor-pointer disabled:opacity-50"
      >
        <Plus size={12} />
        Add Header
      </button>
    </div>
  );
}

// ── ResponsePanel ────────────────────────────────────────────────────────────

function ResponsePanel({ response }) {
  const [tab, setTab] = useState("body");
  const [copied, setCopied] = useState(false);

  const statusGroup = Math.floor(response.status / 100);
  const statusColor = STATUS_COLORS[statusGroup] || "bg-ink/10 text-ink border-ink/20";

  function handleCopy() {
    navigator.clipboard.writeText(response.body || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isJson = response.headers?.["content-type"]?.includes("json");
  const displayBody = isJson ? tryPrettyJson(response.body) : response.body;

  return (
    <div className="rounded-2xl border border-ink bg-parchment shadow-[4px_4px_0px_0px_#10380b] overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-ink/10 flex-wrap">
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-black px-3 py-1 rounded-full border uppercase tracking-wider ${statusColor}`}
          >
            {response.status} {response.statusText}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-ink/50">
            <Clock size={11} />
            {response.timing} ms
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-ink/50">
            <ArrowDownUp size={11} />
            {formatBytes(response.size)}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-bold text-ink/50 hover:text-ink transition-colors cursor-pointer"
        >
          {copied ? <Check size={12} className="text-fern" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy Body"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 pt-3">
        {["body", "headers"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              tab === t
                ? "bg-ink text-cream"
                : "text-ink/50 hover:text-ink hover:bg-ink/5"
            }`}
          >
            {t === "body" ? "Body" : `Headers (${Object.keys(response.headers || {}).length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        {tab === "body" ? (
          <pre className="bg-cream border border-ink/10 rounded-xl p-4 text-xs font-mono text-ink overflow-x-auto max-h-[500px] overflow-y-auto leading-relaxed whitespace-pre-wrap break-all">
            {displayBody || "(empty response body)"}
          </pre>
        ) : (
          <div className="space-y-1">
            {Object.entries(response.headers || {}).map(([key, value]) => (
              <div
                key={key}
                className="flex gap-2 text-xs py-1.5 border-b border-ink/5 last:border-0"
              >
                <span className="font-bold text-ink/60 shrink-0 font-mono">
                  {key}:
                </span>
                <span className="font-mono text-ink break-all">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── HistoryEntry ─────────────────────────────────────────────────────────────

function HistoryEntry({ entry, onReplay }) {
  const statusGroup = Math.floor((entry.response?.status || 0) / 100);
  const statusColor = STATUS_COLORS[statusGroup] || "bg-ink/10 text-ink border-ink/20";

  return (
    <button
      type="button"
      onClick={onReplay}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-cream/60 transition-colors cursor-pointer"
    >
      <span
        className={`text-[9px] font-black px-2 py-0.5 rounded border tracking-wider shrink-0 ${
          METHOD_COLORS[entry.method] || "bg-ink/10 text-ink border-ink/20"
        }`}
      >
        {entry.method}
      </span>
      <span className="flex-1 text-xs font-mono font-semibold text-ink truncate">
        {entry.url}
      </span>
      {entry.response && (
        <span
          className={`text-[9px] font-black px-2 py-0.5 rounded border shrink-0 ${statusColor}`}
        >
          {entry.response.status}
        </span>
      )}
      <span className="text-[10px] text-ink/30 font-semibold shrink-0">
        {entry.response?.timing}ms
      </span>
    </button>
  );
}

// ── Inner page ───────────────────────────────────────────────────────────────

function HttpClientInner() {
  // Request state
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState([
    { key: "Accept", value: "application/json", enabled: true },
  ]);
  const [bodyContent, setBodyContent] = useState("");
  const [contentType, setContentType] = useState("application/json");
  const [authType, setAuthType] = useState("none");
  const [authUser, setAuthUser] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authToken, setAuthToken] = useState("");

  // UI state
  const [activeTab, setActiveTab] = useState("headers");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [methodOpen, setMethodOpen] = useState(false);

  const hasBody = !["GET", "HEAD", "OPTIONS"].includes(method);

  const sendRequest = useCallback(
    async (overrides = {}) => {
      const reqMethod = overrides.method || method;
      const reqUrl = overrides.url || url.trim();
      if (!reqUrl) return;

      setLoading(true);
      setError(null);
      setResponse(null);

      // Build final headers
      const finalHeaders = {};
      const reqHeaders = overrides.headers || headers;
      reqHeaders
        .filter((h) => h.enabled && h.key.trim())
        .forEach((h) => {
          finalHeaders[h.key.trim()] = h.value;
        });

      // Auth
      const reqAuthType = overrides.authType || authType;
      if (reqAuthType === "basic") {
        const u = overrides.authUser || authUser;
        const p = overrides.authPass || authPass;
        finalHeaders["Authorization"] = `Basic ${btoa(`${u}:${p}`)}`;
      } else if (reqAuthType === "bearer") {
        const t = overrides.authToken || authToken;
        finalHeaders["Authorization"] = `Bearer ${t}`;
      }

      // Content-Type for body methods
      const reqContentType = overrides.contentType || contentType;
      const reqBody = overrides.body ?? bodyContent;
      if (!["GET", "HEAD", "OPTIONS"].includes(reqMethod) && reqBody) {
        finalHeaders["Content-Type"] = reqContentType;
      }

      const payload = {
        url: reqUrl,
        method: reqMethod,
        headers: finalHeaders,
      };

      if (!["GET", "HEAD", "OPTIONS"].includes(reqMethod) && reqBody) {
        payload.body = reqBody;
      }

      try {
        const res = await fetch("/api/http-client", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          setError(json.error?.message || "Request failed");
        } else {
          setResponse(json.data);
          setHistory((prev) => [
            { method: reqMethod, url: reqUrl, response: json.data, timestamp: Date.now() },
            ...prev.slice(0, 9),
          ]);
        }
      } catch {
        setError("Network error while sending request.");
      } finally {
        setLoading(false);
      }
    },
    [method, url, headers, bodyContent, contentType, authType, authUser, authPass, authToken]
  );

  function handleSubmit(e) {
    e.preventDefault();
    sendRequest();
  }

  function applyPreset(preset) {
    setMethod(preset.method);
    setUrl(preset.url);
    if (preset.body) {
      setBodyContent(preset.body);
      setContentType(preset.contentType || "application/json");
      setActiveTab("body");
    }
    sendRequest({
      method: preset.method,
      url: preset.url,
      body: preset.body,
      contentType: preset.contentType,
      headers,
      authType,
    });
  }

  function replayHistory(entry) {
    setMethod(entry.method);
    setUrl(entry.url);
    sendRequest({ method: entry.method, url: entry.url, headers, authType });
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar maxWidth="max-w-6xl" />

      {/* Breadcrumb */}
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
            <span className="text-ink">HTTP Client</span>
          </div>
          {url && (
            <span className="text-xs font-mono font-bold text-ink/50 truncate max-w-xs">
              {method} {url}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 pt-10 pb-20">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 bg-ink rounded-xl flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#10380b]">
            <Zap size={20} className="text-marigold" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight leading-none">
              HTTP Client
            </h1>
            <p className="text-xs text-ink/40 font-semibold mt-0.5">
              Send API requests with custom methods, headers, and body
            </p>
          </div>
        </motion.div>

        {/* Request form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
          className="mb-4"
        >
          <label className="block text-xs font-bold uppercase tracking-widest text-ink/50 mb-2">
            Request
          </label>

          {/* Method + URL row */}
          <div className="flex gap-2 mb-3">
            {/* Method dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMethodOpen((v) => !v)}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-3 rounded-xl border font-black text-sm tracking-wider transition-all cursor-pointer disabled:opacity-50 ${
                  METHOD_COLORS[method] || "bg-ink/10 text-ink border-ink/20"
                }`}
              >
                {method}
                <ChevronDown
                  size={13}
                  className={`transition-transform ${methodOpen ? "rotate-180" : ""}`}
                />
              </button>
              {methodOpen && (
                <div className="absolute top-full left-0 mt-1 z-20 bg-parchment border border-ink rounded-xl shadow-[4px_4px_0px_0px_#10380b] overflow-hidden min-w-[120px]">
                  {METHODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMethod(m);
                        setMethodOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-black tracking-wider hover:bg-cream transition-colors cursor-pointer ${
                        m === method ? "bg-cream" : ""
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* URL input */}
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              disabled={loading}
              className="flex-1 bg-parchment border border-ink rounded-xl px-4 py-3 font-mono font-semibold text-sm text-ink placeholder:text-ink/30 outline-none focus:shadow-[4px_4px_0px_0px_#10380b] transition-shadow disabled:opacity-50"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="bg-ink text-cream font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none shrink-0"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
              {loading ? "Sending…" : "Send"}
            </button>
          </div>

          {/* Request config tabs */}
          <div className="rounded-2xl border border-ink bg-parchment shadow-[4px_4px_0px_0px_#10380b] overflow-hidden">
            {/* Tab bar */}
            <div className="flex gap-1 px-4 pt-3 pb-1">
              {["headers", ...(hasBody ? ["body"] : []), "auth"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer capitalize ${
                    activeTab === t
                      ? "bg-ink text-cream"
                      : "text-ink/50 hover:text-ink hover:bg-ink/5"
                  }`}
                >
                  {t === "headers"
                    ? `Headers (${headers.filter((h) => h.enabled && h.key).length})`
                    : t === "body"
                    ? "Body"
                    : "Auth"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="px-4 py-4">
              {/* Headers tab */}
              {activeTab === "headers" && (
                <KeyValueEditor
                  pairs={headers}
                  onChange={setHeaders}
                  disabled={loading}
                />
              )}

              {/* Body tab */}
              {activeTab === "body" && hasBody && (
                <div className="space-y-3">
                  <div className="flex gap-1">
                    {CONTENT_TYPES.map((ct) => (
                      <button
                        key={ct.value}
                        type="button"
                        onClick={() => setContentType(ct.value)}
                        disabled={loading}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          contentType === ct.value
                            ? "bg-ink text-cream"
                            : "text-ink/50 hover:text-ink border border-ink/10"
                        }`}
                      >
                        {ct.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={bodyContent}
                    onChange={(e) => setBodyContent(e.target.value)}
                    placeholder={
                      contentType === "application/json"
                        ? '{\n  "key": "value"\n}'
                        : "Request body..."
                    }
                    disabled={loading}
                    rows={8}
                    className="w-full bg-cream border border-ink/20 rounded-xl px-4 py-3 font-mono text-xs text-ink placeholder:text-ink/30 outline-none focus:border-ink transition-colors resize-y disabled:opacity-50"
                  />
                </div>
              )}

              {/* Auth tab */}
              {activeTab === "auth" && (
                <div className="space-y-3">
                  <div className="flex gap-1">
                    {[
                      { key: "none", label: "None" },
                      { key: "basic", label: "Basic Auth" },
                      { key: "bearer", label: "Bearer Token" },
                    ].map((a) => (
                      <button
                        key={a.key}
                        type="button"
                        onClick={() => setAuthType(a.key)}
                        disabled={loading}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          authType === a.key
                            ? "bg-ink text-cream"
                            : "text-ink/50 hover:text-ink border border-ink/10"
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>

                  {authType === "basic" && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          value={authUser}
                          onChange={(e) => setAuthUser(e.target.value)}
                          placeholder="username"
                          disabled={loading}
                          className="w-full bg-cream border border-ink/20 rounded-lg px-3 py-2 font-mono text-xs text-ink placeholder:text-ink/30 outline-none focus:border-ink transition-colors disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          value={authPass}
                          onChange={(e) => setAuthPass(e.target.value)}
                          placeholder="password"
                          disabled={loading}
                          className="w-full bg-cream border border-ink/20 rounded-lg px-3 py-2 font-mono text-xs text-ink placeholder:text-ink/30 outline-none focus:border-ink transition-colors disabled:opacity-50"
                        />
                      </div>
                    </div>
                  )}

                  {authType === "bearer" && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">
                        Token
                      </label>
                      <input
                        type="text"
                        value={authToken}
                        onChange={(e) => setAuthToken(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIs..."
                        disabled={loading}
                        className="w-full bg-cream border border-ink/20 rounded-lg px-3 py-2 font-mono text-xs text-ink placeholder:text-ink/30 outline-none focus:border-ink transition-colors disabled:opacity-50"
                      />
                    </div>
                  )}

                  {authType === "none" && (
                    <p className="text-xs text-ink/40 font-semibold py-2">
                      No authentication will be sent with the request.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.form>

        {/* Preset quick buttons */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          <span className="text-[11px] font-bold text-ink/40">Try:</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border border-ink/20 bg-cream hover:bg-parchment text-ink/70 hover:text-ink transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 bg-red-50 border border-red-300 rounded-xl px-4 py-3 mb-6 shadow-[2px_2px_0px_0px_#991b1b]"
            >
              <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
              <div className="text-sm font-semibold text-red-900">{error}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Response */}
        <AnimatePresence>
          {response && !loading && !error && (
            <motion.div
              key="response"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-ink/50">
                  Response
                </span>
                <div className="flex-1 h-px bg-ink/10" />
              </div>
              <ResponsePanel response={response} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-ink/50">
                History ({history.length})
              </span>
              <div className="flex-1 h-px bg-ink/10" />
            </div>
            <div className="rounded-2xl border border-ink bg-parchment shadow-[4px_4px_0px_0px_#10380b] p-2 space-y-0.5">
              {history.map((entry, i) => (
                <HistoryEntry
                  key={`${entry.timestamp}-${i}`}
                  entry={entry}
                  onReplay={() => replayHistory(entry)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!response && !loading && !error && history.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16 text-sm font-semibold text-ink/30"
          >
            Enter a URL above and click Send to test any API endpoint.
          </motion.p>
        )}
      </div>

      <Footer />
    </main>
  );
}

// ── Export Wrapped in Suspense ────────────────────────────────────────────────

export default function HttpClientPage() {
  return (
    <Suspense>
      <HttpClientInner />
    </Suspense>
  );
}
