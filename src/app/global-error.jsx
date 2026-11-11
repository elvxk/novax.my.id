"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, retry, reset }) {
  const handleRetry = retry || reset;

  useEffect(() => {
    console.error("Global Layout Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: "40px 16px",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fdf8ed",
          color: "#10380b",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
            textAlign: "center",
            border: "2px solid #10380b",
            borderRadius: "16px",
            padding: "32px 24px",
            backgroundColor: "#fdf8ed",
            boxShadow: "5px 5px 0px 0px #10380b",
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontSize: "11px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              backgroundColor: "#fef08a",
              color: "#10380b",
              padding: "4px 12px",
              borderRadius: "9999px",
              marginBottom: "16px",
            }}
          >
            Fatal System Error
          </span>

          <h1
            style={{
              fontSize: "28px",
              fontWeight: 900,
              margin: "0 0 8px 0",
              letterSpacing: "-0.03em",
            }}
          >
            Critical Failure
          </h1>

          <p
            style={{
              fontSize: "14px",
              color: "rgba(16, 56, 11, 0.7)",
              lineHeight: 1.5,
              margin: "0 0 24px 0",
            }}
          >
            The root application layout experienced an unrecoverable runtime
            error.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            {handleRetry && (
              <button
                type="button"
                onClick={() => handleRetry()}
                style={{
                  backgroundColor: "#10380b",
                  color: "#fdf8ed",
                  fontWeight: 700,
                  fontSize: "13px",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Reload Application
              </button>
            )}
            <Link
              href="/"
              style={{
                backgroundColor: "#fdf8ed",
                color: "#10380b",
                fontWeight: 700,
                fontSize: "13px",
                padding: "10px 20px",
                borderRadius: "10px",
                border: "1.5px solid #10380b",
                textDecoration: "none",
                display: "inline-block",
                cursor: "pointer",
              }}
            >
              Go to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
