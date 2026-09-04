import { api } from "@/lib/api";
import { initScreenShareMonitor } from "./screenShareMonitor";
import { initVisibilityMonitor } from "./visibilityMonitor";
import { initFullscreenMonitor } from "./fullscreenMonitor";
import type { SecurityEventType, SecurityPolicyStatus } from "./types";

export interface SecurityMonitoringOptions {
  lectureId: string;
  sessionId?: number;
  onPolicyUpdate?: (status: SecurityPolicyStatus) => void;
  onSecurityAlert?: (eventType: SecurityEventType, message: string) => void;
}

export class LectureSecurityManager {
  private lectureId: string;
  private sessionId?: number;
  private onPolicyUpdate?: (status: SecurityPolicyStatus) => void;
  private onSecurityAlert?: (eventType: SecurityEventType, message: string) => void;
  private cleanups: Array<() => void> = [];
  private isDestroyed = false;
  private isReporting = false;
  private eventQueue: Array<{ eventType: SecurityEventType; metadata?: string }> = [];

  constructor(options: SecurityMonitoringOptions) {
    this.lectureId = options.lectureId;
    this.sessionId = options.sessionId;
    this.onPolicyUpdate = options.onPolicyUpdate;
    this.onSecurityAlert = options.onSecurityAlert;
  }

  /**
   * Initializes all browser security monitors
   */
  public start(): void {
    if (this.isDestroyed) return;

    const handleEvent = (eventType: SecurityEventType, metadata?: string) => {
      this.reportEvent(eventType, metadata);
    };

    // 1. Hook Screen Sharing Monitor (getDisplayMedia)
    const cleanupScreenShare = initScreenShareMonitor(handleEvent);
    this.cleanups.push(cleanupScreenShare);

    // 2. Hook Visibility & Window Focus Monitor
    const cleanupVisibility = initVisibilityMonitor(handleEvent);
    this.cleanups.push(cleanupVisibility);

    // 3. Hook Fullscreen Monitor
    const cleanupFullscreen = initFullscreenMonitor(handleEvent);
    this.cleanups.push(cleanupFullscreen);

    // 4. Initial Policy Status Check
    this.checkCurrentPolicy();
  }

  /**
   * Reports a security event to the backend API
   */
  public async reportEvent(eventType: SecurityEventType, metadata?: string): Promise<void> {
    if (this.isDestroyed) return;

    // High severity events trigger immediate local alert callback
    if (eventType === "SCREEN_SHARE_STARTED") {
      this.onSecurityAlert?.(
        eventType,
        "Screen sharing is not permitted during live lectures. This violation has been recorded."
      );
    } else if (eventType === "MULTIPLE_SESSION_DETECTED") {
      this.onSecurityAlert?.(
        eventType,
        "Multiple active sessions detected. Only one active session is permitted."
      );
    }

    try {
      const res = await api.reportLectureSecurityEvent(this.lectureId, {
        lectureId: this.lectureId,
        sessionId: this.sessionId,
        eventType,
        metadata,
        timestamp: new Date().toISOString(),
      });

      if (res.success && res.data) {
        this.onPolicyUpdate?.(res.data);
      }
    } catch (err: any) {
      // Non-blocking fail-safe: log for telemetry without crashing UI
      console.warn(`[LectureSecurity] Event reporting ${eventType} failed:`, err?.message);
    }
  }

  /**
   * Polls or checks the current policy status
   */
  public async checkCurrentPolicy(): Promise<void> {
    if (this.isDestroyed) return;
    try {
      const res = await api.getLectureSecurityPolicy(this.lectureId);
      if (res.success && res.data) {
        this.onPolicyUpdate?.(res.data);
      }
    } catch (_) {}
  }

  /**
   * Cleans up all monitors and listeners
   */
  public stop(): void {
    this.isDestroyed = true;
    this.cleanups.forEach((cleanup) => {
      try {
        cleanup();
      } catch (_) {}
    });
    this.cleanups = [];
    this.eventQueue = [];
  }
}