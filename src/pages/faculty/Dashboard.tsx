import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  BookOpen,
  Users,
  Video,
  Calendar,
  Share2,
  Plus,
  PlayCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export default function FacultyDashboard() {
  const { profile } = useAuth();
  const store = useDataStore();

  const courses = store.getCourses();
  const lectures = store.getLectures();
  const enrollments = store.getEnrollments().filter((e) => e.status === "active");

  const todayStr = new Date().toISOString().split("T")[0];
  const todayLectures = lectures.filter((l) => l.lecture_date === todayStr);
  const upcomingLectures = lectures.filter((l) => l.status === "scheduled" || l.status === "live");
  const completedLectures = lectures.filter((l) => l.status === "completed");

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <PageHeader
        title={`Faculty Control Portal`}
        subtitle={`Welcome, ${profile?.full_name || "Professor"}. Manage live lecture streams, curriculum, and student engagement.`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/faculty/lectures"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
            >
              <Plus className="h-4 w-4" /> Create Lecture
            </Link>
            <Link
              to="/faculty/links"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
            >
              <Share2 className="h-4 w-4" /> Share Link
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Assigned Courses"
          value={courses.length}
          subtitle="Active curriculum tracks"
          icon={<BookOpen className="h-5 w-5" />}
        />
        <StatsCard
          title="Enrolled Students"
          value={enrollments.length}
          subtitle="Active learning subscriptions"
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          title="Upcoming Lectures"
          value={upcomingLectures.length}
          subtitle="Scheduled live sessions"
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatsCard
          title="Completed Lectures"
          value={completedLectures.length}
          subtitle="Published recordings"
          icon={<Video className="h-5 w-5" />}
        />
      </div>

      {/* Main Grid: Today's Schedule & Recent Sessions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Upcoming Lecture Roster */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Scheduled Sessions</h3>
              <p className="text-xs text-muted-foreground">Manage your upcoming live classes and student invites</p>
            </div>
            <Link
              to="/faculty/lectures"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Manage All →
            </Link>
          </div>

          <div className="divide-y divide-border">
            {upcomingLectures.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No upcoming lectures scheduled. Click 'Create Lecture' to schedule one.
              </div>
            ) : (
              upcomingLectures.slice(0, 4).map((lec) => {
                const course = store.getCourse(lec.course_id);

                return (
                  <div
                    key={lec.id}
                    className="flex items-center justify-between py-3.5 hover:bg-accent/40 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                        <Video className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                          {lec.title}
                        </h4>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>{course?.name}</span>
                          <span>•</span>
                          <span>{lec.lecture_date ? formatDate(lec.lecture_date) : "TBA"}</span>
                          <span>•</span>
                          <span>{lec.start_time || "18:00"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={lec.status} />
                      <Link
                        to="/faculty/links"
                        className="rounded-lg border border-border bg-background p-1.5 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                        title="Share with Student/Executor"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Link Share & Info Box */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" /> Faculty Link Dispatch
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When you share lecture links with <strong>Executors</strong> or <strong>Students</strong>, a trackable record and system notification are automatically dispatched.
            </p>

            <Link
              to="/faculty/links"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
            >
              Open Link Distribution Hub
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs text-xs space-y-2">
            <h4 className="font-bold text-foreground">Faculty Guidelines</h4>
            <p className="text-muted-foreground">
              Always attach downloadable PDF handouts to your lecture sessions before marking them as COMPLETED.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
