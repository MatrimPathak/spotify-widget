"use client";

import { useEffect, useState, useRef } from "react";
import { Vibrant } from "node-vibrant/browser";
import Image from "next/image";

interface Artist { name: string; }
interface AlbumImage { url: string; }
interface Album { images: AlbumImage[]; name: string; }
interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  duration_ms: number;
}
interface NowPlayingResponse {
  item: Track | null;
  progress_ms: number;
  is_playing: boolean;
  error?: string;
}

function EqualizerBars({ isPlaying, color }: { isPlaying: boolean; color: string }) {
  const anims = [
    "eq1 0.70s ease-in-out infinite alternate",
    "eq2 0.90s ease-in-out infinite alternate",
    "eq3 0.80s ease-in-out infinite alternate",
    "eq4 0.65s ease-in-out infinite alternate",
  ];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "12px" }}>
      {anims.map((anim, i) => (
        <div
          key={i}
          style={{
            width: "2px",
            borderRadius: "2px",
            backgroundColor: color,
            height: isPlaying ? undefined : "3px",
            animation: isPlaying ? anim : "none",
          }}
        />
      ))}
    </div>
  );
}

export default function NowPlayingCard() {
  const [trackData, setTrackData] = useState<NowPlayingResponse | null>(null);
  const [localProgress, setLocalProgress] = useState(0);
  const [themeColor, setThemeColor] = useState("#1db954");
  const [darkColor, setDarkColor] = useState("#0a1628");
  const lastTrackIdRef = useRef<string | null>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch("/api/now-playing");
        if (!res.ok) return;
        const data: NowPlayingResponse = await res.json();
        if (data.error) return;
        setTrackData(data);
        if (typeof data.progress_ms === "number") setLocalProgress(data.progress_ms);
        isPlayingRef.current = data.is_playing;
      } catch (err) {
        console.error("Error fetching now playing:", err);
      }
    };
    fetch_();
    const interval = setInterval(fetch_, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      if (isPlayingRef.current) setLocalProgress((p) => p + 100);
    }, 100);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (trackData?.item && trackData.item.id !== lastTrackIdRef.current) {
      lastTrackIdRef.current = trackData.item.id;
      Vibrant.from(trackData.item.album.images[0].url)
        .getPalette()
        .then((p) => {
          setThemeColor(p.Vibrant?.hex ?? "#1db954");
          setDarkColor(p.DarkVibrant?.hex ?? "#0a1628");
        })
        .catch(() => { setThemeColor("#1db954"); setDarkColor("#0a1628"); });
    }
  }, [trackData]);

  const fmt = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const rgba = (hex: string, a: number) => {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    return `rgba(${parseInt(hex.slice(0, 2), 16)},${parseInt(hex.slice(2, 4), 16)},${parseInt(hex.slice(4, 6), 16)},${a})`;
  };

  if (!trackData?.item) return <div />;

  const { item, is_playing: isPlaying } = trackData;
  const artists = item.artists.slice(0, 2).map((a) => a.name).join(", ");
  const pct = Math.min((localProgress / item.duration_ms) * 100, 100);

  return (
    <div className="flex items-start justify-start min-h-screen bg-transparent p-4">
      <div
        className="relative w-[220px] h-[220px] rounded-2xl overflow-hidden select-none"
        style={{
          boxShadow: `0 24px 64px ${rgba(darkColor, 0.85)}, 0 0 0 1px ${rgba(themeColor, 0.25)}`,
        }}
      >
        {/* Album art fills the entire card */}
        <Image
          src={item.album.images[0].url}
          alt={item.name}
          fill
          unoptimized
          className="object-cover"
          priority
        />

        {/* Now playing / paused badge — top right */}
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur-md"
          style={{ backgroundColor: rgba(darkColor, 0.65) }}
        >
          <EqualizerBars isPlaying={isPlaying} color={themeColor} />
          <span
            className="text-[8px] font-black tracking-[0.18em] uppercase transition-colors duration-1000"
            style={{ color: themeColor }}
          >
            {isPlaying ? "Live" : "Paused"}
          </span>
        </div>

        {/* Bottom gradient overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, transparent 25%, ${rgba(darkColor, 0.88)} 75%, ${rgba(darkColor, 0.98)} 100%)`,
          }}
        />

        {/* Ambient color tint top */}
        <div
          className="absolute inset-0 z-10 pointer-events-none opacity-20 transition-colors duration-1000"
          style={{ background: `radial-gradient(circle at 50% 0%, ${themeColor}, transparent 70%)` }}
        />

        {/* Info section overlaid at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-3.5 pb-3.5 pt-10">
          {/* Progress bar */}
          <div className="flex flex-col gap-1 mb-2.5">
            <div className="w-full bg-white/15 rounded-full overflow-hidden" style={{ height: "2px" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: themeColor,
                  boxShadow: `0 0 6px ${rgba(themeColor, 0.9)}`,
                  transition: "width 100ms linear",
                }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-[8px] text-white/45 tabular-nums font-bold">{fmt(localProgress)}</span>
              <span className="text-[8px] text-white/45 tabular-nums font-bold">{fmt(item.duration_ms)}</span>
            </div>
          </div>

          <h1 className="text-white text-[13px] font-black truncate leading-tight tracking-tight">
            {item.name}
          </h1>
          <div className="flex items-center gap-1 mt-0.5 min-w-0">
            <span
              className="text-[10px] font-semibold truncate transition-colors duration-1000"
              style={{ color: themeColor }}
            >
              {artists}
            </span>
            <span className="text-white/30 text-[9px] shrink-0">•</span>
            <span className="text-white/40 text-[10px] truncate">{item.album.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
