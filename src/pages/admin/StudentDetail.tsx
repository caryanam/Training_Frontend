import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDataStore } from "@/lib/store";
import { api } from "@/lib/api";
import { formatDate, formatCurrency, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { FollowupReportsList } from "@/components/shared/FollowupReportsList";
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
  Loader2,
} from "lucide-react";

export default function AdminStudentDetail() {
  const { studentId } = useParams<{ studentId: string }>();
  const store = useDataStore();

  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      try {
        // 1. Try to find from API leads
        const res = await api.getLeads("all");
        if (res.success && res.data && res.data.length > 0) {
          const found = res.data.find(
            (l: any) =>
              String(l.id) === String(studentId) ||
              String(l.leadId) === String(studentId) ||
              String(l.studentId) === String(studentId)
          );

          if (found) {
            setStudentData({
              id: found.id || found.leadId || studentId,
              student_id: found.studentId || found.leadId || studentId,
              fullName: found.fullName || "Student Profile",
              email: found.email || "N/A",
              phone: found.phone || "N/A",
              course: found.interestedCourse || "Full Stack Software Development",
              executor: found.assignedExecutor || "Unassigned",
              status: found.status || "active",
              createdAt: found.createdAt || new Date().toISOString(),
              isFromApi: true,
            });
            setLoading(false);
            return;
          }
        }

        // 2. Fallback to Store
        const students = store.getStudentsWithProfiles();
        const storeMatch = students.find(
          (s) => String(s.id) === String(studentId) || String(s.student_id) === String(studentId)
        );

        if (storeMatch) {
          setStudentData({
            id: storeMatch.id,
            student_id: storeMatch.student_id,
            fullName: storeMatch.profile.full_name,
            email: storeMatch.profile.email,
            phone: storeMatch.profile.phone || "+91 98765 43210",
            course: "Full Stack Software Development",
            executor: "Assigned Staff",
            status: storeMatch.status,
            createdAt: storeMatch.created_at,
            isFromApi: false,
            rawStore: storeMatch,
          });
        }
      } catch (err) {
        console.error("Error fetching student details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId, store]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            to="/admin/students"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-3"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Students
          </Link>
        </div>
        <EmptyState
          icon={<User className="h-8 w-8" />}
          title="Student Profile Not Found"
          description={`No student or lead record found matching ID "${studentId}".`}
        />
      </div>
    );
  }

  const enrollments = studentData.rawStore
    ? store.getEnrollmentsForStudent(studentData.rawStore.id)
    : [];
  const payments = studentData.rawStore
    ? store.getPaymentsForStudent(studentData.rawStore.id)
    : [];

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
          title={studentData.fullName}
          subtitle={`Student / Lead ID: ${studentData.student_id} • Registered ${formatDate(studentData.createdAt)}`}
          badge={<StatusBadge status={studentData.status} />}
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
                <span className="text-foreground">{studentData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-foreground">{studentData.phone}</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Course Program:</span>
                <span className="font-semibold text-foreground">{studentData.course}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned Executor:</span>
                <span className="font-semibold text-foreground">{studentData.executor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Enrollments & Payments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enrolled Courses */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground">Active Course Enrollments</h3>

            {enrollments.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">No enrolled courses on file.</p>
            ) : (
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
                        <span>
                          Validity: {enr.start_date ? formatDate(enr.start_date) : "N/A"} →{" "}
                          {enr.expiry_date ? formatDate(enr.expiry_date) : "N/A"}
                        </span>
                      </div>

                      {adjustments.length > 0 && (
                        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] text-amber-900 dark:text-amber-200">
                          <span className="font-bold block">Access Adjustment Recorded:</span>
                          <span>
                            Extended from {adjustments[0].previous_expiry_date} to{" "}
                            {adjustments[0].new_expiry_date} (Reason: {adjustments[0].reason})
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground">Payment History</h3>

            {payments.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">No payment transactions on file.</p>
            ) : (
              <div className="divide-y divide-border">
                {payments.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-mono font-bold text-foreground">{p.transaction_id}</div>
                      <div className="text-muted-foreground">
                        {p.payment_date ? formatDateTime(p.payment_date) : "N/A"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground">{formatCurrency(p.amount)}</div>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> Follow-up Reports
            </h2>
            <FollowupReportsList leadId={studentData.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

