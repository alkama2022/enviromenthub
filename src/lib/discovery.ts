// ---------------------------------------------------------------------------
// Natural-language place discovery: intent taxonomy, rule-based interpreter and
// the explainable ranking engine. All factual place details come from the
// application's own place directory (src/lib/places.ts) — never from the model.
// ---------------------------------------------------------------------------

import {
  PLACE_CATEGORY_LABELS,
  isOpenNow,
  priceLabel,
  type Place,
  type PlaceCategory,
} from "./places";
import { haversineKm, travelMinutes } from "./category-intel";

export type Intent = PlaceCategory | "general";

export const INTENT_LABELS: Record<Intent, string> = {
  ...PLACE_CATEGORY_LABELS,
  general: "General exploration",
};

export interface StructuredQuery {
  intent: Intent;
  /** Specific need extracted from the question, e.g. "malaria treatment". */
  service: string | null;
  /** Place categories worth searching, in priority order. */
  placeTypes: PlaceCategory[];
  occasion: string | null;
  audience: string | null;
  keywords: string[];
  urgency: "emergency" | "normal";
  sort: string[];
  interpretation: string;
  needsClarification: boolean;
  clarifyQuestion: string | null;
  clarifyOptions: string[];
  /** Where the interpretation came from. */
  engine: "ai" | "rules";
}

interface Rule {
  match: RegExp;
  intent: Intent;
  placeTypes: PlaceCategory[];
  service?: string;
  audience?: string;
  occasion?: string;
  keywords?: string[];
  urgency?: "emergency" | "normal";
}

const RULES: Rule[] = [
  {
    match: /\b(ambulance|emergency|urgent|accident|fire outbreak|robbery in progress|life[- ]threatening|bleeding|collapsed)\b/i,
    intent: "emergency",
    placeTypes: ["emergency", "healthcare"],
    service: "urgent emergency response",
    urgency: "emergency",
    keywords: ["emergency", "urgent", "ambulance"],
  },
  {
    match: /\b(police|report a crime|stolen|theft|unsafe|security)\b/i,
    intent: "emergency",
    placeTypes: ["emergency"],
    service: "police / safety reporting",
    keywords: ["police", "safety", "report"],
  },
  {
    match: /\b(pharmacy|chemist|drug store|buy medicine|prescription|medication)\b/i,
    intent: "pharmacy",
    placeTypes: ["pharmacy", "healthcare"],
    service: "dispensing medicines",
    keywords: ["pharmacy", "medicine", "prescription"],
  },
  {
    match: /\b(malaria|typhoid|fever|cholera|infection|disease|illness|sick|treatment|cure|hospital|clinic|doctor|health|medical|antenatal|maternity|surgery|injur)/i,
    intent: "healthcare",
    placeTypes: ["healthcare", "emergency", "pharmacy"],
    service: "medical assessment and treatment",
    keywords: ["hospital", "clinic", "treatment", "doctor"],
  },
  {
    match: /\b(school|university|college|study|learn to|course|training|vocational|admission|education|student)\b/i,
    intent: "education",
    placeTypes: ["education"],
    service: "learning and study",
    keywords: ["school", "education", "study"],
  },
  {
    match: /\b(history|historical|heritage|museum|culture|cultural|traditional|ancient)\b/i,
    intent: "cultural",
    placeTypes: ["cultural", "tourism"],
    service: "history and cultural learning",
    keywords: ["history", "heritage", "museum"],
  },
  {
    match: /\b(restaurant|eat|food|dinner|lunch|meal|cuisine|dining)\b/i,
    intent: "restaurant",
    placeTypes: ["restaurant"],
    service: "eating out",
    keywords: ["restaurant", "food"],
  },
  {
    match: /\b(peace|peaceful|quiet|relax|calm|unwind|rest|fresh air|meditat)/i,
    intent: "outdoor",
    placeTypes: ["outdoor", "recreation", "religious", "cultural"],
    service: "a calm, quiet place",
    keywords: ["peaceful", "quiet", "relax"],
  },
  {
    match: /\b(entertain|fun|cinema|movie|arcade|games|play|amusement)\b/i,
    intent: "entertainment",
    placeTypes: ["entertainment", "recreation"],
    service: "entertainment",
    keywords: ["entertainment", "fun"],
  },
  {
    match: /\b(park|nature|hike|hiking|walk|jog|outdoor|garden|picnic)\b/i,
    intent: "outdoor",
    placeTypes: ["outdoor", "recreation"],
    service: "outdoor activity",
    keywords: ["park", "outdoor", "nature"],
  },
  {
    match: /\b(tourist|tour|sightsee|visit|attraction|explore)\b/i,
    intent: "tourism",
    placeTypes: ["tourism", "cultural", "outdoor", "recreation"],
    service: "sightseeing",
    keywords: ["tourist", "sightseeing"],
  },
  {
    match: /\b(shop|market|buy|mall|store|goods)\b/i,
    intent: "shopping",
    placeTypes: ["shopping"],
    service: "shopping",
    keywords: ["shopping", "market"],
  },
  {
    match: /\b(church|mosque|worship|pray|prayer|religious|service)\b/i,
    intent: "religious",
    placeTypes: ["religious"],
    service: "worship",
    keywords: ["worship", "prayer"],
  },
  {
    match: /\b(permit|licence|license|certificate|government|ministry|secretariat|registration|tax|official document)\b/i,
    intent: "government",
    placeTypes: ["government"],
    service: "government / civil services",
    keywords: ["government", "permit", "registration"],
  },
  {
    match: /\b(bus|airport|flight|train|station|terminal|transport|travel to|commute|journey)\b/i,
    intent: "transportation",
    placeTypes: ["transportation"],
    service: "travel connections",
    keywords: ["transport", "station"],
  },
  {
    match: /\b(hotel|stay|lodge|accommodation|sleep|overnight|guest house)\b/i,
    intent: "accommodation",
    placeTypes: ["accommodation"],
    service: "somewhere to stay",
    keywords: ["hotel", "accommodation"],
  },
  {
    match: /\b(office|co[- ]?working|meeting room|register a business|startup|invest|business service)\b/i,
    intent: "business",
    placeTypes: ["business", "shopping"],
    service: "business facilities",
    keywords: ["business", "office"],
  },
];

