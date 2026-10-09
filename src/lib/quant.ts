/** Quantitative engines for the Master Boards desk. Pure functions, no IO. */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randn(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function normCdf(x: number): number {
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.2316419 * ax);
  const d = 0.3989422804014327 * Math.exp(-0.5 * x * x);
  const p =
    d *
    t *
    (0.319381530 +
      t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x >= 0 ? 1 - p : p;
}

export function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export function quantile(sorted: ArrayLike<number>, q: number): number {
  if (sorted.length === 0) return NaN;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] * (hi - pos) + sorted[hi] * (pos - lo);
}

export function matVec(a: number[][], v: number[]): number[] {
  return a.map((row) => row.reduce((sum, x, i) => sum + x * v[i], 0));
}

export function matMul(a: number[][], b: number[][]): number[][] {
  const n = a.length;
  const m = b[0]?.length ?? 0;
  const k = b.length;
  const out = Array.from({ length: n }, () => Array(m).fill(0));
  for (let i = 0; i < n; i++) {
    for (let t = 0; t < k; t++) {
      const aik = a[i][t];
      for (let j = 0; j < m; j++) out[i][j] += aik * b[t][j];
    }
  }
  return out;
}

export function transpose(a: number[][]): number[][] {
  const n = a.length;
  const m = a[0]?.length ?? 0;
  const out = Array.from({ length: m }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) out[j][i] = a[i][j];
  return out;
}

export function scaleMat(a: number[][], s: number): number[][] {
  return a.map((row) => row.map((x) => x * s));
}

export function addMat(a: number[][], b: number[][]): number[][] {
  return a.map((row, i) => row.map((x, j) => x + b[i][j]));
}

export function addVec(a: number[], b: number[]): number[] {
  return a.map((x, i) => x + b[i]);
}

export function invert(matrix: number[][]): number[][] {
  const n = matrix.length;
  const a = matrix.map((row, i) => {
    const aug = Array(2 * n).fill(0);
    for (let j = 0; j < n; j++) aug[j] = row[j];
    aug[n + i] = 1;
    return aug;
  });
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;
    }
    if (Math.abs(a[pivot][col]) < 1e-12) {
      throw new Error("Matrix is singular or not positive definite.");
    }
    if (pivot !== col) {
      const tmp = a[col];
      a[col] = a[pivot];
      a[pivot] = tmp;
    }
    const div = a[col][col];
    for (let j = 0; j < 2 * n; j++) a[col][j] /= div;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = a[r][col];
      if (f === 0) continue;
      for (let j = 0; j < 2 * n; j++) a[r][j] -= f * a[col][j];
    }
  }
  return a.map((row) => row.slice(n));
}

export type GbmScheme = "exact" | "euler";

export type GbmResult = {
  mean: number;
  std: number;
  se: number;
  analyticMean: number;
  analyticMedian: number;
  q05: number;
  es: number;
  varVsSpot: number;
  pnlQ05: number;
  pathsUsed: number;
  steps: number;
  scheme: GbmScheme;
  antithetic: boolean;
  fan: { t: number; p05: number; p50: number; p95: number; s0: number; s1: number; s2: number; s3: number }[];
  hist: { x: number; c: number }[];
};

function stepFactor(mu: number, sigma: number, dt: number, z: number, scheme: GbmScheme): number {
  if (scheme === "euler") return 1 + mu * dt + sigma * Math.sqrt(dt) * z;
  return Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * z);
}

