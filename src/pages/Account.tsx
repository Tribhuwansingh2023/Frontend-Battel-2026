import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Profile = { id: string; full_name: string | null; email: string | null; created_at: string; updated_at: string };

const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(80);
const pwSchema = z.string().min(8, "Password must be at least 8 characters").max(72);

export default function Account() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Profile form
  const [fullName, setFullName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Password form
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  // Danger zone
  const [globalOut, setGlobalOut] = useState(false);

  // Theme
  const [theme, setTheme] = useState<"dark" | "light">(() => (typeof document !== "undefined" && document.documentElement.classList.contains("light")) ? "light" : "dark");

  useEffect(() => { document.title = "Account · Armory"; }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
      setLoadingProfile(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at, updated_at")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const p = data as Profile | null;
      setProfile(p);
      setFullName(p?.full_name ?? "");
      setLoadingProfile(false);
    }
    load();

    const channel = supabase
      .channel(`profile-account:${user.id}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload) => {
          if (payload.new) {
            const p = payload.new as Profile;
            setProfile(p);
            setFullName((cur) => (cur === (profile?.full_name ?? "") ? p.full_name ?? "" : cur));
          }
        })
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const created = useMemo(
    () => (user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—"),
    [user]
  );
  const lastSignIn = useMemo(
    () => (user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "—"),
    [user]
  );

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setNameError(null);
    const parsed = nameSchema.safeParse(fullName);
    if (!parsed.success) { setNameError(parsed.error.issues[0].message); return; }
    if (!user) return;
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: parsed.data, email: user.email ?? null }, { onConflict: "id" });
    setSavingName(false);
    if (error) { toast.error("Couldn't save name", { description: error.message }); return; }
    toast.success("Profile updated");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    const parsed = pwSchema.safeParse(newPw);
    if (!parsed.success) { setPwError(parsed.error.issues[0].message); return; }
    if (newPw !== confirmPw) { setPwError("Passwords do not match"); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    setSavingPw(false);
    if (error) { toast.error("Couldn't update password", { description: error.message }); return; }
    setNewPw(""); setConfirmPw("");
    toast.success("Password updated");
  }

  async function signOutEverywhere() {
    setGlobalOut(true);
    const { error } = await supabase.auth.signOut({ scope: "global" });
    setGlobalOut(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Signed out of all devices");
    navigate("/", { replace: true });
  }

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out");
    navigate("/", { replace: true });
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("light", next === "light");
    setTheme(next);
    toast(`Theme: ${next}`);
  }

  function copy(value: string, label: string) {
    navigator.clipboard.writeText(value).then(() => toast.success(`${label} copied`));
  }

  const initials = (profile?.full_name?.trim() || user?.email || "·")
    .split(/\s+|@/)[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full blur-3xl" style={{ background: "var(--c-forsythia)", opacity: 0.07 }} />
          <div className="absolute -bottom-40 -left-40 h-[32rem] w-[32rem] rounded-full blur-3xl" style={{ background: "var(--c-saffron)", opacity: 0.05 }} />
        </div>

        <div className="container-px mx-auto max-w-3xl">
          <p className="eyebrow">// settings</p>
          <h1 className="mt-3 text-4xl sm:text-5xl tracking-tight">
            Your <span className="accent-text">account.</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">Manage profile, security, and workspace preferences.</p>

          {/* Profile card */}
          <section className="mt-10 card-surface ring-grad rounded-2xl p-6 sm:p-7">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl grid place-items-center mono text-base font-semibold border border-[color:var(--c-forsythia)]/30 bg-[color:var(--c-forsythia)]/10 text-[color:var(--c-forsythia)]">
                {initials}
              </div>
              <div className="min-w-0">
                <h2 className="mono text-lg font-semibold">Profile</h2>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={saveName} className="mt-6 space-y-4">
              <div>
                <label htmlFor="fname" className="block text-xs mono text-muted-foreground mb-1.5">Full name</label>
                <input
                  id="fname" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  disabled={loadingProfile}
                  aria-invalid={!!nameError}
                  className={`w-full px-3 py-2.5 rounded-lg bg-foreground/[.03] border text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--c-forsythia)]/20 transition disabled:opacity-60 ${nameError ? "border-[color:var(--c-saffron)]/60" : "border-foreground/10 focus:border-[color:var(--c-forsythia)]/40"}`}
                />
                {nameError && <p className="mt-1 text-[11px] text-[color:var(--c-saffron)]">{nameError}</p>}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit" disabled={savingName || loadingProfile}
                  className="btn-primary inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg focus-ring mono disabled:opacity-60"
                >
                  {savingName && <Spinner />} Save changes
                </button>
                {profile?.updated_at && (
                  <span className="text-[11px] mono text-muted-foreground">
                    last saved {new Date(profile.updated_at).toLocaleString()}
                  </span>
                )}
              </div>
            </form>
          </section>

          {/* Security card */}
          <section className="mt-6 card-surface ring-grad rounded-2xl p-6 sm:p-7">
            <h2 className="mono text-lg font-semibold">Security</h2>
            <p className="mt-1 text-xs text-muted-foreground">Update your password. Use 8+ characters with a mix of letters, numbers and symbols.</p>

            <form onSubmit={changePassword} className="mt-5 space-y-4">
              <div>
                <label htmlFor="np" className="block text-xs mono text-muted-foreground mb-1.5">New password</label>
                <div className="relative">
                  <input
                    id="np" type={showPw ? "text" : "password"} required minLength={8}
                    value={newPw} onChange={(e) => setNewPw(e.target.value)}
                    aria-invalid={!!pwError}
                    className={`w-full px-3 py-2.5 pr-12 rounded-lg bg-foreground/[.03] border text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--c-forsythia)]/20 transition ${pwError ? "border-[color:var(--c-saffron)]/60" : "border-foreground/10 focus:border-[color:var(--c-forsythia)]/40"}`}
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)} className="absolute inset-y-0 right-2 my-auto h-7 px-2 text-[10px] mono text-muted-foreground hover:text-foreground rounded-md focus-ring">
                    {showPw ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="cp" className="block text-xs mono text-muted-foreground mb-1.5">Confirm password</label>
                <input
                  id="cp" type={showPw ? "text" : "password"} required minLength={8}
                  value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-foreground/[.03] border border-foreground/10 text-sm focus:outline-none focus:border-[color:var(--c-forsythia)]/40 focus:ring-2 focus:ring-[color:var(--c-forsythia)]/20 transition"
                />
                {pwError && <p className="mt-1 text-[11px] text-[color:var(--c-saffron)]">{pwError}</p>}
              </div>
              <button
                type="submit" disabled={savingPw}
                className="btn-primary inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg focus-ring mono disabled:opacity-60"
              >
                {savingPw && <Spinner />} Update password
              </button>
            </form>
          </section>

          {/* Session + preferences */}
          <section className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="card-surface ring-grad rounded-2xl p-6">
              <h2 className="mono text-lg font-semibold">Session</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <Row label="User ID" value={user?.id ?? "—"} mono onCopy={() => user?.id && copy(user.id, "User ID")} />
                <Row label="Email confirmed" value={user?.email_confirmed_at ? "Yes" : "No"} />
                <Row label="Created" value={created} />
                <Row label="Last sign-in" value={lastSignIn} />
              </dl>
            </div>
            <div className="card-surface ring-grad rounded-2xl p-6">
              <h2 className="mono text-lg font-semibold">Preferences</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm">Theme</p>
                    <p className="text-xs text-muted-foreground">Switch between light and dark.</p>
                  </div>
                  <button onClick={toggleTheme} className="text-xs mono px-3 py-1.5 rounded-lg border border-foreground/10 bg-foreground/[.03] hover:bg-foreground/[.06] transition-colors focus-ring">
                    {theme === "dark" ? "Dark" : "Light"}
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm">Command palette</p>
                    <p className="text-xs text-muted-foreground">Open with ⌘K from anywhere.</p>
                  </div>
                  <button
                    onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true }))}
                    className="text-xs mono px-3 py-1.5 rounded-lg border border-foreground/10 bg-foreground/[.03] hover:bg-foreground/[.06] transition-colors focus-ring"
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Danger zone */}
          <section className="mt-6 rounded-2xl p-6 sm:p-7 border border-[color:var(--c-saffron)]/30 bg-[color:var(--c-saffron)]/[.03]">
            <h2 className="mono text-lg font-semibold text-[color:var(--c-saffron)]">Danger zone</h2>
            <p className="mt-1 text-xs text-muted-foreground">These actions affect every device signed into this account.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={handleSignOut}
                className="text-sm px-3.5 py-2 rounded-lg border border-foreground/10 bg-foreground/[.03] hover:bg-foreground/[.06] transition-colors focus-ring mono"
              >
                Sign out
              </button>
              <button
                onClick={signOutEverywhere} disabled={globalOut}
                className="text-sm px-3.5 py-2 rounded-lg border border-[color:var(--c-saffron)]/40 text-[color:var(--c-saffron)] hover:bg-[color:var(--c-saffron)]/10 transition-colors focus-ring mono disabled:opacity-60 inline-flex items-center gap-2"
              >
                {globalOut && <Spinner />} Sign out of all devices
              </button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Row({ label, value, mono, onCopy }: { label: string; value: string; mono?: boolean; onCopy?: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-xs text-muted-foreground shrink-0 w-28">{label}</dt>
      <dd className={`min-w-0 flex-1 text-right truncate ${mono ? "mono text-[11px]" : "text-sm"}`}>{value}</dd>
      {onCopy && (
        <button onClick={onCopy} className="shrink-0 text-[10px] mono px-2 py-1 rounded-md border border-foreground/10 hover:bg-foreground/[.06] transition-colors focus-ring" aria-label={`Copy ${label}`}>
          Copy
        </button>
      )}
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
