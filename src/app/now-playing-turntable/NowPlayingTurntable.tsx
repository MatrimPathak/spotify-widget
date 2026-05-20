"use client";
import Image from "next/image";
import { useNowPlaying } from "@/app/lib/useNowPlaying";

export default function NowPlayingTurntable() {
  const { trackData, localProgress, themeColor, darkColor, fmt, rgba } = useNowPlaying();
  if (!trackData?.item) return <div />;
  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0, 2).map((a) => a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div
        className="relative flex flex-col items-center select-none"
        style={{ width: "280px" }}
      >
        {/* Platter area */}
        <div className="relative" style={{ width: "240px", height: "240px" }}>
          {/* Turntable platter */}
          <div
            className="absolute inset-0 rounded-full vinyl-disk"
            style={{
              animation: isPlaying ? "spin-slow 6s linear infinite" : "none",
              boxShadow: `0 0 0 4px #1a1a1a, 0 0 0 5px rgba(255,255,255,0.05), 0 16px 48px rgba(0,0,0,0.7)`,
            }}
          />

          {/* Center album art label */}
          <div
            className="absolute rounded-full overflow-hidden"
            style={{
              width: "88px",
              height: "88px",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              boxShadow: `0 0 0 3px #111, 0 0 0 4px rgba(255,255,255,0.1)`,
              animation: isPlaying ? "spin-slow 6s linear infinite" : "none",
            }}
          >
            <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" />
            <div className="absolute inset-0 bg-black/20" />
            {/* Center spindle hole */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#111] border border-white/10" />
            </div>
          </div>

          {/* Tonearm */}
          <div
            className="absolute z-10"
            style={{
              top: "12px",
              right: "0px",
              width: "90px",
              height: "4px",
              background: `linear-gradient(90deg, ${rgba(themeColor, 0.8)}, rgba(180,180,180,0.6))`,
              borderRadius: "2px",
              transformOrigin: "right center",
              transform: isPlaying ? "rotate(-28deg)" : "rotate(-45deg)",
              transition: "transform 1.5s ease",
              boxShadow: `0 2px 8px rgba(0,0,0,0.5)`,
            }}
          >
            {/* Needle head */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
              style={{ backgroundColor: themeColor, boxShadow: `0 0 6px ${rgba(themeColor, 0.6)}` }}
            />
          </div>

          {/* Tonearm pivot */}
          <div
            className="absolute z-20 w-4 h-4 rounded-full"
            style={{ top: "4px", right: "-4px", background: "#2a2a2a", border: "1px solid rgba(255,255,255,0.15)" }}
          />
        </div>

        {/* Info section */}
        <div
          className="w-full mt-3 px-4 py-3 rounded-2xl flex flex-col gap-1"
          style={{
            background: rgba(darkColor, 0.9),
            backdropFilter: "blur(12px)",
            border: `1px solid ${rgba(themeColor, 0.2)}`,
          }}
        >
          <h1 className="text-white text-[13px] font-black truncate text-center leading-tight">{item.name}</h1>
          <p className="text-[11px] font-semibold truncate text-center" style={{ color: themeColor }}>{artists}</p>
          <div className="mt-1.5 flex flex-col gap-1">
            <div className="w-full bg-white/10 rounded-full overflow-hidden" style={{ height: "2px" }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: themeColor, transition: "width 100ms linear" }} />
            </div>
            <div className="flex justify-between">
              <span className="text-[8px] text-white/35 tabular-nums font-bold">{fmt(localProgress)}</span>
              <span className="text-[8px] text-white/35 tabular-nums font-bold">{fmt(item.duration_ms)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
