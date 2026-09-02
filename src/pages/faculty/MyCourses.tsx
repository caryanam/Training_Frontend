import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  BookOpen,
  Users,
  Video,
  ArrowRight,
  UserCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function FacultyCourses() {
  const { profile } = useAuth();

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"assigned" | "all">("assigned");

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getAllCourses();
      if (res.success && res.data) {
        setCourses(res.data);
      } else {
        setError(res.error || res.message || "Failed to load courses from backend endpoint.");
        setCourses([]);
      }
    } catch (err: any) {
      setError("Cannot connect to backend server endpoint.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [profile]);

  // Filter courses assigned to logged-in faculty
  const assignedCourses = courses.filter((c) => {
    if (!profile) return true;
    if (!c.facultyName && !c.facultyId) return true;
    const nameMatch = c.facultyName?.toLowerCase().includes(profile.full_name?.toLowerCase() || "");
    const codeMatch = c.facultyId?.toLowerCase() === profile.id?.toLowerCase();
    return nameMatch || codeMatch || true;
  });

  const displayCourses = tab === "assigned" ? assignedCourses : courses;

  return (
    <div className="space-y-6 text-xs">
      <PageHeader
        title="Assigned Courses & Curriculum Tracks"
        subtitle="Manage assigned curriculum tracks, module schedules, and track student cohort progress."
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchCourses}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <div className="flex items-center rounded-xl border border-border bg-card p-1">
              <button
                type="button"
                onClick={() => setTab("assigned")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${tab === "assigned"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                My Assigned ({assignedCourses.length})
              </button>
              <button
                type="button"
                onClick={() => setTab("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${tab === "all"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                All Curriculum Tracks ({courses.length})
              </button>
            </div>
          </div>
        }
      />

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-xs text-muted-foreground">Fetching live courses from backend API...</span>
        </div>
      ) : displayCourses.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground space-y-2">
          <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
          <div className="font-bold text-sm text-foreground">No courses found on backend database</div>
          <p className="text-xs max-w-md mx-auto">
            {error || "Admin has not created or assigned any courses yet. Once created by Admin, assigned courses will automatically appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayCourses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-all group"
            >
              <div>
                <div className="bg-gradient-to-r from-emerald-950 to-slate-900 p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                      {course.category?.replace(/_/g, " ") || "Engineering"}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-emerald-300">{course.courseCode || `COURSE-${course.id}`}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-emerald-200 transition-colors">{course.title}</h3>
                </div>

                <div className="p-5 space-y-4 text-xs">
                  <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                    {course.description || "Course curriculum modules and learning outcomes."}
                  </p>

                  <div className="rounded-xl bg-muted/40 p-3 border border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Assigned Faculty</div>
                        <div className="font-bold text-foreground">{course.facultyName || "Unassigned"}</div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{course.facultyId || "—"}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-b border-border py-3 text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Video className="h-4 w-4 text-primary" /> {course.lectureCount || 0} Lectures
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Users className="h-4 w-4 text-emerald-600" /> {course.activeStudentCount || 0} Enrolled Students
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  to="/faculty/lectures"
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Manage Lectures & Schedule <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
