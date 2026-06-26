import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, BookOpen, Bot, CheckCircle2,
  CircleDot, Cpu, Database, Download, GitBranch, Globe, KeyRound, Plus,
  PlayCircle, Plug, Rocket, Search, Server, Settings, Shield, Sparkles,
  TerminalSquare, TrendingUp, Users, Workflow, Zap,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Profile = { id: string; full_name: string | null; email: string | null; created_at: string; updated_at: string };
type Range = "24h" | "7d" | "30d";

/* ----------------------------- deterministic data ----------------------------- */
// Seeded PRNG so the dashboard feels alive but doesn't reshuffle on every render.
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSeries(range: Range) {
  const points = range === "24h" ? 24 : range === "7d" ? 7 : 30;
  const rnd = mulberry32(range === "24h" ? 7 : range === "7d" ? 21 : 99);
  return Array.from({ length: points }, (_, i) => {
    const base = 1200 + Math.sin(i / 2.4) * 380 + rnd() * 240;
    return {
      label: range === "24h" ? `${String(i).padStart(2, "0")}:00` : `D${i + 1}`,
      events: Math.round(base * (range === "30d" ? 6 : range === "7d" ? 24 : 1)),
      errors: Math.round((rnd() * 18 + Math.max(0, Math.sin(i / 3) * 12))),
      latency: Math.round(120 + rnd() * 70 + Math.sin(i / 4) * 22),
    };
  });
}

const KPIS = (range: Range) => {
  const m = range === "24h" ? 1 : range === "7d" ? 6.8 : 28.3;
  return [
    { k: "Events processed", v: Math.round(38_420 * m).toLocaleString(), d: "+12.4%", up: true, icon: Activity, hint: "vs previous period" },
    { k: "Active agents", v: "14", d: "+2", up: true, icon: Bot, hint: "deployed across 3 envs" },
    { k: "Avg latency", v: `${range === "24h" ? 142 : 138}ms`, d: "−6.1%", up: true, icon: Zap, hint: "p95 across edges" },
    { k: "Error rate", v: "0.43%", d: "−0.08", up: true, icon: Shield, hint: "rolling 60-min" },
  ];
};

const PIPELINES = [
  { id: "p_8a21", name: "Stripe → Warehouse", status: "Healthy", runs: 18420, success: 99.92, owner: "Aria", env: "prod" },
  { id: "p_71fc", name: "Lead enrichment", status: "Healthy", runs: 9_842, success: 99.61, owner: "Mei", env: "prod" },
  { id: "p_5e0b", name: "Churn classifier", status: "Degraded", runs: 4_120, success: 96.4, owner: "Jonas", env: "staging" },
  { id: "p_22aa", name: "Support triage", status: "Healthy", runs: 12_004, success: 99.81, owner: "Priya", env: "prod" },
  { id: "p_0c19", name: "Inventory sync", status: "Paused", runs: 0, success: 0, owner: "Diego", env: "dev" },
];

const AGENTS = [
  { name: "Atlas", role: "Routing", calls: 7321, ok: 99.7 },
  { name: "Vesper", role: "Classifier", calls: 4180, ok: 98.9 },
  { name: "Orion", role: "Enricher", calls: 12044, ok: 99.5 },
  { name: "Lyra", role: "Summarizer", calls: 2660, ok: 97.4 },
];

const ACTIVITY = [
  { who: "Aria K.", what: "deployed", target: "stripe-events v18", ago: "2m", kind: "deploy" },
  { who: "system", what: "auto-scaled", target: "edge-eu to 6 replicas", ago: "11m", kind: "system" },
  { who: "Jonas R.", what: "merged", target: "PR #482 · retry policy", ago: "38m", kind: "git" },
  { who: "Vesper", what: "classified", target: "1,204 events · 99.1%", ago: "1h", kind: "agent" },
  { who: "Mei L.", what: "rotated", target: "API key · pg-prod", ago: "3h", kind: "security" },
  { who: "system", what: "snapshot", target: "warehouse · 38 GB", ago: "6h", kind: "system" },
];

const QUICK_ACTIONS = [
  { label: "New pipeline", icon: Workflow, to: "/playground" },
  { label: "Invite member", icon: Users, to: "/account" },
  { label: "API keys", icon: KeyRound, to: "/account" },
  { label: "Browse templates", icon: BookOpen, to: "/templates" },
  { label: "Open console", icon: TerminalSquare, to: "/playground" },
  { label: "Deploy", icon: Rocket, to: "/playground" },
];

