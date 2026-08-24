import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/utils";
import { LEAD_STATUS_LABELS } from "@/lib/constants";
import { ScheduleDemoModal } from "@/components/modals/ScheduleDemoModal";
import {
  Users,
  Search,
  Phone,
  Mail,
  Calendar,
  Video,
  BookOpen,
  Filter,
  CheckCircle2,
  Clock,
  UserPlus,
} from "lucide-react";

export default function ExecutorStudentLeads() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [springLeads, setSpringLeads] = useState<any[] | null>(null);

  // Demo modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [executorDemos, setExecutorDemos] = useState<any[]>([]);

  const fetchLeadsAndDemos = () => {
    if (!profile) return;
    api.getLeads(activeTab, search, profile.id, profile.email).then((res) => {
      if (res.success && res.data) {
        setSpringLeads(res.data);
      }
    });
    api.getExecutorGroupDemos().then((res) => {
      if (res.success && res.data) {
        setExecutorDemos(res.data);
      }
    });
  };

  useEffect(() => {
    fetchLeadsAndDemos();
  }, [activeTab, search, profile]);

  const assignedLeads = springLeads !== null
    ? springLeads.map((l: any) => ({
        id: l.leadId,
        student_id: l.studentId || l.leadId,
        profile_id: l.profileId || l.leadId,
        interested_course: l.interestedCourse,
        education: l.education,
        city: l.city,
        status: (l.status || "new").toLowerCase(),
        assigned_executor_id: l.assignedExecutorId || l.assignedExecutor,
        created_at: l.createdAt || new Date().toISOString(),
        profile: {
          id: l.profileId || l.leadId,
          full_name: l.fullName || "Student",
          email: l.email || "",
          phone: l.phone || null,
        },
      }))
    : (profile ? store.getLeadsForExecutor(profile.id || profile.email) : []);

  const filteredLeads = assignedLeads.filter(
    (l) =>
      l.profile.full_name.toLowerCase().includes(search.toLowerCase()) ||
      l.profile.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelectLead = (id: string) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter((item) => item !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  const handleSelectAllLeads = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  const handleOpenGroupDemoForSelected = () => {
    setSelectedLead(null);
    setModalOpen(true);
  };

  const handleOpenScheduleModal = (lead: any) => {
    setSelectedLead({
      id: lead.id,
      fullName: lead.profile.full_name,
      student_id: lead.student_id,
      email: lead.profile.email,
      interestedCourse: lead.interested_course,
    });
    setSelectedLeadIds([lead.id]);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Assigned Leads"
        subtitle="Manage student communications, follow-ups, and group demo sessions."
        actions={
          selectedLeadIds.length > 0 ? (
            <button
              onClick={handleOpenGroupDemoForSelected}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md"
            >
              <Video className="h-4 w-4" /> Schedule Group Demo ({selectedLeadIds.length})
            </button>
          ) : undefined
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="flex h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {["all", "assigned", "contacted", "demo_scheduled", "interested", "payment_pending"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              {tab === "all" ? "All Assigned" : LEAD_STATUS_LABELS[tab] || tab}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Grid */}
      {filteredLeads.length === 0 ? (
        <EmptyState
          icon={<Users className="h-7 w-7" />}
          title="No Assigned Leads"
          description="You currently have no assigned student leads matching this filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => {
            const existingDemo = executorDemos.find(
              (d) => (d.leadId === lead.id || d.studentId === lead.id || d.studentEmail === lead.profile.email) && d.status !== "CANCELLED"
            );

            return (
              <div
                key={lead.id}
                className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-base text-foreground">{lead.profile.full_name}</h3>
                      <p className="text-xs text-muted-foreground">{lead.education || "Student"} • {lead.city || "India"}</p>
                    </div>
                    <StatusBadge status={existingDemo ? "demo_scheduled" : lead.status} />
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-primary shrink-0" /> {lead.profile.email}
                    </div>
                    {lead.profile.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {lead.profile.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-500 shrink-0" /> {lead.interested_course || "Course not selected"}
                    </div>

                    {existingDemo && (
                      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-2.5 mt-2 space-y-1 text-[11px]">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" /> Scheduled Demo: {existingDemo.demoDate} ({existingDemo.startTime} - {existingDemo.endTime})
                        </div>
                        {existingDemo.meetLink && (
                          <a
                            href={existingDemo.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-primary hover:underline truncate block"
                          >
                            🔗 {existingDemo.meetLink}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Assigned {formatDate(lead.created_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/executor/onboarding?leadId=${lead.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      <UserPlus className="h-3.5 w-3.5" /> Onboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleOpenScheduleModal(lead)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      <Video className="h-3.5 w-3.5" />
                      {existingDemo ? "View / Reschedule Demo" : "Schedule Demo"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Demo Modal */}
      <ScheduleDemoModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
        preselectedStudentIds={selectedLeadIds}
        onSuccess={fetchLeadsAndDemos}
      />
    </div>
  );
}
