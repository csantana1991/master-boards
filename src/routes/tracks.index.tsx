import { createFileRoute, Link } from "@tanstack/react-router";
import { TRACKS } from "@/data/course";
import { Eyebrow } from "@/components/bits";

export const Route = createFileRoute("/tracks/")({
  component: TrackIndex,
  head: () => ({ meta: [{ title: "Tracks · Master Boards" }] }),
});

function TrackIndex() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <Eyebrow>Concentrations</Eyebrow>
        <h1 className="mt-2 text-4xl">Five tracks</h1>
        <p className="mt-3 max-w-xl text-muted">The core is shared. A track is where the same equations meet a mandate, a credit agreement, a carbon price, or a take-rate.</p>
      </header>
      <div className="grid gap-3">
        {TRACKS.map((track) => (
          <Link key={track.id} to="/tracks/$id" params={{ id: track.id }} className="border border-border px-4 py-4">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">{track.code}</p>
            <h2 className="mt-2 text-2xl">{track.title}</h2>
            <p className="mt-1 text-sm text-muted">{track.focus}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
