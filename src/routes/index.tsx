import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ScanSearch,
  BrainCircuit,
  Landmark,
  ShieldAlert,
  Compass,
  Search,
  MapPin,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useMemo, useState, useRef } from "react";
import { LOCATIONS, MOCK_DISCLAIMER } from "@/lib/locations";
import { fuzzySearchLocations, nextIndex } from "@/lib/search";
import { useRecentSearches } from "@/lib/recent-searches";
import { ScorePill } from "@/components/score-bar";
import { FavoriteButton } from "@/components/favorite-button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TerraLens — Environmental Intelligence for Nigeria" },
      {
        name: "description",
        content:
          "Search any Nigerian location for a complete environmental intelligence profile: public safety, healthcare, business potential, infrastructure and more.",
      },
      { property: "og:title", content: "TerraLens — Environmental Intelligence for Nigeria" },
      {
        property: "og:description",
        content:
          "Search any Nigerian location for a complete environmental intelligence profile: public safety, healthcare, business potential, infrastructure and more.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const FEATURES = [
  {
    icon: ScanSearch,
    title: "Environment Scanner",
    text: "Multi-source profiles: weather, air quality, water, population, hospitals, schools, transport, hazards and cost of living — each with its source and date.",
  },
  {
    icon: BrainCircuit,
    title: "AI Environmental Intelligence",
    text: "Overall and category scores from 0–100, with plain-language explanations of why each score exists, citing the underlying data.",
  },
  {
    icon: Landmark,
    title: "Government Dashboard",
    text: "Regional monitoring of hazards, flood-prone areas, healthcare coverage, infrastructure gaps and incident patterns over time.",
  },
  {
    icon: ShieldAlert,
    title: "Public Safety Intelligence",
    text: "Aggregated incident intelligence — hotspots, sudden increases and response gaps. Never individual identification or profiling.",
  },
  {
    icon: Compass,
    title: "Personal Decision Assistant",
    text: "Tell it what you're looking for — business, health, tourism or living — and get a weighted suitability analysis for any location.",
  },
];

function Index() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { recent, push, clear } = useRecentSearches();
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => fuzzySearchLocations(query).slice(0, 6), [query]);
  const showRecent = focused && query.trim().length === 0 && recent.length > 0;
  const showSuggestions = focused && query.trim().length > 0;

  const go = (slug: string, label?: string) => {
    if (label) push(label);
    else if (query.trim()) push(query.trim());
    navigate({ to: "/location/$slug", params: { slug } });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      go(suggestions[activeIndex]!.slug, `${suggestions[activeIndex]!.name}, ${suggestions[activeIndex]!.state}`);
      return;
    }
    const first = suggestions[0];
    if (first) go(first.slug, `${first.name}, ${first.state}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => nextIndex(prev, suggestions.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => nextIndex(prev, suggestions.length, -1));
    } else if (e.key === "Escape") {
      setFocused(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-sidebar text-sidebar-foreground">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, oklch(0.7 0.15 168 / 0.25), transparent 45%), radial-gradient(circle at 85% 30%, oklch(0.68 0.12 195 / 0.2), transparent 40%), radial-gradient(circle at 60% 90%, oklch(0.6 0.15 240 / 0.18), transparent 45%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent/60 px-3 py-1 text-xs font-medium text-sidebar-foreground/80">
              <ShieldCheck className="h-3.5 w-3.5 text-sidebar-primary" aria-hidden="true" />
              Place intelligence — never people profiling
            </p>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Understand any place{" "}
              <span className="text-sidebar-primary">before you decide.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-sidebar-foreground/70 sm:text-lg">
              Search a location to get a complete environmental intelligence
              profile — safety, health, business potential, infrastructure and
              environment — to decide where to live, visit, invest or operate.
            </p>

            {/* Search */}
            <form onSubmit={onSubmit} className="relative mx-auto mt-8 max-w-xl">
              <div className="flex overflow-hidden rounded-xl border border-sidebar-border bg-card shadow-lg">
                <div className="flex items-center pl-4 text-muted-foreground">
                  <Search className="h-5 w-5" aria-hidden="true" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(-1);
                  }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 180)}
                  onKeyDown={onKeyDown}
                  placeholder='Try "Wuse 2, Abuja", "Sabon Gari, Kano", "Ikeja, Lagos"…'
                  className="w-full bg-transparent px-3 py-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  aria-label="Search a location"
                  aria-autocomplete="list"
                  aria-expanded={focused}
                  aria-controls="search-suggestions"
                  role="combobox"
                />
                <button
                  type="submit"
                  className="m-1.5 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Scan
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <p className="mt-3 text-xs text-sidebar-foreground/70">
                Or just describe what you need —{" "}
                <Link to="/discover" className="font-semibold text-sidebar-primary hover:underline">
                  ask the assistant where you should go
                </Link>
                .
              </p>

              {showRecent && (
                <ul id="search-suggestions" className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border bg-card text-left shadow-xl">
                  <li className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-muted-foreground">
                    <span>Recent searches</span>
                    <button type="button" onMouseDown={() => clear()} className="text-primary hover:underline">
                      Clear
                    </button>
                  </li>
                  {recent.map((r) => (
                    <li key={r}>
                      <button
                        type="button"
                        onMouseDown={() => {
                          setQuery(r);
                          const found = fuzzySearchLocations(r, 1)[0];
                          if (found) go(found.slug, r);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent"
                      >
                        <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                        {r}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {showSuggestions && (
                <ul id="search-suggestions" className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border bg-card text-left shadow-xl" role="listbox">
                  {suggestions.length === 0 && (
                    <li className="px-4 py-3 text-sm text-muted-foreground">
                      No matching location in the demo dataset. Try one of the examples below.
                    </li>
                  )}
                  {suggestions.map((loc, idx) => (
                    <li key={loc.slug} role="option" aria-selected={idx === activeIndex}>
                      <button
                        type="button"
                        onMouseDown={() => go(loc.slug, `${loc.name}, ${loc.state}`)}
                        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${idx === activeIndex ? "bg-accent" : "hover:bg-accent"}`}
                      >
                        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                          {loc.name}, {loc.state}
                        </span>
                        <ScorePill score={loc.overallScore} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Example locations */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Explore example locations
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Five Nigerian districts with full intelligence profiles in this demo.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {LOCATIONS.map((loc) => (
            <div
              key={loc.slug}
              className="group relative rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                <div className="flex items-center gap-1.5">
                  <ScorePill score={loc.overallScore} />
                  <FavoriteButton slug={loc.slug} size="icon" />
                </div>
              </div>
              <Link
                to="/location/$slug"
                params={{ slug: loc.slug }}
                className="block"
              >
                <h3 className="mt-3 font-display text-lg font-bold text-foreground group-hover:text-primary">
                  {loc.name}
                </h3>
                <p className="text-xs font-medium text-muted-foreground">{loc.state}</p>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {loc.tagline}
                </p>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-center font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Five systems, one picture of a place
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground">
            TerraLens combines scanning, scoring, government monitoring, incident
            intelligence and personal decision support into a single platform.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.text}
                </p>
              </div>
            ))}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold">
                Ethical by design
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                TerraLens detects patterns and risks in locations — never
                identities. No individual profiling, no criminal prediction, no
                labelling of people by appearance, ethnicity or neighbourhood.
              </p>
              <Link
                to="/about"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Read our methodology
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <p className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-xs text-muted-foreground">
          {MOCK_DISCLAIMER}
        </p>
      </section>
    </div>
  );
}
