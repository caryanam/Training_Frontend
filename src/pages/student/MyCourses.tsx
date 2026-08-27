import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { api } from "@/lib/api";
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
  Search,
  Filter,
  Loader2,
} from "lucide-react";

export default function MyCourses() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [filter, setFilter] = useState<"all" | "enrolled">("all");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [springCourses, setSpringCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getAllCourses()
      .then((res) => {
        if (res.success && res.data) {
          setSpringCourses(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const storeCourses = store.getCourses();
  const enrollments = profile ? store.getEnrollmentsForProfile(profile.id) : [];
  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));

  // Merge courses from API and store without duplicates
  const allCoursesMap = new Map<string, any>();

  // Add store courses first
  storeCourses.forEach((c) => {
    allCoursesMap.set(c.id, {
      id: c.id,
      name: c.name,
      category: c.category || "Software Engineering",
      description: c.description || "Comprehensive hands-on training curriculum designed for production.",
      facultyName: (c as any).facultyName || "Dr. Rajesh Sharma",
      facultyId: (c as any).facultyId || "FAC-2001",
      status: c.status || "active",
      plans: store.getPlansForCourse(c.id),
      lectures: store.getLecturesForCourse(c.id),
    });
  });

  // Merge or add spring courses
  springCourses.forEach((sc) => {
    const cid = String(sc.id || sc.courseId || sc.courseCode);
    const existing = allCoursesMap.get(cid) || allCoursesMap.get(sc.courseCode);
    allCoursesMap.set(cid, {
      id: cid,
      courseCode: sc.courseCode || cid,
      name: sc.title || sc.name || "Untitled Course",
      category: sc.category?.replace(/_/g, " ") || "Software Engineering",
      description: sc.description || "Master industry standards through real-world projects and direct faculty mentoring.",
      facultyName: sc.facultyName || "Dr. Rajesh Sharma",
      facultyId: sc.facultyId || "FAC-2001",
      status: (sc.status || "ACTIVE").toLowerCase(),
      plans: sc.plans && sc.plans.length > 0 ? sc.plans.map((p: any) => ({
        id: String(p.id),
        name: p.durationLabel || `${p.duration?.replace(/_/g, " ") || "1 Month"} Plan`,
        duration_months: p.duration === "THREE_MONTHS" ? 3 : p.duration === "TWO_MONTHS" ? 2 : 1,
        price: p.price || 7000,
        discount: 0,
      })) : existing?.plans || [
        { id: "p1", name: "1 Month Plan", duration_months: 1, price: 7000, discount: 0 },
        { id: "p2", name: "2 Months Plan", duration_months: 2, price: 14000, discount: 1000 },
        { id: "p3", name: "3 Months Plan", duration_months: 3, price: 21000, discount: 2000 },
      ],
      lectures: existing?.lectures || [],
    });
  });

  const allCombinedCourses = Array.from(allCoursesMap.values()).filter(
    (c) => c.status === "active" || c.status === "ACTIVE"
  );

  const enrolledCourses = allCombinedCourses.filter((c) =>
    enrolledCourseIds.has(c.id) || (c.courseCode && enrolledCourseIds.has(c.courseCode))
  );

  // Categories list
  const categories = ["all", ...Array.from(new Set(allCombinedCourses.map((c) => c.category)))];

  const baseCourses = filter === "enrolled" ? enrolledCourses : allCombinedCourses;

  const displayCourses = baseCourses.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "all" || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses & Programs"
        subtitle="Explore specialized learning tracks and manage your active enrollments."
        actions={
          <div className="flex items-center rounded-xl border border-border bg-card p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                filter === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Browse All Courses ({allCombinedCourses.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("enrolled")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                filter === "enrolled"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              My Enrolled ({enrolledCourses.length})
            </button>
          </div>
        }
      />

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search available courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring capitalize"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-xs text-muted-foreground">Loading course catalog...</span>
        </div>
      )}

      {/* Courses Grid */}
      {!loading && displayCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-sm font-bold text-foreground">No Courses Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {filter === "enrolled"
              ? "You haven't enrolled in any courses yet. Switch to 'Browse All Courses' to discover and enroll in programs."
              : "No courses match your search criteria. Try a different query or category."}
          </p>
          {filter === "enrolled" && (
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              <BookOpen className="h-4 w-4" /> View All Courses
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayCourses.map((course) => {
            const enrollment = enrollments.find(
              (e) => e.course_id === course.id || (course.courseCode && e.course_id === course.courseCode)
            );
            const isEnrolled = Boolean(enrollment);
            const plans = course.plans || [];
            const startingPrice = plans.length > 0 ? plans[0].price : 7000;
            const lectures = course.lectures || [];

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
                  <div className="relative bg-gradient-to-r from-emerald-950 to-slate-900 p-6 text-white">
                    <span className="inline-block rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-400/30 mb-2">
                      {course.category || "Software Engineering"}
                    </span>
                    <h3 className="text-lg font-bold tracking-tight text-white line-clamp-1 group-hover:text-emerald-200 transition-colors">
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
                        {lectures.length > 0 ? `${lectures.length} Lectures` : "Live Curriculum"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {plans.length > 0 ? `${plans[0].duration_months || 1} - 3 Months` : "Flexible Plans"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-xl border border-border/50">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">Faculty: <strong className="text-foreground">{course.facultyName || "Dr. Rajesh Sharma"}</strong></span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">{course.facultyId || "FAC-2001"}</span>
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
      )}
    </div>
  );
}
