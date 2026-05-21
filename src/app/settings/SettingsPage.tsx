"use client";
import { useState, useCallback, type ReactNode } from "react";
import Link from "next/link";

const WIDGETS = [
  { id: "now-playing",              name: "Horizontal Bar",    desc: "Sleek pill with album art",        w: 432, h: 96,  category: "normal",   supports: ["hidePaused","hideAlbumArt","radius","blur","visualizer","accentColor"] },
  { id: "now-playing-card",         name: "Card",              desc: "Square album art card",            w: 252, h: 252, category: "normal",   supports: ["hidePaused","radius","visualizer","accentColor"] },
  { id: "now-playing-toast",        name: "Toast",             desc: "Minimal pill notification",        w: 332, h: 72,  category: "normal",   supports: ["hidePaused","radius","blur","visualizer","accentColor"] },
  { id: "now-playing-notification", name: "iOS Notification",  desc: "iOS-style lock screen card",       w: 352, h: 80,  category: "normal",   supports: ["hidePaused","radius","blur","accentColor"] },
  { id: "now-playing-centered",     name: "Centered",          desc: "Large album art, centered text",   w: 252, h: 290, category: "normal",   supports: ["hidePaused","radius","accentColor"] },
  { id: "now-playing-banner",       name: "Banner",            desc: "Wide blurred background strip",    w: 612, h: 104, category: "normal",   supports: ["hidePaused","radius","accentColor"] },
  { id: "now-playing-split",        name: "Split Panel",       desc: "Art + info side by side",          w: 432, h: 152, category: "normal",   supports: ["hidePaused","radius","accentColor"] },
  { id: "now-playing-vertical",     name: "Vertical",          desc: "Portrait-mode compact",            w: 242, h: 240, category: "normal",   supports: ["hidePaused","radius","visualizer","accentColor"] },
  { id: "now-playing-ticker",       name: "Ticker",            desc: "Scrolling marquee strip",          w: 552, h: 70,  category: "normal",   supports: ["hidePaused","radius","accentColor"] },
  { id: "now-playing-duotone",      name: "Duotone",           desc: "Diagonal gradient accent",         w: 432, h: 110, category: "creative", supports: ["hidePaused","radius","accentColor"] },
  { id: "now-playing-aura",         name: "Aura",              desc: "Full-viewport glowing background", w: 800, h: 600, category: "creative", supports: ["hidePaused","blur","visualizer","accentColor"] },
  { id: "now-playing-neon",         name: "Neon",              desc: "Cyberpunk neon glow",              w: 432, h: 110, category: "creative", supports: ["hidePaused","radius","accentColor"] },
  { id: "now-playing-cassette",     name: "Cassette",          desc: "Retro tape cassette",              w: 372, h: 210, category: "creative", supports: ["hidePaused","radius","accentColor"] },
  { id: "now-playing-turntable",    name: "Turntable",         desc: "Spinning vinyl record",            w: 312, h: 420, category: "creative", supports: ["hidePaused","blur","accentColor"] },
  { id: "now-playing-polaroid",     name: "Polaroid",          desc: "Tilted photo print",               w: 280, h: 330, category: "creative", supports: ["hidePaused","visualizer","accentColor"] },
  { id: "now-playing-crt",          name: "CRT TV",            desc: "Retro television set",             w: 360, h: 380, category: "creative", supports: ["hidePaused","accentColor"] },
  { id: "now-playing-vu",           name: "VU Meter",          desc: "Dual equalizer meters",            w: 432, h: 90,  category: "creative", supports: ["hidePaused","radius","visualizer","accentColor"] },
];

type Category = "all" | "normal" | "creative";

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={value} onClick={() => onChange(!value)}
      className="relative shrink-0 rounded-full transition-all duration-200"
      style={{ width:"40px", height:"22px", background: value ? "#1db954" : "rgba(255,255,255,0.15)" }}>
      <span className="absolute top-[3px] rounded-full bg-white transition-all duration-200"
        style={{ width:"16px", height:"16px", left: value ? "21px" : "3px" }} />
    </button>
  );
}

function Slider({ value, min, max, onChange, label, unit = "px" }:
  { value: number; min: number; max: number; onChange: (v: number) => void; label: string; unit?: string }) {
  return (
    <label className="flex flex-col gap-1.5 cursor-pointer">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-white/40 tabular-nums font-mono">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: "#1db954" }} />
    </label>
  );
}

