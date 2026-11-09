"use client";

import Link from "next/link";
import { Search } from "lucide-react";

export default function Navbar({ maxWidth = "max-w-6xl" }) {
  return (
    <header className="px-4 sm:px-6 py-3 border-b border-ink/15 bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
      <nav className={`${maxWidth} mx-auto flex items-center justify-between gap-4`}>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-novax transition-all duration-150 overflow-hidden shrink-0">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect width="100" height="100" rx="22" fill="#10380b" />
              <line x1="26" y1="26" x2="74" y2="74" stroke="#30be60" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="4 4" />
              <line x1="74" y1="26" x2="26" y2="74" stroke="#30be60" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="4 4" />
              <path d="M50 18 C50 36 36 50 18 50 C36 50 50 64 50 82 C50 64 64 50 82 50 C64 50 50 36 50 18 Z" fill="#fce519" />
              <circle cx="50" cy="50" r="5" fill="#10380b" />
              <circle cx="50" cy="50" r="2" fill="#ffffff" />
            </svg>
          </div>
          <span className="text-ink font-extrabold text-base tracking-tight">Nova-X</span>
        </Link>

        {/* Right cluster: subtle search icon, links & CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
            title="Search tools (Ctrl+K)"
            aria-label="Search tools (Ctrl+K)"
            className="w-8 h-8 rounded-lg border border-ink/20 bg-parchment flex items-center justify-center text-ink/60 hover:text-ink hover:border-ink hover:shadow-[2px_2px_0px_0px_#10380b] transition-all"
          >
            <Search size={14} />
          </button>

          <Link
            href="/docs"
            className="text-xs font-bold text-ink/70 hover:text-ink transition-colors px-1.5 py-1"
          >
            API Docs
          </Link>
          <Link
            href="/tools"
            className="bg-ink text-cream font-bold text-xs px-4 py-2 rounded-full hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150 shrink-0"
          >
            Explore Tools
          </Link>
        </div>
      </nav>
    </header>
  );
}
