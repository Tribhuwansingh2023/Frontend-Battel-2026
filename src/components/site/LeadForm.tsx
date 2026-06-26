import { useRef, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const ENDPOINT = "/api/leads"; // user backend endpoint

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

export default function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>("");
  const startedAt = useRef<number>(Date.now());

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const company = String(fd.get("company") || "").trim();
    const message = String(fd.get("message") || "").trim();
    const website = String(fd.get("website") || ""); // honeypot
    const elapsed = Date.now() - startedAt.current;

    const errs: Record<string, string> = {};
    if (!name || name.length < 2) errs.name = "Please enter your name.";
    if (name.length > 80) errs.name = "Name is too long.";
    if (!validateEmail(email)) errs.email = "Enter a valid email.";
    if (message.length > 1000) errs.message = "Keep it under 1000 characters.";

    // Spam protection: honeypot must be empty + form must have been visible >1.5s
    if (website) errs._spam = "Blocked.";
    if (elapsed < 1500) errs._spam = "Please try again.";

    setErrors(errs);
    if (Object.keys(errs).length) return;

    setStatus("submitting");
    setServerError("");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Armory-Client": "web" },
        body: JSON.stringify({ name, email, company, message, ts: Date.now() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : "Network error");
    }
  };

  if (status === "success") {
    return (
      <div role="status" aria-live="polite" className="card-surface ring-grad p-8 text-center animate-[reveal_.3s_ease-out_forwards]">
        <div className="mx-auto h-12 w-12 rounded-full grid place-items-center bg-[color:var(--c-forsythia)] text-[color:var(--c-oceanic)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h3 className="mt-4 text-xl font-semibold">You're on the list.</h3>
        <p className="mt-2 text-sm text-muted-foreground">A solutions engineer will reach out within one business day.</p>
        <button onClick={() => setStatus("idle")} className="mt-5 btn-ghost text-xs mono px-3 py-2 rounded-lg focus-ring">
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="card-surface ring-grad p-6 space-y-4" aria-describedby="lead-help">
      <p id="lead-help" className="eyebrow">// talk to sales</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name" name="name" required error={errors.name} autoComplete="name" />
        <Field label="Work email" name="email" type="email" required error={errors.email} autoComplete="email" />
      </div>
      <Field label="Company" name="company" autoComplete="organization" />
      <div>
        <label htmlFor="lead-message" className="eyebrow block mb-1.5">Message</label>
        <textarea
          id="lead-message"
          name="message"
          rows={4}
          maxLength={1000}
          className="w-full px-3 py-2.5 rounded-lg bg-foreground/5 border border-foreground/10 focus-ring text-sm mono resize-y"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "msg-err" : undefined}
        />
        {errors.message && <p id="msg-err" className="mt-1 text-xs text-destructive">{errors.message}</p>}
      </div>

      {/* Honeypot — invisible to humans, attractive to bots */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website<input tabIndex={-1} autoComplete="off" name="website" type="text" /></label>
      </div>

      {status === "error" && (
        <div role="alert" className="text-sm rounded-lg border border-destructive/40 bg-destructive/10 text-destructive-foreground px-3 py-2">
          Couldn't submit ({serverError || "unknown"}). Please retry or email <a className="underline" href="mailto:sales@armory.dev">sales@armory.dev</a>.
        </div>
      )}
      {errors._spam && (
        <div role="alert" className="text-xs text-destructive">{errors._spam}</div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">Protected by honeypot & rate limit. We never share your data.</p>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-primary mono inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold focus-ring disabled:opacity-60"
        >
          {status === "submitting" ? (
            <>
              <span className="h-3 w-3 rounded-full border-2 border-[color:var(--c-oceanic)] border-r-transparent animate-spin" />
              Sending…
            </>
          ) : (
            <>Send message
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label, name, type = "text", required, error, autoComplete,
}: {
  label: string; name: string; type?: string; required?: boolean; error?: string; autoComplete?: string;
}) {
  const id = `lead-${name}`;
  return (
    <div>
      <label htmlFor={id} className="eyebrow block mb-1.5">{label}{required && <span aria-hidden> *</span>}</label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className="w-full px-3 py-2.5 rounded-lg bg-foreground/5 border border-foreground/10 focus-ring text-sm mono"
      />
      {error && <p id={`${id}-err`} className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
