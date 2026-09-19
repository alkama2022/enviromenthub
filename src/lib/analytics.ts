// Privacy-conscious analytics — no PII, no precise location, no fingerprint.
// Stores counts locally, optionally flushes to console / future endpoint.
type EventName =
  | "search"
  | "discover_query"
  | "healthcare_search"
  | "compare"
  | "language_change"
  | "voice_used"
  | "save"
  | "share"
  | "alert_subscribe"
  | "report_submitted"
  | "business_inquiry";

interface AnalyticsEvent {
  name: EventName;
  props?: Record<string, string | number | boolean>;
  ts: number;
}

const KEY = "hub:analytics";
const MAX = 200;

function read(): AnalyticsEvent[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch { return []; }
}

function write(events: AnalyticsEvent[]) {
  try { localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX))); } catch {}
}

export function track(name: EventName, props?: Record<string, string | number | boolean>) {
  try {
    if (typeof window === "undefined") return;
    const ev: AnalyticsEvent = { name, props, ts: Date.now() };
    const cur = read();
    cur.push(ev);
    write(cur);
    // In production this would POST to a privacy-safe endpoint — here we log only in dev
    if (import.meta.env.DEV) console.debug("[analytics]", name, props);
  } catch {}
}

export function getStats() {
  const events = read();
  const byName: Record<string, number> = {};
  const topQueries: Record<string, number> = {};
  const langUsage: Record<string, number> = {};
  events.forEach(e => {
    byName[e.name] = (byName[e.name] ?? 0) + 1;
    if (e.name === "discover_query" && e.props?.q) {
      const q = String(e.props.q).slice(0, 40);
      topQueries[q] = (topQueries[q] ?? 0) + 1;
    }
    if (e.name === "language_change" && e.props?.lang) {
      langUsage[String(e.props.lang)] = (langUsage[String(e.props.lang)] ?? 0) + 1;
    }
  });
  const top4 = Object.entries(topQueries).sort((a,b)=>b[1]-a[1]).slice(0,4);
  return { total: events.length, byName, topQueries: top4, langUsage };
}
