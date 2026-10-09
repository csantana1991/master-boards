import { createFileRoute, Link } from "@tanstack/react-router";
import { SittingView } from "@/components/sitting";
import { LABS, MODULES, getModule } from "@/data/course";

export const Route = createFileRoute("/core/$id")({
  component: Sitting,
  head: ({ params }) => {
    const module = getModule(params.id);
    return { meta: [{ title: module ? `${module.title} · Master Boards` : "Master Boards" }] };
  },
});

function Sitting() {
  const { id } = Route.useParams();
  const module = getModule(id);
  if (!module) {
    return (
      <div>
        <h1 className="text-3xl">That sitting is not on the desk.</h1>
        <Link to="/core" className="mt-4 inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-widest text-primary">
          Back to the core
        </Link>
      </div>
    );
  }
  const index = MODULES.findIndex((item) => item.id === module.id);
  const next = MODULES[index + 1];
  const lab = LABS.find((item) => item.id === module.labId);
  return (
    <SittingView
      module={module}
      backTo="/core"
      backLabel="All core sittings"
      next={next ? { to: "/core/$id", id: next.id, title: next.title } : null}
      lab={lab}
    />
  );
}
