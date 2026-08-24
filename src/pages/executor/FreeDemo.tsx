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
    if (!profile) return;
    setLoading(true);
    try {
      const [res, leadsRes] = await Promise.all([
        api.getExecutorGroupDemos(),
        api.getLeads("all"),
      ]);
      if (res.success && res.data) {
        setGroupDemos(res.data);
      }
      if (leadsRes.success && leadsRes.data) {
        const mapped = leadsRes.data.map((l: any) => ({
          id: l.leadId || l.id,
          full_name: l.fullName || l.full_name || "Student",
          email: l.email || "",
          phone: l.phone || "",
        }));
        setAllLeads(mapped);
      }
    } catch (e) {
      console.error("Failed to load group demos:", e);
    } finally {
      setLoading(false);
    }
  };

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
        fetchDemos();
      }
    } catch (err: any) {
      alert(err.message || "Failed to remove participant.");
    }
  };

  const handleCancelDemo = async (sessionId: string) => {
    if (!confirm("Are you sure you want to cancel this entire group demo session?")) return;
    try {
      const res = await api.cancelGroupDemo(sessionId);
      if (res.success) {
        fetchDemos();
      }
    } catch (err: any) {
      alert(err.message || "Failed to cancel group demo.");
    }
  };

  const handleAddStudentsToActiveSession = async () => {
    if (!activeSession || selectedNewStudentIds.length === 0) return;
    setActionLoading(true);
    try {
      const res = await api.addParticipantsToGroupDemo(activeSession.id || activeSession.sessionId, selectedNewStudentIds);
      if (res.success && res.data) {
        setActiveSession(res.data);
        setSelectedNewStudentIds([]);
        setAddStudentModalOpen(false);
        fetchDemos();
      }
    } catch (err: any) {
      alert(err.message || "Failed to add students to group demo.");
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
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md"
          >
            <Plus className="h-4 w-4" /> Schedule Group Demo
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
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
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" /> Schedule Group Demo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groupDemos.map((demo) => {
            const isCancelled = demo.status === "CANCELLED";
            const participantCount = demo.totalParticipants || (demo.participants ? demo.participants.length : 0);

            return (
              <div
                key={demo.id || demo.sessionId || demo.demoCode}
                className={`rounded-2xl border bg-slate-900 p-6 shadow-xl space-y-4 transition-all ${
                  isCancelled ? "border-red-500/20 opacity-70" : "border-indigo-500/20 hover:border-indigo-500/40"
                }`}
              >
                {/* Card Top Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300 mb-2">
                      <Video className="h-3.5 w-3.5" /> Group Demo Session
                    </span>
                    <h3 className="text-lg font-bold text-white">{demo.courseName || "Full Stack Web Development"}</h3>
                    <p className="text-xs text-slate-400 font-mono">Code: {demo.demoCode || `demo-${demo.id}`}</p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase border ${
                      isCancelled
                        ? "bg-red-500/10 border-red-500/30 text-red-400"
                        : demo.status === "RESCHEDULED"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    }`}
                  >
                    {demo.status || "SCHEDULED"}
                  </span>
                </div>

                {/* Details Grid */}
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
                      onClick={() => handleOpenParticipantsModal(demo)}
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

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenParticipantsModal(demo)}
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
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-indigo-500/20 bg-slate-900 shadow-2xl text-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
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
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={() => setAddStudentModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shrink-0"
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
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-indigo-500/20 bg-slate-900 shadow-2xl text-slate-100 p-6 space-y-4">
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
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
                        isChecked ? "bg-indigo-950/40 border border-indigo-500/30" : "hover:bg-slate-800/50"
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
                          className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 h-4 w-4"
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
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
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
