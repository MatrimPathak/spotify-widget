"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Vibrant } from "node-vibrant/browser";
import Image from "next/image";
import { useWidgetConfig } from "@/app/lib/useWidgetConfig";

interface Track {
  id: string; name: string;
  artists: { name: string }[];
  album: { images: { url: string }[]; name: string };
  duration_ms: number;
}
interface NowPlayingResponse {
  item: Track | null; progress_ms: number; is_playing: boolean; error?: string;
}

function EqualizerBars({ isPlaying, color }: { isPlaying: boolean; color: string }) {
  const anims = ["eq1 0.70s","eq2 0.90s","eq3 0.80s","eq4 0.65s"];
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:"2px", height:"12px" }}>
      {anims.map((a, i) => (
        <div key={i} style={{
          width:"2px", borderRadius:"2px", backgroundColor: color,
          height: isPlaying ? undefined : "2px",
          animation: isPlaying ? `${a}s ease-in-out infinite alternate` : "none",
        }} />
      ))}
    </div>
  );
}

export default function NowPlayingCard() {
  const searchParams = useSearchParams();
  const hidePaused  = searchParams.get("hidePaused")?.toLowerCase() === "true";
  const accentParam = searchParams.get("accentColor");
  const isDemo      = searchParams.get("demo") === "true";
  const cfg = useWidgetConfig();

  const [trackData, setTrackData]         = useState<NowPlayingResponse | null>(null);
  const [localProgress, setLocalProgress] = useState(0);
  const [themeColor, setThemeColor]       = useState("#1db954");
  const [darkColor,  setDarkColor]        = useState("#0a1628");
  const lastTrackIdRef = useRef<string | null>(null);
  const isPlayingRef   = useRef(false);

  useEffect(() => {
    const ep = isDemo ? "/api/now-playing?demo=true" : "/api/now-playing";
    const load = async () => {
      try {
        const res = await fetch(ep);
        if (!res.ok) return;
        const data: NowPlayingResponse = await res.json();
        if (data.error) return;
        setTrackData(data);
        if (typeof data.progress_ms === "number") setLocalProgress(data.progress_ms);
        isPlayingRef.current = data.is_playing;
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    load(); const iv = setInterval(load, isDemo ? 60000 : 4000); return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const t = setInterval(() => { if (isPlayingRef.current) setLocalProgress(p => p + 100); }, 100);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (trackData?.item && trackData.item.id !== lastTrackIdRef.current) {
      lastTrackIdRef.current = trackData.item.id;
      Vibrant.from(trackData.item.album.images[0].url).getPalette()
        .then(p => { setThemeColor(p.Vibrant?.hex ?? "#1db954"); setDarkColor(p.DarkVibrant?.hex ?? "#0a1628"); })
        .catch(() => {});
    }
  }, [trackData]);

  const fmt = (ms: number) => { const m=Math.floor(ms/60000),s=Math.floor((ms%60000)/1000); return `${m}:${s<10?"0":""}${s}`; };
  const rgba = (hex: string, a: number) => { hex=hex.replace("#",""); if(hex.length===3)hex=hex.split("").map(c=>c+c).join(""); return `rgba(${parseInt(hex.slice(0,2),16)},${parseInt(hex.slice(2,4),16)},${parseInt(hex.slice(4,6),16)},${a})`; };

  if (!trackData?.item) return <div />;
  if (!trackData.is_playing && hidePaused) return <div />;

  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0,2).map(a=>a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);
  const activeTheme = accentParam ? "#" + accentParam.replace("#","") : themeColor;

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div
        className="relative w-[220px] h-[220px] overflow-hidden select-none transition-all duration-700"
        style={{
          borderRadius: cfg.radius !== null ? cfg.radius + "px" : "16px",
          boxShadow:`0 24px 64px ${rgba(darkColor,0.85)}, 0 0 0 1px ${rgba(activeTheme, isPlaying ? 0.25 : 0.08)}`,
          filter: isPlaying ? "none" : "saturate(0.35)",
        }}
      >
        <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" priority />

        {/* Paused: dark static overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center z-30">
            <div className="flex gap-2">
              <div className="w-2 h-10 bg-white/70 rounded-full" />
              <div className="w-2 h-10 bg-white/70 rounded-full" />
            </div>
          </div>
        )}

        {/* Badge */}
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur-md"
          style={{ backgroundColor: rgba(darkColor, isPlaying ? 0.65 : 0.8) }}>
          {cfg.visualizer ? <EqualizerBars isPlaying={isPlaying} color={activeTheme} /> : <div className="w-4 h-4 rounded-full" style={{backgroundColor: rgba(activeTheme, 0.4)}} />}
          <span className="text-[8px] font-black tracking-[0.18em] uppercase transition-colors duration-1000"
            style={{ color: activeTheme }}>{isPlaying ? "Live" : "Paused"}</span>
        </div>

        {/* Bottom gradient */}
        <div className="absolute inset-0 z-10 pointer-events-none"
          style={{ background:`linear-gradient(to bottom, transparent 25%, ${rgba(darkColor, isPlaying ? 0.88 : 0.96)} 75%, ${rgba(darkColor, isPlaying ? 0.98 : 1)} 100%)` }} />
        <div className="absolute inset-0 z-10 pointer-events-none opacity-20 transition-colors duration-1000"
          style={{ background:`radial-gradient(circle at 50% 0%, ${activeTheme}, transparent 70%)` }} />

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-3.5 pb-3.5 pt-10">
          <div className="flex flex-col gap-1 mb-2.5">
            <div className="w-full bg-white/15 rounded-full overflow-hidden" style={{ height:"2px" }}>
              <div className="h-full rounded-full"
                style={{ width:`${pct}%`, backgroundColor: activeTheme,
                  boxShadow: isPlaying ? `0 0 6px ${rgba(activeTheme,0.9)}` : "none",
                  transition:"width 100ms linear" }} />
            </div>
            <div className="flex justify-between">
              <span className="text-[8px] text-white/45 tabular-nums font-bold">{fmt(localProgress)}</span>
              <span className="text-[8px] text-white/45 tabular-nums font-bold">{fmt(item.duration_ms)}</span>
            </div>
          </div>
          <h1 className="text-white text-[13px] font-black truncate leading-tight tracking-tight">{item.name}</h1>
          <div className="flex items-center gap-1 mt-0.5 min-w-0">
            <span className="text-[10px] font-semibold truncate transition-colors duration-1000"
              style={{ color: activeTheme }}>{artists}</span>
            <span className="text-white/30 text-[9px] shrink-0">•</span>
            <span className="text-white/40 text-[10px] truncate">{item.album.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
