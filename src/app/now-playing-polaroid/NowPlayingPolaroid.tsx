"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useNowPlaying } from "@/app/lib/useNowPlaying";

export default function NowPlayingPolaroid() {
  const searchParams = useSearchParams();
  const hidePaused = searchParams.get("hidePaused")?.toLowerCase() === "true";
  const { trackData, localProgress, themeColor, fmt, rgba } = useNowPlaying();

  if (!trackData?.item) return <div />;
  if (!trackData.is_playing && hidePaused) return <div />;

  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0,2).map(a=>a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-8">
      <div className="relative select-none transition-all duration-700"
        style={{
          // Playing: slight -2° tilt. Paused: extra droop (-4°) + slight desaturation
          transform: isPlaying ? "rotate(-2deg)" : "rotate(-4deg)",
          filter: isPlaying ? "none" : "saturate(0.25) brightness(0.85)",
          opacity: isPlaying ? 1 : 0.75,
        }}
      >
        <div style={{ width:"200px", background:"#f5f0eb", padding:"10px 10px 36px 10px", borderRadius:"2px",
          boxShadow: isPlaying ? "0 12px 32px rgba(0,0,0,0.6)" : "0 6px 16px rgba(0,0,0,0.4)" }}>
          {/* Photo area */}
          <div className="relative w-full aspect-square overflow-hidden mb-0" style={{ borderRadius:"1px" }}>
            <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" priority />
            <div className="absolute inset-0"
              style={{ background:"radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.2) 100%)" }} />

            {/* Playing: equalizer badge. Paused: large ⏸ sticker in corner */}
            {isPlaying ? (
              <div className="absolute top-2 right-2 flex items-end gap-[2px] h-4 px-1.5 py-1 rounded-full bg-black/40">
                {[0.7,0.9,0.8,0.65].map((dur,i) => (
                  <div key={i} style={{
                    width:"2px", borderRadius:"1px", backgroundColor:"#fff",
                    animation:`eq${i+1} ${dur}s ease-in-out infinite alternate`,
                  }} />
                ))}
              </div>
            ) : (
              // Paused: a small sticky-note style badge
              <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                <div className="flex gap-[3px]">
                  <div className="w-[2px] h-3.5 bg-black/60 rounded-full" />
                  <div className="w-[2px] h-3.5 bg-black/60 rounded-full" />
                </div>
              </div>
            )}
          </div>

          {/* Text */}
          <div className="pt-3 px-1 flex flex-col gap-0.5">
            <p className="text-[12px] font-black truncate leading-tight transition-opacity duration-700"
              style={{ color:"#1a1a1a", fontFamily:"Georgia, serif", opacity: isPlaying ? 1 : 0.65 }}>
              {item.name}
            </p>
            <p className="text-[10px] font-medium truncate transition-colors duration-700"
              style={{ color: isPlaying ? rgba(themeColor,0.85) : "rgba(80,80,80,0.6)", fontFamily:"Georgia, serif" }}>
              {artists}
            </p>
            <div className="mt-2 flex flex-col gap-1">
              <div className="w-full rounded-full overflow-hidden"
                style={{ height:"2px", backgroundColor: rgba(themeColor, isPlaying ? 0.2 : 0.08) }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width:`${pct}%`,
                    backgroundColor: isPlaying ? themeColor : "rgba(100,100,100,0.4)",
                    transition:"width 100ms linear" }} />
              </div>
              <div className="flex justify-between">
                <span className="text-[8px] tabular-nums font-bold" style={{ color:"rgba(0,0,0,0.35)", fontFamily:"monospace" }}>
                  {fmt(localProgress)}
                </span>
                <span className="text-[8px] tabular-nums font-bold" style={{ color:"rgba(0,0,0,0.35)", fontFamily:"monospace" }}>
                  {fmt(item.duration_ms)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
