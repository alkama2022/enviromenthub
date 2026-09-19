import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  slug: string;
  size?: "sm" | "md" | "icon";
  className?: string;
  label?: string;
}

export function FavoriteButton({ slug, size = "sm", className, label }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(slug);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(slug);
  };

  if (size === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={active ? "Remove from saved" : "Save location"}
        aria-pressed={active}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
          active
            ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
            : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
          className,
        )}
      >
        <Heart className={cn("h-4 w-4", active && "fill-current")} aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? "Remove from saved" : "Save location"}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
        className,
      )}
    >
      <Heart className={cn("h-3.5 w-3.5", active && "fill-current")} aria-hidden="true" />
      {label ?? (active ? "Saved" : "Save")}
    </button>
  );
}
