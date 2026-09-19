import { AlertTriangle, CheckCircle2, Info, Droplets, Wind, ShieldCheck, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlainScore({
  score,
  title,
  plainHigh,
  plainMid,
  plainLow,
  whatItMeans,
  whoCareful,
  whatYouCanDo,
  source,
  trustLabel,
}: {
  score: number;
  title: string;
  plainHigh: string;
  plainMid: string;
  plainLow: string;
  whatItMeans: string;
  whoCareful?: string;
  whatYouCanDo: string;
  source?: string;
  trustLabel?: "verified" | "estimated" | "community" | "unavailable";
}) {
  const band = score >= 72 ? "high" : score >= 55 ? "mid" : "low";
  const Icon = band === "high" ? CheckCircle2 : band === "mid" ? Info : AlertTriangle;
  const color = band === "high" ? "text-score-high" : band === "mid" ? "text-score-mid" : "text-score-low";
  const bg = band === "high" ? "bg-score-high/10 border-score-high/20" : band === "mid" ? "bg-score-mid/10 border-score-mid/20" : "bg-score-low/10 border-score-low/20";
  const plain = band === "high" ? plainHigh : band === "mid" ? plainMid : plainLow;
  const label = band === "high" ? "Good" : band === "mid" ? "Okay" : "Be careful";

  return (
    <div className={cn("rounded-2xl border p-5", bg)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
            <Icon className={cn("h-5 w-5", color)} aria-hidden="true" />
            {title}
          </h3>
          <p className={cn("mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold", band === "high" ? "bg-score-high text-white" : band === "mid" ? "bg-score-mid text-white" : "bg-score-low text-white")}>
            {label} · {score}/100
          </p>
        </div>
        {trustLabel && (
          <span className="rounded-full border border-border bg-card px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {trustLabel}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm font-medium leading-relaxed text-foreground">{plain}</p>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
            What this means
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{whatItMeans}</dd>
        </div>
        {whoCareful && (
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Who should be careful
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{whoCareful}</dd>
          </div>
        )}
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
            What you can do
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-foreground">{whatYouCanDo}</dd>
        </div>
      </dl>

      {source && <p className="mt-4 text-[11px] text-muted-foreground">Source: {source}</p>}
    </div>
  );
}

export function SimpleStat({
  icon: Icon,
  title,
  valuePlain,
  valueTechnical,
  note,
  source,
  trust,
}: {
  icon: typeof Wind;
  title: string;
  valuePlain: string;
  valueTechnical?: string;
  note?: string;
  source?: string;
  trust?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        {title}
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{valuePlain}</p>
      {valueTechnical && <p className="mt-1 text-xs text-muted-foreground">{valueTechnical}</p>}
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
      {(source || trust) && (
        <p className="mt-2 flex flex-wrap gap-1 text-[11px] text-muted-foreground">
          {trust && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase">{trust}</span>}
          {source && <span>Source: {source}</span>}
        </p>
      )}
    </div>
  );
}
