"use client";
import { useNowPlaying } from "@/app/lib/useNowPlaying";

export default function NowPlayingTicker() {
  const { trackData, localProgress, themeColor, fmt, rgba } = useNowPlaying();
  if (!trackData?.item) return <div />;
  const { item, is_playing: isPlaying } = trackData;
  const label = `${item.name}   —   ${item.artists.map((a) => a.name).join(", ")}   ♪   ${item.album.name}`;
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div
        className="relative overflow-hidden select-none"
        style={{
          width: "520px",
          height: "38px",
          borderRadius: "6px",
          background: "rgba(10,10,10,0.92)",
          border: `1px solid ${rgba(themeColor, 0.3)}`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Left: colored pulse dot */}
        <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center px-3"
          style={{ borderRight: `1px solid ${rgba(themeColor, 0.2)}` }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: themeColor,
              boxShadow: isPlaying ? `0 0 6px ${rgba(themeColor, 0.8)}` : "none",
            }}
          />
        </div>

        {/* Scrolling text */}
        <div className="absolute left-10 right-20 top-0 bottom-0 overflow-hidden flex items-center">
          <div
            className="flex items-center whitespace-nowrap text-[11px] font-semibold text-white/80"
            style={{ animation: "marquee 22s linear infinite" }}
          >
            <span className="pr-16">{label}</span>
            <span className="pr-16">{label}</span>
          </div>
        </div>

        {/* Right: time display */}
        <div
          className="absolute right-0 top-0 bottom-0 flex items-center px-3"
          style={{ borderLeft: `1px solid ${rgba(themeColor, 0.2)}` }}
        >
          <span className="text-[9px] text-white/40 tabular-nums font-black tracking-wider">
            {fmt(localProgress)}
          </span>
        </div>

        {/* Progress underline */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
          <div
            className="h-full"
            style={{ width: `${pct}%`, backgroundColor: themeColor, transition: "width 100ms linear" }}
          />
        </div>
      </div>
    </div>
  );
}
