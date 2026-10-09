import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { BookOpen, ClipboardCheck, FlaskConical, GraduationCap, Layers, Library } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Desk", icon: Library },
  { to: "/prep", label: "Prep", icon: GraduationCap },
  { to: "/core", label: "Core", icon: BookOpen },
  { to: "/tracks", label: "Tracks", icon: Layers },
  { to: "/labs", label: "Labs", icon: FlaskConical },
  { to: "/board", label: "Board", icon: ClipboardCheck },
] as const;

function isOn(path: string, to: string) {
  if (to === "/") return path === "/";
  return path === to || path.startsWith(`${to}/`);
}

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    void useProgress.persist.rehydrate();
  }, []);

  return (
    <div className="min-h-dvh bg-bg text-fg md:flex">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border px-5 py-7 md:flex">
        <Link to="/" className="block">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Master Boards</p>
          <p className="mt-2 font-sans text-2xl leading-none text-fg">MFin desk</p>
        </Link>
        <nav className="mt-10 flex flex-col gap-1">
          {NAV.map((item) => {
            const on = isOn(path, item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-11 items-center gap-3 border-l px-3 font-mono text-xs uppercase tracking-widest",
                  on ? "border-primary text-primary" : "border-transparent text-muted hover:text-fg",
                )}
              >
                <Icon className="size-4" strokeWidth={1.5} aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <p className="mt-auto pt-8 font-mono text-xs leading-relaxed text-muted">
          Independent study ledger. Not a degree, and not affiliated with MIT.
        </p>
      </aside>
      <div className="min-w-0 flex-1">
        <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-28 md:px-10 md:pt-10 md:pb-16">{children}</main>
      </div>
      <nav className="dock fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg md:hidden" aria-label="Primary">
        <div className="grid grid-cols-6">
          {NAV.map((item) => {
            const on = isOn(path, item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1",
                  on ? "text-primary" : "text-muted",
                )}
              >
                <Icon className="size-5" strokeWidth={1.5} aria-hidden />
                <span className="font-mono text-xs uppercase tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
