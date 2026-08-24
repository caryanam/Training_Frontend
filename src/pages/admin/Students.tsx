import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { api } from "@/lib/api";
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
  Loader2,
} from "lucide-react";

interface AdminStudent {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone: string;
  course_name: string;
  expiry_date: string;
  status: string;
}

export default function AdminStudents() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<AdminStudent[]>([]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.getLeads("all");
      const storeStudents = store.getStudentsWithProfiles();
      const enrollments = store.getEnrollments();

      let combined: AdminStudent[] = [];

      // 1. Map API leads/students
      if (res.success && res.data && res.data.length > 0) {
        combined = res.data.map((l: any, idx: number) => ({
          id: l.leadId || l.studentId || `std-${idx}`,
          student_id: l.studentId || `STD-${1000 + idx}`,
          full_name: l.fullName || l.full_name || "Student",
          email: l.email || "",
          phone: l.phone || "9876543210",
          course_name: l.interestedCourse || "Full Stack Web Development",
          expiry_date: new Date(Date.now() + 90 * 86400000).toISOString(),
          status: l.status ? l.status.toLowerCase() : "active",
        }));
      }

      // 2. Map store students
      if (storeStudents.length > 0) {
        storeStudents.forEach((s, idx) => {
          const enrollment = enrollments.find((e) => e.student_id === s.id);
          const course = enrollment ? store.getCourse(enrollment.course_id) : null;
          if (!combined.some((item) => item.email.toLowerCase() === s.profile.email.toLowerCase())) {
            combined.push({
              id: s.id,
              student_id: s.student_id || `STD-${1050 + idx}`,
              full_name: s.profile.full_name,
              email: s.profile.email,
              phone: s.profile.phone || "9876543210",
              course_name: course ? course.name : "Full Stack Web Development",
              expiry_date: enrollment?.expiry_date || new Date(Date.now() + 90 * 86400000).toISOString(),
              status: (s.status || "active").toLowerCase(),
            });
          }
        });
      }

      // 3. Fallback default student list if empty
      if (combined.length === 0) {
        combined = [
          {
            id: "std-1",
            student_id: "STD-1001",
            full_name: "Valmik Kolte",
            email: "valmik.kolte@example.com",
            phone: "9812345678",
            course_name: "Full Stack Web Development",
            expiry_date: "2026-12-31T00:00:00.000Z",
            status: "active",
          },
          {
            id: "std-2",
            student_id: "STD-1002",
            full_name: "Rishab Raj",
            email: "rishab.raj@example.com",
            phone: "9876543210",
            course_name: "Java Microservices & Cloud",
            expiry_date: "2026-11-30T00:00:00.000Z",
            status: "active",
          },
          {
            id: "std-3",
            student_id: "STD-1003",
            full_name: "Priya Sharma",
            email: "priya.sharma@example.com",
            phone: "9823456789",
            course_name: "Data Science & AI Engineering",
            expiry_date: "2026-10-15T00:00:00.000Z",
            status: "active",
          },
          {
            id: "std-4",
            student_id: "STD-1004",
            full_name: "Akash Verma",
            email: "akash.verma@example.com",
            phone: "9834567890",
            course_name: "Cyber Security & Ethical Hacking",
            expiry_date: "2026-09-30T00:00:00.000Z",
            status: "active",
          },
        ];
      }

      setStudents(combined);
    } catch (err) {
      console.error("Failed to load admin student directory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.course_name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleStudentStatus = (studentId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";

    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s))
    );

    if (profile) {
      store.addAuditLog({
        action: "user.status_changed",
        entity: "students",
        entity_id: studentId,
        details: { previousStatus: currentStatus, newStatus },
        user_id: profile.id,
      });
    }
  };

  return (
    <div className="space-y-6 text-xs">
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
            className="h-10 rounded-xl border border-input bg-background px-3 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-xs text-muted-foreground">Loading student directory...</span>
        </div>
      ) : filteredStudents.length === 0 ? (
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
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-foreground">{s.full_name}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">{s.student_id}</div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <div>{s.email}</div>
                      <div className="text-[11px]">{s.phone}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-foreground">
                      {s.course_name}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {formatDate(s.expiry_date)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/student/${s.id}`}
                          className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-primary hover:border-primary transition-colors cursor-pointer"
                          title="View Complete Profile & Access History"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleStudentStatus(s.id, s.status)}
                          className={`rounded-lg border p-1.5 transition-colors cursor-pointer ${
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
