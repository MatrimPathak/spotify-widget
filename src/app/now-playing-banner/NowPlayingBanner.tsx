"use client";
import Image from "next/image";
import { useNowPlaying } from "@/app/lib/useNowPlaying";

export default function NowPlayingBanner() {
  const { trackData, localProgress, themeColor, darkColor, fmt, rgba } = useNowPlaying();
  if (!trackData?.item) return <div />;
  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0, 3).map((a) => a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div
        className="relative overflow-hidden select-none"
        style={{
          width: "580px",
          height: "72px",
          borderRadius: "16px",
          border: `1px solid ${rgba(themeColor, 0.15)}`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Blurred album art background */}
        <div className="absolute inset-0">
          <Image
            src={item.album.images[0].url}
            alt=""
            fill
            unoptimized
            className="object-cover"
            style={{ filter: "blur(20px)", transform: "scale(1.2)", opacity: 0.4 }}
          />
        </div>

        {/* Dark gradient overlay (left to right) */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, ${rgba(darkColor, 0.98)} 0%, ${rgba(darkColor, 0.85)} 50%, ${rgba(darkColor, 0.7)} 100%)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center gap-4 px-4">
          {/* Album art thumbnail */}
          <div className="relative shrink-0 w-11 h-11 rounded-lg overflow-hidden">
            <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" priority />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-[13px] font-black truncate leading-tight">{item.name}</p>
            <p className="text-[11px] font-semibold truncate" style={{ color: themeColor }}>{artists}</p>
          </div>

          {/* Right: time + status */}
          <div className="shrink-0 text-right flex flex-col gap-1 items-end">
            <span className="text-[9px] text-white/40 tabular-nums font-bold">
              {fmt(localProgress)} / {fmt(item.duration_ms)}
            </span>
            <span
              className="text-[8px] font-black tracking-[0.15em] uppercase"
              style={{ color: themeColor }}
            >
              {isPlaying ? "Now Playing" : "Paused"}
            </span>
          </div>
        </div>

        {/* Progress bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
          <div
            className="h-full"
            style={{
              width: `${pct}%`,
              backgroundColor: themeColor,
              boxShadow: `0 0 8px ${rgba(themeColor, 0.6)}`,
              transition: "width 100ms linear",
            }}
          />
        </div>
      </div>
    </div>
  );
}
