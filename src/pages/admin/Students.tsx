import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Lock,
  Unlock,
  Trash2,
  Eye,
  Filter,
  CheckCircle2,
} from "lucide-react";

export default function AdminStudents() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const students = store.getStudentsWithProfiles();
  const enrollments = store.getEnrollments();
  const courses = store.getCourses();

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.profile.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase()) ||
      s.profile.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleStudentStatus = (studentId: string, currentStatus: string) => {
    if (!profile) return;
    const newStatus = currentStatus === "active" ? "suspended" : "active";

    store.getStudentsWithProfiles().forEach((s) => {
      if (s.id === studentId) {
        s.status = newStatus;
      }
    });

    store.addAuditLog({
      action: "user.status_changed",
      entity: "students",
      entity_id: studentId,
      details: { previousStatus: currentStatus, newStatus },
      user_id: profile.id,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Directory & Accounts"
        subtitle="Manage registered student credentials, active subscriptions, and administrative authorizations."
      />

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students..."
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
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <EmptyState title="No students found" description="No student profiles match your search criteria." />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Email & Phone</th>
                  <th className="px-5 py-3.5">Enrolled Course</th>
                  <th className="px-5 py-3.5">Expiry Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.map((s) => {
                  const enrollment = enrollments.find((e) => e.student_id === s.id && e.status === "active");
                  const course = enrollment ? store.getCourse(enrollment.course_id) : courses[0];

                  return (
                    <tr key={s.id} className="hover:bg-accent/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-foreground">{s.profile.full_name}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">{s.student_id}</div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        <div>{s.profile.email}</div>
                        <div className="text-[11px]">{s.profile.phone || "+91 98765 43210"}</div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-foreground">
                        {course?.name || "Java Full Stack"}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {enrollment?.expiry_date ? formatDate(enrollment.expiry_date) : "N/A"}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/student/${s.id}`}
                            className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                            title="View Complete Profile & Access History"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleStudentStatus(s.id, s.status)}
                            className={`rounded-lg border p-1.5 transition-colors ${
                              s.status === "suspended"
                                ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                : "border-border text-muted-foreground hover:text-rose-600 hover:border-rose-300"
                            }`}
                            title={s.status === "suspended" ? "Reactivate Student" : "Suspend Student"}
                          >
                            {s.status === "suspended" ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
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
    </div>
  );
}
