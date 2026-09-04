import type { EventCallback } from "./screenShareMonitor";

/**
 * Monitors browser tab visibility and window focus changes.
 * Reports TAB_HIDDEN, TAB_VISIBLE, WINDOW_BLUR, and WINDOW_FOCUS with debouncing.
 */
export function initVisibilityMonitor(onEvent: EventCallback): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  let lastVisibilityState = document.visibilityState;
  let lastFocusState = document.hasFocus();
  let lastEventTime = 0;
  const DEBOUNCE_MS = 1500;

  const handleVisibilityChange = () => {
    const currentState = document.visibilityState;
    const now = Date.now();

    if (currentState !== lastVisibilityState) {
      lastVisibilityState = currentState;
      if (now - lastEventTime > DEBOUNCE_MS) {
        lastEventTime = now;
        if (currentState === "hidden") {
          onEvent("TAB_HIDDEN", "visibilityState:hidden");
        } else if (currentState === "visible") {
          onEvent("TAB_VISIBLE", "visibilityState:visible");
        }
      }
    }
  };

  const handleBlur = () => {
    const now = Date.now();
    if (lastFocusState) {
      lastFocusState = false;
      if (now - lastEventTime > DEBOUNCE_MS) {
        lastEventTime = now;
        onEvent("WINDOW_BLUR", "window.blur");
      }
    }
  };

  const handleFocus = () => {
    const now = Date.now();
    if (!lastFocusState) {
      lastFocusState = true;
      if (now - lastEventTime > DEBOUNCE_MS) {
        lastEventTime = now;
        onEvent("WINDOW_FOCUS", "window.focus");
      }
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("blur", handleBlur);
  window.addEventListener("focus", handleFocus);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("blur", handleBlur);
    window.removeEventListener("focus", handleFocus);
  };
}