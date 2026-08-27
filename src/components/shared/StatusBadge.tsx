interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, size = "md", className = "" }: StatusBadgeProps) {
  const getStyles = () => {
    switch (status.toLowerCase()) {
      case "active":
      case "success":
      case "enrolled":
      case "completed":
        return {
          bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-emerald-500/10",
          dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
          label: status,
        };
      case "expiring_soon":
      case "payment_pending":
      case "scheduled":
      case "interested":
      case "contacted":
        return {
          bg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 shadow-amber-500/10",
          dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]",
          label: status.replace("_", " "),
        };
      case "expired":
      case "failed":
      case "cancelled":
      case "suspended":
      case "inactive":
      case "disabled":
      case "not_interested":
        return {
          bg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 shadow-rose-500/10",
          dot: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]",
          label: status.replace("_", " "),
        };
      case "live":
        return {
          bg: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/40 shadow-red-500/20 animate-pulse",
          dot: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)] animate-ping",
          label: "LIVE NOW",
        };
      case "refunded":
        return {
          bg: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 shadow-purple-500/10",
          dot: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]",
          label: "Refunded",
        };
      case "pending":
      case "new":
      default:
        return {
          bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-emerald-500/10",
          dot: "bg-emerald-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]",
          label: status.replace("_", " "),
        };
    }
  };

  const { bg, dot, label } = getStyles();
  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[10px] gap-1.5"
      : "px-2.5 py-1 text-xs gap-2";

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold uppercase tracking-wider border shadow-xs backdrop-blur-xs transition-all ${bg} ${sizeClasses} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot}`} />
      <span className="capitalize">{label}</span>
    </span>
  );
}
