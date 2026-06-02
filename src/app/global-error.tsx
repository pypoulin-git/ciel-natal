"use client";

// App Router root-level error boundary. Catches errors in the root layout +
// React render errors that escape every other boundary. Required by the
// Sentry Next.js skill so server-side exceptions surface in the dashboard.
//
// Privacy: we deliberately do NOT attach the user or any chart context here.
// Sentry's `beforeSend` (instrumentation-client.ts) also scrubs query strings
// before send.

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#0f0f16",
          color: "#e8e6f0",
          fontFamily: "system-ui, -apple-system, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: 480 }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}>
            ✦
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 400, marginBottom: "1rem" }}>
            Le ciel rencontre un nuage
          </h1>
          <p style={{ fontSize: "0.95rem", opacity: 0.7, lineHeight: 1.6, marginBottom: "1.5rem" }}>
            Une erreur inattendue est survenue. Notre équipe en a été
            informée. Tu peux essayer de recharger la page ou revenir à
            l&apos;accueil.
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              background: "#b894c5",
              color: "#0f0f16",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
          >
            ← Retour à l&apos;accueil
          </a>
        </div>
      </body>
    </html>
  );
}
