import { createFileRoute, Link } from "@tanstack/react-router";
import { PREP } from "@/data/prep";
import { useProgress } from "@/lib/progress";
import { Eyebrow } from "@/components/bits";

export const Route = createFileRoute("/prep/")({
  component: PrepIndex,
  head: () => ({ meta: [{ title: "Prerequisites · Master Boards" }] }),
});

function PrepIndex() {
  const lectures = useProgress((s) => s.lectures);
  return (
    <div className="flex flex-col gap-6">
      <header>
        <Eyebrow>Suggested background</Eyebrow>
        <h1 className="mt-2 text-4xl">Five prerequisites</h1>
        <p className="mt-3 max-w-xl text-muted">
          Linear algebra, multivariable calculus, probability, statistics, and Python literacy — the preparation Sloan publishes before the MFin core. Each sitting has a film, the lecture, and a drill. Sign it when the arithmetic is yours.
        </p>
      </header>
      <ol className="border-t border-border">
        {PREP.map((m) => (
          <li key={m.id} className="border-b border-border">
            <Link to="/prep/$id" params={{ id: m.id }} className="flex min-h-16 items-center gap-4 py-3">
              <span className="w-8 font-mono text-xs text-primary">{m.index}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg text-fg">{m.title}</span>
                <span className="block font-mono text-xs uppercase tracking-widest text-muted">
                  {m.code} · {lectures[m.id] ? "Signed" : m.sitting}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