const OCCASION_RULES: { match: RegExp; occasion: string; placeTypes: PlaceCategory[] }[] = [
  {
    match: /\b(public holiday|holiday|christmas|easter|eid|sallah|festive|vacation|long weekend)\b/i,
    occasion: "public holiday outing",
    placeTypes: ["outdoor", "recreation", "tourism", "cultural", "entertainment"],
  },
  {
    match: /\b(weekend|saturday|sunday)\b/i,
    occasion: "weekend outing",
    placeTypes: ["outdoor", "recreation", "entertainment", "restaurant", "cultural"],
  },
  {
    match: /\b(birthday|celebration|gathering|party|reunion|anniversary)\b/i,
    occasion: "group celebration",
    placeTypes: ["restaurant", "entertainment", "recreation"],
  },
];

const AUDIENCE_RULES: { match: RegExp; audience: string; keywords: string[] }[] = [
  { match: /\b(child|children|kid|kids|toddler|son|daughter)\b/i, audience: "children", keywords: ["children", "kids", "family"] },
  { match: /\b(family|families|my wife|my husband|parents|relatives)\b/i, audience: "family", keywords: ["family"] },
  { match: /\b(alone|myself|solo|by myself)\b/i, audience: "solo visitor", keywords: ["quiet"] },
  { match: /\b(elderly|old people|grandma|grandpa|wheelchair|disab)/i, audience: "accessibility needs", keywords: ["accessible"] },
];

const VAGUE = /^\s*(where (should|can|do) (i|we) go|what (should|can) (i|we) do|any (suggestions|ideas)|where to go)[^a-z]*$/i;

export const CLARIFY_OPTIONS = [
  "Relaxation",
  "Entertainment",
  "Food",
  "Sightseeing",
  "Outdoor activities",
  "Healthcare",
];

