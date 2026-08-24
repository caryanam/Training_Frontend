import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Video,
  PlayCircle,
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  Lock,
} from "lucide-react";

export default function StudentLectures() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const enrollments = profile ? store.getEnrollmentsForProfile(profile.id) : [];
  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));

  const allLectures = store.getLectures();
  const enrolledLectures = allLectures.filter((l) => enrolledCourseIds.has(l.course_id));

  const filteredLectures = enrolledLectures.filter((lec) => {
    const matchesSearch =
      lec.title.toLowerCase().includes(search.toLowerCase()) ||
      (lec.description && lec.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || lec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Lectures"
        subtitle="Live sessions, upcoming classes, and on-demand recordings for your enrolled courses."
      />

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search lectures..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live Now</option>
            <option value="completed">Completed / Recordings</option>
          </select>
        </div>
      </div>

      {/* Lectures Grid */}
      {filteredLectures.length === 0 ? (
        <EmptyState
          title="No lectures found"
          description={
            enrolledLectures.length === 0
              ? "You are not enrolled in any active courses yet."
              : "No lectures matched your search criteria."
          }
          action={
            enrolledLectures.length === 0 ? (
              <Link
                to="/student/courses"
                className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-xs"
              >
                Browse Courses & Enroll
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLectures.map((lec) => {
            const course = store.getCourse(lec.course_id);

            return (
              <div
                key={lec.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-primary truncate max-w-[180px]">
                      {course?.name || "Course"}
                    </span>
                    <StatusBadge status={lec.status} />
                  </div>

                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {lec.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                    {lec.description || "Interactive core session with code repository and exercises."}
                  </p>

                  <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border pt-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {lec.lecture_date ? formatDate(lec.lecture_date) : "TBA"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {lec.start_time || "18:00"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <Link
                    to={`/student/lecture/${lec.id}`}
                    className="flex-1 flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {lec.status === "live" ? "Join Stream" : "Watch Lecture"}
                  </Link>

                  {lec.is_downloadable && (
                    <Link
                      to={`/student/lecture/${lec.id}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                      title="Download materials"
                    >
                      <Download className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