const CONNECTORS = [
  { name: "Stripe", category: "Payments" },
  { name: "Snowflake", category: "Warehouse" },
  { name: "Slack", category: "Comms" },
  { name: "Postgres", category: "Database" },
  { name: "Hubspot", category: "CRM" },
  { name: "S3", category: "Storage" },
];

const PIE_COLORS = ["#FFC801", "#FF9932", "#114C5A", "#D9E8E2"];

/* ----------------------------- small helpers ----------------------------- */
const fmt = (n: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
const cn = (...a: (string | false | undefined)[]) => a.filter(Boolean).join(" ");

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = { Healthy: "bg-emerald-400", Degraded: "bg-amber-400", Paused: "bg-foreground/30" };
  return <span className={cn("inline-block h-1.5 w-1.5 rounded-full", map[status] || "bg-foreground/30")} />;
}

function ChartTip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-foreground/10 bg-[hsl(200_41%_10%)]/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <div className="mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="mt-1 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-foreground">{p.name}</span>
          <span className="ml-auto mono">{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- page ----------------------------- */
export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>("7d");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"pipelines" | "agents" | "connectors">("pipelines");

  useEffect(() => { document.title = "Dashboard · Armory"; }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at, updated_at")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled) {
        setProfile(data as Profile | null);
        setLoading(false);
      }
    })();
    const channel = supabase
      .channel(`profile:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter: `id=eq.${user.id}` }, (payload) => {
        if (payload.new) setProfile(payload.new as Profile);
      })
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [user]);

  const series = useMemo(() => buildSeries(range), [range]);
  const kpis = useMemo(() => KPIS(range), [range]);
  const totalEvents = useMemo(() => series.reduce((s, p) => s + p.events, 0), [series]);
  const filteredPipelines = useMemo(
    () => PIPELINES.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search.toLowerCase())),
    [search],
  );
  const agentMix = useMemo(
    () => AGENTS.map((a) => ({ name: a.name, value: a.calls })),
    [],
  );

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out");
    navigate("/", { replace: true });
  }

  const displayName = profile?.full_name?.trim() || user?.email?.split("@")[0] || "operator";
  const initials = displayName.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "·";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full blur-3xl" style={{ background: "var(--c-forsythia)", opacity: 0.06 }} />
          <div className="absolute top-40 -right-32 h-[28rem] w-[28rem] rounded-full blur-3xl" style={{ background: "var(--c-saffron)", opacity: 0.05 }} />
        </div>

        <div className="container-px mx-auto max-w-7xl">
          {/* Identity header */}
          <header className="card-surface ring-grad rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="h-14 w-14 shrink-0 rounded-xl grid place-items-center mono text-lg font-semibold border border-[color:var(--c-forsythia)]/30 bg-[color:var(--c-forsythia)]/10 text-[color:var(--c-forsythia)]">
                {loading ? "…" : initials}
              </div>
              <div className="min-w-0">
                <p className="eyebrow">// workspace</p>
                <h1 className="mt-1 text-2xl sm:text-3xl tracking-tight truncate">
                  {loading
                    ? <span className="inline-block h-7 w-48 rounded bg-foreground/[.08] animate-pulse" />
                    : <>Welcome, <span className="accent-text">{displayName}.</span></>}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground truncate">
                  {loading
                    ? <span className="inline-block h-4 w-60 rounded bg-foreground/[.06] animate-pulse" />
                    : <><span className="mono">{profile?.email || user?.email}</span> · <span className="text-emerald-400">●</span> all systems operational</>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div role="tablist" aria-label="Time range" className="glass ring-grad rounded-full p-1 flex text-xs mono">
                {(["24h", "7d", "30d"] as Range[]).map((r) => (
                  <button
                    key={r}
                    role="tab"
                    aria-selected={range === r}
                    onClick={() => setRange(r)}
                    className={cn(
                      "px-3 py-1.5 rounded-full transition-colors focus-ring",
                      range === r ? "bg-[color:var(--c-forsythia)] text-[color:var(--c-oceanic)]" : "text-muted-foreground hover:text-foreground"
                    )}
                  >{r}</button>
                ))}
              </div>
              <button className="hidden sm:grid place-items-center h-9 w-9 rounded-lg border border-foreground/10 bg-foreground/[.03] hover:bg-foreground/[.06] transition-colors focus-ring" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </button>
              <Link to="/account" className="grid place-items-center h-9 w-9 rounded-lg border border-foreground/10 bg-foreground/[.03] hover:bg-foreground/[.06] transition-colors focus-ring" aria-label="Settings">
                <Settings className="h-4 w-4" />
              </Link>
              <Link to="/playground" className="inline-flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg btn-primary mono">
                <Plus className="h-4 w-4" /> New
              </Link>
            </div>
          </header>

          {/* KPIs */}
          <section className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map(({ k, v, d, up, icon: Icon, hint }) => (
              <div key={k} className="card-surface ring-grad rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: "radial-gradient(120% 80% at 100% 0%, hsl(48 100% 50% / 0.08), transparent 60%)" }} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mono">{k}</p>
                    <p className="mt-2 text-3xl mono font-semibold tracking-tight">{v}</p>
                  </div>
                  <div className="h-9 w-9 rounded-lg grid place-items-center bg-foreground/[.04] border border-foreground/10">
                    <Icon className="h-4 w-4 text-[color:var(--c-forsythia)]" />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className={cn("inline-flex items-center gap-1 mono", up ? "text-emerald-400" : "text-rose-400")}>
                    {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />} {d}
                  </span>
                  <span className="text-muted-foreground">{hint}</span>
                </div>
              </div>
            ))}
          </section>

          {/* Charts row */}
          <section className="mt-6 grid lg:grid-cols-3 gap-4">
            {/* Throughput area */}
            <div className="card-surface ring-grad rounded-2xl p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">// throughput</p>
                  <h3 className="mt-1 mono text-lg font-semibold">Events over time</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl mono font-semibold">{fmt(totalEvents)}</p>
                  <p className="text-[11px] mono text-muted-foreground">last {range}</p>
                </div>
              </div>
              <div className="mt-3 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gEvents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFC801" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#FFC801" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="hsl(0 0% 100% / 0.05)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: "hsl(152 20% 78%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(152 20% 78%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(Number(v))} />
                    <Tooltip content={<ChartTip />} />
                    <Area type="monotone" dataKey="events" name="Events" stroke="#FFC801" strokeWidth={2} fill="url(#gEvents)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Agent mix donut */}
            <div className="card-surface ring-grad rounded-2xl p-5">
              <p className="eyebrow">// agent mix</p>
              <h3 className="mt-1 mono text-lg font-semibold">Workload split</h3>
              <div className="mt-2 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={agentMix} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} stroke="none" paddingAngle={3}>
                      {agentMix.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 space-y-1.5">
                {agentMix.map((a, i) => (
                  <li key={a.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-foreground">{a.name}</span>
                    <span className="ml-auto mono text-muted-foreground">{fmt(a.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Latency + errors + health */}
          <section className="mt-4 grid lg:grid-cols-3 gap-4">
            <div className="card-surface ring-grad rounded-2xl p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">// performance</p>
                  <h3 className="mt-1 mono text-lg font-semibold">Latency & errors</h3>
                </div>
                <div className="flex items-center gap-3 text-[11px] mono text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[color:var(--c-saffron)]" /> Latency (ms)</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" /> Errors</span>
                </div>
              </div>
              <div className="mt-3 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid stroke="hsl(0 0% 100% / 0.05)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: "hsl(152 20% 78%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(152 20% 78%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Line type="monotone" dataKey="latency" name="Latency" stroke="#FF9932" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="errors" name="Errors" stroke="#f43f5e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* System health */}
            <div className="card-surface ring-grad rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <p className="eyebrow">// system</p>
                <span className="text-[11px] mono text-emerald-400 inline-flex items-center gap-1"><CircleDot className="h-3 w-3" /> operational</span>
              </div>
              <h3 className="mt-1 mono text-lg font-semibold">Health</h3>
              <ul className="mt-3 space-y-3">
                {[
                  { icon: Cpu, label: "Compute", val: 38, hint: "12 of 32 vCPU" },
                  { icon: Database, label: "Database", val: 64, hint: "26 GB / 40 GB" },
                  { icon: Server, label: "Edge nodes", val: 22, hint: "8 of 36 saturated" },
                  { icon: Globe, label: "Bandwidth", val: 51, hint: "1.2 TB this period" },
                ].map(({ icon: Icon, label, val, hint }) => (
                  <li key={label}>
                    <div className="flex items-center gap-2 text-xs">
                      <Icon className="h-3.5 w-3.5 text-[color:var(--c-forsythia)]" />
                      <span className="text-foreground">{label}</span>
                      <span className="ml-auto mono text-muted-foreground">{val}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-foreground/[.06] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${val}%`, background: "linear-gradient(90deg, var(--c-forsythia), var(--c-saffron))" }} />
                    </div>
                    <p className="mt-1 text-[10px] mono text-muted-foreground">{hint}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Quick actions */}
          <section className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="mono text-lg font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-[color:var(--c-forsythia)]" /> Quick actions</h3>
              <Link to="/templates" className="text-xs mono text-muted-foreground hover:text-foreground">browse all →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {QUICK_ACTIONS.map(({ label, icon: Icon, to }) => (
                <Link key={label} to={to} className="card-surface ring-grad rounded-xl p-4 flex flex-col items-start gap-2 hover:-translate-y-0.5 transition-transform">
                  <div className="h-8 w-8 grid place-items-center rounded-lg bg-foreground/[.04] border border-foreground/10">
                    <Icon className="h-4 w-4 text-[color:var(--c-forsythia)]" />
                  </div>
                  <span className="text-sm mono">{label}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Tabs: pipelines / agents / connectors */}
          <section className="mt-8 card-surface ring-grad rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
              <div role="tablist" aria-label="Resource tabs" className="inline-flex rounded-full bg-foreground/[.04] p-1 text-xs mono">
                {([
                  { id: "pipelines", label: "Pipelines", icon: Workflow },
                  { id: "agents", label: "Agents", icon: Bot },
                  { id: "connectors", label: "Connectors", icon: Plug },
                ] as const).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={tab === id}
                    onClick={() => setTab(id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors focus-ring",
                      tab === id ? "bg-[color:var(--c-forsythia)] text-[color:var(--c-oceanic)]" : "text-muted-foreground hover:text-foreground",
                    )}
                  ><Icon className="h-3.5 w-3.5" /> {label}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search…"
                    className="text-xs mono pl-7 pr-3 py-1.5 rounded-lg bg-foreground/[.04] border border-foreground/10 focus-ring outline-none w-40 sm:w-56"
                  />
                </label>
                <button className="inline-flex items-center gap-1.5 text-xs mono px-3 py-1.5 rounded-lg border border-foreground/10 bg-foreground/[.03] hover:bg-foreground/[.06] transition-colors focus-ring">
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
              </div>
            </div>

            <div className="mt-5">
              {tab === "pipelines" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-wider text-muted-foreground mono">
                        <th className="text-left font-normal py-2 pr-3">Name</th>
                        <th className="text-left font-normal py-2 pr-3">Status</th>
                        <th className="text-left font-normal py-2 pr-3">Env</th>
                        <th className="text-right font-normal py-2 pr-3">Runs</th>
                        <th className="text-right font-normal py-2 pr-3">Success</th>
                        <th className="text-left font-normal py-2 pr-3">Owner</th>
                        <th className="text-right font-normal py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPipelines.map((p) => (
                        <tr key={p.id} className="border-t border-foreground/5 hover:bg-foreground/[.02] transition-colors">
                          <td className="py-3 pr-3">
                            <div className="flex items-center gap-2">
                              <GitBranch className="h-3.5 w-3.5 text-[color:var(--c-forsythia)]" />
                              <span className="text-foreground">{p.name}</span>
                              <span className="text-[10px] mono text-muted-foreground">{p.id}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-3">
                            <span className="inline-flex items-center gap-1.5 text-xs mono"><StatusDot status={p.status} /> {p.status}</span>
                          </td>
                          <td className="py-3 pr-3 text-xs mono uppercase text-muted-foreground">{p.env}</td>
                          <td className="py-3 pr-3 text-right mono">{p.runs.toLocaleString()}</td>
                          <td className="py-3 pr-3 text-right mono">{p.success ? `${p.success}%` : "—"}</td>
                          <td className="py-3 pr-3 text-xs">{p.owner}</td>
                          <td className="py-3 text-right">
                            <button className="inline-flex items-center gap-1 text-xs mono text-[color:var(--c-forsythia)] hover:underline">
                              <PlayCircle className="h-3.5 w-3.5" /> Run
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredPipelines.length === 0 && (
                        <tr><td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No pipelines match "{search}".</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === "agents" && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {AGENTS.map((a) => (
                    <div key={a.name} className="rounded-xl border border-foreground/10 bg-foreground/[.02] p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 grid place-items-center rounded-lg bg-[color:var(--c-forsythia)]/10 border border-[color:var(--c-forsythia)]/30 text-[color:var(--c-forsythia)]">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="mono text-sm font-semibold">{a.name}</p>
                            <p className="text-[10px] mono text-muted-foreground uppercase">{a.role}</p>
                          </div>
                        </div>
                        <span className="text-[10px] mono text-emerald-400 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> live</span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Calls</p>
                          <p className="mono font-semibold">{fmt(a.calls)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Success</p>
                          <p className="mono font-semibold">{a.ok}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "connectors" && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CONNECTORS.map((c) => (
                    <div key={c.name} className="rounded-xl border border-foreground/10 bg-foreground/[.02] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 grid place-items-center rounded-lg bg-foreground/[.04] border border-foreground/10">
                          <Plug className="h-4 w-4 text-[color:var(--c-forsythia)]" />
                        </div>
                        <div>
                          <p className="mono text-sm font-semibold">{c.name}</p>
                          <p className="text-[10px] mono text-muted-foreground uppercase">{c.category}</p>
                        </div>
                      </div>
                      <button className="text-xs mono px-2.5 py-1 rounded-md border border-foreground/10 hover:bg-foreground/[.06] transition-colors">Configure</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Activity + Tips */}
          <section className="mt-6 grid lg:grid-cols-3 gap-4">
            <div className="card-surface ring-grad rounded-2xl p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="mono text-lg font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-[color:var(--c-forsythia)]" /> Recent activity</h3>
                <span className="text-[11px] mono text-muted-foreground">live feed</span>
              </div>
              <ul className="mt-3 divide-y divide-foreground/5">
                {ACTIVITY.map((a, i) => (
                  <li key={i} className="py-3 flex items-center gap-3 text-sm">
                    <span className="h-7 w-7 grid place-items-center rounded-lg bg-foreground/[.04] border border-foreground/10 shrink-0">
                      {a.kind === "deploy" && <Rocket className="h-3.5 w-3.5 text-[color:var(--c-forsythia)]" />}
                      {a.kind === "system" && <Server className="h-3.5 w-3.5 text-[color:var(--c-saffron)]" />}
                      {a.kind === "git" && <GitBranch className="h-3.5 w-3.5 text-emerald-400" />}
                      {a.kind === "agent" && <Bot className="h-3.5 w-3.5 text-[color:var(--c-forsythia)]" />}
                      {a.kind === "security" && <Shield className="h-3.5 w-3.5 text-rose-400" />}
                    </span>
                    <p className="min-w-0 truncate">
                      <span className="mono text-foreground">{a.who}</span>{" "}
                      <span className="text-muted-foreground">{a.what}</span>{" "}
                      <span className="text-foreground">{a.target}</span>
                    </p>
                    <span className="ml-auto text-[11px] mono text-muted-foreground shrink-0">{a.ago}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-surface ring-grad rounded-2xl p-5">
              <h3 className="mono text-lg font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[color:var(--c-forsythia)]" /> Improve your setup</h3>
              <ul className="mt-3 space-y-3 text-sm">
                {[
                  { t: "Enable SSO", d: "Connect Okta or Google Workspace for SAML.", to: "/account" },
                  { t: "Set spend alert", d: "Notify on >120% of monthly budget.", to: "/pricing" },
                  { t: "Invite teammates", d: "Roles: viewer, operator, admin.", to: "/account" },
                  { t: "Pin a template", d: "Start from a vetted reference pipeline.", to: "/templates" },
                ].map((t) => (
                  <li key={t.t}>
                    <Link to={t.to} className="group block rounded-lg p-3 -mx-1 hover:bg-foreground/[.04] transition-colors">
                      <p className="mono text-sm font-semibold flex items-center justify-between">
                        {t.t}
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-[color:var(--c-forsythia)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.d}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Footer actions */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 text-xs mono text-muted-foreground">
            <span>Workspace ID <span className="text-foreground">arm-prod-eu-01</span> · region eu-central-1</span>
            <div className="flex items-center gap-2">
              <Link to="/account" className="px-3 py-1.5 rounded-lg border border-foreground/10 bg-foreground/[.03] hover:bg-foreground/[.06] transition-colors">Account</Link>
              <button onClick={handleSignOut} className="px-3 py-1.5 rounded-lg border border-foreground/10 bg-foreground/[.03] hover:bg-foreground/[.06] transition-colors">Sign out</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
