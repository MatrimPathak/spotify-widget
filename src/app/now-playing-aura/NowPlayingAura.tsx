"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useNowPlaying } from "@/app/lib/useNowPlaying";
import { useWidgetConfig } from "@/app/lib/useWidgetConfig";

export default function NowPlayingAura() {
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
    <div className="relative flex items-end justify-start min-h-screen bg-black overflow-hidden select-none">
      {/* Full-viewport blurred art — desaturates + dims when paused */}
      <div className="absolute inset-0 transition-all duration-1000"
        style={{ filter: isPlaying ? "none" : "saturate(0) brightness(0.4)" }}>
        <Image src={item.album.images[0].url} alt="" fill unoptimized className="object-cover"
          style={{ filter:"blur(48px)", transform:"scale(1.15)", opacity:0.55 }} />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background:`radial-gradient(ellipse at center, ${rgba(darkColor,0.3)} 0%, ${rgba(darkColor,0.85)} 100%)` }} />

      {/* Frosted pill */}
      <div className="relative z-10 m-6 flex items-center gap-3 px-4 py-3 rounded-2xl overflow-hidden transition-all duration-700"
        style={{
          background: rgba(darkColor, isPlaying ? 0.6 : 0.75),
          backdropFilter:"blur(" + (cfg.blur ?? 24) + "px)", WebkitBackdropFilter:"blur(" + (cfg.blur ?? 24) + "px)",
          border:`1px solid ${rgba(themeColor, isPlaying ? 0.25 : 0.08)}`,
          boxShadow:`0 8px 32px rgba(0,0,0,0.4)`,
          borderRadius: cfg.radius !== null ? cfg.radius + "px" : "16px",
          maxWidth:"340px",
        }}
      >
        <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full transition-colors duration-1000"
          style={{ backgroundColor: isPlaying ? themeColor : rgba(themeColor, 0.25) }} />

        <div className="relative shrink-0 w-14 h-14 rounded-xl overflow-hidden ml-1"
          style={{ filter: isPlaying ? "none" : "saturate(0.15)" }}>
          <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" priority />
        </div>

        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {cfg.visualizer ? ([0.7,0.9,0.8,0.65].map((dur,i) => (
              <div key={i} style={{
                width:"2px", borderRadius:"1px",
                backgroundColor: isPlaying ? themeColor : rgba(themeColor,0.3),
                height: isPlaying ? undefined : "2px",
                animation: isPlaying ? `eq${i+1} ${dur}s ease-in-out infinite alternate` : "none",
              }} />
            ))) : null}
            <span className="text-[9px] font-black tracking-[0.18em] uppercase ml-0.5 transition-colors duration-700"
              style={{ color: isPlaying ? themeColor : rgba(themeColor,0.4) }}>
              {isPlaying ? "Now Playing" : "Paused"}
            </span>
          </div>
          <h1 className="text-white text-[13px] font-black truncate leading-tight transition-opacity duration-700"
            style={{ opacity: isPlaying ? 1 : 0.6 }}>{item.name}</h1>
          <p className="text-[11px] font-semibold truncate transition-colors duration-700"
            style={{ color: isPlaying ? themeColor : rgba(themeColor,0.35) }}>{artists}</p>
          <div className="mt-1.5 flex flex-col gap-0.5">
            <div className="w-full bg-white/15 rounded-full overflow-hidden" style={{ height:"2px" }}>
              <div className="h-full rounded-full"
                style={{ width:`${pct}%`,
                  backgroundColor: isPlaying ? themeColor : rgba(themeColor,0.3),
                  transition:"width 100ms linear" }} />
            </div>
            <div className="flex justify-between">
              <span className="text-[8px] text-white/40 tabular-nums font-bold">{fmt(localProgress)}</span>
              <span className="text-[8px] text-white/40 tabular-nums font-bold">{fmt(item.duration_ms)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
