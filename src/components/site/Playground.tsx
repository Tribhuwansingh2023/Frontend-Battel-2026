import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Mail, Webhook, CreditCard, Zap, Brain, Wand2, ShieldCheck,
  GitBranch, Database, Snowflake, Slack, Send, BarChart3, Plus,
  Undo2, Redo2, Sparkles, Play, RotateCcw, MessageSquare, Bot,
  Trash2,
} from "lucide-react";

/**
 * Interactive Workflow Playground — premium no-code AI editor.
 *
 * Features:
 *  - Undo/Redo history of nodes & edges (move, add, delete).
 *  - Keyboard navigation (Tab/Arrows/Enter/Delete) + ARIA on every control.
 *  - Mobile: horizontal scroll with momentum + touch-pannable canvas.
 *  - Agent Mode: switches simulation between deterministic "pipeline waves"
 *    (off) and an AI-routed "agent" mode that picks a single branch.
 *  - Run mode: animates active nodes and pulses traveling along each edge.
 */

type NodeKind = "trigger" | "transform" | "logic" | "ai" | "sink";

type IconCmp = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>;

type NodeDef = {
  id: string;
  title: string;
  subtitle: string;
  kind: NodeKind;
  iconKey: IconKey;
  x: number;
  y: number;
};

type Edge = { id: string; from: string; to: string; label?: string; dashed?: boolean };

type IconKey =
  | "mail" | "webhook" | "card" | "wand" | "shield" | "brain"
  | "zap" | "git" | "db" | "snow" | "slack" | "send" | "chart";

const ICONS: Record<IconKey, IconCmp> = {
  mail: Mail, webhook: Webhook, card: CreditCard, wand: Wand2, shield: ShieldCheck,
  brain: Brain, zap: Zap, git: GitBranch, db: Database, snow: Snowflake,
  slack: Slack, send: Send, chart: BarChart3,
};

const KIND_RING: Record<NodeKind, string> = {
  trigger: "ring-[color:var(--c-forsythia)]/40",
  transform: "ring-[color:var(--c-saffron)]/40",
  logic: "ring-foreground/25",
  ai: "ring-[color:var(--c-forsythia)]/50",
  sink: "ring-foreground/20",
};

const KIND_ICON_BG: Record<NodeKind, string> = {
  trigger: "bg-[color:var(--c-forsythia)]/15 text-[color:var(--c-forsythia)]",
  transform: "bg-[color:var(--c-saffron)]/15 text-[color:var(--c-saffron)]",
  logic: "bg-foreground/10 text-foreground",
  ai: "bg-[color:var(--c-forsythia)]/20 text-[color:var(--c-forsythia)]",
  sink: "bg-foreground/10 text-foreground",
};

const CANVAS_W = 1480;
const CANVAS_H = 560;
const NODE_W = 168;
const NODE_H = 64;
const GRID = 20;

const INITIAL_NODES: NodeDef[] = [
  { id: "email",     title: "Email Trigger",  subtitle: "IMAP",         kind: "trigger",   iconKey: "mail",    x: 40,   y: 80  },
  { id: "api",       title: "API Trigger",    subtitle: "Webhook",      kind: "trigger",   iconKey: "webhook", x: 40,   y: 260 },
  { id: "stripe",    title: "Stripe Events",  subtitle: "charge.*",     kind: "trigger",   iconKey: "card",    x: 40,   y: 440 },
  { id: "transform", title: "Transform",      subtitle: "Edit fields",  kind: "transform", iconKey: "wand",    x: 280,  y: 80  },
  { id: "validate",  title: "Validation",     subtitle: "Schema · Zod", kind: "transform", iconKey: "shield",  x: 280,  y: 260 },
  { id: "classify",  title: "LLM Classifier", subtitle: "Sub-50ms",     kind: "ai",        iconKey: "brain",   x: 280,  y: 440 },
  { id: "agent",     title: "AI Agent",       subtitle: "Tools Agent",  kind: "ai",        iconKey: "zap",     x: 540,  y: 260 },
  { id: "if",        title: "If / Else",      subtitle: "Conditional",  kind: "logic",     iconKey: "git",     x: 800,  y: 260 },
  { id: "db",        title: "Database",       subtitle: "Postgres",     kind: "sink",      iconKey: "db",      x: 1060, y: 100 },
  { id: "snow",      title: "Snowflake",      subtitle: "COPY INTO",    kind: "sink",      iconKey: "snow",    x: 1060, y: 260 },
  { id: "slack",     title: "Slack",          subtitle: "#growth-ops",  kind: "sink",      iconKey: "slack",   x: 1060, y: 420 },
  { id: "email_out", title: "Send Email",     subtitle: "Resend",       kind: "sink",      iconKey: "send",    x: 1280, y: 160 },
  { id: "analytics", title: "Analytics",      subtitle: "Track event",  kind: "sink",      iconKey: "chart",   x: 1280, y: 360 },
];

