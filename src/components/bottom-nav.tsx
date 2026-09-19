import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, MapPinned, Heart, Settings, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useFavorites } from "@/lib/favorites";

export function BottomNav() {
  const { t } = useI18n();
  const { count } = useFavorites();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const items = [
    { to: "/", icon: Home, label: t("common.nav.home"), active: pathname === "/" },
    { to: "/discover", icon: Sparkles, label: t("common.nav.discover"), active: pathname.startsWith("/discover") },
    { to: "/compare", icon: MapPinned, label: t("common.nav.explore"), active: pathname.startsWith("/compare") || pathname.startsWith("/location") },
    { to: "/saved", icon: Heart, label: t("common.nav.saved"), active: pathname.startsWith("/saved"), badge: count },
    { to: "/about", icon: Settings, label: t("common.nav.settings"), active: pathname.startsWith("/about") || pathname.startsWith("/government") },
  ] as const;

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className={`flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors ${
              it.active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
            aria-current={it.active ? "page" : undefined}
            aria-label={it.label}
          >
            <span className="relative">
              <it.icon className="h-5 w-5" aria-hidden="true" />
              {"badge" in it && it.badge > 0 && (
                <span className="absolute -right-1.5 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {it.badge > 99 ? "99+" : it.badge}
                </span>
              )}
            </span>
            <span className="leading-none">{it.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
