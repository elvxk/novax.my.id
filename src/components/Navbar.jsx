"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import Logo from "@/components/Logo";

export default function Navbar({ maxWidth = "max-w-6xl" }) {
  return (
    <header className="px-4 sm:px-6 py-3 border-b border-ink/15 bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
      <nav className={`${maxWidth} mx-auto flex items-center justify-between gap-4`}>

        {/* Logo */}
        <Link
          href="/"
          className="group shrink-0 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform duration-150"
        >
          <Logo
            size={32}
            withText
            iconClassName="group-hover:shadow-novax transition-all duration-150"
          />
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
