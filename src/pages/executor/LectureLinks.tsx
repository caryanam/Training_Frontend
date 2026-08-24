import { useState } from "react";
import { useDataStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Share2,
  Copy,
  CheckCircle2,
  ExternalLink,
  Video,
  Search,
  MessageCircle,
} from "lucide-react";

export default function ExecutorLectureLinks() {
  const store = useDataStore();
  const lectures = store.getLectures();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedMeetId, setCopiedMeetId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredLectures = lectures.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (lecId: string) => {
    const url = `${window.location.origin}/student/lecture/${lecId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(lecId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyMeet = (lecId: string, meetUrl: string) => {
    navigator.clipboard.writeText(meetUrl);
    setCopiedMeetId(lecId);
    setTimeout(() => setCopiedMeetId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shared Google Meet & Lecture Links"
        subtitle="Access live Google Meet classrooms and course demo links shared by faculty to pitch curriculum to prospective students."
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search shared lecture links..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {filteredLectures.length === 0 ? (
        <EmptyState title="No shared links" description="Faculty will share approved links for upcoming sessions here." />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs divide-y divide-border">
          {filteredLectures.map((lec) => {
            const course = store.getCourse(lec.course_id);
            const isCopied = copiedId === lec.id;
            const isMeetCopied = copiedMeetId === lec.id;
            const meetUrl = lec.meeting_link || "https://meet.google.com/eduflow-live-session";

            return (
              <div
                key={lec.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-5 hover:bg-accent/40 gap-4 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-600 shrink-0">
                    <Video className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">{lec.title}</h4>
                      <StatusBadge status={lec.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {course?.name} • Session: {lec.start_time} - {lec.end_time}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 font-mono text-[11px] text-red-600 font-semibold">
                      <span>Google Meet: {meetUrl}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-center">
                  <button
                    type="button"
                    onClick={() => handleCopyMeet(lec.id, meetUrl)}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-xs font-bold text-red-600 hover:bg-red-500/20 transition-colors"
                  >
                    {isMeetCopied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {isMeetCopied ? "Meet Copied!" : "Copy Google Meet Link"}
                  </button>

                  <a
                    href={meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Join Meet
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopy(lec.id)}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {isCopied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {isCopied ? "Link Copied" : "Copy Student Link"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
