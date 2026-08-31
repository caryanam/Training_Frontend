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

  const handleDemoLogin = async (_role?: "student" | "faculty" | "executor" | "admin") => {
    if (user && profile?.role) {
      navigate(`/${profile.role}`);
    } else {
      navigate("/login");
    }
  };

  const faqs = [
    {
      q: lang === "hi" ? "कैलेंडर-आधारित पाठ्यक्रम वैधता कैसे काम करती है?" : lang === "mr" ? "कॅलेंडर-आधारित कोर्स वैधता कशी कार्य करते?" : "How does the calendar-based course validity work?",
      a: lang === "hi" ? "Nexora फिक्स्ड 30 दिनों के बजाय सटीक कैलेंडर गणित (प्रारंभ तिथि + अवधि महीने) का उपयोग करता है। उदाहरण के लिए, 20 अगस्त को 3 महीने की योजना 20 नवंबर को समाप्त होती है।" : lang === "mr" ? "Nexora निश्चित ३० दिवसांऐवजी अचूक कॅलेंडर गणिताचा (प्रारंभ तारीख + कालावधी महिने) वापर करते. उदाहरणार्थ, २० ऑगस्टला ३ महिन्यांची योजना २० नोव्हेंबरला संपते." : "Unlike legacy systems that calculate 30 fixed days per month, Nexora uses strict calendar arithmetic (start_date + duration_months). For example, enrolling on August 20 for a 3-month plan expires on November 20, accounting for actual days per month.",
    },
    {
      q: lang === "hi" ? "लाइव व्याख्यान स्ट्रीम कैसे सुरक्षित हैं?" : lang === "mr" ? "लाइव्ह लेक्चर स्ट्रीम्स कसे सुरक्षित आहेत?" : "How are live lecture streams secured?",
      a: lang === "hi" ? "Nexora स्ट्रीमिंग से पहले 8-चरण सर्वर सत्यापन करता है: प्रमाणीकरण, भूमिका, नामांकन स्थिति, भुगतान और समाप्ति तिथि सीमा की जांच।" : lang === "mr" ? "Nexora स्ट्रीमिंगपूर्वी ८-स्टेप सर्व्हर पडताळणी करते: ऑथेंटिकेशन, भूमिका, एनरोलमेंट स्थिती, पेमेंट आणि एक्सपायरी तारीख सीमा तपासणे." : "Nexora performs an 8-step server validation before streaming: checking authentication, role, valid enrollment, verified payment, non-expired date threshold, and lecture status. Expired users see a locked renewal prompt.",
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
        <div className="animate-float-orb absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-[#014122]/20 via-purple-600/15 to-pink-600/20 blur-[130px]" />
        <div className="animate-float-orb absolute top-1/2 -right-40 h-[700px] w-[700px] rounded-full bg-gradient-to-bl from-#026637/20 via-[#026637]/15 to-[#026637]/20 blur-[140px]" style={{ animationDelay: "-5s" }} />
        <div className="animate-float-orb absolute -bottom-40 left-1/3 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-emerald-600/15 via-teal-600/10 to-[#026637]/15 blur-[120px]" style={{ animationDelay: "-9s" }} />
      </div>

      {/* 1. TOP NAVIGATION BAR WITH MULTILINGUAL LANGUAGE SWITCHER */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/nexora_logo.png"
              alt="Nexora Logo"
              className="h-10 w-10 rounded-xl object-contain shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-110"
            />
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                Nexora
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest -mt-1">
                Training
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
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all text-left ${lang === opt.code
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
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[#026637] px-5 py-2 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95 transition-all"
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
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-[#026637] px-5 py-2 text-xs font-bold text-white shadow-md shadow-primary/25 hover:opacity-95 transition-all"
                >
                  {t.getStarted} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION MATCHING REFERENCE IMAGE PIXEL-FOR-PIXEL */}
      <section className="relative overflow-hidden bg-[#e2f0f5] dark:bg-[#021d10] border-b border-[#014122]/15 min-h-[520px] lg:min-h-[580px] flex items-center">

        {/* Right Side Background Image */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-[58%] h-full overflow-hidden">
          <img
            src="/hero_students.jpg"
            alt="Nexora Training Students"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Left Side Light Ice-Blue Layer with Smooth Convex Arc */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-[48%] bg-[#e2f0f5] dark:bg-[#021d10] z-10">
          {/* Subtle Dot Grid Pattern on Top Left */}
          <div className="absolute top-4 left-6 h-36 w-36 bg-[radial-gradient(#014122_1.5px,transparent_1.5px)] [background-size:14px_14px] opacity-20 pointer-events-none" />

          {/* Smooth SVG Convex Arch Extension to the Right */}
          <svg
            className="absolute top-0 bottom-0 -right-24 lg:-right-36 h-full w-24 lg:w-36 text-[#e2f0f5] dark:text-[#021d10] fill-current pointer-events-none hidden lg:block"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M 0,0 C 120,30 120,70 0,100 Z" />
          </svg>
        </div>

        {/* Foreground Content Grid */}
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-14 lg:py-20">
          <div className="max-w-2xl text-left space-y-6">

            {/* Top Sub-Tag */}
            <div className="text-sm sm:text-base font-black tracking-[0.3em] text-[#014122] dark:text-emerald-300 uppercase">
              LEARN. BUILD. GROW.
            </div>

            {/* Main Display Headline (Serif Font) */}
            <div className="space-y-0 leading-none">
              <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black font-serif tracking-tight text-[#014122] dark:text-white uppercase leading-[0.9]">
                NEXORA
              </h1>
              <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black font-serif tracking-tight text-[#014122] dark:text-emerald-400 uppercase leading-[0.9]">
                TRAINING
              </h1>
            </div>

            {/* Sub-Headline & Underline Accent Line */}
            <div className="space-y-2 pt-2">
              <div className="text-sm sm:text-lg font-black tracking-widest text-[#014122] dark:text-emerald-300 uppercase">
                ON-PROJECT TRAINING PROGRAM
              </div>
              <div className="h-[3.5px] w-16 bg-[#014122] dark:bg-emerald-400 rounded-full" />
            </div>

            {/* Body Description */}
            <div className="space-y-0.5 text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 leading-snug pt-1">
              <p className="font-bold text-slate-900 dark:text-white">Learn by Doing.</p>
              <p className="text-slate-700 dark:text-slate-300">Build Real Projects. Gain Real Skills.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-3">
              <button
                type="button"
                onClick={() => handleDemoLogin("student")}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#014122] px-7 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-[#026637] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                Explore Programs <ArrowRight className="h-4 w-4" />
              </button>

              <a
                href="tel:+911234567890"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl border-2 border-[#014122] bg-white px-7 py-3.5 text-xs sm:text-sm font-bold text-[#014122] shadow-sm hover:bg-[#014122] hover:text-white transition-all duration-300 cursor-pointer"
              >
                📞 Talk to Counselor
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 2.5 ON-PROJECT TRAINING PROGRAM CARD SECTION (SIDE-BY-SIDE SPLIT INSIDE CARD) */}
      <section className="relative z-10 py-16 lg:py-20 bg-gradient-to-b from-[#e2f0f5] to-background dark:from-[#021d10] dark:to-background border-b border-[#014122]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-[#014122]/20 bg-white/95 dark:bg-[#022413]/95 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

              {/* LEFT SIDE (7 columns): Header, Titles & 5 Features */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* Top Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-[#014122] px-5 py-1.5 text-xs font-black tracking-widest text-white uppercase shadow-md">
                  <Sparkles className="h-4 w-4 text-[#e6f4ec]" />
                  <span>{t.programBadgeTag}</span>
                </div>

                {/* Main Titles */}
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#014122] dark:text-white">
                    {t.programMainTitle}
                  </h2>
                  <p className="text-lg sm:text-2xl font-black text-[#014122]/80 dark:text-emerald-300">
                    {t.programMainSubtitle}
                  </p>

                  {/* Tag Pill */}
                  <div className="pt-2">
                    <span className="inline-block rounded-full bg-[#e6f4ec] dark:bg-[#014122] border border-[#014122]/20 px-5 py-1.5 text-xs sm:text-sm font-extrabold text-[#014122] dark:text-emerald-200 shadow-sm">
                      {t.programPillTags}
                    </span>
                  </div>
                </div>

                {/* 5 Feature Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="flex items-center gap-3 rounded-2xl border border-[#014122]/20 bg-[#f4f9f6] dark:bg-[#01331a] p-3.5 shadow-sm text-left">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#014122] text-lg text-white shrink-0 shadow-sm">💻</span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">{t.programFeat1}</span>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-[#014122]/20 bg-[#f4f9f6] dark:bg-[#01331a] p-3.5 shadow-sm text-left">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#014122] text-lg text-white shrink-0 shadow-sm">👨‍🏫</span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">{t.programFeat2}</span>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-[#014122]/20 bg-[#f4f9f6] dark:bg-[#01331a] p-3.5 shadow-sm text-left">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#014122] text-lg text-white shrink-0 shadow-sm">📜</span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">{t.programFeat3}</span>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-[#014122]/20 bg-[#f4f9f6] dark:bg-[#01331a] p-3.5 shadow-sm text-left">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#014122] text-lg text-white shrink-0 shadow-sm">🏢</span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">{t.programFeat4}</span>
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-center gap-3 rounded-2xl border border-[#014122]/20 bg-[#f4f9f6] dark:bg-[#01331a] p-3.5 shadow-sm text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#014122] text-lg text-white shrink-0 shadow-sm">🚀</span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">{t.programFeat5}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE (5 columns): Program Info Box, Notice Box & CTA Button */}
              <div className="lg:col-span-5 space-y-6">

                {/* Program Details Card Box (Duration, Fee, Seats) */}
                <div className="rounded-3xl border border-[#014122]/20 bg-[#f4f9f6]/90 dark:bg-[#012b16]/90 p-6 space-y-4 text-center">
                  <h3 className="text-xs font-black tracking-widest text-[#014122] dark:text-emerald-300 uppercase">
                    {t.programDetailsTitle}
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-white dark:bg-[#02381e] p-3.5 border border-[#014122]/15 shadow-sm text-center">
                      <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t.programDurationLabel}</div>
                      <div className="text-lg font-black text-[#014122] dark:text-white mt-1">{t.programDurationValue}</div>
                    </div>

                    <div className="rounded-2xl bg-white dark:bg-[#02381e] p-3.5 border border-[#014122]/15 shadow-sm text-center">
                      <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t.programFeeLabel}</div>
                      <div className="text-lg font-black text-[#014122] dark:text-white mt-1">{t.programFeeValue}</div>
                    </div>

                    <div className="rounded-2xl bg-white dark:bg-[#02381e] p-3.5 border border-[#014122]/15 shadow-sm text-center">
                      <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t.programSeatsLabel}</div>
                      <div className="text-lg font-black text-[#014122] dark:text-white mt-1">{t.programSeatsValue}</div>
                    </div>
                  </div>
                </div>

                {/* Important Notice Box (Orange Border) */}
                <div className="rounded-3xl border-2 border-amber-400/80 bg-amber-500/10 dark:bg-amber-950/20 p-5 text-left space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-[#014122] dark:text-amber-300 font-extrabold text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white font-black text-xs">!</span>
                    <span>{t.noticeTitle}</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {t.noticeText1}
                    <span className="font-bold text-rose-600 dark:text-rose-400">{t.noticeNoPlacement}</span>
                  </p>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {t.noticeText2}
                    <span className="font-bold text-slate-900 dark:text-white">{t.noticeCert}</span>
                    {t.noticeAnd}
                    <span className="font-bold text-slate-900 dark:text-white">{t.noticeExp}</span>
                    {t.noticeGiven}
                  </p>
                </div>

                {/* Flame Pill + Enroll CTA Button + Subtext */}
                <div className="pt-2 text-center space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/20 bg-[#e6f4ec] dark:bg-[#014122] px-4 py-1.5 text-xs font-black text-[#014122] dark:text-emerald-200 shadow-sm">
                    <span>{t.flamePill}</span>
                  </div>

                  <div>
                    <Link
                      to="/login"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#014122] hover:bg-[#026637] px-8 py-3.5 text-sm sm:text-base font-black text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                    >
                      {t.enrollTodayBtn} <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>

                  <p className="text-[11px] font-extrabold text-[#014122] dark:text-emerald-300">
                    {t.enrollTodaySub}
                  </p>
                </div>

              </div>

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
                  className={`rounded-xl px-5 py-2.5 text-xs font-extrabold capitalize transition-all duration-300 ${activeRoleTab === r
                    ? "bg-gradient-to-r from-primary to-[#026637] text-white shadow-md shadow-primary/25 scale-105"
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
                  <span className="rounded-full bg-[#014122]/10 text-[#014122] border border-[#014122]/20 px-3 py-1 text-xs font-bold">
                    🎓 {t.student}
                  </span>
                  <h3 className="text-2xl font-extrabold text-foreground">Interactive Learning Dashboard</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Track calendar validity countdowns, access live Google Meet streams with 8-step server verification, download lecture notes, and review payment history.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("student")}
                    className="inline-flex items-center gap-2.5 rounded-2xl bg-[#014122] hover:bg-[#026637] px-7 py-3.5 text-sm font-black text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
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
                    <span className="rounded-md bg-[#014122] px-2 py-0.5 text-[10px] font-bold">Join Meet</span>
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
                    className="inline-flex items-center gap-2.5 rounded-2xl bg-purple-700 hover:bg-purple-800 px-7 py-3.5 text-sm font-black text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
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
                    className="inline-flex items-center gap-2.5 rounded-2xl bg-amber-700 hover:bg-amber-800 px-7 py-3.5 text-sm font-black text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
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
                    className="inline-flex items-center gap-2.5 rounded-2xl bg-rose-700 hover:bg-rose-800 px-7 py-3.5 text-sm font-black text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
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
            <span className="rounded-full bg-[#014122]/10 border border-[#014122]/20 px-4 py-1.5 text-xs font-bold text-[#014122]">
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
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#014122]/10 text-[#014122] mb-5">
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

            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#014122]/10 text-[#014122] mb-5">
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
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-[#026637] px-4 py-1 text-[10px] font-black uppercase text-white shadow-md">
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
                className="mt-8 w-full rounded-xl bg-gradient-to-r from-primary to-[#026637] text-white py-2.5 text-xs font-bold shadow-md hover:opacity-95 transition-all"
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
            <img
              src="/nexora_logo.png"
              alt="Nexora Logo"
              className="h-9 w-9 rounded-xl object-contain shadow-md"
            />
            <span className="text-base font-black text-foreground">Nexora</span>
          </div>

          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            {t.footerText}
          </p>

          <div className="pt-4 border-t border-border/60 text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} CaryanamIndia Pvt. Ltd. All rights reserved (English, हिंदी, मराठी).
          </div>
        </div>
      </footer>
    </div>
  );
}
