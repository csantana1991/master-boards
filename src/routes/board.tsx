import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/bits";
import { drawBoard, type Question } from "@/data/course";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/board")({
  component: Board,
  head: () => ({ meta: [{ title: "Board · Master Boards" }] }),
});

const LIMIT = 15 * 60;

function Board() {
  const saveBoard = useProgress((s) => s.saveBoard);
  const best = useProgress((s) => s.boardBest);
  const sittings = useProgress((s) => s.boardSittings);
  const [paper, setPaper] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [left, setLeft] = useState(LIMIT);
  const [phase, setPhase] = useState<"intro" | "sit" | "review">("intro");
  const saved = useRef(false);

  useEffect(() => {
    if (phase !== "sit") return;
    const id = window.setInterval(() => setLeft((s) => s - 1), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  function finish(current: Question[], chosen: Record<string, number>) {
    if (saved.current) return;
    saved.current = true;
    const correct = current.filter((q) => chosen[q.id] === q.answer).length;
    saveBoard(correct / current.length);
    setPhase("review");
  }

  useEffect(() => {
    if (phase === "sit" && left <= 0 && paper) finish(paper, picks);
    // finish is stable enough for the timeout path; picks/paper are the latest via closure if left hits 0 after a render
  }, [left, phase, paper, picks]);

  const correct = paper ? paper.filter((q) => picks[q.id] === q.answer).length : 0;
  const mins = Math.max(0, Math.floor(left / 60));
  const secs = Math.max(0, left % 60);

  if (phase === "intro" || !paper) {
    return (
      <div className="flex flex-col gap-6">
        <header>
          <Eyebrow>Equivalency board</Eyebrow>
          <h1 className="mt-2 text-4xl">Ten questions. Fifteen minutes.</h1>
          <p className="mt-3 max-w-xl text-muted">
            One item from each sitting, plus one extra. No feedback until you submit. A mark of 70% or better signs the ledger, together with the nine sittings and six engines.
          </p>
        </header>
        <p className="font-mono text-sm text-muted">
          Best {best === null ? "—" : `${Math.round(best * 100)}%`} · Sittings {sittings}
        </p>
        <button
          type="button"
          className="min-h-14 w-full border border-primary bg-primary font-mono text-xs uppercase tracking-widest text-primary-fg md:w-fit md:px-6"
          onClick={() => {
            saved.current = false;
            setPaper(drawBoard((Date.now() ^ (Math.floor(Math.random() * 1e9))) >>> 0));
            setPicks({});
            setIndex(0);
            setLeft(LIMIT);
            setPhase("sit");
          }}
        >
          Sit the board
        </button>
      </div>
    );
  }

  if (phase === "review") {
    return (
      <div className="flex flex-col gap-6">
        <header>
          <Eyebrow>Review</Eyebrow>
          <h1 className="mt-2 text-4xl">
            {correct} / {paper.length}
          </h1>
          <p className="mt-3 text-muted">{correct / paper.length >= 0.7 ? "The board is signed on this device." : "Below 70%. The explanations are the sitting."}</p>
        </header>
        {paper.map((q, i) => (
          <article key={q.id} className="border border-border px-4 py-4">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              {i + 1} · {picks[q.id] === q.answer ? "Correct" : "Missed"}
            </p>
            <p className="mt-2">{q.prompt}</p>
            <p className="mt-2 text-sm text-primary">{q.choices[q.answer]}</p>
            <p className="mt-2 text-sm text-muted">{q.explanation}</p>
          </article>
        ))}
        <button
          type="button"
          className="min-h-11 w-fit font-mono text-xs uppercase tracking-widest text-primary"
          onClick={() => setPhase("intro")}
        >
          Back to the desk
        </button>
      </div>
    );
  }

  const q = paper[index];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Eyebrow>
          {index + 1} / {paper.length}
        </Eyebrow>
        <p className={`font-mono text-sm tabular-nums ${left < 60 ? "text-loss" : "text-muted"}`}>
          {mins}:{secs.toString().padStart(2, "0")}
        </p>
      </div>
      <h1 className="text-2xl">{q.prompt}</h1>
      <div className="flex flex-col gap-2">
        {q.choices.map((choice, i) => (
          <button
            key={choice}
            type="button"
            onClick={() => setPicks({ ...picks, [q.id]: i })}
            className={`min-h-14 border px-4 text-left text-sm ${picks[q.id] === i ? "border-primary text-primary" : "border-border text-fg"}`}
          >
            {choice}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="min-h-11 flex-1 border border-border font-mono text-xs uppercase tracking-widest text-fg"
          onClick={() => setIndex((n) => Math.max(0, n - 1))}
          disabled={index === 0}
        >
          Back
        </button>
        {index < paper.length - 1 ? (
          <button
            type="button"
            className="min-h-11 flex-1 border border-primary bg-primary font-mono text-xs uppercase tracking-widest text-primary-fg"
            onClick={() => setIndex((n) => n + 1)}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            className="min-h-11 flex-1 border border-primary bg-primary font-mono text-xs uppercase tracking-widest text-primary-fg"
            onClick={() => finish(paper, picks)}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
