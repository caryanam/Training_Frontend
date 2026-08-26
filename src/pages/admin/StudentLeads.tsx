import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/utils";
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from "@/lib/constants";
import {
  Target,
  Search,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  Clock,
  X,
  ChevronRight,
  Users,
  Activity,
  Filter,
} from "lucide-react";

const STATUS_TABS = [
  { key: "all", label: "All Leads" },
  { key: "new", label: "New" },
  { key: "assigned", label: "Assigned" },
  { key: "demo_scheduled", label: "Demo" },
  { key: "interested", label: "Interested" },
  { key: "payment_pending", label: "Payment" },
  { key: "enrolled", label: "Enrolled" },
  { key: "not_interested", label: "Not Interested" },
  { key: "closed", label: "Closed" },
];

export default function AdminStudentLeads() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [activityLeadId, setActivityLeadId] = useState<string | null>(null);
  const [statusModalLeadId, setStatusModalLeadId] = useState<string | null>(null);
  const [springLeads, setSpringLeads] = useState<any[]>([]);
  const [springExecutors, setSpringExecutors] = useState<any[]>([]);

  useEffect(() => {
    const loadData = () => {
      api.getLeads(activeTab, search).then((res) => {
        if (res.success && res.data) {
          setSpringLeads(res.data);
        }
      });
      api.getAllExecutors().then((res) => {
        if (res.success && res.data) {
          setSpringExecutors(res.data);
        }
      });
    };

    loadData();
    // Auto-sync every 3 seconds so status changed by Executor is reflected automatically
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [activeTab, search]);

  const storeLeads = store.getStudentLeads();

  const leads = (springLeads.length > 0 ? springLeads : store.getStudentLeadsWithProfiles()).map((l: any) => {
    const leadId = String(l.leadId || l.id);
    const storeMatch = storeLeads.find((sl) =>
      String(sl.id) === leadId ||
      String(sl.student_id) === leadId ||
      String(sl.profile_id) === leadId
    );

    // If reactive store has updated status, reflect it immediately
    const status = storeMatch ? storeMatch.status : (l.status || "new").toLowerCase();

    return {
      id: leadId,
      student_id: l.studentId || l.student_id || leadId,
      profile_id: l.profileId || l.profile_id || leadId,
      interested_course: l.interestedCourse || l.interested_course || "Full Stack Web Development",
      education: l.education || l.profile?.education || "—",
      city: l.city || l.profile?.city || "—",
      status: status,
      assigned_executor_id: l.assignedExecutor || l.assigned_executor_id,
      followup_date: l.followupDate || l.followup_date || null,
      notes: null,
      last_activity: l.lastActivity || l.last_activity || l.createdAt || new Date().toISOString(),
      created_at: l.createdAt || l.created_at || new Date().toISOString(),
      updated_at: l.updatedAt || l.updated_at || new Date().toISOString(),
      profile: {
        id: l.profileId || l.profile_id || leadId,
        full_name: l.fullName || l.full_name || l.profile?.full_name || "Student",
        email: l.email || l.profile?.email || "",
        phone: l.phone || l.profile?.phone || null,
        avatar_url: null,
        role: "student" as const,
        status: "active" as const,
        last_login: null,
        created_at: l.createdAt || l.created_at || new Date().toISOString(),
        updated_at: l.createdAt || l.created_at || new Date().toISOString(),
      },
      executor: (l.assignedExecutor || l.executor)
        ? { profile: { full_name: l.assignedExecutor || l.executor?.profile?.full_name || "Executor" } }
        : null,
    };
  });

  const executors = springExecutors.length > 0
    ? springExecutors.map((e: any) => ({
        id: e.executorId || e.profileId,
        profile_id: e.profileId,
        executor_id: e.executorId,
        profile: {
          id: e.profileId,
          full_name: e.fullName,
          email: e.email,
          phone: e.phone,
          avatar_url: null,
          role: "executor" as const,
          status: "active" as const,
          last_login: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }))
    : [];

  const filteredLeads = leads
    .filter((l) => activeTab === "all" || l.status === activeTab)
    .filter((l) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        l.profile.full_name.toLowerCase().includes(s) ||
        l.profile.email.toLowerCase().includes(s) ||
        (l.profile.phone && l.profile.phone.includes(s)) ||
        (l.interested_course && l.interested_course.toLowerCase().includes(s))
      );
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleAssignExecutor = async (leadId: string, executorId: string) => {
    if (!profile) return;
    await api.assignExecutorToLead(leadId, executorId);
    store.assignExecutorToLead(leadId, executorId, profile.id);
    setAssignModalOpen(false);
    setSelectedLeadId(null);
    // Refresh leads
    api.getLeads(activeTab, search).then((res) => {
      if (res.success && res.data) setSpringLeads(res.data);
    });
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    // 1. Immediate optimistic UI update
    setSpringLeads((prev) =>
      prev.map((l) =>
        l.leadId === leadId || l.id === leadId
          ? { ...l, status: newStatus }
          : l
      )
    );

    // 2. Update central store
    store.updateLeadStatus(leadId, newStatus, profile?.id);
    setStatusModalLeadId(null);

    // 3. Call backend API
    try {
      await api.updateLeadStatus(leadId, newStatus);
    } catch (e) {
      console.error("Failed to update status on server:", e);
    }
  };

  const leadActivity = activityLeadId ? store.getLeadActivity(activityLeadId) : [];

  // Stats
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const assignedLeads = leads.filter((l) => l.status === "assigned").length;
  const demoScheduled = leads.filter((l) => l.status === "demo_scheduled").length;
  const interested = leads.filter((l) => l.status === "interested" || l.status === "demo_completed").length;
  const paymentPending = leads.filter((l) => l.status === "payment_pending").length;
  const enrolled = leads.filter((l) => l.status === "enrolled").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Lead Management"
        subtitle="Track, assign, and manage student leads through the enrollment pipeline."
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Total", value: totalLeads, color: "text-slate-400" },
          { label: "New", value: newLeads, color: "text-blue-500" },
          { label: "Assigned", value: assignedLeads, color: "text-indigo-500" },
          { label: "Demo", value: demoScheduled, color: "text-violet-500" },
          { label: "Interested", value: interested, color: "text-green-500" },
          { label: "Payment", value: paymentPending, color: "text-yellow-500" },
          { label: "Enrolled", value: enrolled, color: "text-emerald-500" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border/60 bg-card p-3 text-center shadow-xs"
          >
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, course..."
            className="flex h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      {filteredLeads.length === 0 ? (
        <EmptyState
          icon={<Target className="h-7 w-7" />}
          title="No Leads Found"
          description={search ? "Try a different search term." : "No student leads match the selected filter."}
        />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                    Course Interest
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                    Executor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                    Registered
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{lead.profile.full_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {lead.education || "—"} • {lead.city || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" /> {lead.profile.email}
                      </div>
                      {lead.profile.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <Phone className="h-3.5 w-3.5" /> {lead.profile.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs font-medium text-foreground">
                        {lead.interested_course || "Not Selected"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {/* Read-only status badge for Admin: only Executor changes status */}
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {lead.executor ? (
                        <span className="text-xs font-medium text-foreground">
                          {lead.executor.profile.full_name}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            setAssignModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Assign
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(lead.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!lead.executor && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLeadId(lead.id);
                              setAssignModalOpen(true);
                            }}
                            className="lg:hidden inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                            title="Assign Executor"
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setActivityLeadId(lead.id)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors"
                          title="View Activity"
                        >
                          <Activity className="h-3.5 w-3.5" />
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

      {/* Assign Executor Modal */}
      {assignModalOpen && selectedLeadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Assign Executor
              </h3>
              <button
                type="button"
                onClick={() => {
                  setAssignModalOpen(false);
                  setSelectedLeadId(null);
                }}
                className="rounded-lg p-1.5 hover:bg-accent/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Select an executor to assign to this student lead.
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {executors.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No executors available.</p>
              ) : (
                executors.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => handleAssignExecutor(selectedLeadId, ex.id)}
                    className="w-full flex items-center justify-between rounded-xl border border-border/60 bg-background p-3 hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
                  >
                    <div>
                      <div className="font-semibold text-sm text-foreground">{ex.profile.full_name}</div>
                      <div className="text-xs text-muted-foreground">{ex.profile.email}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {statusModalLeadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Change Lead Status</h3>
              <button
                type="button"
                onClick={() => setStatusModalLeadId(null)}
                className="rounded-lg p-1.5 hover:bg-accent/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
              {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => {
                const currentLead = leads.find((l) => l.id === statusModalLeadId);
                const isActive = currentLead?.status === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleStatusChange(statusModalLeadId, key)}
                    disabled={isActive}
                    className={`rounded-lg border px-3 py-2 text-xs font-bold transition-all ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary cursor-default"
                        : "border-border/60 hover:border-primary/40 hover:bg-primary/5 text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Activity Slide Panel */}
      {activityLeadId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div
            className="absolute inset-0"
            onClick={() => setActivityLeadId(null)}
          />
          <div className="relative w-full max-w-md bg-card border-l border-border/60 shadow-2xl h-full overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border/60 p-4 flex items-center justify-between z-10">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Lead Activity Log
              </h3>
              <button
                type="button"
                onClick={() => setActivityLeadId(null)}
                className="rounded-lg p-1.5 hover:bg-accent/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {leadActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No activity recorded.</p>
              ) : (
                leadActivity.map((act) => (
                  <div
                    key={act.id}
                    className="rounded-lg border border-border/40 bg-background p-3"
                  >
                    <div className="font-medium text-sm text-foreground">{act.action}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDate(act.created_at)}
                      {act.performed_by && (
                        <span className="ml-2">
                          by <span className="font-medium text-foreground">{act.performed_by}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
