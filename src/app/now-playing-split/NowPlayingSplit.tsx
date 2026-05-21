"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useNowPlaying } from "@/app/lib/useNowPlaying";
import { useWidgetConfig } from "@/app/lib/useWidgetConfig";

export default function NowPlayingSplit() {
  const searchParams = useSearchParams();
  const hidePaused = searchParams.get("hidePaused")?.toLowerCase() === "true";
  const { trackData, localProgress, themeColor, darkColor, fmt, rgba } = useNowPlaying();
  const cfg = useWidgetConfig();

  if (!trackData?.item) return <div />;
  if (!trackData.is_playing && hidePaused) return <div />;

  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0,3).map(a=>a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div className="relative flex overflow-hidden select-none transition-opacity duration-700"
        style={{
          width:"400px", height:"120px", borderRadius: cfg.radius !== null ? cfg.radius + "px" : "18px",
          boxShadow:`0 12px 40px rgba(0,0,0,0.6)`,
          border:`1px solid rgba(255,255,255,0.06)`,
          opacity: isPlaying ? 1 : 0.7,
        }}
      >
        {/* Left: colored panel — grayscale when paused */}
        <div className="relative shrink-0 flex items-center justify-center transition-all duration-700"
          style={{
            width:"150px",
            background: isPlaying
              ? `linear-gradient(135deg, ${themeColor}, ${rgba(themeColor,0.6)})`
              : "linear-gradient(135deg, #444, #2a2a2a)",
          }}
        >
          <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-xl"
            style={{ filter: isPlaying ? "none" : "saturate(0)" }}>
            <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" priority />
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="flex gap-[3px]">
                  <div className="w-[3px] h-4 bg-white/80 rounded-full" />
                  <div className="w-[3px] h-4 bg-white/80 rounded-full" />
                </div>
              </div>
            )}
          </div>
          <div className="absolute inset-0 opacity-20"
            style={{ background:"linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)" }} />
        </div>

        {/* Right: dark info panel */}
        <div className="flex-1 flex flex-col justify-center px-4 gap-1"
          style={{ background: rgba(darkColor, 0.97) }}>
          <span className="text-[9px] font-black tracking-[0.2em] uppercase transition-colors duration-700"
            style={{ color: isPlaying ? themeColor : rgba(themeColor, 0.35) }}>
            {isPlaying ? "Now Playing" : "Paused"}
          </span>
          <h1 className="text-white text-[13px] font-black truncate leading-tight">{item.name}</h1>
          <p className="text-[11px] font-semibold truncate transition-colors duration-700"
            style={{ color: isPlaying ? rgba(themeColor,0.8) : rgba(themeColor,0.3) }}>{artists}</p>
          <div className="mt-1 flex flex-col gap-0.5">
            <div className="w-full bg-white/10 rounded-full overflow-hidden" style={{ height:"2px" }}>
              <div className="h-full rounded-full"
                style={{ width:`${pct}%`,
                  backgroundColor: isPlaying ? themeColor : rgba(themeColor,0.3),
                  transition:"width 100ms linear" }} />
            </div>
            <div className="flex justify-between">
              <span className="text-[8px] text-white/30 tabular-nums font-bold">{fmt(localProgress)}</span>
              <span className="text-[8px] text-white/30 tabular-nums font-bold">{fmt(item.duration_ms)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
