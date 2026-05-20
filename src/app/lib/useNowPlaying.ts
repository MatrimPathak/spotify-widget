import { useEffect, useState, useRef } from "react";
import { Vibrant } from "node-vibrant/browser";

export interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[]; name: string };
  duration_ms: number;
}
export interface NowPlayingData {
  item: Track | null;
  progress_ms: number;
  is_playing: boolean;
}

export function useNowPlaying() {
  const [trackData, setTrackData] = useState<NowPlayingData | null>(null);
  const [localProgress, setLocalProgress] = useState(0);
  const [themeColor, setThemeColor] = useState("#1db954");
  const [darkColor, setDarkColor] = useState("#0a1628");
  const lastTrackIdRef = useRef<string | null>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/now-playing");
        if (!res.ok) return;
        const data: NowPlayingData & { error?: string } = await res.json();
        if (data.error) return;
        setTrackData(data);
        if (typeof data.progress_ms === "number") setLocalProgress(data.progress_ms);
        isPlayingRef.current = data.is_playing;
      } catch {}
    };
    load();
    const iv = setInterval(load, 4000);
    return () => clearInterval(iv);
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
        .catch(() => {});
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

  return { trackData, localProgress, themeColor, darkColor, fmt, rgba };
}
