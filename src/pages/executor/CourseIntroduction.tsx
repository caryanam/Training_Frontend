import { useState } from "react";
import { useDataStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  BookOpen,
  CheckCircle2,
  Share2,
  PhoneCall,
  Clock,
  Award,
  Sparkles,
  ChevronRight,
  Send,
  HelpCircle,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ExecutorCourseIntroduction() {
  const store = useDataStore();
  const courses = store.getCourses();

  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || "");
  const [copied, setCopied] = useState(false);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const plans = selectedCourse ? store.getPlansForCourse(selectedCourse.id) : [];
  const lectures = selectedCourse ? store.getLecturesForCourse(selectedCourse.id) : [];

  const handleShare = () => {
    navigator.clipboard.writeText(
      `Check out ${selectedCourse?.name} at Nexora! Comprehensive syllabus with live lectures and certificate.`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Course Presentation & Advisory Catalog"
        subtitle="Pitch curriculum tracks to prospective students with structured benefits, modules, and pricing breakdowns."
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/executor/demo"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
            >
              <Video className="h-4 w-4" /> Schedule Free Demo
            </Link>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
            >
              {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
              {copied ? "Course Info Copied!" : "Share Course Info"}
            </button>
            <Link
              to="/executor/followups"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
            >
              <PhoneCall className="h-4 w-4" /> Schedule Follow-up
            </Link>
          </div>

        }
      />

      {/* Course Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {courses.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCourseId(c.id)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              selectedCourse?.id === c.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {selectedCourse && (
        <div className="space-y-8">
          {/* Hero Presentation Card */}
          <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 p-6 sm:p-10 text-white shadow-xl">
            <div className="max-w-3xl">
              <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30 mb-3">
                {selectedCourse.category || "Professional Track"}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
                {selectedCourse.name}
              </h2>
              <p className="text-sm sm:text-base text-emerald-200/80 leading-relaxed mb-6">
                {selectedCourse.description ||
                  "Complete enterprise curriculum with live mentor coding, project repositories, and placement preparation."}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <div className="text-emerald-400 font-bold">Duration</div>
                  <div className="text-white mt-0.5">1 - 12 Months</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <div className="text-emerald-400 font-bold">Total Sessions</div>
                  <div className="text-white mt-0.5">{lectures.length} Live Modules</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <div className="text-emerald-400 font-bold">Certification</div>
                  <div className="text-white mt-0.5">Industry Recognized</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <div className="text-emerald-400 font-bold">Support</div>
                  <div className="text-white mt-0.5">Dedicated Executor</div>
                </div>
              </div>
            </div>
          </div>

          {/* Curriculum & Pricing Grids */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left 2 Cols: Syllabus Modules */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Key Curriculum Modules
                </h3>

                <div className="divide-y divide-border">
                  {lectures.map((lec, idx) => (
                    <div key={lec.id} className="py-3.5 flex items-start gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-foreground">{lec.title}</h5>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {lec.description || "Hands-on project execution and live Q&A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Pricing Plans */}
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                <h3 className="text-base font-bold text-foreground mb-1">
                  Pricing Plans for Students
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Calendar-based validity duration options:
                </p>

                <div className="space-y-3">
                  {plans.map((p) => (
                    <div key={p.id} className="rounded-xl border border-border bg-muted/20 p-3.5 text-xs">
                      <div className="flex justify-between font-bold text-foreground">
                        <span>{p.name}</span>
                        <span className="text-primary">{formatCurrency(p.price - p.discount)}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1 flex justify-between">
                        <span>Validity: {p.duration_months} Months</span>
                        {p.discount > 0 && (
                          <span className="text-emerald-600 font-semibold">Save {formatCurrency(p.discount)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/executor/onboarding"
                  className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
                >
                  Onboard Student with Plan
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
