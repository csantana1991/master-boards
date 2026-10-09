import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LectureFilm } from "@/components/lecture-film";
import { Equation, Eyebrow, Sheet } from "@/components/bits";
import type { LabInfo, Module } from "@/data/course";
import { questionsFor } from "@/data/course";
import { useProgress } from "@/lib/progress";

type Dest = "/prep/$id" | "/core/$id";

export function SittingView({
  module,
  backTo,
  backLabel,
  next,
  lab,
}: {
  module: Module;
  backTo: "/prep" | "/core";
  backLabel: string;
  next: { to: Dest; id: string; title: string } | null;
  lab?: LabInfo;
}) {
  const setCursor = useProgress((s) => s.setCursor);
  const markLecture = useProgress((s) => s.markLecture);
  const signed = useProgress((s) => Boolean(s.lectures[module.id]));
  useEffect(() => {
    setCursor(module.id);
  }, [module.id, setCursor]);

  return (
    <article className="flex flex-col gap-8">
      <header>
        <Eyebrow>
          {module.index} · {module.code}
        </Eyebrow>
        <h1 className="mt-2 text-4xl">{module.title}</h1>
        <p className="mt-3 max-w-xl text-muted">{module.summary}</p>
      </header>

      <LectureFilm id={module.id} title={module.title} />

      {module.objectives ? (
        <ul className="flex flex-col gap-2">
          {module.objectives.map((item) => (
            <li key={item} className="border-l border-primary pl-3 text-sm text-fg">
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {module.extract ? (
        <blockquote className="border border-border bg-surface px-4 py-4 text-sm text-fg">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Repository extract</p>
          <p className="mt-2">{module.extract}</p>
        </blockquote>
      ) : null}

      <Sheet>
        <p className="font-mono text-xs uppercase tracking-widest text-sheet-muted">Desk lecture</p>
        <div className="mt-4 flex flex-col gap-4">
          {module.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </Sheet>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl">Equations</h2>
        {module.equations.map((eq) => (
          <Equation key={eq.label} label={eq.label}>
            {eq.text}
          </Equation>
        ))}
      </section>

      <section className="border border-border px-4 py-4">
        <h2 className="text-2xl">{module.exampleTitle}</h2>
        <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
          {module.example.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>

      <Drill moduleId={module.id} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="min-h-11 border border-primary bg-primary px-4 font-mono text-xs uppercase tracking-widest text-primary-fg"
          onClick={() => markLecture(module.id)}
        >
          {signed ? "Sitting signed" : "Sign this sitting"}
        </button>
        {lab ? (
          <Link
            to="/labs/$id"
            params={{ id: lab.id }}
            className="inline-flex min-h-11 items-center border border-border px-4 font-mono text-xs uppercase tracking-widest text-fg"
          >
            Open the engine
          </Link>
        ) : null}
        {next ? (
          <Link
            to={next.to}
            params={{ id: next.id }}
            className="inline-flex min-h-11 items-center px-4 font-mono text-xs uppercase tracking-widest text-primary"
          >
            Next · {next.title}
          </Link>
        ) : null}
      </div>
      <Link to={backTo} className="w-fit font-mono text-xs uppercase tracking-widest text-muted">
        {backLabel}
      </Link>
    </article>
  );
}

function Drill({ moduleId }: { moduleId: string }) {
  const questions = questionsFor(moduleId);
  const saveDrill = useProgress((s) => s.saveDrill);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [locked, setLocked] = useState(false);
  const correct = questions.filter((q) => picks[q.id] === q.answer).length;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl">Drill</h2>
      {questions.map((q, qi) => (
        <fieldset key={q.id} className="border border-border px-4 py-4" disabled={locked}>
          <legend className="px-1 font-mono text-xs uppercase tracking-widest text-muted">Question {qi + 1}</legend>
          <p className="text-fg">{q.prompt}</p>
          <div className="mt-3 flex flex-col gap-2">
            {q.choices.map((choice, i) => {
              const selected = picks[q.id] === i;
              const show = locked && i === q.answer;
              const bad = locked && selected && i !== q.answer;
              return (
                <label
                  key={choice}
                  className={`flex min-h-11 items-center gap-3 border px-3 py-2 text-sm ${
                    show ? "border-primary text-primary" : bad ? "border-loss text-loss" : "border-border text-fg"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    className="size-4"
                    checked={selected}
                    onChange={() => setPicks({ ...picks, [q.id]: i })}
                  />
                  {choice}
                </label>
              );
            })}
          </div>
          {locked ? <p className="mt-3 text-sm text-muted">{q.explanation}</p> : null}
        </fieldset>
      ))}
      {locked ? (
        <p className="font-mono text-sm text-fg">
          {correct} / {questions.length}
        </p>
      ) : (
        <button
          type="button"
          className="min-h-11 w-fit border border-border px-4 font-mono text-xs uppercase tracking-widest text-fg"
          onClick={() => {
            setLocked(true);
            saveDrill(moduleId, correct, questions.length);
          }}
        >
          Mark the drill
        </button>
      )}
    </section>
  );
}
