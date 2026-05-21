"use client";
import { useState, useCallback } from "react";

const WIDGETS = [
  { id: "now-playing",              name: "Horizontal Bar",    desc: "Sleek pill with album art",        w: 432, h: 96,  category: "normal",   supports: ["hidePaused", "hideAlbumArt"] },
  { id: "now-playing-card",         name: "Card",              desc: "Square album art card",            w: 252, h: 252, category: "normal",   supports: ["hidePaused"] },
  { id: "now-playing-toast",        name: "Toast",             desc: "Minimal pill notification",        w: 332, h: 72,  category: "normal",   supports: ["hidePaused"] },
  { id: "now-playing-notification", name: "iOS Notification",  desc: "iOS-style lock screen card",       w: 352, h: 80,  category: "normal",   supports: ["hidePaused"] },
  { id: "now-playing-centered",     name: "Centered",          desc: "Large album art, centered text",   w: 252, h: 290, category: "normal",   supports: ["hidePaused"] },
  { id: "now-playing-banner",       name: "Banner",            desc: "Wide blurred background strip",    w: 612, h: 104, category: "normal",   supports: ["hidePaused"] },
  { id: "now-playing-split",        name: "Split Panel",       desc: "Art + info side by side",          w: 432, h: 152, category: "normal",   supports: ["hidePaused"] },
  { id: "now-playing-vertical",     name: "Vertical",          desc: "Portrait-mode compact",            w: 242, h: 240, category: "normal",   supports: ["hidePaused"] },
  { id: "now-playing-ticker",       name: "Ticker",            desc: "Scrolling marquee strip",          w: 552, h: 70,  category: "normal",   supports: ["hidePaused"] },
  { id: "now-playing-duotone",      name: "Duotone",           desc: "Diagonal gradient accent",         w: 432, h: 110, category: "creative", supports: ["hidePaused"] },
  { id: "now-playing-aura",         name: "Aura",              desc: "Full-viewport glowing background", w: 800, h: 600, category: "creative", supports: ["hidePaused"] },
  { id: "now-playing-neon",         name: "Neon",              desc: "Cyberpunk neon glow",              w: 432, h: 110, category: "creative", supports: ["hidePaused"] },
  { id: "now-playing-cassette",     name: "Cassette",          desc: "Retro tape cassette",              w: 372, h: 210, category: "creative", supports: ["hidePaused"] },
  { id: "now-playing-turntable",    name: "Turntable",         desc: "Spinning vinyl record",            w: 312, h: 420, category: "creative", supports: ["hidePaused"] },
  { id: "now-playing-polaroid",     name: "Polaroid",          desc: "Tilted photo print",               w: 280, h: 330, category: "creative", supports: ["hidePaused"] },
  { id: "now-playing-crt",          name: "CRT TV",            desc: "Retro television set",             w: 360, h: 380, category: "creative", supports: ["hidePaused"] },
  { id: "now-playing-vu",           name: "VU Meter",          desc: "Dual equalizer meters",            w: 432, h: 90,  category: "creative", supports: ["hidePaused"] },
];

type Category = "all" | "normal" | "creative";

