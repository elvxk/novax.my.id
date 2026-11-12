import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CommandPalette from "@/components/CommandPalette";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport = {
  themeColor: "#fdf8ed",
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  title: {
    default: "Nova-X — Network & Security Diagnostics",
    template: "%s · Nova-X",
  },
  description:
    "Authoritative DNS resolution, IP geolocation, proxy pre-DNS preview, server license verification, and SMTP diagnostics. Fast, open, and CORS-enabled.",
  metadataBase: new URL("https://novax.my.id"),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "DNS lookup",
    "reverse DNS",
    "IP geolocation",
    "manual resolve",
    "proxy site",
    "web proxy",
    "cPanel license check",
    "CloudLinux check",
    "SMTP sender test",
    "RDAP WHOIS",
    "sysadmin tools",
  ],
  authors: [{ name: "Nova-X", url: "https://novax.my.id" }],
  creator: "Nova-X",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Nova-X — Network & Security Diagnostics",
    description:
      "Open network diagnostics and server utilities for developers and sysadmins. Fast, privacy-first, and CORS-enabled.",
    url: "https://novax.my.id",
    siteName: "Nova-X",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nova-X — Network & Security Diagnostics",
    description:
      "Open network diagnostics and server utilities for developers and sysadmins.",
  },
};

function DotGrid() {
  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="global-dots"
          x="0"
          y="0"
          width="28"
          height="28"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1.5" cy="1.5" r="1.5" fill="#10380b" opacity="0.12" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#global-dots)" />
    </svg>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen relative">
        <DotGrid />
        <CommandPalette />
        <div className="relative z-10 flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
