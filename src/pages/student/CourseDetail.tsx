import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  CreditCard,
  PlayCircle,
  Award,
  Loader2,
} from "lucide-react";

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { profile } = useAuth();
  const store = useDataStore();
  const navigate = useNavigate();

  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [springCourse, setSpringCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const storeCourse = courseId ? store.getCourse(courseId) : null;

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    api.getAllCourses()
      .then((res) => {
        if (res.success && res.data) {
          const found = res.data.find(
            (c: any) => String(c.id) === courseId || c.courseId === courseId || c.courseCode === courseId
          );
          if (found) {
            setSpringCourse(found);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  if (!courseId) return null;

  const rawCourse = storeCourse || (springCourse ? {
    id: String(springCourse.id || springCourse.courseId || courseId),
    name: springCourse.title || springCourse.name,
    category: springCourse.category?.replace(/_/g, " ") || "Software Engineering",
    description: springCourse.description || "Master industry standards through hands-on architectures and real-world assignments.",
    status: (springCourse.status || "ACTIVE").toLowerCase(),
    facultyName: springCourse.facultyName || "Dr. Rajesh Sharma",
    facultyId: springCourse.facultyId || "FAC-2001",
    facultyEmail: "faculty@codextechnology.com",
  } : null);

  const rawPlans = storeCourse
    ? store.getPlansForCourse(courseId)
    : (springCourse?.plans && springCourse.plans.length > 0)
    ? springCourse.plans.map((p: any) => ({
        id: String(p.id),
        name: p.durationLabel || `${p.duration?.replace(/_/g, " ") || "1 Month"} Plan`,
        duration_months: p.duration === "THREE_MONTHS" ? 3 : p.duration === "TWO_MONTHS" ? 2 : 1,
        price: p.price || 7000,
        discount: 0,
      }))
    : [
        { id: "p1", name: "1 Month Plan", duration_months: 1, price: 7000, discount: 0 },
        { id: "p2", name: "2 Months Plan", duration_months: 2, price: 14000, discount: 1000 },
        { id: "p3", name: "3 Months Plan", duration_months: 3, price: 21000, discount: 2000 },
      ];

  const rawLectures = storeCourse
    ? store.getLecturesForCourse(courseId)
    : [
        { id: "lec-1", title: "Module 1: Architecture Overview & Tooling", description: "Development environment setup, core design patterns, and foundational concepts.", status: "completed" },
        { id: "lec-2", title: "Module 2: Core Components & Data Modeling", description: "Deep dive into state management, schema design, and microservice communications.", status: "live" },
        { id: "lec-3", title: "Module 3: Production Deployment & CI/CD", description: "Automated pipelines, testing frameworks, containerization, and monitoring.", status: "scheduled" },
      ];

  const enrollments = profile ? store.getEnrollmentsForProfile(profile.id) : [];
  const enrollment = enrollments.find(
    (e) => e.course_id === courseId || (springCourse?.courseCode && e.course_id === springCourse.courseCode)
  );
  const isEnrolled = Boolean(enrollment);

  const selectedPlan = rawPlans.find((p: any) => p.id === (selectedPlanId || rawPlans[0]?.id)) || rawPlans[0];

  const handleEnrollment = () => {
    if (!profile || !selectedPlan) return;
    setProcessing(true);

    setTimeout(() => {
      // Trigger complete verified enrollment flow
      const finalAmount = Math.max(0, selectedPlan.price - (selectedPlan.discount || 0));
      store.processSuccessfulEnrollment({
        studentProfileId: profile.id,
        courseId,
        planId: selectedPlan.id,
        amount: finalAmount,
        paymentMethod: "UPI / NetBanking (Instant Activation)",
      });

      setProcessing(false);
      setCheckoutModalOpen(false);
      navigate("/student/lectures");
    }, 1000);
  };

  if (loading && !rawCourse) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">Loading course details...</span>
      </div>
    );
  }

  if (!rawCourse) {
    return (
      <div className="p-12 text-center space-y-3">
        <h2 className="text-xl font-bold text-foreground">Course Not Found</h2>
        <p className="text-xs text-muted-foreground">The requested course could not be located in the catalog.</p>
        <Link to="/student/courses" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs">
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Back */}
      <div>
        <Link
          to="/student/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 p-6 sm:p-10 text-white shadow-xl">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30 mb-3">
              {rawCourse.category || "Professional Track"}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
              {rawCourse.name}
            </h1>
            <p className="text-sm sm:text-base text-emerald-200/80 leading-relaxed max-w-2xl mb-6">
              {rawCourse.description || "Master industry standards through hands-on architectures and real-world assignments."}
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-emerald-200">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                {rawLectures.length} Comprehensive Modules
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-emerald-400" />
                Certification Included
              </span>
              {isEnrolled && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Enrolled (Valid till {enrollment?.expiry_date ? formatDate(enrollment.expiry_date) : "Active"})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Syllabus + Pricing Plans */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Curriculum Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Faculty Mentor Profile Card */}
          <div className="rounded-2xl border border-emerald-500/20 bg-card p-5 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 font-bold text-base border border-emerald-500/20 shrink-0">
                <User className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Course Lead Faculty & Mentor</div>
                <div className="text-base font-bold text-foreground">{(rawCourse as any).facultyName || "Dr. Rajesh Sharma"}</div>
                <div className="text-xs text-muted-foreground">Faculty Code: <span className="font-mono text-emerald-500 font-bold">{(rawCourse as any).facultyId || "FAC-2001"}</span></div>
              </div>
            </div>
            <a
              href={`mailto:${(rawCourse as any).facultyEmail || "faculty@codextechnology.com"}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all shrink-0 cursor-pointer"
            >
              Contact Faculty
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Curriculum & Lecture Outline
            </h2>

            <div className="divide-y divide-border">
              {rawLectures.map((lec: any, idx: number) => (
                <div
                  key={lec.id || idx}
                  className="flex items-center justify-between py-4 hover:bg-accent/40 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-xs font-bold text-muted-foreground shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{lec.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {lec.description || "Interactive core session"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={lec.status || "scheduled"} />
                    {isEnrolled && (
                      <Link
                        to={`/student/lecture/${lec.id}`}
                        className="rounded-lg bg-primary/10 p-2 text-primary hover:bg-primary hover:text-white transition-all"
                        title="Access Lecture"
                      >
                        <PlayCircle className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Course Plans & Enrollment Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs sticky top-20">
            <h3 className="text-base font-bold text-foreground mb-1">
              Select Pricing Plan
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Calendar validity calculated automatically upon enrollment.
            </p>

            <div className="space-y-3 mb-6">
              {rawPlans.map((plan: any) => {
                const isSelected = (selectedPlanId || rawPlans[0]?.id) === plan.id;
                const finalPrice = Math.max(0, plan.price - (plan.discount || 0));

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                        : "border-border hover:border-muted-foreground/40 bg-background"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">
                        {plan.name}
                      </span>
                      {plan.discount > 0 && (
                        <span className="rounded bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          Save {formatCurrency(plan.discount)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-xl font-extrabold text-foreground">
                        {formatCurrency(finalPrice)}
                      </span>
                      {plan.discount > 0 && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatCurrency(plan.price)}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary" />
                      {plan.duration_months} Months Access ({plan.duration_months * 30}+ Days)
                    </div>
                  </div>
                );
              })}
            </div>

            {isEnrolled ? (
              <div className="space-y-3">
                <Link
                  to="/student/lectures"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 font-semibold text-xs text-white shadow-md hover:bg-emerald-700 transition-all"
                >
                  <PlayCircle className="h-4 w-4" /> Go to Enrolled Lectures
                </Link>
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(true)}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background font-medium text-xs text-muted-foreground hover:bg-accent transition-colors"
                >
                  Extend / Renew Plan
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(true)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-xs text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer"
              >
                <CreditCard className="h-4 w-4" /> Enroll in Selected Plan
              </button>
            )}

            <div className="mt-4 border-t border-border pt-4 text-[11px] text-muted-foreground space-y-1.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Backend verified instant activation
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                Calendar-based duration guarantee
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout / Payment Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => !processing && setCheckoutModalOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl z-50 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-foreground mb-1">
              Confirm Enrollment & Checkout
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Review your course subscription details before activation.
            </p>

            <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Course:</span>
                <span className="font-semibold text-foreground">{rawCourse.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Selected Plan:</span>
                <span className="font-semibold text-foreground">{selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-semibold text-foreground">{selectedPlan?.duration_months} Months</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm font-bold text-foreground">
                <span>Total Amount:</span>
                <span className="text-primary">
                  {formatCurrency(Math.max(0, (selectedPlan?.price || 0) - (selectedPlan?.discount || 0)))}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={processing}
                onClick={() => setCheckoutModalOpen(false)}
                className="flex-1 rounded-xl border border-border bg-background py-2.5 text-xs font-medium text-muted-foreground hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleEnrollment}
                className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {processing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {processing ? "Activating..." : "Pay & Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
