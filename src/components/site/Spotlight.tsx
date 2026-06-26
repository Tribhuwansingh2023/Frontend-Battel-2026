import { useEffect, useRef } from "react";

/**
 * Cursor spotlight — a soft radial light that follows the pointer.
 * Pure DOM updates via rAF + transform. Disabled for coarse pointers
 * and prefers-reduced-motion users.
 */
export default function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    const apply = () => {
      const el = ref.current;
      if (el) el.style.transform = `translate3d(${x - 240}px, ${y - 240}px, 0)`;
      raf = 0;
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    apply();
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[1] h-[480px] w-[480px] rounded-full mix-blend-screen"
      style={{
        background: "radial-gradient(circle, hsl(48 100% 50% / 0.10), transparent 60%)",
        filter: "blur(20px)",
        transform: "translate3d(-9999px,-9999px,0)",
        willChange: "transform",
      }}
    />
  );
}
