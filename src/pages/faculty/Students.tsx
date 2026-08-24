import { useState, useEffect } from "react";
import { useDataStore } from "@/lib/store";
import { api } from "@/lib/api";
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
  Loader2,
} from "lucide-react";

interface RosterStudent {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone: string;
  course_name: string;
  expiry_date: string;
  status: string;
}

export default function FacultyStudents() {
  const store = useDataStore();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [rosterStudents, setRosterStudents] = useState<RosterStudent[]>([]);

  const fetchRoster = async () => {
    setLoading(true);
    try {
      const res = await api.getLeads("all");
      const storeStudents = store.getStudentsWithProfiles();
      const enrollments = store.getEnrollments();

      let combined: RosterStudent[] = [];

      // 1. Map API leads/students if available
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
              status: enrollment?.status || "active",
            });
          }
        });
      }

      // 3. Fallback mock roster if empty
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

      setRosterStudents(combined);
    } catch (err) {
      console.error("Failed to load student roster:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  const filteredStudents = rosterStudents.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.course_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-xs">
      <PageHeader
        title="Student Cohort Roster"
        subtitle="Review all students enrolled in your curriculum tracks, check active validity, and communication details."
      />

      {/* Search Toolbar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by student name, ID, course, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-xs text-muted-foreground">Loading student cohort roster...</span>
        </div>
      ) : filteredStudents.length === 0 ? (
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
                    <td className="px-5 py-4">
                      <span className="font-semibold text-foreground">
                        {s.course_name}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {formatDate(s.expiry_date)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={s.status} />
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
