import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <ShieldX className="mx-auto h-16 w-16 text-destructive/50 mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Access Denied
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          You don't have permission to access this page.
        </p>
        <Link
          to="/"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
