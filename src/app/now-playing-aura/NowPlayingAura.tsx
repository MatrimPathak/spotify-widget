"use client";
import Image from "next/image";
import { useNowPlaying } from "@/app/lib/useNowPlaying";

export default function NowPlayingAura() {
  const { trackData, localProgress, themeColor, darkColor, fmt, rgba } = useNowPlaying();
  if (!trackData?.item) return <div />;
  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0, 2).map((a) => a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  return (
    <div className="relative flex items-end justify-start min-h-screen bg-black overflow-hidden select-none">
      {/* Full-viewport blurred album art */}
      <div className="absolute inset-0">
        <Image
          src={item.album.images[0].url}
          alt=""
          fill
          unoptimized
          className="object-cover"
          style={{ filter: "blur(48px)", transform: "scale(1.15)", opacity: 0.55 }}
        />
      </div>

      {/* Dark vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at center, ${rgba(darkColor, 0.3)} 0%, ${rgba(darkColor, 0.85)} 100%)` }}
      />

      {/* Frosted glass info pill — bottom left */}
      <div
        className="relative z-10 m-6 flex items-center gap-3 px-4 py-3 rounded-2xl overflow-hidden"
        style={{
          background: rgba(darkColor, 0.6),
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: `1px solid ${rgba(themeColor, 0.25)}`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
          maxWidth: "340px",
        }}
      >
        {/* Colored accent */}
        <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ backgroundColor: themeColor }} />

        <div className="relative shrink-0 w-14 h-14 rounded-xl overflow-hidden ml-1">
          <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" priority />
        </div>

        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {[0.7, 0.9, 0.8, 0.65].map((dur, i) => (
              <div
                key={i}
                style={{
                  width: "2px", borderRadius: "1px", backgroundColor: themeColor,
                  height: isPlaying ? undefined : "2px",
                  animation: isPlaying ? `eq${i + 1} ${dur}s ease-in-out infinite alternate` : "none",
                }}
              />
            ))}
            <span className="text-[9px] font-black tracking-[0.18em] uppercase ml-0.5" style={{ color: themeColor }}>
              {isPlaying ? "Now Playing" : "Paused"}
            </span>
          </div>
          <h1 className="text-white text-[13px] font-black truncate leading-tight">{item.name}</h1>
          <p className="text-[11px] font-semibold truncate" style={{ color: themeColor }}>{artists}</p>
          <div className="mt-1.5 flex flex-col gap-0.5">
            <div className="w-full bg-white/15 rounded-full overflow-hidden" style={{ height: "2px" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, backgroundColor: themeColor, transition: "width 100ms linear" }}
              />
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
