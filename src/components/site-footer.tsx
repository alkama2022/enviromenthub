import { Radar, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Radar className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="font-display text-base font-bold">
                {t("common.brand.name").split(" ")[0]}<span className="text-sidebar-primary">{t("common.brand.name").split(" ")[1] ?? "Lens"}</span>
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-sidebar-foreground/60">
              {t("common.brand.tagline")} {t("common.trust.disclaimer")}
            </p>
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3 text-xs leading-relaxed text-sidebar-foreground/70 md:max-w-xs">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sidebar-primary" aria-hidden="true" />
            <p>{t("common.trust.mayBeOutdated")} {t("common.brand.name")} shows place patterns only — never people.</p>
          </div>
        </div>
        <p className="mt-8 border-t border-sidebar-border pt-4 text-xs text-sidebar-foreground/40">
          © 2026 {t("common.brand.name")} — {t("location.weightedAcross")} (demo) · <span className="text-sidebar-foreground/60">{t("common.trust.source")}: Sample datasets</span>
        </p>
      </div>
    </footer>
  );
}
