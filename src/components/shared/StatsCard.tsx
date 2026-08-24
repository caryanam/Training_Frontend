import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "primary" | "emerald" | "amber" | "rose" | "purple";
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "primary",
}: StatsCardProps) {
  const variantStyles = {
    primary: "from-indigo-500/10 via-card to-card border-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:border-indigo-500/40 group-hover:shadow-indigo-500/10",
    emerald: "from-emerald-500/10 via-card to-card border-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:border-emerald-500/40 group-hover:shadow-emerald-500/10",
    amber: "from-amber-500/10 via-card to-card border-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:border-amber-500/40 group-hover:shadow-amber-500/10",
    rose: "from-rose-500/10 via-card to-card border-rose-500/20 text-rose-600 dark:text-rose-400 group-hover:border-rose-500/40 group-hover:shadow-rose-500/10",
    purple: "from-purple-500/10 via-card to-card border-purple-500/20 text-purple-600 dark:text-purple-400 group-hover:border-purple-500/40 group-hover:shadow-purple-500/10",
  };

  const iconBgStyles = {
    primary: "bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-indigo-500/30",
    emerald: "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/30",
    amber: "bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-amber-500/30",
    rose: "bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-rose-500/30",
    purple: "bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-purple-500/30",
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-b p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${variantStyles[variant]}`}
    >
      {/* 3D Ambient Top Glow */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/20 pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {value}
            </span>
          </div>

          {subtitle && (
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {subtitle}
            </p>
          )}

          {trend && (
            <div className="pt-1">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  trend.isPositive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {trend.value}
              </span>
            </div>
          )}
        </div>

        {icon && (
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shrink-0 ${iconBgStyles[variant]}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