export default function SettingsPage() {
  const [selected,      setSelected]      = useState(WIDGETS[0]);
  const [filter,        setFilter]        = useState<Category>("all");
  const [hidePaused,    setHidePaused]    = useState(false);
  const [hideAlbumArt,  setHideAlbumArt]  = useState(false);
  const [useAccent,     setUseAccent]     = useState(false);
  const [accentColor,   setAccentColor]   = useState("#1db954");
  const [useRadius,     setUseRadius]     = useState(false);
  const [radius,        setRadius]        = useState(12);
  const [useBlur,       setUseBlur]       = useState(false);
  const [blur,          setBlur]          = useState(12);
  const [visualizer,    setVisualizer]    = useState(true);
  const [copied,        setCopied]        = useState(false);

  const has = (f: string) => selected.supports.includes(f);

  const buildUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    const base   = window.location.origin;
    const params = new URLSearchParams();
    if (hidePaused)                             params.set("hidePaused",   "true");
    if (hideAlbumArt && has("hideAlbumArt"))    params.set("hideAlbumArt", "true");
    if (useAccent    && has("accentColor"))      params.set("accentColor",  accentColor.replace("#", ""));
    if (useRadius    && has("radius"))           params.set("radius",       radius.toString());
    if (useBlur      && has("blur"))             params.set("blur",         blur.toString());
    if (!visualizer  && has("visualizer"))       params.set("visualizer",   "false");
    const qs = params.toString();
    return `${base}/${selected.id}${qs ? `?${qs}` : ""}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, hidePaused, hideAlbumArt, useAccent, accentColor, useRadius, radius, useBlur, blur, visualizer]);

  const obsUrl = buildUrl();

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(obsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  }

  // Reset per-widget options when switching widget
  const selectWidget = (w: typeof WIDGETS[0]) => {
    setSelected(w);
    setUseRadius(false);
    setUseBlur(false);
  };

  const visible = WIDGETS.filter(w => filter === "all" || w.category === filter);

  const PAD   = 32;
  const MAX_W = 300;
  const MAX_H = 440;
  const scale = Math.min(MAX_W / (selected.w + PAD), MAX_H / (selected.h + PAD), 1);
  const previewW = Math.round((selected.w + PAD) * scale);
  const previewH = Math.round((selected.h + PAD) * scale);

  return (
    <div className="min-h-screen bg-[#111] text-white" style={{ fontFamily:"system-ui,sans-serif" }}>
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Spotify Widget</h1>
          <p className="text-xs text-white/40 mt-0.5">OBS Configuration</p>
        </div>
        <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">← Home</Link>
      </header>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Left — widget picker */}
        <aside className="w-[340px] shrink-0 border-r border-white/10 flex flex-col">
          <div className="flex gap-1 p-4 border-b border-white/10">
            {(["all","normal","creative"] as Category[]).map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className="px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all"
                style={{
                  background: filter===cat ? "#1db954" : "rgba(255,255,255,0.07)",
                  color:      filter===cat ? "#000"    : "rgba(255,255,255,0.55)",
                }}>{cat}</button>
            ))}
            <span className="ml-auto text-xs text-white/25 self-center">{visible.length} styles</span>
          </div>

          <div className="overflow-y-auto flex-1 p-4 grid grid-cols-2 gap-2 content-start">
            {visible.map(w => (
              <button key={w.id} onClick={() => selectWidget(w)}
                className="text-left rounded-xl p-3 transition-all border"
                style={{
                  background:   selected.id===w.id ? "rgba(29,185,84,0.12)" : "rgba(255,255,255,0.04)",
                  borderColor:  selected.id===w.id ? "rgba(29,185,84,0.5)"  : "rgba(255,255,255,0.08)",
                }}>
                <div className="text-[11px] font-bold truncate" style={{ color: selected.id===w.id ? "#1db954" : "#fff" }}>{w.name}</div>
                <div className="text-[10px] text-white/35 mt-0.5 leading-snug">{w.desc}</div>
                <div className="text-[9px] text-white/20 mt-1.5 tabular-nums">{w.w}×{w.h}px</div>
              </button>
            ))}
          </div>
        </aside>

        {/* Right */}
        <main className="flex-1 overflow-y-auto flex gap-8 p-8">
          {/* Config column */}
          <section className="flex flex-col gap-5 w-[290px] shrink-0">
            <div>
              <h2 className="text-base font-bold mb-1">{selected.name}</h2>
              <p className="text-xs text-white/40">{selected.desc}</p>
            </div>

            {/* Playback */}
            <Group label="Playback">
              <Row label="Hide when paused" sub="Widget disappears when playback stops">
                <Toggle value={hidePaused} onChange={setHidePaused} />
              </Row>
              {has("hideAlbumArt") && (
                <Row label="Hide album art" sub="Text-only mode">
                  <Toggle value={hideAlbumArt} onChange={setHideAlbumArt} />
                </Row>
              )}
            </Group>

            {/* Appearance */}
            <Group label="Appearance">
              {has("accentColor") && (
                <Row label="Custom accent color" sub="Override auto-extracted album color">
                  <div className="flex items-center gap-2">
                    {useAccent && (
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/20 cursor-pointer shrink-0">
                        <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)}
                          className="absolute inset-0 w-full h-full cursor-pointer opacity-0" />
                        <div className="absolute inset-0 rounded-lg" style={{ background: accentColor }} />
                      </div>
                    )}
                    <Toggle value={useAccent} onChange={v => { setUseAccent(v); }} />
                  </div>
                </Row>
              )}

              {has("radius") && (
                <div className="flex flex-col gap-2">
                  <Row label="Custom corner radius" sub="Override natural border radius">
                    <Toggle value={useRadius} onChange={setUseRadius} />
                  </Row>
                  {useRadius && (
                    <div className="pl-0 pt-1">
                      <Slider value={radius} min={0} max={24} onChange={setRadius} label="Radius" unit="px" />
                    </div>
                  )}
                </div>
              )}

              {has("blur") && (
                <div className="flex flex-col gap-2">
                  <Row label="Custom blur strength" sub="Background blur intensity">
                    <Toggle value={useBlur} onChange={setUseBlur} />
                  </Row>
                  {useBlur && (
                    <div className="pl-0 pt-1">
                      <Slider value={blur} min={0} max={40} onChange={setBlur} label="Blur" unit="px" />
                    </div>
                  )}
                </div>
              )}

              {has("visualizer") && (
                <Row label="Visualizer bars" sub="Animated equalizer bars">
                  <Toggle value={visualizer} onChange={setVisualizer} />
                </Row>
              )}
            </Group>

            {/* Custom widget teaser */}
            <div className="rounded-xl p-4 relative overflow-hidden"
              style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold">Custom Widget Builder</span>
                    <span className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-full"
                      style={{ background:"rgba(29,185,84,0.15)", color:"#1db954", border:"1px solid rgba(29,185,84,0.3)" }}>
                      Soon
                    </span>
                  </div>
                  <p className="text-xs text-white/35 leading-relaxed">
                    Design your own widget from scratch — pick layout, fonts, colors, and animations without writing code.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {["Layout editor","Font picker","Custom CSS","Animation presets","Export to OBS"].map(tag => (
                      <span key={tag} className="text-[9px] text-white/25 px-2 py-0.5 rounded-full"
                        style={{ border:"1px solid rgba(255,255,255,0.08)" }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background:"rgba(29,185,84,0.08)", border:"1px solid rgba(29,185,84,0.15)" }}>
                  🎨
                </div>
              </div>
            </div>

            {/* OBS info */}
            <Group label="OBS Browser Source">
              <div className="rounded-lg p-3 text-xs text-white/50 flex flex-col gap-1"
                style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex justify-between"><span>Width</span><span className="text-white/80 font-mono">{selected.w}px</span></div>
                <div className="flex justify-between"><span>Height</span><span className="text-white/80 font-mono">{selected.h}px</span></div>
                <div className="flex justify-between"><span>FPS</span><span className="text-white/80 font-mono">30</span></div>
                <div className="flex justify-between mt-1 pt-1" style={{ borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                  <span>Background</span><span className="text-white/80">Transparent ✓</span>
                </div>
              </div>
            </Group>

            {/* URL */}
            <Group label="Widget URL">
              <div className="rounded-lg px-3 py-2.5 text-[11px] font-mono break-all text-white/55"
                style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", lineHeight:1.6 }}>
                {obsUrl}
              </div>
              <button onClick={copyUrl}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all mt-1"
                style={{
                  background: copied ? "rgba(29,185,84,0.2)" : "#1db954",
                  color:      copied ? "#1db954" : "#000",
                  border:     copied ? "1px solid #1db954" : "1px solid transparent",
                }}>{copied ? "Copied!" : "Copy URL"}</button>
            </Group>
          </section>

          {/* Preview column */}
          <section className="flex flex-col gap-4 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest">Live Preview</h3>
              <a href={obsUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-white/30 hover:text-white/60 transition-colors">Open full size ↗</a>
            </div>

            <div className="rounded-xl overflow-hidden flex items-start justify-center p-4 flex-1"
              style={{ background:"repeating-conic-gradient(rgba(255,255,255,0.03) 0% 25%, transparent 0% 50%) 0 0/16px 16px", minHeight:"320px" }}>
              <div className="relative overflow-hidden rounded" style={{ width:previewW, height:previewH }}>
                <iframe key={obsUrl} src={obsUrl}
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
              Preview reflects live Spotify playback — make sure you&apos;re logged in
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest">{label}</h3>
      {children}
    </div>
  );
}

function Row({ label, sub, children }: { label: string; sub?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {sub && <div className="text-xs text-white/35 mt-0.5">{sub}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
