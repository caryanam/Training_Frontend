import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDataStore } from "@/lib/store";
import { ROLE_DASHBOARD_PATHS, ROLE_LABELS } from "@/lib/constants";
import type { Role } from "@/lib/constants";
import {
  Bell,
  LogOut,
  User,
  Menu,
  Sparkles,
  ChevronDown,
  Check,
  GraduationCap,
  BookOpen,
  UserCheck,
  Briefcase,
  ShieldAlert,
  Zap,
} from "lucide-react";

interface TopNavProps {
  onMobileMenuToggle: () => void;
}

export function TopNav({ onMobileMenuToggle }: TopNavProps) {
  const { profile, role, signOut, loginAsRole, isMockMode } = useAuth();
  const store = useDataStore();
  const navigate = useNavigate();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = profile ? store.getNotificationsForUser(profile.id) : [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleRoleSwitch = async (targetRole: Role) => {
    setShowRoleMenu(false);
    await loginAsRole(targetRole);
    navigate(ROLE_DASHBOARD_PATHS[targetRole], { replace: true });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const getRoleGlowBadge = () => {
    switch (role) {
      case "student":
        return "from-blue-600 to-indigo-600 text-white shadow-blue-500/20";
      case "faculty":
        return "from-purple-600 to-indigo-600 text-white shadow-purple-500/20";
      case "executor":
        return "from-amber-600 to-orange-600 text-white shadow-amber-500/20";
      case "admin":
        return "from-rose-600 to-pink-600 text-white shadow-rose-500/20";
      default:
        return "from-primary to-indigo-600 text-white";
    }
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
        {/* 1-Click Role Switcher */}
        {isMockMode && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowNotifMenu(false);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary animate-spin" style={{ animationDuration: "8s" }} />
              <span className="hidden md:inline">Switch Role:</span>
              <span className="capitalize">{role || "student"}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-border bg-card/95 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border mb-1 flex items-center justify-between">
                  <span>1-Click Switcher</span>
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch("student")}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                    role === "student" ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-accent"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" /> Student (Rahul)
                  </span>
                  {role === "student" && <Check className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch("faculty")}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                    role === "faculty" ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-accent"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-purple-500" /> Faculty (Dr. Ananya)
                  </span>
                  {role === "faculty" && <Check className="h-3.5 w-3.5" />}
                </button>
                <div className="border-t border-border/40 my-1 pt-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Executors
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoleMenu(false);
                      loginAsRole("executor", {
                        id: "exe-prof-3",
                        full_name: "Dinesh Sapkla",
                        email: "dsapkal141@gmail.com",
                      });
                      navigate(ROLE_DASHBOARD_PATHS["executor"], { replace: true });
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs transition-colors ${
                      role === "executor" && profile?.email === "dsapkal141@gmail.com" ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-accent"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <UserCheck className="h-3.5 w-3.5 text-amber-500" /> Dinesh Sapkla
                    </span>
                    {role === "executor" && profile?.email === "dsapkal141@gmail.com" && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoleMenu(false);
                      loginAsRole("executor", {
                        id: "exe-prof-2",
                        full_name: "Ramesh Saxena",
                        email: "ramesh.test@codextechnology.com",
                      });
                      navigate(ROLE_DASHBOARD_PATHS["executor"], { replace: true });
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs transition-colors ${
                      role === "executor" && profile?.email === "ramesh.test@codextechnology.com" ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-accent"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <UserCheck className="h-3.5 w-3.5 text-amber-500" /> Ramesh Saxena
                    </span>
                    {role === "executor" && profile?.email === "ramesh.test@codextechnology.com" && <Check className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="border-t border-border/40 my-1 pt-1">
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch("admin")}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                      role === "admin" ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-accent"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-rose-500" /> Admin (Siddharth)
                    </span>
                    {role === "admin" && <Check className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowRoleMenu(false);
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
              setShowRoleMenu(false);
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

              <Link
                to={`/${role}/profile`}
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-foreground hover:bg-accent transition-colors"
              >
                <User className="h-4 w-4 text-primary" /> Profile Settings
              </Link>

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
