import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Lazy-loaded video modal with custom controls + WebVTT captions.
 * The <video> source is only attached after the modal opens, so we
 * never download bytes for users who don't watch.
 */
export default function DemoModal() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [captionsOn, setCaptionsOn] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("armory:open-demo", onOpen);
    return () => window.removeEventListener("armory:open-demo", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === " " || e.key.toLowerCase() === "k") { e.preventDefault(); toggle(); }
      else if (e.key.toLowerCase() === "m") toggleMute();
      else if (e.key.toLowerCase() === "c") setCaptionsOn(v => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lastFocus.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // sync captions visibility
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    for (let i = 0; i < v.textTracks.length; i++) {
      v.textTracks[i].mode = captionsOn ? "showing" : "hidden";
    }
  }, [captionsOn, open]);

  const close = useCallback(() => {
    const v = videoRef.current;
    if (v) { v.pause(); }
    setOpen(false);
    setPlaying(false);
    setTime(0);
  }, []);

  const toggle = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };
  const toggleMute = () => {
    const v = videoRef.current; if (!v) return;
    v.muted = !v.muted; setMuted(v.muted);
  };
  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current; if (!v) return;
    v.currentTime = Number(e.target.value);
    setTime(v.currentTime);
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60); const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Product demo" className="fixed inset-0 z-[85] flex items-center justify-center p-4">
      <button aria-label="Close demo" onClick={close} className="absolute inset-0 bg-[hsl(200_60%_4%/0.8)] backdrop-blur-sm" />
      <div className="relative w-full max-w-4xl glass ring-grad rounded-2xl overflow-hidden shadow-[0_40px_120px_-20px_rgba(0,0,0,.9)] animate-[reveal_.2s_ease-out_forwards]">
        <div className="flex items-center justify-between px-4 h-11 border-b border-foreground/10">
          <p className="text-xs mono text-muted-foreground">// armory · 2-minute product tour</p>
          <button onClick={close} aria-label="Close" className="text-muted-foreground hover:text-foreground focus-ring rounded p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="relative bg-[hsl(200_60%_4%)] aspect-video">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            preload="metadata"
            playsInline
            muted={muted}
            poster="/svgs/chart-pie.svg"
            crossOrigin="anonymous"
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onEnded={() => setPlaying(false)}
            aria-label="Armory product demonstration"
          >
            {/* Lazy: src only injected here, browser fetches when modal mounts */}
            <source src="https://cdn.coverr.co/videos/coverr-typing-on-a-laptop-2961/1080p.mp4" type="video/mp4" />
            <track
              kind="captions"
              srcLang="en"
              label="English"
              default
              src={`data:text/vtt;base64,${btoa(`WEBVTT

00:00.000 --> 00:04.000
Welcome to Armory -- deploy production AI agents.

00:04.000 --> 00:09.000
Compose workflows visually in the playground.

00:09.000 --> 00:14.000
Toggle pricing across USD, EUR, and INR with zero re-renders.

00:14.000 --> 00:20.000
Ship faster with built-in observability and SSO.
`)}`}
            />
          </video>
          {!playing && (
            <button
              onClick={toggle}
              aria-label="Play"
              className="absolute inset-0 grid place-items-center group focus-ring"
            >
              <span className="h-20 w-20 rounded-full bg-[color:var(--c-forsythia)] text-[color:var(--c-oceanic)] grid place-items-center shadow-[0_20px_60px_-10px_rgba(255,200,1,.6)] transition-transform group-hover:scale-105">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7L8 5z"/></svg>
              </span>
            </button>
          )}
        </div>

        {/* Custom controls */}
        <div className="px-4 py-3 flex items-center gap-3 border-t border-foreground/10">
          <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="focus-ring rounded p-1">
            {playing ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7L8 5z"/></svg>
            )}
          </button>
          <span className="text-[11px] mono text-muted-foreground tabular-nums w-24">{fmt(time)} / {fmt(duration)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={time}
            onChange={seek}
            aria-label="Seek"
            className="flex-1 accent-[color:var(--c-forsythia)] h-1"
          />
          <button onClick={() => setCaptionsOn(v => !v)} aria-pressed={captionsOn} aria-label="Toggle captions"
            className={`text-[10px] mono px-2 py-1 rounded border focus-ring ${captionsOn ? "bg-[color:var(--c-forsythia)] text-[color:var(--c-oceanic)] border-[color:var(--c-forsythia)]" : "border-foreground/15 text-muted-foreground hover:text-foreground"}`}>CC</button>
          <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"} className="focus-ring rounded p-1 text-muted-foreground hover:text-foreground">
            {muted ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M11 5L6 9H3v6h3l5 4V5zM16 9l6 6M22 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M11 5L6 9H3v6h3l5 4V5zM16 8a5 5 0 010 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
