import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, MapPin, Trash2, GitCompareArrows } from "lucide-react";
import { LOCATIONS, MOCK_DISCLAIMER } from "@/lib/locations";
import { useFavorites } from "@/lib/favorites";
import { ScorePill } from "@/components/score-bar";
import { FavoriteButton } from "@/components/favorite-button";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Locations | TerraLens" },
      {
        name: "description",
        content: "Your saved locations in TerraLens — quick access to the environmental intelligence profiles you care about.",
      },
      { property: "og:title", content: "Saved Locations | TerraLens" },
      { property: "og:description", content: "Your saved locations in TerraLens." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { favorites, clearFavorites } = useFavorites();
  const savedLocations = LOCATIONS.filter((l) => favorites.includes(l.slug));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bookmark className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Saved locations</h1>
            <p className="text-sm text-muted-foreground">
              {savedLocations.length === 0
                ? "No saved locations yet — save any location to see it here."
                : `${savedLocations.length} ${savedLocations.length === 1 ? "location" : "locations"} saved. Stored locally on this device.`}
            </p>
          </div>
        </div>
        {savedLocations.length > 0 && (
          <div className="flex items-center gap-2">
            <Link
              to="/compare"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent"
            >
              <GitCompareArrows className="h-4 w-4" aria-hidden="true" />
              Compare
            </Link>
            <button
              type="button"
              onClick={clearFavorites}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {savedLocations.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center">
          <Bookmark className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-foreground">No saved locations</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Tap the heart icon on any location card or profile to save it. Saved items stay on this device and are used to power quick comparison and alerts.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Explore locations
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedLocations.map((loc) => (
            <div
              key={loc.slug}
              className="group relative rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                <div className="flex items-center gap-1.5">
                  <ScorePill score={loc.overallScore} />
                  <FavoriteButton slug={loc.slug} size="icon" />
                </div>
              </div>
              <Link to="/location/$slug" params={{ slug: loc.slug }} className="block">
                <h2 className="mt-3 font-display text-lg font-bold group-hover:text-primary">{loc.name}</h2>
                <p className="text-xs font-medium text-muted-foreground">{loc.state}</p>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{loc.tagline}</p>
              </Link>
              <div className="mt-4 flex items-center gap-2">
                <Link
                  to="/location/$slug"
                  params={{ slug: loc.slug }}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  View profile
                </Link>
                <Link
                  to="/insight/$slug/$category"
                  params={{ slug: loc.slug, category: "publicSafety" }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Intelligence
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-xs text-muted-foreground">
        {MOCK_DISCLAIMER}
      </p>
    </div>
  );
}
