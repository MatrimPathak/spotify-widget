"use client";
import Image from "next/image";
import { useNowPlaying } from "@/app/lib/useNowPlaying";

export default function NowPlayingNeon() {
  const { trackData, localProgress, themeColor, fmt, rgba } = useNowPlaying();
  if (!trackData?.item) return <div />;
  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0, 3).map((a) => a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div
        className="relative flex items-center gap-4 px-4 py-3 overflow-hidden select-none"
        style={{
          width: "400px",
          borderRadius: "8px",
          background: "#050505",
          border: `1px solid ${rgba(themeColor, 0.7)}`,
          boxShadow: `0 0 20px ${rgba(themeColor, 0.25)}, inset 0 0 40px ${rgba(themeColor, 0.04)}`,
        }}
      >
        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-20 opacity-20"
          style={{
            background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 1px, transparent 1px, transparent 3px)",
          }}
        />

        {/* Corner glitch accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 z-10" style={{ borderColor: themeColor }} />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 z-10" style={{ borderColor: themeColor }} />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 z-10" style={{ borderColor: themeColor }} />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 z-10" style={{ borderColor: themeColor }} />

        {/* Album art with neon border */}
        <div
          className="relative shrink-0 w-[68px] h-[68px] overflow-hidden"
          style={{
            borderRadius: "4px",
            border: `1px solid ${rgba(themeColor, 0.6)}`,
            boxShadow: `0 0 12px ${rgba(themeColor, 0.4)}`,
          }}
        >
          <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" priority />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0 z-10">
          {/* Status */}
          <div className="flex items-center gap-2 mb-0.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: themeColor,
                boxShadow: `0 0 6px ${rgba(themeColor, 1)}, 0 0 12px ${rgba(themeColor, 0.6)}`,
                animation: isPlaying ? "crt-flicker 3s linear infinite" : "none",
              }}
            />
            <span
              className="text-[9px] font-black tracking-[0.25em] uppercase"
              style={{ color: themeColor, textShadow: `0 0 8px ${rgba(themeColor, 0.8)}` }}
            >
              {isPlaying ? "Transmitting" : "Standby"}
            </span>
          </div>

          <h1
            className="text-[13px] font-black truncate leading-tight tracking-wide"
            style={{ color: "#fff", textShadow: `0 0 10px ${rgba(themeColor, 0.5)}` }}
          >
            {item.name}
          </h1>
          <p className="text-[11px] font-semibold truncate" style={{ color: rgba(themeColor, 0.85) }}>
            {artists}
          </p>

          {/* Progress */}
          <div className="mt-2 flex flex-col gap-1">
            <div className="w-full rounded-none overflow-hidden" style={{ height: "2px", backgroundColor: rgba(themeColor, 0.15) }}>
              <div
                className="h-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: themeColor,
                  boxShadow: `0 0 8px ${rgba(themeColor, 1)}`,
                  transition: "width 100ms linear",
                }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-[9px] tabular-nums font-bold tracking-wider" style={{ color: rgba(themeColor, 0.5) }}>
                {fmt(localProgress)}
              </span>
              <span className="text-[9px] tabular-nums font-bold tracking-wider" style={{ color: rgba(themeColor, 0.5) }}>
                {fmt(item.duration_ms)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
