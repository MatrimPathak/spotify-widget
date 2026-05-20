"use client";
import Image from "next/image";
import { useNowPlaying } from "@/app/lib/useNowPlaying";

export default function NowPlayingDuotone() {
  const { trackData, localProgress, themeColor, darkColor, fmt, rgba } = useNowPlaying();
  if (!trackData?.item) return <div />;
  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0, 3).map((a) => a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div
        className="relative flex items-center gap-4 px-5 py-4 overflow-hidden select-none"
        style={{
          width: "400px",
          borderRadius: "20px",
          background: `linear-gradient(125deg, ${rgba(darkColor, 0.98)} 0%, #0d0d0d 100%)`,
          border: `1px solid ${rgba(themeColor, 0.15)}`,
          boxShadow: `0 12px 48px ${rgba(darkColor, 0.8)}, inset 0 1px 0 ${rgba(themeColor, 0.06)}`,
        }}
      >
        {/* Diagonal color wash */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: `linear-gradient(125deg, ${themeColor} 0%, transparent 50%)`,
          }}
        />

        {/* Album art */}
        <div
          className="relative shrink-0 w-[72px] h-[72px] rounded-2xl overflow-hidden"
          style={{
            boxShadow: `0 8px 24px ${rgba(darkColor, 0.8)}, 0 0 0 1px ${rgba(themeColor, 0.2)}`,
          }}
        >
          <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" priority />
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="flex gap-1">
                <div className="w-[3px] h-3.5 bg-white/80 rounded-full" />
                <div className="w-[3px] h-3.5 bg-white/80 rounded-full" />
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0 relative z-10">
          <span className="text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: themeColor }}>
            {isPlaying ? "Now Playing" : "Paused"}
          </span>
          <h1 className="text-white text-[14px] font-black truncate leading-tight tracking-tight">{item.name}</h1>
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[11px] font-semibold truncate" style={{ color: themeColor }}>{artists}</span>
            <span className="text-white/20 shrink-0">•</span>
            <span className="text-white/40 text-[10px] truncate">{item.album.name}</span>
          </div>
          <div className="mt-2 flex flex-col gap-1">
            <div className="w-full bg-white/8 rounded-full overflow-hidden" style={{ height: "3px" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: themeColor,
                  boxShadow: `0 0 6px ${rgba(themeColor, 0.8)}`,
                  transition: "width 100ms linear",
                }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-[9px] text-white/30 tabular-nums font-bold">{fmt(localProgress)}</span>
              <span className="text-[9px] text-white/30 tabular-nums font-bold">{fmt(item.duration_ms)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
