import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { formatDate, getDaysRemaining } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import type { CourseEnrollment } from "@/types/database";
import {
  Lock,
  Unlock,
  Calendar,
  Clock,
  ShieldCheck,
  History,
  AlertCircle,
  Search,
  Plus,
  CheckCircle2,
  X,
} from "lucide-react";

export default function AdminLectureAccess() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [search, setSearch] = useState("");
  const [selectedEnrollment, setSelectedEnrollment] = useState<CourseEnrollment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Extension Form
  const [newExpiryDate, setNewExpiryDate] = useState("");
  const [reason, setReason] = useState("");

  const enrollments = store.getEnrollments();
  const students = store.getStudentsWithProfiles();
  const courses = store.getCourses();
  const plans = store.getAllPlans();

  const filteredEnrollments = enrollments.filter((enr) => {
    const student = students.find((s) => s.id === enr.student_id);
    const course = courses.find((c) => c.id === enr.course_id);

    return (
      (student && student.profile.full_name.toLowerCase().includes(search.toLowerCase())) ||
      (course && course.name.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const openExtendModal = (enr: CourseEnrollment) => {
    setSelectedEnrollment(enr);
    // Default to +30 days from current expiry
    const baseDate = enr.expiry_date ? new Date(enr.expiry_date) : new Date();
    baseDate.setDate(baseDate.getDate() + 30);
    setNewExpiryDate(baseDate.toISOString().split("T")[0]);
    setReason("Compensation for rescheduled lecture / technical support request");
    setModalOpen(true);
  };

  const handleSaveExtension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment || !profile) return;

    store.extendCourseAccess({
      enrollmentId: selectedEnrollment.id,
      adminProfileId: profile.id,
      newExpiryDate,
      reason,
    });

    setModalOpen(false);
  };

  const toggleAccessSuspension = (enr: CourseEnrollment) => {
    if (!profile) return;
    const newStatus = enr.status === "suspended" ? "active" : "suspended";
    
    // Update store
    store.getEnrollments().forEach((item) => {
      if (item.id === enr.id) {
        item.status = newStatus;
      }
    });

    store.addAuditLog({
      action: newStatus === "suspended" ? "access.suspended" : "access.reactivated",
      entity: "course_enrollments",
      entity_id: enr.id,
      details: { previousStatus: enr.status, newStatus },
      user_id: profile.id,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lecture Access Control & Validity Authority"
        subtitle="Manage student lecture authorization, inspect calendar validity thresholds, and log audit-backed manual access adjustments."
      />

      {/* Compliance Rule Callout */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-indigo-900 dark:text-indigo-200">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0" />
          <div>
            <span className="font-bold block">Enterprise Audit Guarantee (Requirement 7 & 30):</span>
            <span>Manual access extensions never overwrite original payment records. Every adjustment writes to <code className="font-mono bg-indigo-100 dark:bg-indigo-950 px-1 py-0.5 rounded">enrollment_access_adjustments</code> and immutable system audit logs.</span>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter by student name or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Access Control Master Table */}
      {filteredEnrollments.length === 0 ? (
        <EmptyState title="No access records" description="No course enrollments matched your search." />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Student Lead</th>
                  <th className="px-5 py-3.5">Course & Plan</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Start Date</th>
                  <th className="px-5 py-3.5">Expiry Date</th>
                  <th className="px-5 py-3.5">Days Left</th>
                  <th className="px-5 py-3.5">Lecture Access</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEnrollments.map((enr) => {
                  const student = students.find((s) => s.id === enr.student_id);
                  const course = courses.find((c) => c.id === enr.course_id);
                  const plan = plans.find((p) => p.id === enr.plan_id);

                  const daysRemaining = enr.expiry_date ? getDaysRemaining(enr.expiry_date) : 0;
                  const isSuspended = enr.status === "suspended";
                  const isExpired = enr.expiry_date ? new Date() > new Date(enr.expiry_date) : false;

                  return (
                    <tr key={enr.id} className="hover:bg-accent/40 transition-colors">
                      <td className="px-5 py-4 font-bold text-foreground">
                        <div>{student?.profile.full_name || "Student"}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">{student?.student_id}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground">{course?.name || "Course"}</div>
                        <div className="text-[11px] text-muted-foreground">{plan?.name || "Standard Plan"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-emerald-600">SUCCESS</span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {enr.start_date ? formatDate(enr.start_date) : "N/A"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-foreground">
                        {enr.expiry_date ? formatDate(enr.expiry_date) : "N/A"}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold">
                        <span className={isExpired ? "text-rose-600" : daysRemaining <= 7 ? "text-amber-600" : "text-emerald-600"}>
                          {isExpired ? "0 Days" : `${daysRemaining} Days`}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={isSuspended ? "suspended" : isExpired ? "expired" : "active"} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openExtendModal(enr)}
                            className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/5 hover:border-primary transition-colors"
                          >
                            Extend
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleAccessSuspension(enr)}
                            className={`rounded-lg border p-1.5 transition-colors ${
                              isSuspended
                                ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                : "border-border text-muted-foreground hover:text-rose-600 hover:border-rose-300"
                            }`}
                            title={isSuspended ? "Reactivate Access" : "Suspend Access"}
                          >
                            {isSuspended ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Access Extension Modal */}
      {modalOpen && selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setModalOpen(false)} />

          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl z-50 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Extend Course Validity
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExtension} className="space-y-4 text-xs">
              <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-bold text-foreground">
                    {students.find((s) => s.id === selectedEnrollment.student_id)?.profile.full_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Expiry:</span>
                  <span className="font-semibold text-foreground">
                    {selectedEnrollment.expiry_date ? formatDate(selectedEnrollment.expiry_date) : "N/A"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  New Adjusted Expiry Date
                </label>
                <input
                  type="date"
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  required
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Reason for Manual Extension (Mandatory for Audit)
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Compensation for cancelled lecture on Aug 18th"
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
                  Confirm Extension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
