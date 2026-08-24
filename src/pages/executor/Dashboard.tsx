import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Users,
  PhoneCall,
  UserPlus,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";

import { ScheduleDemoModal } from "@/components/modals/ScheduleDemoModal";

export default function ExecutorDashboard() {
  const { profile } = useAuth();
  const store = useDataStore();
  const [springLeads, setSpringLeads] = useState<any[] | null>(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedLeadForDemo, setSelectedLeadForDemo] = useState<any | null>(null);

  const fetchLeads = () => {
    if (!profile) return;
    api.getLeads("all", "", profile.id, profile.email).then((res) => {
      if (res.success && res.data) {
        setSpringLeads(res.data);
      }
    });
  };

  useEffect(() => {
    fetchLeads();
  }, [profile]);

  const assignedLeads = springLeads !== null
    ? springLeads.map((l: any) => ({
        id: l.studentId || l.leadId,
        student_id: l.studentId || l.leadId,
        profile_id: l.profileId || l.leadId,
        status: (l.status || "active").toLowerCase(),
        interestedCourse: l.interestedCourse,
        created_at: l.createdAt || new Date().toISOString(),
        profile: {
          id: l.profileId || l.leadId,
          full_name: l.fullName || "Student",
          email: l.email || "",
          phone: l.phone || null,
        },
      }))
    : (profile ? store.getStudentsForExecutor(profile.id || profile.email) : []);

  const students = assignedLeads;
  const followups = profile ? store.getFollowupsForExecutor(profile.id) : [];
  const enrollments = store.getEnrollments();

  const todayStr = new Date().toISOString().split("T")[0];
  const todaysFollowups = followups.filter((f) => f.followup_date === todayStr);
  const enrolledCount = students.filter((s: any) => s.status === "enrolled" || s.status === "active").length;
  const pendingPayments = students.filter((s: any) => s.status === "payment_pending" || s.status === "assigned" || s.status === "interested").length;

  const conversionRate = students.length > 0 ? Math.round((enrolledCount / students.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Admissions & Onboarding Hub"
        subtitle={`Welcome, ${profile?.full_name || "Admissions Officer"}. Track lead pipelines, follow-ups, and student enrollments.`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/executor/onboarding"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
            >
              <UserPlus className="h-4 w-4" /> Start Student Onboarding
            </Link>
            <Link
              to="/executor/courses"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
            >
              <BookOpen className="h-4 w-4" /> Course Catalog
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Assigned Students"
          value={students.length}
          subtitle="Total assigned student leads"
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          title="Follow-ups Today"
          value={todaysFollowups.length}
          subtitle="Scheduled outreach calls"
          icon={<Clock className="h-5 w-5" />}
          trend={{ value: "Priority", isPositive: true }}
        />
        <StatsCard
          title="Payment Pending"
          value={pendingPayments}
          subtitle="Awaiting final checkout"
          icon={<PhoneCall className="h-5 w-5" />}
        />
        <StatsCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          subtitle={`${enrolledCount} enrolled conversions`}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: "+8% this month", isPositive: true }}
        />
      </div>

      {/* Assigned Student Leads Section */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> My Assigned Student Leads
            </h3>
            <p className="text-xs text-muted-foreground">
              Students assigned to you by admin for admissions counseling & demos.
            </p>
          </div>
          <Link
            to="/executor/leads"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View All Leads <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {students.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
            No student leads currently assigned to you. When the Admin assigns new leads, they will appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Course Interest</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((s: any) => (
                  <tr key={s.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-foreground">{s.profile.full_name}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">{s.student_id}</div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      <div>{s.profile.email}</div>
                      <div className="text-[11px]">{s.profile.phone || "—"}</div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-foreground">
                      {s.interestedCourse || "Full Stack Web Development"}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLeadForDemo({
                              id: s.id,
                              fullName: s.profile.full_name,
                              student_id: s.student_id,
                              email: s.profile.email,
                              interestedCourse: s.interestedCourse,
                            });
                            setScheduleModalOpen(true);
                          }}
                          className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                        >
                          Schedule Demo
                        </button>
                        <Link
                          to="/executor/followups"
                          className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                        >
                          Follow-up
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Main Grid: Today's Follow-ups & Recent Pipeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Today's Follow-up Calls */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Today's Follow-up Agenda</h3>
              <p className="text-xs text-muted-foreground">Action items scheduled for communication today</p>
            </div>
            <Link
              to="/executor/followups"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View Pipeline <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {followups.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No follow-ups recorded today.
              </div>
            ) : (
              followups.slice(0, 4).map((f) => {
                const student = students.find((s: any) => s.id === f.student_id);

                return (
                  <div
                    key={f.id}
                    className="flex items-center justify-between py-3.5 hover:bg-accent/40 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 font-bold text-xs">
                        <PhoneCall className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          {student?.profile.full_name || "Student Lead"}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {f.notes || "Follow-up regarding course syllabus."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={f.status} />
                      <Link
                        to="/executor/followups"
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Onboarding Quick Wizard Link */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> 8-Step Onboarding
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Guide students seamlessly from initial information, course curriculum explanation, plan checkout, and faculty lecture link assignment.
            </p>

            <Link
              to="/executor/onboarding"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
            >
              Launch Onboarding Wizard
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs text-xs space-y-2">
            <h4 className="font-bold text-foreground">Executor Guardrail Policy</h4>
            <p className="text-muted-foreground">
              Executors cannot modify payment amounts, grant unverified access, or adjust calendar validities. All adjustments require Admin authorization.
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Demo Modal */}
      {selectedLeadForDemo && (
        <ScheduleDemoModal
          isOpen={scheduleModalOpen}
          onClose={() => {
            setScheduleModalOpen(false);
            setSelectedLeadForDemo(null);
          }}
          lead={selectedLeadForDemo}
          onSuccess={fetchLeads}
        />
      )}
    </div>
  );
}
