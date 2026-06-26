import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Lightweight a11y-correct modal:
 * - role="dialog" aria-modal
 * - ESC closes
 * - focus trap (cycles tab through interactive descendants)
 * - restores focus to the trigger on close
 * - locks body scroll
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "md" | "lg";
}) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = (document.activeElement as HTMLElement) ?? null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'
      ) ?? ([] as unknown as NodeListOf<HTMLElement>);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const list = Array.from(focusables());
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    // initial focus → first interactive
    requestAnimationFrame(() => {
      const list = focusables();
      (list[0] ?? panelRef.current)?.focus();
    });

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lastFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8"
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-[hsl(200_60%_4%/0.72)] backdrop-blur-sm animate-[reveal_.15s_ease-out_forwards] opacity-0"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`relative w-full ${
          size === "lg" ? "max-w-xl" : "max-w-md"
        } card-surface ring-grad rounded-2xl shadow-[0_40px_120px_-30px_rgba(0,0,0,.8)] overflow-hidden animate-[reveal_.2s_cubic-bezier(.16,1,.3,1)_forwards] opacity-0`}
        style={{ transform: "translateY(8px) scale(.985)" }}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-xl sm:text-2xl font-semibold tracking-tight">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1.5 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 h-9 w-9 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/[.06] focus-ring transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-6 pb-6 pt-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