const INITIAL_EDGES: Edge[] = [
  { id: "e1",  from: "email",     to: "transform", label: "1 item" },
  { id: "e2",  from: "api",       to: "validate",  label: "1 item" },
  { id: "e3",  from: "stripe",    to: "classify",  label: "1 item" },
  { id: "e4",  from: "transform", to: "agent",     label: "1 item" },
  { id: "e5",  from: "validate",  to: "agent",     label: "1 item" },
  { id: "e6",  from: "classify",  to: "agent",     label: "1 item" },
  { id: "e7",  from: "agent",     to: "if",        label: "route" },
  { id: "e8",  from: "if",        to: "db",        label: "true",  dashed: true },
  { id: "e9",  from: "if",        to: "snow",      label: "true" },
  { id: "e10", from: "if",        to: "slack",     label: "false", dashed: true },
  { id: "e11", from: "db",        to: "email_out" },
  { id: "e12", from: "snow",      to: "analytics" },
  { id: "e13", from: "slack",     to: "analytics", dashed: true },
];

const STACK_ICONS = [
  { label: "OpenAI",   glyph: "✺" },
  { label: "Anthropic",glyph: "✦" },
  { label: "Gemini",   glyph: "✧" },
  { label: "Mistral",  glyph: "◈" },
  { label: "Meta",     glyph: "Ⓜ" },
];

type Graph = { nodes: NodeDef[]; edges: Edge[] };

function nodeCenter(n: NodeDef) {
  return { rx: n.x + NODE_W, lx: n.x, cy: n.y + NODE_H / 2 };
}

function pathFor(a: NodeDef, b: NodeDef) {
  const ac = nodeCenter(a); const bc = nodeCenter(b);
  const dx = Math.max(40, (bc.lx - ac.rx) * 0.45);
  return `M ${ac.rx} ${ac.cy} C ${ac.rx + dx} ${ac.cy}, ${bc.lx - dx} ${bc.cy}, ${bc.lx} ${bc.cy}`;
}

