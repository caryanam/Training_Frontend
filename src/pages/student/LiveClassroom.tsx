import { useState, useEffect, useRef } from "react";
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
import { Track } from "livekit-client";
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

  return (
    <LiveKitRoom
      serverUrl={joinData.livekitUrl}
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
      />
    </LiveKitRoom>
  );
}

// Inner Classroom View Component
function StudentClassroomView({
  joinData,
  lectureId,
  onLeave,
}: {
  joinData: LiveLectureJoinResponse;
  lectureId: string;
  onLeave: () => void;
}) {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const [lectureEnded, setLectureEnded] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const [activeWarning, setActiveWarning] = useState<string | null>(null);
  const [policyStatus, setPolicyStatus] = useState<SecurityPolicyStatus | null>(null);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const videoCanvasRef = useRef<HTMLDivElement>(null);

  // Initialize LectureSecurityManager to monitor screen share, visibility, focus, fullscreen
  useEffect(() => {
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


  // --- ULTRA-FAST PERMANENT ANTI-SCREEN RECORDING & CAPTURE LOCKDOWN ENGINE ---
  useEffect(() => {
    let animFrameId: number;

    const applyDirectBlackout = () => {
      if (videoCanvasRef.current) {
        videoCanvasRef.current.style.filter = "brightness(0) blur(40px)";
        videoCanvasRef.current.style.backgroundColor = "#000";
        const videos = videoCanvasRef.current.querySelectorAll("video");
        videos.forEach((v) => {
          v.style.filter = "brightness(0) blur(50px)";
          v.style.opacity = "0";
          v.style.visibility = "hidden";
        });
      }
    };

    const removeDirectBlackout = () => {
      if (videoCanvasRef.current) {
        videoCanvasRef.current.style.filter = "";
        videoCanvasRef.current.style.backgroundColor = "";
        const videos = videoCanvasRef.current.querySelectorAll("video");
        videos.forEach((v) => {
          v.style.filter = "";
          v.style.opacity = "";
          v.style.visibility = "";
        });
      }
    };

    const triggerPermanentLockout = (reason: string) => {
      setIsLockedOut(true);
      setSecurityWarning(reason);
      applyDirectBlackout();
      try {
        if (videoCanvasRef.current) {
          videoCanvasRef.current.style.display = "none";
        }
        room?.disconnect();
      } catch (_) {}
    };

    // 1. Visibility and Focus Sentinel (Instant Blackout on focus loss / overlay)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        applyDirectBlackout();
        setIsWindowBlurred(true);
      } else {
        if (!activeWarning) {
          removeDirectBlackout();
          setIsWindowBlurred(false);
        }
      }
    };

    const handleWindowBlur = () => {
      applyDirectBlackout();
      setIsWindowBlurred(true);
    };

    const handleWindowFocus = () => {
      if (!activeWarning) {
        removeDirectBlackout();
        setIsWindowBlurred(false);
      }
    };

    // 2. Strict Screen Capture / PrintScreen / Recording Hotkeys Interceptor
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey;
      const isAlt = e.altKey;
      const isShift = e.shiftKey;
      const key = e.key ? e.key.toLowerCase() : "";
      const code = e.code ? e.code.toLowerCase() : "";
      const isWinKey = e.metaKey || code === "osleft" || code === "osright" || key === "meta";

      // Recording Hotkeys: Win+Alt+R, Ctrl+Alt+R, Alt+R, Win+G, Alt+F9, Ctrl+Shift+R
      const isRecordingHotkey =
        (isWinKey && isAlt && (key === "r" || code === "keyr")) ||
        (isCtrl && isAlt && (key === "r" || code === "keyr")) ||
        (isAlt && (key === "r" || code === "keyr")) ||
        (isWinKey && (key === "g" || code === "keyg")) ||
        (isWinKey && isAlt && (key === "g" || code === "keyg")) ||
        (isAlt && (code === "f9" || key === "f9")) ||
        (isCtrl && isShift && (key === "r" || code === "keyr"));

      if (isRecordingHotkey) {
        try {
          e.preventDefault();
          e.stopPropagation();
        } catch (_) {}
        applyDirectBlackout();
        setIsWindowBlurred(true);
        setActiveWarning(
          "Screen recording is not allowed during this lecture. Your recording attempt has been blocked, video content blacked out, and your instructor notified."
        );
        api.reportLectureSecurityEvent(lectureId, {
          lectureId,
          sessionId: joinData.sessionId,
          eventType: "SCREEN_RECORDING_ATTEMPT",
          metadata: `key:${e.key || key};code:${e.code || code};alt:${e.altKey};meta:${e.metaKey}`,
          timestamp: new Date().toISOString(),
        }).catch(() => {});
        return;
      }

      // Screenshot Hotkeys: PrintScreen, Win+Shift+S, Ctrl+Shift+S, Ctrl+P, Ctrl+S
      const isScreenshotHotkey =
        key === "printscreen" ||
        code === "printscreen" ||
        key === "snapshot" ||
        (isShift && (isWinKey || isCtrl) && (key === "s" || code === "keys")) ||
        (isCtrl && (key === "p" || code === "keyp")) ||
        (isCtrl && (key === "s" || code === "keys"));

      if (isScreenshotHotkey) {
        try {
          e.preventDefault();
          e.stopPropagation();
        } catch (_) {}
        applyDirectBlackout();
        setIsWindowBlurred(true);
        setActiveWarning(
          "Screenshots are not allowed during this lecture. Your attempt has been blocked and your instructor notified."
        );
        api.reportLectureSecurityEvent(lectureId, {
          lectureId,
          sessionId: joinData.sessionId,
          eventType: "SCREENSHOT_ATTEMPT",
          metadata: `key:${e.key || key};code:${e.code || code}`,
          timestamp: new Date().toISOString(),
        }).catch(() => {});
        return;
      }

      // DevTools: F12 or Ctrl+Shift+I / J / C
      if (
        key === "f12" ||
        code === "f12" ||
        ((isCtrl || isWinKey) &&
          isShift &&
          (key === "i" || key === "j" || key === "c"))
      ) {
        try {
          e.preventDefault();
          e.stopPropagation();
        } catch (_) {}
        triggerPermanentLockout(
          "Developer Tools & Video Stream Inspection attempt detected. Live stream access revoked."
        );
      }
    };

    // 3. Continuous Clipboard Neutralizer
    const clipInterval = setInterval(() => {
      try {
        navigator.clipboard?.writeText("⚠️ SCREEN RECORDING & CAPTURE IS PROHIBITED BY COPYRIGHT DRM").catch(() => {});
      } catch (_) {}
    }, 400);

    // 4. Browser Display Media Interceptor (Block browser extension recording)
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      try {
        navigator.mediaDevices.getDisplayMedia = async () => {
          triggerPermanentLockout(
            "Screen capture and recording software detected. Capturing this live lecture is strictly prohibited."
          );
          throw new DOMException("Screen capture blocked by DRM policy", "NotAllowedError");
        };
      } catch (_) {}
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("mouseleave", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(clipInterval);
      window.removeEventListener("keydown", handleKeyDown, { capture: true } as any);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("mouseleave", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [room, isLockedOut, lectureId, joinData.sessionId]);

  // Track faculty audio & screen streams
  const tracks = useTracks(
    [
      { source: Track.Source.ScreenShare, withPlaceholder: false },
      { source: Track.Source.Camera, withPlaceholder: false },
      { source: Track.Source.Microphone, withPlaceholder: false },
      { source: Track.Source.Unknown, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const validTracks = tracks.filter(isTrackReference);
  const remoteScreenTrack = validTracks.find(
    (t) => (t.source === Track.Source.ScreenShare || t.publication?.source === Track.Source.ScreenShare) && !t.participant.isLocal
  );
  const remoteCameraTrack = validTracks.find(
    (t) => (t.source === Track.Source.Camera || t.publication?.source === Track.Source.Camera) && !t.participant.isLocal
  );
  const remoteVideoTracks = validTracks.filter(
    (t) => !t.participant.isLocal && (t.publication?.kind === "video" || t.source === Track.Source.ScreenShare || t.source === Track.Source.Camera)
  );
  const activeMainTrack = remoteScreenTrack || remoteVideoTracks[0] || remoteCameraTrack;

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
            <span>Anti-Recording DRM Active</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-border px-3 py-1.5 text-xs font-semibold text-foreground">
            <Users className="h-4 w-4 text-primary" />
            <span>{participantCount} Students Online</span>
          </div>

          <button
            type="button"
            onClick={onLeave}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Leave Classroom
          </button>
        </div>
      </div>

      {/* Main Screen Stream Canvas with DRM Viewport Mask */}
      <div
        ref={videoCanvasRef}
        onContextMenu={(e) => e.preventDefault()}
        className="relative aspect-video w-full rounded-3xl border border-border bg-slate-950 overflow-hidden shadow-2xl flex items-center justify-center select-none"
      >
        {/* Pitch-Black Content Shield on Focus Loss / Screen Recording Overlay */}
        {(isWindowBlurred || Boolean(activeWarning)) ? (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black p-6 space-y-3 text-center animate-in fade-in duration-100">
            <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center">
              <ShieldAlert className="h-9 w-9 animate-pulse" />
            </div>
            <div className="space-y-1 max-w-md">
              <h4 className="text-base sm:text-lg font-black text-rose-500 tracking-wide uppercase">
                ⚠️ Screen Recording & Capture Prohibited
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Lecture video is blacked out by DRM protection to prevent unauthorized screen recording or background capture. Return focus to this lecture window to resume playback.
              </p>
            </div>
            <div className="rounded-xl bg-slate-900 border border-white/10 px-4 py-2 font-mono text-[11px] text-slate-400">
              Student ID: <span className="text-white font-bold">{joinData.studentIdentifier}</span> • Copyright Protected
            </div>
          </div>
        ) : activeMainTrack ? (
          <div className="relative h-full w-full flex items-center justify-center">
            <VideoTrack
              trackRef={activeMainTrack}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="text-center p-8 space-y-3 max-w-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-4 ring-emerald-500/10 animate-pulse">
              <Radio className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-white">Connecting to Faculty Stream</h3>
              <p className="text-xs text-slate-400">
                You are connected to the live room. Video will appear as soon as {joinData.facultyName} begins screen sharing.
              </p>
            </div>
          </div>
        )}

        {/* Small Inset Camera Preview if faculty has camera enabled alongside screen share */}
        {!isWindowBlurred && !activeWarning && remoteScreenTrack && remoteCameraTrack && (
          <div className="absolute top-4 right-4 h-32 w-48 rounded-2xl border-2 border-emerald-500/40 overflow-hidden shadow-2xl bg-black">
            <VideoTrack trackRef={remoteCameraTrack} className="h-full w-full object-cover" />
            <span className="absolute bottom-1 left-2 text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
              {joinData.facultyName}
            </span>
          </div>
        )}

        {/* Bottom Status Bar */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full bg-black/70 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white border border-white/10">
          <span className={`h-2 w-2 rounded-full ${!isWindowBlurred && !activeWarning && activeMainTrack ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`} />
          <span>Stream: {isWindowBlurred || activeWarning ? "Content Masked (DRM)" : activeMainTrack ? "Live Broadcast Active" : "Waiting for Screen Share"}</span>
          <span className="text-white/30">•</span>
          <span className="text-white/80 font-mono text-[11px]">DRM: Active</span>
        </div>
      </div>

      {/* Screen Sharing / Browser Security Compliance Warning Modal */}
      {activeWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-100">
          <div className="max-w-md w-full rounded-3xl border border-amber-500/40 bg-card p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <AlertTriangle className="h-8 w-8 animate-pulse" />
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
              ⚠️ Screen recording and screenshots are strictly prohibited. The faculty instructor has been notified in real time.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveWarning(null);
                if (document.hasFocus()) {
                  setIsWindowBlurred(false);
                  if (videoCanvasRef.current) {
                    videoCanvasRef.current.style.filter = "";
                    videoCanvasRef.current.style.backgroundColor = "";
                    const videos = videoCanvasRef.current.querySelectorAll("video");
                    videos.forEach((v) => {
                      v.style.filter = "";
                      v.style.opacity = "";
                      v.style.visibility = "";
                    });
                  }
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


