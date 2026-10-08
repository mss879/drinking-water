"use client";

import { useEffect } from "react";
import { defaultSettings } from "@/content/site";

const { salesEmail, phones } = defaultSettings.contact;

/**
 * The last resort, for an error in the root layout itself. It replaces the whole document and gets none of the
 * site's styles, so it carries its own, in the brand sheet's colours.
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en-LK">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#f6fafe",
          color: "#545454",
          fontFamily: "Montserrat, system-ui, -apple-system, 'Segoe UI', sans-serif",
          textAlign: "center",
        }}
      >
        <main style={{ maxWidth: "32rem" }}>
          <p style={{ margin: 0, fontWeight: 700, letterSpacing: "0.16em", color: "#0055A8" }}>LUSAKO</p>
          <h1 style={{ margin: "16px 0 0", color: "#0A0A0D", fontSize: "1.75rem", lineHeight: 1.2 }}>Something went wrong</h1>
          <p style={{ margin: "12px 0 0", lineHeight: 1.6 }}>
            Please try again in a moment. If it keeps happening, email {salesEmail} or call {phones[0]}.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: "24px",
              padding: "12px 28px",
              border: 0,
              borderRadius: "999px",
              background: "#0055A8",
              color: "#ffffff",
              font: "inherit",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
