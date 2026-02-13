import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        if (import.meta.env.DEV) {
            console.error("ErrorBoundary caught:", error, info.componentStack);
        }
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
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
                <div style={{ fontSize: "3rem", opacity: 0.4 }}>🌱</div>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 500, letterSpacing: "0.05em" }}>
                    Something went wrong
                </h1>
                <p style={{ fontSize: "0.875rem", color: "#a1a1aa", maxWidth: "24rem" }}>
                    An unexpected error occurred. Please refresh the page to continue your focus session.
                </p>
                <button
                    onClick={() => window.location.reload()}
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
        );
    }
}