export function runGbm(input: {
  S0: number;
  mu: number;
  sigma: number;
  T: number;
  steps: number;
  paths: number;
  seed: number;
  scheme: GbmScheme;
  antithetic: boolean;
}): GbmResult {
  const { S0, mu, sigma, T, scheme, antithetic } = input;
  const steps = Math.max(1, Math.round(input.steps));
  const paths = Math.max(200, Math.round(input.paths));
  const dt = T / steps;
  const rng = mulberry32(input.seed);
  const terminals = new Float64Array(paths);
  const fanSteps = Math.min(steps, 24);
  const fanPaths = Math.min(paths, 1600);
  const markAt: number[] = [0];
  for (let i = 1; i <= fanSteps; i++) {
    const s = Math.round((i * steps) / fanSteps);
    if (s !== markAt[markAt.length - 1]) markAt.push(s);
  }
  const markIndex = new Map(markAt.map((step, i) => [step, i]));
  const fanStore: number[][] = markAt.map(() => []);
  const samples: number[][] = Array.from({ length: 4 }, () => Array(markAt.length).fill(S0));
  let lastShocks: number[] = [];

  for (let p = 0; p < paths; p++) {
    const paired = antithetic && p % 2 === 1 && lastShocks.length === steps;
    const shocks = paired ? lastShocks.map((z) => -z) : Array.from({ length: steps }, () => randn(rng));
    if (!paired) lastShocks = shocks;
    let s = S0;
    if (p < fanPaths) fanStore[0].push(S0);
    for (let k = 1; k <= steps; k++) {
      s *= stepFactor(mu, sigma, dt, shocks[k - 1], scheme);
      if (s < 0) s = 0;
      const mi = markIndex.get(k);
      if (mi !== undefined && p < fanPaths) {
        fanStore[mi].push(s);
        if (p < 4) samples[p][mi] = s;
      }
    }
    terminals[p] = s;
  }

  const sorted = Float64Array.from(terminals).sort();
  let sum = 0;
  let sum2 = 0;
  for (let i = 0; i < paths; i++) {
    sum += terminals[i];
    sum2 += terminals[i] * terminals[i];
  }
  const mean = sum / paths;
  const variance = Math.max(0, sum2 / paths - mean * mean);
  const std = Math.sqrt(variance);
  const q05 = quantile(sorted, 0.05);
  let esSum = 0;
  let esN = 0;
  for (let i = 0; i < paths; i++) {
    if (sorted[i] <= q05 + 1e-9) {
      esSum += sorted[i];
      esN += 1;
    }
  }
  const histBins = 22;
  let lo = sorted[0];
  let hi = sorted[sorted.length - 1];
  if (hi <= lo) hi = lo + 1;
  const width = (hi - lo) / histBins;
  const counts = Array(histBins).fill(0) as number[];
  for (let i = 0; i < paths; i++) {
    let idx = Math.floor((terminals[i] - lo) / width);
    if (idx >= histBins) idx = histBins - 1;
    if (idx < 0) idx = 0;
    counts[idx] += 1;
  }

  const fan = fanStore.map((col, i) => {
    const colSorted = Float64Array.from(col).sort();
    return {
      t: (markAt[i] / steps) * T,
      p05: quantile(colSorted, 0.05),
      p50: quantile(colSorted, 0.5),
      p95: quantile(colSorted, 0.95),
      s0: samples[0][i],
      s1: samples[1][i],
      s2: samples[2][i],
      s3: samples[3][i],
    };
  });

  return {
    mean,
    std,
    se: std / Math.sqrt(paths),
    analyticMean: S0 * Math.exp(mu * T),
    analyticMedian: S0 * Math.exp((mu - 0.5 * sigma * sigma) * T),
    q05,
    es: esN ? esSum / esN : q05,
    varVsSpot: S0 - q05,
    pnlQ05: q05 - S0,
    pathsUsed: paths,
    steps,
    scheme,
    antithetic,
    fan,
    hist: counts.map((c, i) => ({ x: lo + (i + 0.5) * width, c })),
  };
}

export function mcEuropeanCall(input: {
  S0: number;
  K: number;
  r: number;
  sigma: number;
  T: number;
  steps: number;
  paths: number;
  seed: number;
  scheme: GbmScheme;
}): { price: number; se: number } {
  const { S0, K, r, sigma, T, scheme } = input;
  const steps = Math.max(1, Math.round(input.steps));
  const paths = Math.max(200, Math.round(input.paths));
  const dt = T / steps;
  const rng = mulberry32(input.seed + 97);
  const df = Math.exp(-r * T);
  let sum = 0;
  let sum2 = 0;
  for (let p = 0; p < paths; p++) {
    let s = S0;
    for (let k = 0; k < steps; k++) {
      s *= stepFactor(r, sigma, dt, randn(rng), scheme);
      if (s < 0) s = 0;
    }
    const payoff = df * Math.max(s - K, 0);
    sum += payoff;
    sum2 += payoff * payoff;
  }
  const mean = sum / paths;
  const v = Math.max(0, sum2 / paths - mean * mean);
  return { price: mean, se: Math.sqrt(v / paths) };
}

