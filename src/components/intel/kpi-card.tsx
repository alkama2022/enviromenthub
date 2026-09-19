import { AlertCircle, ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { Confidence, Kpi, SourceRef } from "@/lib/category-intel";
import { UNAVAILABLE } from "@/lib/category-intel";
import { SourceBadge } from "@/components/source-badge";
import { cn } from "@/lib/utils";

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  measured: "Measured",
  estimated: "Estimated",
  projection: "Projection",
};

const CONFIDENCE_STYLE: Record<Confidence, string> = {
  measured: "bg-score-high/15 text-score-high",
  estimated: "bg-score-mid/15 text-score-mid",
  projection: "bg-chart-2/15 text-chart-2",
};

export function ConfidenceTag({ confidence }: { confidence: Confidence }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        CONFIDENCE_STYLE[confidence],
      )}
      title={
        confidence === "measured"
          ? "Taken directly from a dataset entry."
          : confidence === "estimated"
            ? "Derived from related indicators — not an official measurement."
            : "Forward-looking projection — not a guaranteed outcome."
      }
    >
      {CONFIDENCE_LABEL[confidence]}
    </span>
  );
}

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const unavailable = kpi.value === UNAVAILABLE;
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
        {!unavailable && <ConfidenceTag confidence={kpi.confidence} />}
      </div>
      {unavailable ? (
        <p className="mt-2 flex items-start gap-1.5 text-xs italic text-muted-foreground">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {UNAVAILABLE}
        </p>
      ) : (
        <p className="mt-1.5 font-display text-xl font-extrabold tabular-nums text-foreground">
          {kpi.value}
        </p>
      )}
      {kpi.note && !unavailable && (
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{kpi.note}</p>
      )}
      <SourceBadge source={kpi.source} className="mt-2.5" />
    </div>
  );
}

export function Section({
  id,
  title,
  description,
  children,
  className,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby={id} className={cn("rounded-xl border border-border bg-card p-6 shadow-sm", className)}>
      <h2 id={id} className="font-display text-lg font-bold">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Expandable({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left"
      >
        <span className="font-display text-lg font-bold">{title}</span>
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open && <div className="border-t border-border px-6 py-5">{children}</div>}
    </div>
  );
}

export function SourceList({ sources }: { sources: SourceRef[] }) {
  return (
    <ul className="space-y-3">
      {sources.map((s) => (
        <li key={s.name} className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-sm font-semibold text-foreground">{s.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Data period: {s.period} · Last updated: {s.updated}
          </p>
          {s.note && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.note}</p>}
          {s.url && (
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-1 inline-block text-xs font-medium text-primary underline"
            >
              Open source
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
