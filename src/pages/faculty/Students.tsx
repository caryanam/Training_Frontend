import { useState } from "react";
import { useDataStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Users,
  Search,
  BookOpen,
  Calendar,
  Mail,
  Phone,
  CheckCircle2,
} from "lucide-react";

export default function FacultyStudents() {
  const store = useDataStore();
  const [search, setSearch] = useState("");

  const students = store.getStudentsWithProfiles();
  const enrollments = store.getEnrollments();

  const filteredStudents = students.filter((s) =>
    s.profile.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.student_id.toLowerCase().includes(search.toLowerCase()) ||
    s.profile.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Cohort Roster"
        subtitle="Review all students enrolled in your curriculum tracks, check active validity, and communication details."
      />

      {/* Search Toolbar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by student name, ID, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <EmptyState title="No students found" description="No enrolled students match your search criteria." />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Student ID & Name</th>
                  <th className="px-5 py-3.5">Contact Email & Phone</th>
                  <th className="px-5 py-3.5">Enrolled Course</th>
                  <th className="px-5 py-3.5">Validity Expiry</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.map((s) => {
                  const studentEnrollment = enrollments.find((e) => e.student_id === s.id && e.status === "active");
                  const course = studentEnrollment ? store.getCourse(studentEnrollment.course_id) : null;

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
                      <td className="px-5 py-4">
                        <span className="font-semibold text-foreground">
                          {course?.name || "Java Full Stack Development"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {studentEnrollment?.expiry_date ? formatDate(studentEnrollment.expiry_date) : "Active"}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={studentEnrollment?.status || "active"} />
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
