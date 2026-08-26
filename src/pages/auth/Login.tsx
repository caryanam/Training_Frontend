import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_DASHBOARD_PATHS } from "@/lib/constants";
import type { Role } from "@/lib/constants";
import {
  Code,
  Eye,
  EyeOff,
  Loader2,
  UserCheck,
  Sparkles,
  BookOpen,
  Briefcase,
  ShieldAlert,
  Database,
  CheckCircle2,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleFillDemoCredentials = async (targetRole: Role) => {
    setError("");
    let targetEmail = "";
    let targetPassword = "";

    switch (targetRole) {
      case "student":
        targetEmail = "student@codextechnology.com";
        targetPassword = "Password@123";
        break;
      case "faculty":
        targetEmail = "faculty@codex.com";
        targetPassword = "ChangeMe@123";
        break;
      case "executor":
        targetEmail = "dsapkal141@gmail.com";
        targetPassword = "ChangeMe@123";
        break;
      case "admin":
        targetEmail = "admin@gmail.com";
        targetPassword = "admin@123";
        break;
    }

    setEmail(targetEmail);
    setPassword(targetPassword);
    setInfoMsg(`Loaded ${targetRole.toUpperCase()} credentials. Authenticating...`);
    setLoading(true);

    try {
      const result = await signIn(targetEmail, targetPassword);
      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }
      const rawRole = (result as any).role?.toString() || targetRole;
      const cleanRole = (rawRole.toLowerCase().replace(/^role_/, "").trim() as Role) || targetRole;
      if (cleanRole && ROLE_DASHBOARD_PATHS[cleanRole]) {
        navigate(ROLE_DASHBOARD_PATHS[cleanRole], { replace: true });
      } else {
        navigate("/student", { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");
    setLoading(true);

    try {
      const result = await signIn(email.trim(), password);

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      const rawRole = (result as any).role?.toString();
      const cleanRole = rawRole ? (rawRole.toLowerCase().replace(/^role_/, "").trim() as Role) : undefined;
      if (cleanRole && ROLE_DASHBOARD_PATHS[cleanRole]) {
        navigate(ROLE_DASHBOARD_PATHS[cleanRole], { replace: true });
      } else {
        navigate("/student", { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel — Enterprise LMS branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-12 text-white">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20 ring-1 ring-indigo-400/30 backdrop-blur-md">
              <Code className="h-6 w-6 text-indigo-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">CodeX Technology</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-400/20 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Production-Ready Architecture
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl leading-tight mb-6 text-white">
            Complete Course & Lecture Management Platform
          </h1>
          <p className="text-indigo-200/80 text-lg leading-relaxed max-w-lg mb-8">
            Tailored role-based portals for Students, Faculty, Executors, and Admins with calendar validity, secure lecture access, and payment verification.
          </p>

          {/* Quick role highlight pills */}
          <div className="grid grid-cols-2 gap-3 max-w-md pt-4">
            <div className="rounded-lg bg-white/5 p-3.5 ring-1 ring-white/10 backdrop-blur-sm">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-400" /> Student Portal
              </div>
              <div className="text-xs text-indigo-200/70 mt-1">Course progress, validity countdown & lecture links</div>
            </div>
            <div className="rounded-lg bg-white/5 p-3.5 ring-1 ring-white/10 backdrop-blur-sm">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-400" /> Faculty Portal
              </div>
              <div className="text-xs text-indigo-200/70 mt-1">Lecture management, live links & downloads</div>
            </div>
            <div className="rounded-lg bg-white/5 p-3.5 ring-1 ring-white/10 backdrop-blur-sm">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-amber-400" /> Executor Portal
              </div>
              <div className="text-xs text-indigo-200/70 mt-1">Onboarding pipeline & follow-up tracking</div>
            </div>
            <div className="rounded-lg bg-white/5 p-3.5 ring-1 ring-white/10 backdrop-blur-sm">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" /> Admin Command
              </div>
              <div className="text-xs text-indigo-200/70 mt-1">Analytics, access control & audit logs</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-indigo-300/60 border-t border-white/10 pt-4 flex items-center justify-between">
          <span>Enterprise SaaS LMS v2.0</span>
          <span className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5" />
            Spring Boot REST API + React
          </span>
        </div>
      </div>

      {/* Right panel — Login form & Demo Credentials */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="mx-auto w-full max-w-[440px]">
          {/* Mobile branding */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Code className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-foreground">CodeX Technology</span>
          </div>

          {/* Demo Mode Credentials Helper */}
          <div className="mb-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Demo Credentials
              </span>
              <span className="text-[11px] rounded-full bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 font-medium text-indigo-700 dark:text-indigo-300">
                Click to Pre-fill
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Click any role to load its login credentials into the form, then click Sign In to authenticate:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemoCredentials("student")}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-xs hover:border-primary hover:bg-primary/5 hover:text-primary transition-all text-left cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <div>
                  <div className="font-semibold">Student</div>
                  <div className="text-[10px] text-muted-foreground">Rahul Sharma</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemoCredentials("faculty")}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-xs hover:border-emerald-500 hover:bg-emerald-500/5 hover:text-emerald-600 transition-all text-left cursor-pointer"
              >
                <UserCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-semibold">Faculty</div>
                  <div className="text-[10px] text-muted-foreground">Dr. Rajesh</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemoCredentials("executor")}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-xs hover:border-amber-500 hover:bg-amber-500/5 hover:text-amber-600 transition-all text-left cursor-pointer"
              >
                <Briefcase className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <div>
                  <div className="font-semibold">Executor</div>
                  <div className="text-[10px] text-muted-foreground">Dinesh Sapkla</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemoCredentials("admin")}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-xs hover:border-rose-500 hover:bg-rose-500/5 hover:text-rose-600 transition-all text-left cursor-pointer"
              >
                <ShieldAlert className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                <div>
                  <div className="font-semibold">Admin</div>
                  <div className="text-[10px] text-muted-foreground">System Admin</div>
                </div>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1">
              Sign In
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {infoMsg && (
            <div className="mb-6 rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-3 text-xs font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {infoMsg}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@gmail.com"
                required
                className="flex h-11 w-full rounded-lg border border-input bg-background px-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-4 pr-11 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline transition-colors"
            >
              Register as Student
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
