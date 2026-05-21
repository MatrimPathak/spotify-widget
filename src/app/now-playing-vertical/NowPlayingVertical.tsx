"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useNowPlaying } from "@/app/lib/useNowPlaying";
import { useWidgetConfig } from "@/app/lib/useWidgetConfig";

export default function NowPlayingVertical() {
  const searchParams = useSearchParams();
  const hidePaused = searchParams.get("hidePaused")?.toLowerCase() === "true";
  const { trackData, localProgress, themeColor, darkColor, fmt, rgba } = useNowPlaying();
  const cfg = useWidgetConfig();

  if (!trackData?.item) return <div />;
  if (!trackData.is_playing && hidePaused) return <div />;

  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0,2).map(a=>a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  const eqAnims = [
    { dur:"0.7s", max:"8px" },{ dur:"0.9s", max:"14px" },{ dur:"0.8s", max:"10px" },
    { dur:"0.65s", max:"12px" },{ dur:"0.75s", max:"16px" },
  ];

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div className="relative flex flex-col overflow-hidden select-none transition-opacity duration-700"
        style={{
          width:"210px", borderRadius: cfg.radius !== null ? cfg.radius + "px" : "20px",
          background:`linear-gradient(180deg, ${rgba(darkColor, cfg.bgOpacity ?? 0.96)} 0%, #0d0d0d 100%)`,
          border:`1px solid ${rgba(themeColor, isPlaying ? 0.2 : 0.06)}`,
          boxShadow:`0 16px 48px ${rgba(darkColor,0.8)}`,
          opacity: isPlaying ? 1 : 0.65,
        }}
      >
        {/* Album art */}
        <div className="relative w-full aspect-square overflow-hidden transition-all duration-700"
          style={{ filter: isPlaying ? "none" : "saturate(0.2)" }}>
          <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" priority />
          <div className="absolute inset-0"
            style={{ background:`linear-gradient(to bottom, transparent 60%, ${rgba(darkColor,0.95)} 100%)` }} />
          {/* Badge */}
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-[8px] font-black tracking-widest uppercase"
            style={{
              backgroundColor: rgba(darkColor, 0.7), backdropFilter:"blur(8px)",
              color: isPlaying ? themeColor : rgba(themeColor,0.4),
              border:`1px solid ${rgba(themeColor, isPlaying ? 0.3 : 0.1)}`,
            }}>
            {isPlaying ? "Playing" : "Paused"}
          </div>
          {/* Paused: large centered pause icon on art */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-3">
                <div className="w-[5px] h-10 bg-white/55 rounded-full" />
                <div className="w-[5px] h-10 bg-white/55 rounded-full" />
              </div>
            </div>
          )}
        </div>

        <div className="px-4 pt-2 pb-2 flex flex-col gap-0.5">
          <h1 className="text-white text-[13px] font-black truncate leading-tight tracking-tight">{item.name}</h1>
          <p className="text-[11px] font-semibold truncate transition-colors duration-700"
            style={{ color: isPlaying ? themeColor : rgba(themeColor,0.4) }}>{artists}</p>
          <p className="text-[9px] text-white/35 truncate mb-2">{item.album.name}</p>
          <div className="w-full bg-white/10 rounded-full overflow-hidden" style={{ height:"2px" }}>
            <div className="h-full rounded-full"
              style={{ width:`${pct}%`,
                backgroundColor: isPlaying ? themeColor : rgba(themeColor,0.3),
                transition:"width 100ms linear" }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] text-white/30 tabular-nums font-bold">{fmt(localProgress)}</span>
            <span className="text-[8px] text-white/30 tabular-nums font-bold">{fmt(item.duration_ms)}</span>
          </div>
        </div>

        {/* Equalizer — flat when paused */}
        {cfg.visualizer && (
        <div className="flex items-end justify-center gap-[3px] pb-3 px-4 h-8">
          {eqAnims.map((bar,i) => (
            <div key={i} style={{
              width:"4px", borderRadius:"2px",
              backgroundColor: rgba(themeColor, isPlaying ? 0.7 : 0.2),
              height: isPlaying ? undefined : "3px",
              minHeight:"3px", maxHeight: bar.max, alignSelf:"flex-end",
              animation: isPlaying ? `eq${(i%4)+1} ${bar.dur} ease-in-out infinite alternate` : "none",
              transition:"opacity 0.5s",
            }} />
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
