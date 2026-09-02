import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { api } from "@/lib/api";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Phone as PhoneIcon,
  AlertCircle,
  Sparkles,
  User,
  Mail,
  Lock,
  ArrowRight,
  BookOpen,
  Laptop,
  GraduationCap,
  MapPin,
} from "lucide-react";

// Password strength validation
function getPasswordErrors(pw: string): string[] {
  const errors: string[] = [];
  if (pw.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(pw)) errors.push("One uppercase letter (A–Z)");
  if (!/[a-z]/.test(pw)) errors.push("One lowercase letter (a–z)");
  if (!/[0-9]/.test(pw)) errors.push("One digit (0–9)");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) errors.push("One special character (!@#$%...)");
  return errors;
}

function isStrongPassword(pw: string): boolean {
  return getPasswordErrors(pw).length === 0;
}

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [education, setEducation] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [interestedCourse, setInterestedCourse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [springCourses, setSpringCourses] = useState<any[]>([]);
  const { signUp } = useAuth();
  const store = useDataStore();

  useEffect(() => {
    api.getAllCourses().then((res) => {
      if (res && res.success && res.data && res.data.length > 0) {
        setSpringCourses(res.data);
      }
    }).catch(() => {
      // Fallback silently to local store courses
    });
  }, []);

  const courses = springCourses.length > 0
    ? springCourses.map((c: any) => ({ id: c.courseCode || c.courseId || c.id, name: c.title || c.name }))
    : store.getCourses().filter((c) => c.status === "active");

  const validatePhone = (val: string): string => {
    if (!val.trim()) return "Mobile number is required.";
    const clean = val.replace(/[\s\-\+]/g, "").replace(/^91(?=\d{10}$)/, "");
    if (clean.length < 10) return `Mobile number must be 10 digits (${clean.length}/10 entered).`;
    if (clean.length > 10) return `Mobile number cannot exceed 10 digits (${clean.length} entered).`;
    if (!/^[6-9]/.test(clean)) return `Mobile number must start with 6, 7, 8, or 9 (starts with '${clean[0]}').`;
    if (!/^\d{10}$/.test(clean)) return "Mobile number must contain digits only.";
    return "";
  };

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters.";
    }

    if (!email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address (e.g. name@example.com).";
    }

    const phoneError = validatePhone(phone);
    if (phoneError) {
      errors.phone = phoneError;
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (!isStrongPassword(password)) {
      errors.password = "Password must be at least 8 chars with uppercase, lowercase, digit & symbol.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirm password is required.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateFields()) return;

    setLoading(true);

    const { error: signUpError, fieldErrors: serverFieldErrors } = await signUp(
      email.trim(),
      password,
      fullName.trim(),
      "student",
      { phone: phone.trim(), interestedCourse, education: education.trim(), city: city.trim() }
    );

    if (signUpError) {
      setError(signUpError.message || "Registration failed. Please check your details.");
      if (serverFieldErrors && typeof serverFieldErrors === "object") {
        setFieldErrors(serverFieldErrors);
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-[#f0f9f4] dark:bg-slate-950 font-sans">
        <div className="w-full max-w-[480px] text-center bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-[#014122]/15 p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f7ef] text-[#014122]">
            <CheckCircle2 className="h-8 w-8 text-[#014122]" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Registration Successful! 🎉
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 font-medium">
            Your student account has been created successfully.
          </p>
          <div className="rounded-2xl border border-[#014122]/20 bg-[#f4f9f6] p-4 text-left space-y-2.5 mb-6">
            <h3 className="text-xs font-extrabold text-[#014122] flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#014122]" /> What happens next?
            </h3>
            <ol className="text-xs text-slate-700 space-y-1.5 list-decimal list-inside font-medium">
              <li>Our admissions team has received your registration.</li>
              <li>An <strong>Executor</strong> will be assigned to you shortly.</li>
              <li>You will receive access to your student learning portal.</li>
            </ol>
          </div>
          <Link
            to="/login"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#014122] hover:bg-[#026637] px-8 font-extrabold text-white text-sm shadow-md transition-all cursor-pointer"
          >
            Sign In to Your Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      
      {/* LEFT PANEL — Dark Forest Green LMS Branding (Matching Reference Image) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#012b18] p-8 xl:p-10 text-white relative overflow-hidden border-r border-[#024d2b]/30 h-full">
        
        {/* Subtle Background Pattern */}
        <div className="absolute top-6 right-8 h-44 w-44 bg-[radial-gradient(#026637_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-35 pointer-events-none" />
        
        <div className="relative z-10 space-y-4 xl:space-y-5">
          {/* Top Brand Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/nexora_logo.png"
              alt="Nexora Logo"
              className="h-11 w-11 rounded-2xl object-contain shadow-lg shadow-[#026637]/30 ring-1 ring-white/20 bg-white/10 p-0.5"
            />
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
          <p className="text-xs text-slate-300 leading-relaxed max-w-lg font-medium">
            Tailored role-based portals for Students, Faculty, Executors, and Admins with calendar validity, secure lecture access, and payment verification.
          </p>

          {/* 4 Portal Cards (2x2 Grid matching reference image) */}
          <div className="grid grid-cols-2 gap-2.5 max-w-xl pt-0.5">
            <div className="rounded-xl border border-[#026637]/40 bg-[#013820]/70 p-2.5 flex items-center gap-2 backdrop-blur-md shadow-xs">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#026637] text-white text-sm font-black shadow-sm">
                🎓
              </div>
              <div>
                <div className="text-[11px] font-extrabold text-white">Student Portal</div>
                <div className="text-[9px] text-slate-300 font-medium leading-tight">Course progress & validity</div>
              </div>
            </div>

            <div className="rounded-xl border border-[#026637]/40 bg-[#013820]/70 p-2.5 flex items-center gap-2 backdrop-blur-md shadow-xs">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#026637] text-white text-sm font-black shadow-sm">
                👨‍🏫
              </div>
              <div>
                <div className="text-[11px] font-extrabold text-white">Faculty Portal</div>
                <div className="text-[9px] text-slate-300 font-medium leading-tight">Live lectures & downloads</div>
              </div>
            </div>

            <div className="rounded-xl border border-[#026637]/40 bg-[#013820]/70 p-2.5 flex items-center gap-2 backdrop-blur-md shadow-xs">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#026637] text-white text-sm font-black shadow-sm">
                💼
              </div>
              <div>
                <div className="text-[11px] font-extrabold text-white">Executor Portal</div>
                <div className="text-[9px] text-slate-300 font-medium leading-tight">Lead onboarding pipeline</div>
              </div>
            </div>

            <div className="rounded-xl border border-[#026637]/40 bg-[#013820]/70 p-2.5 flex items-center gap-2 backdrop-blur-md shadow-xs">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#026637] text-white text-sm font-black shadow-sm">
                🛡️
              </div>
              <div>
                <div className="text-[11px] font-extrabold text-white">Admin Command</div>
                <div className="text-[9px] text-slate-300 font-medium leading-tight">Analytics & access control</div>
              </div>
            </div>
          </div>

          {/* Bottom 3D Laptop Dashboard Mockup Illustration */}
          <div className="relative pt-0.5 flex justify-center items-center">
            <div className="relative overflow-hidden max-w-xs xl:max-w-sm w-full flex justify-center items-center group">
              <img
                src="/lms_laptop_exact.png"
                alt="Nexora LMS Laptop Mockup"
                className="w-full h-auto max-h-28 xl:max-h-36 object-contain object-center transition-transform duration-700 group-hover:scale-105 drop-shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div className="relative z-10 pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-[#026637]/40 mt-2">
          <span className="flex items-center gap-1.5 font-semibold text-slate-300 text-[10px]">
            <CheckCircle2 className="h-3 w-3 text-[#10b981]" /> Nexora Enterprise Platform
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-300 text-[10px]">
            <Laptop className="h-3 w-3 text-[#10b981]" /> Built with Spring Boot REST API + React
          </span>
        </div>

      </div>

      {/* RIGHT PANEL — Animated Light Ice/Mint Background Container */}
      <div className="relative flex w-full lg:w-1/2 flex-col justify-center items-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#f0f9f4] via-[#e2f0f5] to-[#f8fafc] dark:from-[#021d10] dark:via-slate-950 dark:to-slate-900 overflow-y-auto h-full">
        
        {/* Ambient Floating Animated Glow Orbs in Background */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-[#026637]/20 dark:bg-emerald-900/30 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#014122]/15 dark:bg-[#014122]/40 blur-3xl animate-pulse" style={{ animationDelay: "2.5s" }} />

        {/* Main Form Card Container */}
        <div className="relative z-10 w-full max-w-[540px] rounded-[2rem] bg-white/95 dark:bg-slate-900/95 border-2 border-[#014122]/15 dark:border-slate-800 p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-3 animate-in fade-in zoom-in-95 duration-700">
          
          {/* Header Title */}
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Register as Student
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Complete your profile details to register for live courses
            </p>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/90 dark:bg-rose-950/30 p-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 shadow-xs">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form — All Backend Fields */}
          <form onSubmit={handleSubmit} className="space-y-2.5">
            
            {/* Row 1: Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label htmlFor="fullName" className="block text-[10px] font-black uppercase tracking-wider text-[#014122] dark:text-emerald-400">
                  FULL NAME <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (e.target.value.trim().length >= 2) {
                        setFieldErrors((p) => ({ ...p, fullName: "" }));
                      }
                    }}
                    onBlur={() => {
                      if (!fullName.trim() || fullName.trim().length < 2) {
                        setFieldErrors((p) => ({ ...p, fullName: "Full name must be at least 2 characters." }));
                      }
                    }}
                    placeholder="Rahul Sharma"
                    required
                    className={`w-full h-9 rounded-xl border ${
                      fieldErrors.fullName
                        ? "border-rose-500 bg-rose-50/30 text-rose-900 ring-1 ring-rose-500/30"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:border-[#014122]"
                    } pl-8 pr-3 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white outline-none transition-all`}
                  />
                </div>
                {fieldErrors.fullName && (
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                    <AlertCircle className="h-3 w-3 shrink-0" /> {fieldErrors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-wider text-[#014122] dark:text-emerald-400">
                  EMAIL ADDRESS <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value.trim())) {
                        setFieldErrors((p) => ({ ...p, email: "" }));
                      }
                    }}
                    onBlur={() => {
                      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                        setFieldErrors((p) => ({ ...p, email: "Please enter a valid email address." }));
                      }
                    }}
                    placeholder="rahul@gmail.com"
                    required
                    className={`w-full h-9 rounded-xl border ${
                      fieldErrors.email
                        ? "border-rose-500 bg-rose-50/30 text-rose-900 ring-1 ring-rose-500/30"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:border-[#014122]"
                    } pl-8 pr-3 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white outline-none transition-all`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                    <AlertCircle className="h-3 w-3 shrink-0" /> {fieldErrors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Phone Number & Qualification/Education */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label htmlFor="phone" className="block text-[10px] font-black uppercase tracking-wider text-[#014122] dark:text-emerald-400">
                  MOBILE NUMBER <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPhone(val);
                      const err = validatePhone(val);
                      setFieldErrors((p) => ({ ...p, phone: err }));
                    }}
                    onBlur={() => {
                      const err = validatePhone(phone);
                      setFieldErrors((p) => ({ ...p, phone: err }));
                    }}
                    placeholder="9876543210"
                    required
                    className={`w-full h-9 rounded-xl border ${
                      fieldErrors.phone
                        ? "border-rose-500 bg-rose-50/30 text-rose-900 ring-1 ring-rose-500/30"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:border-[#014122]"
                    } pl-8 pr-3 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white outline-none transition-all`}
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                    <AlertCircle className="h-3 w-3 shrink-0" /> {fieldErrors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="education" className="block text-[10px] font-black uppercase tracking-wider text-[#014122] dark:text-emerald-400">
                  QUALIFICATION / DEGREE
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    id="education"
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="B.Tech / B.Sc / MCA"
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 pl-8 pr-3 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white focus:border-[#014122] outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: City & Interested Course */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label htmlFor="city" className="block text-[10px] font-black uppercase tracking-wider text-[#014122] dark:text-emerald-400">
                  CITY / LOCATION
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Pune / Mumbai"
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 pl-8 pr-3 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white focus:border-[#014122] outline-none transition-all"
                  />
                </div>
              </div>

              {courses.length > 0 && (
                <div className="space-y-1">
                  <label htmlFor="course" className="block text-[10px] font-black uppercase tracking-wider text-[#014122] dark:text-emerald-400">
                    INTERESTED COURSE
                  </label>
                  <select
                    id="course"
                    value={interestedCourse}
                    onChange={(e) => setInterestedCourse(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-2.5 text-xs font-semibold text-slate-900 dark:text-white outline-none transition-all cursor-pointer"
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Row 4: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
              <div className="space-y-1 sm:col-span-1">
                <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-wider text-[#014122] dark:text-emerald-400">
                  PASSWORD <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPassword(val);
                      if (isStrongPassword(val)) {
                        setFieldErrors((p) => ({ ...p, password: "" }));
                      }
                      if (confirmPassword && val !== confirmPassword) {
                        setFieldErrors((p) => ({ ...p, confirmPassword: "Passwords do not match." }));
                      } else if (confirmPassword && val === confirmPassword) {
                        setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
                      }
                    }}
                    onBlur={() => {
                      if (!isStrongPassword(password)) {
                        setFieldErrors((p) => ({
                          ...p,
                          password: "Password must meet all 5 security requirements below.",
                        }));
                      }
                    }}
                    placeholder="Pass@123"
                    required
                    className={`w-full h-9 rounded-xl border ${
                      fieldErrors.password
                        ? "border-rose-500 bg-rose-50/30 text-rose-900 ring-1 ring-rose-500/30"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:border-[#014122]"
                    } pl-8 pr-7 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                    <AlertCircle className="h-3 w-3 shrink-0" /> {fieldErrors.password}
                  </p>
                )}

                {/* Real-Time Password Checklist (shows as user types) */}
                {password.length > 0 && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 p-2 text-[10px] space-y-1 mt-1.5">
                    <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">Password Requirements:</div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                      <span className={`flex items-center gap-1 font-semibold ${password.length >= 8 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                        {password.length >= 8 ? "✓" : "○"} 8+ characters
                      </span>
                      <span className={`flex items-center gap-1 font-semibold ${/[A-Z]/.test(password) ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                        {/[A-Z]/.test(password) ? "✓" : "○"} Uppercase (A–Z)
                      </span>
                      <span className={`flex items-center gap-1 font-semibold ${/[a-z]/.test(password) ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                        {/[a-z]/.test(password) ? "✓" : "○"} Lowercase (a–z)
                      </span>
                      <span className={`flex items-center gap-1 font-semibold ${/[0-9]/.test(password) ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                        {/[0-9]/.test(password) ? "✓" : "○"} Number (0–9)
                      </span>
                      <span className={`flex items-center gap-1 font-semibold ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"} col-span-2`}>
                        {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? "✓" : "○"} Special symbol (!@#$%...)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block text-[10px] font-black uppercase tracking-wider text-[#014122] dark:text-emerald-400">
                  CONFIRM PASSWORD <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (e.target.value === password) {
                        setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
                      }
                    }}
                    onBlur={() => {
                      if (confirmPassword !== password) {
                        setFieldErrors((p) => ({ ...p, confirmPassword: "Passwords do not match." }));
                      }
                    }}
                    placeholder="Pass@123"
                    required
                    className={`w-full h-9 rounded-xl border ${
                      fieldErrors.confirmPassword
                        ? "border-rose-500 bg-rose-50/30 text-rose-900 ring-1 ring-rose-500/30"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:border-[#014122]"
                    } pl-8 pr-7 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                    <AlertCircle className="h-3 w-3 shrink-0" /> {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl bg-[#014122] hover:bg-[#026637] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 cursor-pointer pt-0.5 mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Register as Student</span>
                  <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white/20">
                    <ArrowRight className="h-3 w-3 text-white" />
                  </div>
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation Link */}
          <div className="pt-0.5 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-black text-[#014122] dark:text-emerald-400 hover:underline transition-colors"
            >
              Sign In
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
