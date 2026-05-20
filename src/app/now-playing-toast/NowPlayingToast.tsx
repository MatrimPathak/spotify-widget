"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useNowPlaying } from "@/app/lib/useNowPlaying";

export default function NowPlayingToast() {
  const searchParams = useSearchParams();
  const hidePaused = searchParams.get("hidePaused")?.toLowerCase() === "true";
  const { trackData, localProgress, themeColor, fmt, rgba } = useNowPlaying();

  if (!trackData?.item) return <div />;
  if (!trackData.is_playing && hidePaused) return <div />;

  const { item, is_playing: isPlaying } = trackData;
  const label = `${item.name}  —  ${item.artists.map(a => a.name).join(", ")}`;
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div
        className="relative flex items-center gap-2.5 px-2.5 py-2 rounded-full overflow-hidden select-none transition-all duration-700"
        style={{
          width:"300px",
          background: rgba(themeColor, isPlaying ? 0.12 : 0.05),
          backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
          border:`1px solid ${rgba(themeColor, isPlaying ? 0.3 : 0.12)}`,
          boxShadow:`0 4px 24px ${rgba(themeColor, isPlaying ? 0.15 : 0.04)}`,
          opacity: isPlaying ? 1 : 0.7,
        }}
      >
        {/* Album art */}
        <div className="relative shrink-0 w-7 h-7 rounded-full overflow-hidden"
          style={{ filter: isPlaying ? "none" : "saturate(0.3)" }}>
          <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" />
        </div>

        {/* Text: scrolling when playing, static when paused */}
        <div className="flex-1 overflow-hidden">
          {isPlaying ? (
            <div className="flex whitespace-nowrap text-[11px] font-semibold text-white"
              style={{ animation:"marquee 18s linear infinite" }}>
              <span className="pr-16">{label}</span>
              <span className="pr-16">{label}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/50 truncate">
              <span>⏸</span>
              <span className="truncate">{label}</span>
            </div>
          )}
        </div>

        {/* Right indicator */}
        <div className="shrink-0 flex items-center gap-[2px] h-4 mr-1">
          {isPlaying ? (
            [0.7, 0.9, 0.75, 0.85].map((dur, i) => (
              <div key={i} style={{
                width:"2px", borderRadius:"1px", backgroundColor: themeColor,
                animation:`eq${i+1} ${dur}s ease-in-out infinite alternate`,
              }} />
            ))
          ) : (
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: rgba(themeColor, 0.4) }} />
          )}
        </div>

        <span className="shrink-0 text-[9px] tabular-nums font-bold"
          style={{ color: isPlaying ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)" }}>
          {fmt(localProgress)}
        </span>

        {/* Progress underline */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{
            width:`${pct}%`, backgroundColor: isPlaying ? themeColor : rgba(themeColor, 0.35),
            transition:"width 100ms linear",
          }} />
        </div>
      </div>
    </div>
  );
}