export type BlResult = {
  pi: number[];
  mu: number[];
  omegaDiag: number[];
  w: number[];
  wRaw: number[];
  active: number[];
};

export function blackLitterman(input: {
  wMkt: number[];
  sigma: number[][];
  delta: number;
  tau: number;
  P: number[][];
  Q: number[];
  omegaScale: number;
}): BlResult {
  const { wMkt, sigma, delta, tau, P, Q, omegaScale } = input;
  const sumW = wMkt.reduce((a, b) => a + b, 0);
  if (Math.abs(sumW) < 1e-8) throw new Error("Market weights sum to zero.");
  const w = wMkt.map((x) => x / sumW);
  const pi = matVec(scaleMat(sigma, delta), w);
  const tauSigma = scaleMat(sigma, tau);
  const middle = matMul(P, matMul(tauSigma, transpose(P)));
  const omegaDiag = middle.map((row, i) => Math.max(row[i] * omegaScale, 1e-10));
  const invTau = invert(tauSigma);
  const invOmega = omegaDiag.map((d) => 1 / d);
  // P' Ω^{-1} P and P' Ω^{-1} Q
  const k = P.length;
  const n = w.length;
  const ptInvP = Array.from({ length: n }, () => Array(n).fill(0));
  const ptInvQ = Array(n).fill(0);
  for (let a = 0; a < k; a++) {
    for (let i = 0; i < n; i++) {
      ptInvQ[i] += P[a][i] * invOmega[a] * Q[a];
      for (let j = 0; j < n; j++) ptInvP[i][j] += P[a][i] * invOmega[a] * P[a][j];
    }
  }
  const precision = addMat(invTau, ptInvP);
  const postCovMean = invert(precision);
  const rhs = addVec(matVec(invTau, pi), ptInvQ);
  const mu = matVec(postCovMean, rhs);
  // Unconstrained reverse optimization on prior covariance, then fully invested.
  const wRaw = matVec(invert(scaleMat(sigma, delta)), mu);
  const wSum = wRaw.reduce((a, b) => a + b, 0);
  const wBl = Math.abs(wSum) < 1e-10 ? wRaw.map(() => 1 / n) : wRaw.map((x) => x / wSum);
  return {
    pi,
    mu,
    omegaDiag,
    w: wBl,
    wRaw,
    active: wBl.map((x, i) => x - w[i]),
  };
}

export function covarianceFromVolCorr(vols: number[], corr: number[][]): number[][] {
  const n = vols.length;
  const sigma = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) sigma[i][j] = vols[i] * vols[j] * corr[i][j];
  }
  return sigma;
}

export type FrontierResult = {
  assets: { mu: number; vol: number; weightTangency: number; weightGmvp: number; beta: number; alpha: number }[];
  tangency: { mu: number; vol: number; sharpe: number };
  gmvp: { mu: number; vol: number };
  curve: { vol: number; mu: number }[];
};

