import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
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
} from "lucide-react";

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { profile } = useAuth();
  const store = useDataStore();
  const navigate = useNavigate();

  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  if (!courseId) return null;

  const course = store.getCourse(courseId);
  const plans = store.getPlansForCourse(courseId);
  const lectures = store.getLecturesForCourse(courseId);
  const enrollments = profile ? store.getEnrollmentsForProfile(profile.id) : [];
  const enrollment = enrollments.find((e) => e.course_id === courseId);
  const isEnrolled = Boolean(enrollment);

  const selectedPlan = plans.find((p) => p.id === (selectedPlanId || plans[0]?.id)) || plans[0];

  const handleEnrollment = () => {
    if (!profile || !selectedPlan) return;
    setProcessing(true);

    setTimeout(() => {
      // Trigger complete verified enrollment flow
      const finalAmount = Math.max(0, selectedPlan.price - selectedPlan.discount);
      store.processSuccessfulEnrollment({
        studentProfileId: profile.id,
        courseId,
        planId: selectedPlan.id,
        amount: finalAmount,
        paymentMethod: "UPI / NetBanking (Mock Payment)",
      });

      setProcessing(false);
      setCheckoutModalOpen(false);
      navigate("/student/lectures");
    }, 1200);
  };

  if (!course) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold">Course Not Found</h2>
        <Link to="/student/courses" className="text-primary mt-2 inline-block">Back to Courses</Link>
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

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 p-6 sm:p-10 text-white shadow-xl">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-400/30 mb-3">
              {course.category || "Professional Track"}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
              {course.name}
            </h1>
            <p className="text-sm sm:text-base text-indigo-200/80 leading-relaxed max-w-2xl mb-6">
              {course.description || "Master industry standards through hands-on architectures and real-world assignments."}
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-indigo-200">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                {lectures.length} Comprehensive Modules
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-indigo-400" />
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
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Curriculum & Lecture Outline
            </h2>

            <div className="divide-y divide-border">
              {lectures.map((lec, idx) => (
                <div
                  key={lec.id}
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
                    <StatusBadge status={lec.status} />
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
              {plans.map((plan) => {
                const isSelected = (selectedPlanId || plans[0]?.id) === plan.id;
                const finalPrice = Math.max(0, plan.price - plan.discount);

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
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-xs text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
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
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
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
                <span className="font-semibold text-foreground">{course.name}</span>
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
                className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50"
              >
                {processing ? "Verifying Payment..." : "Pay & Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
