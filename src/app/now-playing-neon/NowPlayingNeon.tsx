"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useNowPlaying } from "@/app/lib/useNowPlaying";
import { useWidgetConfig } from "@/app/lib/useWidgetConfig";

export default function NowPlayingNeon() {
  const searchParams = useSearchParams();
  const hidePaused = searchParams.get("hidePaused")?.toLowerCase() === "true";
  const { trackData, localProgress, themeColor, fmt, rgba } = useNowPlaying();
  const cfg = useWidgetConfig();

  if (!trackData?.item) return <div />;
  if (!trackData.is_playing && hidePaused) return <div />;

  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0,3).map(a=>a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  // Neon intensity: full when playing, barely flickering on standby
  const neonGlow  = isPlaying ? `0 0 20px ${rgba(themeColor,0.25)}, inset 0 0 40px ${rgba(themeColor,0.04)}` : "none";
  const borderAlpha = isPlaying ? 0.7 : 0.18;

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div className="relative flex items-center gap-4 px-4 py-3 overflow-hidden select-none transition-all duration-700"
        style={{
          width:"400px", borderRadius: cfg.radius !== null ? cfg.radius + "px" : "8px", background:"#050505",
          border:`1px solid ${rgba(themeColor, borderAlpha)}`,
          boxShadow: neonGlow,
        }}
      >
        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none z-20 opacity-20"
          style={{ background:"repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 1px, transparent 1px, transparent 3px)" }} />

        {/* Corner brackets */}
        {[["top-0 left-0","border-t-2 border-l-2"],["top-0 right-0","border-t-2 border-r-2"],
          ["bottom-0 left-0","border-b-2 border-l-2"],["bottom-0 right-0","border-b-2 border-r-2"]].map(([pos,cls],i) => (
          <div key={i} className={`absolute ${pos} w-4 h-4 ${cls} z-10 transition-opacity duration-700`}
            style={{ borderColor: themeColor, opacity: isPlaying ? 1 : 0.25 }} />
        ))}

        {/* Album art */}
        <div className="relative shrink-0 w-[68px] h-[68px] overflow-hidden transition-all duration-700"
          style={{
            borderRadius:"4px",
            border:`1px solid ${rgba(themeColor, isPlaying ? 0.6 : 0.15)}`,
            boxShadow: isPlaying ? `0 0 12px ${rgba(themeColor,0.4)}` : "none",
            filter: isPlaying ? "none" : "saturate(0.1) brightness(0.5)",
          }}
        >
          <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" priority />
          <div className="absolute inset-0 bg-black/20" />
          {/* Paused: static noise overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 opacity-30"
              style={{ background:"repeating-linear-gradient(45deg, rgba(0,0,0,0.5) 0px, transparent 2px, rgba(0,0,0,0.5) 4px)" }} />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0 z-10">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full transition-all duration-700"
              style={{
                backgroundColor: isPlaying ? themeColor : rgba(themeColor,0.3),
                boxShadow: isPlaying ? `0 0 6px ${rgba(themeColor,1)}, 0 0 12px ${rgba(themeColor,0.6)}` : "none",
                animation: isPlaying ? "crt-flicker 3s linear infinite" : "none",
              }} />
            <span className="text-[9px] font-black tracking-[0.25em] uppercase transition-all duration-700"
              style={{
                color: isPlaying ? themeColor : rgba(themeColor,0.3),
                textShadow: isPlaying ? `0 0 8px ${rgba(themeColor,0.8)}` : "none",
              }}>
              {isPlaying ? "Transmitting" : "Standby"}
            </span>
          </div>

          <h1 className="text-[13px] font-black truncate leading-tight tracking-wide transition-all duration-700"
            style={{
              color:"#fff",
              textShadow: isPlaying ? `0 0 10px ${rgba(themeColor,0.5)}` : "none",
              opacity: isPlaying ? 1 : 0.4,
            }}>
            {item.name}
          </h1>
          <p className="text-[11px] font-semibold truncate transition-colors duration-700"
            style={{ color: isPlaying ? rgba(themeColor,0.85) : rgba(themeColor,0.25) }}>{artists}</p>

          <div className="mt-2 flex flex-col gap-1">
            <div className="w-full rounded-none overflow-hidden transition-all duration-700"
              style={{ height:"2px", backgroundColor: rgba(themeColor, isPlaying ? 0.15 : 0.04) }}>
              <div className="h-full transition-all duration-700"
                style={{ width:`${pct}%`,
                  backgroundColor: isPlaying ? themeColor : rgba(themeColor,0.25),
                  boxShadow: isPlaying ? `0 0 8px ${rgba(themeColor,1)}` : "none",
                  transition:"width 100ms linear" }} />
            </div>
            <div className="flex justify-between">
              <span className="text-[9px] tabular-nums font-bold tracking-wider transition-colors duration-700"
                style={{ color: rgba(themeColor, isPlaying ? 0.5 : 0.2) }}>{fmt(localProgress)}</span>
              <span className="text-[9px] tabular-nums font-bold tracking-wider transition-colors duration-700"
                style={{ color: rgba(themeColor, isPlaying ? 0.5 : 0.2) }}>{fmt(item.duration_ms)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
