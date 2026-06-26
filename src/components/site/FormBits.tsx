/**
 * Shared form primitives for the pricing modals.
 * Token-driven styling (no hardcoded color literals).
 */

export function Field({
  id, label, type = "text", value, onChange, error, autoComplete, placeholder,
}: {
  id: string; label: string; type?: string;
  value: string; onChange: (v: string) => void;
  error?: string; autoComplete?: string; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] mono text-muted-foreground mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`w-full px-3 py-2.5 rounded-lg bg-foreground/[.03] border text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--c-forsythia)]/20 transition ${
          error ? "border-[color:var(--c-saffron)]/60" : "border-foreground/10 focus:border-[color:var(--c-forsythia)]/40"
        }`}
      />
      {error && <p id={`${id}-err`} className="mt-1 text-[11px] text-[color:var(--c-saffron)]">{error}</p>}
    </div>
  );
}

export function Select({
  id, label, value, onChange, error, options, placeholder,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; error?: string;
  options: string[]; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] mono text-muted-foreground mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`w-full px-3 py-2.5 rounded-lg bg-foreground/[.03] border text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--c-forsythia)]/20 transition appearance-none ${
          error ? "border-[color:var(--c-saffron)]/60" : "border-foreground/10 focus:border-[color:var(--c-forsythia)]/40"
        } ${value ? "text-foreground" : "text-muted-foreground/70"}`}
      >
        <option value="" disabled>{placeholder ?? "Select…"}</option>
        {options.map((o) => <option key={o} value={o} className="text-foreground bg-[color:var(--c-oceanic)]">{o}</option>)}
      </select>
      {error && <p id={`${id}-err`} className="mt-1 text-[11px] text-[color:var(--c-saffron)]">{error}</p>}
    </div>
  );
}

export function TextArea({
  id, label, value, onChange, error, placeholder, rows = 3,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; error?: string;
  placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] mono text-muted-foreground mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`w-full px-3 py-2.5 rounded-lg bg-foreground/[.03] border text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--c-forsythia)]/20 transition resize-y ${
          error ? "border-[color:var(--c-saffron)]/60" : "border-foreground/10 focus:border-[color:var(--c-forsythia)]/40"
        }`}
      />
      {error && <p id={`${id}-err`} className="mt-1 text-[11px] text-[color:var(--c-saffron)]">{error}</p>}
    </div>
  );
}

export function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="btn-primary w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg focus-ring mono disabled:opacity-60 hover:-translate-y-[1px] active:translate-y-0 transition-transform duration-200"
    >
      {loading && (
        <svg width="14" height="14" viewBox="0 0 24 24" className="animate-spin" aria-hidden>
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeOpacity=".25" />
          <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}
      {loading ? "Submitting…" : label}
      {!loading && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
