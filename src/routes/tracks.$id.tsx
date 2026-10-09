import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eyebrow, Field, Sheet } from "@/components/bits";
import { getTrack } from "@/data/course";

export const Route = createFileRoute("/tracks/$id")({
  component: TrackPage,
  head: ({ params }) => {
    const track = getTrack(params.id);
    return { meta: [{ title: track ? `${track.title} · Master Boards` : "Master Boards" }] };
  },
});

function TrackPage() {
  const { id } = Route.useParams();
  const track = getTrack(id);
  const [open, setOpen] = useState(false);
  if (!track) {
    return (
      <div>
        <h1 className="text-3xl">That track is not on the desk.</h1>
        <Link to="/tracks" className="mt-4 inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-widest text-primary">
          All tracks
        </Link>
      </div>
    );
  }
  return (
    <article className="flex flex-col gap-8">
      <header>
        <Eyebrow>{track.code}</Eyebrow>
        <h1 className="mt-2 text-4xl">{track.title}</h1>
        <p className="mt-3 max-w-xl text-muted">{track.focus}</p>
      </header>
      <Sheet>
        <div className="flex flex-col gap-4">
          {track.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </Sheet>
      <section className="grid gap-3">
        {track.electives.map((item) => (
          <article key={item.title} className="border border-border px-4 py-4">
            <h2 className="text-xl">{item.title}</h2>
            <p className="mt-2 text-sm text-muted">{item.body}</p>
          </article>
        ))}
      </section>
      <section className="flex flex-col gap-4 border border-border px-4 py-4">
        <h2 className="text-2xl">{track.caseTitle}</h2>
        {track.case.map((p) => (
          <p key={p.slice(0, 32)} className="text-sm text-muted">{p}</p>
        ))}
        {track.widget === "carbon" ? <CarbonDesk /> : null}
        {track.widget === "bnpl" ? <BnplDesk /> : null}
        {open ? (
          <div className="flex flex-col gap-3 border-t border-border pt-4 text-sm">
            {track.reveal.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
        ) : (
          <button
            type="button"
            className="min-h-11 w-fit font-mono text-xs uppercase tracking-widest text-primary"
            onClick={() => setOpen(true)}
          >
            Show the worked answer
          </button>
        )}
      </section>
    </article>
  );
}

function annuity(cash: number, rate: number, years: number) {
  return (cash * (1 - (1 + rate) ** -years)) / rate;
}

function CarbonDesk() {
  const [price, setPrice] = useState(40);
  const npv = useMemo(() => -200 + annuity(40 - 0.2 * price, 0.08, 10), [price]);
  return (
    <div className="border border-border bg-surface px-3 py-3">
      <Field label="Carbon price, $ / tonne" value={price} min={0} max={120} step={1} display={`$${price}`} onChange={setPrice} />
      <p className="font-mono text-sm tabular-nums text-fg">NPV {npv.toFixed(1)} million</p>
      <p className="mt-1 text-sm text-muted">Base cash flow 40, less 0.2 per dollar of carbon, ten years, discounted at 8%, after a 200 outlay.</p>
    </div>
  );
}

function BnplDesk() {
  const [take, setTake] = useState(0.06);
  const [apr, setApr] = useState(0.09);
  const [loss, setLoss] = useState(0.022);
  const [cac, setCac] = useState(20);
  const contribution = 100 * take - 100 * apr * (45 / 365) - 100 * loss - 0.35;
  const orders = contribution > 0 ? cac / contribution : Infinity;
  return (
    <div className="border border-border bg-surface px-3 py-3">
      <Field label="Take rate" value={take} min={0.02} max={0.1} step={0.005} display={`${(take * 100).toFixed(1)}%`} onChange={setTake} />
      <Field label="Funding APR" value={apr} min={0.02} max={0.2} step={0.005} display={`${(apr * 100).toFixed(1)}%`} onChange={setApr} />
      <Field label="Loss rate" value={loss} min={0} max={0.08} step={0.005} display={`${(loss * 100).toFixed(1)}%`} onChange={setLoss} />
      <Field label="Acquisition cost" value={cac} min={5} max={60} step={1} display={`$${cac}`} onChange={setCac} />
      <p className="font-mono text-sm tabular-nums text-fg">
        Contribution {contribution.toFixed(2)} per 100 of volume · orders to repay {Number.isFinite(orders) ? orders.toFixed(1) : "—"}
      </p>
    </div>
  );
}
