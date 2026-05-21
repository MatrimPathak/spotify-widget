"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useNowPlaying } from "@/app/lib/useNowPlaying";
import { useWidgetConfig } from "@/app/lib/useWidgetConfig";

export default function NowPlayingBanner() {
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
      <div className="relative overflow-hidden select-none transition-all duration-700"
        style={{
          width:"580px", height:"72px", borderRadius: cfg.radius !== null ? cfg.radius + "px" : "16px",
          border:`1px solid ${rgba(themeColor, isPlaying ? 0.15 : 0.05)}`,
          boxShadow:`0 8px 32px rgba(0,0,0,0.5)`,
          opacity: isPlaying ? 1 : 0.65,
        }}
      >
        {/* Blurred art background — desaturates when paused */}
        <div className="absolute inset-0 transition-all duration-700"
          style={{ filter: isPlaying ? "none" : "saturate(0.1) brightness(0.6)" }}>
          <Image src={item.album.images[0].url} alt="" fill unoptimized className="object-cover"
            style={{ filter:"blur(20px)", transform:"scale(1.2)", opacity:0.4 }} />
        </div>

        {/* Gradient */}
        <div className="absolute inset-0"
          style={{ background:`linear-gradient(90deg, ${rgba(darkColor,0.98)} 0%, ${rgba(darkColor,0.85)} 50%, ${rgba(darkColor,0.7)} 100%)` }} />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center gap-4 px-4">
          <div className="relative shrink-0 w-11 h-11 rounded-lg overflow-hidden"
            style={{ filter: isPlaying ? "none" : "saturate(0.2)" }}>
            <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" priority />
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="flex gap-[2px]">
                  <div className="w-[2px] h-3 bg-white/80 rounded-full" />
                  <div className="w-[2px] h-3 bg-white/80 rounded-full" />
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white text-[13px] font-black truncate leading-tight">{item.name}</p>
            <p className="text-[11px] font-semibold truncate transition-colors duration-700"
              style={{ color: isPlaying ? themeColor : rgba(themeColor, 0.4) }}>{artists}</p>
          </div>

          <div className="shrink-0 text-right flex flex-col gap-1 items-end">
            <span className="text-[9px] text-white/40 tabular-nums font-bold">
              {fmt(localProgress)} / {fmt(item.duration_ms)}
            </span>
            <span className="text-[8px] font-black tracking-[0.15em] uppercase transition-colors duration-700"
              style={{ color: isPlaying ? themeColor : rgba(themeColor, 0.4) }}>
              {isPlaying ? "Now Playing" : "⏸ Paused"}
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
          <div className="h-full transition-all duration-700"
            style={{ width:`${pct}%`,
              backgroundColor: isPlaying ? themeColor : rgba(themeColor, 0.3),
              boxShadow: isPlaying ? `0 0 8px ${rgba(themeColor,0.6)}` : "none",
              transition:"width 100ms linear" }} />
        </div>
      </div>
    </div>
  );
}
