import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Cmd = {
  id: string;
  label: string;
  hint: string;
  /** route path the command navigates to */
  path: string;
  /** optional in-page anchor id to smooth-scroll into view */
  anchor?: string;
  kind: "nav" | "action";
  /** action name dispatched as `armory:<action>` */
  action?: "start-tour" | "open-demo";
};

const COMMANDS: Cmd[] = [
  { id: "home",       label: "Go home",            hint: "Hero section",        path: "/",         anchor: "top",        kind: "nav" },
  { id: "features",   label: "Platform features",  hint: "Bento grid",          path: "/",         anchor: "features",   kind: "nav" },
  { id: "playground", label: "Open Playground",    hint: "Interactive demo",    path: "/",         anchor: "playground", kind: "nav" },
  { id: "cases",      label: "Case studies",       hint: "Real customers",      path: "/",         anchor: "cases",      kind: "nav" },
  { id: "pricing",    label: "Pricing matrix",     hint: "USD · EUR · INR",     path: "/pricing",  anchor: "pricing",    kind: "nav" },
  { id: "estimator",  label: "Pricing estimator",  hint: "Slider-driven",       path: "/pricing",  anchor: "estimator",  kind: "nav" },
  { id: "faq",        label: "FAQ",                hint: "Common questions",    path: "/",         anchor: "faq",        kind: "nav" },
  { id: "about",      label: "About Armory",       hint: "Company",             path: "/about",                          kind: "nav" },
  { id: "contact",    label: "Contact sales",      hint: "Footer · talk to us", path: "/",         anchor: "footer",     kind: "nav" },
  { id: "book",       label: "Book a call",        hint: "30-minute intro",     path: "/book",                           kind: "nav" },
  { id: "articles",   label: "Articles",           hint: "Engineering notes",   path: "/articles",                       kind: "nav" },
  { id: "tour",       label: "Start guided tour",  hint: "30-second walkthrough", path: "",       kind: "action", action: "start-tour" },
  { id: "demo",       label: "Watch product demo", hint: "2-min video",         path: "",         kind: "action", action: "open-demo" },
];

// Anchor ids that participate in the scroll-spy (only those that exist on "/")
const SPY_IDS = ["features", "playground", "cases", "faq"] as const;

