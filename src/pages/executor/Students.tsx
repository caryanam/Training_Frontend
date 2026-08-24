import { useState, useEffect } from "react";
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
  Phone,
  Mail,
  Calendar,
  BookOpen,
  Plus,
  MessageSquare,
  ArrowRight,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ExecutorStudents() {
  const { profile } = useAuth();
  const store = useDataStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [springLeads, setSpringLeads] = useState<any[] | null>(null);

  useEffect(() => {
    if (!profile) return;
    api.getLeads("all", search, profile.id, profile.email).then((res) => {
      if (res.success && res.data) {
        setSpringLeads(res.data);
      }
    });
  }, [search, profile]);

  const followups = store.getFollowups();
  const enrollments = store.getEnrollments();

  let rawAssignedStudents = springLeads !== null && springLeads.length > 0
    ? springLeads.map((l: any) => ({
        id: l.studentId || l.leadId,
        student_id: l.studentId || l.leadId,
        profile_id: l.profileId || l.leadId,
        status: (l.status || "active").toLowerCase(),
        interestedCourse: l.interestedCourse || "Full Stack Web Development",
        created_at: l.createdAt || new Date().toISOString(),
        profile: {
          id: l.profileId || l.leadId,
          full_name: l.fullName || "Student",
          email: l.email || "",
          phone: l.phone || null,
        },
      }))
    : (profile ? store.getStudentsForExecutor(profile.id || profile.email) : []);

  if (rawAssignedStudents.length === 0) {
    rawAssignedStudents = [
      {
        id: "std-1",
        student_id: "STD-1001",
        profile_id: "std-1",
        status: "active",
        interestedCourse: "Full Stack Web Development",
        created_at: new Date().toISOString(),
        profile: {
          id: "std-1",
          full_name: "Valmik Kolte",
          email: "valmik.kolte@example.com",
          phone: "9812345678",
        },
      },
      {
        id: "std-2",
        student_id: "STD-1002",
        profile_id: "std-2",
        status: "active",
        interestedCourse: "Java Microservices & Cloud",
        created_at: new Date().toISOString(),
        profile: {
          id: "std-2",
          full_name: "Rishab Raj",
          email: "rishab.raj@example.com",
          phone: "9876543210",
        },
      },
      {
        id: "std-3",
        student_id: "STD-1003",
        profile_id: "std-3",
        status: "active",
        interestedCourse: "Data Science & AI Engineering",
        created_at: new Date().toISOString(),
        profile: {
          id: "std-3",
          full_name: "Priya Sharma",
          email: "priya.sharma@example.com",
          phone: "9823456789",
        },
      },
    ];
  }

  const filteredStudents = rawAssignedStudents.filter((s: any) => {
    const matchesSearch =
      s.profile.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase()) ||
      s.profile.email.toLowerCase().includes(search.toLowerCase());

    const studentEnrollment = enrollments.find((e) => e.student_id === s.id);
    const matchesStatus =
      statusFilter === "all" ||
      (studentEnrollment && studentEnrollment.status === statusFilter) ||
      (!studentEnrollment && (statusFilter === "pending" || statusFilter === "all"));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned Student Leads"
        subtitle="Manage student admissions, review interested courses, track payment statuses, and schedule follow-ups."
        actions={
          <Link
            to="/executor/onboarding"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" /> Onboard New Student
          </Link>
        }
      />

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads by name, email, ID..."
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
            <option value="all">All Pipeline Stages</option>
            <option value="active">Active Enrolled</option>
            <option value="pending">Payment Pending</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <EmptyState
          title="No student leads match your filter"
          description="Try modifying your search or start onboarding a new student."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Student Lead</th>
                  <th className="px-5 py-3.5">Phone & Email</th>
                  <th className="px-5 py-3.5">Interested Course</th>
                  <th className="px-5 py-3.5">Enrollment Status</th>
                  <th className="px-5 py-3.5">Course Validity</th>
                  <th className="px-5 py-3.5">Last Follow-up</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.map((s) => {
                  const enrollment = enrollments.find((e) => e.student_id === s.id);
                  const course = enrollment ? store.getCourse(enrollment.course_id) : store.getCourses()[0];
                  const lastFollowup = followups.find((f) => f.student_id === s.id);

                  return (
                    <tr key={s.id} className="hover:bg-accent/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-foreground">{s.profile.full_name}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">{s.student_id}</div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {s.profile.phone || "+91 98765 43210"}
                        </div>
                        <div className="flex items-center gap-1 text-[11px]">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {s.profile.email}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-foreground">
                        {course?.name || "Java Full Stack"}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={enrollment ? enrollment.status : "payment_pending"} />
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {enrollment?.expiry_date ? formatDate(enrollment.expiry_date) : "Not Activated"}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {lastFollowup ? (
                          <div>
                            <span className="font-medium text-foreground capitalize">{lastFollowup.followup_type}</span>
                            <div className="text-[11px]">{formatDate(lastFollowup.followup_date)}</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-600 font-medium">Pending Follow-up</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to="/executor/followups"
                            className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                          >
                            Follow-up
                          </Link>
                          <Link
                            to="/executor/courses"
                            className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                          >
                            Share Info
                          </Link>
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
