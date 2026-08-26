import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { FileText, Star, Calendar, MessageSquare, Briefcase } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface FollowupReport {
  id: number;
  executorName: string;
  rating: number;
  interested: boolean;
  expectedJoiningDate: string;
  demoDiscussion: string;
  projectCapability: string;
  additionalComments: string;
  createdAt: string;
}

interface FollowupReportsListProps {
  leadId?: string | number;
  isStudent?: boolean;
}

export function FollowupReportsList({ leadId, isStudent }: FollowupReportsListProps) {
  const [reports, setReports] = useState<FollowupReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = isStudent 
          ? await api.getMyFollowupReports() 
          : (leadId ? await api.getFollowupReportsForLead(leadId) : { data: [] });
          
        setReports(response.data || []);
      } catch (err) {
        console.error("Failed to fetch follow-up reports:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (isStudent || leadId) {
      fetchReports();
    }
  }, [leadId, isStudent]);

  if (loading) {
    return <div className="animate-pulse rounded-xl bg-muted/50 h-32 w-full"></div>;
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-card/50 p-6 text-center">
        <p className="text-sm text-muted-foreground">No follow-up reports available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" /> Follow-up Reports ({reports.length})
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {reports.map((report) => (
          <div key={report.id} className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">{report.executorName}</span>
                <span className="text-xs text-muted-foreground">• {formatDate(report.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${report.interested ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {report.interested ? 'Interested' : 'Not Interested'}
                </span>
                <div className="flex items-center">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`h-3 w-3 ${s <= report.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {report.expectedJoiningDate && (
                <div className="space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" /> Expected Joining
                  </div>
                  <p className="text-foreground pl-5">{formatDate(report.expectedJoiningDate)}</p>
                </div>
              )}
              
              {report.projectCapability && (
                <div className="space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" /> Project Capability
                  </div>
                  <p className="text-foreground pl-5">{report.projectCapability}</p>
                </div>
              )}

              {report.demoDiscussion && (
                <div className="space-y-1 sm:col-span-2">
                  <div className="font-semibold flex items-center gap-1.5 text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5" /> Demo Discussion
                  </div>
                  <p className="text-foreground pl-5 leading-relaxed">{report.demoDiscussion}</p>
                </div>
              )}

              {report.additionalComments && (
                <div className="space-y-1 sm:col-span-2 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <span className="font-semibold text-muted-foreground mb-1 block">Additional Notes:</span>
                  <p className="text-foreground italic">{report.additionalComments}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
