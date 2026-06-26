import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";

type Step = {
  id: string;
  target: string; // css selector
  title: string;
  body: string;
  action?: { label: string; run: () => void };
};

const STEPS: Step[] = [
  {
    id: "hero",
    target: "#hero-title",
    title: "Welcome to Armory",
    body: "A 30-second tour of the things that make this site feel alive. You can skip any time with Esc.",
  },
  {
    id: "palette",
    target: "[data-tour='cmdk']",
    title: "Command palette",
    body: "Press ⌘K (Ctrl+K on Windows) anywhere to jump between sections, run actions, or search.",
    action: {
      label: "Try ⌘K",
      run: () =>
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true })),
    },
  },
  {
    id: "spotlight",
    target: "main",
    title: "Cursor spotlight",
    body: "Move your mouse — a soft light tracks the pointer using rAF + GPU transforms (disabled on touch & reduced motion).",
  },
  {
    id: "playground",
    target: "#playground",
    title: "Interactive playground",
    body: "Compose agent blocks and hit Run to play back a simulated trace without a single React re-render.",
  },
];

const KEY = "armory.onboarding.v1";

export default function Onboarding() {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  // open on demand or first visit
  useEffect(() => {
    const start = () => { setI(0); setOpen(true); };
    const onShortcut = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        start();
      }
    };
    window.addEventListener("armory:start-tour", start as EventListener);
    window.addEventListener("keydown", onShortcut);
    if (!localStorage.getItem(KEY)) {
      const t = setTimeout(start, 1200);
      return () => {
        clearTimeout(t);
        window.removeEventListener("armory:start-tour", start as EventListener);
        window.removeEventListener("keydown", onShortcut);
      };
    }
    return () => {
      window.removeEventListener("armory:start-tour", start as EventListener);
      window.removeEventListener("keydown", onShortcut);
    };
  }, []);

  // measure target
  useLayoutEffect(() => {
    if (!open) return;
    const s = STEPS[i];
    const el = document.querySelector(s.target) as HTMLElement | null;
    const measure = () => {
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // wait for scroll to settle
        setTimeout(() => setRect(el.getBoundingClientRect()), 320);
      } else {
        setRect(null);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [open, i]);

  // focus mgmt
  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => dialogRef.current?.focus());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      lastFocus.current?.focus?.();
    }
  }, [open]);

  const close = useCallback(() => {
    localStorage.setItem(KEY, "1");
    setOpen(false);
  }, []);

  const next = () => (i < STEPS.length - 1 ? setI(i + 1) : close());
  const back = () => i > 0 && setI(i - 1);

  // keyboard
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
      else if (e.key === "Tab") {
        // simple trap inside dialog
        const root = dialogRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, i]);

  if (!open) return null;
  const step = STEPS[i];

  // tooltip position: below highlight, fall back to center
  const pad = 10;
  let style: React.CSSProperties = {
    position: "fixed",
    left: "50%",
    top: "50%",
    transform: "translate(-50%,-50%)",
    maxWidth: 380,
    width: "calc(100vw - 32px)",
  };
  if (rect) {
    const below = rect.bottom + pad + 200 < window.innerHeight;
    const top = below ? rect.bottom + pad : Math.max(16, rect.top - 220);
    const left = Math.min(
      Math.max(16, rect.left + rect.width / 2 - 190),
      window.innerWidth - 396
    );
    style = { position: "fixed", top, left, width: 380, maxWidth: "calc(100vw - 32px)" };
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="tour-title" className="fixed inset-0 z-[80]">
      {/* SVG mask backdrop with cutout */}
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - 8}
                y={rect.top - 8}
                width={rect.width + 16}
                height={rect.height + 16}
                rx="14"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0" y="0" width="100%" height="100%"
          fill="hsl(200 60% 4% / 0.74)"
          mask="url(#tour-mask)"
        />
        {rect && (
          <rect
            x={rect.left - 8}
            y={rect.top - 8}
            width={rect.width + 16}
            height={rect.height + 16}
            rx="14"
            fill="none"
            stroke="var(--c-forsythia)"
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 14px rgba(255,200,1,.45))" }}
          />
        )}
      </svg>

      <div
        ref={dialogRef}
        tabIndex={-1}
        style={style}
        className="glass ring-grad rounded-2xl p-5 shadow-[0_30px_90px_-20px_rgba(0,0,0,.8)] focus:outline-none animate-[reveal_.18s_ease-out_forwards]"
      >
        <div className="flex items-center justify-between text-[11px] mono text-muted-foreground">
          <span>// step {i + 1} of {STEPS.length}</span>
          <button onClick={close} className="hover:text-foreground focus-ring rounded px-1" aria-label="Close tour">Skip</button>
        </div>
        <h2 id="tour-title" className="mt-2 text-xl font-semibold tracking-tight">{step.title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{step.body}</p>

        <div className="mt-4 flex items-center gap-1.5" aria-hidden>
          {STEPS.map((_, n) => (
            <span key={n} className={`h-1 rounded-full transition-all ${n === i ? "w-6 bg-[color:var(--c-forsythia)]" : "w-2 bg-foreground/15"}`} />
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            onClick={back}
            disabled={i === 0}
            className="btn-ghost text-xs mono px-3 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed focus-ring"
          >← Back</button>
          <div className="flex items-center gap-2">
            {step.action && (
              <button onClick={step.action.run} className="text-xs mono px-3 py-2 rounded-lg btn-ghost focus-ring">
                {step.action.label}
              </button>
            )}
            <button onClick={next} className="btn-primary text-xs mono px-3 py-2 rounded-lg font-semibold focus-ring">
              {i === STEPS.length - 1 ? "Done" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
