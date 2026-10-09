import { useEffect, useMemo, useState, type ReactElement, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BL_CODE, BINOM_CODE, GBM_CODE } from "@/data/course";
import { num, pct, usd } from "@/lib/format";
import { useProgress } from "@/lib/progress";
import {
  almgrenChriss,
  binomial,
  blackLitterman,
  blackScholes,
  crossSection,
  dcf,
  mcEuropeanCall,
  meanVariance,
  realOption,
  runGbm,
  type GbmScheme,
} from "@/lib/quant";
import { Choice, CodeBlock, Field, Notice, Stat, useDebounced } from "@/components/bits";

const tick = { fill: "var(--color-muted)", fontSize: 11 };
const tipStyle = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 0,
  color: "var(--color-fg)",
  fontSize: 12,
};

function useMounted() {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(true), []);
  return on;
}

function ChartBox({ children }: { children: ReactNode }) {
  const on = useMounted();
  return (
    <div className="h-56 w-full min-w-0">
      {on ? (
        <ResponsiveContainer width="100%" height="100%">
          {children as ReactElement}
        </ResponsiveContainer>
      ) : (
        <div className="h-full border border-border bg-surface" />
      )}
    </div>
  );
}

function message(error: unknown) {
  return error instanceof Error ? error.message : "The engine refused these inputs.";
}

function useLogLab(id: string, ok: boolean) {
  const markLab = useProgress((s) => s.markLab);
  useEffect(() => {
    if (ok) markLab(id);
  }, [ok, id, markLab]);
}

