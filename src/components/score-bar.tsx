import { scoreTone } from "@/lib/locations";
import { cn } from "@/lib/utils";

const TONE_BAR: Record<string, string> = {
  high: "bg-score-high",
  mid: "bg-score-mid",
  low: "bg-score-low",
};

const TONE_TEXT: Record<string, string> = {
  high: "text-score-high",
  mid: "text-score-mid",
  low: "text-score-low",
};

export function ScoreBar({
  score,
  label,
  showValue = true,
  size = "md",
  className,
}: {
  score: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const tone = scoreTone(score);
  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          {label && (
            <span className="text-sm font-medium text-foreground">{label}</span>
          )}
          {showValue && (
            <span
              className={cn(
                "text-sm font-bold tabular-nums",
                TONE_TEXT[tone],
              )}
            >
              {score}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-muted",
          size === "sm" ? "h-1.5" : "h-2.5",
        )}
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn("h-full rounded-full transition-all", TONE_BAR[tone])}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}

export function ScorePill({ score }: { score: number }) {
  const tone = scoreTone(score);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums",
        tone === "high" && "bg-score-high/15 text-score-high",
        tone === "mid" && "bg-score-mid/15 text-score-mid",
        tone === "low" && "bg-score-low/15 text-score-low",
      )}
    >
      {score}/100
    </span>
  );
}

export function ChangeBadge({ changePct }: { changePct: number }) {
  const up = changePct > 0;
  const flat = changePct === 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
        flat
          ? "bg-muted text-muted-foreground"
          : up
            ? "bg-score-low/15 text-score-low"
            : "bg-score-high/15 text-score-high",
      )}
    >
      {flat ? "±0%" : `${up ? "+" : ""}${changePct}%`}
    </span>
  );
}
