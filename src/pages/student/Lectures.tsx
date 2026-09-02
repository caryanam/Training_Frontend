import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { api } from "@/lib/api";
import { formatDate, formatExternalUrl } from "@/lib/utils";
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
  ExternalLink,
  Code2,
  Lock,
  Layers,
  Info,
} from "lucide-react";

export default function StudentLectures() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [secureLectures, setSecureLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setLoading(true);

    api.getStudentEnrolledLectures()
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          const mapped = res.data.map((l: any) => ({
            id: String(l.lectureId || l.id),
            course_id: String(l.courseId || l.courseCode),
            course_name: l.courseName || "Enrolled Curriculum Track",
            title: l.title,
            description: l.description,
            lecture_date: l.lectureDate,
            start_time: l.startTime,
            end_time: l.endTime,
            meeting_link: l.meetingLink || l.lectureUrl,
            lecture_url: l.lectureUrl || l.meetingLink,
            recording_url: l.recordingUrl,
            is_downloadable: l.isDownloadable,
            status: "scheduled",
          }));
          setSecureLectures(mapped);
        } else {
          // If no active enrollment returned by backend, strictly set empty
          setSecureLectures([]);
        }
      })
      .catch(() => {
        setSecureLectures([]);
      })
      .finally(() => setLoading(false));
  }, [profile]);

  const handleWatchLecture = (lec: any) => {
    const meetingUrl = lec.meeting_link || lec.lecture_url || lec.meetingLink || lec.lectureUrl;
    if (!meetingUrl || meetingUrl.trim() === "" || meetingUrl === "#") {
      setNotice(`Google Meet link is not yet assigned for "${lec.title}". Please check back prior to class start time.`);
      setTimeout(() => setNotice(null), 5000);
      return;
    }
    const cleanUrl = formatExternalUrl(meetingUrl);
    window.open(cleanUrl, "_blank", "noopener,noreferrer");
  };

  const filteredLectures = secureLectures.filter((lec) => {
    const matchesSearch =
      lec.title.toLowerCase().includes(search.toLowerCase()) ||
      (lec.description && lec.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || lec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Lectures & Project Hub"
        subtitle="Live sessions, project deliverables, and on-demand recordings for your enrolled courses."
      />

      {notice && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-amber-800 dark:text-amber-200 hover:underline text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:row gap-3 items-center justify-between">
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
            secureLectures.length === 0
              ? "You are not enrolled in any active courses yet. Enroll in a course to access live lectures and project links."
              : "No lectures matched your search criteria."
          }
          action={
            secureLectures.length === 0 ? (
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
            const courseTitle = lec.course_name || course?.name || "Enrolled Curriculum Track";

            return (
              <div
                key={lec.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-primary truncate max-w-[180px]">
                      {courseTitle}
                    </span>
                    <StatusBadge status={lec.status || "scheduled"} />
                  </div>

                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {lec.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                    {lec.description || "Interactive core session with curriculum materials and live mentorship."}
                  </p>

                  {/* Recording / Project Resource (Only shown if actually present) */}
                  {lec.recording_url && (
                    <div className="rounded-xl bg-muted/40 p-3 mb-3 border border-border/60 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-semibold text-foreground text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <Code2 className="h-3.5 w-3.5 text-primary" /> Session Recording & Deliverable
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">Enrolled Access</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={formatExternalUrl(lec.recording_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:underline"
                        >
                          Access Recording <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border pt-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {lec.lecture_date ? formatDate(lec.lecture_date) : "TBA"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {lec.start_time || "18:00"} - {lec.end_time || "19:30"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleWatchLecture(lec)}
                    className="flex-1 flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {lec.status === "live" ? "Join Stream" : "Watch Lecture"}
                  </button>

                  <Link
                    to={`/student/lecture/${lec.id}`}
                    className="flex h-9 items-center justify-center gap-1 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                    title="View details & handouts"
                  >
                    Details
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
