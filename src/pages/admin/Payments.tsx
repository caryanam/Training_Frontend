import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { api } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatsCard } from "@/components/shared/StatsCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Receipt,
  Loader2,
} from "lucide-react";

export default function AdminPayments() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [backendPayments, setBackendPayments] = useState<any[]>([]);
  const [springLeads, setSpringLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAllPayments(),
      api.getLeads("all"),
    ]).then(([payRes, leadsRes]) => {
      if (payRes.success && Array.isArray(payRes.data)) {
        setBackendPayments(payRes.data);
      }
      if (leadsRes.success && Array.isArray(leadsRes.data)) {
        setSpringLeads(leadsRes.data);
      }
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const storePayments = store.getPayments();
  const students = store.getStudentsWithProfiles();
  const courses = store.getCourses();
  const plans = store.getAllPlans();

  // Combine real backend payments from MySQL + store payments
  const combinedPayments: Array<{
    id: string;
    transaction_id: string;
    student_name: string;
    student_email: string;
    course_name: string;
    plan_name: string;
    amount: number;
    currency: string;
    status: string;
    payment_method: string;
    payment_date: string;
  }> = [];

  // 1. Add all real payments from MySQL payments table
  if (backendPayments.length > 0) {
    backendPayments.forEach((bp, idx) => {
      const matchedLead = springLeads.find(
        (l) =>
          (bp.studentEmail && l.email?.toLowerCase() === bp.studentEmail.toLowerCase()) ||
          (bp.studentId && (l.studentId === bp.studentId || l.leadId === bp.studentId || String(l.profileId) === String(bp.studentId)))
      );

      combinedPayments.push({
        id: `pay-db-${bp.paymentId || idx}`,
        transaction_id: bp.transactionId || `DUMMY_TXN_20260831_${bp.paymentId || idx}`,
        student_name: matchedLead?.fullName || (bp.studentEmail ? bp.studentEmail.split("@")[0] : "Student"),
        student_email: bp.studentEmail || matchedLead?.email || "",
        course_name: bp.courseName || matchedLead?.interestedCourse || matchedLead?.enrolledCourse || "Full Stack Java & Spring Boot Masterclass",
        plan_name: "1 Month Plan",
        amount: Number(bp.amount) || 7000,
        currency: bp.currency || "INR",
        status: (bp.status || "success").toLowerCase(),
        payment_method: "Dummy Payment Gateway",
        payment_date: bp.paymentDate || bp.createdAt || new Date().toISOString(),
      });
    });
  } else {
    // Fallback: If backend payments list is empty, use enrolled leads and store payments
    springLeads.forEach((l, idx) => {
      const isEnrolled =
        l.status?.toLowerCase() === "enrolled" ||
        l.status?.toLowerCase() === "active" ||
        l.status?.toLowerCase() === "completed";

      if (isEnrolled) {
        combinedPayments.push({
          id: `pay-lead-${l.id || idx}`,
          transaction_id: `DUMMY_TXN_20260831_${(l.studentId || "STD").replace("-", "")}`,
          student_name: l.fullName || "Student",
          student_email: l.email || "",
          course_name: l.interestedCourse || l.enrolledCourse || "Full Stack Java & Spring Boot Masterclass",
          plan_name: "1 Month Plan",
          amount: 7000,
          currency: "INR",
          status: "success",
          payment_method: "Dummy Payment Gateway",
          payment_date: l.lastActivity || l.createdAt || new Date().toISOString(),
        });
      }
    });

    storePayments.forEach((p) => {
      const student = students.find((s) => s.id === p.student_id);
      const course = courses.find((c) => c.id === p.course_id);
      const plan = plans.find((pl) => pl.id === p.plan_id);

      if (!combinedPayments.some((cp) => cp.transaction_id === p.transaction_id)) {
        combinedPayments.push({
          id: p.id,
          transaction_id: p.transaction_id,
          student_name: student?.profile.full_name || "Enrolled Student",
          student_email: student?.profile.email || "",
          course_name: course?.name || "Full Stack Java & Spring Boot Masterclass",
          plan_name: plan?.name || "1 Month Plan",
          amount: p.amount,
          currency: p.currency || "INR",
          status: p.status,
          payment_method: p.payment_method || "Dummy Payment Gateway",
          payment_date: p.created_at || new Date().toISOString(),
        });
      }
    });
  }

  const totalSuccess = combinedPayments.filter((p) => p.status === "success").reduce((s, p) => s + p.amount, 0);
  const totalPending = combinedPayments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  const filteredPayments = combinedPayments.filter((p) => {
    const matchesSearch =
      p.transaction_id.toLowerCase().includes(search.toLowerCase()) ||
      p.student_name.toLowerCase().includes(search.toLowerCase()) ||
      p.student_email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRefund = (pId: string, currentStatus: string) => {
    if (!profile || currentStatus === "refunded") return;

    store.getPayments().forEach((p) => {
      if (p.id === pId) {
        p.status = "refunded";
      }
    });

    
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial & Gateway Payments Console"
        subtitle="Review transaction logs, payment gateway callbacks, verified revenue, and refund authorizations."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          title="Verified Revenue"
          value={formatCurrency(totalSuccess)}
          subtitle="Processed course checkouts"
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatsCard
          title="Pending Settlement"
          value={formatCurrency(totalPending)}
          subtitle="Awaiting bank confirmation"
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatsCard
          title="Total Transactions"
          value={combinedPayments.length}
          subtitle="All gateway orders"
          icon={<Receipt className="h-5 w-5" />}
        />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by transaction ID or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Payment Statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {filteredPayments.length === 0 ? (
        <EmptyState title="No transactions found" description="No payment records matched your search." />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Transaction ID</th>
                  <th className="px-5 py-3.5">Student Lead</th>
                  <th className="px-5 py-3.5">Course & Plan</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Payment Method</th>
                  <th className="px-5 py-3.5">Payment Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPayments.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-accent/40 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-foreground">
                        {p.transaction_id}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-foreground">{p.student_name}</div>
                        <div className="text-[11px] text-muted-foreground">{p.student_email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground">{p.course_name}</div>
                        <div className="text-[11px] text-muted-foreground">{p.plan_name}</div>
                      </td>
                      <td className="px-5 py-4 font-bold text-foreground">
                        {formatCurrency(p.amount, p.currency)}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {p.payment_method || "Dummy Payment Gateway"}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {p.payment_date ? formatDateTime(p.payment_date) : "Just now"}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        {p.status === "success" && (
                          <button
                            type="button"
                            onClick={() => handleRefund(p.id, p.status)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <RotateCcw className="h-3 w-3" /> Refund
                          </button>
                        )}
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

