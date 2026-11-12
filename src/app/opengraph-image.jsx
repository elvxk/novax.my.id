import { ImageResponse } from "next/og";

export const alt = "Nova-X — Network & Security Diagnostics";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#fdf8ed",
          padding: "48px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "4px solid #10380b",
            borderRadius: "28px",
            backgroundColor: "#fcf6e8",
            boxShadow: "10px 10px 0px #10380b",
            padding: "44px 52px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  backgroundColor: "#10380b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "3px 3px 0px #10380b",
                }}
              >
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line
                    x1="26"
                    y1="26"
                    x2="74"
                    y2="74"
                    stroke="#30be60"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="74"
                    y1="26"
                    x2="26"
                    y2="74"
                    stroke="#30be60"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                  />
                  <path
                    d="M50 18 C50 36 36 50 18 50 C36 50 50 64 50 82 C50 64 64 50 82 50 C64 50 50 36 50 18 Z"
                    fill="#fce519"
                  />
                  <circle cx="50" cy="50" r="5" fill="#10380b" />
                  <circle cx="50" cy="50" r="2" fill="#ffffff" />
                </svg>
              </div>
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: 900,
                  color: "#10380b",
                  letterSpacing: "-0.03em",
                }}
              >
                Nova-X
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#fce519",
                border: "2px solid #10380b",
                borderRadius: "9999px",
                padding: "8px 20px",
                boxShadow: "3px 3px 0px #10380b",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#10380b",
                }}
              />
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#10380b",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                SYSADMIN UTILITIES
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h1
              style={{
                fontSize: "56px",
                fontWeight: 900,
                color: "#10380b",
                lineHeight: 1.1,
                margin: 0,
                letterSpacing: "-0.03em",
              }}
            >
              Network & Security Diagnostics
            </h1>
            <p
              style={{
                fontSize: "22px",
                fontWeight: 600,
                color: "rgba(16, 56, 11, 0.75)",
                lineHeight: 1.4,
                margin: 0,
                maxWidth: "920px",
              }}
            >
              Authoritative DNS resolution, IP geolocation, proxy pre-DNS preview,
              server license verification, and SMTP diagnostics.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "24px",
              borderTop: "2px solid rgba(16, 56, 11, 0.15)",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {[
                "DNS & RDAP",
                "IP Geolocation",
                "SSL / TLS",
                "Proxy Preview",
                "License Check",
                "SMTP Delivery",
                "Subdomain Recon",
              ].map((name) => (
                <div
                  key={name}
                  style={{
                    backgroundColor: "#e8eed9",
                    border: "1.5px solid #10380b",
                    borderRadius: "8px",
                    padding: "6px 14px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#10380b",
                  }}
                >
                  {name}
                </div>
              ))}
            </div>

            <span
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "#10380b",
                letterSpacing: "0.02em",
              }}
            >
              novax.my.id
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}