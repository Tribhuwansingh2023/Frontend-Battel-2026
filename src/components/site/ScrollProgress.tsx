import { useEffect, useRef } from "react";

/**
 * Scroll progress bar — imperative DOM updates via rAF, zero re-renders.
 */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      el.style.transform = `scaleX(${pct / 100})`;
      raf = 0;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div aria-hidden className="fixed top-0 inset-x-0 z-[60] h-[2px] bg-transparent pointer-events-none">
      <div
        ref={ref}
        className="h-full origin-left"
        style={{
          background: "linear-gradient(90deg, var(--c-forsythia), var(--c-saffron))",
          transform: "scaleX(0)",
          willChange: "transform",
          boxShadow: "0 0 12px hsl(48 100% 50% / 0.6)",
        }}
      />
    </div>
  );
}
