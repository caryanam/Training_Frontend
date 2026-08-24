import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { formatCurrency, formatDate, getDaysRemaining } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function MyCourses() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [filter, setFilter] = useState<"enrolled" | "all">("enrolled");

  const allCourses = store.getCourses();
  const enrollments = profile ? store.getEnrollmentsForProfile(profile.id) : [];

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));
  const enrolledCourses = allCourses.filter((c) => enrolledCourseIds.has(c.id));

  const displayCourses = filter === "enrolled" ? enrolledCourses : allCourses;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses & Programs"
        subtitle="Explore specialized learning tracks and manage your active enrollments."
        actions={
          <div className="flex items-center rounded-lg border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setFilter("enrolled")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === "enrolled"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              My Enrolled ({enrolledCourses.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Courses ({allCourses.length})
            </button>
          </div>
        }
      />

      {/* Courses Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayCourses.map((course) => {
          const enrollment = enrollments.find((e) => e.course_id === course.id);
          const isEnrolled = Boolean(enrollment);
          const plans = store.getPlansForCourse(course.id);
          const startingPrice = plans.length > 0 ? plans[0].price : 4999;
          const lectures = store.getLecturesForCourse(course.id);

          const daysRemaining = enrollment?.expiry_date
            ? getDaysRemaining(enrollment.expiry_date)
            : 0;

          return (
            <div
              key={course.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-all group"
            >
              <div>
                {/* Course Header Banner */}
                <div className="relative bg-gradient-to-r from-indigo-950 to-slate-900 p-6 text-white">
                  <span className="inline-block rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300 ring-1 ring-indigo-400/30 mb-2">
                    {course.category || "Software Engineering"}
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-white line-clamp-1 group-hover:text-indigo-200 transition-colors">
                    {course.name}
                  </h3>
                </div>

                {/* Course Body */}
                <div className="p-5 space-y-4">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {course.description || "Comprehensive hands-on training curriculum designed for production."}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-b border-border py-2.5">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      {lectures.length} Lectures
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {plans.length > 0 ? `${plans[0].duration_months} - 12 Months` : "Flexible Plans"}
                    </span>
                  </div>

                  {/* Enrollment Status or Pricing */}
                  {isEnrolled ? (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Enrolled
                        </span>
                        <StatusBadge status={enrollment!.status} />
                      </div>
                      <div className="text-[11px] text-muted-foreground flex justify-between">
                        <span>Validity:</span>
                        <span className="font-medium text-foreground">
                          {enrollment?.expiry_date ? formatDate(enrollment.expiry_date) : "N/A"} ({daysRemaining} days left)
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Plans from</span>
                        <span className="text-base font-bold text-foreground">
                          {formatCurrency(startingPrice)}
                        </span>
                      </div>
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        {plans.length} Flexible Plans
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="p-5 pt-0">
                <Link
                  to={`/student/course/${course.id}`}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
                >
                  {isEnrolled ? "Access Curriculum" : "View Details & Enroll"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
