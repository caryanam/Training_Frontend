import { useParams, Link } from "react-router-dom";
import { useDataStore } from "@/lib/store";
import { formatDate, formatCurrency, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  CreditCard,
  History,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function AdminStudentDetail() {
  const { studentId } = useParams<{ studentId: string }>();
  const store = useDataStore();

  const students = store.getStudentsWithProfiles();
  const student = students.find((s) => s.id === studentId || s.student_id === studentId) || students[0];

  if (!student) return null;

  const enrollments = store.getEnrollmentsForStudent(student.id);
  const payments = store.getPaymentsForStudent(student.id);

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Students
        </Link>
        <PageHeader
          title={student.profile.full_name}
          subtitle={`Student ID: ${student.student_id} • Registered ${formatDate(student.created_at)}`}
          badge={<StatusBadge status={student.status} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground">Contact & Staff Assignments</h3>

            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-foreground">{student.profile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-foreground">{student.profile.phone || "+91 98765 43210"}</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned Executor:</span>
                <span className="font-semibold text-foreground">Vikram Mehta</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned Faculty:</span>
                <span className="font-semibold text-foreground">Dr. Ananya Verma</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Enrollments & Payments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enrolled Courses */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground">Active Course Enrollments</h3>

            <div className="divide-y divide-border">
              {enrollments.map((enr) => {
                const course = store.getCourse(enr.course_id);
                const adjustments = store.getAdjustmentsForEnrollment(enr.id);

                return (
                  <div key={enr.id} className="py-3.5 space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-foreground">
                      <span>{course?.name || "Course Track"}</span>
                      <StatusBadge status={enr.status} />
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Validity: {enr.start_date ? formatDate(enr.start_date) : "N/A"} → {enr.expiry_date ? formatDate(enr.expiry_date) : "N/A"}</span>
                    </div>

                    {adjustments.length > 0 && (
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] text-amber-900 dark:text-amber-200">
                        <span className="font-bold block">Access Adjustment Recorded:</span>
                        <span>Extended from {adjustments[0].previous_expiry_date} to {adjustments[0].new_expiry_date} (Reason: {adjustments[0].reason})</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment History */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground">Payment History</h3>

            <div className="divide-y divide-border">
              {payments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono font-bold text-foreground">{p.transaction_id}</div>
                    <div className="text-muted-foreground">{p.payment_date ? formatDateTime(p.payment_date) : "N/A"}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">{formatCurrency(p.amount)}</div>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
