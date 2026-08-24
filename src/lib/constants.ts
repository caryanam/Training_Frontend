// ============================================================
// Role & Permission Constants
// ============================================================

export const ROLES = {
  STUDENT: "student",
  EXECUTOR: "executor",
  FACULTY: "faculty",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  student: "Student",
  executor: "Executor",
  faculty: "Faculty",
  admin: "Admin",
};

export const ROLE_DASHBOARD_PATHS: Record<Role, string> = {
  student: "/student",
  executor: "/executor",
  faculty: "/faculty",
  admin: "/admin",
};

// ============================================================
// Status Enums
// ============================================================

export const PAYMENT_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const ENROLLMENT_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  EXPIRING_SOON: "expiring_soon",
  EXPIRED: "expired",
  SUSPENDED: "suspended",
  CANCELLED: "cancelled",
} as const;

export type EnrollmentStatus =
  (typeof ENROLLMENT_STATUS)[keyof typeof ENROLLMENT_STATUS];

export const LECTURE_STATUS = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  DISABLED: "disabled",
} as const;

export type LectureStatus =
  (typeof LECTURE_STATUS)[keyof typeof LECTURE_STATUS];

export const COURSE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
} as const;

export type CourseStatus = (typeof COURSE_STATUS)[keyof typeof COURSE_STATUS];

export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const FOLLOWUP_STATUS = {
  NEW: "new",
  CONTACTED: "contacted",
  INTERESTED: "interested",
  PAYMENT_PENDING: "payment_pending",
  ENROLLED: "enrolled",
  NOT_INTERESTED: "not_interested",
  FOLLOW_UP_REQUIRED: "follow_up_required",
} as const;

export type FollowupStatus =
  (typeof FOLLOWUP_STATUS)[keyof typeof FOLLOWUP_STATUS];

export const FOLLOWUP_TYPE = {
  CALL: "call",
  EMAIL: "email",
  WHATSAPP: "whatsapp",
  IN_PERSON: "in-person",
} as const;

export type FollowupType = (typeof FOLLOWUP_TYPE)[keyof typeof FOLLOWUP_TYPE];

export const DOWNLOAD_STATUS = {
  AVAILABLE: "available",
  COMPLETED: "completed",
  EXPIRED: "expired",
} as const;

export type DownloadStatus =
  (typeof DOWNLOAD_STATUS)[keyof typeof DOWNLOAD_STATUS];

export const NOTIFICATION_TYPE = {
  LECTURE: "lecture",
  PAYMENT: "payment",
  COURSE: "course",
  SYSTEM: "system",
  FOLLOWUP: "followup",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

// ============================================================
// Lecture Access — Computed Display Status (NOT source of truth)
// ============================================================

export const LECTURE_ACCESS_DISPLAY = {
  AVAILABLE: "available",
  LOCKED: "locked",
  EXPIRED: "expired",
  DISABLED: "disabled",
} as const;

export type LectureAccessDisplay =
  (typeof LECTURE_ACCESS_DISPLAY)[keyof typeof LECTURE_ACCESS_DISPLAY];

// ============================================================
// Payment Provider
// ============================================================

export const PAYMENT_PROVIDER = {
  MOCK: "mock",
  RAZORPAY: "razorpay",
} as const;

export type PaymentProvider =
  (typeof PAYMENT_PROVIDER)[keyof typeof PAYMENT_PROVIDER];

// ============================================================
// Currency
// ============================================================

export const DEFAULT_CURRENCY = "INR";

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

// ============================================================
// Status Color Maps (for StatusBadge component)
// ============================================================

export const ENROLLMENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  expiring_soon: "bg-orange-100 text-orange-800",
  expired: "bg-red-100 text-red-800",
  suspended: "bg-gray-100 text-gray-800",
  cancelled: "bg-gray-100 text-gray-500",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  success: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-blue-100 text-blue-800",
};

export const LECTURE_STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  live: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  disabled: "bg-gray-100 text-gray-500",
};

export const USER_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-500",
  suspended: "bg-red-100 text-red-800",
};

export const FOLLOWUP_STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-indigo-100 text-indigo-800",
  interested: "bg-green-100 text-green-800",
  payment_pending: "bg-yellow-100 text-yellow-800",
  enrolled: "bg-emerald-100 text-emerald-800",
  not_interested: "bg-gray-100 text-gray-500",
  follow_up_required: "bg-orange-100 text-orange-800",
};

// ============================================================
// Lead Status
// ============================================================

export const LEAD_STATUS = {
  NEW: "new",
  ASSIGNED: "assigned",
  CONTACTED: "contacted",
  DEMO_SCHEDULED: "demo_scheduled",
  DEMO_COMPLETED: "demo_completed",
  INTERESTED: "interested",
  PAYMENT_PENDING: "payment_pending",
  ENROLLED: "enrolled",
  NOT_INTERESTED: "not_interested",
  FOLLOW_UP_REQUIRED: "follow_up_required",
  CLOSED: "closed",
} as const;

export type LeadStatus = (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS];

export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "New",
  assigned: "Assigned",
  contacted: "Contacted",
  demo_scheduled: "Demo Scheduled",
  demo_completed: "Demo Completed",
  interested: "Interested",
  payment_pending: "Payment Pending",
  enrolled: "Enrolled",
  not_interested: "Not Interested",
  follow_up_required: "Follow-up Required",
  closed: "Closed",
};

export const LEAD_STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  assigned: "bg-indigo-100 text-indigo-800",
  contacted: "bg-cyan-100 text-cyan-800",
  demo_scheduled: "bg-violet-100 text-violet-800",
  demo_completed: "bg-purple-100 text-purple-800",
  interested: "bg-green-100 text-green-800",
  payment_pending: "bg-yellow-100 text-yellow-800",
  enrolled: "bg-emerald-100 text-emerald-800",
  not_interested: "bg-gray-100 text-gray-500",
  follow_up_required: "bg-orange-100 text-orange-800",
  closed: "bg-slate-100 text-slate-600",
};

// ============================================================
// Demo Status
// ============================================================

export const DEMO_STATUS = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const;

export type DemoStatus = (typeof DEMO_STATUS)[keyof typeof DEMO_STATUS];

export const DEMO_STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

export const DEMO_STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-gray-100 text-gray-500",
};

