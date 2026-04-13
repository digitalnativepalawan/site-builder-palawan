import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Component, type ReactNode } from "react";
import App from "./App.tsx";
import "./index.css";

// ─── Error Boundary ──────────────────────────────────────────
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
          <h1 className="text-2xl font-heading font-bold mb-3">Something went wrong</h1>
          <p className="text-sm text-muted-foreground mb-6 max-w-md font-mono text-xs">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.href = "/"}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            Back to Step 1
          </button>
          <p className="mt-4 text-xs text-muted-foreground">
            {this.state.error?.stack?.split("\n")[0]}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Defined at module scope so it exists before the first render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

// Provider order: ErrorBoundary → QueryClientProvider → BrowserRouter → App
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);
