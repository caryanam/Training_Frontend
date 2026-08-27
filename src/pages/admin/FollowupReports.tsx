import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/utils";
import { FileText, Search, Filter, Star, Calendar, MessageSquare, Briefcase, ChevronRight, User } from "lucide-react";

export default function AdminFollowupReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.getAllFollowupReports();
      setReports(response.data || []);
    } catch (err) {
      console.error("Failed to fetch all follow-up reports", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(
    (r) =>
      r.leadName?.toLowerCase().includes(search.toLowerCase()) ||
      r.executorName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Follow-up Reports"
        subtitle="Review all follow-up and demo assessments submitted by executors."
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student or executor name..."
            className="flex h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-muted/50 w-full" />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-7 w-7" />}
          title="No Reports Found"
          description="There are currently no follow-up reports matching your search criteria."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReports.map((report) => (
            <div key={report.id} className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:border-primary/40 transition-colors flex flex-col md:flex-row md:items-start gap-4">
              
              <div className="md:w-1/3 space-y-3 border-b md:border-b-0 md:border-r border-border/50 pb-4 md:pb-0 md:pr-4">
                <div>
                  <h3 className="font-bold text-base text-foreground mb-1">{report.leadName}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="h-3.5 w-3.5" /> Executed by: <span className="font-medium text-foreground">{report.executorName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3.5 w-3.5" /> Submitted: {formatDate(report.createdAt)}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${report.interested ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                    {report.interested ? 'Interested' : 'Not Interested'}
                  </span>
                  <div className="flex items-center gap-0.5 bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-full">
                    <span className="text-[11px] font-bold mr-1">{report.rating}.0</span>
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  </div>
                </div>

                <Link
                  to={`/admin/student/${report.studentId || report.leadId || report.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-2"
                >
                  View Student Profile <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {report.expectedJoiningDate && (
                  <div className="space-y-1">
                    <div className="font-semibold flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 text-emerald-500" /> Expected Joining Date
                    </div>
                    <p className="text-foreground pl-5 font-medium">{formatDate(report.expectedJoiningDate)}</p>
                  </div>
                )}
                
                {report.projectCapability && (
                  <div className="space-y-1">
                    <div className="font-semibold flex items-center gap-1.5 text-muted-foreground">
                      <Briefcase className="h-3.5 w-3.5 text-emerald-500" /> Project Capability
                    </div>
                    <p className="text-foreground pl-5 font-medium">{report.projectCapability}</p>
                  </div>
                )}

                {report.demoDiscussion && (
                  <div className="space-y-1 sm:col-span-2 mt-2">
                    <div className="font-semibold flex items-center gap-1.5 text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-500" /> Demo Discussion & Notes
                    </div>
                    <p className="text-foreground pl-5 leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/50 mt-1">
                      {report.demoDiscussion}
                    </p>
                  </div>
                )}

                {report.additionalComments && (
                  <div className="space-y-1 sm:col-span-2 mt-2">
                    <div className="font-semibold flex items-center gap-1.5 text-muted-foreground">
                      <FileText className="h-3.5 w-3.5 text-amber-500" /> Additional Comments
                    </div>
                    <p className="text-foreground pl-5 leading-relaxed italic text-muted-foreground">
                      "{report.additionalComments}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
