import { createFileRoute, Link } from "@tanstack/react-router";
import { MODULES } from "@/data/course";
import { useProgress } from "@/lib/progress";
import { Eyebrow } from "@/components/bits";

export const Route = createFileRoute("/core/")({
  component: CoreIndex,
  head: () => ({ meta: [{ title: "Core · Master Boards" }] }),
});

function CoreIndex() {
  const lectures = useProgress((s) => s.lectures);
  return (
    <div className="flex flex-col gap-6">
      <header>
        <Eyebrow>Required core</Eyebrow>
        <h1 className="mt-2 text-4xl">Nine sittings</h1>
        <p className="mt-3 max-w-xl text-muted">The five prerequisites sit in front of this sequence. Each core sitting opens with a film, then the lecture and a three-question drill. Sign it when you have worked it.</p>
      </header>
      <ol className="border-t border-border">
        {MODULES.map((m) => (
          <li key={m.id} className="border-b border-border">
            <Link to="/core/$id" params={{ id: m.id }} className="flex min-h-16 items-center gap-4 py-3">
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
