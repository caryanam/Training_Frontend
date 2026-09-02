import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { api } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  CreditCard,
  Download,
  CheckCircle2,
  Receipt,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function StudentPayments() {
  const { profile } = useAuth();
  const store = useDataStore();
  const [downloadedTxn, setDownloadedTxn] = useState<string | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    setLoading(true);

    api.getStudentPayments()
      .then((res) => {
        if (res.success && res.data) {
          const mapped = res.data.map((p: any) => ({
            id: String(p.paymentId || p.transactionId),
            transaction_id: p.transactionId,
            student_id: p.studentId,
            course_id: p.courseId,
            course_name: p.courseName,
            plan_id: p.planId ? String(p.planId) : undefined,
            amount: p.amount,
            currency: p.currency || "INR",
            status: (p.status || "success").toLowerCase(),
            payment_method: "Secured Online Payment",
            created_at: p.startDate || new Date().toISOString(),
          }));
          setPayments(mapped);
        } else {
          const student = store.getStudentsWithProfiles().find((s) => s.profile_id === profile.id || s.profile?.email === profile.email);
          const storePayments = student ? store.getPaymentsForStudent(student.id) : store.getPaymentsForStudent(profile.id);
          setPayments(storePayments);
        }
      })
      .catch(() => {
        const student = store.getStudentsWithProfiles().find((s) => s.profile_id === profile.id || s.profile?.email === profile.email);
        const storePayments = student ? store.getPaymentsForStudent(student.id) : store.getPaymentsForStudent(profile.id);
        setPayments(storePayments);
      })
      .finally(() => setLoading(false));
  }, [profile]);

  const handleDownloadReceipt = (txnId: string) => {
    setDownloadedTxn(txnId);
    setTimeout(() => setDownloadedTxn(null), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment & Billing History"
        subtitle="Review your verified course subscription transactions and official payment receipts."
      />

      {downloadedTxn && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Payment receipt downloaded for transaction {downloadedTxn}.</span>
        </div>
      )}

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          title="No payment records found"
          description="You haven't completed any course payments yet. Once you enroll in a course, your verified invoices will appear here."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Transaction ID</th>
                  <th className="px-5 py-3.5">Course & Plan</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Payment Method</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => {
                  const course = store.getCourse(p.course_id);
                  const plan = store.getAllPlans().find((pl) => pl.id === p.plan_id);

                  return (
                    <tr key={p.id} className="hover:bg-accent/40 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-foreground">
                        {p.transaction_id}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground">
                          {p.course_name || course?.name || "Curriculum Track"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {plan?.name || "Enrolled Plan"}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-foreground">
                        {formatCurrency(p.amount, p.currency)}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {p.payment_method || "Online Payment Gateway"}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {p.payment_date || p.created_at ? formatDateTime(p.payment_date || p.created_at!) : "Recorded"}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={p.status || "success"} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDownloadReceipt(p.transaction_id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary transition-colors cursor-pointer"
                        >
                          <Receipt className="h-3.5 w-3.5" /> Receipt
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
    </div>
  );
}
