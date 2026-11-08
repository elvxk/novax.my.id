import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CommandPalette from "@/components/CommandPalette";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Nova-X",
  description:
    "DNS lookup, IP geolocation, proxy detection, license checks and more. Network tools for developers and sysadmins. No sign-up required.",
  metadataBase: new URL("https://novax.my.id"),
  openGraph: {
    title: "Nova-X",
    description: "DNS lookup, IP geolocation, proxy detection, and more. Network tools, no sign-up required.",
    url: "https://novax.my.id",
    siteName: "Nova-X",
    locale: "en_US",
    type: "website",
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
