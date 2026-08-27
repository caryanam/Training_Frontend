import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_DASHBOARD_PATHS, type Role } from "@/lib/constants";
import {
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  Laptop,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");
    setLoading(true);

    try {
      const result = await signIn(email.trim(), password);

      if (result.error) {
        setError(result.error.message || "Invalid email or password");
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
      const msg = err instanceof Error ? err.message : "Invalid email or password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      
      {/* LEFT PANEL — Dark Forest Green LMS Branding (Full height, zero overflow) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#012b18] p-8 xl:p-12 text-white relative overflow-hidden border-r border-[#024d2b]/30 h-full">
        
        {/* Subtle Background Pattern */}
        <div className="absolute top-6 right-8 h-44 w-44 bg-[radial-gradient(#026637_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-35 pointer-events-none" />
        
        <div className="relative z-10 space-y-5 xl:space-y-6">
          {/* Top Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#026637] text-white shadow-lg shadow-[#026637]/30 ring-1 ring-white/20">
              <Sparkles className="h-5 w-5 text-[#a3e6ba]" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white block leading-tight">Nexora</span>
              <span className="text-[10px] font-bold text-[#a3e6ba] tracking-wider uppercase">Enterprise Learning Suite</span>
            </div>
          </div>

          {/* All-in-One LMS Tag Badge */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#024125]/80 border border-[#026637]/60 px-3.5 py-1 text-xs font-extrabold text-[#a3e6ba] shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>All-in-One Learning Management Platform</span>
            </div>
          </div>

          {/* Display Headline */}
          <div className="relative space-y-0.5">
            <h1 className="text-3xl xl:text-4xl font-black tracking-tight leading-[1.15] text-white">
              Complete Course &<br />
              Lecture Management<br />
              <span className="text-[#10b981]">Platform</span>
            </h1>

            {/* Curly Arrow Vector Illustration Accent */}
            <svg
              className="absolute -right-2 top-1/2 h-14 w-14 text-[#10b981] opacity-80 pointer-events-none hidden xl:block"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg font-medium">
            Tailored role-based portals for Students, Faculty, Executors, and Admins with calendar validity, secure lecture access, and payment verification.
          </p>

          {/* 4 Portal Cards (2x2 Grid matching reference image) */}
          <div className="grid grid-cols-2 gap-3 max-w-xl pt-1">
            <div className="rounded-2xl border border-[#026637]/40 bg-[#013820]/70 p-3 flex items-center gap-2.5 backdrop-blur-md shadow-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#026637] text-white text-base font-black shadow-sm">
                🎓
              </div>
              <div>
                <div className="text-xs font-extrabold text-white">Student Portal</div>
                <div className="text-[10px] text-slate-300 font-medium leading-tight mt-0.5">Course progress, validity countdown & lecture links</div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#026637]/40 bg-[#013820]/70 p-3 flex items-center gap-2.5 backdrop-blur-md shadow-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#026637] text-white text-base font-black shadow-sm">
                👨‍🏫
              </div>
              <div>
                <div className="text-xs font-extrabold text-white">Faculty Portal</div>
                <div className="text-[10px] text-slate-300 font-medium leading-tight mt-0.5">Lecture management, live links & downloads</div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#026637]/40 bg-[#013820]/70 p-3 flex items-center gap-2.5 backdrop-blur-md shadow-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#026637] text-white text-base font-black shadow-sm">
                💼
              </div>
              <div>
                <div className="text-xs font-extrabold text-white">Executor Portal</div>
                <div className="text-[10px] text-slate-300 font-medium leading-tight mt-0.5">Onboarding pipeline & follow-up tracking</div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#026637]/40 bg-[#013820]/70 p-3 flex items-center gap-2.5 backdrop-blur-md shadow-xs">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#026637] text-white text-base font-black shadow-sm">
                🛡️
              </div>
              <div>
                <div className="text-xs font-extrabold text-white">Admin Command</div>
                <div className="text-[10px] text-slate-300 font-medium leading-tight mt-0.5">Analytics, access control & audit logs</div>
              </div>
            </div>
          </div>

          {/* Bottom 3D Laptop Dashboard Mockup Illustration (Matching Reference Image) */}
          <div className="relative pt-1 flex justify-center items-center">
            <div className="relative overflow-hidden max-w-sm xl:max-w-md w-full flex justify-center items-center group pt-1">
              <img
                src="/lms_laptop_exact.png"
                alt="Nexora LMS Laptop Mockup"
                className="w-full h-auto max-h-36 xl:max-h-44 object-contain object-center transition-transform duration-700 group-hover:scale-105 drop-shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div className="relative z-10 pt-3 flex items-center justify-between text-xs text-slate-400 border-t border-[#026637]/40 mt-4">
          <span className="flex items-center gap-1.5 font-semibold text-slate-300 text-[11px]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" /> Nexora Enterprise Platform
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-300 text-[11px]">
            <Laptop className="h-3.5 w-3.5 text-[#10b981]" /> Built with Spring Boot REST API + React
          </span>
        </div>

      </div>

      {/* RIGHT PANEL — Animated Light Ice/Mint Background Container (Fits on screen without scroll) */}
      <div className="relative flex w-full lg:w-1/2 flex-col justify-center items-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#f0f9f4] via-[#e2f0f5] to-[#f8fafc] dark:from-[#021d10] dark:via-slate-950 dark:to-slate-900 overflow-y-auto lg:overflow-hidden h-full">
        
        {/* Ambient Floating Animated Glow Orbs in Background */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-[#026637]/20 dark:bg-emerald-900/30 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#014122]/15 dark:bg-[#014122]/40 blur-3xl animate-pulse" style={{ animationDelay: "2.5s" }} />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-emerald-400/10 blur-[120px] pointer-events-none" />

        {/* Main Form Card Container with Smooth Fade & Scale Animation */}
        <div className="relative z-10 w-full max-w-[420px] rounded-[2rem] bg-white/95 dark:bg-slate-900/95 border-2 border-[#014122]/15 dark:border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-4 animate-in fade-in zoom-in-95 duration-700 transition-all hover:border-[#014122]/30 hover:shadow-[0_25px_60px_-15px_rgba(1,65,34,0.18)]">
          
          {/* Top Circular Shield Badge */}
          <div className="text-center space-y-2">
            <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[#e6f7ef] text-[#014122] mx-auto shadow-sm ring-4 ring-[#e6f7ef]/60">
              <ShieldCheck className="h-7 w-7 text-[#014122]" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Welcome Back!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Sign in to access your dashboard
              </p>
            </div>
          </div>

          {/* Info Alert Message */}
          {infoMsg && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-extrabold text-emerald-800 flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Error Alert Box (Red Alert Box matching screenshot) */}
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/90 dark:bg-rose-950/30 p-3 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 shadow-xs">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Email Field */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-[10px] font-black uppercase tracking-wider text-[#014122] dark:text-emerald-400"
              >
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reshma@gmail.com"
                  required
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 pl-10 pr-4 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white focus:border-[#014122] focus:ring-2 focus:ring-[#014122]/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-[10px] font-black uppercase tracking-wider text-[#014122] dark:text-emerald-400"
                >
                  PASSWORD
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-bold text-[#014122] dark:text-emerald-400 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Pass@123"
                  required
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 pl-10 pr-11 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white focus:border-[#014122] focus:ring-2 focus:ring-[#014122]/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-[#014122] focus:ring-[#014122] accent-[#014122] cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-xs font-extrabold text-slate-700 dark:text-slate-300 cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Sign In Primary CTA Button (Matching Green Pill with Arrow) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#014122] hover:bg-[#026637] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                    <ArrowRight className="h-3 w-3 text-white" />
                  </div>
                </>
              )}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="pt-2 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-black text-[#014122] dark:text-emerald-400 hover:underline transition-colors"
            >
              Register as Student
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
