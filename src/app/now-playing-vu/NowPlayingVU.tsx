"use client";
import { useSearchParams } from "next/navigation";
import { useNowPlaying } from "@/app/lib/useNowPlaying";

export default function NowPlayingVU() {
  const searchParams = useSearchParams();
  const hidePaused = searchParams.get("hidePaused")?.toLowerCase() === "true";
  const { trackData, localProgress, themeColor, fmt, rgba } = useNowPlaying();

  if (!trackData?.item) return <div />;
  if (!trackData.is_playing && hidePaused) return <div />;

  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0,2).map(a=>a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  const barAnims = [
    {anim:"eq1 0.70s",max:"55%"},{anim:"eq2 0.90s",max:"80%"},{anim:"eq3 0.80s",max:"65%"},
    {anim:"eq4 0.65s",max:"90%"},{anim:"eq1 0.75s",max:"50%"},{anim:"eq2 0.85s",max:"75%"},
    {anim:"eq3 0.70s",max:"60%"},{anim:"eq4 0.95s",max:"85%"},
  ];

  const VUPanel = ({ mirror }: { mirror?: boolean }) => (
    <div className="flex items-end gap-[3px] px-3 py-2 transition-opacity duration-700"
      style={{
        width:"110px", height:"60px", background:"#0a0a0a",
        border:"1px solid rgba(255,255,255,0.06)", borderRadius:"4px",
        flexDirection: mirror ? "row-reverse" : "row",
        opacity: isPlaying ? 1 : 0.3,
      }}
    >
      {barAnims.map((bar,i) => {
        const frac = (i+1)/barAnims.length;
        // When paused: all bars grey at minimum height
        const barColor = isPlaying
          ? (frac < 0.6 ? "#1db954" : frac < 0.85 ? "#f59e0b" : "#ef4444")
          : "rgba(80,80,80,0.4)";
        return (
          <div key={i} style={{
            flex:1, borderRadius:"2px", backgroundColor: barColor,
            height: isPlaying ? undefined : "3px",
            animation: isPlaying ? `${bar.anim}s ease-in-out infinite alternate` : "none",
            maxHeight: isPlaying ? bar.max : "3px",
            minHeight:"3px", alignSelf:"flex-end",
            transition:"background-color 0.5s",
          }} />
        );
      })}
    </div>
  );

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div className="relative flex items-center gap-3 px-4 py-3 select-none overflow-hidden transition-opacity duration-700"
        style={{
          width:"400px", borderRadius:"8px",
          background:"linear-gradient(180deg, #1c1c1c 0%, #141414 100%)",
          border:"1px solid rgba(255,255,255,0.06)",
          boxShadow:"0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
          opacity: isPlaying ? 1 : 0.7,
        }}
      >
        <VUPanel />

        {/* LCD center */}
        <div className="flex-1 flex flex-col gap-1 px-3 py-2 rounded"
          style={{ background:"#0a130a", border:"1px solid rgba(0,200,0,0.12)", fontFamily:"monospace" }}>
          {isPlaying ? (
            <>
              <div className="text-[9px] font-bold tracking-[0.2em] uppercase mb-0.5"
                style={{ color: rgba(themeColor,0.55) }}>▶ PLAYING</div>
              <p className="text-[11px] font-black truncate leading-tight"
                style={{ color:"#00e000", textShadow:"0 0 6px rgba(0,220,0,0.5)" }}>{item.name}</p>
              <p className="text-[9px] truncate" style={{ color:"rgba(0,180,0,0.65)" }}>{artists}</p>
            </>
          ) : (
            <>
              {/* Paused: prominent ⏸ PAUSED display */}
              <div className="text-[13px] font-black tracking-[0.2em] text-center"
                style={{ color:"rgba(0,150,0,0.5)" }}>⏸ PAUSED</div>
              <p className="text-[9px] truncate text-center" style={{ color:"rgba(0,130,0,0.4)" }}>{item.name}</p>
            </>
          )}
          <div className="mt-1 flex flex-col gap-0.5">
            <div className="w-full rounded overflow-hidden"
              style={{ height:"2px", background: isPlaying ? "rgba(0,200,0,0.15)" : "rgba(80,80,80,0.2)" }}>
              <div className="h-full transition-all duration-700"
                style={{ width:`${pct}%`,
                  backgroundColor: isPlaying ? themeColor : "rgba(80,80,80,0.3)",
                  transition:"width 100ms linear" }} />
            </div>
            <div className="flex justify-between">
              <span className="text-[7px] tabular-nums" style={{ color: isPlaying ? "rgba(0,180,0,0.5)" : "rgba(80,80,80,0.3)" }}>
                {fmt(localProgress)}
              </span>
              <span className="text-[7px] tabular-nums" style={{ color: isPlaying ? "rgba(0,180,0,0.5)" : "rgba(80,80,80,0.3)" }}>
                {fmt(item.duration_ms)}
              </span>
            </div>
          </div>
        </div>

        <VUPanel mirror />
      </div>
    </div>
  );
}