function scrollToAnchor(anchor: string) {
  if (anchor === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  if (anchor === "footer") {
    const el = document.querySelector("footer");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const el = document.getElementById(anchor);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // briefly highlight
    el.classList.add("cmdk-flash");
    window.setTimeout(() => el.classList.remove("cmdk-flash"), 1100);
  }
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const [activeAnchor, setActiveAnchor] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Filter
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return COMMANDS;
    return COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(s) ||
        c.hint.toLowerCase().includes(s) ||
        c.id.toLowerCase().includes(s)
    );
  }, [q]);

  // Global open/close shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus management + body scroll lock
  useEffect(() => {
    if (open) {
      lastFocus.current = (document.activeElement as HTMLElement) ?? null;
      setQ("");
      setIdx(0);
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      document.body.style.overflow = "";
      // restore focus to the element that opened the palette
      const el = lastFocus.current;
      if (el && typeof el.focus === "function") {
        requestAnimationFrame(() => el.focus());
      }
    }
  }, [open]);

  // Reset highlight when filter changes
  useEffect(() => {
    setIdx(0);
  }, [q]);

  // Keep highlighted item in view
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector<HTMLElement>(`[data-cmd-idx="${idx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [idx, open, filtered]);

  // Scroll spy — only on landing route
  useEffect(() => {
    if (pathname !== "/") {
      setActiveAnchor(pathname === "/pricing" ? "pricing" : "");
      return;
    }
    const sections = SPY_IDS.map((id) => document.getElementById(id)).filter(
      (n): n is HTMLElement => !!n
    );
    if (sections.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        // pick the entry with highest intersection ratio that's intersecting
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (best) setActiveAnchor(best.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sections.forEach((s) => io.observe(s));
    // initial: if scrolled to very top, highlight "top"
    const onScroll = () => {
      if (window.scrollY < 80) setActiveAnchor("top");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  const choose = useCallback(
    (c: Cmd) => {
      setOpen(false);
      if (c.kind === "action" && c.action) {
        window.dispatchEvent(new CustomEvent(`armory:${c.action}`));
        return;
      }
      const needsNav = c.path && c.path !== pathname;
      if (needsNav) {
        navigate(c.path);
        if (c.anchor) {
          // wait for route to mount, then scroll
          window.setTimeout(() => scrollToAnchor(c.anchor!), 120);
        }
      } else if (c.anchor) {
        scrollToAnchor(c.anchor);
      } else if (c.path) {
        navigate(c.path);
      }
    },
    [navigate, pathname]
  );

  // Dialog-level keys: arrows / enter / esc / tab trap
  const onDialogKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => (filtered.length ? (i + 1) % filtered.length : 0));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setIdx(0);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      setIdx(Math.max(0, filtered.length - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const c = filtered[idx];
      if (c) choose(c);
      return;
    }
    if (e.key === "Tab") {
      // Focus trap: only the input is tabbable inside; loop back to it.
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  if (!open) return null;
  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onKeyDown={onDialogKey}
      className="fixed inset-0 z-[70] flex items-start justify-center pt-[12vh] px-4"
    >
      <button
        type="button"
        aria-label="Close command palette"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-[hsl(200_60%_4%/0.7)] backdrop-blur-sm"
      />
      <div
        className="relative w-full max-w-xl glass ring-grad rounded-2xl overflow-hidden shadow-[0_40px_120px_-30px_rgba(0,0,0,.8)] animate-[reveal_.18s_ease-out_forwards]"
      >
        <div className="flex items-center gap-3 px-4 h-12 border-b border-foreground/10">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="text-muted-foreground">
            <path d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search commands, jump to section…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            aria-label="Search commands"
            aria-autocomplete="list"
            aria-controls="cmdk-list"
            aria-activedescendant={filtered[idx] ? `cmdk-${filtered[idx].id}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden sm:inline-block text-[10px] mono px-1.5 py-0.5 rounded border border-foreground/15 text-muted-foreground">ESC</kbd>
        </div>
        <ul ref={listRef} id="cmdk-list" role="listbox" aria-label="Commands" className="max-h-[50vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <li className="p-6 text-sm text-muted-foreground text-center">No matches for "{q}"</li>
          ) : (
            filtered.map((c, i) => {
              const isActiveSection =
                c.kind === "nav" &&
                ((c.anchor && c.anchor === activeAnchor) ||
                  (!c.anchor && c.path === pathname));
              return (
                <li key={c.id}>
                  <button
                    id={`cmdk-${c.id}`}
                    type="button"
                    role="option"
                    aria-selected={i === idx}
                    data-cmd-idx={i}
                    onMouseEnter={() => setIdx(i)}
                    onClick={() => choose(c)}
                    className={`w-full text-left flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      i === idx ? "bg-foreground/[.08]" : "hover:bg-foreground/[.04]"
                    }`}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span
                        className={`h-6 w-6 grid place-items-center rounded-md text-[10px] mono ${
                          c.kind === "action"
                            ? "bg-[color:var(--c-forsythia)]/15 text-[color:var(--c-forsythia)] border border-[color:var(--c-forsythia)]/25"
                            : "bg-foreground/[.05] text-muted-foreground border border-foreground/10"
                        }`}
                      >
                        {c.kind === "action" ? "↗" : "#"}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="block text-sm font-medium truncate">{c.label}</span>
                          {isActiveSection && (
                            <span className="text-[9px] mono px-1.5 py-0.5 rounded border border-[color:var(--c-forsythia)]/40 text-[color:var(--c-forsythia)]">
                              ACTIVE
                            </span>
                          )}
                        </span>
                        <span className="block text-[11px] text-muted-foreground truncate">{c.hint}</span>
                      </span>
                    </span>
                    {i === idx && <span className="text-[10px] mono text-muted-foreground">↵</span>}
                  </button>
                </li>
              );
            })
          )}
        </ul>
        <div className="flex items-center justify-between px-4 h-9 border-t border-foreground/10 text-[11px] text-muted-foreground mono">
          <span>
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </span>
          <span className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded border border-foreground/15">↑↓</kbd> navigate
            <kbd className="px-1.5 py-0.5 rounded border border-foreground/15">↵</kbd> select
            <kbd className="px-1.5 py-0.5 rounded border border-foreground/15">esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
