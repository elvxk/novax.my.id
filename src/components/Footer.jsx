"use client";

import { useEffect, useRef } from "react";

export default function Footer({ maxWidth = "max-w-6xl" }) {
  const yearRef = useRef(null);

  useEffect(() => {
    if (yearRef.current) {
      yearRef.current.textContent = String(new Date().getFullYear());
    }
  }, []);

  return (
    <footer className="px-4 sm:px-6 py-4">
      <div className={`${maxWidth} mx-auto flex items-center justify-center gap-4`}>
        <div className="flex items-center justify-center flex-col">
          <p className="text-ink font-semibold text-xs opacity-40">
            © <span ref={yearRef}>2026</span> novax.my.id by{" "}
            <a
              href="https://pradipta.dev"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink underline transition-colors"
            >
              elvxk
            </a>{" "}
            · made with love
          </p>
        </div>
      </div>
    </footer>
  );
}
