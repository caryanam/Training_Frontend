import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Followup } from "@/types/database";
import {
  PhoneCall,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  UserCheck,
  CheckCircle2,
  X,
  Edit2,
} from "lucide-react";

export default function ExecutorFollowups() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState<Followup | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "today">("all");

  // Form State
  const [studentId, setStudentId] = useState("");
  const [followupDate, setFollowupDate] = useState(new Date().toISOString().split("T")[0]);
  const [followupTime, setFollowupTime] = useState("14:00");
  const [followupType, setFollowupType] = useState<Followup["followup_type"]>("call");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Followup["status"]>("contacted");

  const students = profile ? store.getStudentsForExecutor(profile.id || profile.email) : [];
  const followups = profile ? store.getFollowupsForExecutor(profile.id) : [];

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredFollowups = followups.filter((f) => {
    const student = students.find((s) => s.id === f.student_id);
    const matchesSearch =
      (student && student.profile.full_name.toLowerCase().includes(search.toLowerCase())) ||
      (f.notes && f.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesDate = filterType === "all" || f.followup_date === todayStr;

    return matchesSearch && matchesDate;
  });

  const openCreateModal = () => {
    setEditingFollowup(null);
    setStudentId(students[0]?.id || "");
    setFollowupDate(new Date().toISOString().split("T")[0]);
    setFollowupTime("14:00");
    setFollowupType("call");
    setNotes("");
    setStatus("contacted");
    setModalOpen(true);
  };

  const openEditModal = (f: Followup) => {
    setEditingFollowup(f);
    setStudentId(f.student_id);
    setFollowupDate(f.followup_date);
    setFollowupTime(f.followup_time || "14:00");
    setFollowupType(f.followup_type);
    setNotes(f.notes || "");
    setStatus(f.status);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (editingFollowup) {
      store.updateFollowup(editingFollowup.id, {
        student_id: studentId,
        followup_date: followupDate,
        followup_time: followupTime,
        followup_type: followupType,
        notes,
        status,
      });
    } else {
      store.createFollowup({
        executor_id: "exe-rec-1",
        student_id: studentId,
        followup_date: followupDate,
        followup_time: followupTime,
        followup_type: followupType,
        notes,
        status,
        created_by: profile.id,
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Outreach & Follow-up Tracker"
        subtitle="Manage communication schedules, log call notes, and nurture interested leads to enrollment."
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Follow-up Log
          </button>
        }
      />

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center rounded-lg border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              filterType === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Follow-ups ({followups.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("today")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              filterType === "today"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Today's Agenda ({followups.filter((f) => f.followup_date === todayStr).length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by student name or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {filteredFollowups.length === 0 ? (
        <EmptyState
          title="No follow-up entries found"
          description="Log notes from your calls or outreach messages to maintain lead history."
          action={
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs"
            >
              Add Follow-up
            </button>
          }
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Student Lead</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Channel</th>
                  <th className="px-5 py-3.5">Notes & Discussion</th>
                  <th className="px-5 py-3.5">Lead Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFollowups.map((f) => {
                  const student = students.find((s) => s.id === f.student_id);

                  return (
                    <tr key={f.id} className="hover:bg-accent/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-foreground">
                          {student?.profile.full_name || "Lead"}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {student?.student_id || "STU-1001"}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        <div>{formatDate(f.followup_date)}</div>
                        <div className="text-[11px]">{f.followup_time || "14:00"}</div>
                      </td>
                      <td className="px-5 py-4 font-semibold capitalize text-foreground">
                        {f.followup_type}
                      </td>
                      <td className="px-5 py-4 max-w-sm">
                        <div className="line-clamp-2 text-foreground">{f.notes || "No notes logged."}</div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={f.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openEditModal(f)}
                          className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                          title="Edit Follow-up"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Follow-up Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setModalOpen(false)} />

          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl z-50 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-foreground">
                {editingFollowup ? "Edit Follow-up Log" : "New Outreach Follow-up"}
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
                  Select Student Lead
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.profile.full_name} ({s.student_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={followupDate}
                    onChange={(e) => setFollowupDate(e.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={followupTime}
                    onChange={(e) => setFollowupTime(e.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Channel
                  </label>
                  <select
                    value={followupType}
                    onChange={(e) => setFollowupType(e.target.value as Followup["followup_type"])}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="call">Phone Call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="in-person">In-Person Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Lead Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Followup["status"])}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="new">New Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="interested">Interested</option>
                    <option value="payment_pending">Payment Pending</option>
                    <option value="enrolled">Enrolled</option>
                    <option value="not_interested">Not Interested</option>
                    <option value="follow_up_required">Follow-up Required</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Discussion Notes & Next Steps
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Student requested syllabus for Spring Boot module. Shared link."
                  required
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="flex gap-3 pt-2">
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
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
