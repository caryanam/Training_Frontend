import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { LiveLectureJoinResponse } from "@/types/database";
import { Watermark } from "@/components/live/Watermark";
import { LectureSecurityManager } from "@/lib/lectureSecurity/securityEventService";
import type { SecurityPolicyStatus } from "@/lib/lectureSecurity/types";
import {
  LiveKitRoom,
  VideoTrack,
  RoomAudioRenderer,
  useTracks,
  isTrackReference,
  useConnectionState,
  ConnectionState,
  useRoomContext,
  useRemoteParticipants,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track, RoomEvent } from "livekit-client";
import {
  Video,
  Volume2,
  VolumeX,
  LogOut,
  Users,
  ShieldCheck,
  ShieldAlert,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Sparkles,
  Lock,
  CheckCircle2,
  Radio,
  AlertTriangle,
} from "lucide-react";

function getResolvedLivekitUrl(rawUrl?: string): string {
  // Always use the production server URL instead of the local IP returned by the backend
  return "https://livekit.nexorainstitute.in";
}

export default function StudentLiveClassroom() {
  const { lectureId } = useParams<{ lectureId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [joinData, setJoinData] = useState<LiveLectureJoinResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; isAuthError?: boolean } | null>(null);

  const fetchJoinToken = async () => {
    if (!lectureId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.joinLiveLecture(lectureId);
      if (res.success && res.data) {
        setJoinData(res.data);
      } else {
        const errorMsg = res.error || res.message || "Unable to join live lecture.";
        setError({
          message: errorMsg,
          isAuthError: errorMsg.toLowerCase().includes("enroll") || errorMsg.toLowerCase().includes("denied"),
        });
      }
    } catch (err: any) {
      setError({
        message: err.message || "Failed to connect to live lecture server.",
        isAuthError: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJoinToken();
  }, [lectureId]);

  const handleLeave = async () => {
    if (lectureId) {
      try {
        await api.leaveLiveLecture(lectureId);
      } catch (_) {}
    }
    navigate("/student/lectures");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-20 px-4 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-pulse">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Entering Live Classroom...</h2>
          <p className="text-xs text-muted-foreground">Verifying course enrollment & acquiring encrypted stream token</p>
        </div>
      </div>
    );
  }

  if (error || !joinData) {
    return (
      <div className="mx-auto max-w-lg py-16 px-4 text-center space-y-6">
        <div className="rounded-3xl border border-destructive/20 bg-card p-8 shadow-xl space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Lock className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">Access Restricted</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {error?.message || "Could not connect to live lecture."}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={fetchJoinToken}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 cursor-pointer"
            >
              Retry Connection
            </button>
            <button
              type="button"
              onClick={() => navigate("/student/lectures")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Lectures
            </button>
          </div>
        </div>
      </div>
    );
  }

  const resolvedLivekitUrl = getResolvedLivekitUrl(joinData.livekitUrl);

  return (
    <LiveKitRoom
      serverUrl={resolvedLivekitUrl}
      token={joinData.token}
      connect={true}
      video={false}
      audio={false}
      className="space-y-4 select-none"
    >
      <StudentClassroomView
        joinData={joinData}
        lectureId={lectureId!}
        onLeave={handleLeave}
        resolvedUrl={resolvedLivekitUrl}
      />
    </LiveKitRoom>
  );
}

// Inner Classroom View Component
function StudentClassroomView({
  joinData,
  lectureId,
  onLeave,
  resolvedUrl,
}: {
  joinData: LiveLectureJoinResponse;
  lectureId: string;
  onLeave: () => void;
  resolvedUrl: string;
}) {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const [lectureEnded, setLectureEnded] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const [activeWarning, setActiveWarning] = useState<string | null>(null);
  const [policyStatus, setPolicyStatus] = useState<SecurityPolicyStatus | null>(null);
  const [isBlackedOut, setIsBlackedOut] = useState(false);
  const videoCanvasRef = useRef<HTMLDivElement>(null);
  const blackoutOverlayRef = useRef<HTMLDivElement>(null);
  const activeWarningRef = useRef<string | null>(null);

  // Production-safe media capability checks
  const hasMediaDevices =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices;

  const hasUserMedia =
    hasMediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function";

  const hasDisplayMedia =
    hasMediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === "function";

  // Comprehensive LiveKit Room lifecycle event logging on Student side
  useEffect(() => {
    if (!room) return;

    const onConnected = () => {
      console.log("🟢 [Student] LiveKit Room Connected:", {
        roomName: room.name,
        localIdentity: room.localParticipant?.identity,
        serverUrl: resolvedUrl,
      });
    };

    const onDisconnected = (reason?: any) => {
      console.log("🔴 [Student] LiveKit Room Disconnected:", reason);
    };

    const onParticipantConnected = (participant: any) => {
      console.log("👤 [Student] Participant Connected to room:", {
        identity: participant.identity,
        name: participant.name,
      });
    };

    const onParticipantDisconnected = (participant: any) => {
      console.log("👤 [Student] Participant Disconnected from room:", participant.identity);
    };

    const onTrackSubscribed = (track: any, publication: any, participant: any) => {
      console.log("📥 [Student] Track Subscribed from remote participant:", {
        kind: track.kind,
        source: publication?.source,
        from: participant.identity,
        isScreenShare: publication?.source === Track.Source.ScreenShare,
      });
    };

    const onTrackUnsubscribed = (track: any, publication: any, participant: any) => {
      console.log("📤 [Student] Track Unsubscribed:", {
        kind: track.kind,
        source: publication?.source,
        from: participant.identity,
      });
    };

    const onConnectionStateChanged = (state: any) => {
      console.log("🔄 [Student] LiveKit Connection State Changed:", state);
    };

    const onMediaDevicesError = (err: any) => {
      console.error("⚠️ [Student] Media Devices Error:", err);
    };

    room.on(RoomEvent.Connected, onConnected);
    room.on(RoomEvent.Disconnected, onDisconnected);
    room.on(RoomEvent.ParticipantConnected, onParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
    room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
    room.on(RoomEvent.ConnectionStateChanged, onConnectionStateChanged);
    room.on(RoomEvent.MediaDevicesError, onMediaDevicesError);

    return () => {
      room.off(RoomEvent.Connected, onConnected);
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.off(RoomEvent.ParticipantConnected, onParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
      room.off(RoomEvent.TrackSubscribed, onTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
      room.off(RoomEvent.ConnectionStateChanged, onConnectionStateChanged);
      room.off(RoomEvent.MediaDevicesError, onMediaDevicesError);
    };
  }, [room, resolvedUrl]);

  // Keep ref in sync with state so event handlers always see the latest value
  useEffect(() => {
    activeWarningRef.current = activeWarning;
  }, [activeWarning]);

  // --- Synchronous DOM blackout functions (no React state dependency) ---
  const activateBlackoutImmediately = () => {
    const overlay = blackoutOverlayRef.current;
    if (overlay) {
      overlay.style.opacity = "1";
      overlay.style.visibility = "visible";
      overlay.style.pointerEvents = "auto";
    }
  };

  const deactivateBlackout = () => {
    const overlay = blackoutOverlayRef.current;
    if (overlay) {
      overlay.style.opacity = "0";
      overlay.style.visibility = "hidden";
      overlay.style.pointerEvents = "none";
    }
  };

  // Initialize LectureSecurityManager to monitor screen share, visibility, focus, fullscreen
  useEffect(() => {
    // Immediate console diagnostic for media capabilities on student side
    if (typeof window !== "undefined") {
      console.log("=== [StudentClassroom] MEDIA CAPABILITIES DIAGNOSTIC ===", {
        href: window.location.href,
        protocol: window.location.protocol,
        isSecureContext: window.isSecureContext,
        resolvedLivekitUrl: resolvedUrl,
        mediaDevices: typeof navigator !== "undefined" ? typeof navigator.mediaDevices : "undefined",
        getUserMedia: typeof navigator?.mediaDevices?.getUserMedia,
        getDisplayMedia: typeof navigator?.mediaDevices?.getDisplayMedia,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "undefined",
      });
    }

    const manager = new LectureSecurityManager({
      lectureId,
      sessionId: joinData.sessionId,
      onPolicyUpdate: (status) => {
        setPolicyStatus(status);
        if (status.isSuspended || status.warningLevel === "TERMINATED") {
          setIsLockedOut(true);
          setSecurityWarning(
            status.message || "Lecture access suspended: Multiple security policy violations recorded."
          );
          try {
            room?.disconnect();
          } catch (_) {}
        } else if (status.warningLevel === "WARNING" || status.warningLevel === "STRONG_WARNING") {
          setActiveWarning(status.message);
        }
      },
      onSecurityAlert: (eventType, message) => {
        setActiveWarning(message);
      },
    });

    manager.start();

    return () => {
      manager.stop();
    };
  }, [lectureId, joinData.sessionId, room]);

  // Send periodic heartbeat to keep student marked active
  useEffect(() => {
    const hbInterval = setInterval(() => {
      api.sendLiveHeartbeat(lectureId).catch(() => {});
    }, 15000);
    return () => clearInterval(hbInterval);
  }, [lectureId]);

  // Monitor room disconnected / ended events
  useEffect(() => {
    if (!room) return;
    const handleDisconnected = () => {
      setLectureEnded(true);
    };
    room.on("disconnected", handleDisconnected);
    return () => {
      room.off("disconnected", handleDisconnected);
    };
  }, [room]);

  // --- PROTECTION ENGINE ---
  // Uses synchronous DOM manipulation FIRST, then React state updates.
  // blur/visibilitychange = PROTECTION_ACTIVATED (not confirmed recording).
  // Browser-received keyboard shortcuts = SCREEN_RECORDING_ATTEMPT / SCREENSHOT_ATTEMPT.
  useEffect(() => {
    const triggerPermanentLockout = (reason: string) => {
      activateBlackoutImmediately();
      setIsLockedOut(true);
      setSecurityWarning(reason);
      try {
        room?.disconnect();
      } catch (_) {}
    };

    // 1. Blur/Focus — best-effort visual protection
    const handleWindowBlur = () => {
      // Synchronous DOM blackout FIRST
      activateBlackoutImmediately();
      // Then React state
      setIsBlackedOut(true);
    };

    const handleWindowFocus = () => {
      // Only restore if no active warning is blocking
      if (!activeWarningRef.current) {
        deactivateBlackout();
        setIsBlackedOut(false);
      }
    };

    // 2. Visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        activateBlackoutImmediately();
        setIsBlackedOut(true);
      } else {
        if (!activeWarningRef.current) {
          deactivateBlackout();
          setIsBlackedOut(false);
        }
      }
    };

    // 3. Keyboard shortcut interceptor — only for events the browser actually receives
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey;
      const isAlt = e.altKey;
      const isShift = e.shiftKey;
      const key = e.key ? e.key.toLowerCase() : "";
      const code = e.code ? e.code.toLowerCase() : "";

      // Recording shortcuts that the browser CAN receive:
      // Ctrl+Alt+R, Alt+F9, Ctrl+Shift+R
      // NOTE: Win+Alt+R, Win+G are NOT delivered by the OS to the browser.
      const isRecordingShortcut =
        (isCtrl && isAlt && (key === "r" || code === "keyr")) ||
        (isAlt && (code === "f9" || key === "f9")) ||
        (isCtrl && isShift && (key === "r" || code === "keyr"));

      if (isRecordingShortcut) {
        try { e.preventDefault(); e.stopPropagation(); } catch (_) {}
        // Synchronous DOM blackout
        activateBlackoutImmediately();
        setIsBlackedOut(true);
        setActiveWarning(
          "Screen recording shortcut detected. Lecture video has been protected and your instructor has been notified."
        );
        api.reportLectureSecurityEvent(lectureId, {
          lectureId,
          sessionId: joinData.sessionId,
          eventType: "SCREEN_RECORDING_ATTEMPT",
          metadata: `key:${e.key};code:${e.code};ctrl:${isCtrl};alt:${isAlt};shift:${isShift}`,
          timestamp: new Date().toISOString(),
        }).catch(() => {});
        return;
      }

      // Screenshot shortcuts that the browser CAN receive:
      // PrintScreen, Ctrl+Shift+S, Ctrl+P, Ctrl+S
      // NOTE: Win+Shift+S is NOT delivered by the OS to the browser.
      const isScreenshotShortcut =
        key === "printscreen" || code === "printscreen" || key === "snapshot" ||
        (isCtrl && isShift && (key === "s" || code === "keys")) ||
        (isCtrl && (key === "p" || code === "keyp")) ||
        (isCtrl && (key === "s" || code === "keys"));

      if (isScreenshotShortcut) {
        try { e.preventDefault(); e.stopPropagation(); } catch (_) {}
        activateBlackoutImmediately();
        setIsBlackedOut(true);
        setActiveWarning(
          "Screenshot shortcut detected. Lecture video has been protected and your instructor has been notified."
        );
        api.reportLectureSecurityEvent(lectureId, {
          lectureId,
          sessionId: joinData.sessionId,
          eventType: "SCREENSHOT_ATTEMPT",
          metadata: `key:${e.key};code:${e.code}`,
          timestamp: new Date().toISOString(),
        }).catch(() => {});
        return;
      }

      // DevTools: F12 or Ctrl+Shift+I/J/C
      const isDevToolsShortcut =
        key === "f12" || code === "f12" ||
        (isCtrl && isShift && (key === "i" || key === "j" || key === "c"));

      if (isDevToolsShortcut) {
        try { e.preventDefault(); e.stopPropagation(); } catch (_) {}
        triggerPermanentLockout(
          "Developer Tools inspection attempt detected. Live stream access revoked."
        );
      }
    };

    // 4. Block getDisplayMedia from this page context if supported
    if (typeof navigator !== "undefined" && navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === "function") {
      try {
        navigator.mediaDevices.getDisplayMedia = async () => {
          triggerPermanentLockout(
            "Screen capture API call detected. Capturing this live lecture is strictly prohibited."
          );
          throw new DOMException("Screen capture blocked by lecture policy", "NotAllowedError");
        };
      } catch (_) {}
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true } as any);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [room, isLockedOut, lectureId, joinData.sessionId]);

  // Track faculty audio & screen & camera streams (subscribed remote tracks)
  const tracks = useTracks(
    [
      Track.Source.Camera,
      Track.Source.ScreenShare,
      Track.Source.Microphone,
    ],
    { onlySubscribed: false }
  );

  const remoteParticipants = useRemoteParticipants();

  const validTracks = tracks.filter(isTrackReference);
  const remoteScreenTrack = validTracks.find(
    (t) =>
      !t.participant.isLocal &&
      (t.source === Track.Source.ScreenShare || t.publication?.source === Track.Source.ScreenShare) &&
      (t.publication?.isSubscribed || t.publication?.track)
  ) || validTracks.find(
    (t) =>
      !t.participant.isLocal &&
      (t.source === Track.Source.ScreenShare || t.publication?.source === Track.Source.ScreenShare)
  );

  const remoteCameraTrack = validTracks.find(
    (t) =>
      !t.participant.isLocal &&
      (t.source === Track.Source.Camera || t.publication?.source === Track.Source.Camera) &&
      (t.publication?.isSubscribed || t.publication?.track)
  ) || validTracks.find(
    (t) =>
      !t.participant.isLocal &&
      (t.source === Track.Source.Camera || t.publication?.source === Track.Source.Camera)
  );

  const remoteVideoTracks = validTracks.filter(
    (t) => !t.participant.isLocal && (t.publication?.kind === "video" || t.source === Track.Source.ScreenShare || t.source === Track.Source.Camera)
  );

  // Fallback direct check on remote participants if useTracks hasn't updated yet
  let fallbackCameraTrackRef: any = null;
  let fallbackScreenTrackRef: any = null;
  for (const p of remoteParticipants) {
    if (!fallbackScreenTrackRef) {
      const pub = p.getTrackPublication(Track.Source.ScreenShare);
      if (pub && (pub.isSubscribed || pub.track)) {
        fallbackScreenTrackRef = { participant: p, publication: pub, source: Track.Source.ScreenShare };
      }
    }
    if (!fallbackCameraTrackRef) {
      const pub = p.getTrackPublication(Track.Source.Camera);
      if (pub && (pub.isSubscribed || pub.track)) {
        fallbackCameraTrackRef = { participant: p, publication: pub, source: Track.Source.Camera };
      }
    }
  }

  const effectiveScreenTrack = remoteScreenTrack || fallbackScreenTrackRef;
  const effectiveCameraTrack = remoteCameraTrack || fallbackCameraTrackRef;

  // Main canvas: Prefer Screen Share if active, else Faculty Camera if active, else available video track
  const activeMainTrack = effectiveScreenTrack || effectiveCameraTrack || remoteVideoTracks[0];

  const participantCount = room?.numParticipants || joinData.participantCount || 1;

  // PERMANENT SECURITY LOCKOUT STATE
  if (isLockedOut) {
    return (
      <div className="mx-auto max-w-xl py-16 px-4 text-center space-y-6 select-none animate-in zoom-in-95 duration-200">
        <div className="rounded-3xl border-2 border-rose-500/40 bg-card p-8 shadow-2xl space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/30">
            <ShieldAlert className="h-9 w-9" />
          </div>
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-rose-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-rose-500">
              Security Violation Detected
            </span>
            <h2 className="text-xl font-black text-foreground">Live Broadcast Terminated</h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
              {securityWarning || "Screen recording, capture tools, or unauthorized mirroring detected. Live stream was revoked."}
            </p>
          </div>

          <div className="rounded-2xl bg-muted/60 border border-border p-4 text-left space-y-1.5 font-mono text-[11px] text-muted-foreground">
            <div className="flex justify-between">
              <span>Student Name:</span>
              <strong className="text-foreground">{joinData.studentName}</strong>
            </div>
            <div className="flex justify-between">
              <span>Student ID:</span>
              <strong className="text-foreground">{joinData.studentIdentifier}</strong>
            </div>
            <div className="flex justify-between">
              <span>Lecture:</span>
              <span className="text-foreground truncate max-w-[220px]">{joinData.lectureTitle}</span>
            </div>
            <div className="flex justify-between">
              <span>Violation Status:</span>
              <span className="text-rose-500 font-bold">Session Revoked & Logged</span>
            </div>
          </div>

          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            ⚠️ Recording or distributing proprietary classroom materials violates institutional policies and leads to immediate suspension.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={onLeave}
              className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer"
            >
              <ArrowLeft className="inline h-4 w-4 mr-1.5" /> Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (lectureEnded) {
    return (
      <div className="mx-auto max-w-xl py-16 px-4 text-center space-y-6">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-xl space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Live Lecture Has Concluded</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The faculty instructor has ended this live broadcast. Session notes and recording links will be posted under course materials once processed.
          </p>
          <button
            type="button"
            onClick={onLeave}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Return to My Lectures
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none">
      {/* Dynamic Security Watermark Overlay */}
      <Watermark
        studentName={joinData.studentName}
        studentIdentifier={joinData.studentIdentifier}
        lectureTitle={joinData.lectureTitle}
      />

      {/* Automatic High-Fidelity Remote Audio Track Renderer */}
      <RoomAudioRenderer />

      {/* Classroom Header Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
              LIVE CLASSROOM
            </span>
            <span className="text-xs font-semibold text-muted-foreground">{joinData.courseName}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            {joinData.lectureTitle}
          </h1>
          <div className="text-xs text-muted-foreground">
            Instructor: <strong className="text-foreground">{joinData.facultyName}</strong>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Content Protection Active</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-border px-3 py-1.5 text-xs font-semibold text-foreground">
            <Users className="h-4 w-4 text-primary" />
            <span>{participantCount} Students Online</span>
          </div>

          {/* TEST BLACKOUT — development only */}
          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={() => {
                activateBlackoutImmediately();
                setIsBlackedOut(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-rose-500/50 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-500/20 cursor-pointer"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              TEST BLACKOUT
            </button>
          )}

          <button
            type="button"
            onClick={onLeave}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Leave Classroom
          </button>
        </div>
      </div>

      {/* Temporary Development Diagnostic for Media Capabilities */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-3.5 shadow-md text-xs font-mono space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Media Diagnostics (Browser Context)
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${typeof window !== "undefined" && window.isSecureContext ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
            {typeof window !== "undefined" && window.isSecureContext ? "Secure Context (HTTPS/localhost)" : "Insecure Context (HTTP)"}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-[11px] text-slate-300">
          <div>Protocol: <span className="text-emerald-400">{typeof window !== "undefined" ? window.location.protocol : "N/A"}</span></div>
          <div>Secure Context: <span className={typeof window !== "undefined" && window.isSecureContext ? "text-emerald-400" : "text-amber-400"}>{typeof window !== "undefined" ? String(window.isSecureContext) : "false"}</span></div>
          <div>MediaDevices: <span className={hasMediaDevices ? "text-emerald-400" : "text-rose-400"}>{String(hasMediaDevices)}</span></div>
          <div>UserMedia: <span className={hasUserMedia ? "text-emerald-400" : "text-rose-400"}>{String(hasUserMedia)}</span></div>
          <div>DisplayMedia: <span className={hasDisplayMedia ? "text-emerald-400" : "text-rose-400"}>{String(hasDisplayMedia)}</span></div>
        </div>
      </div>

      {/* Main Screen Stream Canvas — VideoTrack is ALWAYS MOUNTED */}
      <div
        ref={videoCanvasRef}
        onContextMenu={(e) => e.preventDefault()}
        className="relative aspect-video w-full rounded-3xl border border-border bg-slate-950 overflow-hidden shadow-2xl flex items-center justify-center select-none"
      >
        {/* LiveKit VideoTrack — always mounted, never conditionally removed */}
        {activeMainTrack ? (
          <VideoTrack
            trackRef={activeMainTrack}
            className={`h-full w-full ${effectiveScreenTrack ? "object-contain" : "object-cover"}`}
          />
        ) : (
          <div className="text-center p-8 space-y-3 max-w-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-4 ring-emerald-500/10 animate-pulse">
              <Radio className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-white">Connecting to Faculty Stream</h3>
              <p className="text-xs text-slate-400">
                You are connected to the live room. Video will appear as soon as {joinData.facultyName} begins streaming or screen sharing.
              </p>
            </div>
          </div>
        )}

        {/* Small Inset Camera Preview when BOTH screen sharing and camera are active */}
        {!isBlackedOut && effectiveScreenTrack && effectiveCameraTrack && (
          <div className="absolute top-4 right-4 h-32 w-48 rounded-2xl border-2 border-emerald-500/40 overflow-hidden shadow-2xl bg-black z-10 animate-in fade-in duration-200">
            <VideoTrack trackRef={effectiveCameraTrack} className="h-full w-full object-cover" />
            <span className="absolute bottom-1 left-2 text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
              {joinData.facultyName}
            </span>
          </div>
        )}

        {/* PERSISTENT BLACKOUT OVERLAY — always in DOM, toggled via inline style */}
        <div
          ref={blackoutOverlayRef}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black transition-none"
          style={{
            zIndex: 9999,
            opacity: isBlackedOut ? 1 : 0,
            visibility: isBlackedOut ? "visible" : "hidden",
            pointerEvents: isBlackedOut ? "auto" : "none",
          }}
        >
          <div className="text-center p-6 space-y-3 max-w-md">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center">
              <ShieldAlert className="h-9 w-9" />
            </div>
            <h4 className="text-base sm:text-lg font-black text-rose-500 tracking-wide uppercase">
              ⚠️ Screen Recording & Capture Prohibited
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Lecture video is temporarily protected. Return focus to this window to resume playback.
            </p>
            <div className="rounded-xl bg-slate-900 border border-white/10 px-4 py-2 font-mono text-[11px] text-slate-400">
              Student ID: <span className="text-white font-bold">{joinData.studentIdentifier}</span> • Protected
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full bg-black/70 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white border border-white/10">
          <span className={`h-2 w-2 rounded-full ${!isBlackedOut && activeMainTrack ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`} />
          <span>
            Stream: {isBlackedOut ? "Protected" : effectiveScreenTrack ? "Live (Screen Share)" : effectiveCameraTrack ? "Live (Camera)" : "Waiting for Faculty"}
          </span>
        </div>
      </div>

      {/* Security Warning Modal */}
      {activeWarning && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="max-w-md w-full rounded-3xl border border-amber-500/40 bg-card p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">
                {activeWarning.toLowerCase().includes("recording")
                  ? "⚠️ Screen Recording Detected"
                  : activeWarning.toLowerCase().includes("screenshot")
                  ? "⚠️ Screenshot Attempt Detected"
                  : "Security Compliance Warning"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {activeWarning}
              </p>
            </div>
            <div className="rounded-2xl bg-muted/50 border border-border p-3.5 text-left space-y-1 font-mono text-[11px] text-muted-foreground">
              <div className="flex justify-between">
                <span>Student:</span>
                <span className="font-bold text-foreground">{joinData.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span>Student ID:</span>
                <span className="font-bold text-foreground">{joinData.studentIdentifier}</span>
              </div>
              <div className="flex justify-between">
                <span>Violation Standing:</span>
                <span className="font-bold text-amber-500">
                  {policyStatus?.violationCount || 1} of 3 Recorded
                </span>
              </div>
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              ⚠️ Screen recording and screenshots are strictly prohibited. The faculty instructor has been notified.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveWarning(null);
                // Restore video only if the window currently has focus
                if (document.hasFocus() && document.visibilityState === "visible") {
                  deactivateBlackout();
                  setIsBlackedOut(false);
                }
              }}
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
            >
              I Understand & Comply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


