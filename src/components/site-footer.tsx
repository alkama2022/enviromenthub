import { Radar, ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Radar className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="font-display text-base font-bold">
                Terra<span className="text-sidebar-primary">Lens</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-sidebar-foreground/60">
              Environmental intelligence about places — never about people. All
              data shown in this demo is simulated sample data.
            </p>
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3 text-xs text-sidebar-foreground/70 md:max-w-xs">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sidebar-primary" aria-hidden="true" />
            <p>
              TerraLens analyses aggregated environmental patterns only. It does
              not identify, profile or label individuals.
            </p>
          </div>
        </div>
        <p className="mt-8 border-t border-sidebar-border pt-4 text-xs text-sidebar-foreground/40">
          © 2026 TerraLens — AI Environmental Intelligence (demo)
        </p>
      </div>
    </footer>
  );
}
