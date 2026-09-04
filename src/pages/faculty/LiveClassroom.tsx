import { useState, useEffect, useRef, useTransition } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { LiveLectureStartResponse } from "@/types/database";
import {
  LiveKitRoom,
  useLocalParticipant,
  useRoomContext,
  useConnectionState,
  ConnectionState,
  VideoTrack,
  useTracks,
  isTrackReference,
  type TrackReference,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import {
  Monitor,
  MonitorOff,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Users,
  Radio,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function FacultyLiveClassroom() {
  const { lectureId } = useParams<{ lectureId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState<LiveLectureStartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check initial live status
  useEffect(() => {
    if (!lectureId) return;
    setLoading(true);

    api.getLiveLectureStatus(lectureId)
      .then((res) => {
        if (res.success && res.data && res.data.isLive) {
          // If session is already live, request start to obtain active faculty token
          api.startLiveLecture(lectureId).then((startRes) => {
            if (startRes.success && startRes.data) {
              setSessionData(startRes.data);
            }
          });
        }
      })
      .catch((err) => {
        console.warn("Status fetch error:", err);
      })
      .finally(() => setLoading(false));
  }, [lectureId]);

  const handleStartLecture = async () => {
    if (!lectureId) return;
    setStarting(true);
    setError(null);

    try {
      const res = await api.startLiveLecture(lectureId);
      if (res.success && res.data) {
        setSessionData(res.data);
      } else {
        setError(res.error || res.message || "Failed to start live lecture session.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while starting lecture.");
    } finally {
      setStarting(false);
    }
  };

  const handleEndLecture = async () => {
    if (!lectureId) return;
    if (!window.confirm("Are you sure you want to end this live lecture? All connected students will be disconnected.")) {
      return;
    }

    setEnding(true);
    try {
      await api.endLiveLecture(lectureId);
      setSessionData(null);
      navigate("/faculty/lectures");
    } catch (err: any) {
      alert("Error ending lecture: " + err.message);
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[75vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs font-semibold text-muted-foreground">Initializing live streaming studio...</p>
      </div>
    );
  }

  // Pre-live Stage: Start Broadcast Screen
  if (!sessionData || !sessionData.token) {
    return (
      <div className="mx-auto max-w-3xl py-8 px-4 space-y-6">
        <Link
          to="/faculty/lectures"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Lectures
        </Link>

        <div className="overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-12 text-center shadow-xl space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-8 ring-primary/5">
            <Radio className="h-10 w-10 animate-pulse" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" /> WebRTC SFU Live Studio
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Ready to Broadcast Live Lecture
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When you start the live session, enrolled students will receive an instant notification to join your interactive audio and screen-share stream.
            </p>
          </div>

          {error && (
            <div className="mx-auto max-w-md rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartLecture}
              disabled={starting}
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
            >
              {starting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Secure Room & Token...
                </>
              ) : (
                <>
                  <Radio className="h-4 w-4" />
                  Start Live Lecture Now
                </>
              )}
            </button>
          </div>

          <div className="border-t border-border pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs">
            <div className="rounded-xl bg-muted/40 p-3.5 space-y-1">
              <span className="font-bold text-foreground block">1. Ultra-Low Latency</span>
              <span className="text-muted-foreground text-[11px]">Selective Forwarding Unit (SFU) delivers sub-second WebRTC audio & video.</span>
            </div>
            <div className="rounded-xl bg-muted/40 p-3.5 space-y-1">
              <span className="font-bold text-foreground block">2. Screen & App Share</span>
              <span className="text-muted-foreground text-[11px]">Share full screen, code editors (VS Code), or browser tabs with crystal clarity.</span>
            </div>
            <div className="rounded-xl bg-muted/40 p-3.5 space-y-1">
              <span className="font-bold text-foreground block">3. Anti-Leak Watermark</span>
              <span className="text-muted-foreground text-[11px]">Student feeds carry personalized dynamic overlays for copyright traceability.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Live Stage: Connected LiveKit Room with Faculty Controls
  return (
    <LiveKitRoom
      serverUrl={sessionData.livekitUrl}
      token={sessionData.token}
      connect={true}
      video={false}
      audio={true}
      className="space-y-4"
    >
      <FacultyStudio
        sessionData={sessionData}
        lectureId={lectureId!}
        onEndLecture={handleEndLecture}
        isEnding={ending}
      />
    </LiveKitRoom>
  );
}

// Inner Faculty Studio Component with Active Room Context
function FacultyStudio({
  sessionData,
  lectureId,
  onEndLecture,
  isEnding,
}: {
  sessionData: LiveLectureStartResponse;
  lectureId: string;
  onEndLecture: () => void;
  isEnding: boolean;
}) {
  const room = useRoomContext();
  const { isMicrophoneEnabled, isScreenShareEnabled, isCameraEnabled, localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState();

  const [micActive, setMicActive] = useState(localParticipant.isMicrophoneEnabled);
  const [cameraActive, setCameraActive] = useState(localParticipant.isCameraEnabled);
  const [screenActive, setScreenActive] = useState(localParticipant.isScreenShareEnabled);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [securityEvents, setSecurityEvents] = useState<Array<any>>([]);
  const [activeAlert, setActiveAlert] = useState<any | null>(null);
  const [showViolationsLog, setShowViolationsLog] = useState(false);

  // Real-time security events polling
  useEffect(() => {
    let isMounted = true;
    const fetchSecurityEvents = async () => {
      try {
        const res = await api.getLectureSecurityEvents(lectureId);
        if (res.success && res.data && isMounted) {
          setSecurityEvents(res.data);
          // Check for latest high severity alert
          const highSev = res.data.find(
            (e) => e.severity === "HIGH" || e.severity === "CRITICAL"
          );
          if (highSev) {
            setActiveAlert(highSev);
          }
        }
      } catch (_) {}
    };

    fetchSecurityEvents();
    const interval = setInterval(fetchSecurityEvents, 3500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [lectureId]);

  // Send periodic heartbeat to keep faculty marked active
  useEffect(() => {
    const hbInterval = setInterval(() => {
      api.sendLiveHeartbeat(lectureId).catch(() => {});
    }, 15000);
    return () => clearInterval(hbInterval);
  }, [lectureId]);

  // Lecture session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleScreenShare = async () => {
    try {
      const nextState = !screenActive;
      await localParticipant.setScreenShareEnabled(nextState, { audio: true });
      setScreenActive(localParticipant.isScreenShareEnabled);
    } catch (err: any) {
      console.warn("Screen share toggled/cancelled:", err);
      setScreenActive(localParticipant.isScreenShareEnabled);
    }
  };

  const toggleMicrophone = async () => {
    try {
      const nextState = !micActive;
      await localParticipant.setMicrophoneEnabled(nextState);
      setMicActive(localParticipant.isMicrophoneEnabled);
    } catch (err: any) {
      alert("Microphone permission denied or device unavailable.");
    }
  };

  const toggleCamera = async () => {
    try {
      const nextState = !cameraActive;
      await localParticipant.setCameraEnabled(nextState);
      setCameraActive(localParticipant.isCameraEnabled);
    } catch (err: any) {
      alert("Camera permission denied or device unavailable.");
    }
  };

  // Find local screen share track
  const tracks = useTracks(
    [
      { source: Track.Source.ScreenShare, withPlaceholder: false },
      { source: Track.Source.Camera, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  const validTracks = tracks.filter(isTrackReference);
  const screenTrackRef = validTracks.find((t) => t.source === Track.Source.ScreenShare && t.participant.isLocal);
  const cameraTrackRef = validTracks.find((t) => t.source === Track.Source.Camera && t.participant.isLocal);

  const participantCount = (room?.numParticipants || 1);
  const highRiskCount = securityEvents.filter((e) => e.severity === "HIGH" || e.severity === "CRITICAL").length;

  return (
    <div className="space-y-4">
      {/* Real-Time Security Alert Notification Banner */}
      {activeAlert && (
        <div className="rounded-2xl border-2 border-rose-500/40 bg-rose-500/10 p-4 shadow-lg flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-rose-500 bg-rose-500/20 px-2 py-0.5 rounded">
                  ⚠️ Security Alert
                </span>
                <span className="text-xs font-bold text-foreground">
                  Student: {activeAlert.studentName} ({activeAlert.studentIdentifier})
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Event: <strong className="text-rose-500 dark:text-rose-400">{activeAlert.eventType}</strong> • Time: {activeAlert.timestamp} • Status:{" "}
                <span className="font-bold text-foreground">
                  {activeAlert.sessionTerminated ? "Session Terminated" : `${activeAlert.violationCount}/3 Violations`}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveAlert(null)}
            className="text-xs font-bold text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg border border-border bg-background cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Studio Header Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-xs font-black text-rose-600 dark:text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
              LIVE STREAMING
            </span>
            <span className="text-xs font-bold text-muted-foreground">{sessionData.courseName}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            {sessionData.lectureTitle}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-border px-3 py-1.5 text-xs font-semibold text-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>{formatElapsed(elapsedSeconds)}</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-border px-3 py-1.5 text-xs font-semibold text-foreground">
            <Users className="h-4 w-4 text-emerald-600" />
            <span>{participantCount} In Class</span>
          </div>

          <button
            type="button"
            onClick={() => setShowViolationsLog(!showViolationsLog)}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
              highRiskCount > 0
                ? "bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20"
                : "bg-muted/50 border-border text-foreground hover:bg-muted"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Security Log ({securityEvents.length})</span>
            {highRiskCount > 0 && (
              <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] text-white">
                {highRiskCount}
              </span>
            )}
            {showViolationsLog ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={onEndLecture}
            disabled={isEnding}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <PhoneOff className="h-4 w-4" />
            {isEnding ? "Ending Lecture..." : "End Live Lecture"}
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative aspect-video w-full rounded-3xl border border-border bg-slate-950 overflow-hidden shadow-2xl flex items-center justify-center">
        {screenTrackRef ? (
          <VideoTrack trackRef={screenTrackRef} className="h-full w-full object-contain" />
        ) : (
          <div className="text-center p-8 space-y-4 max-w-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-4 ring-emerald-500/10">
              <Monitor className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Screen Sharing is Currently Paused</h3>
              <p className="text-xs text-slate-400">
                Click <strong className="text-white">"Share Screen"</strong> below to broadcast your code editor, slides, or browser tab to enrolled students.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleScreenShare}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer"
            >
              <Monitor className="h-4 w-4" /> Start Screen Share
            </button>
          </div>
        )}

        {/* Small Inset Camera Preview if enabled */}
        {cameraTrackRef && (
          <div className="absolute top-4 right-4 h-32 w-48 rounded-2xl border-2 border-primary/50 overflow-hidden shadow-2xl bg-black">
            <VideoTrack trackRef={cameraTrackRef} className="h-full w-full object-cover" />
            <span className="absolute bottom-1 left-2 text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
              Faculty Camera
            </span>
          </div>
        )}

        {/* Live Audio Indicator Pill */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full bg-black/70 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white border border-white/10">
          <span className={`h-2 w-2 rounded-full ${micActive ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`} />
          <span>Mic: {micActive ? "Broadcasting" : "Muted"}</span>
          <span className="text-white/30">•</span>
          <span className="text-[11px] text-emerald-400 font-mono">Room: {sessionData.roomName.substring(0, 16)}...</span>
        </div>
      </div>

      {/* Faculty Broadcast Control Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={toggleScreenShare}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-xs ${
            screenActive
              ? "bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-500/30"
              : "bg-muted text-foreground hover:bg-accent border border-border"
          }`}
        >
          {screenActive ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
          {screenActive ? "Stop Screen Share" : "Share Screen"}
        </button>

        <button
          type="button"
          onClick={toggleMicrophone}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-xs ${
            micActive
              ? "bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-500/30"
              : "bg-rose-600 text-white hover:bg-rose-700"
          }`}
        >
          {micActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          {micActive ? "Microphone ON" : "Unmute Microphone"}
        </button>

        <button
          type="button"
          onClick={toggleCamera}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-xs ${
            cameraActive
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-foreground hover:bg-accent border border-border"
          }`}
        >
          {cameraActive ? <VideoOff className="h-4 w-4" /> : <VideoIcon className="h-4 w-4" />}
          {cameraActive ? "Turn Off Camera" : "Camera (Optional)"}
        </button>
      </div>

      {/* Live Security & Violations Log Dashboard */}
      {showViolationsLog && (
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Lecture Security & Violation Log
              </h3>
              <p className="text-xs text-muted-foreground">
                Real-time monitor tracking student screen sharing, window visibility, and session integrity.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-muted-foreground">
              Total Logged: {securityEvents.length}
            </span>
          </div>

          {securityEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
              No security violations recorded for this lecture session. All students are in good compliance standing.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Student</th>
                    <th className="p-3">Event Type</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Violations</th>
                    <th className="p-3">Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {securityEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-foreground">{evt.studentName}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">{evt.studentIdentifier}</div>
                      </td>
                      <td className="p-3 font-mono font-bold">
                        <span className="text-foreground">{evt.eventType}</span>
                        {evt.metadata && (
                          <div className="text-[10px] text-muted-foreground font-sans truncate max-w-[180px]">
                            {evt.metadata}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            evt.severity === "HIGH" || evt.severity === "CRITICAL"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              : evt.severity === "MEDIUM"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                          }`}
                        >
                          {evt.severity}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-muted-foreground whitespace-nowrap">
                        {evt.timestamp}
                      </td>
                      <td className="p-3 font-mono font-bold">
                        <span className={evt.violationCount >= 3 ? "text-rose-500" : "text-foreground"}>
                          {evt.violationCount} / 3
                        </span>
                      </td>
                      <td className="p-3">
                        {evt.sessionTerminated ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-500">
                            Session Terminated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
