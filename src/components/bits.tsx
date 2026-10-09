import * as Slider from "@radix-ui/react-slider";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-mono text-xs uppercase tracking-widest text-primary">{children}</p>;
}

export function Rule() {
  return <hr className="border-0 border-t border-border" />;
}

export function Sheet({ children }: { children: ReactNode }) {
  return <div className="bg-sheet px-5 py-6 text-sheet-ink md:px-8 md:py-8">{children}</div>;
}

export function Equation({ label, children }: { label?: string; children: string }) {
  return (
    <figure className="border-l-2 border-primary bg-surface px-4 py-3">
      {label ? (
        <figcaption className="mb-1 font-mono text-xs uppercase tracking-widest text-muted">{label}</figcaption>
      ) : null}
      <p className="overflow-x-auto font-mono text-sm leading-relaxed text-fg tabular-nums">{children}</p>
    </figure>
  );
}

export function CodeBlock({ caption, code }: { caption: string; code: string }) {
  return (
    <figure className="border border-border bg-bg">
      <figcaption className="border-b border-border px-3 py-2 font-mono text-xs uppercase tracking-widest text-muted">
        {caption}
      </figcaption>
      <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-fg">
        <code>{code}</code>
      </pre>
    </figure>
  );
}

export function Stat({ label, value, tone = "fg" }: { label: string; value: string; tone?: "fg" | "primary" | "loss" }) {
  return (
    <div className="border border-border bg-surface px-3 py-3">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">{label}</p>
      <p
        className={cn(
          "mt-1 font-mono text-lg tabular-nums",
          tone === "primary" && "text-primary",
          tone === "loss" && "text-loss",
          tone === "fg" && "text-fg",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function Field({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (next: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between gap-3">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">{label}</span>
        <span className="font-mono text-sm text-fg tabular-nums">{display}</span>
      </span>
      <Slider.Root
        className="relative flex h-11 touch-none items-center"
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(next) => onChange(next[0] ?? value)}
      >
        <Slider.Track className="relative h-px grow bg-border">
          <Slider.Range className="absolute h-px bg-primary" />
        </Slider.Track>
        <Slider.Thumb className="block size-4 border border-primary bg-bg" aria-label={label} />
      </Slider.Root>
    </label>
  );
}

export function Choice({
  on,
  children,
  onClick,
}: {
  on: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 border px-3 font-mono text-xs uppercase tracking-widest",
        on ? "border-primary bg-primary text-primary-fg" : "border-border text-fg",
      )}
    >
      {children}
    </button>
  );
}

export function useDebounced<T>(value: T, ms = 160): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

export function Notice({ children }: { children: ReactNode }) {
  return <p className="border border-loss/40 bg-surface px-3 py-3 text-sm text-loss">{children}</p>;
}
