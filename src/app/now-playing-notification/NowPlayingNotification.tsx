"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useNowPlaying } from "@/app/lib/useNowPlaying";
import { useWidgetConfig } from "@/app/lib/useWidgetConfig";

export default function NowPlayingNotification() {
  const searchParams = useSearchParams();
  const hidePaused = searchParams.get("hidePaused")?.toLowerCase() === "true";
  const { trackData, localProgress, themeColor, darkColor, fmt, rgba } = useNowPlaying();
  const cfg = useWidgetConfig();

  if (!trackData?.item) return <div />;
  if (!trackData.is_playing && hidePaused) return <div />;

  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0,2).map(a=>a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div className="relative select-none overflow-hidden transition-all duration-700"
        style={{
          width:"320px", borderRadius: cfg.radius !== null ? cfg.radius + "px" : "20px",
          background: rgba(darkColor, cfg.bgOpacity ?? 0.92),
          backdropFilter:"blur(" + (cfg.blur ?? 40) + "px)", WebkitBackdropFilter:"blur(" + (cfg.blur ?? 40) + "px)",
          border:`1px solid ${isPlaying ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}`,
          boxShadow:"0 12px 40px rgba(0,0,0,0.5)",
          opacity: isPlaying ? 1 : 0.72,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-1.5">
          <div className="w-3.5 h-3.5 rounded-sm flex items-center justify-center"
            style={{ backgroundColor: isPlaying ? themeColor : rgba(themeColor, 0.35) }}>
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
          <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wide">Spotify</span>
          <span className="text-[10px] text-white/25 ml-auto">{isPlaying ? "Now" : "Paused"}</span>
        </div>

        {/* Body */}
        <div className="flex items-center gap-3 px-4 pb-3">
          <div className="relative shrink-0 w-[52px] h-[52px] rounded-xl overflow-hidden shadow-lg"
            style={{ filter: isPlaying ? "none" : "saturate(0.3)" }}>
            <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" />
            {/* Paused icon overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="flex gap-[3px]">
                  <div className="w-[3px] h-4 bg-white/80 rounded-full" />
                  <div className="w-[3px] h-4 bg-white/80 rounded-full" />
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black text-white truncate leading-tight">{item.name}</p>
            <p className="text-[11px] font-medium truncate mt-0.5 transition-colors duration-700"
              style={{ color: isPlaying ? themeColor : rgba(themeColor, 0.45) }}>{artists}</p>
            <p className="text-[10px] text-white/35 truncate">{item.album.name}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="h-[3px] overflow-hidden" style={{ backgroundColor:"rgba(255,255,255,0.06)" }}>
          <div className="h-full transition-all duration-700"
            style={{ width:`${pct}%`, backgroundColor: isPlaying ? themeColor : rgba(themeColor, 0.3), transition:"width 100ms linear" }} />
        </div>
        <div className="flex justify-between px-4 py-1.5">
          <span className="text-[9px] text-white/30 tabular-nums font-bold">{fmt(localProgress)}</span>
          <span className="text-[9px] text-white/30 tabular-nums font-bold">{fmt(item.duration_ms)}</span>
        </div>
      </div>
    </div>
  );
}
