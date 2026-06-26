import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Global keyboard shortcuts (Gmail-style two-key + single-key).
 *
 *  ⌘K / Ctrl+K  — handled by CommandPalette
 *  ?            — open onboarding tour
 *  g h          — go home          g p — pricing       g a — about
 *  g c          — contact          g f — playground    g b — book a call
 *  /            — focus command palette search
 *  Esc          — close overlays  (handled per-overlay)
 */
export default function GlobalShortcuts() {
  const navigate = useNavigate();
  const [hint, setHint] = useState<string>("");

  useEffect(() => {
    let leader = false;
    let leaderTimer: number | undefined;
    const clearLeader = () => { leader = false; setHint(""); if (leaderTimer) window.clearTimeout(leaderTimer); };

    const map: Record<string, () => void> = {
      h: () => navigate("/"),
      p: () => navigate("/pricing"),
      a: () => navigate("/about"),
      c: () => navigate("/contact"),
      b: () => navigate("/book"),
      f: () => navigate("/#playground"),
      t: () => window.dispatchEvent(new CustomEvent("armory:start-tour")),
      d: () => window.dispatchEvent(new CustomEvent("armory:open-demo")),
    };

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isField = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
      if (isField) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (leader) {
        const fn = map[e.key.toLowerCase()];
        if (fn) { e.preventDefault(); fn(); }
        clearLeader();
        return;
      }
      if (e.key === "g") {
        leader = true;
        setHint("g …");
        leaderTimer = window.setTimeout(clearLeader, 1300);
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true }));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); if (leaderTimer) window.clearTimeout(leaderTimer); };
  }, [navigate]);

  if (!hint) return null;
  return (
    <div aria-live="polite" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] glass ring-grad rounded-full px-4 py-2 text-xs mono text-muted-foreground animate-[reveal_.15s_ease-out_forwards]">
      <span className="text-[color:var(--c-forsythia)]">{hint}</span> — press h · p · a · c · b · f · t · d
    </div>
  );
}