export default memo(function Playground() {
  // History
  const [graph, setGraph] = useState<Graph>({ nodes: INITIAL_NODES, edges: INITIAL_EDGES });
  const past = useRef<Graph[]>([]);
  const future = useRef<Graph[]>([]);
  const [, force] = useState(0);

  const commit = useCallback((next: Graph) => {
    past.current.push(graph);
    if (past.current.length > 50) past.current.shift();
    future.current = [];
    setGraph(next);
    force((n) => n + 1);
  }, [graph]);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(graph);
    setGraph(prev);
    force((n) => n + 1);
  }, [graph]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(graph);
    setGraph(next);
    force((n) => n + 1);
  }, [graph]);

  const canUndo = past.current.length > 0;
  const canRedo = future.current.length > 0;

  // Selection + interaction
  const [selected, setSelected] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState<"agent" | "chat">("agent");
  const [agentMode, setAgentMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("OpenAI");
  const [autoRun, setAutoRun] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<{ role: "user" | "agent"; text: string }[]>([
    { role: "agent", text: "Hi! I'm the workflow agent. Ask me to run the pipeline or describe a step." },
  ]);
  const [chatInput, setChatInput] = useState("");


  const nodeRefs = useRef(new Map<string, HTMLDivElement>());
  const edgeRefs = useRef(new Map<string, SVGPathElement>());
  const pulseRefs = useRef(new Map<string, SVGCircleElement>());
  const canvasRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);
  useEffect(() => () => clearTimers(), [clearTimers]);

  // Reflect selected stack model in the AI Agent node's subtitle.
  useEffect(() => {
    setGraph((g) => {
      const agent = g.nodes.find((n) => n.id === "agent");
      if (!agent || agent.subtitle === selectedModel) return g;
      return { ...g, nodes: g.nodes.map((n) => (n.id === "agent" ? { ...n, subtitle: selectedModel } : n)) };
    });
  }, [selectedModel]);


  // Derived adjacency
  const adj = useMemo(() => {
    const m = new Map<string, Edge[]>();
    graph.edges.forEach((e) => {
      if (!m.has(e.from)) m.set(e.from, []);
      m.get(e.from)!.push(e);
    });
    return m;
  }, [graph.edges]);

  // ----- Run simulation -----
  const reset = useCallback(() => {
    if (running) return;
    clearTimers();
    nodeRefs.current.forEach((n) => { n.dataset.state = "idle"; });
    edgeRefs.current.forEach((p) => { p.classList.remove("flow-active"); });
  }, [running, clearTimers]);

  const animatePulse = useCallback((edgeId: string, duration = 480) => {
    const path = edgeRefs.current.get(edgeId);
    const dot = pulseRefs.current.get(edgeId);
    if (!path || !dot) return;
    const len = path.getTotalLength();
    dot.setAttribute("r", "3.5");
    try {
      dot.animate(
        [
          { offsetDistance: "0%", opacity: 0.2 },
          { offsetDistance: "100%", opacity: 1 },
        ] as unknown as Keyframe[],
        { duration, easing: "cubic-bezier(.4,.2,.2,1)", fill: "forwards" }
      );
    } catch {
      // Fallback: walk along the path manually
      const start = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - start) / duration);
        const pt = path.getPointAtLength(k * len);
        dot.setAttribute("cx", String(pt.x));
        dot.setAttribute("cy", String(pt.y));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }, []);

  const run = useCallback(() => {
    if (running) return;
    clearTimers();
    setRunning(true);
    nodeRefs.current.forEach((n) => { n.dataset.state = "idle"; });
    edgeRefs.current.forEach((p) => { p.classList.remove("flow-active"); });

    // Build execution plan from graph via BFS waves from triggers.
    const indeg = new Map<string, number>();
    graph.nodes.forEach((n) => indeg.set(n.id, 0));
    graph.edges.forEach((e) => indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1));

    const visited = new Set<string>();
    const waves: string[][] = [];
    let frontier = graph.nodes.filter((n) => (indeg.get(n.id) ?? 0) === 0).map((n) => n.id);
    while (frontier.length) {
      waves.push(frontier);
      const next = new Set<string>();
      frontier.forEach((id) => {
        visited.add(id);
        (adj.get(id) ?? []).forEach((e) => {
          if (agentMode) {
            // Agent mode: at each branch take only the first outgoing edge.
            const outs = adj.get(id) ?? [];
            if (outs[0] === e && !visited.has(e.to)) next.add(e.to);
          } else if (!visited.has(e.to)) {
            next.add(e.to);
          }
        });
      });
      frontier = [...next];
    }

    const STEP = 540;
    waves.forEach((wave, i) => {
      const t = window.setTimeout(() => {
        wave.forEach((id) => {
          const n = nodeRefs.current.get(id);
          if (n) n.dataset.state = "active";
          (adj.get(id) ?? []).forEach((e) => {
            if (agentMode && (adj.get(id) ?? [])[0]?.id !== e.id) return;
            const p = edgeRefs.current.get(e.id);
            if (p) p.classList.add("flow-active");
            animatePulse(e.id, STEP - 60);
          });
        });
      }, i * STEP);
      const t2 = window.setTimeout(() => {
        wave.forEach((id) => {
          const n = nodeRefs.current.get(id);
          if (n) n.dataset.state = "done";
        });
      }, i * STEP + STEP - 100);
      timers.current.push(t, t2);
    });

    const tEnd = window.setTimeout(() => setRunning(false), waves.length * STEP + 400);
    timers.current.push(tEnd);
  }, [running, clearTimers, graph, adj, agentMode, animatePulse]);

  // Auto-run when graph changes (debounced).
  useEffect(() => {
    if (!autoRun || running) return;
    const t = window.setTimeout(() => run(), 600);
    return () => window.clearTimeout(t);
  }, [autoRun, graph, running, run]);

  // ----- Chat -----
  const sendChat = useCallback(() => {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput("");
    setChatMsgs((m) => [...m, { role: "user", text }]);
    const lower = text.toLowerCase();
    window.setTimeout(() => {
      let reply = "";
      if (/\b(run|start|execute|go)\b/.test(lower)) {
        reply = `Running pipeline with ${selectedModel}${agentMode ? " in agent mode" : ""}…`;
        run();
      } else if (/\b(reset|clear|stop)\b/.test(lower)) {
        reply = "Canvas reset.";
        reset();
      } else if (/\b(node|count|how many)\b/.test(lower)) {
        reply = `Pipeline has ${graph.nodes.length} nodes and ${graph.edges.length} edges.`;
      } else if (/\b(model|stack)\b/.test(lower)) {
        reply = `Active model: ${selectedModel}. Tap a stack icon to switch.`;
      } else {
        reply = `Got it — "${text}". Try "run", "reset", or "how many nodes?".`;
      }
      setChatMsgs((m) => [...m, { role: "agent", text: reply }]);
    }, 350);
  }, [chatInput, selectedModel, agentMode, graph, run, reset]);


  // ----- Edits -----
  const removeNode = useCallback((id: string) => {
    if (running) return;
    commit({
      nodes: graph.nodes.filter((n) => n.id !== id),
      edges: graph.edges.filter((e) => e.from !== id && e.to !== id),
    });
    setSelected(null);
  }, [graph, commit, running]);

  const addNode = useCallback(() => {
    if (running) return;
    const id = `n_${Date.now().toString(36)}`;
    const newNode: NodeDef = {
      id, title: "Transform", subtitle: "Edit fields", kind: "transform",
      iconKey: "wand",
      x: 540, y: 80,
    };
    commit({ nodes: [...graph.nodes, newNode], edges: graph.edges });
    setSelected(id);
  }, [graph, commit, running]);

  const moveSelected = useCallback((dx: number, dy: number) => {
    if (!selected || running) return;
    const node = graph.nodes.find((n) => n.id === selected);
    if (!node) return;
    const nx = Math.max(0, Math.min(CANVAS_W - NODE_W, Math.round((node.x + dx) / GRID) * GRID));
    const ny = Math.max(0, Math.min(CANVAS_H - NODE_H, Math.round((node.y + dy) / GRID) * GRID));
    commit({
      nodes: graph.nodes.map((n) => (n.id === selected ? { ...n, x: nx, y: ny } : n)),
      edges: graph.edges,
    });
  }, [selected, graph, commit, running]);

  // Keyboard handler for canvas focus
  const onCanvasKey = useCallback((e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).dataset?.nodeId) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
      e.preventDefault(); redo(); return;
    }
    if (!selected) return;
    const step = e.shiftKey ? GRID * 4 : GRID;
    switch (e.key) {
      case "ArrowLeft":  e.preventDefault(); moveSelected(-step, 0); break;
      case "ArrowRight": e.preventDefault(); moveSelected(step, 0);  break;
      case "ArrowUp":    e.preventDefault(); moveSelected(0, -step); break;
      case "ArrowDown":  e.preventDefault(); moveSelected(0, step);  break;
      case "Delete":
      case "Backspace":  e.preventDefault(); removeNode(selected);  break;
    }
  }, [selected, moveSelected, removeNode, undo, redo]);

  // Drag (pointer)
  const drag = useRef<{ id: string; ox: number; oy: number; sx: number; sy: number } | null>(null);
  const onNodePointerDown = (e: React.PointerEvent, n: NodeDef) => {
    if (running) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { id: n.id, ox: n.x, oy: n.y, sx: e.clientX, sy: e.clientY };
    setSelected(n.id);
  };
  const onNodePointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const d = drag.current;
    const nx = Math.max(0, Math.min(CANVAS_W - NODE_W, d.ox + (e.clientX - d.sx)));
    const ny = Math.max(0, Math.min(CANVAS_H - NODE_H, d.oy + (e.clientY - d.sy)));
    setGraph((g) => ({ ...g, nodes: g.nodes.map((n) => (n.id === d.id ? { ...n, x: nx, y: ny } : n)) }));
  };
  const onNodePointerUp = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const d = drag.current;
    drag.current = null;
    // Snap + commit
    const node = graph.nodes.find((n) => n.id === d.id);
    if (node) {
      const nx = Math.round(node.x / GRID) * GRID;
      const ny = Math.round(node.y / GRID) * GRID;
      if (nx !== d.ox || ny !== d.oy) {
        past.current.push({
          nodes: graph.nodes.map((n) => (n.id === d.id ? { ...n, x: d.ox, y: d.oy } : n)),
          edges: graph.edges,
        });
        if (past.current.length > 50) past.current.shift();
        future.current = [];
        setGraph((g) => ({ ...g, nodes: g.nodes.map((n) => (n.id === d.id ? { ...n, x: nx, y: ny } : n)) }));
      }
    }
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  return (
    <section id="playground" className="py-20 sm:py-28 relative">
      <style>{`
        @keyframes pg-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-2px) } }
        @keyframes pg-dash  { to { stroke-dashoffset: -24 } }
        @keyframes pg-pulse { 0%,100% { box-shadow: 0 0 0 0 hsl(48 100% 50% / .35) } 50% { box-shadow: 0 0 0 6px hsl(48 100% 50% / 0) } }
        .pg-node { animation: pg-float 6s ease-in-out infinite; }
        .pg-node[data-state="active"] { animation: pg-pulse 1.2s ease-out infinite, pg-float 6s ease-in-out infinite; }
        .pg-edge { stroke: hsl(var(--foreground) / .22); stroke-width: 1.4; fill: none; }
        .pg-edge.dashed { stroke-dasharray: 4 4; }
        .pg-edge.flow-active { stroke: var(--c-forsythia); stroke-width: 1.8; stroke-dasharray: 6 6; animation: pg-dash 1s linear infinite; filter: drop-shadow(0 0 6px hsl(48 100% 50% / .45)); }
        .pg-pulse-dot { fill: var(--c-forsythia); filter: drop-shadow(0 0 6px hsl(48 100% 50% / .8)); opacity: 0; }
        .pg-grid { background-image: radial-gradient(hsl(var(--foreground) / .12) 1px, transparent 1px); background-size: 18px 18px; }
        .pg-vignette { background: radial-gradient(ellipse at 50% 30%, transparent 0%, transparent 55%, hsl(200 41% 8% / .55) 100%); }
        .pg-scroll { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain; }
        .pg-scroll::-webkit-scrollbar { height: 8px; }
        .pg-scroll::-webkit-scrollbar-thumb { background: hsl(var(--foreground) / .15); border-radius: 4px; }
      `}</style>

      <div className="container-px mx-auto max-w-7xl">
        <header className="max-w-2xl">
          <p className="eyebrow">// live playground</p>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl">
            Build logic <span className="accent-text">at scale</span>.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Design, deploy, and manage sophisticated AI workflows through an intuitive visual editor.
            Drag nodes, undo/redo edits, press Run to simulate execution.
          </p>
        </header>

        <div className="mt-10 relative card-surface ring-grad overflow-hidden" role="region" aria-label="Workflow editor">
          <div aria-hidden className="hidden md:block absolute left-0 top-0 bottom-0 w-3 bg-[repeating-linear-gradient(135deg,hsl(var(--foreground)/.12)_0_2px,transparent_2px_8px)]" />
          <div aria-hidden className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 [writing-mode:vertical-rl] rotate-180 text-[10px] mono tracking-[0.3em] text-muted-foreground">HOST</div>

          <div className="grid lg:grid-cols-[220px_1fr]">
            {/* Sidebar */}
            <aside className="border-b lg:border-b-0 lg:border-r border-foreground/10 p-4 sm:p-5" aria-label="Workflow blocks">
              <div className="space-y-2" role="tablist" aria-label="Editor mode">
                <button
                  role="tab" aria-selected={tab === "agent"}
                  onClick={() => setTab("agent")}
                  className={`w-full text-left mono text-[11px] uppercase tracking-wider px-3 py-2.5 rounded-md border transition-all focus-ring ${
                    tab === "agent" ? "bg-foreground text-[color:var(--c-oceanic)] border-foreground" : "border-foreground/15 hover:border-foreground/30 text-foreground"
                  }`}
                >
                  <span className="inline-flex items-center gap-2"><Bot size={12} aria-hidden /> AI Agent</span>
                </button>
                <div className="relative">
                  <button
                    role="tab" aria-selected={tab === "chat"}
                    onClick={() => setTab("chat")}
                    className={`w-full text-left mono text-[11px] uppercase tracking-wider px-3 py-2.5 rounded-md border transition-all focus-ring ${
                      tab === "chat" ? "bg-foreground text-[color:var(--c-oceanic)] border-foreground" : "border-foreground/15 hover:border-foreground/30 text-foreground"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2"><MessageSquare size={12} aria-hidden /> AI Chat</span>
                  </button>
                  <span className="absolute -bottom-2 right-2 translate-y-full text-[9px] mono px-1.5 py-0.5 rounded-full bg-foreground text-[color:var(--c-oceanic)]">You</span>
                </div>
              </div>

              <div className="mt-10">
                <p className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  Stack · <span className="text-foreground/80">{selectedModel}</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {STACK_ICONS.map((s) => {
                    const active = selectedModel === s.label;
                    return (
                      <button
                        key={s.label}
                        onClick={() => setSelectedModel(s.label)}
                        aria-label={`Use ${s.label} model`}
                        aria-pressed={active}
                        title={s.label}
                        className={`aspect-square rounded-md border grid place-items-center text-base transition-colors focus-ring ${
                          active
                            ? "border-[color:var(--c-forsythia)] bg-[color:var(--c-forsythia)]/10 text-[color:var(--c-forsythia)]"
                            : "border-foreground/15 hover:border-[color:var(--c-forsythia)]/50 hover:bg-foreground/[.04]"
                        }`}
                      >
                        <span aria-hidden>{s.glyph}</span>
                      </button>
                    );
                  })}
                  <button
                    onClick={addNode}
                    aria-label="Add transform node"
                    title="Add node"
                    className="aspect-square rounded-md border border-dashed border-foreground/20 grid place-items-center text-muted-foreground hover:border-[color:var(--c-forsythia)]/50 hover:text-[color:var(--c-forsythia)] transition-colors focus-ring"
                  >
                    <Plus size={14} aria-hidden />
                  </button>
                </div>
              </div>

              <div className="mt-12 hidden lg:block">
                <div className="h-24 border-l border-b border-foreground/15 rounded-bl-md" />
                <button
                  onClick={() => setAutoRun((v) => !v)}
                  aria-pressed={autoRun}
                  className="mt-2 flex items-center gap-2 mono text-[10px] text-muted-foreground hover:text-foreground transition w-full focus-ring rounded"
                >
                  <span className={autoRun ? "text-[color:var(--c-forsythia)]" : ""}>AUTO {autoRun ? "ON" : "OFF"}</span>
                  <span aria-hidden className="flex-1 h-px bg-[repeating-linear-gradient(90deg,hsl(var(--foreground)/.25)_0_4px,transparent_4px_8px)]" />
                </button>
              </div>
            </aside>


            {/* Canvas area */}
            <div className="flex flex-col">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-2 px-3 sm:px-6 py-3 border-b border-foreground/10 flex-wrap" role="toolbar" aria-label="Editor toolbar">
                <div className="flex items-center gap-2">
                  <button onClick={undo} disabled={!canUndo || running} aria-label="Undo" title="Undo (Ctrl+Z)" className="h-8 w-8 grid place-items-center rounded-md border border-foreground/15 hover:border-foreground/30 hover:bg-foreground/[.04] transition disabled:opacity-40 focus-ring"><Undo2 size={14} aria-hidden /></button>
                  <button onClick={redo} disabled={!canRedo || running} aria-label="Redo" title="Redo (Ctrl+Shift+Z)" className="h-8 w-8 grid place-items-center rounded-md border border-foreground/15 hover:border-foreground/30 hover:bg-foreground/[.04] transition disabled:opacity-40 focus-ring"><Redo2 size={14} aria-hidden /></button>
                  <span aria-hidden className="hidden sm:inline-block w-px h-5 bg-foreground/10 mx-1" />
                  <button
                    onClick={() => setAgentMode((v) => !v)}
                    aria-pressed={agentMode}
                    aria-label="Toggle agent mode"
                    className={`inline-flex items-center gap-1.5 mono text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-md border transition focus-ring ${
                      agentMode ? "border-[color:var(--c-forsythia)] bg-[color:var(--c-forsythia)]/10 text-[color:var(--c-forsythia)]" : "border-foreground/15 hover:border-[color:var(--c-forsythia)]/40"
                    }`}
                  >
                    Agent Mode <Sparkles size={11} aria-hidden className={agentMode ? "" : "text-[color:var(--c-forsythia)]"} />
                  </button>
                  <span className="hidden sm:inline-flex items-center gap-1.5 mono text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-md border border-foreground/15 text-muted-foreground">
                    Untitled
                  </span>
                  {selected && (
                    <button
                      onClick={() => removeNode(selected)}
                      disabled={running}
                      aria-label={`Delete selected node ${selected}`}
                      className="inline-flex items-center gap-1.5 mono text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-md border border-foreground/15 hover:border-[color:var(--c-saffron)]/50 hover:text-[color:var(--c-saffron)] transition focus-ring"
                    >
                      <Trash2 size={11} aria-hidden /> Delete
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground mono" aria-live="polite">
                    <span className={`h-1.5 w-1.5 rounded-full ${running ? "bg-[color:var(--c-forsythia)] pulse-soft" : "bg-foreground/30"}`} />
                    {running ? "executing…" : agentMode ? "agent route" : "ready"}
                  </div>
                  <button onClick={reset} disabled={running} aria-label="Reset simulation" className="btn-ghost text-xs mono px-2.5 py-1.5 rounded-md focus-ring disabled:opacity-50 inline-flex items-center gap-1.5">
                    <RotateCcw size={12} aria-hidden /> Reset
                  </button>
                  <button onClick={run} disabled={running} aria-label="Run workflow simulation" className="btn-primary text-xs mono font-semibold px-3 py-1.5 rounded-md focus-ring inline-flex items-center gap-1.5 disabled:opacity-60">
                    <Play size={12} aria-hidden /> {running ? "Running" : "Run"}
                  </button>
                </div>
              </div>

              {/* Canvas */}
              <div className="relative bg-[hsl(200_41%_9%)]">
                {tab === "chat" && (
                  <div className="absolute inset-0 z-10 flex flex-col bg-[hsl(200_41%_9%)] pg-grid">
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3" aria-live="polite">
                      {chatMsgs.map((m, i) => (
                        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] text-sm leading-relaxed px-3.5 py-2 rounded-xl border ${
                            m.role === "user"
                              ? "bg-[color:var(--c-forsythia)]/10 border-[color:var(--c-forsythia)]/30 text-foreground"
                              : "bg-foreground/[.04] border-foreground/10 text-foreground"
                          }`}>
                            <div className="text-[9px] mono uppercase tracking-wider text-muted-foreground mb-1">
                              {m.role === "user" ? "You" : `Agent · ${selectedModel}`}
                            </div>
                            {m.text}
                          </div>
                        </div>
                      ))}
                    </div>
                    <form
                      onSubmit={(e) => { e.preventDefault(); sendChat(); }}
                      className="border-t border-foreground/10 p-3 flex items-center gap-2"
                    >
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder='Try "run the pipeline" or "how many nodes?"'
                        aria-label="Chat message"
                        className="flex-1 bg-foreground/[.04] border border-foreground/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[color:var(--c-forsythia)]/50 placeholder:text-muted-foreground/60"
                      />
                      <button
                        type="submit"
                        className="btn-primary text-xs mono font-semibold px-3 py-2 rounded-md focus-ring"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                )}

                <div className="overflow-x-auto pg-scroll" tabIndex={-1}>
                  <div
                    ref={canvasRef}
                    role="application"
                    aria-label="Workflow canvas. Use Tab to focus a node, Arrow keys to move it, Delete to remove."
                    tabIndex={0}
                    onKeyDown={onCanvasKey}
                    onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
                    className="relative pg-grid focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--c-forsythia)]/40"
                    style={{ width: CANVAS_W, height: CANVAS_H }}
                  >
                    <div aria-hidden className="absolute inset-0 pg-vignette pointer-events-none" />
                    <div aria-hidden className="absolute inset-0 pointer-events-none"
                      style={{ background: "radial-gradient(600px 300px at 40% 50%, hsl(48 100% 50% / .06), transparent 70%)" }} />

                    {/* Edges */}
                    <svg width={CANVAS_W} height={CANVAS_H} className="absolute inset-0 pointer-events-none" aria-hidden>
                      <defs>
                        <marker id="pg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
                        </marker>
                      </defs>
                      {graph.edges.map((e) => {
                        const a = graph.nodes.find((n) => n.id === e.from);
                        const b = graph.nodes.find((n) => n.id === e.to);
                        if (!a || !b) return null;
                        const d = pathFor(a, b);
                        return (
                          <g key={e.id} className="text-foreground/40">
                            <path
                              ref={(el) => { if (el) edgeRefs.current.set(e.id, el); else edgeRefs.current.delete(e.id); }}
                              id={`edge-${e.id}`}
                              d={d}
                              className={`pg-edge ${e.dashed ? "dashed" : ""}`}
                              markerEnd="url(#pg-arrow)"
                            />
                            <circle
                              ref={(el) => { if (el) pulseRefs.current.set(e.id, el); else pulseRefs.current.delete(e.id); }}
                              className="pg-pulse-dot"
                              r="3.5"
                              style={{ offsetPath: `path('${d}')`, offsetRotate: "0deg" } as React.CSSProperties}
                            />
                            {e.label && (() => {
                              const ac = nodeCenter(a); const bc = nodeCenter(b);
                              const mx = (ac.rx + bc.lx) / 2;
                              const my = (ac.cy + bc.cy) / 2 - 8;
                              return (
                                <g transform={`translate(${mx} ${my})`}>
                                  <rect x={-18} y={-9} width={36} height={16} rx={4} fill="hsl(200 41% 9%)" stroke="hsl(var(--foreground) / .15)" />
                                  <text textAnchor="middle" y={2} fontSize="9" fontFamily="ui-monospace, monospace" fill="hsl(var(--muted-foreground))">{e.label}</text>
                                </g>
                              );
                            })()}
                          </g>
                        );
                      })}
                    </svg>

                    {/* Nodes */}
                    {graph.nodes.map((n) => {
                      const Icon = ICONS[n.iconKey];
                      const isSel = selected === n.id;
                      return (
                        <div
                          key={n.id}
                          ref={(el) => { if (el) nodeRefs.current.set(n.id, el); else nodeRefs.current.delete(n.id); }}
                          data-node-id={n.id}
                          data-state="idle"
                          role="button"
                          tabIndex={0}
                          aria-label={`${n.title}, ${n.subtitle}, ${n.kind} node${isSel ? ", selected" : ""}. Arrow keys to move, Delete to remove.`}
                          aria-pressed={isSel}
                          onPointerDown={(e) => onNodePointerDown(e, n)}
                          onPointerMove={onNodePointerMove}
                          onPointerUp={onNodePointerUp}
                          onClick={(e) => { e.stopPropagation(); setSelected(n.id); }}
                          onFocus={() => setSelected(n.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(n.id); }
                          }}
                          className={`pg-node group absolute rounded-xl bg-[hsl(200_41%_12%)]/80 backdrop-blur border px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 cursor-grab active:cursor-grabbing touch-none ring-1 ${KIND_RING[n.kind]} ${
                            isSel
                              ? "border-[color:var(--c-forsythia)] shadow-[0_0_0_2px_hsl(48_100%_50%/.4)]"
                              : "border-foreground/10 hover:border-[color:var(--c-forsythia)]/40"
                          } data-[state=active]:scale-[1.04] data-[state=active]:border-[color:var(--c-forsythia)] data-[state=done]:opacity-100 data-[state=idle]:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--c-forsythia)]/60`}
                          style={{ left: n.x, top: n.y, width: NODE_W, height: NODE_H }}
                        >
                          <div className="flex items-center gap-2.5 h-full pointer-events-none">
                            <div className={`h-9 w-9 rounded-lg grid place-items-center ${KIND_ICON_BG[n.kind]}`}>
                              <Icon size={16} aria-hidden />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[12px] font-semibold leading-tight truncate">{n.title}</div>
                              <div className="text-[10px] mono text-muted-foreground truncate">{n.subtitle}</div>
                            </div>
                          </div>
                          <span aria-hidden className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-foreground/30 group-hover:bg-[color:var(--c-forsythia)] transition-colors" />
                          <span aria-hidden className="absolute -right-1.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-foreground/30 group-hover:bg-[color:var(--c-forsythia)] transition-colors" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer status */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-t border-foreground/10 text-[10px] mono text-muted-foreground gap-2 flex-wrap">
                  <span>{graph.nodes.length} nodes · {graph.edges.length} edges{selected ? ` · selected ${selected}` : ""}</span>
                  <span className="hidden sm:inline">
                    Tab/Arrows to navigate · Ctrl+Z undo · Del remove
                  </span>
                  <span aria-live="polite">{running ? "streaming…" : "idle"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
