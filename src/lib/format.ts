export function pct(x: number, digits = 1): string {
  if (!Number.isFinite(x)) return "—";
  return `${(x * 100).toFixed(digits)}%`;
}

export function num(x: number, digits = 2): string {
  if (!Number.isFinite(x)) return "—";
  return x.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function usd(x: number, digits = 2): string {
  if (!Number.isFinite(x)) return "—";
  return x.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function compact(x: number, digits = 1): string {
  if (!Number.isFinite(x)) return "—";
  return x.toLocaleString("en-US", {
    notation: "compact",
    maximumFractionDigits: digits,
  });
}
