"use client";
import Image from "next/image";
import { useNowPlaying } from "@/app/lib/useNowPlaying";

export default function NowPlayingSplit() {
  const { trackData, localProgress, themeColor, darkColor, fmt, rgba } = useNowPlaying();
  if (!trackData?.item) return <div />;
  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0, 3).map((a) => a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div
        className="relative flex overflow-hidden select-none"
        style={{
          width: "400px",
          height: "120px",
          borderRadius: "18px",
          boxShadow: `0 12px 40px rgba(0,0,0,0.6)`,
          border: `1px solid rgba(255,255,255,0.06)`,
        }}
      >
        {/* Left: colored panel with album art */}
        <div
          className="relative shrink-0 flex items-center justify-center"
          style={{
            width: "150px",
            background: `linear-gradient(135deg, ${themeColor}, ${rgba(themeColor, 0.6)})`,
          }}
        >
          <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-xl">
            <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" priority />
          </div>
          {/* Shine overlay */}
          <div className="absolute inset-0 opacity-20"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)" }}
          />
        </div>

        {/* Right: dark info panel */}
        <div
          className="flex-1 flex flex-col justify-center px-4 gap-1"
          style={{ background: rgba(darkColor, 0.97) }}
        >
          {/* Status */}
          <span
            className="text-[9px] font-black tracking-[0.2em] uppercase"
            style={{ color: themeColor }}
          >
            {isPlaying ? "Now Playing" : "Paused"}
          </span>

          <h1 className="text-white text-[13px] font-black truncate leading-tight">{item.name}</h1>
          <p className="text-[11px] font-semibold truncate" style={{ color: rgba(themeColor, 0.8) }}>
            {artists}
          </p>

          {/* Progress */}
          <div className="mt-1 flex flex-col gap-0.5">
            <div className="w-full bg-white/10 rounded-full overflow-hidden" style={{ height: "2px" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, backgroundColor: themeColor, transition: "width 100ms linear" }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-[8px] text-white/30 tabular-nums font-bold">{fmt(localProgress)}</span>
              <span className="text-[8px] text-white/30 tabular-nums font-bold">{fmt(item.duration_ms)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