export function meanVariance(input: {
  mu: number[];
  vols: number[];
  corr: number[][];
  rf: number;
}): FrontierResult {
  const { mu, vols, rf } = input;
  const sigma = covarianceFromVolCorr(vols, input.corr);
  const inv = invert(sigma);
  const n = mu.length;
  const ones = Array(n).fill(1);
  const excess = mu.map((m) => m - rf);
  const rawT = matVec(inv, excess);
  const sumT = rawT.reduce((a, b) => a + b, 0);
  if (Math.abs(sumT) < 1e-10) throw new Error("Tangency portfolio is undefined. Excess returns cancel.");
  const wT = rawT.map((x) => x / sumT);
  const rawG = matVec(inv, ones);
  const sumG = rawG.reduce((a, b) => a + b, 0);
  const wG = rawG.map((x) => x / sumG);

  const port = (w: number[]) => {
    const m = w.reduce((s, wi, i) => s + wi * mu[i], 0);
    const v = Math.sqrt(Math.max(0, w.reduce((s, wi, i) => s + wi * matVec(sigma, w)[i], 0)));
    return { mu: m, vol: v };
  };
  const tangency = port(wT);
  const gmvp = port(wG);
  const sharpe = tangency.vol > 1e-8 ? (tangency.mu - rf) / tangency.vol : NaN;
  const varM = tangency.vol * tangency.vol;

  const assets = mu.map((m, i) => {
    const covIM = matVec(sigma, wT)[i];
    const beta = varM > 1e-12 ? covIM / varM : NaN;
    const capm = rf + beta * (tangency.mu - rf);
    return {
      mu: m,
      vol: vols[i],
      weightTangency: wT[i],
      weightGmvp: wG[i],
      beta,
      alpha: m - capm,
    };
  });

  // Analytic frontier: σ²(m) = (A m² - 2 B m + C) / Δ
  const invOnes = matVec(inv, ones);
  const invMu = matVec(inv, mu);
  const A = ones.reduce((s, _, i) => s + invOnes[i], 0);
  const B = ones.reduce((s, _, i) => s + invMu[i], 0);
  const C = mu.reduce((s, mi, i) => s + mi * invMu[i], 0);
  const delta = A * C - B * B;
  const lo = Math.min(...mu) - 0.03;
  const hi = Math.max(...mu) + 0.04;
  const curve: { vol: number; mu: number }[] = [];
  for (let i = 0; i <= 28; i++) {
    const m = lo + ((hi - lo) * i) / 28;
    const v2 = (A * m * m - 2 * B * m + C) / delta;
    if (v2 > 0 && Number.isFinite(v2)) curve.push({ mu: m, vol: Math.sqrt(v2) });
  }
  return { assets, tangency: { ...tangency, sharpe }, gmvp, curve };
}

export function blackScholes(input: { S: number; K: number; T: number; r: number; sigma: number }) {
  const { S, K, T, r, sigma } = input;
  const df = Math.exp(-r * T);
  const vol = sigma * Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / vol;
  const d2 = d1 - vol;
  const nd1 = normCdf(d1);
  const nd2 = normCdf(d2);
  const call = S * nd1 - K * df * nd2;
  const put = K * df * normCdf(-d2) - S * normCdf(-d1);
  const pdf = normPdf(d1);
  return {
    call,
    put,
    d1,
    d2,
    deltaCall: nd1,
    deltaPut: nd1 - 1,
    gamma: pdf / (S * vol),
    vega: S * pdf * Math.sqrt(T),
    thetaCall: (-(S * pdf * sigma) / (2 * Math.sqrt(T)) - r * K * df * nd2) / 365,
    parityGap: call - put - (S - K * df),
  };
}

export type TreeNode = { i: number; j: number; spot: number; value: number; exercise: boolean };

export function binomial(input: {
  S: number;
  K: number;
  T: number;
  r: number;
  sigma: number;
  steps: number;
  type: "call" | "put";
  american: boolean;
  treeSteps?: number;
}): { price: number; u: number; d: number; p: number; dt: number; tree: TreeNode[]; exercises: number } {
  const { S, K, T, r, sigma, type, american } = input;
  const steps = Math.max(1, Math.round(input.steps));
  const dt = T / steps;
  const u = Math.exp(sigma * Math.sqrt(dt));
  const d = 1 / u;
  const growth = Math.exp(r * dt);
  const p = (growth - d) / (u - d);
  if (p <= 0 || p >= 1) throw new Error("Risk-neutral probability left (0,1). Check rate and volatility.");
  const disc = Math.exp(-r * dt);
  const payoff = (spot: number) => (type === "call" ? Math.max(spot - K, 0) : Math.max(K - spot, 0));
  let values = Array.from({ length: steps + 1 }, (_, j) => payoff(S * u ** (steps - j) * d ** j));
  const show = Math.min(steps, input.treeSteps ?? 4);
  const tree: TreeNode[] = [];
  let exercises = 0;
  for (let i = steps; i >= 0; i--) {
    const layer = values.slice(0, i + 1);
    if (i <= show) {
      for (let j = 0; j <= i; j++) {
        const spot = S * u ** (i - j) * d ** j;
        const intrinsic = payoff(spot);
        tree.push({
          i,
          j,
          spot,
          value: layer[j],
          exercise: american && i < steps && intrinsic > 1e-8 && layer[j] <= intrinsic + 1e-8,
        });
      }
    }
    if (i === 0) break;
    const next = Array(i).fill(0);
    for (let j = 0; j < i; j++) {
      const cont = disc * (p * layer[j] + (1 - p) * layer[j + 1]);
      const spot = S * u ** (i - 1 - j) * d ** j;
      const intrinsic = payoff(spot);
      if (american && intrinsic > cont + 1e-8) {
        next[j] = intrinsic;
        exercises += 1;
      } else {
        next[j] = cont;
      }
    }
    values = next;
  }
  return { price: values[0], u, d, p, dt, tree, exercises };
}

