import type { SecurityEventType } from "./types";

export type EventCallback = (eventType: SecurityEventType, metadata?: string) => void;

let lastRecordingReportTime = 0;
let lastScreenshotReportTime = 0;
const DEBOUNCE_WINDOW_MS = 2500;

/**
 * Browser-level keyboard protection and prohibited action detector.
 *
 * NOTE ON OS-LEVEL REALITY:
 * Browser JavaScript can only intercept keyboard events that the OS actually delivers to the window.
 * Global OS shortcuts (e.g. Win+G, Win+Shift+S handled before browser routing) may bypass browser events.
 * This module provides best-effort browser-level interception + immediate student alert + audit reporting.
 */
export function initKeyboardProtection(onEvent: EventCallback): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const isCtrl = e.ctrlKey || e.metaKey;
    const isAlt = e.altKey;
    const isShift = e.shiftKey;
    const key = e.key ? e.key.toLowerCase() : "";
    const code = e.code ? e.code.toLowerCase() : "";
    const now = Date.now();

    const platform = typeof navigator !== "undefined" ? navigator.platform : "unknown";

    // 1. SCREEN RECORDING SHORTCUTS
    // - Win + Alt + R (Windows Game Bar recording shortcut)
    // - Ctrl + Alt + R (Common capture shortcut)
    // - Alt + R (AMD Radeon / OBS shortcut)
    // - Win + G (Windows Game Bar overlay)
    // - Alt + F9 (Nvidia GeForce Experience recording)
    // - Ctrl + Shift + R
    const isWinKey = e.metaKey || code === "osleft" || code === "osright" || key === "meta";
    const isRecordingShortcut =
      (isWinKey && isAlt && (key === "r" || code === "keyr")) ||
      (isCtrl && isAlt && (key === "r" || code === "keyr")) ||
      (isAlt && (key === "r" || code === "keyr")) ||
      (isWinKey && (key === "g" || code === "keyg")) ||
      (isWinKey && isAlt && (key === "g" || code === "keyg")) ||
      (isAlt && (code === "f9" || key === "f9")) ||
      (isCtrl && isShift && (key === "r" || code === "keyr"));

    if (isRecordingShortcut) {
      try {
        e.preventDefault();
        e.stopPropagation();
      } catch (_) {}

      // Always trigger immediate UI protection/alert callback (0ms latency)
      onEvent(
        "SCREEN_RECORDING_ATTEMPT",
        `key:${e.key || key};code:${e.code || code};ctrl:${e.ctrlKey};alt:${e.altKey};meta:${e.metaKey};platform:${platform}`
      );
      return;
    }

    // 2. SCREENSHOT & PAGE CAPTURE SHORTCUTS
    // - PrintScreen / Snapshot
    // - Win + Shift + S (Snipping Tool)
    // - Ctrl + Shift + S (Browser screenshot tools)
    // - Ctrl + P (Print / Save PDF)
    // - Ctrl + S (Save page)
    const isPrintScreen =
      key === "printscreen" ||
      code === "printscreen" ||
      key === "snapshot" ||
      (isShift && (e.metaKey || code === "osleft" || code === "osright" || key === "meta") && (key === "s" || code === "keys"));

    const isCaptureShortcut =
      isPrintScreen ||
      (isCtrl && isShift && (key === "s" || code === "keys")) ||
      (isCtrl && (key === "p" || code === "keyp")) ||
      (isCtrl && (key === "s" || code === "keys"));

    if (isCaptureShortcut) {
      try {
        e.preventDefault();
        e.stopPropagation();
      } catch (_) {}

      // Always trigger immediate UI protection/alert callback (0ms latency)
      onEvent(
        "SCREENSHOT_ATTEMPT",
        `key:${e.key || key};code:${e.code || code};ctrl:${e.ctrlKey};alt:${e.altKey};shift:${e.shiftKey};platform:${platform}`
      );
      return;
    }

    // 3. DEVTOOLS & FRAME INSPECTION (F12, Ctrl+Shift+I / J / C)
    const isDevToolsShortcut =
      key === "f12" ||
      code === "f12" ||
      (isCtrl && isShift && (key === "i" || key === "j" || key === "c"));

    if (isDevToolsShortcut) {
      try {
        e.preventDefault();
        e.stopPropagation();
      } catch (_) {}

      if (now - lastScreenshotReportTime > DEBOUNCE_WINDOW_MS) {
        lastScreenshotReportTime = now;
        onEvent(
          "SUSPICIOUS_CAPTURE_ACTIVITY",
          `devtools_attempt:key=${e.key};platform:${platform}`
        );
      }
    }
  };

  // Add capturing listener to intercept before page propagation
  window.addEventListener("keydown", handleKeyDown, { capture: true });

  return () => {
    window.removeEventListener("keydown", handleKeyDown, { capture: true } as any);
  };
}
