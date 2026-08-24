import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  BookOpen,
  Users,
  Video,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function FacultyCourses() {
  const store = useDataStore();
  const courses = store.getCourses();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned Courses"
        subtitle="Manage assigned curriculum tracks, module schedules, and track student cohort progress."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const lectures = store.getLecturesForCourse(course.id);
          const enrollments = store.getEnrollments().filter((e) => e.course_id === course.id && e.status === "active");

          return (
            <div
              key={course.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-all group"
            >
              <div>
                <div className="bg-gradient-to-r from-indigo-950 to-slate-900 p-6 text-white">
                  <span className="inline-block rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300 ring-1 ring-indigo-400/30 mb-2">
                    {course.category || "Engineering"}
                  </span>
                  <h3 className="text-lg font-bold text-white line-clamp-1">{course.name}</h3>
                </div>

                <div className="p-5 space-y-4 text-xs">
                  <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                    {course.description || "Course modules and learning outcomes."}
                  </p>

                  <div className="grid grid-cols-2 gap-2 border-t border-b border-border py-3 text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Video className="h-4 w-4 text-primary" /> {lectures.length} Lectures
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Users className="h-4 w-4 text-emerald-600" /> {enrollments.length} Active Students
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  to="/faculty/lectures"
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
                >
                  Manage Lectures <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
