"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useNowPlaying } from "@/app/lib/useNowPlaying";
import { useWidgetConfig } from "@/app/lib/useWidgetConfig";

export default function NowPlayingCanvas() {
  const searchParams = useSearchParams();
  const hidePaused = searchParams.get("hidePaused")?.toLowerCase() === "true";
  const { trackData, localProgress, themeColor, fmt, rgba } = useNowPlaying();
  const cfg = useWidgetConfig();

  const [canvasUrl, setCanvasUrl] = useState<string | null>(null);
  const lastFetchedId = useRef<string | null>(null);

  // Fetch canvas video URL when track changes
  useEffect(() => {
    const id = trackData?.item?.id;
    if (!id || id === lastFetchedId.current) return;
    lastFetchedId.current = id;
    setCanvasUrl(null);
    fetch(`/api/canvas?trackId=${id}`)
      .then(r => r.json())
      .then(d => { if (d.url) setCanvasUrl(d.url); })
      .catch(() => {});
  }, [trackData?.item?.id]);

  if (!trackData?.item) return <div />;
  if (!trackData.is_playing && hidePaused) return <div />;

  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0, 2).map(a => a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div className="relative overflow-hidden select-none transition-all duration-700"
        style={{
          width: "360px", height: "640px", borderRadius: "24px",
          boxShadow: `0 24px 64px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08)`,
          opacity: isPlaying ? 1 : 0.7,
        }}
      >
        {/* Background: canvas video or animated album art */}
        {canvasUrl && isPlaying ? (
          <video
            key={canvasUrl}
            autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.85)" }}
          >
            <source src={canvasUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 transition-all duration-1000"
            style={{ filter: isPlaying ? "none" : "saturate(0) brightness(0.4)" }}>
            <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover"
              style={{
                transform: "scale(1.08)",
                filter: isPlaying ? "blur(0px)" : "blur(6px) brightness(0.4)",
                transition: "filter 1s ease",
              }} />
          </div>
        )}

        {/* Paused overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <div className="flex gap-4">
              <div className="w-[6px] h-16 bg-white/60 rounded-full" />
              <div className="w-[6px] h-16 bg-white/60 rounded-full" />
            </div>
          </div>
        )}

        {/* Top: playing indicator */}
        {isPlaying && (
          <div className="absolute top-5 right-5 z-20 flex items-center gap-[3px] h-5">
            {cfg.visualizer && [0.7, 0.9, 0.75, 0.85, 0.65].map((dur, i) => (
              <div key={i} style={{
                width: "3px", borderRadius: "2px",
                backgroundColor: "rgba(255,255,255,0.9)",
                animation: `eq${(i % 4) + 1} ${dur}s ease-in-out infinite alternate`,
              }} />
            ))}
          </div>
        )}

        {/* Top: LIVE badge */}
        <div className="absolute top-5 left-5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
            border: `1px solid ${rgba(themeColor, isPlaying ? 0.5 : 0.2)}`,
          }}>
          <div className="w-1.5 h-1.5 rounded-full transition-all duration-700"
            style={{
              backgroundColor: isPlaying ? themeColor : "rgba(255,255,255,0.3)",
              boxShadow: isPlaying ? `0 0 6px ${rgba(themeColor, 0.8)}` : "none",
              animation: isPlaying ? "crt-flicker 2s linear infinite" : "none",
            }} />
          <span className="text-[9px] font-black tracking-widest uppercase"
            style={{ color: isPlaying ? themeColor : "rgba(255,255,255,0.4)" }}>
            {isPlaying ? "Live" : "Paused"}
          </span>
        </div>

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 40%, transparent 65%)" }} />

        {/* Bottom info panel */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-6 pt-10">
          <h1 className="text-white text-[20px] font-black leading-tight tracking-tight mb-1 transition-opacity duration-700"
            style={{ opacity: isPlaying ? 1 : 0.6 }}>
            {item.name}
          </h1>
          <p className="text-[13px] font-semibold mb-4 transition-colors duration-700"
            style={{ color: isPlaying ? themeColor : rgba(themeColor, 0.45) }}>
            {artists}
          </p>

          {/* Progress */}
          <div className="flex flex-col gap-1.5">
            <div className="w-full rounded-full overflow-hidden"
              style={{ height: "3px", background: "rgba(255,255,255,0.15)" }}>
              <div className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: isPlaying ? themeColor : rgba(themeColor, 0.4),
                  boxShadow: isPlaying ? `0 0 8px ${rgba(themeColor, 0.8)}` : "none",
                  transition: "width 100ms linear",
                }} />
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-white/45 tabular-nums font-semibold">{fmt(localProgress)}</span>
              <span className="text-[10px] text-white/45 tabular-nums font-semibold">{fmt(item.duration_ms)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
