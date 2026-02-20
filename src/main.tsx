import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import { initAnalytics } from './lib/analytics'
import './index.css'
import App from './App.tsx'

Sentry.init({
  dsn: "https://943e92eca40c46d660b31b9a8cebf9e8@o4510836478377984.ingest.de.sentry.io/4510879155683408",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,
})

initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ resetError }) => (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Sora', sans-serif",
            background: "#0a0f1a",
            color: "#f5f5f7",
            gap: "1.5rem",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", opacity: 0.4 }}>{"\u{1F331}"}</div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 500, letterSpacing: "0.05em" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#a1a1aa", maxWidth: "24rem" }}>
            An unexpected error occurred. Please refresh the page to continue your focus session.
          </p>
          <button
            onClick={() => { resetError(); window.location.reload(); }}
            style={{
              marginTop: "0.5rem",
              padding: "0.75rem 2rem",
              borderRadius: "1rem",
              border: "1px solid rgba(245,245,247,0.1)",
              background: "rgba(245,245,247,0.05)",
              color: "#f5f5f7",
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              cursor: "pointer",
              fontFamily: "'Sora', sans-serif",
            }}
          >
            Refresh
          </button>
        </div>
      )}
    >
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
