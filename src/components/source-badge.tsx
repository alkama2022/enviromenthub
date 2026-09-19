import { Database, CheckCircle2, AlertTriangle, CircleDashed } from "lucide-react";
import type { SourceInfo } from "@/lib/locations";
import { cn } from "@/lib/utils";

export type DataQuality = "verified" | "estimated" | "community" | "unavailable";

const QUALITY_META: Record<DataQuality, { icon: typeof CheckCircle2; label: string; dot: string }> = {
  verified: { icon: CheckCircle2, label: "Verified · strong source", dot: "🟢" },
  estimated: { icon: AlertTriangle, label: "Limited / older data", dot: "🟡" },
  community: { icon: AlertTriangle, label: "Community / sample", dot: "🟡" },
  unavailable: { icon: CircleDashed, label: "Data unavailable", dot: "⚪" },
};

export function SourceBadge({
  source,
  quality,
  className,
}: {
  source: SourceInfo;
  quality?: DataQuality;
  className?: string;
}) {
  const meta = quality ? QUALITY_META[quality] : null;
  const Icon = meta?.icon ?? Database;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground",
        className,
      )}
      title={meta ? `${meta.dot} ${meta.label} — ${source.name} · ${source.date}` : `${source.name} · ${source.date}`}
    >
      {meta ? <span aria-hidden="true">{meta.dot}</span> : null}
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span className="truncate">
        {source.name} · {source.date}
        {meta ? ` · ${meta.label}` : ""}
      </span>
    </span>
  );
}

export function QualityDot({ quality, showLabel = true }: { quality: DataQuality; showLabel?: boolean }) {
  const m = QUALITY_META[quality];
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium">
      <span aria-hidden="true">{m.dot}</span>
      {showLabel ? <span className="text-muted-foreground">{m.label}</span> : null}
    </span>
  );
}
