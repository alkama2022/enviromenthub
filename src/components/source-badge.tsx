import { Database } from "lucide-react";
import type { SourceInfo } from "@/lib/locations";
import { cn } from "@/lib/utils";

export function SourceBadge({
  source,
  className,
}: {
  source: SourceInfo;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground",
        className,
      )}
    >
      <Database className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span className="truncate">
        {source.name} · {source.date}
      </span>
    </span>
  );
}
