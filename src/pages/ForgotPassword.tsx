import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";

const schema = z.string().trim().email("Enter a valid email").max(255);

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { document.title = "Reset password · Armory"; }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      setStatus("error");
      return;
    }
    setStatus("loading");
    const { error: err } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (err) {
      setError(err.message);
      setStatus("error");
      toast.error("Couldn't send reset email", { description: err.message });
      return;
    }
    setStatus("ok");
    toast.success("Reset link sent", { description: `Check ${email}` });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full blur-3xl" style={{ background: "var(--c-forsythia)", opacity: 0.08 }} />
        </div>

        <div className="container-px mx-auto max-w-md">
          <div className="text-center">
            <p className="eyebrow">// recovery</p>
            <h1 className="mt-3 text-4xl sm:text-5xl tracking-tight">
              Forgot your <span className="accent-text">password?</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Enter your email and we'll send a reset link.
            </p>
          </div>

          <div className="mt-10 card-surface ring-grad rounded-2xl p-6 sm:p-7">
            {status === "ok" ? (
              <div className="text-center py-6">
                <div className="mx-auto h-10 w-10 rounded-full grid place-items-center border border-[color:var(--c-forsythia)]/30 bg-[color:var(--c-forsythia)]/10 text-[color:var(--c-forsythia)]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h2 className="mt-4 mono text-lg font-semibold">Email sent</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  If an account exists for <span className="text-foreground">{email}</span>, a reset link is on its way.
                </p>
                <Link to="/signin" className="btn-primary mono inline-flex mt-5 px-4 py-2 rounded-lg text-sm font-semibold">Back to sign in</Link>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs mono text-muted-foreground mb-1.5">Email</label>
                  <input
                    id="email" type="email" autoComplete="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!error}
                    placeholder="you@company.com"
                    className={`w-full px-3 py-2.5 rounded-lg bg-foreground/[.03] border text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--c-forsythia)]/20 transition ${error ? "border-[color:var(--c-saffron)]/60" : "border-foreground/10 focus:border-[color:var(--c-forsythia)]/40"}`}
                  />
                  {error && <p className="mt-1 text-[11px] text-[color:var(--c-saffron)]">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="btn-primary w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg focus-ring mono disabled:opacity-60"
                >
                  {status === "loading" && <Spinner />}
                  {status === "loading" ? "Sending…" : "Send reset link"}
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  Remembered it?{" "}
                  <Link to="/signin" className="text-[color:var(--c-forsythia)] hover:underline">Sign in</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" className="animate-spin" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeOpacity=".25" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
