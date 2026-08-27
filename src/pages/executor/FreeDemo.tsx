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
  Link as LinkIcon,
  XCircle,
  Users,
  Search,
  UserPlus,
  UserMinus,
  X,
  Edit,
  Loader2,
} from "lucide-react";

export default function ExecutorFreeDemo() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [groupDemos, setGroupDemos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [existingDemoToEdit, setExistingDemoToEdit] = useState<any | null>(null);

  // Participants View Modal
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [participantSearch, setParticipantSearch] = useState("");

  // Add Participant Mode
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [selectedNewStudentIds, setSelectedNewStudentIds] = useState<string[]>([]);
  const [addSearchQuery, setAddSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [allLeads, setAllLeads] = useState<any[]>([]);

  const fetchDemos = async () => {
    setLoading(true);
    try {
      const [res, leadsRes] = await Promise.allSettled([
        api.getExecutorGroupDemos(),
        api.getLeads("all"),
      ]);

      let loadedDemos: any[] = [];
      let loadedLeads: any[] = [];

      if (res.status === "fulfilled" && res.value.success && Array.isArray(res.value.data)) {
        loadedDemos = res.value.data;
      } else {
        // Fallback to store
        const storeDemos = store.getDemoSessions().map((d) => {
          const course = store.getCourse(d.course_id || "");
          const lead = store.getLeadById(d.lead_id);
          const leadProfile = lead ? store.getStudentLeadsWithProfiles().find((l) => l.id === lead.id)?.profile : null;
          return {
            id: d.id,
            sessionId: d.id,
            demoCode: `demo-${d.id}`,
            courseName: course?.name || "Full Stack Web Development",
            demoDate: d.demo_date,
            startTime: d.demo_time || "11:00",
            endTime: "12:00",
            meetLink: d.meeting_link || "https://meet.google.com/nexora-demo",
            status: (d.status || "SCHEDULED").toUpperCase(),
            totalParticipants: 1,
            notes: d.notes || "",
            participants: [
              {
                participantId: `part-${d.id}`,
                leadId: d.lead_id,
                studentId: d.student_id,
                studentName: leadProfile?.full_name || "Enrolled Student",
                studentEmail: leadProfile?.email || "student@nexora.com",
                studentPhone: leadProfile?.phone || "+91 98765 43210",
                attendanceStatus: "REGISTERED",
              },
            ],
          };
        });
        loadedDemos = storeDemos;
      }
      setGroupDemos(loadedDemos);

      if (leadsRes.status === "fulfilled" && leadsRes.value.success && Array.isArray(leadsRes.value.data)) {
        loadedLeads = leadsRes.value.data.map((l: any) => ({
          id: l.leadId || l.id,
          full_name: l.fullName || l.full_name || "Student",
          email: l.email || "",
          phone: l.phone || "",
        }));
      } else {
        loadedLeads = store.getStudentLeadsWithProfiles().map((l) => ({
          id: l.id,
          full_name: l.profile?.full_name || "Student",
          email: l.profile?.email || "",
          phone: l.profile?.phone || "",
        }));
      }
      setAllLeads(loadedLeads);
    } catch (e) {
      console.error("Failed to load group demos:", e);
      // Ensure fallback on error
      const storeDemos = store.getDemoSessions().map((d) => ({
        id: d.id,
        sessionId: d.id,
        demoCode: `demo-${d.id}`,
        courseName: store.getCourse(d.course_id || "")?.name || "Full Stack Web Development",
        demoDate: d.demo_date,
        startTime: d.demo_time || "11:00",
        endTime: "12:00",
        meetLink: d.meeting_link || "https://meet.google.com/nexora-demo",
        status: (d.status || "SCHEDULED").toUpperCase(),
        totalParticipants: 1,
        notes: d.notes || "",
      }));
      setGroupDemos(storeDemos);
      setAllLeads(
        store.getStudentLeadsWithProfiles().map((l) => ({
          id: l.id,
          full_name: l.profile?.full_name || "Student",
          email: l.profile?.email || "",
          phone: l.profile?.phone || "",
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemos();
  }, [profile]);

  const handleOpenScheduleModal = (demo?: any) => {
    setExistingDemoToEdit(demo || null);
    setModalOpen(true);
  };

  const handleOpenParticipantsModal = (session: any) => {
    setActiveSession(session);
    setParticipantsModalOpen(true);
  };

  const handleRemoveParticipant = async (sessionId: string, studentId: string) => {
    if (!confirm("Are you sure you want to remove this student from the group demo session?")) return;
    try {
      const res = await api.removeParticipantFromGroupDemo(sessionId, studentId);
      if (res.success && res.data) {
        setActiveSession(res.data);
      } else if (activeSession) {
        setActiveSession({
          ...activeSession,
          participants: (activeSession.participants || []).filter(
            (p: any) => (p.leadId || p.studentId) !== studentId
          ),
        });
      }
      fetchDemos();
    } catch (err: any) {
      if (activeSession) {
        setActiveSession({
          ...activeSession,
          participants: (activeSession.participants || []).filter(
            (p: any) => (p.leadId || p.studentId) !== studentId
          ),
        });
      }
      fetchDemos();
    }
  };

  const handleUpdateStatus = async (sessionId: string, newStatus: string) => {
    const statusUpper = newStatus.toUpperCase();

    // 1. Update demo in store
    store.updateDemoSession(sessionId, { status: statusUpper.toLowerCase() as any });

    // 2. Update demo API
    try {
      await api.updateGroupDemoStatus(sessionId, statusUpper);
    } catch (e) {
      console.error("Demo status API update:", e);
    }

    // 3. Update local state
    setGroupDemos((prev) =>
      prev.map((d) =>
        d.id === sessionId || d.sessionId === sessionId
          ? { ...d, status: statusUpper }
          : d
      )
    );
  };

  const handleCancelDemo = async (sessionId: string) => {
    if (!confirm("Are you sure you want to cancel this entire group demo session?")) return;
    try {
      const res = await api.cancelGroupDemo(sessionId);
      if (res.success) {
        fetchDemos();
      } else {
        store.updateDemoSession(sessionId, { status: "cancelled" });
        fetchDemos();
      }
    } catch (err: any) {
      store.updateDemoSession(sessionId, { status: "cancelled" });
      fetchDemos();
    }
  };

  const handleAddStudentsToActiveSession = async () => {
    if (!activeSession || selectedNewStudentIds.length === 0) return;
    setActionLoading(true);
    try {
      const res = await api.addParticipantsToGroupDemo(activeSession.id || activeSession.sessionId, selectedNewStudentIds);
      if (res.success && res.data) {
        setActiveSession(res.data);
      }
      setSelectedNewStudentIds([]);
      setAddStudentModalOpen(false);
      fetchDemos();
    } catch (err: any) {
      setSelectedNewStudentIds([]);
      setAddStudentModalOpen(false);
      fetchDemos();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Group Demo Sessions"
        subtitle="Schedule and manage group live demos with shared Google Meet links for multiple students"
        actions={
          <button
            onClick={() => handleOpenScheduleModal()}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md"
          >
            <Plus className="h-4 w-4" /> Schedule Group Demo
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : groupDemos.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400">
          <Video className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Group Demo Sessions Scheduled</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            Create a single group demo session with a shared Google Meet link and assign multiple students at once.
          </p>
          <button
            onClick={() => handleOpenScheduleModal()}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
          >
            <Plus className="h-4 w-4" /> Schedule Group Demo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groupDemos.map((demo) => {
            const currentStatus = (demo.status || "SCHEDULED").toUpperCase();
            const isCancelled = currentStatus === "CANCELLED";
            const isCompleted = currentStatus === "COMPLETED";
            const participantCount = demo.totalParticipants || (demo.participants ? demo.participants.length : 0);
            const sessionId = demo.id || demo.sessionId;

            return (
              <div
                key={sessionId || demo.demoCode}
                className={`rounded-2xl border bg-slate-900 p-6 shadow-xl space-y-4 transition-all ${
                  isCancelled
                    ? "border-red-500/20 opacity-75"
                    : isCompleted
                    ? "border-emerald-500/30"
                    : "border-emerald-500/20 hover:border-emerald-500/40"
                }`}
              >
                {/* Card Top Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 mb-2">
                      <Video className="h-3.5 w-3.5" /> Group Demo Session
                    </span>
                    <h3 className="text-lg font-bold text-white">{demo.courseName || "Full Stack Web Development"}</h3>
                    <p className="text-xs text-slate-400 font-mono">Code: {demo.demoCode || `demo-${sessionId}`}</p>
                  </div>

                  {/* Interactive Status Selector */}
                  <div className="flex flex-col items-end gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Status</label>
                    <select
                      value={currentStatus}
                      onChange={(e) => handleUpdateStatus(sessionId, e.target.value)}
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase border cursor-pointer focus:outline-none transition-all ${
                        isCancelled
                          ? "bg-red-500/20 border-red-500/40 text-red-300"
                          : isCompleted
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : currentStatus === "IN_PROGRESS"
                          ? "bg-purple-500/20 border-purple-500/40 text-purple-300 animate-pulse"
                          : currentStatus === "NO_SHOW"
                          ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                          : currentStatus === "RESCHEDULED"
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                          : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      }`}
                    >
                      <option value="SCHEDULED" className="bg-slate-900 text-emerald-300">SCHEDULED</option>
                      <option value="IN_PROGRESS" className="bg-slate-900 text-purple-300">IN PROGRESS</option>
                      <option value="COMPLETED" className="bg-slate-900 text-emerald-300">COMPLETED</option>
                      <option value="NO_SHOW" className="bg-slate-900 text-rose-300">NO SHOW</option>
                      <option value="RESCHEDULED" className="bg-slate-900 text-amber-300">RESCHEDULED</option>
                      <option value="CANCELLED" className="bg-slate-900 text-red-300">CANCELLED</option>
                    </select>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Date: <strong className="text-white">{formatDate(demo.demoDate)}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Time: <strong className="text-white">{demo.startTime} - {demo.endTime || "12:00"}</strong></span>
                  </div>

                  <div className="col-span-2 flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Participants: <strong className="text-emerald-400">{participantCount} student(s)</strong></span>
                    </div>

                    <button
                      onClick={() => handleOpenParticipantsModal(demo)}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
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

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenParticipantsModal(demo)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                  >
                    <Users className="h-3.5 w-3.5 text-emerald-400" /> View Students ({participantCount})
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
                          onClick={() => handleOpenScheduleModal(demo)}
                          className="rounded-xl border border-slate-700 p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                          title="Edit Group Demo"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCancelDemo(demo.id || demo.sessionId)}
                          className="rounded-xl border border-red-500/30 p-2 text-red-400 hover:bg-red-500/10"
                          title="Cancel Group Demo"
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

      {/* Group Demo Schedule / Edit Modal */}
      <ScheduleDemoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        existingDemo={existingDemoToEdit}
        onSuccess={fetchDemos}
      />

      {/* View Demo Participants Modal */}
      {participantsModalOpen && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-emerald-500/20 bg-slate-900 shadow-2xl text-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Demo Participants</h3>
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

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search participant..."
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  onClick={() => setAddStudentModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shrink-0"
                >
                  <UserPlus className="h-4 w-4" /> Add Students
                </button>
              </div>

              {/* Participants List */}
              <div className="space-y-2">
                {!activeSession.participants || activeSession.participants.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    No students currently added to this group demo session.
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
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 transition-colors"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-white">{p.studentName || "Student"}</h4>
                          <p className="text-[11px] text-slate-400">
                            {p.studentEmail || "No email"} • {p.studentPhone || "No phone"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                            {p.attendanceStatus || "REGISTERED"}
                          </span>

                          <button
                            onClick={() => handleRemoveParticipant(activeSession.id || activeSession.sessionId, p.leadId || p.studentId)}
                            className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Remove student from session"
                          >
                            <UserMinus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Students to Active Session Modal */}
      {addStudentModalOpen && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-emerald-500/20 bg-slate-900 shadow-2xl text-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Students to Existing Session</h3>
              <button onClick={() => setAddStudentModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search students to add..."
                value={addSearchQuery}
                onChange={(e) => setAddSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/50">
              {allLeads
                .filter((l: any) => l.full_name.toLowerCase().includes(addSearchQuery.toLowerCase()))
                .map((student: any) => {
                  const isChecked = selectedNewStudentIds.includes(student.id);
                  return (
                    <label
                      key={student.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                        isChecked ? "bg-emerald-950/40 border border-emerald-500/30" : "hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedNewStudentIds(selectedNewStudentIds.filter((id) => id !== student.id));
                            } else {
                              setSelectedNewStudentIds([...selectedNewStudentIds, student.id]);
                            }
                          }}
                          className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{student.full_name}</p>
                          <p className="text-[10px] text-slate-400">{student.email}</p>
                        </div>
                      </div>
                    </label>
                  );
                })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setAddStudentModalOpen(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudentsToActiveSession}
                disabled={actionLoading || selectedNewStudentIds.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : `Add Selected (${selectedNewStudentIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