export type DcfYear = {
  year: number;
  revenue: number;
  ebit: number;
  nopat: number;
  da: number;
  capex: number;
  nwc: number;
  dNwc: number;
  fcff: number;
  pv: number;
};

export type DcfResult = {
  years: DcfYear[];
  tv: number;
  pvTv: number;
  ev: number;
  equity: number;
  perShare: number;
};

export function dcf(input: {
  revenue0: number;
  growth: number;
  ebitMargin: number;
  tax: number;
  daPct: number;
  capexPct: number;
  nwcPct: number;
  wacc: number;
  gTerm: number;
  years: number;
  netDebt: number;
  shares: number;
}): DcfResult {
  const yearsN = Math.max(1, Math.round(input.years));
  if (input.wacc <= input.gTerm) throw new Error("WACC must exceed the terminal growth rate.");
  let prevRev = input.revenue0;
  let prevNwc = input.nwcPct * input.revenue0;
  const years: DcfYear[] = [];
  let ev = 0;
  for (let t = 1; t <= yearsN; t++) {
    const revenue = prevRev * (1 + input.growth);
    const ebit = revenue * input.ebitMargin;
    const nopat = ebit * (1 - input.tax);
    const da = revenue * input.daPct;
    const capex = revenue * input.capexPct;
    const nwc = revenue * input.nwcPct;
    const dNwc = nwc - prevNwc;
    const fcff = nopat + da - capex - dNwc;
    const pv = fcff / (1 + input.wacc) ** t;
    years.push({ year: t, revenue, ebit, nopat, da, capex, nwc, dNwc, fcff, pv });
    ev += pv;
    prevRev = revenue;
    prevNwc = nwc;
  }
  const last = years[years.length - 1].fcff;
  const tv = (last * (1 + input.gTerm)) / (input.wacc - input.gTerm);
  const pvTv = tv / (1 + input.wacc) ** yearsN;
  ev += pvTv;
  const equity = ev - input.netDebt;
  return { years, tv, pvTv, ev, equity, perShare: input.shares > 0 ? equity / input.shares : NaN };
}

export function realOption(input: { r: number; delta: number; sigma: number; invest: number }) {
  const { r, delta, sigma, invest } = input;
  if (delta <= 0) throw new Error("Cash-flow yield must be positive, or the option to wait is never exercised.");
  const a = 0.5 * sigma * sigma;
  const B = r - delta - a;
  const disc = B * B + 4 * a * r;
  const beta = (-B + Math.sqrt(disc)) / (2 * a);
  const markup = beta / (beta - 1);
  return { beta, markup, vStar: markup * invest };
}

export type ImpactResult = {
  kappa: number;
  ac: { t: number; remaining: number; trade: number }[];
  twap: { t: number; remaining: number; trade: number }[];
  acCost: { temporary: number; permanent: number; total: number; variance: number; stdev: number; utility: number };
  twapCost: { temporary: number; permanent: number; total: number; variance: number; stdev: number; utility: number };
};

