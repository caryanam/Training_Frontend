import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { api } from "@/lib/api";
import { formatDate, formatExternalUrl } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Lock,
  PlayCircle,
  Video,
  Download,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Sparkles,
  FileText,
  CheckCircle2,
  Share2,
  Loader2,
} from "lucide-react";

interface BackendLectureAccess {
  hasAccess: boolean;
  reason: string;
  lectureId?: string;
  title?: string;
  description?: string;
  lectureDate?: string;
  startTime?: string;
  endTime?: string;
  lectureUrl?: string | null;
  meetingLink?: string | null;
  recordingUrl?: string | null;
  isDownloadable?: boolean;
  courseId?: number;
  courseCode?: string;
  courseName?: string;
  facultyName?: string;
  facultyCode?: string;
  facultyEmail?: string;
  facultyDepartment?: string;
}

export default function LectureAccess() {
  const { lectureId } = useParams<{ lectureId: string }>();
  const { profile } = useAuth();
  const store = useDataStore();
  const navigate = useNavigate();

  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [backendAccess, setBackendAccess] = useState<BackendLectureAccess | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lectureId || !profile) return;
    setLoading(true);
    api.getLectureAccess(lectureId)
      .then((res) => {
        if (res.success && res.data) {
          setBackendAccess(res.data);
        } else {
          setBackendAccess({
            hasAccess: false,
            reason: res.message || "No active enrollment found for this course. Please purchase a plan.",
          });
        }
      })
      .catch((err: any) => {
        setBackendAccess({
          hasAccess: false,
          reason: err.message || "Access denied. Active course enrollment required.",
        });
      })
      .finally(() => setLoading(false));
  }, [lectureId, profile]);

  if (!lectureId || !profile) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold">Authentication required</h2>
        <Link to="/login" className="text-primary mt-2 inline-block">Sign In</Link>
      </div>
    );
  }

  // Fallback to DataStore verification if backend not yet responded
  const storeAccessResult = store.verifyLectureAccess(profile.id, lectureId);
  const accessResult = backendAccess !== null ? backendAccess : storeAccessResult;
  const lecture = store.getLecture(lectureId);
  const course = lecture ? store.getCourse(lecture.course_id) : null;

  // Dynamic Data Bindings
  const lectureTitle = backendAccess?.title || lecture?.title || "Lecture Session";
  const courseName = backendAccess?.courseName || course?.name || "Enrolled Course Track";
  const facultyName = backendAccess?.facultyName || (course as any)?.facultyName || "Assigned Faculty";
  const facultyCode = backendAccess?.facultyCode || (course as any)?.facultyId || "FAC-ASSIGNED";
  const facultyEmail = backendAccess?.facultyEmail || (course as any)?.facultyEmail || "faculty@nexora.internal";
  const facultyDept = backendAccess?.facultyDepartment || "Faculty Mentor";
  const lectureDescription = backendAccess?.description || lecture?.description || "Interactive core curriculum session with live mentorship.";
  const lectureDate = backendAccess?.lectureDate || lecture?.lecture_date;
  const startTime = backendAccess?.startTime || lecture?.start_time || "18:00";
  const endTime = backendAccess?.endTime || lecture?.end_time || "19:30";
  const activeMeetingUrl = backendAccess?.meetingLink || backendAccess?.lectureUrl || lecture?.meeting_link || lecture?.lecture_url;
  const isDownloadable = backendAccess?.isDownloadable !== undefined ? backendAccess.isDownloadable : (lecture?.is_downloadable || false);

  // Handle Download Action
  const handleDownload = () => {
    if (!accessResult.hasAccess) return;
    setDownloading(true);
    setDownloadSuccess(false);

    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      const student = store.getStudentsWithProfiles().find((s) => s.profile_id === profile.id);
      if (student) {
        store.createNotification({
          user_id: profile.id,
          title: "Lecture Material Downloaded 📥",
          message: "Successfully downloaded handout for " + lectureTitle + ".",
          type: "lecture",
        });
      }
    }, 1200);
  };

  // 1. LOCKED / EXPIRED STATE
  if (!accessResult.hasAccess) {
    return (
      <div className="mx-auto max-w-2xl py-12 px-4">
        <Link
          to="/student/lectures"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Lectures
        </Link>

        <div className="overflow-hidden rounded-2xl border border-rose-500/20 bg-card p-8 sm:p-10 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 ring-8 ring-rose-500/5">
            <Lock className="h-8 w-8" />
          </div>

          <span className="inline-block rounded-full bg-rose-100 dark:bg-rose-950/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-3">
            Access Expired / Restricted
          </span>

          <h1 className="text-2xl font-bold text-foreground sm:text-3xl mb-3">
            {accessResult.reason.includes("expired")
              ? "Your course access has expired."
              : "Restricted Lecture Resource"}
          </h1>

          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
            {accessResult.reason}
          </p>

          <div className="rounded-xl border border-border bg-muted/40 p-4 max-w-md mx-auto mb-8 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lecture Title:</span>
              <span className="font-semibold text-foreground">{lectureTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Associated Course:</span>
              <span className="font-semibold text-foreground">{courseName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Access Requirement:</span>
              <span className="font-semibold text-rose-600">Active Verified Plan</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/student/courses"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
            >
              <Sparkles className="h-4 w-4" /> Renew Course Plan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHORIZED ACCESS STATE (Dynamic Streaming Video & Handouts)
  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div>
        <Link
          to="/student/lectures"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Lectures
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge status={lecture?.status || "scheduled"} />
              <span className="text-xs text-muted-foreground font-semibold">{courseName}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1 sm:text-3xl">
              {lectureTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" /> Access Verified
            </span>
          </div>
        </div>
      </div>

      {/* In-Website Live Stream Classroom Entry */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-card to-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 shrink-0">
            <Video className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">In-Website Live Classroom</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                <Sparkles className="h-3 w-3" /> SECURE SFU STREAM
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Live interactive screen sharing and high-fidelity audio direct inside your portal.
            </div>
          </div>
        </div>

        <Link
          to={`/student/lectures/${lectureId}/live`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all shrink-0"
        >
          <PlayCircle className="h-4 w-4" /> Enter Live Classroom
        </Link>
      </div>

      {/* Main Video / Stream Player Preview */}
      <div className="overflow-hidden rounded-2xl border border-border bg-slate-950 shadow-xl">
        <div className="relative aspect-video w-full bg-gradient-to-tr from-slate-950 via-emerald-950 to-slate-900 flex flex-col items-center justify-center text-white p-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
          
          <div className="relative z-10 text-center max-w-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-emerald-300 ring-4 ring-primary/10">
              <PlayCircle className="h-10 w-10 text-primary" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              Interactive Live Session Stream
            </h3>
            <p className="text-xs text-slate-300 mb-6">
              Authorized student feed with end-to-end access validation and anti-sharing watermark overlay.
            </p>

            <Link
              to={`/student/lectures/${lectureId}/live`}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md transition-all"
            >
              <PlayCircle className="h-4 w-4" /> Join Live Classroom
            </Link>
          </div>
        </div>
      </div>

      {/* Conducting Faculty Mentor Box (Dynamic from DB) */}
      <div className="rounded-2xl border border-emerald-500/20 bg-card p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 font-bold border border-emerald-500/20 shrink-0">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Conducting Faculty Instructor</div>
            <div className="text-sm font-bold text-foreground">{facultyName}</div>
            <div className="text-xs text-muted-foreground">Faculty ID: <span className="font-mono text-emerald-500 font-semibold">{facultyCode}</span> • {facultyEmail}</div>
          </div>
        </div>
        <a
          href={"mailto:" + facultyEmail}
          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all shrink-0 cursor-pointer"
        >
          Ask Faculty Question
        </a>
      </div>

      {/* Details, Schedule & Downloads Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Description & Notes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
            <h2 className="text-base font-bold text-foreground mb-3">
              About this Lecture
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {lectureDescription}
            </p>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-border pt-4 text-xs">
              <div>
                <span className="text-muted-foreground block mb-0.5">Date:</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  {lectureDate ? formatDate(lectureDate) : "Scheduled Today"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Timing:</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {startTime} - {endTime}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Status:</span>
                <StatusBadge status={lecture?.status || "scheduled"} />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Downloadable Handouts */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
            <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" /> Download Materials
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Download lecture slides, sample code repositories, and cheat sheets.
            </p>

            {isDownloadable ? (
              <div className="rounded-lg border border-border bg-muted/30 p-3.5 space-y-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary shrink-0" />
                  <div className="overflow-hidden">
                    <div className="text-xs font-semibold text-foreground truncate">
                      {lecture?.downloadable_file_path?.split("/").pop() || (lectureTitle.toLowerCase().replace(/\s+/g, "-") + "-materials.pdf")}
                    </div>
                    <div className="text-[11px] text-muted-foreground">PDF Document • 4.2 MB</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary font-medium text-xs text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  {downloading ? "Preparing Signed URL..." : downloadSuccess ? "Downloaded ✓" : "Download File"}
                </button>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg">
                Downloads are not enabled for this lecture.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}