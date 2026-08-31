import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/constants";
import {
  LayoutDashboard,
  BookOpen,
  Video,
  Download,
  CreditCard,
  Bell,
  User,
  HelpCircle,
  Users,
  Calendar,
  Share2,
  PhoneCall,
  UserPlus,
  ShieldCheck,
  FileText,
  Key,
  History,
  Settings,
  Code,
  Sparkles,
  Lock,
  Target,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

const NAV_CONFIG: Record<Role, NavItem[]> = {
  student: [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "My Courses", href: "/student/courses", icon: BookOpen },
    { label: "Lectures", href: "/student/lectures", icon: Video },
    { label: "Downloads", href: "/student/downloads", icon: Download },
    { label: "Payments", href: "/student/payments", icon: CreditCard },
    { label: "Notifications", href: "/student/notifications", icon: Bell },
    { label: "Profile", href: "/student/profile", icon: User },
  ],
  faculty: [
    { label: "Dashboard", href: "/faculty", icon: LayoutDashboard },
    { label: "My Courses", href: "/faculty/courses", icon: BookOpen },
    { label: "Lectures", href: "/faculty/lectures", icon: Video },
    { label: "Students", href: "/faculty/students", icon: Users },
    { label: "Schedule", href: "/faculty/schedule", icon: Calendar },
    { label: "Lecture Links", href: "/faculty/links", icon: Share2 },
    { label: "Notifications", href: "/faculty/notifications", icon: Bell },
    { label: "Profile", href: "/faculty/profile", icon: User },
  ],
  executor: [
    { label: "Dashboard", href: "/executor", icon: LayoutDashboard },
    { label: "Student Leads", href: "/executor/leads", icon: Target, badge: "New" },
    { label: "Free Demo", href: "/executor/demo", icon: Video },
    { label: "Students", href: "/executor/students", icon: Users },
    { label: "Course Info", href: "/executor/courses", icon: BookOpen },
    { label: "Follow-ups", href: "/executor/followups", icon: PhoneCall },
    { label: "Onboarding", href: "/executor/onboarding", icon: UserPlus },
    { label: "Lecture Links", href: "/executor/links", icon: Share2 },
    { label: "Notifications", href: "/executor/notifications", icon: Bell },
    { label: "Profile", href: "/executor/profile", icon: User },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Student Leads", href: "/admin/leads", icon: Target, badge: "Pipeline" },
    { label: "Free Demos", href: "/admin/demos", icon: Video, badge: "Live" },
    { label: "Students", href: "/admin/students", icon: Users },
    { label: "Follow-ups", href: "/admin/followups", icon: Target, badge: "New" },
    { label: "Executors", href: "/admin/executors", icon: UserPlus },
    { label: "Faculty", href: "/admin/faculty", icon: Users },
    { label: "Courses", href: "/admin/courses", icon: BookOpen },
    { label: "Lectures", href: "/admin/lectures", icon: Video },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
  ],
};

const ROLE_BADGE_STYLES: Record<Role, { label: string; style: string }> = {
  student: { label: "Student Portal", style: "bg-[#014122]/10 text-[#014122] dark:bg-[#e6f4ec]/15 dark:text-[#e6f4ec] border-[#014122]/20 dark:border-[#e6f4ec]/30 shadow-[#014122]/10" },
  faculty: { label: "Faculty Portal", style: "bg-[#014122]/10 text-[#014122] dark:bg-[#e6f4ec]/15 dark:text-[#e6f4ec] border-[#014122]/20 dark:border-[#e6f4ec]/30 shadow-[#014122]/10" },
  executor: { label: "Executor Portal", style: "bg-[#014122]/10 text-[#014122] dark:bg-[#e6f4ec]/15 dark:text-[#e6f4ec] border-[#014122]/20 dark:border-[#e6f4ec]/30 shadow-[#014122]/10" },
  admin: { label: "Admin Console", style: "bg-[#014122]/10 text-[#014122] dark:bg-[#e6f4ec]/15 dark:text-[#e6f4ec] border-[#014122]/20 dark:border-[#e6f4ec]/30 shadow-[#014122]/10" },
};

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { role } = useAuth();
  const location = useLocation();

  const currentRole = role || "student";
  const navItems = NAV_CONFIG[currentRole] || NAV_CONFIG.student;
  const roleBadge = ROLE_BADGE_STYLES[currentRole];

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border/80 bg-sidebar/95 backdrop-blur-xl shadow-lg select-none">
      {/* Brand Header with 3D glowing Nexora icon */}
      <div className="flex h-16 items-center justify-between border-b border-border/80 px-5">
        <Link to="/" className="flex items-center gap-3 group" onClick={onNavigate}>
          <img
            src="/nexora_logo.png"
            alt="Nexora Logo"
            className="h-10 w-10 rounded-xl object-contain shadow-md shadow-[#014122]/30 transition-transform duration-300 group-hover:scale-110"
          />
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
              Nexora
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest -mt-1">
              Learning Suite
            </span>
          </div>
        </Link>
      </div>

      {/* Role Pill */}
      <div className="px-4 py-3 border-b border-border/60">
        <div
          className={cn(
            "flex items-center justify-between rounded-xl border px-3 py-1.5 text-xs font-bold shadow-xs backdrop-blur-xs",
            roleBadge.style
          )}
        >
          <span>{roleBadge.label}</span>
          <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.href ||
            (item.href !== `/${currentRole}` && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200",
                isActive
                  ? "bg-[#014122] text-[#e6f4ec] dark:bg-[#e6f4ec] dark:text-[#014122] shadow-md shadow-[#014122]/25 translate-x-1"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground hover:translate-x-0.5"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                  )}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-primary/10 text-primary border border-primary/20"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="border-t border-border/80 p-4">
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent p-3.5 text-xs space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between font-bold text-foreground">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-spin" style={{ animationDuration: "10s" }} /> 3D Architecture
            </span>
            <span className="text-[10px] text-emerald-600 font-extrabold uppercase">Live</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Calendar validity with 8-step server verification active.
          </p>
        </div>
      </div>
    </aside>
  );
}

