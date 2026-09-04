import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Lecture } from "@/types/database";
import {
  Video,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  ExternalLink,
  Search,
  CheckCircle2,
  X,
  FileText,
  Radio,
  PlayCircle,
} from "lucide-react";

export default function FacultyLectures() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [search, setSearch] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [description, setDescription] = useState("");
  const [lectureDate, setLectureDate] = useState("");
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("19:30");
  const [lectureUrl, setLectureUrl] = useState("");
  const [recordingUrl, setRecordingUrl] = useState("");
  const [isDownloadable, setIsDownloadable] = useState(true);
  const [status, setStatus] = useState<Lecture["status"]>("scheduled");

  // Dynamic courses state (fetched from backend API and Admin store)
  const [dynamicCourses, setDynamicCourses] = useState<Array<{ id: string; name: string; courseCode?: string }>>([]);

  const storeCourses = store.getCourses();
  const [dynamicLectures, setDynamicLectures] = useState<Lecture[]>(store.getLectures());

  const loadDynamicLectures = async () => {
    try {
      const res = await api.getFacultyLectures();
      if (res.success && res.data && res.data.length > 0) {
        const mapped: Lecture[] = res.data.map((l: any) => ({
          id: String(l.lectureId || l.id),
          course_id: String(l.courseId || l.courseCode || "course-1"),
          faculty_id: String(l.facultyId || "fac-rec-1"),
          title: l.title,
          description: l.description || "",
          lecture_date: l.lectureDate || "",
          start_time: l.startTime || "18:00",
          end_time: l.endTime || "19:30",
          lecture_url: l.lectureUrl || "",
          recording_url: l.recordingUrl || "",
          downloadable_file_path: null,
          is_downloadable: Boolean(l.isDownloadable),
          status: "scheduled" as const,
          created_by: "fac-1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        setDynamicLectures(mapped);
        return;
      }
    } catch (err) {
      console.warn("Backend lectures fetch error:", err);
    }
    setDynamicLectures(store.getLectures());
  };

  const loadDynamicCourses = async () => {
    const combinedMap = new Map<string, { id: string; name: string; courseCode?: string }>();

    // 1. Add courses from reactive store (created by Admin)
    const currentStore = store.getCourses();
    currentStore.forEach((c) => {
      combinedMap.set(String(c.id), {
        id: String(c.id),
        name: c.name,
        courseCode: (c as any).courseCode,
      });
    });

    // 2. Fetch courses from Spring Boot backend API
    try {
      const res = await api.getAllCourses();
      if (res.success && res.data && res.data.length > 0) {
        res.data.forEach((c: any) => {
          const id = String(c.id || c.courseCode);
          combinedMap.set(id, {
            id: id,
            name: c.title || c.name || "Curriculum Track",
            courseCode: c.courseCode,
          });
        });
      }
    } catch (err) {
      console.error("Failed to load courses from API:", err);
    }

    const list = Array.from(combinedMap.values());
    setDynamicCourses(list);
  };

  useEffect(() => {
    loadDynamicCourses();
    loadDynamicLectures();
  }, [storeCourses.length]);

  const filteredLectures = dynamicLectures.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      (l.description && l.description.toLowerCase().includes(search.toLowerCase()))
  );

  const openCreateModal = () => {
    setEditingLecture(null);
    setTitle("");
    const defaultId = dynamicCourses[0]?.id || storeCourses[0]?.id || "";
    setCourseId(defaultId);
    setDescription("");
    setLectureDate(new Date().toISOString().split("T")[0]);
    setStartTime("18:00");
    setEndTime("19:30");
    setLectureUrl("https://meet.nexora.internal/live/session");
    setRecordingUrl("");
    setIsDownloadable(true);
    setStatus("scheduled");
    setModalOpen(true);
  };

  const openEditModal = (lec: Lecture) => {
    setEditingLecture(lec);
    setTitle(lec.title);
    setCourseId(lec.course_id);
    setDescription(lec.description || "");
    setLectureDate(lec.lecture_date || "");
    setStartTime(lec.start_time || "18:00");
    setEndTime(lec.end_time || "19:30");
    setLectureUrl(lec.lecture_url || "");
    setRecordingUrl(lec.recording_url || "");
    setIsDownloadable(lec.is_downloadable);
    setStatus(lec.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!courseId && dynamicCourses.length > 0) {
      setCourseId(dynamicCourses[0].id);
    }

    const activeCourseId = courseId || dynamicCourses[0]?.id || "course-1";

    if (editingLecture) {
      store.updateLecture(editingLecture.id, {
        title,
        course_id: activeCourseId,
        description,
        lecture_date: lectureDate,
        start_time: startTime,
        end_time: endTime,
        lecture_url: lectureUrl,
        recording_url: recordingUrl,
        is_downloadable: isDownloadable,
        status,
      });
    } else {
      store.createLecture({
        title,
        course_id: activeCourseId,
        faculty_id: "fac-rec-1",
        description,
        lecture_date: lectureDate,
        start_time: startTime,
        end_time: endTime,
        lecture_url: lectureUrl,
        recording_url: recordingUrl,
        downloadable_file_path: isDownloadable ? `lectures/handouts/${title.toLowerCase().replace(/\s+/g, "-")}.pdf` : null,
        is_downloadable: isDownloadable,
        status,
        created_by: profile.id,
      });

      // Also send to backend endpoint if running
      try {
        await api.createLecture({
          courseId: activeCourseId,
          facultyId: "fac-rec-1",
          title,
          description,
          lectureDate,
          startTime,
          endTime,
          lectureUrl,
          recordingUrl,
          isDownloadable,
        });
      } catch (e) {
        // Handled silently
      }
    }

    setModalOpen(false);
    loadDynamicLectures();
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title="Lecture Management"
        subtitle="Schedule interactive live streams, attach downloadable course notes, and manage recordings."
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" /> Schedule New Lecture
          </button>
        }
      />

      {/* Search Toolbar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search lectures..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Lectures Table */}
      {filteredLectures.length === 0 ? (
        <EmptyState
          title="No lectures scheduled"
          description="Create your first lecture to deliver live interactive sessions to students."
          action={
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              Schedule Lecture
            </button>
          }
        />
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
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLectures.map((lec) => {
                  const resolvedCourse =
                    dynamicCourses.find((c) => String(c.id) === String(lec.course_id)) ||
                    store.getCourse(lec.course_id);

                  return (
                    <tr key={lec.id} className="hover:bg-accent/40 transition-colors">
                      <td className="px-5 py-4 font-bold text-foreground max-w-xs">
                        <div className="line-clamp-1">{lec.title}</div>
                        <div className="text-[11px] text-muted-foreground font-normal line-clamp-1">
                          {lec.description}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground font-medium">
                        <span className="font-semibold text-foreground">
                          {resolvedCourse?.name || "Curriculum Track"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        <div>{lec.lecture_date ? formatDate(lec.lecture_date) : "TBA"}</div>
                        <div className="text-[11px]">{lec.start_time} - {lec.end_time}</div>
                      </td>
                      <td className="px-5 py-4">
                        {lec.is_downloadable ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Handout Attached
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Disabled</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={lec.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/faculty/lectures/${lec.id}/live`}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all cursor-pointer"
                            title="Start Live Studio Stream"
                          >
                            <Radio className="h-3.5 w-3.5" /> Start Live
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEditModal(lec)}
                            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-primary hover:border-primary transition-colors cursor-pointer"
                            title="Edit Lecture"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => store.deleteLecture(lec.id)}
                            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
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

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setModalOpen(false)} />

          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl z-50 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-foreground">
                {editingLecture ? "Edit Lecture" : "Schedule New Lecture"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Lecture Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Spring Security 6 & OAuth2"
                  required
                  className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Assign to Course
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  {dynamicCourses.length === 0 ? (
                    <option value="" disabled>
                      -- No courses created yet by Admin --
                    </option>
                  ) : (
                    dynamicCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.courseCode ? `(${c.courseCode})` : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Description & Topics Covered
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of code demos and architectural principles..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={lectureDate}
                    onChange={(e) => setLectureDate(e.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-input bg-background px-2.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-input bg-background px-2 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-input bg-background px-2 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Live Stream / Meeting URL
                  </label>
                  <input
                    type="url"
                    value={lectureUrl}
                    onChange={(e) => setLectureUrl(e.target.value)}
                    placeholder="https://meet.nexora.internal/live/..."
                    className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Lecture["status"])}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live Now</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDownloadable"
                  checked={isDownloadable}
                  onChange={(e) => setIsDownloadable(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="isDownloadable" className="font-medium text-foreground cursor-pointer">
                  Enable Downloadable Handout & Source Code for Enrolled Students
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-border bg-background py-2.5 text-xs font-semibold text-muted-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90"
                >
                  {editingLecture ? "Save Changes" : "Publish Lecture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
