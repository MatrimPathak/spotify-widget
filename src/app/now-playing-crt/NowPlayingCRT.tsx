"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useNowPlaying } from "@/app/lib/useNowPlaying";
import { useWidgetConfig } from "@/app/lib/useWidgetConfig";

export default function NowPlayingCRT() {
  const searchParams = useSearchParams();
  const hidePaused = searchParams.get("hidePaused")?.toLowerCase() === "true";
  const { trackData, localProgress, themeColor, fmt, rgba } = useNowPlaying();
  const cfg = useWidgetConfig();

  const [canvasUrl, setCanvasUrl] = useState<string | null>(null);
  const lastFetchedId = useRef<string | null>(null);

  useEffect(() => {
    if (!cfg.canvas) return;
    const id = trackData?.item?.id;
    if (!id || id === lastFetchedId.current) return;
    lastFetchedId.current = id;
    setCanvasUrl(null);
    fetch(`/api/canvas?trackId=${id}`)
      .then(r => r.json())
      .then(d => { if (d.url) setCanvasUrl(d.url); })
      .catch(() => {});
  }, [trackData?.item?.id, cfg.canvas]);

  if (!trackData?.item) return <div />;
  if (!trackData.is_playing && hidePaused) return <div />;

  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0,2).map(a=>a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  const showCanvas = cfg.canvas && canvasUrl && isPlaying;

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div className="relative select-none overflow-hidden transition-opacity duration-700"
        style={{
          width:"300px", borderRadius:"20px 20px 16px 16px",
          background:"#222", border:"6px solid #2a2a2a",
          boxShadow:"0 12px 48px rgba(0,0,0,0.8), inset 0 2px 0 rgba(255,255,255,0.05)",
          opacity: isPlaying ? 1 : 0.75,
        }}
      >
        {/* Screen */}
        <div className="relative overflow-hidden"
          style={{ borderRadius:"12px 12px 8px 8px", background:"#000",
            margin:"4px 4px 0 4px", aspectRatio:"4/3" }}>

          {/* Canvas video or album art */}
          {showCanvas ? (
            <video key={canvasUrl} autoPlay loop muted playsInline
              className="absolute inset-0 w-full h-full object-cover">
              <source src={canvasUrl!} type="video/mp4" />
            </video>
          ) : (
            <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover"
              style={{ filter: isPlaying ? "none" : "saturate(0) brightness(0.3)" }} />
          )}

          {/* Scanlines */}
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-700"
            style={{
              background:"repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 1px, transparent 1px, transparent 3px)",
              animation:"crt-flicker 4s linear infinite",
              opacity: isPlaying ? 1 : 0.5,
            }} />

          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background:"radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)" }} />

          {/* Paused overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center">
                <div className="text-[22px] font-black tracking-[0.3em] text-white/80"
                  style={{ fontFamily:"monospace", textShadow:"0 0 10px rgba(255,255,255,0.3)" }}>
                  PAUSED
                </div>
                <div className="flex justify-center mt-2 gap-2">
                  <div className="w-[4px] h-5 bg-white/50 rounded-full" />
                  <div className="w-[4px] h-5 bg-white/50 rounded-full" />
                </div>
              </div>
            </div>
          )}

          {/* CH badge */}
          <div className="absolute top-2 left-2 text-[9px] font-black tracking-wider px-2 py-0.5 rounded transition-opacity duration-700"
            style={{
              backgroundColor:"rgba(0,0,0,0.7)", color: isPlaying ? themeColor : "rgba(100,100,100,0.6)",
              textShadow: isPlaying ? `0 0 6px ${rgba(themeColor,0.8)}` : "none", fontFamily:"monospace",
              opacity: isPlaying ? 1 : 0.5,
            }}>{showCanvas ? "CANVAS" : "CH 4"}</div>

          {/* REC dot */}
          {isPlaying && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full"
              style={{ backgroundColor: themeColor, boxShadow:`0 0 6px ${rgba(themeColor,1)}`,
                animation:"crt-flicker 1.5s linear infinite" }} />
          )}
        </div>

        {/* Bezel bottom */}
        <div className="px-4 py-3 flex flex-col gap-1" style={{ background:"#1e1e1e" }}>
          <div className="px-2 py-1.5 rounded"
            style={{ background:"#0a1a0a", border:"1px solid rgba(0,255,0,0.15)", fontFamily:"monospace" }}>
            {isPlaying ? (
              <>
                <p className="text-[10px] font-bold truncate" style={{ color:"#00dd00", textShadow:"0 0 6px rgba(0,220,0,0.6)" }}>
                  {item.name}
                </p>
                <p className="text-[8px] truncate" style={{ color:"rgba(0,200,0,0.6)" }}>{artists}</p>
              </>
            ) : (
              <>
                <p className="text-[10px] font-black tracking-widest" style={{ color:"rgba(0,180,0,0.4)" }}>
                  ⏸ PAUSED
                </p>
                <p className="text-[8px] truncate" style={{ color:"rgba(0,160,0,0.3)" }}>{item.name}</p>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex-1 bg-white/10 rounded-full overflow-hidden" style={{ height:"2px" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width:`${pct}%`,
                  backgroundColor: isPlaying ? themeColor : rgba(themeColor,0.25),
                  transition:"width 100ms linear" }} />
            </div>
            <span className="text-[8px] text-white/30 tabular-nums font-bold shrink-0"
              style={{ fontFamily:"monospace" }}>{fmt(localProgress)}</span>
          </div>

          <div className="flex items-center justify-center gap-4 mt-1">
            {["VOL","CH","BRT"].map(label => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <div className="w-4 h-4 rounded-full" style={{ background:"#333", border:"1px solid rgba(255,255,255,0.1)" }} />
                <span className="text-[6px] text-white/20 font-bold tracking-widest">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
