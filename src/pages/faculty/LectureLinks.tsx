import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { api } from "@/lib/api";
import { formatDate, formatExternalUrl } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Share2,
  Copy,
  CheckCircle2,
  Users,
  Send,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Video,
  MessageCircle,
  Mail,
  Calendar,
  Clock,
  Radio,
  PlusCircle,
} from "lucide-react";

export default function FacultyLectureLinks() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [courseList, setCourseList] = useState<Array<{ id: string; name: string }>>([]);
  const [lectures, setLectures] = useState(store.getLectures());
  const [selectedLectureId, setSelectedLectureId] = useState(lectures[0]?.id || "new");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [customTitle, setCustomTitle] = useState("Live Interactive Session & Q&A");
  const [targetAudience, setTargetAudience] = useState<"both" | "student" | "executor">("both");
  const [meetUrl, setMeetUrl] = useState("https://meet.google.com/nexora-live-session");
  const [instructions, setInstructions] = useState(
    "Please join 5 minutes before scheduled start time. Keep your microphones muted and cameras ready for the live Q&A."
  );
  const [copied, setCopied] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);

  const selectedLecture = lectures.find((l) => l.id === selectedLectureId);
  const activeTargetCourseId = selectedLectureId === "new" ? selectedCourseId : selectedLecture?.course_id || selectedCourseId;

  const loadEnrolledStudents = async (courseId: string) => {
    try {
      const res = await api.getLeads("all");
      const storeStudents = store.getStudentsWithProfiles();
      const enrollments = store.getEnrollments();

      const list: any[] = [];

      if (res.success && res.data) {
        res.data.forEach((lead: any) => {
          list.push({
            id: lead.leadId || lead.studentId,
            name: lead.fullName || lead.full_name || "Student",
            email: lead.email,
            phone: lead.phone,
            status: lead.status || "ENROLLED",
            course: lead.interestedCourse || "Curriculum Track",
          });
        });
      }

      storeStudents.forEach((stu) => {
        if (!list.some((item) => item.email?.toLowerCase() === stu.profile?.email?.toLowerCase())) {
          const enrollment = enrollments.find((e) => e.student_id === stu.id);
          const course = enrollment ? store.getCourse(enrollment.course_id) : null;
          list.push({
            id: stu.id,
            name: stu.profile?.full_name || "Student",
            email: stu.profile?.email || "",
            phone: stu.profile?.phone || "",
            status: enrollment?.status || "ACTIVE",
            course: course?.name || "Enrolled Course",
          });
        }
      });

      setEnrolledStudents(list);
    } catch {
      setEnrolledStudents([]);
    }
  };

  useEffect(() => {
    const loadCourses = async () => {
      const combinedMap = new Map<string, { id: string; name: string }>();
      const storeCourses = store.getCourses();
      storeCourses.forEach((c) => {
        combinedMap.set(String(c.id), { id: String(c.id), name: c.name });
      });

      try {
        const res = await api.getAllCourses();
        if (res.success && res.data && res.data.length > 0) {
          res.data.forEach((c: any) => {
            const id = String(c.id || c.courseCode);
            combinedMap.set(id, {
              id: id,
              name: c.title || c.name,
            });
          });
        }
      } catch (e) {
        // Handled silently
      }

      const mapped = Array.from(combinedMap.values());
      setCourseList(mapped);
      if (mapped.length > 0) {
        setSelectedCourseId(mapped[0].id);
        loadEnrolledStudents(mapped[0].id);
      }
    };

    loadCourses();

    const list = store.getLectures();
    setLectures(list);
    if (list.length > 0 && (!selectedLectureId || selectedLectureId === "new")) {
      setSelectedLectureId(list[0].id);
    }
  }, []);

  useEffect(() => {
    if (activeTargetCourseId) {
      loadEnrolledStudents(activeTargetCourseId);
    }
  }, [activeTargetCourseId]);

  const activeCourseName = selectedLecture
    ? store.getCourse(selectedLecture.course_id)?.name || "Course"
    : courseList.find((c) => c.id === selectedCourseId)?.name || "Course";

  const handleGenerateMeet = () => {
    window.open("https://meet.google.com/new", "_blank", "noopener,noreferrer");
    setMeetUrl("https://meet.google.com/new");
  };

  const handleCopyMeet = () => {
    navigator.clipboard.writeText(meetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    let targetLecture = selectedLecture;

    if (!targetLecture || selectedLectureId === "new") {
      // Create new live lecture on the fly
      targetLecture = store.createLecture({
        course_id: selectedCourseId || courseList[0]?.id || "101",
        faculty_id: profile.id,
        created_by: profile.id,
        title: customTitle.trim() || "Live Interactive Session & Q&A",
        description: instructions,
        lecture_date: new Date().toISOString().split("T")[0],
        start_time: "18:00",
        end_time: "19:30",
        meeting_link: meetUrl,
        lecture_url: meetUrl,
        recording_url: null,
        downloadable_file_path: null,
        is_downloadable: true,
        status: "live",
      });
      setSelectedLectureId(targetLecture.id);
      setLectures(store.getLectures());
    } else {
      store.updateLecture(targetLecture.id, {
        meeting_link: meetUrl,
        lecture_url: meetUrl,
        status: "live",
      });
    }

    // Call API to sync backend lecture
    try {
      await api.createLecture({
        courseId: targetLecture.course_id,
        facultyId: profile.id,
        title: targetLecture.title,
        description: instructions,
        lectureDate: new Date().toISOString().split("T")[0],
        startTime: "18:00",
        endTime: "19:30",
        lectureUrl: meetUrl,
        isDownloadable: true,
      });
    } catch {
      // Handled gracefully
    }

    // Broadcast notifications to all students
    store.createNotification({
      user_id: "all",
      title: `🔴 Live Google Meet Classroom: ${targetLecture.title}`,
      message: `Faculty released the live session link for '${activeCourseName}'. Meet Link: ${meetUrl}. ${instructions}`,
      type: "lecture",
      metadata: { lectureId: targetLecture.id, meetUrl },
    });

    if (targetAudience === "student" || targetAudience === "both") {
      enrolledStudents.forEach((stu) => {
        if (stu.id) {
          store.createNotification({
            user_id: stu.id,
            title: `🔴 Live Google Meet Classroom: ${targetLecture!.title}`,
            message: `Faculty released the live session link for '${activeCourseName}'. Meet Link: ${meetUrl}. ${instructions}`,
            type: "lecture",
            metadata: { lectureId: targetLecture!.id, meetUrl },
          });
        }
      });
    }

    // Broadcast notifications to executors
    if (targetAudience === "executor" || targetAudience === "both") {
      store.getExecutorsWithProfiles().forEach((exe) => {
        store.createNotification({
          user_id: exe.profile_id,
          title: `📹 Live Google Meet Shared for Admissions: ${targetLecture!.title}`,
          message: `${profile.full_name || "Faculty"} shared Google Meet link (${meetUrl}) for '${targetLecture!.title}'.`,
          type: "lecture",
          metadata: { lectureId: targetLecture!.id, meetUrl },
        });
      });
    }

    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  return (
    <div className="space-y-6 text-xs">
      <PageHeader
        title="Google Meet Link Distribution Hub"
        subtitle="Broadcast live Google Meet classrooms to Enrolled Students and Admissions Executors with real-time notifications."
      />

      {broadcastSent && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>
              Google Meet link successfully broadcasted to{" "}
              {targetAudience === "both"
                ? "Enrolled Students & Admissions Executors"
                : targetAudience === "student"
                ? "Enrolled Students"
                : "Admissions Executors"}
              ! High-priority in-app alerts dispatched.
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Google Meet Broadcast Form */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Video className="h-5 w-5 text-red-500" /> Send Google Meet Link to Students & Executors
            </h3>
            <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-md border border-red-200 dark:border-red-800">
              <Radio className="h-3 w-3 animate-pulse" /> Live Room
            </span>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-5 text-xs">
            {/* Lecture Selection */}
            <div>
              <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                1. Select Lecture Session or Create New
              </label>
              <select
                value={selectedLectureId}
                onChange={(e) => setSelectedLectureId(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                <option value="new">➕ Create New Live Session Link</option>
                {lectures.map((lec) => (
                  <option key={lec.id} value={lec.id}>
                    {lec.title} ({store.getCourse(lec.course_id)?.name || "Course"}) — {lec.start_time || "Live"}
                  </option>
                ))}
              </select>
            </div>

            {selectedLectureId === "new" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-muted/30 rounded-xl border border-border">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Select Target Course *
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  >
                    {courseList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Session Title *
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Session title e.g. Live Q&A and Project Review"
                    required
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
            )}

            {/* Target Audience Selector */}
            <div>
              <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                2. Select Target Audience
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetAudience("both")}
                  className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                    targetAudience === "both"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary" /> Students & Executors
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Simultaneous broadcast to all students & counselor team
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetAudience("student")}
                  className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                    targetAudience === "student"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-emerald-600" /> Students Only
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Enrolled candidates with active course validity
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetAudience("executor")}
                  className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                    targetAudience === "executor"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-amber-600" /> Executors Only
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Admissions staff to share links with prospective leads
                  </div>
                </button>
              </div>
            </div>

            {/* Google Meet Link Input & Generator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground">
                  3. Google Meet Link
                </label>
                <button
                  type="button"
                  onClick={handleGenerateMeet}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Create Real Room on Google Meet (meet.google.com/new)
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={meetUrl}
                  onChange={(e) => setMeetUrl(e.target.value)}
                  placeholder="https://meet.google.com/xxx-yyyy-zzz"
                  required
                  className="h-10 flex-1 rounded-xl border border-input bg-background px-3.5 text-xs font-mono text-foreground select-all ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  onClick={handleCopyMeet}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors shrink-0 cursor-pointer"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy Meet Link"}
                </button>
                <a
                  href={formatExternalUrl(meetUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/30 px-3.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors shrink-0 cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" /> Open Meet
                </a>
              </div>
            </div>

            {/* Joining Instructions & Agenda */}
            <div>
              <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                4. Instructions for Participants
              </label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Notes, prerequisites, or joining guidance..."
                className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Submit / Broadcast CTA */}
            <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-muted-foreground">
                Clicking broadcast dispatches instantaneous in-app alerts to all selected users.
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-700 transition-all cursor-pointer"
              >
                <Send className="h-4 w-4" /> Broadcast Google Meet Link
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Quick Sharing & Participant Shortcuts */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Share Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 text-xs">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" /> External Share Shortcuts
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              Quickly distribute this Google Meet invitation to external communication channels:
            </p>

            <div className="space-y-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Join live class for ${selectedLecture?.title || customTitle}: ${meetUrl}\n\n${instructions}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" /> Share via WhatsApp
              </a>

              <a
                href={`mailto:?subject=${encodeURIComponent(
                  `Live Class: ${selectedLecture?.title || customTitle}`
                )}&body=${encodeURIComponent(
                  `Hello,\n\nPlease join the live class using the Google Meet link below:\n${meetUrl}\n\n${instructions}`
                )}`}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-foreground font-semibold hover:bg-accent transition-all cursor-pointer"
              >
                <Mail className="h-4 w-4" /> Share via Email
              </a>
            </div>
          </div>

          {/* Security & Access Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs text-xs space-y-3">
            <h4 className="font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Access Security Rule
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              When students access the class inside the platform, their calendar subscription status (active days remaining) is verified before the Google Meet room button is enabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
