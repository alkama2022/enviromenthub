import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  MapPin,
  Search,
  ShieldCheck,
  ArrowRight,
  Hospital,
  Bus,
  Store,
  Home as HomeIcon,
  CloudSun,
  Siren,
  MessageCircle,
  ScanSearch,
  Mic,
  Waves,
  Wind,
  Volume2,
} from "lucide-react";
import { useMemo, useState, useRef } from "react";
import { LOCATIONS, MOCK_DISCLAIMER } from "@/lib/locations";
import { fuzzySearchLocations, nextIndex } from "@/lib/search";
import { useRecentSearches } from "@/lib/recent-searches";
import { ScorePill } from "@/components/score-bar";
import { FavoriteButton } from "@/components/favorite-button";
import { useI18n } from "@/lib/i18n";
import { VoiceInput, ReadAloud } from "@/components/voice-input";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Environment Hub — Understand any place before you decide" },
      {
        name: "description",
        content: "Check any Nigerian location: safety, health, business and daily environment — in plain language, in your language, by voice if you want.",
      },
      { property: "og:title", content: "Environment Hub — Understand any place" },
      { property: "og:description", content: "Simple environmental intelligence for Nigerian locations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const ACTION_CARDS = [
  { key: "checkPlace", icon: MapPin, color: "bg-emerald-500", to: "#search", query: "" },
  { key: "findHealthcare", icon: Hospital, color: "bg-rose-500", to: "/discover", query: "Where can I find a hospital?" },
  { key: "findRoute", icon: Bus, color: "bg-blue-500", to: "/discover", query: "How do I get there by bus?" },
  { key: "findBusiness", icon: Store, color: "bg-amber-500", to: "/discover", query: "Which area is good for opening a small shop?" },
  { key: "findHome", icon: HomeIcon, color: "bg-violet-500", to: "/discover", query: "Is this place good for my family to live?" },
  { key: "checkEnvironment", icon: CloudSun, color: "bg-sky-500", to: "/discover", query: "Check weather and air quality for this area" },
  { key: "emergency", icon: Siren, color: "bg-red-600", to: "/discover", query: "Find nearby emergency help" },
  { key: "ask", icon: MessageCircle, color: "bg-primary", to: "/discover", query: "" },
] as const;

