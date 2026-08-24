import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
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
} from "lucide-react";

export default function LectureAccess() {
  const { lectureId } = useParams<{ lectureId: string }>();
  const { profile } = useAuth();
  const store = useDataStore();
  const navigate = useNavigate();

  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!lectureId || !profile) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold">Authentication required</h2>
        <Link to="/login" className="text-primary mt-2 inline-block">Sign In</Link>
      </div>
    );
  }

  // Execute 8-Step Backend Validation Rule via DataStore
  const accessResult = store.verifyLectureAccess(profile.id, lectureId);
  const lecture = accessResult.lecture || store.getLecture(lectureId);
  const course = lecture ? store.getCourse(lecture.course_id) : null;

  // Handle Download Action (Requirement 11: private storage simulation + download logging)
  const handleDownload = () => {
    if (!lecture || !accessResult.hasAccess) return;
    setDownloading(true);
    setDownloadSuccess(false);

    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      // Log download to database
      const student = store.getStudentsWithProfiles().find((s) => s.profile_id === profile.id);
      if (student) {
        store.createNotification({
          user_id: profile.id,
          title: "Lecture Material Downloaded 📥",
          message: `Successfully downloaded handout for '${lecture.title}'.`,
          type: "lecture",
        });
      }
    }, 1200);
  };

  // 1. LOCKED / EXPIRED STATE (Business Rules 12 & 13)
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
              <span className="font-semibold text-foreground">{lecture?.title || "Lecture"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Associated Course:</span>
              <span className="font-semibold text-foreground">{course?.name || "Course"}</span>
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
            <Link
              to="/student/support"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-border bg-background px-6 py-3 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHORIZED ACCESS STATE (Streaming Video & Handouts)
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
              <span className="text-xs text-muted-foreground">{course?.name}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1 sm:text-3xl">
              {lecture?.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" /> Access Verified
            </span>
          </div>
        </div>
      </div>

      {/* Live Google Meet Classroom Banner */}
      {(lecture?.meeting_link || lecture?.lecture_url) && (
        <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-500/10 via-card to-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white shadow-md shadow-red-600/20 shrink-0">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">Live Google Meet Classroom</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded-full animate-pulse">
                  ACTIVE MEET LINK
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 font-mono truncate max-w-md">
                {lecture?.meeting_link || lecture?.lecture_url}
              </div>
            </div>
          </div>

          <a
            href={lecture?.meeting_link || lecture?.lecture_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-700 transition-all shrink-0"
          >
            <ExternalLink className="h-4 w-4" /> Join Google Meet
          </a>
        </div>
      )}

      {/* Main Video / Stream Player */}
      <div className="overflow-hidden rounded-2xl border border-border bg-slate-950 shadow-xl">
        <div className="relative aspect-video w-full bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 flex flex-col items-center justify-center text-white p-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
          
          <div className="relative z-10 text-center max-w-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-indigo-300 ring-4 ring-primary/10">
              <PlayCircle className="h-10 w-10 text-primary" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              {lecture?.status === "live"
                ? "Live Interactive Stream in Progress"
                : "Lecture Recording Ready to Stream"}
            </h3>
            <p className="text-xs text-slate-300 mb-6">
              Authorized student feed with end-to-end access validation.
            </p>

            {lecture?.lecture_url && (
              <a
                href={lecture.lecture_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md transition-all"
              >
                <ExternalLink className="h-4 w-4" /> Open Meeting Room
              </a>
            )}
          </div>
        </div>
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
              {lecture?.description ||
                "In this comprehensive session, we cover end-to-end architectures, hands-on production code samples, dependency injection patterns, and enterprise testing."}
            </p>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-border pt-4 text-xs">
              <div>
                <span className="text-muted-foreground block mb-0.5">Date:</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  {lecture?.lecture_date ? formatDate(lecture.lecture_date) : "TBA"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-0.5">Timing:</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {lecture?.start_time} - {lecture?.end_time}
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

            {lecture?.is_downloadable ? (
              <div className="rounded-lg border border-border bg-muted/30 p-3.5 space-y-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary shrink-0" />
                  <div className="overflow-hidden">
                    <div className="text-xs font-semibold text-foreground truncate">
                      {lecture.downloadable_file_path?.split("/").pop() || "lecture-notes.pdf"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">PDF Document • 4.2 MB</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary font-medium text-xs text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
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
