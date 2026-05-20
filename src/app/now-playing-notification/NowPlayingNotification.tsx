"use client";
import Image from "next/image";
import { useNowPlaying } from "@/app/lib/useNowPlaying";

export default function NowPlayingNotification() {
  const { trackData, localProgress, themeColor, darkColor, fmt, rgba } = useNowPlaying();
  if (!trackData?.item) return <div />;
  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0, 2).map((a) => a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div
        className="relative select-none overflow-hidden"
        style={{
          width: "320px",
          borderRadius: "20px",
          background: rgba(darkColor, 0.92),
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: `1px solid rgba(255,255,255,0.12)`,
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-1.5">
          <div className="w-3.5 h-3.5 rounded-sm flex items-center justify-center" style={{ backgroundColor: themeColor }}>
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
          <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wide">Spotify</span>
          <span className="text-[10px] text-white/25 ml-auto">{isPlaying ? "Now" : "Paused"}</span>
        </div>

        {/* Body */}
        <div className="flex items-center gap-3 px-4 pb-3">
          <div className="relative shrink-0 w-[52px] h-[52px] rounded-xl overflow-hidden shadow-lg">
            <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black text-white truncate leading-tight">{item.name}</p>
            <p className="text-[11px] font-medium truncate mt-0.5" style={{ color: themeColor }}>{artists}</p>
            <p className="text-[10px] text-white/35 truncate">{item.album.name}</p>
          </div>
        </div>

        {/* Progress bar at very bottom */}
        <div className="h-[3px] bg-white/8 overflow-hidden">
          <div
            className="h-full"
            style={{ width: `${pct}%`, backgroundColor: themeColor, transition: "width 100ms linear" }}
          />
        </div>

        {/* Time stamps */}
        <div className="flex justify-between px-4 py-1.5">
          <span className="text-[9px] text-white/30 tabular-nums font-bold">{fmt(localProgress)}</span>
          <span className="text-[9px] text-white/30 tabular-nums font-bold">{fmt(item.duration_ms)}</span>
        </div>
      </div>
    </div>
  );
}
