"use client";

// Last-resort boundary: it replaces the root layout, so it must render its own <html> and
// cannot rely on the app's CSS. Plain inline styles keep it readable even if everything else failed.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f5f7fa", color: "#0d1a2f" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "120px 20px", textAlign: "center" }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>Something went wrong</h1>
          <p style={{ color: "#475569", lineHeight: 1.6 }}>TechNova hit an unexpected problem. Please try again.</p>
          <button
            onClick={reset}
            style={{ marginTop: 16, padding: "12px 28px", borderRadius: 12, border: 0, background: "#1668f0", color: "#fff", fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
