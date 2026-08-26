import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDate } from "@/lib/utils";
import { ScheduleDemoModal } from "@/components/modals/ScheduleDemoModal";
import {
  Video,
  Calendar,
  Clock,
  Plus,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Loader2,
  X,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

const STATUS_FILTERS = [
  { key: "ALL", label: "All Sessions" },
  { key: "SCHEDULED", label: "Scheduled" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
  { key: "NO_SHOW", label: "No Show" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default function AdminDemoSessions() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [groupDemos, setGroupDemos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [existingDemoToEdit, setExistingDemoToEdit] = useState<any | null>(null);

  // Participants View Modal
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [participantSearch, setParticipantSearch] = useState("");

  const fetchDemos = async () => {
    setLoading(true);
    try {
      const res = await api.getAllGroupDemosAdmin();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setGroupDemos(res.data);
      } else {
        // Fallback to central reactive store
        const storeDemos = store.getDemoSessions().map((d) => {
          const course = store.getCourse(d.course_id || "");
          const lead = store.getLeadById(d.lead_id);
          const leadProfile = lead
            ? store.getStudentLeadsWithProfiles().find((l) => l.id === lead.id)?.profile
            : null;
          const executor = store.getExecutorsWithProfiles().find((e) => e.id === d.executor_id);

          return {
            id: d.id,
            sessionId: d.id,
            demoCode: `demo-${d.id}`,
            courseName: course?.name || "Full Stack Web Development",
            executorName: executor?.profile?.full_name || "Assigned Executor",
            executorEmail: executor?.profile?.email || "executor@eduflow.com",
            demoDate: d.demo_date,
            startTime: d.demo_time || "11:00",
            endTime: "12:00",
            meetLink: d.meeting_link || "https://meet.google.com/eduflow-demo",
            status: (d.status || "SCHEDULED").toUpperCase(),
            totalParticipants: 1,
            notes: d.notes || "",
            participants: [
              {
                participantId: `part-${d.id}`,
                leadId: d.lead_id,
                studentId: d.student_id,
                studentName: leadProfile?.full_name || "Enrolled Student",
                studentEmail: leadProfile?.email || "student@eduflow.com",
                studentPhone: leadProfile?.phone || "+91 98765 43210",
                attendanceStatus: "REGISTERED",
              },
            ],
          };
        });
        setGroupDemos(storeDemos);
      }
    } catch (e) {
      console.error("Failed to load admin demo sessions:", e);
      const storeDemos = store.getDemoSessions().map((d) => ({
        id: d.id,
        sessionId: d.id,
        demoCode: `demo-${d.id}`,
        courseName: store.getCourse(d.course_id || "")?.name || "Full Stack Web Development",
        executorName: "Assigned Executor",
        demoDate: d.demo_date,
        startTime: d.demo_time || "11:00",
        endTime: "12:00",
        meetLink: d.meeting_link || "https://meet.google.com/eduflow-demo",
        status: (d.status || "SCHEDULED").toUpperCase(),
        totalParticipants: 1,
        notes: d.notes || "",
      }));
      setGroupDemos(storeDemos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemos();
  }, [profile]);

  const handleUpdateStatus = async (sessionId: string, newStatus: string) => {
    try {
      await api.updateGroupDemoStatus(sessionId, newStatus);
      store.updateDemoSession(sessionId, { status: newStatus.toLowerCase() as any });
      setGroupDemos((prev) =>
        prev.map((d) =>
          d.id === sessionId || d.sessionId === sessionId
            ? { ...d, status: newStatus.toUpperCase() }
            : d
        )
      );
    } catch (e) {
      store.updateDemoSession(sessionId, { status: newStatus.toLowerCase() as any });
      setGroupDemos((prev) =>
        prev.map((d) =>
          d.id === sessionId || d.sessionId === sessionId
            ? { ...d, status: newStatus.toUpperCase() }
            : d
        )
      );
    }
  };

  const handleCancelDemo = async (sessionId: string) => {
    if (!confirm("Are you sure you want to cancel this entire demo session?")) return;
    try {
      await api.cancelGroupDemo(sessionId);
      store.updateDemoSession(sessionId, { status: "cancelled" });
      fetchDemos();
    } catch (err: any) {
      store.updateDemoSession(sessionId, { status: "cancelled" });
      fetchDemos();
    }
  };

  const filteredDemos = groupDemos.filter((demo) => {
    const matchesFilter =
      activeFilter === "ALL" || (demo.status || "SCHEDULED").toUpperCase() === activeFilter;
    const matchesSearch =
      !searchQuery ||
      demo.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      demo.demoCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      demo.executorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      demo.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalDemos = groupDemos.length;
  const completedDemos = groupDemos.filter(
    (d) => (d.status || "").toUpperCase() === "COMPLETED"
  ).length;
  const scheduledDemos = groupDemos.filter(
    (d) => (d.status || "").toUpperCase() === "SCHEDULED"
  ).length;
  const cancelledDemos = groupDemos.filter(
    (d) => (d.status || "").toUpperCase() === "CANCELLED"
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demo Sessions Management"
        subtitle="Real-time visibility and status tracking for all scheduled student demo sessions"
        actions={
          <button
            onClick={() => {
              setExistingDemoToEdit(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md transition-all"
          >
            <Plus className="h-4 w-4" /> Schedule Demo
          </button>
        }
      />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Demos</span>
            <Video className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-white">{totalDemos}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Scheduled</span>
            <Calendar className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-blue-400">{scheduledDemos}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-400">{completedDemos}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cancelled / No-Show</span>
            <XCircle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-rose-400">{cancelledDemos}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {STATUS_FILTERS.map((tab) => {
            const active = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                  active
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by course, code, or executor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Demos Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : filteredDemos.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400">
          <Video className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Demo Sessions Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery || activeFilter !== "ALL"
              ? "No demo sessions match the selected filter or search keyword."
              : "No demo sessions have been scheduled yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDemos.map((demo) => {
            const currentStatus = (demo.status || "SCHEDULED").toUpperCase();
            const isCancelled = currentStatus === "CANCELLED";
            const isCompleted = currentStatus === "COMPLETED";
            const participantCount =
              demo.totalParticipants || (demo.participants ? demo.participants.length : 0);
            const sessionId = demo.id || demo.sessionId;

            return (
              <div
                key={sessionId || demo.demoCode}
                className={`rounded-2xl border bg-slate-900 p-6 shadow-xl space-y-4 transition-all ${
                  isCancelled
                    ? "border-red-500/20 opacity-75"
                    : isCompleted
                    ? "border-emerald-500/30"
                    : "border-indigo-500/20 hover:border-indigo-500/40"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-0.5 text-[11px] font-bold text-indigo-300 mb-2">
                      <ShieldCheck className="h-3.5 w-3.5" /> Admin Oversee
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      {demo.courseName || "Full Stack Web Development"}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Code: {demo.demoCode || `demo-${sessionId}`} • Executor:{" "}
                      <strong className="text-slate-200">{demo.executorName || "Assigned Executor"}</strong>
                    </p>
                  </div>

                  {/* Status Dropdown (Admin can override) */}
                  <div className="flex flex-col items-end gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Live Status</label>
                    <select
                      value={currentStatus}
                      onChange={(e) => handleUpdateStatus(sessionId, e.target.value)}
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase border cursor-pointer focus:outline-none transition-all ${
                        isCancelled
                          ? "bg-red-500/20 border-red-500/40 text-red-300"
                          : isCompleted
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : currentStatus === "IN_PROGRESS"
                          ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                          : currentStatus === "NO_SHOW"
                          ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                          : currentStatus === "RESCHEDULED"
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                          : "bg-blue-500/20 border-blue-500/40 text-blue-300"
                      }`}
                    >
                      <option value="SCHEDULED" className="bg-slate-900 text-blue-300">SCHEDULED</option>
                      <option value="IN_PROGRESS" className="bg-slate-900 text-purple-300">IN PROGRESS</option>
                      <option value="COMPLETED" className="bg-slate-900 text-emerald-300">COMPLETED</option>
                      <option value="NO_SHOW" className="bg-slate-900 text-rose-300">NO SHOW</option>
                      <option value="RESCHEDULED" className="bg-slate-900 text-amber-300">RESCHEDULED</option>
                      <option value="CANCELLED" className="bg-slate-900 text-red-300">CANCELLED</option>
                    </select>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Date: <strong className="text-white">{formatDate(demo.demoDate)}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Time: <strong className="text-white">{demo.startTime} - {demo.endTime || "12:00"}</strong></span>
                  </div>

                  <div className="col-span-2 flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Participants: <strong className="text-emerald-400">{participantCount} student(s)</strong></span>
                    </div>

                    <button
                      onClick={() => {
                        setActiveSession(demo);
                        setParticipantsModalOpen(true);
                      }}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
                    >
                      View Students →
                    </button>
                  </div>
                </div>

                {demo.notes && (
                  <p className="text-xs text-slate-400 italic bg-white/5 p-2.5 rounded-lg border border-white/5">
                    "{demo.notes}"
                  </p>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setActiveSession(demo);
                      setParticipantsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                  >
                    <Users className="h-3.5 w-3.5 text-indigo-400" /> View Students ({participantCount})
                  </button>

                  <div className="flex items-center gap-2">
                    {demo.meetLink && (
                      <a
                        href={demo.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-emerald-400 transition-all shadow-md"
                      >
                        <Video className="h-3.5 w-3.5" /> Join Meet
                      </a>
                    )}

                    {!isCancelled && (
                      <>
                        <button
                          onClick={() => {
                            setExistingDemoToEdit(demo);
                            setModalOpen(true);
                          }}
                          className="rounded-xl border border-slate-700 p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                          title="Edit Demo"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCancelDemo(sessionId)}
                          className="rounded-xl border border-red-500/30 p-2 text-red-400 hover:bg-red-500/10"
                          title="Cancel Demo"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <ScheduleDemoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        existingDemo={existingDemoToEdit}
        onSuccess={fetchDemos}
      />

      {/* Participants View Modal */}
      {participantsModalOpen && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-indigo-500/20 bg-slate-900 shadow-2xl text-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Registered Demo Students</h3>
                  <p className="text-xs text-slate-400">
                    {activeSession.courseName} • {formatDate(activeSession.demoDate)} ({activeSession.startTime})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setParticipantsModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                {!activeSession.participants || activeSession.participants.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    No students currently added to this demo session.
                  </div>
                ) : (
                  activeSession.participants
                    .filter((p: any) =>
                      p.studentName?.toLowerCase().includes(participantSearch.toLowerCase()) ||
                      p.studentEmail?.toLowerCase().includes(participantSearch.toLowerCase()) ||
                      p.studentPhone?.includes(participantSearch)
                    )
                    .map((p: any) => (
                      <div
                        key={p.participantId || p.leadId || p.studentId}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/40"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-white">{p.studentName || "Student"}</h4>
                          <p className="text-[11px] text-slate-400">
                            {p.studentEmail || "No email"} • {p.studentPhone || "No phone"}
                          </p>
                        </div>

                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                          {p.attendanceStatus || "REGISTERED"}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
