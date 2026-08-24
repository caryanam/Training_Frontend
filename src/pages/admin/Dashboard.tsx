import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { api } from "@/lib/api";
import { Users, UserCheck, Briefcase, Target, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    totalStudents: number;
    newLeads: number;
    totalExecutors: number;
    totalFaculty: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.getDashboardStats();
        if (res.success && res.data) {
          setStats(res.data);
        } else {
          setError(res.error || "Failed to load dashboard statistics.");
        }
      } catch (err: any) {
        setError("Failed to connect to the backend server.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading dashboard statistics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-xs">
      <PageHeader
        title="Admin Operations Console"
        subtitle="Real-time monitoring across student leads, active registrations, faculty pools, and executor pipelines."
      />

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Registered Students"
          value={stats ? stats.totalStudents : 0}
          subtitle="Verified student profiles"
          icon={<Users className="h-5 w-5" />}
          variant="primary"
        />
        <StatsCard
          title="New Student Leads"
          value={stats ? stats.newLeads : 0}
          subtitle="Leads awaiting contact"
          icon={<Target className="h-5 w-5" />}
          variant="amber"
        />
        <StatsCard
          title="Admissions Executors"
          value={stats ? stats.totalExecutors : 0}
          subtitle="Active sales and lead managers"
          icon={<Briefcase className="h-5 w-5" />}
          variant="purple"
        />
        <StatsCard
          title="Active Training Faculty"
          value={stats ? stats.totalFaculty : 0}
          subtitle="Live project course instructors"
          icon={<UserCheck className="h-5 w-5" />}
          variant="emerald"
        />
      </div>

      {/* Quick Action Panels */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between hover:border-primary transition-all">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">Manage Student Leads</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Track public student registrations, view details, assign admissions executors, and schedule live interactive demos.
            </p>
          </div>
          <Link
            to="/admin/leads"
            className="mt-4 inline-flex items-center gap-2 font-bold text-primary hover:underline self-start"
          >
            Open pipeline <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between hover:border-purple-500 transition-all">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">Manage Executors</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Add admissions officers, set initial credentials, track active assignments, and manage executor system credentials.
            </p>
          </div>
          <Link
            to="/admin/executors"
            className="mt-4 inline-flex items-center gap-2 font-bold text-purple-600 hover:underline self-start"
          >
            View executors <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between hover:border-emerald-500 transition-all">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">Manage Faculty Pool</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Add training instructors, set live-project access permissions, assign course streams, and track faculty active roles.
            </p>
          </div>
          <Link
            to="/admin/faculty"
            className="mt-4 inline-flex items-center gap-2 font-bold text-emerald-600 hover:underline self-start"
          >
            View faculty <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
