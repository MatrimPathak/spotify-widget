"use client";
import Image from "next/image";
import { useNowPlaying } from "@/app/lib/useNowPlaying";

export default function NowPlayingCentered() {
  const { trackData, localProgress, themeColor, fmt, rgba } = useNowPlaying();
  if (!trackData?.item) return <div />;
  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0, 3).map((a) => a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-6">
      <div className="flex flex-col items-center select-none" style={{ width: "220px" }}>
        {/* Album art */}
        <div
          className="relative w-[180px] h-[180px] rounded-2xl overflow-hidden mb-4"
          style={{
            boxShadow: `0 20px 60px ${rgba(themeColor, 0.35)}, 0 8px 20px rgba(0,0,0,0.5)`,
            border: `1px solid ${rgba(themeColor, 0.2)}`,
          }}
        >
          <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" priority />
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="flex gap-1">
                <div className="w-1 h-5 bg-white/80 rounded-full" />
                <div className="w-1 h-5 bg-white/80 rounded-full" />
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-white text-base font-black text-center leading-tight tracking-tight line-clamp-2 mb-1">
          {item.name}
        </h1>

        {/* Artist */}
        <p className="text-[12px] font-semibold text-center truncate w-full mb-4" style={{ color: themeColor }}>
          {artists}
        </p>

        {/* Progress */}
        <div className="w-full flex flex-col gap-1.5">
          <div className="w-full bg-white/10 rounded-full overflow-hidden" style={{ height: "3px" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                backgroundColor: themeColor,
                boxShadow: `0 0 8px ${rgba(themeColor, 0.7)}`,
                transition: "width 100ms linear",
              }}
            />
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