export default function SettingsPage() {
  const [selected, setSelected] = useState(WIDGETS[0]);
  const [filter, setFilter]     = useState<Category>("all");
  const [hidePaused, setHidePaused]       = useState(false);
  const [hideAlbumArt, setHideAlbumArt]   = useState(false);
  const [copied, setCopied]               = useState(false);

  const buildUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    const base   = window.location.origin;
    const params = new URLSearchParams();
    if (hidePaused)                                       params.set("hidePaused", "true");
    if (hideAlbumArt && selected.supports.includes("hideAlbumArt")) params.set("hideAlbumArt", "true");
    const qs = params.toString();
    return `${base}/${selected.id}${qs ? `?${qs}` : ""}`;
  }, [selected, hidePaused, hideAlbumArt]);

  const obsUrl = buildUrl();

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(obsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  const visible = WIDGETS.filter(w => filter === "all" || w.category === filter);

  // Scale iframe to fit inside 320px preview pane with 32px padding on the virtual page
  const PAD   = 32;
  const MAX_W = 320;
  const MAX_H = 480;
  const scale = Math.min(MAX_W / (selected.w + PAD), MAX_H / (selected.h + PAD), 1);
  const previewW = Math.round((selected.w + PAD) * scale);
  const previewH = Math.round((selected.h + PAD) * scale);

  return (
    <div className="min-h-screen bg-[#111] text-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Spotify Widget</h1>
          <p className="text-xs text-white/40 mt-0.5">OBS Configuration</p>
        </div>
        <a href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">← Home</a>
      </header>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Left — widget picker */}
        <aside className="w-[340px] shrink-0 border-r border-white/10 flex flex-col">
          {/* Filter tabs */}
          <div className="flex gap-1 p-4 border-b border-white/10">
            {(["all", "normal", "creative"] as Category[]).map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className="px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all"
                style={{
                  background: filter === cat ? "#1db954" : "rgba(255,255,255,0.07)",
                  color:      filter === cat ? "#000" : "rgba(255,255,255,0.55)",
                }}
              >{cat}</button>
            ))}
            <span className="ml-auto text-xs text-white/25 self-center">{visible.length} styles</span>
          </div>

          {/* Grid */}
          <div className="overflow-y-auto flex-1 p-4 grid grid-cols-2 gap-2 content-start">
            {visible.map(w => (
              <button key={w.id} onClick={() => setSelected(w)}
                className="text-left rounded-xl p-3 transition-all border"
                style={{
                  background: selected.id === w.id ? "rgba(29,185,84,0.12)" : "rgba(255,255,255,0.04)",
                  borderColor: selected.id === w.id ? "rgba(29,185,84,0.5)" : "rgba(255,255,255,0.08)",
                }}
              >
                <div className="text-[11px] font-bold truncate"
                  style={{ color: selected.id === w.id ? "#1db954" : "#fff" }}>{w.name}</div>
                <div className="text-[10px] text-white/35 mt-0.5 leading-snug">{w.desc}</div>
                <div className="text-[9px] text-white/20 mt-1.5 tabular-nums">{w.w} × {w.h}px</div>
              </button>
            ))}
          </div>
        </aside>

        {/* Right — config + preview */}
        <main className="flex-1 overflow-y-auto flex gap-8 p-8">

          {/* Config column */}
          <section className="flex flex-col gap-6 w-[280px] shrink-0">
            <div>
              <h2 className="text-base font-bold mb-1">{selected.name}</h2>
              <p className="text-xs text-white/40">{selected.desc}</p>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest">Options</h3>

              <label className="flex items-center justify-between cursor-pointer select-none">
                <div>
                  <div className="text-sm font-medium">Hide when paused</div>
                  <div className="text-xs text-white/35">Widget disappears when playback stops</div>
                </div>
                <Toggle value={hidePaused} onChange={setHidePaused} />
              </label>

              {selected.supports.includes("hideAlbumArt") && (
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div>
                    <div className="text-sm font-medium">Hide album art</div>
                    <div className="text-xs text-white/35">Text-only mode (Horizontal Bar only)</div>
                  </div>
                  <Toggle value={hideAlbumArt} onChange={setHideAlbumArt} />
                </label>
              )}
            </div>

            {/* OBS info */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest">OBS Browser Source</h3>
              <div className="rounded-lg p-3 text-xs text-white/50 flex flex-col gap-1"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex justify-between"><span>Width</span><span className="text-white/80 tabular-nums font-mono">{selected.w}px</span></div>
                <div className="flex justify-between"><span>Height</span><span className="text-white/80 tabular-nums font-mono">{selected.h}px</span></div>
                <div className="flex justify-between"><span>FPS</span><span className="text-white/80 tabular-nums font-mono">30</span></div>
                <div className="flex justify-between mt-1 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <span>Background</span><span className="text-white/80 font-mono">Transparent ✓</span>
                </div>
              </div>
            </div>

            {/* URL box */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest">Widget URL</h3>
              <div className="relative rounded-lg overflow-hidden"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="px-3 py-2.5 text-[11px] font-mono break-all text-white/60 pr-10"
                  style={{ lineHeight: 1.6 }}>{obsUrl}</div>
              </div>
              <button onClick={copyUrl}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: copied ? "rgba(29,185,84,0.2)" : "#1db954",
                  color:      copied ? "#1db954" : "#000",
                  border:     copied ? "1px solid #1db954" : "1px solid transparent",
                }}
              >{copied ? "Copied!" : "Copy URL"}</button>
            </div>
          </section>

          {/* Preview column */}
          <section className="flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest">Live Preview</h3>
              <a href={obsUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-white/30 hover:text-white/60 transition-colors">
                Open full size ↗
              </a>
            </div>

            {/* Iframe container */}
            <div className="rounded-xl overflow-hidden flex items-start justify-center p-4"
              style={{ background: "repeating-conic-gradient(rgba(255,255,255,0.03) 0% 25%, transparent 0% 50%) 0 0 / 16px 16px", minHeight: "400px" }}>
              <div className="relative overflow-hidden rounded"
                style={{ width: previewW, height: previewH }}>
                <iframe
                  key={obsUrl}
                  src={obsUrl}
                  style={{
                    width:  selected.w + PAD,
                    height: selected.h + PAD,
                    border: "none",
                    transformOrigin: "top left",
                    transform: `scale(${scale})`,
                    background: "transparent",
                  }}
                  scrolling="no"
                />
              </div>
            </div>

            <p className="text-xs text-white/25 text-center">
              Preview is live — it updates with your actual Spotify playback
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="relative shrink-0 rounded-full transition-all duration-200"
      style={{
        width: "40px", height: "22px",
        background: value ? "#1db954" : "rgba(255,255,255,0.15)",
      }}
    >
      <span className="absolute top-[3px] rounded-full bg-white transition-all duration-200"
        style={{ width: "16px", height: "16px", left: value ? "21px" : "3px" }} />
    </button>
  );
}
