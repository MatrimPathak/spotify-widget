"use client";
import { useNowPlaying } from "@/app/lib/useNowPlaying";

export default function NowPlayingVU() {
  const { trackData, localProgress, themeColor, fmt, rgba } = useNowPlaying();
  if (!trackData?.item) return <div />;
  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0, 2).map((a) => a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  const barAnims = [
    { anim: "eq1 0.70s", max: "55%" },
    { anim: "eq2 0.90s", max: "80%" },
    { anim: "eq3 0.80s", max: "65%" },
    { anim: "eq4 0.65s", max: "90%" },
    { anim: "eq1 0.75s", max: "50%" },
    { anim: "eq2 0.85s", max: "75%" },
    { anim: "eq3 0.70s", max: "60%" },
    { anim: "eq4 0.95s", max: "85%" },
  ];

  const VUPanel = ({ mirror }: { mirror?: boolean }) => (
    <div
      className="flex items-end gap-[3px] px-3 py-2"
      style={{
        width: "110px",
        height: "60px",
        background: "#0a0a0a",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "4px",
        flexDirection: mirror ? "row-reverse" : "row",
      }}
    >
      {barAnims.map((bar, i) => {
        const frac = (i + 1) / barAnims.length;
        const barColor = frac < 0.6 ? "#1db954" : frac < 0.85 ? "#f59e0b" : "#ef4444";
        return (
          <div
            key={i}
            style={{
              flex: 1,
              borderRadius: "2px",
              backgroundColor: barColor,
              opacity: isPlaying ? 1 : 0.2,
              height: isPlaying ? undefined : "4px",
              animation: isPlaying ? `${bar.anim}s ease-in-out infinite alternate` : "none",
              maxHeight: bar.max,
              minHeight: "4px",
              alignSelf: "flex-end",
            }}
          />
        );
      })}
    </div>
  );

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div
        className="relative flex items-center gap-3 px-4 py-3 select-none overflow-hidden"
        style={{
          width: "400px",
          borderRadius: "8px",
          background: "linear-gradient(180deg, #1c1c1c 0%, #141414 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* VU left */}
        <VUPanel />

        {/* Center LCD display */}
        <div
          className="flex-1 flex flex-col gap-1 px-3 py-2 rounded"
          style={{
            background: "#0a130a",
            border: "1px solid rgba(0,200,0,0.12)",
            fontFamily: "monospace",
          }}
        >
          <div
            className="text-[9px] font-bold tracking-[0.2em] uppercase mb-0.5"
            style={{ color: rgba(themeColor, 0.55) }}
          >
            {isPlaying ? "▶ PLAYING" : "⏸ PAUSED"}
          </div>
          <p
            className="text-[11px] font-black truncate leading-tight"
            style={{ color: "#00e000", textShadow: "0 0 6px rgba(0,220,0,0.5)" }}
          >
            {item.name}
          </p>
          <p className="text-[9px] truncate" style={{ color: "rgba(0,180,0,0.65)" }}>{artists}</p>

          <div className="mt-1 flex flex-col gap-0.5">
            <div className="w-full rounded overflow-hidden" style={{ height: "2px", background: "rgba(0,200,0,0.15)" }}>
              <div
                className="h-full"
                style={{ width: `${pct}%`, backgroundColor: themeColor, transition: "width 100ms linear" }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-[7px] tabular-nums" style={{ color: "rgba(0,180,0,0.5)" }}>{fmt(localProgress)}</span>
              <span className="text-[7px] tabular-nums" style={{ color: "rgba(0,180,0,0.5)" }}>{fmt(item.duration_ms)}</span>
            </div>
          </div>
        </div>

        {/* VU right (mirrored) */}
        <VUPanel mirror />
      </div>
    </div>
  );
}
