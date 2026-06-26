import Counter from "./Counter";

type Metric = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  l: string;
  d: string;
};

const metrics: Metric[] = [
  { value: 12, suffix: "ms", l: "Avg. latency", d: "Real-time inference across deployments." },
  { value: 10, suffix: "×", l: "Faster automations", d: "vs. manual workflow assembly." },
  { value: 97, suffix: "%", l: "Uptime", d: "Critical agent infrastructure." },
  { value: 2.4, decimals: 1, prefix: "$", suffix: "B", l: "Events / day", d: "Across 40+ countries." },
];

export default function Metrics() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-px mx-auto max-w-7xl">
        <header className="max-w-2xl">
          <p className="eyebrow">// statistics</p>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl">
            Quantifiable impact across<br /><span className="accent-text">every deployment.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            We measure success by the speed and scale of your neural ops — not vanity adoption charts.
          </p>
        </header>
        <dl className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map((m) => (
            <div key={m.l} className="card-surface ring-grad p-6">
              <dt className="text-5xl sm:text-6xl font-semibold mono text-[color:var(--c-forsythia)] tracking-tight tabular-nums">
                <Counter value={m.value} decimals={m.decimals} prefix={m.prefix} suffix={m.suffix} />
              </dt>
              <dd className="mt-3">
                <p className="text-sm font-medium mono">{m.l}</p>
                <p className="mt-1 text-xs text-muted-foreground">{m.d}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
