import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({});
  const [ready, setReady] = useState(false);

  useEffect(() => { document.title = "Set new password · Armory"; }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fe: typeof errors = {};
    if (password.length < 8) fe.password = "Password must be at least 8 characters";
    if (password !== confirm) fe.confirm = "Passwords do not match";
    if (Object.keys(fe).length) { setErrors(fe); setStatus("error"); return; }
    setErrors({});
    setStatus("loading");
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setErrors({ form: err.message });
      setStatus("error");
      toast.error("Couldn't update password", { description: err.message });
      return;
    }
    setStatus("ok");
    toast.success("Password updated");
    setTimeout(() => navigate("/dashboard", { replace: true }), 900);
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
              Set a new <span className="accent-text">password.</span>
            </h1>
          </div>

          <div className="mt-10 card-surface ring-grad rounded-2xl p-6 sm:p-7">
            {!ready ? (
              <p className="text-sm text-muted-foreground text-center">
                Waiting for the recovery link… If nothing happens,{" "}
                <Link to="/forgot-password" className="text-[color:var(--c-forsythia)] hover:underline">request a new one</Link>.
              </p>
            ) : status === "ok" ? (
              <p className="text-sm text-center text-foreground">Password updated. Redirecting…</p>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-4">
                <div>
                  <label htmlFor="pw" className="block text-xs mono text-muted-foreground mb-1.5">New password</label>
                  <div className="relative">
                    <input
                      id="pw" type={show ? "text" : "password"} required minLength={8}
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={!!errors.password}
                      className={`w-full px-3 py-2.5 pr-12 rounded-lg bg-foreground/[.03] border text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--c-forsythia)]/20 transition ${errors.password ? "border-[color:var(--c-saffron)]/60" : "border-foreground/10 focus:border-[color:var(--c-forsythia)]/40"}`}
                    />
                    <button type="button" onClick={() => setShow(s => !s)} className="absolute inset-y-0 right-2 my-auto h-7 px-2 text-[10px] mono text-muted-foreground hover:text-foreground rounded-md focus-ring">
                      {show ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-[11px] text-[color:var(--c-saffron)]">{errors.password}</p>}
                </div>
                <div>
                  <label htmlFor="pw2" className="block text-xs mono text-muted-foreground mb-1.5">Confirm password</label>
                  <input
                    id="pw2" type={show ? "text" : "password"} required minLength={8}
                    value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    aria-invalid={!!errors.confirm}
                    className={`w-full px-3 py-2.5 rounded-lg bg-foreground/[.03] border text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--c-forsythia)]/20 transition ${errors.confirm ? "border-[color:var(--c-saffron)]/60" : "border-foreground/10 focus:border-[color:var(--c-forsythia)]/40"}`}
                  />
                  {errors.confirm && <p className="mt-1 text-[11px] text-[color:var(--c-saffron)]">{errors.confirm}</p>}
                </div>
                {errors.form && (
                  <div role="alert" className="rounded-lg border border-[color:var(--c-saffron)]/30 bg-[color:var(--c-saffron)]/5 px-3 py-2 text-xs text-[color:var(--c-saffron)]">
                    {errors.form}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="btn-primary w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg focus-ring mono disabled:opacity-60"
                >
                  {status === "loading" && <Spinner />}
                  {status === "loading" ? "Updating…" : "Update password"}
                </button>
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
