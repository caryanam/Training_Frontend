import { useState } from "react";
import { useDataStore } from "@/lib/store";
import { formatDate, formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Search,
  CheckCircle2,
  Users,
  CreditCard,
  BookOpen,
  Video,
} from "lucide-react";

type ReportType =
  | "student"
  | "payment"
  | "revenue"
  | "course"
  | "lecture"
  | "faculty"
  | "executor"
  | "expiry"
  | "download";

const REPORT_TABS: { id: ReportType; label: string }[] = [
  { id: "student", label: "Student Report" },
  { id: "payment", label: "Payment Report" },
  { id: "revenue", label: "Revenue Report" },
  { id: "course", label: "Course Report" },
  { id: "lecture", label: "Lecture Report" },
  { id: "faculty", label: "Faculty Report" },
  { id: "executor", label: "Executor Report" },
  { id: "expiry", label: "Expiry Report" },
  { id: "download", label: "Download Report" },
];

export default function AdminReports() {
  const store = useDataStore();
  const [activeReport, setActiveReport] = useState<ReportType>("student");
  const [search, setSearch] = useState("");

  const students = store.getStudentsWithProfiles();
  const payments = store.getPayments();
  const courses = store.getCourses();
  const lectures = store.getLectures();
  const faculty = store.getFacultyWithProfiles();
  const executors = store.getExecutorsWithProfiles();
  const enrollments = store.getEnrollments();

  // Export CSV generator
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    if (activeReport === "student") {
      csvContent += "ID,Name,Email,Status,Created At\n";
      students.forEach((s) => {
        csvContent += `${s.student_id},"${s.profile.full_name}",${s.profile.email},${s.status},${s.created_at}\n`;
      });
    } else if (activeReport === "payment" || activeReport === "revenue") {
      csvContent += "Transaction ID,Amount,Currency,Status,Payment Date\n";
      payments.forEach((p) => {
        csvContent += `${p.transaction_id},${p.amount},${p.currency},${p.status},${p.payment_date}\n`;
      });
    } else if (activeReport === "course") {
      csvContent += "ID,Name,Category,Status\n";
      courses.forEach((c) => {
        csvContent += `${c.id},"${c.name}",${c.category},${c.status}\n`;
      });
    } else {
      csvContent += "ID,Title,Date,Status\n";
      lectures.forEach((l) => {
        csvContent += `${l.id},"${l.title}",${l.lecture_date},${l.status}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nexora_${activeReport}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Intelligence & Exportable Reports"
        subtitle="Generate and download audit-ready CSV reports across students, revenue, lectures, admissions, and validity schedules."
        actions={
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
          >
            <Download className="h-4 w-4" /> Export Report (CSV)
          </button>
        }
      />

      {/* Report Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveReport(tab.id)}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${activeReport === tab.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Data Table Display */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="text-xs font-bold text-foreground capitalize">
            {activeReport} Records Preview
          </div>
          <div className="text-[11px] text-muted-foreground">
            Displaying live database records
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeReport === "student" && (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Student ID</th>
                  <th className="px-5 py-3">Full Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="px-5 py-3 font-mono font-bold">{s.student_id}</td>
                    <td className="px-5 py-3 font-semibold">{s.profile.full_name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{s.profile.email}</td>
                    <td className="px-5 py-3 capitalize">{s.status}</td>
                    <td className="px-5 py-3 text-muted-foreground">{formatDate(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(activeReport === "payment" || activeReport === "revenue") && (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Transaction ID</th>
                  <th className="px-5 py-3">Amount (INR)</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Payment Method</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3 font-mono font-bold">{p.transaction_id}</td>
                    <td className="px-5 py-3 font-bold">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3 capitalize font-semibold">{p.status}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.payment_method || "Gateway"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.payment_date ? formatDate(p.payment_date) : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === "course" && (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Course ID</th>
                  <th className="px-5 py-3">Course Title</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td className="px-5 py-3 font-mono font-bold">{c.id}</td>
                    <td className="px-5 py-3 font-semibold">{c.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{c.category}</td>
                    <td className="px-5 py-3 capitalize">{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === "expiry" && (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Enrollment ID</th>
                  <th className="px-5 py-3">Start Date</th>
                  <th className="px-5 py-3">Expiry Date</th>
                  <th className="px-5 py-3">Validity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enrollments.map((enr) => (
                  <tr key={enr.id}>
                    <td className="px-5 py-3 font-mono font-bold">{enr.id}</td>
                    <td className="px-5 py-3 text-muted-foreground">{enr.start_date ? formatDate(enr.start_date) : "N/A"}</td>
                    <td className="px-5 py-3 font-semibold">{enr.expiry_date ? formatDate(enr.expiry_date) : "N/A"}</td>
                    <td className="px-5 py-3 capitalize">{enr.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(activeReport === "lecture" || activeReport === "faculty" || activeReport === "executor" || activeReport === "download") && (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Lecture Title</th>
                  <th className="px-5 py-3">Session Date</th>
                  <th className="px-5 py-3">Timing</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lectures.map((l) => (
                  <tr key={l.id}>
                    <td className="px-5 py-3 font-semibold">{l.title}</td>
                    <td className="px-5 py-3 text-muted-foreground">{l.lecture_date ? formatDate(l.lecture_date) : "TBA"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{l.start_time} - {l.end_time}</td>
                    <td className="px-5 py-3 capitalize">{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
