import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Bell,
  Video,
  CreditCard,
  BookOpen,
  Loader2,
} from "lucide-react";

export default function StudentNotifications() {
  const { profile } = useAuth();
  const store = useDataStore();
  const storeNotifs = profile ? store.getNotificationsForUser(profile.id) : store.getNotificationsForUser("all");
  const notifications = storeNotifs.length > 0 ? storeNotifs : store.getNotificationsForUser("all");

  const handleMarkAllRead = () => {
    if (profile) store.markAllNotificationsRead(profile.id);
  };

  const handleMarkRead = (id: number | string) => {
    store.markNotificationRead(id.toString());
  };

  const getNotifIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "lecture":
        return <Video className="h-4 w-4 text-emerald-600" />;
      case "payment":
        return <CreditCard className="h-4 w-4 text-emerald-600" />;
      case "course":
        return <BookOpen className="h-4 w-4 text-amber-600" />;
      default:
        return <Bell className="h-4 w-4 text-[#014122]" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Center"
        subtitle="Stay updated with lecture reminders, validity announcements, and payment receipts."
        actions={
          notifications.length > 0 ? (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-accent transition-colors shadow-2xs cursor-pointer"
            >
              Mark all as read
            </button>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="You're all caught up! New lecture links and course updates will appear here."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs divide-y divide-border">
          {notifications.map((notif) => {
            const isRead = notif.is_read;
            const createdAt = notif.created_at;
            return (
              <div
                key={notif.id}
                onClick={() => handleMarkRead(notif.id)}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer hover:bg-accent/40 ${
                  !isRead ? "bg-[#014122]/5 font-medium" : "opacity-80"
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted shrink-0 mt-0.5">
                  {getNotifIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-foreground">{notif.title}</h4>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {createdAt ? formatDateTime(createdAt) : "Just now"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
                {!isRead && (
                  <span className="h-2 w-2 rounded-full bg-[#014122] shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