/** Deterministic, offline interpretation of a conversational question. */
export function interpretQueryLocally(raw: string): StructuredQuery {
  const q = raw.trim();
  const base: StructuredQuery = {
    intent: "general",
    service: null,
    placeTypes: [],
    occasion: null,
    audience: null,
    keywords: [],
    urgency: "normal",
    sort: ["relevance", "distance"],
    interpretation: "",
    needsClarification: false,
    clarifyQuestion: null,
    clarifyOptions: [],
    engine: "rules",
  };

  if (q.length < 3) {
    return {
      ...base,
      needsClarification: true,
      clarifyQuestion: "What are you looking for?",
      clarifyOptions: CLARIFY_OPTIONS,
      interpretation: "Waiting for a question.",
    };
  }

  const rule = RULES.find((r) => r.match.test(q));
  const occasion = OCCASION_RULES.find((o) => o.match.test(q));
  const audience = AUDIENCE_RULES.find((a) => a.match.test(q));

  const placeTypes: PlaceCategory[] = [];
  if (rule) placeTypes.push(...rule.placeTypes);
  if (occasion) placeTypes.push(...occasion.placeTypes);

  const keywords = new Set<string>([...(rule?.keywords ?? []), ...(audience?.keywords ?? [])]);
  if (occasion) keywords.add("holiday");

  // Extract a named condition/need for healthcare wording.
  let service = rule?.service ?? null;
  const condition = /\b(malaria|typhoid|cholera|fever|diabetes|asthma|maternity|dental|eye)\b/i.exec(q);
  if (condition && rule?.intent === "healthcare") {
    service = `${condition[1]!.toLowerCase()} — professional medical assessment and treatment`;
    keywords.add(condition[1]!.toLowerCase());
  }

  const vague = !rule && !occasion;
  if (vague || VAGUE.test(q)) {
    return {
      ...base,
      needsClarification: true,
      clarifyQuestion:
        "I can help — what kind of place are you looking for: relaxation, entertainment, food, sightseeing, outdoor activities or healthcare?",
      clarifyOptions: CLARIFY_OPTIONS,
      interpretation: "The question is open-ended, so a quick clarification will give better recommendations.",
      ...(audience ? { audience: audience.audience } : {}),
    };
  }

  const intent: Intent = rule?.intent ?? (occasion ? "recreation" : "general");
  const urgency = rule?.urgency ?? "normal";

  const parts = [
    `Looking for ${INTENT_LABELS[intent].toLowerCase()}`,
    service ? `for ${service}` : null,
    occasion ? `for a ${occasion.occasion}` : null,
    audience ? `suitable for ${audience.audience}` : null,
  ].filter(Boolean);

  return {
    ...base,
    intent,
    service,
    placeTypes: [...new Set(placeTypes.length ? placeTypes : [intent as PlaceCategory])],
    occasion: occasion?.occasion ?? null,
    audience: audience?.audience ?? null,
    keywords: [...keywords],
    urgency,
    sort: urgency === "emergency" ? ["urgency", "distance", "open now"] : ["relevance", "distance", "rating"],
    interpretation: `${parts.join(", ")}.`,
  };
}

// ---------------------------------------------------------------- ranking ---

export interface Recommendation {
  place: Place;
  score: number;
  distanceKm: number | null;
  travelMin: number | null;
  openNow: boolean | null;
  reasons: string[];
  why: string;
  badges: string[];
  breakdown: { label: string; points: number }[];
}

const MEDICAL_INTENTS: Intent[] = ["healthcare", "emergency", "pharmacy"];

export interface RankOptions {
  origin: [number, number] | null;
  originLabel: string;
  now?: Date;
}

