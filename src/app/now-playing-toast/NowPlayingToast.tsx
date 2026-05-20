"use client";
import Image from "next/image";
import { useNowPlaying } from "@/app/lib/useNowPlaying";

export default function NowPlayingToast() {
  const { trackData, localProgress, themeColor, fmt, rgba } = useNowPlaying();
  if (!trackData?.item) return <div />;
  const { item, is_playing: isPlaying } = trackData;
  const label = `${item.name}  —  ${item.artists.map((a) => a.name).join(", ")}`;
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div
        className="relative flex items-center gap-2.5 px-2.5 py-2 rounded-full overflow-hidden select-none"
        style={{
          width: "300px",
          background: rgba(themeColor, 0.12),
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${rgba(themeColor, 0.3)}`,
          boxShadow: `0 4px 24px ${rgba(themeColor, 0.15)}`,
        }}
      >
        {/* Album art */}
        <div className="relative shrink-0 w-7 h-7 rounded-full overflow-hidden">
          <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" />
        </div>

        {/* Scrolling text */}
        <div className="flex-1 overflow-hidden">
          <div
            className="flex whitespace-nowrap text-[11px] font-semibold text-white"
            style={{ animation: "marquee 18s linear infinite" }}
          >
            <span className="pr-16">{label}</span>
            <span className="pr-16">{label}</span>
          </div>
        </div>

        {/* Playing indicator */}
        <div className="shrink-0 flex items-center gap-[2px] h-4 mr-1">
          {[0.7, 0.9, 0.75, 0.85].map((dur, i) => (
            <div
              key={i}
              style={{
                width: "2px",
                borderRadius: "1px",
                backgroundColor: themeColor,
                height: isPlaying ? undefined : "3px",
                animation: isPlaying ? `eq${i + 1} ${dur}s ease-in-out infinite alternate` : "none",
              }}
            />
          ))}
        </div>

        {/* Progress underline */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, backgroundColor: themeColor, transition: "width 100ms linear" }}
          />
        </div>

        {/* Time */}
        <span className="shrink-0 text-[9px] text-white/40 tabular-nums font-bold">
          {fmt(localProgress)}
        </span>
      </div>
    </div>
  );
}
