"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useNowPlaying } from "@/app/lib/useNowPlaying";
import { useWidgetConfig } from "@/app/lib/useWidgetConfig";

export default function NowPlayingCentered() {
  const searchParams = useSearchParams();
  const hidePaused = searchParams.get("hidePaused")?.toLowerCase() === "true";
  const { trackData, localProgress, themeColor, fmt, rgba } = useNowPlaying();
  const cfg = useWidgetConfig();

  if (!trackData?.item) return <div />;
  if (!trackData.is_playing && hidePaused) return <div />;

  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0,3).map(a=>a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-6">
      <div className="flex flex-col items-center select-none" style={{ width:"220px" }}>
        {/* Album art */}
        <div className="relative w-[180px] h-[180px] rounded-2xl overflow-hidden mb-4 transition-all duration-700"
          style={{
            borderRadius: cfg.radius !== null ? cfg.radius + "px" : "16px",
            boxShadow:`0 20px 60px ${rgba(themeColor, isPlaying ? 0.35 : 0.1)}, 0 8px 20px rgba(0,0,0,0.5)`,
            border:`1px solid ${rgba(themeColor, isPlaying ? 0.2 : 0.06)}`,
            filter: isPlaying ? "none" : "saturate(0.25)",
          }}
        >
          <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" priority />
          {/* Paused overlay: large centered pause icon */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
              <div className="flex gap-3">
                <div className="w-[6px] h-12 bg-white/70 rounded-full" />
                <div className="w-[6px] h-12 bg-white/70 rounded-full" />
              </div>
            </div>
          )}
        </div>

        <h1 className="text-white text-base font-black text-center leading-tight tracking-tight line-clamp-2 mb-1 transition-opacity duration-700"
          style={{ opacity: isPlaying ? 1 : 0.6 }}>
          {item.name}
        </h1>
        <p className="text-[12px] font-semibold text-center truncate w-full mb-4 transition-colors duration-700"
          style={{ color: isPlaying ? themeColor : rgba(themeColor, 0.4) }}>
          {artists}
        </p>

        <div className="w-full flex flex-col gap-1.5">
          <div className="w-full bg-white/10 rounded-full overflow-hidden" style={{ height:"3px" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width:`${pct}%`,
                backgroundColor: isPlaying ? themeColor : rgba(themeColor, 0.3),
                boxShadow: isPlaying ? `0 0 8px ${rgba(themeColor,0.7)}` : "none",
                transition:"width 100ms linear" }} />
          </div>
          <div className="flex justify-between w-full">
            <span className="text-[9px] text-white/35 tabular-nums font-bold">{fmt(localProgress)}</span>
            <span className="text-[9px] text-white/35 tabular-nums font-bold">{fmt(item.duration_ms)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
