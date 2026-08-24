import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
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
} from "lucide-react";

export default function FacultyLectureLinks() {
  const { profile } = useAuth();
  const store = useDataStore();

  const lectures = store.getLectures();
  const [selectedLectureId, setSelectedLectureId] = useState(lectures[0]?.id || "");
  const [targetAudience, setTargetAudience] = useState<"both" | "student" | "executor">("both");
  const [meetUrl, setMeetUrl] = useState("https://meet.google.com/eduflow-live-session");
  const [instructions, setInstructions] = useState(
    "Please join 5 minutes before scheduled start time. Keep your microphones muted and cameras ready for the live Q&A."
  );
  const [copied, setCopied] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  const selectedLecture = lectures.find((l) => l.id === selectedLectureId) || lectures[0];
  const course = selectedLecture ? store.getCourse(selectedLecture.course_id) : null;

  const handleGenerateMeet = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    const segment = (len: number) =>
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const randomMeet = `https://meet.google.com/${segment(3)}-${segment(4)}-${segment(3)}`;
    setMeetUrl(randomMeet);
  };

  const handleCopyMeet = () => {
    navigator.clipboard.writeText(meetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLecture || !profile) return;

    // Update meeting link on the lecture in store
    store.updateLecture(selectedLecture.id, {
      meeting_link: meetUrl,
    });

    // Broadcast notifications
    if (targetAudience === "student" || targetAudience === "both") {
      store.getStudentsWithProfiles().forEach((stu) => {
        store.createNotification({
          user_id: stu.profile_id,
          title: `🔴 Google Meet Link Released: ${selectedLecture.title}`,
          message: `Live class link for '${course?.name || "Course"}' is ready. Meet Link: ${meetUrl}. ${instructions}`,
          type: "lecture",
          metadata: { lectureId: selectedLecture.id, meetUrl },
        });
      });
    }

    if (targetAudience === "executor" || targetAudience === "both") {
      store.getExecutorsWithProfiles().forEach((exe) => {
        store.createNotification({
          user_id: exe.profile_id,
          title: `📹 Live Google Meet Shared for Admissions: ${selectedLecture.title}`,
          message: `Dr. Ananya shared Google Meet link (${meetUrl}) for '${selectedLecture.title}'. You may share this with prospective leads or join as observer.`,
          type: "lecture",
          metadata: { lectureId: selectedLecture.id, meetUrl },
        });
      });
    }

    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  return (
    <div className="space-y-6">
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
                1. Select Lecture Session
              </label>
              <select
                value={selectedLectureId}
                onChange={(e) => setSelectedLectureId(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {lectures.map((lec) => (
                  <option key={lec.id} value={lec.id}>
                    {lec.title} ({store.getCourse(lec.course_id)?.name || "Course"}) — {lec.start_time} to {lec.end_time}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Audience Selector */}
            <div>
              <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                2. Select Target Audience
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetAudience("both")}
                  className={`rounded-xl border p-3.5 text-left transition-all ${
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
                  className={`rounded-xl border p-3.5 text-left transition-all ${
                    targetAudience === "student"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-blue-600" /> Students Only
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Enrolled candidates with active course validity
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetAudience("executor")}
                  className={`rounded-xl border p-3.5 text-left transition-all ${
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
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Generate New Google Meet Room
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
                  className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors shrink-0"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy Meet Link"}
                </button>
                <a
                  href={meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/30 px-3.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors shrink-0"
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-700 transition-all"
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
                  `Join live class for ${selectedLecture?.title}: ${meetUrl}\n\n${instructions}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all"
              >
                <MessageCircle className="h-4 w-4" /> Share via WhatsApp
              </a>

              <a
                href={`mailto:?subject=${encodeURIComponent(
                  `Live Class: ${selectedLecture?.title}`
                )}&body=${encodeURIComponent(
                  `Hello,\n\nPlease join the live class using the Google Meet link below:\n${meetUrl}\n\n${instructions}`
                )}`}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-foreground font-semibold hover:bg-accent transition-all"
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
