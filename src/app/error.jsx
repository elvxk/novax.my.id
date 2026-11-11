"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ErrorBoundary({ error, retry, reset }) {
  const handleRetry = retry || reset;

  useEffect(() => {
    // Log unexpected runtime errors
    console.error("App Router Caught Error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col justify-between">
      <Navbar maxWidth="max-w-6xl" />

      <section className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16">
        <div className="w-full max-w-xl mx-auto text-center">
          {/* Diagnostic Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 bg-amber-200 text-ink font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-[3px_3px_0px_0px_#10380b]">
              <AlertTriangle size={13} className="text-amber-800" />
              Status 500 • Runtime Exception
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-ink tracking-tight mb-3">
            System Interrupt
          </h1>

          <p className="text-sm font-semibold text-ink/45 tracking-wide mb-2 font-mono">
            {"// 500_UNHANDLED_EXCEPTION"}
          </p>

          <p className="text-sm sm:text-base text-ink/65 font-medium max-w-md mx-auto leading-relaxed mb-8">
            An unexpected error occurred during operation. The system diagnostic
            trace has recorded this event.
          </p>

          {/* Diagnostic box */}
          <div className="bg-parchment border border-ink rounded-2xl p-4 shadow-[4px_4px_0px_0px_#10380b] mb-8 max-w-md mx-auto text-left">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-ink/10 text-[10px] font-bold uppercase tracking-wider text-ink/40">
              <span>Exception Details</span>
              <span className="text-red-700 font-mono font-bold">
                {error?.digest ? `ID: ${error.digest.slice(0, 10)}` : "ERR_RUNTIME"}
              </span>
            </div>
            <div className="font-mono text-xs text-ink/80 space-y-1 break-words">
              <div>
                <span className="text-ink/40">MESSAGE : </span>
                {error?.message || "Internal application error"}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {handleRetry && (
              <button
                type="button"
                onClick={() => handleRetry()}
                className="inline-flex items-center gap-2 bg-ink text-cream font-bold text-sm px-6 py-3 rounded-xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-novax transition-all duration-150 cursor-pointer"
              >
                <RotateCcw size={15} />
                Try Again
              </button>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-parchment border border-ink text-ink font-bold text-sm px-6 py-3 rounded-xl hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#10380b] transition-all duration-150"
            >
              <Home size={15} />
              Return Home
            </Link>
          </div>
        </div>
      </section>

      <Footer maxWidth="max-w-6xl" />
    </main>
  );
}
