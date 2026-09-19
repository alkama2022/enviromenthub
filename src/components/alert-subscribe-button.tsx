import { Bell, BellRing } from "lucide-react";
import { useAlertSubscriptions } from "@/lib/alert-subscriptions";
import { cn } from "@/lib/utils";

export function AlertSubscribeButton({ slug }: { slug: string }) {
  const { isSubscribed, toggle } = useAlertSubscriptions();
  const active = isSubscribed(slug);
  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {active ? <BellRing className="h-3.5 w-3.5" aria-hidden="true" /> : <Bell className="h-3.5 w-3.5" aria-hidden="true" />}
      {active ? "Alerts on" : "Get alerts"}
    </button>
  );
}
