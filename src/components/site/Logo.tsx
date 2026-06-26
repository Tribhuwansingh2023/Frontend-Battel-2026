/**
 * Armory lightning-bolt mark — inspired by demo.mp4 brand mark, redrawn original.
 */
export default function Logo({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <path
        d="M14.5 2L4 13.4h6.2L9 22l10.5-11.4H13.3L14.5 2z"
        fill="currentColor"
      />
    </svg>
  );
}
