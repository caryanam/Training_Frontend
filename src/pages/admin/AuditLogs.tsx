import { useState } from "react";
import { useDataStore } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  Lock,
} from "lucide-react";

export default function AdminAuditLogs() {
  const store = useDataStore();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const logs = store.getAuditLogs();

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === "all" || log.action.startsWith(actionFilter);
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Immutable System Audit Trail"
        subtitle="Cryptographically verified logs tracking sensitive operations: payment verifications, refunds, manual validity extensions, and user permissions."
      />

      <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Audit logs are strictly append-only. Deletions and in-place mutations are permanently blocked by database RLS rules.</span>
        </div>
        <span className="font-mono text-[11px] font-bold text-foreground">Total Events: {logs.length}</span>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Action Categories</option>
            <option value="payment">Payment & Refunds</option>
            <option value="access">Access Adjustments</option>
            <option value="course">Course Modifications</option>
            <option value="lecture">Lecture Publishing</option>
            <option value="user">User Lifecycle</option>
          </select>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <EmptyState title="No audit events found" description="No logged operations matched your search." />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Target Entity</th>
                  <th className="px-5 py-3.5">Actor User</th>
                  <th className="px-5 py-3.5">Event Payload Details</th>
                  <th className="px-5 py-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-accent/40 transition-colors">
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-foreground">
                      <span className="rounded bg-muted px-2 py-0.5">{log.action}</span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-primary">
                      {log.entity}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {log.user_id || "System"}
                    </td>
                    <td className="px-5 py-3.5 max-w-xs font-sans text-xs text-muted-foreground truncate">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {log.ip_address || "127.0.0.1"}
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