export function rankPlaces(
  places: Place[],
  sq: StructuredQuery,
  opts: RankOptions,
): Recommendation[] {
  const now = opts.now ?? new Date();

  const results = places.map((place) => {
    const breakdown: { label: string; points: number }[] = [];
    const reasons: string[] = [];

    // Category relevance
    const idx = sq.placeTypes.indexOf(place.category);
    const categoryPoints = idx === -1 ? 0 : Math.max(40 - idx * 8, 12);
    if (categoryPoints > 0) {
      breakdown.push({ label: `Matches the place type you need (${PLACE_CATEGORY_LABELS[place.category]})`, points: categoryPoints });
      reasons.push(`It is a ${place.subtype.toLowerCase()}, which fits a request about ${INTENT_LABELS[sq.intent].toLowerCase()}.`);
    }

    // Keyword / tag overlap
    const haystack = [...place.tags, ...place.services.map((s) => s.toLowerCase()), place.subtype.toLowerCase()].join(" ");
    const hits = sq.keywords.filter((k) => haystack.includes(k.toLowerCase()));
    const keywordPoints = Math.min(hits.length * 7, 25);
    if (keywordPoints > 0) {
      breakdown.push({ label: `Listed services match: ${hits.join(", ")}`, points: keywordPoints });
      reasons.push(`Its listed services cover ${hits.join(", ")}.`);
    }

    // Distance
    let distanceKm: number | null = null;
    let distancePoints = 0;
    if (opts.origin) {
      distanceKm = haversineKm(opts.origin, place.coords);
      distancePoints = Math.max(0, 18 - distanceKm * 2);
      breakdown.push({ label: `Distance from ${opts.originLabel} (${distanceKm.toFixed(1)} km)`, points: Math.round(distancePoints) });
      if (distanceKm < 5) reasons.push(`It is about ${distanceKm.toFixed(1)} km from ${opts.originLabel}.`);
    }

    // Open now
    const openNow = isOpenNow(place.hours, now);
    let openPoints = 0;
    if (openNow === true) {
      openPoints = sq.urgency === "emergency" ? 14 : 8;
      breakdown.push({ label: "Listed hours suggest it is open now", points: openPoints });
      reasons.push("Its listed opening hours suggest it is open now.");
    }

    // Rating
    let ratingPoints = 0;
    if (place.rating) {
      ratingPoints = (place.rating.value - 3) * 6;
      if (ratingPoints > 0) {
        breakdown.push({ label: `Sample rating ${place.rating.value.toFixed(1)} from ${place.rating.count} reviews`, points: Math.round(ratingPoints) });
        reasons.push(`It carries a ${place.rating.value.toFixed(1)}/5 rating in the demo review dataset (${place.rating.count} reviews).`);
      }
    }

    // Emergency handling
    let urgencyPoints = 0;
    if (sq.urgency === "emergency" && place.emergency) {
      urgencyPoints = 30;
      breakdown.push({ label: "Provides 24-hour emergency response", points: urgencyPoints });
      reasons.push("It is listed as an emergency service with round-the-clock cover.");
    }

    // Audience fit
    let audiencePoints = 0;
    if (sq.audience === "accessibility needs" && place.accessibility.length > 0) {
      audiencePoints = 8;
      breakdown.push({ label: "Accessibility features recorded", points: audiencePoints });
      reasons.push(`Accessibility noted: ${place.accessibility.join(", ")}.`);
    }
    if ((sq.audience === "family" || sq.audience === "children") && place.tags.includes("family")) {
      audiencePoints += 8;
      breakdown.push({ label: "Suitable for families and children", points: 8 });
      reasons.push("It is tagged as suitable for families and children.");
    }

    const score =
      categoryPoints + keywordPoints + distancePoints + openPoints + Math.max(ratingPoints, 0) + urgencyPoints + audiencePoints;

    const badges: string[] = [];
    if (openNow === true) badges.push("Open now");
    if (distanceKm !== null && distanceKm <= 3) badges.push("Nearby");
    if (place.rating && place.rating.value >= 4.4) badges.push("Highly rated");
    if (place.emergency) badges.push("24h emergency");
    if (place.priceLevel === 1) badges.push("Low cost");

    const why = buildWhy(place, sq, reasons);

    return {
      place,
      score,
      distanceKm,
      travelMin: distanceKm === null ? null : travelMinutes(distanceKm),
      openNow,
      reasons,
      why,
      badges,
      breakdown,
    };
  });

  return results
    .filter((r) => r.score > 10)
    .sort((a, b) => b.score - a.score)
    .map((r, i) => (i === 0 ? { ...r, badges: ["Best match", ...r.badges] } : r));
}

function buildWhy(place: Place, sq: StructuredQuery, reasons: string[]): string {
  const body = reasons.length ? reasons.join(" ") : "It is the closest listed match in this area for your request.";
  if (MEDICAL_INTENTS.includes(sq.intent)) {
    return `${body} This facility provides services that may be appropriate for someone seeking professional evaluation${
      sq.service ? ` and care related to ${sq.service.split("—")[0]!.trim()}` : ""
    }. It is not a diagnosis, and no facility can be guaranteed to treat a specific condition.`;
  }
  return `${body} ${priceLabel(place.priceLevel)}.`;
}

export const EMERGENCY_NOTICE =
  "If this is a medical or safety emergency, contact emergency services immediately (112 in Nigeria) and go to the nearest emergency facility — do not wait for these recommendations.";
