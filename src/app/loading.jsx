import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div
      className="flex-1 flex items-center justify-center min-h-[60vh] px-4"
      role="status"
      aria-label="Loading page content"
    >
      <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-parchment border border-ink shadow-[4px_4px_0px_0px_#10380b]">
        <Loader2 className="w-8 h-8 animate-spin text-ink" aria-hidden="true" />
        <span className="font-mono text-xs font-bold text-ink/70 tracking-wider uppercase">
          Initializing Stream...
        </span>
      </div>
    </div>
  );
}
