import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { api } from "@/lib/api";
import { GraduationCap, Code, Eye, EyeOff, Loader2, CheckCircle2, Phone, MapPin, BookOpen, GraduationCap as Education, AlertCircle } from "lucide-react";

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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [interestedCourse, setInterestedCourse] = useState("");
  const [education, setEducation] = useState("");
  const [city, setCity] = useState("");
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
      if (res.success && res.data) {
        setSpringCourses(res.data);
      }
    });
  }, []);

  const courses = springCourses.length > 0
    ? springCourses.map((c: any) => ({ id: c.courseId, name: c.name }))
    : store.getCourses().filter((c) => c.status === "active");

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};

    // BUG-001: Full Name must be at least 2 characters
    if (fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters.";
    }

    // BUG-002: Phone must be a valid 10-digit number
    const cleanPhone = phone.replace(/[\s\-\+]/g, "");
    const phoneDigits = cleanPhone.replace(/^(\+91|91)/, "");
    if (phoneDigits.length !== 10 || !/^\d{10}$/.test(phoneDigits)) {
      errors.phone = "Enter a valid 10-digit mobile number.";
    }

    // BUG-003: Strong password policy
    if (!isStrongPassword(password)) {
      errors.password = "Password does not meet strength requirements.";
    }

    // Confirm password match
    if (password !== confirmPassword) {
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

    // Students register; other roles are admin-created
    const { error: signUpError } = await signUp(
      email,
      password,
      fullName,
      "student",
      { phone, interestedCourse, education, city }
    );

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const passwordErrors = getPasswordErrors(password);

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-background">
        <div className="w-full max-w-[480px] text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Registration Received! 🎉
          </h2>
          <p className="text-muted-foreground mb-4">
            Your student account has been created successfully.
          </p>
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5 text-left space-y-3 mb-6">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-500" /> What happens next?
            </h3>
            <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Our admissions team has received your registration.</li>
              <li>An <strong>Executor</strong> will be assigned to you shortly.</li>
              <li>You'll receive a <strong>free demo session</strong> of your interested course.</li>
              <li>After the demo, you can proceed with course enrollment and payment.</li>
              <li>Once enrolled, a <strong>Faculty</strong> will be assigned and you'll get full lecture access.</li>
            </ol>
          </div>
          <Link
            to="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign in to your account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-12">
        <div className="max-w-md text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20 ring-1 ring-indigo-400/30 backdrop-blur-md">
              <Code className="h-6 w-6 text-indigo-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight">CodeX Technology</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Start your learning journey
          </h1>
          <p className="text-indigo-200/80 text-lg leading-relaxed mb-8">
            Register as a student to begin your path. Our team will guide you through a free demo, course selection, and enrollment.
          </p>
          <div className="space-y-3 text-sm text-indigo-200/70">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">1</span>
              <span>Register & create your profile</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">2</span>
              <span>Get assigned an executor for free demo</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">3</span>
              <span>Attend demo, choose course & enroll</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">4</span>
              <span>Access lectures with assigned faculty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — register form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-[460px]">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Code className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">CodeX</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Create your account
            </h2>
            <p className="text-sm text-muted-foreground">
              Register as a student to get started with your free demo
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name — BUG-001: min 2 chars */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                Full name <span className="text-destructive">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setFieldErrors((p) => ({ ...p, fullName: "" })); }}
                placeholder="Enter your full name"
                required
                minLength={2}
                className={`flex h-11 w-full rounded-lg border ${fieldErrors.fullName ? "border-destructive" : "border-input"} bg-background px-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors`}
              />
              {fieldErrors.fullName && (
                <p className="mt-1 text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                Email address <span className="text-destructive">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="flex h-11 w-full rounded-lg border border-input bg-background px-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
              />
            </div>

            {/* Phone — BUG-002: must be 10-digit */}
            <div>
              <label htmlFor="phone" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setFieldErrors((p) => ({ ...p, phone: "" })); }}
                  placeholder="+91 98765 43210"
                  required
                  pattern="[\+]?[0-9\s\-]{10,15}"
                  title="Enter a valid 10-digit mobile number"
                  className={`flex h-11 w-full rounded-lg border ${fieldErrors.phone ? "border-destructive" : "border-input"} bg-background pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors`}
                />
              </div>
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{fieldErrors.phone}</p>
              )}
            </div>

            {/* Password + Confirm — BUG-003 & BUG-004 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                  Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
                    placeholder="Min 8 characters"
                    required
                    minLength={8}
                    className={`flex h-11 w-full rounded-lg border ${fieldErrors.password ? "border-destructive" : "border-input"} bg-background px-4 pr-11 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {/* BUG-004: Eye icon on Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                  Confirm <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirmPassword: "" })); }}
                    placeholder="Re-enter password"
                    required
                    className={`flex h-11 w-full rounded-lg border ${fieldErrors.confirmPassword ? "border-destructive" : "border-input"} bg-background px-4 pr-11 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* BUG-003: Password strength indicator */}
            {password.length > 0 && (
              <div className={`rounded-lg border p-3 text-xs space-y-1.5 ${passwordErrors.length === 0 ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                <div className={`font-semibold flex items-center gap-1.5 ${passwordErrors.length === 0 ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
                  {passwordErrors.length === 0 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                  {passwordErrors.length === 0 ? "Strong password ✓" : "Password requirements:"}
                </div>
                {passwordErrors.length > 0 && (
                  <ul className="space-y-0.5 text-muted-foreground ml-5">
                    {passwordErrors.map((err) => (
                      <li key={err} className="list-disc">{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {fieldErrors.confirmPassword && (
              <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{fieldErrors.confirmPassword}</p>
            )}

            {/* Optional Fields */}
            <div className="pt-2 border-t border-border/60">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Optional Information</p>

              <div className="space-y-3">
                <div>
                  <label htmlFor="interestedCourse" className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Interested Course
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="interestedCourse"
                      list="interested-courses-list"
                      type="text"
                      value={interestedCourse}
                      onChange={(e) => setInterestedCourse(e.target.value)}
                      placeholder="Select or type your interested course (e.g. Full Stack Web Development)"
                      className="flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                    />
                    <datalist id="interested-courses-list">
                      {courses.map((c) => (
                        <option key={c.id} value={c.name} />
                      ))}
                      <option value="Full Stack Web Development" />
                      <option value="Java Full Stack Development" />
                      <option value="Python & AI / Data Science" />
                      <option value="DevOps & Cloud Engineering" />
                      <option value="Cyber Security & Ethical Hacking" />
                      <option value="React & Node.js Masterclass" />
                    </datalist>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">Select from the dropdown suggestions or type any custom course</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="education" className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Education
                    </label>
                    <div className="relative">
                      <Education className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        id="education"
                        type="text"
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        placeholder="e.g. B.Tech CS"
                        className="flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-xs font-medium text-muted-foreground mb-1.5">
                      City
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        id="city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Bangalore"
                        className="flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Student Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
