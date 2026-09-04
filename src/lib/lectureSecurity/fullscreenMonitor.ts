import type { EventCallback } from "./screenShareMonitor";

/**
 * Monitors fullscreen state changes during protected lectures.
 * Reports FULLSCREEN_EXITED when a student exits fullscreen mode.
 */
export function initFullscreenMonitor(onEvent: EventCallback): () => void {
  if (typeof document === "undefined") {
    return () => {};
  }

  let wasFullscreen = !!document.fullscreenElement;

  const handleFullscreenChange = () => {
    const isFullscreen = !!document.fullscreenElement;
    if (wasFullscreen && !isFullscreen) {
      onEvent("FULLSCREEN_EXITED", "fullscreen:exited");
    }
    wasFullscreen = isFullscreen;
  };

  document.addEventListener("fullscreenchange", handleFullscreenChange);

  return () => {
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
  };
}