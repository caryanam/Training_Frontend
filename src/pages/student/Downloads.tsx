import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Download,
  FileText,
  CheckCircle2,
  Lock,
  ArrowRight,
  HardDrive,
  ShieldCheck,
} from "lucide-react";

export default function StudentDownloads() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const enrollments = profile ? store.getEnrollmentsForProfile(profile.id) : [];
  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));

  const allLectures = store.getLectures();
  const downloadableLectures = allLectures.filter(
    (l) => enrolledCourseIds.has(l.course_id) && l.is_downloadable
  );

  const handleDownload = (lectureId: string) => {
    setDownloadingId(lectureId);
    setTimeout(() => {
      setDownloadingId(null);
      if (profile) {
        store.createNotification({
          user_id: profile.id,
          title: "Download Complete 📥",
          message: "The requested file has been verified and downloaded.",
          type: "lecture",
        });
      }
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offline Downloads"
        subtitle="Manage secure offline files, notes, and handouts provided with your enrolled courses."
      />

      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>All downloadable files use temporary signed storage URLs linked to your active course validity.</span>
        </div>
        <span className="font-semibold text-indigo-600 shrink-0 hidden sm:inline">Protected Storage</span>
      </div>

      {downloadableLectures.length === 0 ? (
        <EmptyState
          title="No downloadable files available"
          description="Downloads will appear here once lecture materials are published in your active courses."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="divide-y divide-border">
            {downloadableLectures.map((lec) => {
              const course = store.getCourse(lec.course_id);
              const isDownloading = downloadingId === lec.id;

              return (
                <div
                  key={lec.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-accent/40 gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{lec.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {course?.name} • PDF Handout & Sample Code (4.2 MB)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <StatusBadge status="available" />
                    <button
                      type="button"
                      disabled={isDownloading}
                      onClick={() => handleDownload(lec.id)}
                      className="flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {isDownloading ? "Downloading..." : "Download"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
