"use client";
import { useNowPlaying } from "@/app/lib/useNowPlaying";

export default function NowPlayingCassette() {
  const { trackData, localProgress, themeColor, fmt, rgba } = useNowPlaying();
  if (!trackData?.item) return <div />;
  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0, 2).map((a) => a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  const Reel = () => (
    <div
      className="relative w-[58px] h-[58px] rounded-full flex items-center justify-center overflow-hidden shrink-0"
      style={{
        background: "#0d0d0d",
        border: `1.5px solid ${rgba(themeColor, 0.4)}`,
        boxShadow: isPlaying ? `0 0 10px ${rgba(themeColor, 0.2)}` : "none",
        animation: isPlaying ? "spin-slow 2.5s linear infinite" : "none",
      }}
    >
      {[0, 60, 120].map((d) => (
        <div
          key={d}
          className="absolute inset-0 flex items-center"
          style={{ transform: `rotate(${d}deg)` }}
        >
          <div className="w-full h-px" style={{ backgroundColor: rgba(themeColor, 0.15) }} />
        </div>
      ))}
      <div
        className="w-[18px] h-[18px] rounded-full z-10"
        style={{ backgroundColor: rgba(themeColor, 0.65), boxShadow: `0 0 6px ${rgba(themeColor, 0.3)}` }}
      />
    </div>
  );

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div
        className="relative select-none overflow-hidden"
        style={{
          width: "340px",
          height: "178px",
          borderRadius: "14px",
          background: "linear-gradient(170deg, #272727 0%, #191919 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
        }}
      >
        {/* Corner screws */}
        {["top-2.5 left-2.5", "top-2.5 right-2.5"].map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-3 h-3 rounded-full`}
            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}
          />
        ))}

        {/* Reel window */}
        <div className="absolute left-0 right-0 flex items-center justify-between px-6" style={{ top: "20px" }}>
          <Reel />
          {/* Center label */}
          <div className="flex-1 px-3 text-center">
            <div className="text-[7px] font-black tracking-[0.35em] uppercase mb-1.5" style={{ color: rgba(themeColor, 0.5) }}>
              SIDE A
            </div>
            <p className="text-white text-[11px] font-black truncate leading-tight">{item.name}</p>
            <p className="text-[9px] font-semibold truncate mt-0.5" style={{ color: themeColor }}>{artists}</p>
          </div>
          <Reel />
        </div>

        {/* Tape guide ridge */}
        <div className="absolute left-0 right-0 h-px" style={{ bottom: "50px", background: "rgba(255,255,255,0.05)" }} />

        {/* Bottom strip */}
        <div
          className="absolute bottom-0 left-0 right-0 flex flex-col justify-center px-5 gap-1.5"
          style={{ height: "50px", background: "rgba(0,0,0,0.4)" }}
        >
          {/* Tape window cutout */}
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-16 h-3 rounded-b-lg" style={{ background: "#0a0a0a" }} />
          <div className="w-full rounded-full overflow-hidden" style={{ height: "2px", background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: themeColor, transition: "width 100ms linear" }} />
          </div>
          <div className="flex justify-between">
            <span className="text-[8px] text-white/30 tabular-nums font-bold">{fmt(localProgress)}</span>
            <span className="text-[8px] text-white/30 tabular-nums font-bold">{fmt(item.duration_ms)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
