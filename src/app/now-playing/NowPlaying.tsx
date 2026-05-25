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
    <div style={{ display:"flex", alignItems:"flex-end", gap:"2px", height:"14px" }}>
      {anims.map((a, i) => (
        <div key={i} style={{
          width:"3px", borderRadius:"2px", backgroundColor: color,
          height: isPlaying ? undefined : "3px",
          animation: isPlaying ? `${a}s ease-in-out infinite alternate` : "none",
        }} />
      ))}
    </div>
  );
}

export default function NowPlayingBar() {
  const searchParams = useSearchParams();
  const showAlbumArt = searchParams.get("hideAlbumArt")?.toLowerCase() !== "true";
  const hidePaused   = searchParams.get("hidePaused")?.toLowerCase() === "true";
  const accentParam  = searchParams.get("accentColor");
  const isDemo       = searchParams.get("demo") === "true";
  const cfg = useWidgetConfig();

  const [trackData, setTrackData]   = useState<NowPlayingResponse | null>(null);
  const [localProgress, setLocalProgress] = useState(0);
  const [themeColor, setThemeColor] = useState("#1db954");
  const [darkColor,  setDarkColor]  = useState("#0a1628");
  const lastTrackIdRef = useRef<string | null>(null);
  const isPlayingRef   = useRef(false);

  useEffect(() => {
    const ep = isDemo ? "/api/now-playing?demo=true" : "/api/now-playing";
    const load = async () => {
      try {
        const res = await fetch(ep);
        if (!res.ok) return;
        const data: NowPlayingResponse = await res.json();
        if (data.error === "auth_expired") { window.location.href = "/login"; return; }
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

  const fmt = (ms: number) => { const m = Math.floor(ms/60000), s = Math.floor((ms%60000)/1000); return `${m}:${s<10?"0":""}${s}`; };
  const rgba = (hex: string, a: number) => { hex=hex.replace("#",""); if(hex.length===3)hex=hex.split("").map(c=>c+c).join(""); return `rgba(${parseInt(hex.slice(0,2),16)},${parseInt(hex.slice(2,4),16)},${parseInt(hex.slice(4,6),16)},${a})`; };

  if (!trackData?.item) return <div />;
  if (!trackData.is_playing && hidePaused) return <div />;

  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0,3).map(a=>a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);
  const activeTheme = accentParam ? "#" + accentParam.replace("#","") : themeColor;

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div
        className="relative flex items-center gap-3 px-4 py-3 overflow-hidden select-none"
        style={{
          width:"400px",
          borderRadius: cfg.radius !== null ? cfg.radius + "px" : "16px",
          background:`linear-gradient(135deg, ${rgba(darkColor, cfg.bgOpacity ?? 0.97)}, ${rgba(darkColor, cfg.bgOpacity ?? 0.90)})`,
          backdropFilter:"blur(" + (cfg.blur ?? 24) + "px)", WebkitBackdropFilter:"blur(" + (cfg.blur ?? 24) + "px)",
          border:`1px solid ${rgba(activeTheme, isPlaying ? 0.2 : 0.08)}`,
          boxShadow:`0 8px 32px ${rgba(darkColor,0.7)}, inset 0 1px 0 ${rgba(activeTheme,0.08)}`,
          opacity: isPlaying ? 1 : 0.75,
          transition:"opacity 0.6s ease, border-color 0.6s ease",
        }}
      >
        <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full transition-colors duration-1000"
          style={{ backgroundColor: isPlaying ? activeTheme : rgba(activeTheme, 0.3) }} />
        <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-all duration-1000"
          style={{ backgroundColor: activeTheme, opacity: isPlaying ? 0.2 : 0.06 }} />

        {showAlbumArt && (
          <div className="relative shrink-0 w-[68px] h-[68px] rounded-xl overflow-hidden ml-2"
            style={{ boxShadow:`0 4px 16px ${rgba(darkColor,0.8)}`, filter: isPlaying ? "none" : "saturate(0.4)" }}>
            <Image src={item.album.images[0].url} alt={item.name} fill unoptimized className="object-cover" priority />
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="flex gap-[3px]">
                  <div className="w-[3px] h-3.5 bg-white/90 rounded-full" />
                  <div className="w-[3px] h-3.5 bg-white/90 rounded-full" />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            {cfg.visualizer ? <EqualizerBars isPlaying={isPlaying} color={activeTheme} /> : null}
            <span className="text-[9px] font-black tracking-[0.2em] uppercase transition-colors duration-1000"
              style={{ color: isPlaying ? activeTheme : rgba(activeTheme, 0.5) }}>
              {isPlaying ? "Now Playing" : "Paused"}
            </span>
          </div>
          <h1 className="text-white text-[13px] font-black truncate leading-tight tracking-tight">{item.name}</h1>
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[11px] font-semibold truncate transition-colors duration-1000"
              style={{ color: isPlaying ? activeTheme : rgba(activeTheme, 0.5) }}>{artists}</span>
            <span className="text-white/25 text-[11px] shrink-0">•</span>
            <span className="text-white/40 text-[11px] truncate">{item.album.name}</span>
          </div>
          <div className="mt-2 flex flex-col gap-1">
            <div className="w-full bg-white/10 rounded-full h-[3px] overflow-hidden">
              <div className="h-full rounded-full"
                style={{ width:`${pct}%`, backgroundColor: isPlaying ? activeTheme : rgba(activeTheme,0.4),
                  boxShadow: isPlaying ? `0 0 6px ${rgba(activeTheme,0.7)}` : "none",
                  transition:"width 100ms linear" }} />
            </div>
            <div className="flex justify-between">
              <span className="text-[9px] text-white/35 tabular-nums font-bold tracking-wider">{fmt(localProgress)}</span>
              <span className="text-[9px] text-white/35 tabular-nums font-bold tracking-wider">{fmt(item.duration_ms)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
