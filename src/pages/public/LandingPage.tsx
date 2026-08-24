import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { type Language, LANGUAGE_OPTIONS, TRANSLATIONS } from "@/lib/i18n";
import {
  GraduationCap,
  Code,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Video,
  Users,
  Calendar,
  CreditCard,
  BookOpen,
  CheckCircle2,
  Lock,
  Download,
  ChevronDown,
  Star,
  Zap,
  TrendingUp,
  BarChart3,
  FileSpreadsheet,
  Award,
  Layers,
  Check,
  PlayCircle,
  Radio,
  Clock,
  Globe,
} from "lucide-react";

export default function LandingPage() {
  const { user, profile, loginAsRole } = useAuth();
  const store = useDataStore();
  const navigate = useNavigate();

  const [lang, setLang] = useState<Language>("en");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState<"student" | "faculty" | "executor" | "admin">("student");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const t = TRANSLATIONS[lang];
  const courses = store.getCourses();

  const handleDemoLogin = async (role: "student" | "faculty" | "executor" | "admin") => {
    await loginAsRole(role);
    navigate(`/${role}`);
  };

  const faqs = [
    {
      q: lang === "hi" ? "कैलेंडर-आधारित पाठ्यक्रम वैधता कैसे काम करती है?" : lang === "mr" ? "कॅलेंडर-आधारित कोर्स वैधता कशी कार्य करते?" : "How does the calendar-based course validity work?",
      a: lang === "hi" ? "CodeX Technology फिक्स्ड 30 दिनों के बजाय सटीक कैलेंडर गणित (प्रारंभ तिथि + अवधि महीने) का उपयोग करता है। उदाहरण के लिए, 20 अगस्त को 3 महीने की योजना 20 नवंबर को समाप्त होती है।" : lang === "mr" ? "CodeX Technology निश्चित ३० दिवसांऐवजी अचूक कॅलेंडर गणिताचा (प्रारंभ तारीख + कालावधी महिने) वापर करते. उदाहरणार्थ, २० ऑगस्टला ३ महिन्यांची योजना २० नोव्हेंबरला संपते." : "Unlike legacy systems that calculate 30 fixed days per month, CodeX Technology uses strict calendar arithmetic (start_date + duration_months). For example, enrolling on August 20 for a 3-month plan expires on November 20, accounting for actual days per month.",
    },
    {
      q: lang === "hi" ? "लाइव व्याख्यान स्ट्रीम कैसे सुरक्षित हैं?" : lang === "mr" ? "लाइव्ह लेक्चर स्ट्रीम्स कसे सुरक्षित आहेत?" : "How are live lecture streams secured?",
      a: lang === "hi" ? "CodeX Technology स्ट्रीमिंग से पहले 8-चरण सर्वर सत्यापन करता है: प्रमाणीकरण, भूमिका, नामांकन स्थिति, भुगतान और समाप्ति तिथि सीमा की जांच।" : lang === "mr" ? "CodeX Technology स्ट्रीमिंगपूर्वी ८-स्टेप सर्व्हर पडताळणी करते: ऑथेंटिकेशन, भूमिका, एनरोलमेंट स्थिती, पेमेंट आणि एक्सपायरी तारीख सीमा तपासणे." : "CodeX Technology performs an 8-step server validation before streaming: checking authentication, role, valid enrollment, verified payment, non-expired date threshold, and lecture status. Expired users see a locked renewal prompt.",
    },
    {
      q: lang === "hi" ? "क्या प्रवेश अधिकारी भुगतान सत्यापित कर सकते हैं?" : lang === "mr" ? "प्रवेश अधिकारी पेमेंट पडताळणी करू शकतात का?" : "Can admissions executors verify payments or change pricing?",
      a: lang === "hi" ? "नहीं। प्रवेश अधिकारी केवल फॉलो-अप, लीड ऑनबोर्डिंग और लिंक साझा कर सकते हैं। वित्तीय सत्यापन के लिए एडमिन अनुमति आवश्यक है।" : lang === "mr" ? "नाही. प्रवेश अधिकारी फक्त फॉलो-अप, लीड ऑनबोर्डिंग आणि लिंक्स शेअर करू शकतात. आर्थिक पडताळणीसाठी ॲडमिन परवानगी आवश्यक आहे." : "No. Strict Role-Based Access Control (RBAC) ensures executors can only conduct follow-ups, onboard leads, and share approved links. Financial verification and validity extensions require Admin authorization.",
    },
    {
      q: lang === "hi" ? "क्या भुगतान गेटवे रेज़रपे-तैयार है?" : lang === "mr" ? "पेमेंट गेटवे रेझरपे-रेडी आहे का?" : "Is the payment gateway Razorpay-ready?",
      a: lang === "hi" ? "हाँ। मॉक प्रदाता और लाइव रेज़रपे वेबहुक के बीच स्विच करना सहज है।" : lang === "mr" ? "होय. मॉक प्रोव्हायडर आणि लाइव्ह रेझरपे वेबहूक दरम्यान स्विच करणे सोपे आहे." : "Yes. The platform is architected with a decoupled PaymentProvider abstraction. Switching between the mock provider and live Razorpay webhooks occurs seamlessly without altering core enrollment logic.",
    },
    {
      q: lang === "hi" ? "मैनुअल वैधता विस्तार कैसे ट्रैक किए जाते हैं?" : lang === "mr" ? "मॅन्युअल वैधता विस्तार कसे ट्रॅक केले जातात?" : "How are manual validity extensions tracked?",
      a: lang === "hi" ? "एडमिन द्वारा किए गए प्रत्येक विस्तार के लिए अनिवार्य कारण आवश्यक है और यह ऑडिट लॉग में दर्ज किया जाता है।" : lang === "mr" ? "ॲडमिनने केलेल्या प्रत्येक विस्तारासाठी अनिवार्य कारण आवश्यक आहे आणि ते ऑडीट लॉगमध्ये नोंदवले जाते." : "Every manual extension performed by an Admin requires a mandatory reason and is written to both the enrollment_access_adjustments table and the immutable, append-only system audit log.",
    },
  ];

  const currentLangObj = LANGUAGE_OPTIONS.find((l) => l.code === lang) || LANGUAGE_OPTIONS[0];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* 3D FLOATING AMBIENT GLOW ORBS */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="animate-float-orb absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-pink-600/20 blur-[130px]" />
        <div className="animate-float-orb absolute top-1/2 -right-40 h-[700px] w-[700px] rounded-full bg-gradient-to-bl from-cyan-600/20 via-blue-600/15 to-indigo-600/20 blur-[140px]" style={{ animationDelay: "-5s" }} />
        <div className="animate-float-orb absolute -bottom-40 left-1/3 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-emerald-600/15 via-teal-600/10 to-indigo-600/15 blur-[120px]" style={{ animationDelay: "-9s" }} />
      </div>

      {/* 1. TOP NAVIGATION BAR WITH MULTILINGUAL LANGUAGE SWITCHER */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-primary to-purple-500 text-white shadow-lg shadow-primary/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                Edu<span className="text-primary">Flow</span>
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest -mt-1">
                LMS Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">{t.features}</a>
            <a href="#portals" className="hover:text-primary transition-colors">{t.matrix}</a>
            <a href="#courses" className="hover:text-primary transition-colors">{t.courses}</a>
            <a href="#pricing" className="hover:text-primary transition-colors">{t.pricing}</a>
            <a href="#faq" className="hover:text-primary transition-colors">{t.faq}</a>
          </nav>

          {/* Language Switcher & Action CTAs */}
          <div className="flex items-center gap-3">
            {/* MULTILINGUAL LANGUAGE SWITCHER DROPDOWN */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-xs"
              >
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span>{currentLangObj.flag}</span>
                <span>{currentLangObj.label}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-border/80 bg-card p-1.5 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40 mb-1">
                    Select Language / भाषा चुनें
                  </div>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setLang(opt.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all text-left ${
                        lang === opt.code
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground hover:bg-accent/60"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{opt.flag}</span>
                        <span>{opt.label}</span>
                      </span>
                      {lang === opt.code && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {profile ? (
              <Link
                to={`/${profile.role}`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95 transition-all"
              >
                {t.goToDashboard} ({profile.role.toUpperCase()}) <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl border border-border bg-card/80 px-4 py-2 text-xs font-bold text-foreground hover:bg-accent transition-colors shadow-2xs"
                >
                  {t.signIn}
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95 transition-all"
                >
                  {t.getStarted} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. 3D HERO SECTION WITH LIVE TRAINING CLASSROOM BACKGROUND IMAGE */}
      <section className="relative z-10 overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-[url('/images/live_training_session.jpg')] bg-cover bg-center bg-no-repeat border-b border-border/80">
        {/* Deep Slate Glass Overlay with high contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-background backdrop-blur-[2px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* 3D Shimmer Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/15 px-5 py-2 text-xs font-bold text-indigo-300 mb-8 shadow-lg backdrop-blur-md animate-in fade-in zoom-in-95">
            <Sparkles className="h-4 w-4 text-indigo-400 animate-spin" style={{ animationDuration: "8s" }} />
            <span>{t.shimmerBadge}</span>
          </div>

          {/* Main Headline with 3D Hero Gradient & Contrast */}
          <h1 className="mx-auto max-w-4xl text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white drop-shadow-md">
            {t.heroTitlePrefix}<span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">{t.heroTitleGradient}</span>{t.heroTitleSuffix}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-lg text-slate-300 leading-relaxed font-medium">
            {t.heroSubtitle}
          </p>

          {/* 3D Glassmorphic Interactive Demo Switcher */}
          <div className="mt-12 max-w-2xl mx-auto rounded-3xl border border-white/20 bg-slate-900/85 p-5 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:shadow-indigo-500/20 hover:border-indigo-400/40">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-white">
                <Zap className="h-4 w-4 text-amber-400" /> {t.instantSandbox}
              </span>
              <span className="text-[10px] text-emerald-300 font-extrabold bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                {t.interactiveSandbox}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin("student")}
                className="group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-blue-400/40 bg-blue-500/15 p-3.5 text-xs font-bold text-blue-300 hover:from-blue-600 hover:to-indigo-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-blue-500/25 hover:-translate-y-1 hover:scale-105"
              >
                <span className="text-xl group-hover:scale-125 transition-transform duration-300">🎓</span>
                <span className="text-white">{t.student}</span>
                <span className="text-[10px] text-blue-200">{t.studentSub}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("faculty")}
                className="group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-purple-400/40 bg-purple-500/15 p-3.5 text-xs font-bold text-purple-300 hover:from-purple-600 hover:to-indigo-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-purple-500/25 hover:-translate-y-1 hover:scale-105"
              >
                <span className="text-xl group-hover:scale-125 transition-transform duration-300">👨‍🏫</span>
                <span className="text-white">{t.faculty}</span>
                <span className="text-[10px] text-purple-200">{t.facultySub}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("executor")}
                className="group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-amber-400/40 bg-amber-500/15 p-3.5 text-xs font-bold text-amber-300 hover:from-amber-600 hover:to-orange-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-amber-500/25 hover:-translate-y-1 hover:scale-105"
              >
                <span className="text-xl group-hover:scale-125 transition-transform duration-300">🤝</span>
                <span className="text-white">{t.executor}</span>
                <span className="text-[10px] text-amber-200">{t.executorSub}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("admin")}
                className="group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-rose-400/40 bg-rose-500/15 p-3.5 text-xs font-bold text-rose-300 hover:from-rose-600 hover:to-pink-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-rose-500/25 hover:-translate-y-1 hover:scale-105"
              >
                <span className="text-xl group-hover:scale-125 transition-transform duration-300">⚡</span>
                <span className="text-white">{t.admin}</span>
                <span className="text-[10px] text-rose-200">{t.adminSub}</span>
              </button>
            </div>
          </div>

          {/* Social Proof Stats with Frosted Glass */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl mx-auto text-left">
            <div className="rounded-3xl border border-white/15 bg-slate-900/85 p-5 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/40">
              <div className="text-3xl font-black text-white">15,000+</div>
              <div className="text-xs font-semibold text-slate-300 mt-1">{t.stat1Label}</div>
              <div className="text-[10px] text-indigo-300 font-bold">{t.stat1Sub}</div>
            </div>
            <div className="rounded-3xl border border-white/15 bg-slate-900/85 p-5 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/40">
              <div className="text-3xl font-black text-emerald-400">8-Step</div>
              <div className="text-xs font-semibold text-slate-300 mt-1">{t.stat2Label}</div>
              <div className="text-[10px] text-emerald-300 font-bold">{t.stat2Sub}</div>
            </div>
            <div className="rounded-3xl border border-white/15 bg-slate-900/85 p-5 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/40">
              <div className="text-3xl font-black text-indigo-400">4 Role</div>
              <div className="text-xs font-semibold text-slate-300 mt-1">{t.stat3Label}</div>
              <div className="text-[10px] text-indigo-300 font-bold">{t.stat3Sub}</div>
            </div>
            <div className="rounded-3xl border border-white/15 bg-slate-900/85 p-5 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/40">
              <div className="text-3xl font-black text-purple-400">Razorpay</div>
              <div className="text-xs font-semibold text-slate-300 mt-1">{t.stat4Label}</div>
              <div className="text-[10px] text-purple-300 font-bold">{t.stat4Sub}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 4-ROLE ARCHITECTURE WITH 3D GLASS CARDS */}
      <section id="portals" className="scroll-reveal relative z-10 py-24 border-t border-border/80 bg-muted/20 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-bold text-primary">
              {t.matrixBadge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground mt-4">
              {t.matrixTitle}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
              {t.matrixSubtitle}
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-2xl border border-border/80 bg-card/80 p-1.5 gap-2 shadow-lg backdrop-blur-xl">
              {(["student", "faculty", "executor", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setActiveRoleTab(r)}
                  className={`rounded-xl px-5 py-2.5 text-xs font-extrabold capitalize transition-all duration-300 ${
                    activeRoleTab === r
                      ? "bg-gradient-to-r from-primary to-indigo-600 text-white shadow-md shadow-primary/25 scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  {t[r]}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Role Card Content */}
          <div className="max-w-4xl mx-auto rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:border-primary/40">
            {activeRoleTab === "student" && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 text-xs font-bold">
                    🎓 {t.student}
                  </span>
                  <h3 className="text-2xl font-extrabold text-foreground">Interactive Learning Dashboard</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Track calendar validity countdowns, access live Google Meet streams with 8-step server verification, download lecture notes, and review payment history.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("student")}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all"
                  >
                    Launch Student Demo <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="rounded-2xl border border-border/60 bg-slate-900 p-4 shadow-xl text-white space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{t.courseProgress}</span>
                    <span className="text-emerald-400">88%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[88%]" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300 pt-2">
                    <span>{t.daysRemaining}:</span>
                    <span className="font-bold text-amber-400">92 Days</span>
                  </div>
                  <div className="rounded-xl bg-slate-800/80 p-3 text-xs flex items-center justify-between border border-white/10">
                    <span className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-red-500 animate-ping" /> {t.liveBroadcast}
                    </span>
                    <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold">Join Meet</span>
                  </div>
                </div>
              </div>
            )}

            {activeRoleTab === "faculty" && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 px-3 py-1 text-xs font-bold">
                    👨‍🏫 {t.faculty}
                  </span>
                  <h3 className="text-2xl font-extrabold text-foreground">Lecture Command & Broadcast Hub</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Schedule live lectures, attach Google Meet links, upload session recordings, and manage enrolled students for assigned courses.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("faculty")}
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-all"
                  >
                    Launch Faculty Demo <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="rounded-2xl border border-border/60 bg-slate-900 p-4 shadow-xl text-white space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{t.enrolledStudents}</span>
                    <span className="text-purple-400">142 Students</span>
                  </div>
                  <div className="rounded-xl bg-slate-800/80 p-3 text-xs space-y-2 border border-white/10">
                    <div className="font-bold flex items-center justify-between">
                      <span>{t.todaysLectures}</span>
                      <span className="text-xs text-emerald-400">2 Live</span>
                    </div>
                    <div className="text-[11px] text-slate-300">• Spring Boot 3 Dependency Injection</div>
                    <div className="text-[11px] text-slate-300">• React & TypeScript State Management</div>
                  </div>
                </div>
              </div>
            )}

            {activeRoleTab === "executor" && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 text-xs font-bold">
                    🤝 {t.executor}
                  </span>
                  <h3 className="text-2xl font-extrabold text-foreground">Admissions & Lead Pipeline Hub</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Contact assigned student leads, schedule free interactive demo sessions, pitch course curriculums, and assist interested students into payment pending state.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("executor")}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-700 transition-all"
                  >
                    Launch Executor Demo <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="rounded-2xl border border-border/60 bg-slate-900 p-4 shadow-xl text-white space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{t.assignedLeads}</span>
                    <span className="text-amber-400">18 Leads</span>
                  </div>
                  <div className="rounded-xl bg-slate-800/80 p-3 text-xs space-y-2 border border-white/10">
                    <div className="font-bold flex items-center justify-between">
                      <span>{t.todaysFollowups}</span>
                      <span className="text-xs text-amber-400">5 Today</span>
                    </div>
                    <div className="text-[11px] text-slate-300">• Free Demo: Rahul Sharma (Java FS)</div>
                    <div className="text-[11px] text-slate-300">• Follow-up Call: Priya Patel (DevOps)</div>
                  </div>
                </div>
              </div>
            )}

            {activeRoleTab === "admin" && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1 text-xs font-bold">
                    ⚡ {t.admin}
                  </span>
                  <h3 className="text-2xl font-extrabold text-foreground">Master Control & Security Console</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Full administrative control over faculty creation, executor lead assignments, course creation, pricing plans, manual validity extensions, and audit logs.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("admin")}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition-all"
                  >
                    Launch Admin Console <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="rounded-2xl border border-border/60 bg-slate-900 p-4 shadow-xl text-white space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{t.totalPlatformRevenue}</span>
                    <span className="text-rose-400">₹4,85,000</span>
                  </div>
                  <div className="rounded-xl bg-slate-800/80 p-3 text-xs space-y-2 border border-white/10">
                    <div className="font-bold flex items-center justify-between">
                      <span>{t.activeSecurityRules}</span>
                      <span className="text-xs text-emerald-400">Strict RLS</span>
                    </div>
                    <div className="text-[11px] text-slate-300">• 8-Step Access Verification Engine</div>
                    <div className="text-[11px] text-slate-300">• Immutable Audit Trail Active</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. ENTERPRISE FEATURES GRID */}
      <section id="features" className="scroll-reveal relative z-10 py-24 border-t border-border/80 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 text-xs font-bold text-indigo-500">
              {t.featuresBadge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground mt-4">
              {t.featuresTitle}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
              {t.featuresSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t.feat1Title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.feat1Desc}</p>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-5">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t.feat2Title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.feat2Desc}</p>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 mb-5">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t.feat3Title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.feat3Desc}</p>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 mb-5">
                <Video className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t.feat4Title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.feat4Desc}</p>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-5">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t.feat5Title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.feat5Desc}</p>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-rose-400/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-5">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t.feat6Title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.feat6Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. COURSES CATALOG */}
      <section id="courses" className="scroll-reveal relative z-10 py-24 border-t border-border/80 bg-muted/20 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-500">
              {t.coursesBadge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground mt-4">
              {t.coursesTitle}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
              {t.coursesSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {courses.map((course) => {
              const plans = store.getPlansForCourse(course.id);
              const facultyRecord = course.faculty_id ? store.getFacultyWithProfiles().find((f) => f.id === course.faculty_id) : null;
              
              return (
                <div key={course.id} className="rounded-3xl border border-border/80 bg-card p-6 shadow-2xl flex flex-col justify-between transition-all duration-300 hover:border-primary/40">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary">
                        {course.category || "Technology"}
                      </span>
                      <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Active Track
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-foreground mb-2">{course.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6">{course.description}</p>

                    <div className="space-y-2 mb-6">
                      <div className="text-xs font-bold text-foreground uppercase tracking-wider">Plan Durations</div>
                      <div className="flex flex-wrap gap-2">
                        {plans.map((p) => (
                          <span key={p.id} className="rounded-xl border border-border/60 bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground">
                            {p.duration_months} {t.monthsPlan} • {formatCurrency(p.price - p.discount)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      Faculty: <span className="font-bold text-foreground">{facultyRecord?.profile.full_name || "Dr. Ananya Verma"}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDemoLogin("student")}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      {t.viewCourse} <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. PRICING TIERS */}
      <section id="pricing" className="scroll-reveal relative z-10 py-24 border-t border-border/80 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 text-xs font-bold text-purple-500">
              {t.pricingBadge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground mt-4">
              {t.pricingTitle}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
              {t.pricingSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* 1 Month */}
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">1 Month Intensive</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground">₹5,499</span>
                  <span className="text-xs text-muted-foreground">/ 1 month</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Full course access for 30 calendar days</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Live Google Meet lectures</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Downloadable notes</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleDemoLogin("student")}
                className="mt-8 w-full rounded-xl border border-primary text-primary hover:bg-primary hover:text-white py-2.5 text-xs font-bold transition-all"
              >
                {t.enrollNow}
              </button>
            </div>

            {/* 3 Months (Recommended) */}
            <div className="relative rounded-3xl border-2 border-primary bg-card p-6 shadow-2xl flex flex-col justify-between scale-105">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-indigo-600 px-4 py-1 text-[10px] font-black uppercase text-white shadow-md">
                {t.popular}
              </span>
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">3 Months Standard</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground">₹12,999</span>
                  <span className="text-xs text-muted-foreground">/ 3 months</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Full course access for 90 calendar days</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Live Google Meet lectures & recordings</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Dedicated Faculty Q&A support</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Capstone project certificate</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleDemoLogin("student")}
                className="mt-8 w-full rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white py-2.5 text-xs font-bold shadow-md hover:opacity-95 transition-all"
              >
                {t.enrollNow}
              </button>
            </div>

            {/* 6 Months */}
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">6 Months Masterclass</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground">₹19,999</span>
                  <span className="text-xs text-muted-foreground">/ 6 months</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Full course access for 180 calendar days</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Live Google Meet lectures & recordings</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Placement assistance & mock interviews</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleDemoLogin("student")}
                className="mt-8 w-full rounded-xl border border-primary text-primary hover:bg-primary hover:text-white py-2.5 text-xs font-bold transition-all"
              >
                {t.enrollNow}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section id="faq" className="scroll-reveal relative z-10 py-24 border-t border-border/80 bg-muted/20 backdrop-blur-lg">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-bold text-primary">
              {t.faqBadge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground mt-4">
              {t.faqTitle}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
              {t.faqSubtitle}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-bold text-sm text-foreground"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-primary transition-transform duration-300 ${openFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {openFaq === idx && (
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FOOTER & FINAL CTA */}
      <footer className="relative z-10 border-t border-border/80 bg-background py-12 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <Code className="h-5 w-5" />
            </div>
            <span className="text-base font-black text-foreground">CodeX Technology</span>
          </div>

          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            {t.footerText}
          </p>

          <div className="pt-4 border-t border-border/60 text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} CodeX Technology. All rights reserved. Multilingual Support Active (English, हिंदी, मराठी).
          </div>
        </div>
      </footer>
    </div>
  );
}