export function GbmLab() {
  const [p, setP] = useState({
    S0: 100,
    mu: 0.08,
    sigma: 0.2,
    T: 1,
    steps: 32,
    seed: 15,
    scheme: "exact" as GbmScheme,
    antithetic: false,
    r: 0.05,
  });
  const [book, setBook] = useState<ReturnType<typeof runGbm> | null>(null);
  const [busy, setBusy] = useState(false);
  const d = useDebounced(p, 140);
  const model = useMemo(() => {
    try {
      const data = runGbm({ ...d, paths: 4000, antithetic: d.antithetic });
      const mc = mcEuropeanCall({
        S0: d.S0,
        K: d.S0,
        r: d.r,
        sigma: d.sigma,
        T: d.T,
        steps: d.steps,
        paths: 4000,
        seed: d.seed,
        scheme: d.scheme,
      });
      const bs = blackScholes({ S: d.S0, K: d.S0, T: d.T, r: d.r, sigma: d.sigma });
      return { ok: true as const, data, mc, bs };
    } catch (error) {
      return { ok: false as const, error: message(error) };
    }
  }, [d]);
  useLogLab("gbm", model.ok);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-1 md:grid-cols-2">
        <Field label="Spot" value={p.S0} min={20} max={200} step={1} display={usd(p.S0, 0)} onChange={(S0) => setP({ ...p, S0 })} />
        <Field label="Drift μ" value={p.mu} min={-0.05} max={0.2} step={0.005} display={pct(p.mu, 1)} onChange={(mu) => setP({ ...p, mu })} />
        <Field label="Volatility" value={p.sigma} min={0.05} max={0.6} step={0.01} display={pct(p.sigma, 0)} onChange={(sigma) => setP({ ...p, sigma })} />
        <Field label="Horizon, years" value={p.T} min={0.25} max={3} step={0.25} display={num(p.T, 2)} onChange={(T) => setP({ ...p, T })} />
        <Field label="Steps" value={p.steps} min={1} max={64} step={1} display={String(p.steps)} onChange={(steps) => setP({ ...p, steps })} />
        <Field label="Risk-free rate" value={p.r} min={0} max={0.1} step={0.005} display={pct(p.r, 1)} onChange={(r) => setP({ ...p, r })} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Choice on={p.scheme === "exact"} onClick={() => setP({ ...p, scheme: "exact" })}>
          Exact map
        </Choice>
        <Choice on={p.scheme === "euler"} onClick={() => setP({ ...p, scheme: "euler" })}>
          Euler
        </Choice>
        <Choice on={p.antithetic} onClick={() => setP({ ...p, antithetic: !p.antithetic })}>
          Antithetic
        </Choice>
        <button
          type="button"
          className="min-h-11 border border-primary px-3 font-mono text-xs uppercase tracking-widest text-primary"
          onClick={() => {
            setBusy(true);
            window.setTimeout(() => {
              setBook(
                runGbm({
                  S0: 100,
                  mu: 0.08,
                  sigma: 0.2,
                  T: 1,
                  steps: 64,
                  paths: 50000,
                  seed: 15,
                  scheme: "exact",
                  antithetic: false,
                }),
              );
              setP({ S0: 100, mu: 0.08, sigma: 0.2, T: 1, steps: 64, seed: 15, scheme: "exact", antithetic: false, r: 0.05 });
              setBusy(false);
            }, 30);
          }}
        >
          {busy ? "Running book…" : "50,000-path book"}
        </button>
      </div>
      {model.ok ? (
        <>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Stat label="Sketch mean" value={usd(model.data.mean)} />
            <Stat label="Analytic mean" value={usd(model.data.analyticMean)} />
            <Stat label="Standard error" value={usd(model.data.se)} />
            <Stat label="5% quantile" value={usd(model.data.q05)} tone={model.data.pnlQ05 < 0 ? "loss" : "primary"} />
          </div>
          <p className="text-sm text-muted">
            Spot minus the 5% terminal price is {usd(model.data.varVsSpot)}. Expected shortfall of that tail is {usd(model.data.es)}.
            The sketch mean sits {num(Math.abs(model.data.mean - model.data.analyticMean) / model.data.se, 1)} standard errors from the closed form
            {Math.abs(model.data.mean - model.data.analyticMean) < 2 * model.data.se ? ", which is sampling noise, not a new model." : "."}
          </p>
          <ChartBox>
            <LineChart data={model.data.fan}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="t" tick={tick} tickFormatter={(v: number) => num(v, 2)} />
              <YAxis tick={tick} width={48} domain={["auto", "auto"]} />
              <Tooltip contentStyle={tipStyle} />
              <Line dataKey="p95" name="95%" stroke="var(--color-muted)" dot={false} strokeWidth={1} />
              <Line dataKey="p50" name="Median" stroke="var(--color-primary)" dot={false} strokeWidth={2} />
              <Line dataKey="p05" name="5%" stroke="var(--color-loss)" dot={false} strokeWidth={1} />
              <Line dataKey="s0" name="Path" stroke="var(--color-fg)" dot={false} strokeWidth={1} />
            </LineChart>
          </ChartBox>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            <Stat label="Risk-neutral call" value={usd(model.mc.price)} />
            <Stat label="Call SE" value={usd(model.mc.se)} />
            <Stat label="Black–Scholes" value={usd(model.bs.call)} tone="primary" />
          </div>
          <p className="text-sm text-muted">
            The call is simulated under the risk-free drift, not μ. A gap inside the standard error is agreement. A gap of many standard errors on a coarse Euler grid is bias.
          </p>
          {book ? (
            <p className="border border-border bg-surface px-3 py-3 font-mono text-sm text-fg">
              50,000-path book · mean {usd(book.mean)} · analytic {usd(book.analyticMean)} · 5% quantile {usd(book.q05)} · spot VaR {usd(book.varVsSpot)} · ES {usd(book.es)}
            </p>
          ) : null}
        </>
      ) : (
        <Notice>{model.error}</Notice>
      )}
      <CodeBlock caption="Repository reference · NumPy" code={GBM_CODE} />
    </div>
  );
}

const SIGMA = [
  [0.035, 0.028, 0.003],
  [0.028, 0.072, 0.001],
  [0.003, 0.001, 0.009],
];

