import { useState, useEffect } from "react";

interface WatermarkProps {
  studentName: string;
  studentIdentifier: string;
  lectureTitle?: string;
}

export function Watermark({ studentName, studentIdentifier, lectureTitle }: WatermarkProps) {
  const [timestamp, setTimestamp] = useState(new Date());
  const [position, setPosition] = useState({ top: "20%", left: "25%" });
  const [secondPosition, setSecondPosition] = useState({ top: "70%", left: "65%" });

  // Update real-time clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimestamp(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Periodically drift dual watermark badges every 8 seconds to prevent cropping / obscuring
  useEffect(() => {
    const positions1 = [
      { top: "12%", left: "15%" },
      { top: "55%", left: "20%" },
      { top: "25%", left: "55%" },
      { top: "70%", left: "50%" },
      { top: "18%", left: "40%" },
      { top: "45%", left: "30%" },
      { top: "60%", left: "75%" },
    ];

    const positions2 = [
      { top: "75%", left: "60%" },
      { top: "20%", left: "70%" },
      { top: "65%", left: "15%" },
      { top: "15%", left: "45%" },
      { top: "80%", left: "25%" },
      { top: "35%", left: "65%" },
      { top: "50%", left: "45%" },
    ];

    let idx = 0;
    const positionInterval = setInterval(() => {
      idx = (idx + 1) % positions1.length;
      setPosition(positions1[idx]);
      setSecondPosition(positions2[idx]);
    }, 8000);

    return () => clearInterval(positionInterval);
  }, []);

  const formattedDate = timestamp.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedTime = timestamp.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <>
      {/* 1. Ultra-Dense Diagonal Forensic Watermark Matrix across all coordinates */}
      <div className="pointer-events-none select-none absolute inset-0 z-20 overflow-hidden opacity-[0.12] dark:opacity-[0.14] flex flex-wrap gap-x-16 gap-y-12 p-4 items-center justify-around rotate-[-15deg] scale-125">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="flex flex-col text-center font-mono text-[11px] font-black uppercase text-foreground leading-tight tracking-wider">
            <span>{studentName}</span>
            <span className="text-primary">{studentIdentifier}</span>
            <span className="text-[9px] text-muted-foreground">{formattedTime}</span>
          </div>
        ))}
      </div>

      {/* 2. Floating High-Contrast Badge #1 (Primary) */}
      <div
        className="pointer-events-none select-none absolute z-30 transition-all duration-1000 ease-in-out"
        style={{ top: position.top, left: position.left }}
      >
        <div className="rounded-xl border border-white/20 bg-black/75 px-3.5 py-2 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col text-[11px] font-mono font-bold tracking-wider text-white/70 uppercase space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-white font-sans font-black text-xs tracking-tight">{studentName}</span>
            </div>
            <span className="text-emerald-400 font-bold">ID: {studentIdentifier}</span>
            {lectureTitle && (
              <span className="max-w-[220px] truncate text-[10px] text-white/50">
                {lectureTitle}
              </span>
            )}
            <span className="text-[10px] text-white/60 font-mono">
              {formattedDate} • {formattedTime}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Floating High-Contrast Badge #2 (Secondary Opposite Vector) */}
      <div
        className="pointer-events-none select-none absolute z-30 transition-all duration-1000 ease-in-out"
        style={{ top: secondPosition.top, left: secondPosition.left }}
      >
        <div className="rounded-xl border border-rose-500/30 bg-black/75 px-3 py-1.5 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-white/80">
            <span className="text-rose-400 font-black">SEC-DRM</span>
            <span>{studentIdentifier}</span>
            <span className="text-emerald-400">{formattedTime}</span>
          </div>
        </div>
      </div>
    </>
  );
}


