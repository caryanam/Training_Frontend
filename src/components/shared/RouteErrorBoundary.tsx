import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export function RouteErrorBoundary() {
  const error = useRouteError();

  let errorMessage = "An unexpected error occurred.";
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || errorMessage;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 ring-8 ring-rose-500/5">
        <AlertCircle className="h-8 w-8" />
      </div>

      <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 mb-2">
        Error {errorStatus}
      </span>

      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mb-2">
        Something went wrong
      </h2>

      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
        {errorMessage}
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reload Page
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
        >
          <Home className="h-3.5 w-3.5" /> Go to Home
        </Link>
      </div>
    </div>
  );
}
