import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Video,
  Search,
  Lock,
  Unlock,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  Filter,
} from "lucide-react";

export default function AdminLectures() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  const lectures = store.getLectures();
  const courses = store.getCourses();

  const filteredLectures = lectures.filter((lec) => {
    const matchesSearch =
      lec.title.toLowerCase().includes(search.toLowerCase()) ||
      (lec.description && lec.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCourse = courseFilter === "all" || lec.course_id === courseFilter;
    return matchesSearch && matchesCourse;
  });

  const toggleLectureStatus = (lecId: string, currentStatus: string) => {
    if (!profile) return;
    const newStatus = currentStatus === "disabled" ? "scheduled" : "disabled";

    store.updateLecture(lecId, { status: newStatus as any });

    store.addAuditLog({
      action: newStatus === "disabled" ? "lecture.disabled" : "lecture.enabled",
      entity: "lectures",
      entity_id: lecId,
      details: { previousStatus: currentStatus, newStatus },
      user_id: profile.id,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Lecture Operations"
        subtitle="Full administrative governance over published sessions, meeting endpoints, recordings, and access states."
      />

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search all lectures..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredLectures.length === 0 ? (
        <EmptyState title="No lectures found" description="No lectures matched your query." />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Lecture Title</th>
                  <th className="px-5 py-3.5">Course</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Downloads</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLectures.map((lec) => {
                  const course = store.getCourse(lec.course_id);
                  const isDisabled = lec.status === "disabled";

                  return (
                    <tr key={lec.id} className="hover:bg-accent/40 transition-colors">
                      <td className="px-5 py-4 font-bold text-foreground max-w-xs">
                        <div className="line-clamp-1">{lec.title}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">ID: {lec.id}</div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-foreground">
                        {course?.name || "Course"}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        <div>{lec.lecture_date ? formatDate(lec.lecture_date) : "TBA"}</div>
                        <div className="text-[11px]">{lec.start_time} - {lec.end_time}</div>
                      </td>
                      <td className="px-5 py-4">
                        {lec.is_downloadable ? (
                          <span className="text-emerald-600 font-semibold">Enabled</span>
                        ) : (
                          <span className="text-muted-foreground">Disabled</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={lec.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleLectureStatus(lec.id, lec.status)}
                            className={`rounded-lg border p-1.5 transition-colors ${
                              isDisabled
                                ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                : "border-border text-muted-foreground hover:text-amber-600 hover:border-amber-300"
                            }`}
                            title={isDisabled ? "Enable Lecture" : "Disable Lecture for Students"}
                          >
                            {isDisabled ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => store.deleteLecture(lec.id)}
                            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-rose-600 hover:border-rose-300 transition-colors"
                            title="Delete Lecture"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
