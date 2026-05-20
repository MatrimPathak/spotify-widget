"use client";
import { useSearchParams } from "next/navigation";
import { useNowPlaying } from "@/app/lib/useNowPlaying";

export default function NowPlayingTicker() {
  const searchParams = useSearchParams();
  const hidePaused = searchParams.get("hidePaused")?.toLowerCase() === "true";
  const { trackData, localProgress, themeColor, fmt, rgba } = useNowPlaying();

  if (!trackData?.item) return <div />;
  if (!trackData.is_playing && hidePaused) return <div />;

  const { item, is_playing: isPlaying } = trackData;
  const label = `${item.name}   —   ${item.artists.map(a=>a.name).join(", ")}   ♪   ${item.album.name}`;
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div className="relative overflow-hidden select-none transition-all duration-700"
        style={{
          width:"520px", height:"38px", borderRadius:"6px",
          background:"rgba(10,10,10,0.92)",
          border:`1px solid ${rgba(themeColor, isPlaying ? 0.3 : 0.1)}`,
          boxShadow:`0 4px 20px rgba(0,0,0,0.5)`,
          opacity: isPlaying ? 1 : 0.6,
        }}
      >
        {/* Left dot */}
        <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center px-3"
          style={{ borderRight:`1px solid ${rgba(themeColor, isPlaying ? 0.2 : 0.06)}` }}>
          <div className="w-2 h-2 rounded-full transition-all duration-700"
            style={{
              backgroundColor: isPlaying ? themeColor : rgba(themeColor,0.25),
              boxShadow: isPlaying ? `0 0 6px ${rgba(themeColor,0.8)}` : "none",
            }} />
        </div>

        {/* Text: scrolling when playing, static ⏸ when paused */}
        <div className="absolute left-10 right-20 top-0 bottom-0 overflow-hidden flex items-center">
          {isPlaying ? (
            <div className="flex items-center whitespace-nowrap text-[11px] font-semibold text-white/80"
              style={{ animation:"marquee 22s linear infinite" }}>
              <span className="pr-16">{label}</span>
              <span className="pr-16">{label}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px] font-semibold whitespace-nowrap overflow-hidden">
              <span style={{ color: rgba(themeColor,0.4) }}>⏸</span>
              <span className="text-white/35 truncate">{label}</span>
            </div>
          )}
        </div>

        {/* Time */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center px-3"
          style={{ borderLeft:`1px solid ${rgba(themeColor, isPlaying ? 0.2 : 0.06)}` }}>
          <span className="text-[9px] tabular-nums font-black tracking-wider transition-colors duration-700"
            style={{ color: isPlaying ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)" }}>
            {fmt(localProgress)}
          </span>
        </div>

        {/* Progress */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
          <div className="h-full transition-all duration-700"
            style={{ width:`${pct}%`,
              backgroundColor: isPlaying ? themeColor : rgba(themeColor,0.25),
              transition:"width 100ms linear" }} />
        </div>
      </div>
    </div>
  );
}
