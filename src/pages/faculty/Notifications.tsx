import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bell, Video, Users, CheckCircle2 } from "lucide-react";

export default function FacultyNotifications() {
  const { profile } = useAuth();
  const store = useDataStore();

  const notifications = profile ? store.getNotificationsForUser(profile.id) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Notification Feed"
        subtitle="System alerts, student enrollments, and lecture link delivery confirmations."
        actions={
          notifications.length > 0 && profile ? (
            <button
              type="button"
              onClick={() => store.markAllNotificationsRead(profile.id)}
              className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors shadow-2xs"
            >
              Mark all as read
            </button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You have no unread alerts at this time." />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs divide-y divide-border">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => store.markNotificationRead(notif.id)}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer hover:bg-accent/40 ${
                !notif.is_read ? "bg-primary/5 font-medium" : "opacity-80"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted shrink-0 mt-0.5">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-foreground">{notif.title}</h4>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {formatDateTime(notif.created_at)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {notif.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
