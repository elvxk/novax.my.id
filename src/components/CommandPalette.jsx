"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ArrowRight,
  ExternalLink,
  Lock,
  Globe,
  FileCode2,
  Home,
  Layers,
} from "lucide-react";
import { TOOLS, ICON_MAP } from "@/lib/tools";

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toolsList, setToolsList] = useState(TOOLS);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Sync with PostgreSQL database
  useEffect(() => {
    fetch("/api/tools")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setToolsList(
            json.data.map((t) => ({
              ...t,
              icon: ICON_MAP[t.iconName] || Globe,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Global key listener for Ctrl+K, Cmd+K, and custom open event
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            setQuery("");
            setSelectedIndex(0);
          }
          return !prev;
        });
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    }

    function handleOpenEvent() {
      setQuery("");
      setSelectedIndex(0);
      setOpen(true);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleOpenEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleOpenEvent);
    };
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Navigation shortcuts list + tools
  const allItems = [
    ...toolsList.map((t) => ({
      id: `tool-${t.id}`,
      title: t.name,
      desc: t.desc,
      icon: t.icon,
      href: t.href,
      live: t.live,
      tags: t.tags,
      category: "Tools",
    })),
    {
      id: "nav-tools",
      title: "Tools Catalog",
      desc: "View all network and security utilities in one catalog.",
      icon: Layers,
      href: "/tools",
      live: true,
      tags: ["Catalog", "All"],
      category: "Navigation",
    },
    {
      id: "nav-docs",
      title: "API Documentation",
      desc: "Interactive reference for consuming Nova-X tools programmatically.",
      icon: FileCode2,
      href: "/docs",
      live: true,
      tags: ["API", "cURL", "REST"],
      category: "Navigation",
    },
    {
      id: "nav-home",
      title: "Home",
      desc: "Return to the Nova-X homepage.",
      icon: Home,
      href: "/",
      live: true,
      tags: ["Home"],
      category: "Navigation",
    },
  ];

  // Filter items
  const filtered = allItems.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const matchTitle = item.title.toLowerCase().includes(q);
    const matchDesc = item.desc?.toLowerCase().includes(q);
    const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
    return matchTitle || matchDesc || matchTags;
  });

  // Keyboard navigation within list
  function handleInputKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      scrollSelectedIntoView((selectedIndex + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? filtered.length - 1 : prev - 1
      );
      scrollSelectedIntoView(
        selectedIndex === 0 ? filtered.length - 1 : selectedIndex - 1
      );
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    }
  }

  function scrollSelectedIntoView(idx) {
    const el = listRef.current?.children[idx];
    if (el) {
      el.scrollIntoView({ block: "nearest" });
    }
  }

  function handleSelect(item) {
    if (!item.live) return;
    setOpen(false);
    router.push(item.href);
  }

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-ink/45 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full max-w-xl bg-parchment border-2 border-ink rounded-2xl shadow-novax overflow-hidden flex flex-col"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-ink/15 bg-cream">
              <Search size={18} className="text-ink/50 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Search tools, APIs, or shortcuts… (e.g. dns, geo, license)"
                className="flex-1 bg-transparent text-sm font-semibold text-ink placeholder:text-ink/35 outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 text-ink/40 hover:text-ink transition-colors"
                >
                  <X size={15} />
                </button>
              )}
              <kbd className="hidden sm:inline-block font-mono text-[10px] font-bold bg-parchment border border-ink/20 px-1.5 py-0.5 rounded text-ink/60">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div
              ref={listRef}
              className="max-h-[340px] overflow-y-auto p-2 divide-y divide-ink/8"
            >
              {filtered.length > 0 ? (
                filtered.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === selectedIndex;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={[
                        "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-100 select-none",
                        item.live ? "cursor-pointer" : "opacity-45 cursor-not-allowed",
                        isSelected
                          ? "bg-marigold text-ink shadow-[2px_2px_0px_0px_#10380b] translate-x-[2px]"
                          : "hover:bg-cream text-ink",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={[
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-ink/20",
                            isSelected ? "bg-parchment text-ink" : "bg-marigold text-ink",
                          ].join(" ")}
                        >
                          <Icon size={16} strokeWidth={2.2} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm truncate">
                              {item.title}
                            </span>
                            {item.live ? (
                              <span className="text-[9px] font-black uppercase tracking-wider bg-fern/30 text-ink px-1.5 py-0.2 rounded border border-fern/40">
                                Live
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-ink/10 text-ink/50 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                <Lock size={8} /> Offline
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] opacity-70 truncate max-w-sm font-medium">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isSelected && item.live && (
                          <span className="text-[10px] font-mono font-bold bg-ink text-cream px-1.5 py-0.5 rounded">
                            ↵
                          </span>
                        )}
                        {!item.live && <Lock size={12} className="opacity-40" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-xs font-semibold text-ink/40">
                  No matching tools or routes found for &ldquo;{query}&rdquo;
                </div>
              )}
            </div>

            {/* Footer Navigation Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-ink/15 bg-cream/70 text-[10px] font-mono font-bold text-ink/45 select-none">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Open</span>
                <span>Esc Close</span>
              </div>
              <span className="text-ink/60 font-sans font-bold">Nova-X Palette</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