export function BlLab() {
  const [p, setP] = useState({ delta: 2.5, tau: 0.05, qRel: 0.04, qAbs: 0.055, scale: 1, c0: 55, c1: 35, c2: 10 });
  const d = useDebounced(p, 120);
  const model = useMemo(() => {
    try {
      const data = blackLitterman({
        wMkt: [d.c0, d.c1, d.c2],
        sigma: SIGMA.map((row) => row.map((x) => x * d.scale)),
        delta: d.delta,
        tau: d.tau,
        P: [
          [-1, 1, 0],
          [0, 0, 1],
        ],
        Q: [d.qRel, d.qAbs],
        omegaScale: 1,
      });
      return { ok: true as const, data };
    } catch (error) {
      return { ok: false as const, error: message(error) };
    }
  }, [d]);
  useLogLab("bl", model.ok);
  const names = ["Domestic", "Foreign", "Bonds"];
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-1 md:grid-cols-2">
        <Field label="Risk aversion δ" value={p.delta} min={0.5} max={6} step={0.1} display={num(p.delta, 1)} onChange={(delta) => setP({ ...p, delta })} />
        <Field label="Prior scale τ" value={p.tau} min={0.01} max={0.4} step={0.01} display={num(p.tau, 2)} onChange={(tau) => setP({ ...p, tau })} />
        <Field label="Foreign minus domestic" value={p.qRel} min={-0.02} max={0.1} step={0.005} display={pct(p.qRel, 1)} onChange={(qRel) => setP({ ...p, qRel })} />
        <Field label="Bond absolute view" value={p.qAbs} min={0} max={0.12} step={0.005} display={pct(p.qAbs, 1)} onChange={(qAbs) => setP({ ...p, qAbs })} />
        <Field label="Covariance scale" value={p.scale} min={0.5} max={1.5} step={0.05} display={num(p.scale, 2)} onChange={(scale) => setP({ ...p, scale })} />
        <Field label="Domestic cap" value={p.c0} min={5} max={80} step={1} display={String(p.c0)} onChange={(c0) => setP({ ...p, c0 })} />
        <Field label="Foreign cap" value={p.c1} min={5} max={80} step={1} display={String(p.c1)} onChange={(c1) => setP({ ...p, c1 })} />
        <Field label="Bond cap" value={p.c2} min={5} max={80} step={1} display={String(p.c2)} onChange={(c2) => setP({ ...p, c2 })} />
      </div>
      {model.ok ? (
        <>
          <div className="overflow-x-auto border border-border">
            <table className="w-full min-w-[32rem] text-left font-mono text-xs">
              <thead className="text-muted">
                <tr className="border-b border-border">
                  {["Asset", "Π", "Posterior", "Weight", "Active"].map((h) => (
                    <th key={h} className="px-3 py-2 font-medium uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {names.map((name, i) => (
                  <tr key={name} className="border-b border-border">
                    <td className="px-3 py-3 text-fg">{name}</td>
                    <td className="px-3 py-3 tabular-nums">{pct(model.data.pi[i], 2)}</td>
                    <td className="px-3 py-3 tabular-nums text-primary">{pct(model.data.mu[i], 2)}</td>
                    <td className="px-3 py-3 tabular-nums">{pct(model.data.w[i], 1)}</td>
                    <td className={model.data.active[i] < 0 ? "px-3 py-3 text-loss tabular-nums" : "px-3 py-3 text-primary tabular-nums"}>
                      {pct(model.data.active[i], 1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted">
            Equilibrium spread, foreign minus domestic, is {pct(model.data.pi[1] - model.data.pi[0], 2)}. The view asked for {pct(d.qRel, 1)}.
            The posterior spread is {pct(model.data.mu[1] - model.data.mu[0], 2)}. Weights are the reverse-optimized book, forced to sum to one.
            Raw weights sum to {num(model.data.wRaw.reduce((s, x) => s + x, 0), 2)}. If that sum is far from 1, the posterior wanted leverage before the budget constraint.
          </p>
        </>
      ) : (
        <Notice>{model.error}</Notice>
      )}
      <CodeBlock caption="Repository reference · Black–Litterman" code={BL_CODE} />
    </div>
  );
}

export function BinomialLab() {
  const [p, setP] = useState({
    S: 100,
    K: 100,
    T: 1,
    r: 0.05,
    sigma: 0.2,
    steps: 80,
    type: "call" as "call" | "put",
    american: false,
  });
  const d = useDebounced(p, 80);
  const model = useMemo(() => {
    try {
      const tree = binomial({ ...d, treeSteps: 4 });
      const euro = binomial({ ...d, american: false, treeSteps: 0 });
      const amer = binomial({ ...d, american: true, treeSteps: 0 });
      const bs = blackScholes({ S: d.S, K: d.K, T: d.T, r: d.r, sigma: d.sigma });
      return { ok: true as const, tree, euro, amer, bs };
    } catch (error) {
      return { ok: false as const, error: message(error) };
    }
  }, [d]);
  useLogLab("binomial", model.ok);
  const shown = model.ok ? model.tree.tree : [];
  const maxI = shown.reduce((m, n) => Math.max(m, n.i), 0);
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-1 md:grid-cols-2">
        <Field label="Spot" value={p.S} min={40} max={180} step={1} display={usd(p.S, 0)} onChange={(S) => setP({ ...p, S })} />
        <Field label="Strike" value={p.K} min={40} max={180} step={1} display={usd(p.K, 0)} onChange={(K) => setP({ ...p, K })} />
        <Field label="Rate" value={p.r} min={0} max={0.12} step={0.005} display={pct(p.r, 1)} onChange={(r) => setP({ ...p, r })} />
        <Field label="Volatility" value={p.sigma} min={0.05} max={0.8} step={0.01} display={pct(p.sigma, 0)} onChange={(sigma) => setP({ ...p, sigma })} />
        <Field label="Steps" value={p.steps} min={2} max={400} step={2} display={String(p.steps)} onChange={(steps) => setP({ ...p, steps })} />
        <Field label="Years" value={p.T} min={0.25} max={3} step={0.25} display={num(p.T, 2)} onChange={(T) => setP({ ...p, T })} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Choice on={p.type === "call"} onClick={() => setP({ ...p, type: "call" })}>Call</Choice>
        <Choice on={p.type === "put"} onClick={() => setP({ ...p, type: "put" })}>Put</Choice>
        <Choice on={!p.american} onClick={() => setP({ ...p, american: false })}>European</Choice>
        <Choice on={p.american} onClick={() => setP({ ...p, american: true })}>American</Choice>
      </div>
      {model.ok ? (
        <>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Stat label="Tree price" value={usd(model.tree.price)} tone="primary" />
            <Stat label="Black–Scholes" value={usd(p.type === "call" ? model.bs.call : model.bs.put)} />
            <Stat label="Delta" value={num(p.type === "call" ? model.bs.deltaCall : model.bs.deltaPut, 3)} />
            <Stat label="p star" value={num(model.tree.p, 3)} />
          </div>
          <p className="text-sm text-muted">
            European {p.type} on the same tree is {usd(model.euro.price)}. American is {usd(model.amer.price)}.
            Early-exercise nodes in the American tree: {model.amer.exercises}. Parity residual on the closed form is {usd(model.bs.parityGap, 4)}.
            Vega per volatility point is {usd(model.bs.vega / 100)}.
          </p>
          <svg viewBox="0 0 360 200" className="h-52 w-full border border-border bg-surface" role="img" aria-label="Binomial tree, first steps">
            {shown.map((n) => {
              const x = 28 + (maxI === 0 ? 0 : (n.i / maxI) * 300);
              const y = 100 + (n.j - n.i / 2) * 36;
              return (
                <g key={`${n.i}-${n.j}`}>
                  <circle cx={x} cy={y} r={n.exercise ? 5 : 3.5} fill={n.exercise ? "var(--color-loss)" : "var(--color-primary)"} />
                  <text x={x + 8} y={y + 3} fill="var(--color-fg)" fontSize="9" fontFamily="IBM Plex Mono, ui-monospace, monospace">
                    {num(n.value, 1)}
                  </text>
                </g>
              );
            })}
          </svg>
        </>
      ) : (
        <Notice>{model.error}</Notice>
      )}
      <CodeBlock caption="Repository reference · CRR tree" code={BINOM_CODE} />
    </div>
  );
}

export function CapmLab() {
  const [p, setP] = useState({
    m0: 0.09, m1: 0.12, m2: 0.04,
    v0: 0.16, v1: 0.22, v2: 0.06,
    c01: 0.4, c02: 0.1, c12: 0.05,
    rf: 0.03,
  });
  const d = useDebounced(p, 120);
  const model = useMemo(() => {
    try {
      const data = meanVariance({
        mu: [d.m0, d.m1, d.m2],
        vols: [d.v0, d.v1, d.v2],
        corr: [
          [1, d.c01, d.c02],
          [d.c01, 1, d.c12],
          [d.c02, d.c12, 1],
        ],
        rf: d.rf,
      });
      return { ok: true as const, data };
    } catch (error) {
      return { ok: false as const, error: message(error) };
    }
  }, [d]);
  useLogLab("capm", model.ok);
  const names = ["A", "B", "C"];
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-1 md:grid-cols-2">
        <Field label="A expected return" value={p.m0} min={0} max={0.25} step={0.005} display={pct(p.m0, 1)} onChange={(m0) => setP({ ...p, m0 })} />
        <Field label="A volatility" value={p.v0} min={0.04} max={0.45} step={0.01} display={pct(p.v0, 0)} onChange={(v0) => setP({ ...p, v0 })} />
        <Field label="B expected return" value={p.m1} min={0} max={0.25} step={0.005} display={pct(p.m1, 1)} onChange={(m1) => setP({ ...p, m1 })} />
        <Field label="B volatility" value={p.v1} min={0.04} max={0.45} step={0.01} display={pct(p.v1, 0)} onChange={(v1) => setP({ ...p, v1 })} />
        <Field label="C expected return" value={p.m2} min={0} max={0.2} step={0.005} display={pct(p.m2, 1)} onChange={(m2) => setP({ ...p, m2 })} />
        <Field label="C volatility" value={p.v2} min={0.02} max={0.3} step={0.01} display={pct(p.v2, 0)} onChange={(v2) => setP({ ...p, v2 })} />
        <Field label="Corr A,B" value={p.c01} min={-0.4} max={0.9} step={0.05} display={num(p.c01, 2)} onChange={(c01) => setP({ ...p, c01 })} />
        <Field label="Corr A,C" value={p.c02} min={-0.4} max={0.9} step={0.05} display={num(p.c02, 2)} onChange={(c02) => setP({ ...p, c02 })} />
        <Field label="Corr B,C" value={p.c12} min={-0.4} max={0.9} step={0.05} display={num(p.c12, 2)} onChange={(c12) => setP({ ...p, c12 })} />
        <Field label="Risk-free rate" value={p.rf} min={0} max={0.08} step={0.005} display={pct(p.rf, 1)} onChange={(rf) => setP({ ...p, rf })} />
      </div>
      {model.ok ? (
        <>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            <Stat label="Tangency return" value={pct(model.data.tangency.mu, 1)} tone="primary" />
            <Stat label="Tangency vol" value={pct(model.data.tangency.vol, 1)} />
            <Stat label="Sharpe" value={num(model.data.tangency.sharpe, 2)} />
          </div>
          <ChartBox>
            <ComposedChart>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="vol" type="number" tick={tick} tickFormatter={(v: number) => pct(v, 0)} />
              <YAxis dataKey="mu" type="number" tick={tick} width={48} tickFormatter={(v: number) => pct(v, 0)} />
              <Tooltip contentStyle={tipStyle} />
              <Line data={model.data.curve} dataKey="mu" stroke="var(--color-primary)" dot={false} strokeWidth={1.5} />
              <Scatter
                data={model.data.assets.map((a, i) => ({ vol: a.vol, mu: a.mu, name: names[i] }))}
                fill="var(--color-fg)"
              />
            </ComposedChart>
          </ChartBox>
          <div className="overflow-x-auto border border-border">
            <table className="w-full min-w-[28rem] text-left font-mono text-xs">
              <thead className="text-muted">
                <tr className="border-b border-border">
                  {["Asset", "Tangency", "GMVP", "Beta", "Alpha"].map((h) => (
                    <th key={h} className="px-3 py-2 font-medium uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {model.data.assets.map((a, i) => (
                  <tr key={names[i]} className="border-b border-border">
                    <td className="px-3 py-3">{names[i]}</td>
                    <td className="px-3 py-3 tabular-nums">{pct(a.weightTangency, 1)}</td>
                    <td className="px-3 py-3 tabular-nums">{pct(a.weightGmvp, 1)}</td>
                    <td className="px-3 py-3 tabular-nums">{num(a.beta, 2)}</td>
                    <td className="px-3 py-3 tabular-nums">{pct(a.alpha, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted">
            Shorts are allowed. Alpha is the asset’s expected return minus CAPM using this tangency book as the market. On these inputs the alphas are the mispricing relative to that book, not a tradable edge after costs.
          </p>
        </>
      ) : (
        <Notice>{model.error}</Notice>
      )}
    </div>
  );
}

export function DcfLab() {
  const [p, setP] = useState({
    revenue0: 1000,
    growth: 0.06,
    ebitMargin: 0.18,
    tax: 0.21,
    wacc: 0.08,
    gTerm: 0.025,
    netDebt: 400,
    shares: 50,
    r: 0.05,
    delta: 0.04,
    sigma: 0.2,
    invest: 100,
  });
  const d = useDebounced(p, 80);
  const model = useMemo(() => {
    try {
      const value = dcf({
        revenue0: d.revenue0,
        growth: d.growth,
        ebitMargin: d.ebitMargin,
        tax: d.tax,
        daPct: 0.04,
        capexPct: 0.05,
        nwcPct: 0.1,
        wacc: d.wacc,
        gTerm: d.gTerm,
        years: 5,
        netDebt: d.netDebt,
        shares: d.shares,
      });
      const option = realOption({ r: d.r, delta: d.delta, sigma: d.sigma, invest: d.invest });
      return { ok: true as const, value, option };
    } catch (error) {
      return { ok: false as const, error: message(error) };
    }
  }, [d]);
  useLogLab("dcf", model.ok);
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-1 md:grid-cols-2">
        <Field label="Base revenue" value={p.revenue0} min={200} max={3000} step={50} display={num(p.revenue0, 0)} onChange={(revenue0) => setP({ ...p, revenue0 })} />
        <Field label="Growth" value={p.growth} min={0} max={0.2} step={0.005} display={pct(p.growth, 1)} onChange={(growth) => setP({ ...p, growth })} />
        <Field label="EBIT margin" value={p.ebitMargin} min={0.05} max={0.4} step={0.01} display={pct(p.ebitMargin, 0)} onChange={(ebitMargin) => setP({ ...p, ebitMargin })} />
        <Field label="Tax" value={p.tax} min={0} max={0.4} step={0.01} display={pct(p.tax, 0)} onChange={(tax) => setP({ ...p, tax })} />
        <Field label="WACC" value={p.wacc} min={0.04} max={0.16} step={0.005} display={pct(p.wacc, 1)} onChange={(wacc) => setP({ ...p, wacc })} />
        <Field label="Terminal g" value={p.gTerm} min={0} max={0.06} step={0.005} display={pct(p.gTerm, 1)} onChange={(gTerm) => setP({ ...p, gTerm })} />
        <Field label="Net debt" value={p.netDebt} min={0} max={2000} step={25} display={num(p.netDebt, 0)} onChange={(netDebt) => setP({ ...p, netDebt })} />
        <Field label="Shares, millions" value={p.shares} min={10} max={200} step={1} display={num(p.shares, 0)} onChange={(shares) => setP({ ...p, shares })} />
      </div>
      {model.ok ? (
        <>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Stat label="Enterprise value" value={num(model.value.ev, 0)} tone="primary" />
            <Stat label="Equity value" value={num(model.value.equity, 0)} />
            <Stat label="Per share" value={usd(model.value.perShare)} />
            <Stat label="Terminal, PV" value={num(model.value.pvTv, 0)} />
          </div>
          <div className="overflow-x-auto border border-border">
            <table className="w-full min-w-[36rem] text-left font-mono text-xs">
              <thead className="text-muted">
                <tr className="border-b border-border">
                  {["Year", "Revenue", "NOPAT", "FCFF", "PV"].map((h) => (
                    <th key={h} className="px-3 py-2 font-medium uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {model.value.years.map((y) => (
                  <tr key={y.year} className="border-b border-border">
                    <td className="px-3 py-3">{y.year}</td>
                    <td className="px-3 py-3 tabular-nums">{num(y.revenue, 0)}</td>
                    <td className="px-3 py-3 tabular-nums">{num(y.nopat, 1)}</td>
                    <td className="px-3 py-3 tabular-nums">{num(y.fcff, 1)}</td>
                    <td className="px-3 py-3 tabular-nums">{num(y.pv, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted">
            Depreciation is 4% of sales, capex 5%, working capital 10% of sales. FCFF is discounted at WACC. Terminal value uses next year’s cash flow, so WACC must clear g.
          </p>
        </>
      ) : (
        <Notice>{model.error}</Notice>
      )}
      <div className="border border-border p-4">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">Option to wait</p>
        <div className="mt-3 grid gap-1 md:grid-cols-2">
          <Field label="Discount rate" value={p.r} min={0.02} max={0.12} step={0.005} display={pct(p.r, 1)} onChange={(r) => setP({ ...p, r })} />
          <Field label="Cash-flow yield" value={p.delta} min={0.01} max={0.1} step={0.005} display={pct(p.delta, 1)} onChange={(delta) => setP({ ...p, delta })} />
          <Field label="Project volatility" value={p.sigma} min={0.05} max={0.5} step={0.01} display={pct(p.sigma, 0)} onChange={(sigma) => setP({ ...p, sigma })} />
          <Field label="Investment cost" value={p.invest} min={20} max={300} step={5} display={num(p.invest, 0)} onChange={(invest) => setP({ ...p, invest })} />
        </div>
        {model.ok ? (
          <p className="mt-3 text-sm text-muted">
            β = {num(model.option.beta, 2)}. The trigger is {num(model.option.vStar, 1)}, which is {num(model.option.markup, 2)} times the investment cost. Waiting is rational until project value clears that line.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function AnalyticsLab() {
  const [p, setP] = useState({
    noise: 0.04,
    outlier: 0,
    seed: 1,
    lambda: 1e-7,
    eta: 5e-7,
  });
  const d = useDebounced(p, 80);
  const reg = useMemo(
    () => crossSection({ n: 36, noise: d.noise, outlier: d.outlier, seed: d.seed, truePremium: 0.06, alpha: 0.01 }),
    [d],
  );
  const impact = useMemo(
    () =>
      almgrenChriss({
        shares: 1_000_000,
        sigma: 0.945,
        days: 5,
        slices: 10,
        eta: d.eta,
        gamma: 2e-7,
        lambda: d.lambda,
      }),
    [d],
  );
  useLogLab("analytics", true);
  const path = impact.ac.map((row, i) => ({
    t: row.t,
    optimal: row.remaining / 1_000_000,
    twap: impact.twap[i].remaining / 1_000_000,
  }));
  const fit = [
    { beta: reg.points[0].beta, fit: reg.intercept + reg.slope * reg.points[0].beta },
    {
      beta: reg.points[reg.points.length - 1].beta,
      fit: reg.intercept + reg.slope * reg.points[reg.points.length - 1].beta,
    },
  ];
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">Cross-section</p>
        <div className="grid gap-1 md:grid-cols-2">
          <Field label="Noise" value={p.noise} min={0.01} max={0.15} step={0.005} display={pct(p.noise, 1)} onChange={(noise) => setP({ ...p, noise })} />
          <Field label="High-beta outlier" value={p.outlier} min={-0.3} max={0.3} step={0.01} display={pct(p.outlier, 0)} onChange={(outlier) => setP({ ...p, outlier })} />
        </div>
        <button
          type="button"
          className="min-h-11 w-fit border border-border px-3 font-mono text-xs uppercase tracking-widest text-fg"
          onClick={() => setP({ ...p, seed: p.seed + 1 })}
        >
          New draw
        </button>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Slope" value={pct(reg.slope, 2)} tone="primary" />
          <Stat label="True premium" value={pct(reg.truePremium, 0)} />
          <Stat label="R²" value={num(reg.r2, 2)} />
        </div>
        <ChartBox>
          <ComposedChart>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="beta" type="number" tick={tick} />
            <YAxis tick={tick} width={48} tickFormatter={(v: number) => pct(v, 0)} />
            <Tooltip contentStyle={tipStyle} />
            <Scatter data={reg.points} dataKey="ret" fill="var(--color-fg)" />
            <Line data={fit} dataKey="fit" stroke="var(--color-primary)" dot={false} strokeWidth={1.5} />
          </ComposedChart>
        </ChartBox>
        <p className="text-sm text-muted">
          The line is ordinary least squares. The true premium is 6%. Move the outlier and watch the slope leave the process that generated the cloud.
        </p>
      </section>
      <section className="flex flex-col gap-4">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">Almgren–Chriss</p>
        <div className="grid gap-1 md:grid-cols-2">
          <Field
            label="Risk aversion λ"
            value={p.lambda}
            min={0}
            max={8e-7}
            step={1e-8}
            display={p.lambda.toExponential(1)}
            onChange={(lambda) => setP({ ...p, lambda })}
          />
          <Field
            label="Temporary impact η"
            value={p.eta}
            min={1e-7}
            max={2e-6}
            step={1e-7}
            display={p.eta.toExponential(1)}
            onChange={(eta) => setP({ ...p, eta })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Optimal cost" value={usd(impact.acCost.total, 0)} tone="primary" />
          <Stat label="TWAP cost" value={usd(impact.twapCost.total, 0)} />
          <Stat label="Optimal utility" value={usd(impact.acCost.utility, 0)} />
          <Stat label="TWAP utility" value={usd(impact.twapCost.utility, 0)} />
        </div>
        <ChartBox>
          <LineChart data={path}>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="t" tick={tick} tickFormatter={(v: number) => num(v, 1)} />
            <YAxis tick={tick} width={40} tickFormatter={(v: number) => num(v, 1)} />
            <Tooltip contentStyle={tipStyle} />
            <Line dataKey="optimal" name="Optimal" stroke="var(--color-primary)" dot={false} strokeWidth={2} />
            <Line dataKey="twap" name="TWAP" stroke="var(--color-muted)" dot={false} strokeWidth={1.5} />
          </LineChart>
        </ChartBox>
        <ChartBox>
          <BarChart data={impact.ac.filter((row) => row.trade > 0).map((row, i) => ({ i: i + 1, trade: row.trade / 1000 }))}>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="i" tick={tick} />
            <YAxis tick={tick} width={40} />
            <Tooltip contentStyle={tipStyle} />
            <Bar dataKey="trade" fill="var(--color-primary)" />
          </BarChart>
        </ChartBox>
        <p className="text-sm text-muted">
          κ = {num(impact.kappa, 3)}. Inventory is in millions of shares. The bars are thousands of shares per slice. At λ = 0 the schedule is TWAP. Higher λ front-loads. Higher η pushes back toward the straight line. Utility is expected cost plus λ times variance.
        </p>
      </section>
    </div>
  );
}
