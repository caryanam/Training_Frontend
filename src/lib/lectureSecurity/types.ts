export type SecurityEventType =
  | "SCREEN_SHARE_STARTED"
  | "SCREEN_SHARE_STOPPED"
  | "TAB_HIDDEN"
  | "TAB_VISIBLE"
  | "WINDOW_BLUR"
  | "WINDOW_FOCUS"
  | "FULLSCREEN_EXITED"
  | "MULTIPLE_SESSION_DETECTED"
  | "SESSION_TERMINATED"
  | "SUSPICIOUS_ACTIVITY";

export type SecurityEventSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ReportSecurityEventPayload {
  lectureId: string;
  sessionId?: number;
  eventType: SecurityEventType;
  metadata?: string;
  timestamp?: string;
}

export interface SecurityPolicyStatus {
  violationCount: number;
  isSuspended: boolean;
  warningLevel: "NONE" | "WARNING" | "STRONG_WARNING" | "TERMINATED";
  message: string;
  actionRequired?: string | null;
}

export interface LectureSecurityEventDTO {
  id: number;
  lectureId: string;
  lectureTitle: string;
  studentId: number;
  studentName: string;
  studentIdentifier: string;
  studentEmail: string;
  eventType: SecurityEventType;
  severity: SecurityEventSeverity;
  metadata?: string;
  timestamp: string;
  violationCount: number;
  sessionTerminated: boolean;
}