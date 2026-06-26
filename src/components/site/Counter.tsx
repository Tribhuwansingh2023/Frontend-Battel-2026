import { memo, useEffect, useRef } from "react";

type Props = {
  /** Final numeric value (use the digit portion only, e.g. 97 for "97%"). */
  value: number;
  /** Optional decimals (e.g. 2 → "12.40"). */
  decimals?: number;
  /** Optional string prefix, e.g. "$". */
  prefix?: string;
  /** Optional string suffix, e.g. "%", "ms", "×", "B". */
  suffix?: string;
  /** Animation duration in ms. */
  duration?: number;
  className?: string;
};

/**
 * Count-up display that plays once when scrolled into view.
 * Imperative — does not re-render React on each tick.
 */
export default memo(function Counter({
  value, decimals = 0, prefix = "", suffix = "", duration = 1400, className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
      return;
    }

    let raf = 0;
    let start = 0;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const v = value * ease(p);
      el.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            raf = requestAnimationFrame(tick);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => { io.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [value, decimals, prefix, suffix, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
});
