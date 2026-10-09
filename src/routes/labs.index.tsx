import { createFileRoute, Link } from "@tanstack/react-router";
import { LABS } from "@/data/course";
import { useProgress } from "@/lib/progress";
import { Eyebrow } from "@/components/bits";

export const Route = createFileRoute("/labs/")({
  component: LabIndex,
  head: () => ({ meta: [{ title: "Labs · Master Boards" }] }),
});

function LabIndex() {
  const labs = useProgress((s) => s.labs);
  return (
    <div className="flex flex-col gap-6">
      <header>
        <Eyebrow>Quantitative engines</Eyebrow>
        <h1 className="mt-2 text-4xl">Six labs</h1>
        <p className="mt-3 max-w-xl text-muted">The same recursions as the repository listings, running in the browser. A lab signs itself the first time the engine returns a number.</p>
      </header>
      <div className="grid gap-3">
        {LABS.map((lab) => (
          <Link key={lab.id} to="/labs/$id" params={{ id: lab.id }} className="border border-border px-4 py-4">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">{labs[lab.id] ? "Run" : lab.index}</p>
            <h2 className="mt-2 text-2xl">{lab.title}</h2>
            <p className="mt-1 text-sm text-muted">{lab.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