function sinhRatio(a: number, b: number): number {
  if (b > 18) return Math.exp(Math.min(0, a - b));
  return Math.sinh(a) / Math.sinh(b);
}
function trajectoryCost(
  trades: number[],
  X: number,
  tau: number,
  sigma: number,
  eta: number,
  gamma: number,
  lambda: number,
) {
  let temporary = 0;
  let permanent = 0;
  let variance = 0;
  let inventory = X;
  for (const n of trades) {
    const already = X - inventory;
    permanent += n * (gamma * already + 0.5 * gamma * n);
    temporary += (eta * n * n) / tau;
    inventory -= n;
    variance += inventory * inventory * sigma * sigma * tau;
  }
  const total = temporary + permanent;
  return { temporary, permanent, total, variance, stdev: Math.sqrt(variance), utility: total + lambda * variance };
}

export function almgrenChriss(input: {
  shares: number;
  sigma: number;
  days: number;
  slices: number;
  eta: number;
  gamma: number;
  lambda: number;
}): ImpactResult {
  const { shares: X, sigma, eta, gamma, lambda } = input;
  const N = Math.max(2, Math.round(input.slices));
  const T = input.days;
  const tau = T / N;
  const kappa = Math.sqrt((lambda * sigma * sigma) / Math.max(eta, 1e-16));
  const acTrades: number[] = [];
  const twapTrades: number[] = [];
  const ac: ImpactResult["ac"] = [];
  const twap: ImpactResult["twap"] = [];
  for (let k = 0; k <= N; k++) {
    const t = k * tau;
    const rem = T - t;
    const remaining = kappa < 1e-8 ? X * (rem / T) : X * sinhRatio(kappa * rem, kappa * T);
    const twapRem = X * (rem / T);
    if (k < N) {
      const tNext = (k + 1) * tau;
      const remNext = T - tNext;
      const next = kappa < 1e-8 ? X * (remNext / T) : X * sinhRatio(kappa * remNext, kappa * T);
      const trade = remaining - next;
      acTrades.push(trade);
      twapTrades.push(X / N);
      ac.push({ t, remaining, trade });
      twap.push({ t, remaining: twapRem, trade: X / N });
    } else {
      ac.push({ t, remaining, trade: 0 });
      twap.push({ t, remaining: twapRem, trade: 0 });
    }
  }
  return {
    kappa,
    ac,
    twap,
    acCost: trajectoryCost(acTrades, X, tau, sigma, eta, gamma, lambda),
    twapCost: trajectoryCost(twapTrades, X, tau, sigma, eta, gamma, lambda),
  };
}

export type RegressionResult = {
  points: { beta: number; ret: number; fit: number }[];
  intercept: number;
  slope: number;
  r2: number;
  truePremium: number;
};

export function crossSection(input: {
  n: number;
  noise: number;
  outlier: number;
  seed: number;
  truePremium: number;
  alpha: number;
}): RegressionResult {
  const n = Math.max(12, Math.round(input.n));
  const rng = mulberry32(input.seed);
  const betas: number[] = [];
  const rets: number[] = [];
  for (let i = 0; i < n; i++) {
    const beta = 0.15 + (i / (n - 1)) * 1.7;
    let ret = input.alpha + input.truePremium * beta + input.noise * randn(rng);
    if (i === n - 1) ret += input.outlier;
    betas.push(beta);
    rets.push(ret);
  }
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    sx += betas[i];
    sy += rets[i];
    sxx += betas[i] * betas[i];
    sxy += betas[i] * rets[i];
  }
  const den = n * sxx - sx * sx;
  const slope = (n * sxy - sx * sy) / den;
  const intercept = (sy - slope * sx) / n;
  let ssTot = 0;
  let ssRes = 0;
  const mean = sy / n;
  const points = betas.map((beta, i) => {
    const fit = intercept + slope * beta;
    ssRes += (rets[i] - fit) ** 2;
    ssTot += (rets[i] - mean) ** 2;
    return { beta, ret: rets[i], fit };
  });
  return {
    points,
    intercept,
    slope,
    r2: ssTot > 0 ? 1 - ssRes / ssTot : 0,
    truePremium: input.truePremium,
  };
}
