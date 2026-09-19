import {
  CATEGORY_LABELS,
  type CategoryKey,
  type LocationProfile,
} from "./locations";

export type PersonaKey = "business" | "health" | "tourism" | "living";

export interface Persona {
  key: PersonaKey;
  label: string;
  headline: string;
  consideration: string;
  weights: Partial<Record<CategoryKey, number>>;
  recommendationTemplate: {
    high: string;
    mid: string;
    low: string;
  };
}

export const PERSONAS: Persona[] = [
  {
    key: "business",
    label: "Business",
    headline: "Starting or expanding a business",
    consideration:
      "Customers, competition, infrastructure, accessibility, economic activity, operating costs and security indicators.",
    weights: {
      business: 0.25,
      economic: 0.2,
      infrastructure: 0.15,
      transportation: 0.15,
      publicSafety: 0.1,
      environment: 0.05,
      healthcare: 0.05,
      education: 0.05,
    },
    recommendationTemplate: {
      high: "Strong location for a new venture. Commercial demand and economic activity support entry — secure a site with good foot traffic and verify evening security arrangements before committing to a lease.",
      mid: "Viable with careful positioning. Demand exists, but address the weaker factors below in your site selection — for example, choose a street with better infrastructure or lower direct competition within the surrounding area.",
      low: "High-risk entry at this time. Core business conditions are weak; consider a nearby district with stronger fundamentals or revisit after the flagged challenges improve.",
    },
  },
  {
    key: "health",
    label: "Health",
    headline: "Healthcare access & wellbeing",
    consideration:
      "Healthcare accessibility, air quality, water quality, environmental hazards, climate and hospital availability.",
    weights: {
      healthcare: 0.3,
      environment: 0.2,
      weather: 0.15,
      publicSafety: 0.15,
      infrastructure: 0.1,
      economic: 0.05,
      transportation: 0.05,
    },
    recommendationTemplate: {
      high: "Well suited for health-conscious living or healthcare services. Facility access and environmental conditions are favourable relative to the dataset.",
      mid: "Acceptable with precautions. Review the environmental challenges below — particularly air quality and water availability — and confirm proximity to the facilities that matter for your needs.",
      low: "Not currently recommended for health-sensitive needs. Environmental or healthcare-access gaps are significant; consider alternative locations in the dataset.",
    },
  },
  {
    key: "tourism",
    label: "Tourism",
    headline: "Visiting & leisure travel",
    consideration:
      "Attractions, weather, cultural activities, transportation, accommodation, safety and seasonal conditions.",
    weights: {
      tourism: 0.3,
      weather: 0.2,
      transportation: 0.15,
      publicSafety: 0.15,
      environment: 0.1,
      economic: 0.1,
    },
    recommendationTemplate: {
      high: "A rewarding destination in the right season. Attractions, safety indicators and access all score well — check the seasonal weather notes before booking.",
      mid: "Worth visiting with planning. Time your trip around the weather window and stay near the better-connected corridors flagged in the data.",
      low: "Limited visitor appeal right now. Consider the higher-scoring locations in the dataset for leisure travel, or visit for specific events only.",
    },
  },
  {
    key: "living",
    label: "Living",
    headline: "Relocating with family",
    consideration:
      "Housing, schools, hospitals, transportation, cost of living, environment and public safety indicators.",
    weights: {
      publicSafety: 0.2,
      healthcare: 0.15,
      education: 0.15,
      environment: 0.1,
      transportation: 0.1,
      economic: 0.1,
      infrastructure: 0.1,
      weather: 0.1,
    },
    recommendationTemplate: {
      high: "A strong candidate for family relocation. Safety trends, schools and healthcare all score well — verify housing costs against your budget using the rent figures shown.",
      mid: "Workable with trade-offs. Weigh the challenges below against your family's priorities; neighbourhoods within the area vary, so scout specific streets.",
      low: "Significant relocation risks at this time. Safety, services or environmental conditions fall short of the dataset's stronger options.",
    },
  },
];

export interface SuitabilityFactor {
  label: string;
  score: number;
  weight: number;
}

export interface SuitabilityResult {
  score: number;
  band: "high" | "mid" | "low";
  bandLabel: string;
  factors: SuitabilityFactor[];
  advantages: string[];
  challenges: string[];
  recommendation: string;
}

export function analyzeSuitability(
  location: LocationProfile,
  personaKey: PersonaKey,
): SuitabilityResult {
  const persona = (PERSONAS.find((p) => p.key === personaKey) ??
    PERSONAS[0]) as Persona;

  const factors: SuitabilityFactor[] = Object.entries(persona.weights)
    .map(([key, weight]) => {
      const cat = location.categories.find((c) => c.key === key);
      return {
        label: CATEGORY_LABELS[key as CategoryKey],
        score: cat?.score ?? 0,
        weight: weight ?? 0,
      };
    })
    .sort((a, b) => b.weight * b.score - a.weight * a.score);

  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  const score = Math.round(
    factors.reduce((sum, f) => sum + f.score * f.weight, 0) / totalWeight,
  );

  const band: SuitabilityResult["band"] =
    score >= 72 ? "high" : score >= 55 ? "mid" : "low";
  const bandLabel =
    band === "high"
      ? "Highly suitable"
      : band === "mid"
        ? "Suitable with caveats"
        : "Not recommended currently";

  const advantages = factors
    .filter((f) => f.score >= 72)
    .slice(0, 3)
    .map(
      (f) =>
        `${f.label} is strong at ${f.score}/100 — a meaningful advantage for ${persona.label.toLowerCase()} priorities.`,
    );

  const challenges = factors
    .filter((f) => f.score < 58)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map(
      (f) =>
        `${f.label} scores only ${f.score}/100 and should be planned around.`,
    );

  const recommendation = persona.recommendationTemplate[band];

  return { score, band, bandLabel, factors, advantages, challenges, recommendation };
}