function Index() {
  const navigate = useNavigate();
  const { t, easyMode } = useI18n();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { recent, push, clear } = useRecentSearches();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchSectionRef = useRef<HTMLDivElement>(null);

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
    else if (query.trim()) navigate({ to: "/discover", search: { q: query.trim() } as any });
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

  const handleVoice = (text: string) => {
    setQuery(text);
    // auto-search after voice
    const found = fuzzySearchLocations(text, 1)[0];
    if (found) go(found.slug, text);
    else navigate({ to: "/discover", search: { q: text } as any });
  };

  const scrollToSearch = () => searchSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div id="main-content">
      {/* Hero - Simple, large, voice-first */}
      <section className="relative overflow-hidden bg-sidebar text-sidebar-foreground">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, oklch(0.7 0.15 168 / 0.3), transparent 45%), radial-gradient(circle at 85% 30%, oklch(0.68 0.12 195 / 0.2), transparent 40%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent/60 px-3 py-1 text-xs font-medium text-sidebar-foreground/80">
              <ShieldCheck className="h-3.5 w-3.5 text-sidebar-primary" aria-hidden="true" />
              {t("home.eyebrow")}
            </p>
            <h1 className={`font-display font-extrabold leading-tight tracking-tight ${easyMode ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl"}`}>{t("home.title")}</h1>
            <p className={`mx-auto mt-3 max-w-2xl text-sidebar-foreground/70 ${easyMode ? "text-base" : "text-base sm:text-lg"}`}>{t("home.subtitle")}</p>

            {/* Search + Voice - Minimal typing, large targets */}
            <div ref={searchSectionRef} id="search" className="mx-auto mt-8 max-w-xl">
              <form onSubmit={onSubmit} className="relative">
                <div className="flex overflow-hidden rounded-2xl border border-sidebar-border bg-card shadow-lg">
                  <div className="flex items-center pl-4 text-muted-foreground">
                    <Search className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setTimeout(() => setFocused(false), 180)}
                    onKeyDown={onKeyDown}
                    placeholder={t("home.searchPlaceholder")}
                    className="w-full bg-transparent px-3 py-4 text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
                    aria-label={t("home.searchLabel")}
                    aria-autocomplete="list"
                    aria-expanded={focused}
                    aria-controls="search-suggestions"
                    role="combobox"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="m-1.5 inline-flex min-h-11 min-w-[72px] items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={t("home.cta.scan")}
                  >
                    {t("home.cta.scan")}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                {showRecent && (
                  <ul id="search-suggestions" className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border bg-card text-left shadow-xl">
                    <li className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-muted-foreground">
                      <span>{t("home.recent")}</span>
                      <button type="button" onMouseDown={() => clear()} className="text-primary hover:underline">{t("common.action.clear")}</button>
                    </li>
                    {recent.map((r) => (
                      <li key={r}>
                        <button type="button" onMouseDown={() => { setQuery(r); const found = fuzzySearchLocations(r, 1)[0]; if (found) go(found.slug, r); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent">
                          <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                          {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {showSuggestions && (
                  <ul id="search-suggestions" className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border bg-card text-left shadow-xl" role="listbox">
                    {suggestions.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">{t("common.empty.noResults")}</li>}
                    {suggestions.map((loc, idx) => (
                      <li key={loc.slug} role="option" aria-selected={idx === activeIndex}>
                        <button type="button" onMouseDown={() => go(loc.slug, `${loc.name}, ${loc.state}`)} className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left ${idx === activeIndex ? "bg-accent" : "hover:bg-accent"}`}>
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

              {/* Prominent voice button - core accessibility */}
              <div className="mt-4 flex flex-col items-center gap-2">
                <VoiceInput onTranscript={handleVoice} size="large" />
                <p className="text-xs text-sidebar-foreground/60">{t("home.voiceHint")}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <ReadAloud text={`${t("home.title")} ${t("home.subtitle")}`} />
            </div>
          </div>
        </div>
      </section>

      {/* 8 Large Action Cards - spec section 3 */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6" aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="sr-only">{t("home.title")}</h2>
        <div className={`grid gap-3 sm:gap-4 ${easyMode ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
          {ACTION_CARDS.map((card) => (
            <Link
              key={card.key}
              to={card.to as any}
              search={card.query ? { q: card.query } as any : undefined}
              onClick={(e) => {
                if (card.to === "#search") {
                  e.preventDefault();
                  scrollToSearch();
                  inputRef.current?.focus();
                }
              }}
              className="group relative flex min-h-[112px] flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-[132px] sm:p-5"
              aria-label={`${t(`home.actions.${card.key}.title`)} — ${t(`home.actions.${card.key}.desc`)}`}
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${card.color}`}>
                <card.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="mt-3">
                <h3 className={`font-display font-bold leading-tight text-foreground ${easyMode ? "text-lg" : "text-[15px] sm:text-base"}`}>{t(`home.actions.${card.key}.title`)}</h3>
                <p className={`mt-1 leading-snug text-muted-foreground ${easyMode ? "text-sm" : "text-xs sm:text-sm"}`}>{t(`home.actions.${card.key}.desc`)}</p>
              </div>
              <ArrowRight className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
            </Link>
          ))}
        </div>

        {!easyMode && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1">
              <Volume2 className="h-3.5 w-3.5" aria-hidden="true" /> {t("common.action.readAloud")} available
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1">
              <Mic className="h-3.5 w-3.5" aria-hidden="true" /> Voice in your language
            </span>
          </div>
        )}
      </section>

      {/* Example locations - cards not table */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6" aria-labelledby="examples-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="examples-heading" className={`font-display font-bold tracking-tight ${easyMode ? "text-xl" : "text-xl sm:text-2xl"}`}>{t("home.examplesTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("home.examplesSubtitle")}</p>
          </div>
          <ReadAloud text={`${t("home.examplesTitle")} ${t("home.examplesSubtitle")}`} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {LOCATIONS.map((loc) => (
            <div key={loc.slug} className="group relative flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="flex items-center gap-1.5">
                  <ScorePill score={loc.overallScore} />
                  <FavoriteButton slug={loc.slug} size="icon" />
                </div>
              </div>
              <Link to="/location/$slug" params={{ slug: loc.slug }} className="mt-3 block focus:outline-none">
                <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary">{loc.name}</h3>
                <p className="text-xs font-medium text-muted-foreground">{loc.state}</p>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{loc.tagline}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  {t("common.action.viewDetails")} <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Plain-language explainer */}
      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <ScanSearch className="h-5 w-5 text-primary" aria-hidden="true" />
              {t("home.featuresTitle")}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-secondary/50 p-4">
                <Waves className="h-5 w-5 text-primary" aria-hidden="true" />
                <p className="mt-2 text-sm font-semibold">Simple words</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">No technical terms. We explain what the information means for you.</p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-4">
                <Wind className="h-5 w-5 text-primary" aria-hidden="true" />
                <p className="mt-2 text-sm font-semibold">Your language</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Hausa, Yorùbá, Igbo, Pidgin — plus voice and read-aloud.</p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-4">
                <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                <p className="mt-2 text-sm font-semibold">Verified sources</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">We show source and date. We never guess. We mark estimated data.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <p className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-xs leading-relaxed text-muted-foreground">{MOCK_DISCLAIMER}</p>
      </section>
    </div>
  );
}
