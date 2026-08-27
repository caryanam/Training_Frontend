import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { ROLE_LABELS } from "@/lib/constants";
import {
  Bell,
  LogOut,
  User,
  Menu,
  ChevronDown,
} from "lucide-react";

interface TopNavProps {
  onMobileMenuToggle: () => void;
}

export function TopNav({ onMobileMenuToggle }: TopNavProps) {
  const { profile, role, signOut } = useAuth();
  const store = useDataStore();
  const navigate = useNavigate();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = profile ? store.getNotificationsForUser(profile.id) : [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const getRoleGlowBadge = () => {
    return "bg-[#014122] text-[#e6f4ec] dark:bg-[#e6f4ec] dark:text-[#014122] shadow-[#014122]/20";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/80 bg-background/85 px-4 sm:px-6 backdrop-blur-xl transition-all">
      {/* Mobile Hamburger & Brand Pill */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
          <span className="text-muted-foreground">Active Workspace:</span>
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r px-3 py-1 text-xs font-bold shadow-sm ${getRoleGlowBadge()}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            {role ? ROLE_LABELS[role] : "Student"} Portal
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowUserMenu(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shadow-2xs"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Notifications</h4>
                {unreadCount > 0 && profile && (
                  <button
                    type="button"
                    onClick={() => store.markAllNotificationsRead(profile.id)}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-border/60">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => store.markNotificationRead(n.id)}
                      className={`pt-2 text-xs cursor-pointer hover:bg-accent/40 rounded-lg p-2 transition-colors ${
                        !n.is_read ? "font-semibold text-foreground bg-primary/5" : "text-muted-foreground"
                      }`}
                    >
                      <div className="font-bold text-foreground text-xs">{n.title}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 hover:bg-accent transition-colors shadow-2xs"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-violet-500 font-bold text-xs text-white shadow-xs">
              {profile?.full_name ? profile.full_name[0].toUpperCase() : "U"}
            </div>
            <span className="hidden lg:inline text-xs font-bold text-foreground max-w-[120px] truncate">
              {profile?.full_name || "User"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden lg:inline" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card/95 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 text-xs">
              <div className="px-3 py-2 border-b border-border mb-1">
                <div className="font-bold text-foreground truncate">{profile?.full_name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{profile?.email}</div>
              </div>

              {role !== "admin" && (
                <Link
                  to={`/${role || "student"}/profile`}
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-foreground hover:bg-accent transition-colors"
                >
                  <User className="h-4 w-4 text-primary" /> Profile Settings
                </Link>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
