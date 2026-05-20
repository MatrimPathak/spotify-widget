"use client";
import Image from "next/image";
import { useNowPlaying } from "@/app/lib/useNowPlaying";

export default function NowPlayingCRT() {
  const { trackData, localProgress, themeColor, fmt, rgba } = useNowPlaying();
  if (!trackData?.item) return <div />;
  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0, 2).map((a) => a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div
        className="relative select-none overflow-hidden"
        style={{
          width: "300px",
          borderRadius: "20px 20px 16px 16px",
          background: "#222",
          border: "6px solid #2a2a2a",
          boxShadow: "0 12px 48px rgba(0,0,0,0.8), inset 0 2px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* TV screen area */}
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: "12px 12px 8px 8px",
            background: "#000",
            margin: "4px 4px 0 4px",
            aspectRatio: "4/3",
          }}
        >
          {/* Album art */}
          <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" />

          {/* Scanline overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 1px, transparent 1px, transparent 3px)",
              animation: "crt-flicker 4s linear infinite",
            }}
          />

          {/* Screen curvature vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)" }}
          />

          {/* Channel badge */}
          <div
            className="absolute top-2 left-2 text-[9px] font-black tracking-wider px-2 py-0.5 rounded"
            style={{
              backgroundColor: "rgba(0,0,0,0.7)",
              color: themeColor,
              textShadow: `0 0 6px ${rgba(themeColor, 0.8)}`,
              fontFamily: "monospace",
            }}
          >
            CH 4
          </div>

          {/* Playing dot */}
          {isPlaying && (
            <div
              className="absolute top-2 right-2 w-2 h-2 rounded-full"
              style={{
                backgroundColor: themeColor,
                boxShadow: `0 0 6px ${rgba(themeColor, 1)}`,
                animation: "crt-flicker 1.5s linear infinite",
              }}
            />
          )}
        </div>

        {/* TV bezel bottom with info */}
        <div className="px-4 py-3 flex flex-col gap-1" style={{ background: "#1e1e1e" }}>
          {/* LCD display strip */}
          <div
            className="px-2 py-1.5 rounded"
            style={{ background: "#0a1a0a", border: "1px solid rgba(0,255,0,0.15)", fontFamily: "monospace" }}
          >
            <p
              className="text-[10px] font-bold truncate"
              style={{ color: "#00dd00", textShadow: "0 0 6px rgba(0,220,0,0.6)" }}
            >
              {item.name}
            </p>
            <p className="text-[8px] truncate" style={{ color: "rgba(0,200,0,0.6)" }}>{artists}</p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex-1 bg-white/10 rounded-full overflow-hidden" style={{ height: "2px" }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: themeColor, transition: "width 100ms linear" }} />
            </div>
            <span className="text-[8px] text-white/30 tabular-nums font-bold shrink-0" style={{ fontFamily: "monospace" }}>
              {fmt(localProgress)}
            </span>
          </div>

          {/* Knob row */}
          <div className="flex items-center justify-center gap-4 mt-1">
            {["VOL", "CH", "BRT"].map((label) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <div className="w-4 h-4 rounded-full" style={{ background: "#333", border: "1px solid rgba(255,255,255,0.1)" }} />
                <span className="text-[6px] text-white/20 font-bold tracking-widest">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
