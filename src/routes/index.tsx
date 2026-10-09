import { createFileRoute, Link } from "@tanstack/react-router";
import { BRIEFS, LABS, MODULES } from "@/data/course";
import { PREP } from "@/data/prep";
import { BOARD_BAR, REQUIRED_LABS, REQUIRED_LECTURES, REQUIRED_PREP, useProgress } from "@/lib/progress";
import { Eyebrow } from "@/components/bits";
import { useState } from "react";

export const Route = createFileRoute("/")({ component: Desk });

function Desk() {
  const lectures = useProgress((s) => s.lectures);
  const labs = useProgress((s) => s.labs);
  const boardBest = useProgress((s) => s.boardBest);
  const briefs = useProgress((s) => s.briefs);
  const reset = useProgress((s) => s.reset);
  const [armed, setArmed] = useState(false);
  const lectureCount = MODULES.filter((m) => lectures[m.id]).length;
  const prepCount = PREP.filter((m) => lectures[m.id]).length;
  const labCount = LABS.filter((l) => labs[l.id]).length;
  const signed =
    prepCount === REQUIRED_PREP &&
    lectureCount === REQUIRED_LECTURES &&
    labCount === REQUIRED_LABS &&
    (boardBest ?? 0) >= BOARD_BAR;
  const openPrep = PREP.find((m) => !lectures[m.id]);
  const openCore = MODULES.find((m) => !lectures[m.id]);
  const next = openPrep ?? openCore ?? PREP[0];
  const nextTo = PREP.some((m) => m.id === next.id) ? ("/prep/$id" as const) : ("/core/$id" as const);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <Eyebrow>Master Boards · MFin</Eyebrow>
        <h1 className="max-w-xl text-4xl leading-tight text-fg md:text-5xl">The equivalency desk.</h1>
        <p className="max-w-xl text-muted">
          Five prerequisite sittings, then nine core sittings, six engines, five tracks, and a board. Each sitting opens with a film, then the lecture, the equations, and a drill. Progress stays on this device.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Meter label="Prep" value={`${prepCount}/${REQUIRED_PREP}`} />
        <Meter label="Core" value={`${lectureCount}/${REQUIRED_LECTURES}`} />
        <Meter label="Engines" value={`${labCount}/${REQUIRED_LABS}`} />
        <Meter label="Board" value={boardBest === null ? "—" : `${Math.round(boardBest * 100)}%`} />
      </section>

      {signed ? (
        <section className="border border-primary bg-surface px-5 py-5">
          <Eyebrow>Ledger signed</Eyebrow>
          <p className="mt-2 text-fg">Every prerequisite, every required sitting, every engine, and a board at or above 70% are on the record. This is a private study mark, not a degree.</p>
        </section>
      ) : null}

      <Link
        to={nextTo}
        params={{ id: next.id }}
        className="flex min-h-14 items-center justify-between border border-primary bg-primary px-4 text-primary-fg"
      >
        <span>
          <span className="block font-mono text-xs uppercase tracking-widest">Continue</span>
          <span className="mt-1 block text-lg">{next.title}</span>
        </span>
        <span className="font-mono text-xs uppercase tracking-widest">{next.index}</span>
      </Link>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl">Prerequisites</h2>
          <Link to="/prep" className="font-mono text-xs uppercase tracking-widest text-primary">All five</Link>
        </div>
        <ol className="border-t border-border">
          {PREP.map((m) => (
            <li key={m.id} className="border-b border-border">
              <Link to="/prep/$id" params={{ id: m.id }} className="flex min-h-14 items-center gap-4 py-3">
                <span className="w-8 font-mono text-xs text-primary">{m.index}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-fg">{m.title}</span>
                  <span className="block font-mono text-xs uppercase tracking-widest text-muted">
                    {m.code} · {lectures[m.id] ? "Signed" : "Film + lecture"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl">Core sequence</h2>
          <Link to="/core" className="font-mono text-xs uppercase tracking-widest text-primary">All nine</Link>
        </div>
        <ol className="border-t border-border">
          {MODULES.slice(0, 4).map((m) => (
            <li key={m.id} className="border-b border-border">
              <Link to="/core/$id" params={{ id: m.id }} className="flex min-h-14 items-center gap-4 py-3">
                <span className="w-8 font-mono text-xs text-primary">{m.index}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-fg">{m.title}</span>
                  <span className="block font-mono text-xs uppercase tracking-widest text-muted">{lectures[m.id] ? "Signed" : "Film + lecture"}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl">Engines</h2>
          <Link to="/labs" className="font-mono text-xs uppercase tracking-widest text-primary">Open the labs</Link>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {LABS.map((lab) => (
            <Link key={lab.id} to="/labs/$id" params={{ id: lab.id }} className="border border-border bg-surface px-4 py-4">
              <p className="font-mono text-xs uppercase tracking-widest text-primary">{lab.index}</p>
              <p className="mt-2 text-lg text-fg">{lab.title}</p>
              <p className="mt-1 text-sm text-muted">{lab.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl">Action briefs</h2>
        {BRIEFS.map((brief) => (
          <article key={brief.id} className="border border-border px-4 py-4">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">{brief.sponsor}</p>
            <h3 className="mt-2 text-xl">{brief.title}</h3>
            <p className="mt-2 text-sm text-muted">{brief.ask}</p>
            {briefs[brief.id] ? (
              <div className="mt-3 flex flex-col gap-2 text-sm">
                {brief.reveal.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            ) : (
              <BriefButton id={brief.id} />
            )}
          </article>
        ))}
      </section>

      <footer className="flex flex-col gap-3 border-t border-border pt-6">
        <p className="text-sm text-muted">
          Independent study desk mapped to a public Master of Finance curriculum. Not a degree, and not affiliated with MIT.
        </p>
        <button
          type="button"
          className="min-h-11 w-fit font-mono text-xs uppercase tracking-widest text-muted"
          onClick={() => {
            if (!armed) {
              setArmed(true);
              return;
            }
            reset();
            setArmed(false);
          }}
        >
          {armed ? "Confirm clear" : "Clear the ledger"}
        </button>
      </footer>
    </div>
  );
}

function Meter({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border px-3 py-3">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 font-mono text-lg tabular-nums text-fg">{value}</p>
    </div>
  );
}

function BriefButton({ id }: { id: string }) {
  const markBrief = useProgress((s) => s.markBrief);
  return (
    <button
      type="button"
      className="mt-3 min-h-11 font-mono text-xs uppercase tracking-widest text-primary"
      onClick={() => markBrief(id)}
    >
      Open the desk answer
    </button>
  );
}
