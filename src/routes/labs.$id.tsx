import { createFileRoute, Link } from "@tanstack/react-router";
import { AnalyticsLab, BinomialLab, BlLab, CapmLab, DcfLab, GbmLab } from "@/components/engines";
import { Eyebrow } from "@/components/bits";
import { getLab, getModule } from "@/data/course";

export const Route = createFileRoute("/labs/$id")({
  component: LabPage,
  head: ({ params }) => {
    const lab = getLab(params.id);
    return { meta: [{ title: lab ? `${lab.title} · Master Boards` : "Master Boards" }] };
  },
});

function LabPage() {
  const { id } = Route.useParams();
  const lab = getLab(id);
  if (!lab) {
    return (
      <div>
        <h1 className="text-3xl">That engine is not on the desk.</h1>
        <Link to="/labs" className="mt-4 inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-widest text-primary">
          All labs
        </Link>
      </div>
    );
  }
  const module = getModule(lab.moduleId);
  const Engine =
    id === "gbm" ? GbmLab :
    id === "dcf" ? DcfLab :
    id === "capm" ? CapmLab :
    id === "bl" ? BlLab :
    id === "binomial" ? BinomialLab :
    AnalyticsLab;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Eyebrow>Lab {lab.index}</Eyebrow>
        <h1 className="mt-2 text-4xl">{lab.title}</h1>
        <p className="mt-3 max-w-xl text-muted">{lab.blurb}</p>
        {module ? (
          <Link to="/core/$id" params={{ id: module.id }} className="mt-3 inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-widest text-primary">
            Lecture · {module.title}
          </Link>
        ) : null}
      </header>
      <Engine />
    </div>
  );
}
