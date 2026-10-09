import { createFileRoute, Link } from "@tanstack/react-router";
import { SittingView } from "@/components/sitting";
import { LABS, MODULES } from "@/data/course";
import { PREP, getPrep } from "@/data/prep";

export const Route = createFileRoute("/prep/$id")({
  component: PrepSitting,
  head: ({ params }) => {
    const module = getPrep(params.id);
    return { meta: [{ title: module ? `${module.title} · Master Boards` : "Master Boards" }] };
  },
});

function PrepSitting() {
  const { id } = Route.useParams();
  const module = getPrep(id);
  if (!module) {
    return (
      <div>
        <h1 className="text-3xl">That prerequisite is not on the desk.</h1>
        <Link to="/prep" className="mt-4 inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-widest text-primary">
          Back to the prerequisites
        </Link>
      </div>
    );
  }
  const index = PREP.findIndex((item) => item.id === module.id);
  const nextPrep = PREP[index + 1];
  const firstCore = MODULES[0];
  const lab = LABS.find((item) => item.id === module.labId);
  return (
    <SittingView
      module={module}
      backTo="/prep"
      backLabel="All prerequisites"
      next={
        nextPrep
          ? { to: "/prep/$id", id: nextPrep.id, title: nextPrep.title }
          : { to: "/core/$id", id: firstCore.id, title: firstCore.title }
      }
      lab={lab}
    />
  );
}
