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
import { FollowupReportModal } from "@/components/modals/FollowupReportModal";
import {
  Users,
  Search,
  Phone,
  Mail,
  BookOpen,
  Filter,
  Clock,
  UserPlus,
  FileText,
  Calendar,
} from "lucide-react";

export default function ExecutorFollowups() {
  const { profile } = useAuth();
  const store = useDataStore();

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [followupModalOpen, setFollowupModalOpen] = useState(false);
  const [selectedLeadForFollowup, setSelectedLeadForFollowup] = useState<any | null>(null);

  const [dbLeads, setDbLeads] = useState<any[]>([]);

  useEffect(() => {
    fetchLeads();
  }, [profile]);

  const fetchLeads = async () => {
    if (!profile) return;
    try {
      const response = await api.getLeads(undefined, undefined, profile.id, profile.email);
      setDbLeads(response.data || []);
    } catch (error) {
      console.error("Failed to fetch leads for executor:", error);
    }
  };

  const assignedLeads = dbLeads.length > 0
    ? dbLeads.map(l => ({
        id: l.id,
        leadId: l.leadId,
        student_id: l.studentId,
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-ups & Onboarding"
        subtitle="Manage student communications, log follow-up reports, and onboard interested students."
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
          {["all", "contacted", "demo_scheduled", "interested"].map((tab) => (
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
          title="No Leads Found"
          description="You currently have no student leads matching this filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => {
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
                    <StatusBadge status={lead.status} />
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
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Assigned {formatDate(lead.created_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLeadForFollowup(lead);
                        setFollowupModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      <FileText className="h-3.5 w-3.5" /> Follow-up
                    </button>
                    <Link
                      to={`/executor/onboarding?leadId=${lead.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      <UserPlus className="h-3.5 w-3.5" /> Onboard
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Followup Modal */}
      {followupModalOpen && selectedLeadForFollowup && (
        <FollowupReportModal
          lead={{
            id: selectedLeadForFollowup.id,
            fullName: selectedLeadForFollowup.profile.full_name
          }}
          onClose={() => setFollowupModalOpen(false)}
          onSuccess={() => {
            setFollowupModalOpen(false);
            fetchLeads();
          }}
        />
      )}
    </div>
  );
}
