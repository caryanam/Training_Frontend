import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
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
} from "lucide-react";

export default function AdminPayments() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const payments = store.getPayments();
  const students = store.getStudentsWithProfiles();
  const courses = store.getCourses();
  const plans = store.getAllPlans();

  const totalSuccess = payments.filter((p) => p.status === "success").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  const filteredPayments = payments.filter((p) => {
    const student = students.find((s) => s.id === p.student_id);
    const matchesSearch =
      p.transaction_id.toLowerCase().includes(search.toLowerCase()) ||
      (student && student.profile.full_name.toLowerCase().includes(search.toLowerCase()));

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

    store.addAuditLog({
      action: "payment.refunded",
      entity: "payments",
      entity_id: pId,
      details: { previousStatus: currentStatus, newStatus: "refunded" },
      user_id: profile.id,
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
          value={payments.length}
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
                  const student = students.find((s) => s.id === p.student_id);
                  const course = courses.find((c) => c.id === p.course_id);
                  const plan = plans.find((pl) => pl.id === p.plan_id);

                  return (
                    <tr key={p.id} className="hover:bg-accent/40 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-foreground">
                        {p.transaction_id}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-foreground">{student?.profile.full_name || "Student"}</div>
                        <div className="text-[11px] text-muted-foreground">{student?.profile.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground">{course?.name || "Course"}</div>
                        <div className="text-[11px] text-muted-foreground">{plan?.name || "Plan"}</div>
                      </td>
                      <td className="px-5 py-4 font-bold text-foreground">
                        {formatCurrency(p.amount, p.currency)}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {p.payment_method || "Online Gateway"}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {p.payment_date ? formatDateTime(p.payment_date) : "N/A"}
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
