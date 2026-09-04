import type { SecurityEventType } from "./types";

export type EventCallback = (eventType: SecurityEventType, metadata?: string) => void;

let originalGetDisplayMedia: typeof navigator.mediaDevices.getDisplayMedia | null = null;
let activeScreenStreams: MediaStream[] = [];

/**
 * Wraps navigator.mediaDevices.getDisplayMedia to monitor student screen sharing.
 * Immediately reports SCREEN_SHARE_STARTED upon stream initiation.
 * Monitors track onended to report SCREEN_SHARE_STOPPED upon cessation.
 */
export function initScreenShareMonitor(onEvent: EventCallback): () => void {
  if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    return () => {};
  }

  // Save original if not already patched
  if (!originalGetDisplayMedia) {
    originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
  }

  const patchedGetDisplayMedia = async function (
    constraints?: DisplayMediaStreamOptions
  ): Promise<MediaStream> {
    try {
      if (!originalGetDisplayMedia) {
        throw new Error("getDisplayMedia not available");
      }
      const stream: MediaStream = await originalGetDisplayMedia(constraints);

      // Track active stream
      activeScreenStreams.push(stream);

      // Inspect tracks metadata safely
      const videoTracks = stream.getVideoTracks();
      const trackSettings = videoTracks.length > 0 ? (videoTracks[0].getSettings?.() as any) : null;
      const displaySurface = trackSettings?.displaySurface || "unknown";

      // 1. Trigger SCREEN_SHARE_STARTED immediately
      onEvent("SCREEN_SHARE_STARTED", `displaySurface:${displaySurface};tracks:${videoTracks.length}`);

      // 2. Attach onended listener to all video tracks to detect termination
      videoTracks.forEach((track) => {
        const handleEnded = () => {
          track.removeEventListener("ended", handleEnded);
          // Check if any other video tracks are still active
          const hasRemainingActive = stream.getVideoTracks().some((t) => t.readyState === "live");
          if (!hasRemainingActive) {
            onEvent("SCREEN_SHARE_STOPPED", `displaySurface:${displaySurface}`);
            activeScreenStreams = activeScreenStreams.filter((s) => s !== stream);
          }
        };
        track.addEventListener("ended", handleEnded);
      });

      return stream;
    } catch (err: any) {
      // If user cancelled selection or permission denied
      throw err;
    }
  };

  navigator.mediaDevices.getDisplayMedia = patchedGetDisplayMedia;

  // Return cleanup function
  return () => {
    if (originalGetDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
      originalGetDisplayMedia = null;
    }
    // Stop any residual monitored tracks
    activeScreenStreams.forEach((stream) => {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (_) {}
      });
    });
    activeScreenStreams = [];
  };
}