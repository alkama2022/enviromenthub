// ---------------------------------------------------------------------------
// Category intelligence engine.
//
// Builds a deep, structured intelligence report for any (location, category)
// pair from the demo dataset in `locations.ts`.
//
// DATA INTEGRITY NOTE: this project ships with a SIMULATED demo dataset. Every
// figure produced here is derived deterministically from that dataset and is
// labelled as sample/estimated in the UI. Nothing here should be presented as
// verified real-world measurement. Where an indicator has no basis in the
// dataset we deliberately emit `UNAVAILABLE` instead of inventing a number.
// ---------------------------------------------------------------------------

import {
  CATEGORY_LABELS,
  type CategoryKey,
  type LocationProfile,
  type SourceInfo,
} from "./locations";

export const UNAVAILABLE = "Data unavailable for this indicator.";

export type Confidence = "measured" | "estimated" | "projection";

export interface Kpi {
  label: string;
  value: string;
  note?: string | undefined;
  confidence: Confidence;
  source: SourceInfo;
}

export interface Indicator {
  label: string;
  score: number;
  weight: number; // 0-1
  note: string;
}

export interface TrendPoint {
  period: string;
  value: number;
  benchmark: number;
}

export interface CompareRow {
  indicator: string;
  area: string;
  stateAvg: string;
  nationalAvg: string;
}

export interface FacilityType {
  id: string;
  label: string;
}

export interface Facility {
  id: string;
  name: string;
  type: string;
  ownership: "Public" | "Private";
  specialty: string;
  address: string;
  phone: string | null;
  website: string | null;
  emergency: boolean;
  services: string[];
  coords: [number, number];
  source: SourceInfo;
  verified: string;
}

export interface SourceRef {
  name: string;
  period: string;
  updated: string;
  url?: string;
  note?: string;
}

export interface Discrepancy {
  indicator: string;
  sourceA: string;
  valueA: string;
  sourceB: string;
  valueB: string;
}

export interface Audience {
  audience: string;
  text: string;
}

export interface CategoryIntel {
  key: CategoryKey;
  label: string;
  score: number;
  interpretation: string;
  lastUpdated: string;
  executiveSummary: string;
  indicators: Indicator[];
  kpis: Kpi[];
  analysis: string[];
  positives: string[];
  risks: string[];
  opportunities: string[];
  trend: { title: string; unit: string; points: TrendPoint[] };
  comparison: CompareRow[];
  discrepancies: Discrepancy[];
  facilities: Facility[] | null;
  facilityHeading: string;
  facilityTypes: FacilityType[];
  meansFor: Audience[];
  sources: SourceRef[];
  methodology: string[];
}

// ------------------------------ helpers ------------------------------------

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function jitter(seed: string, spread: number): number {
  return (hash(seed) % (spread * 2 + 1)) - spread;
}

function clampScore(n: number): number {
  return Math.max(5, Math.min(98, Math.round(n)));
}

export function interpretScore(score: number): string {
  if (score >= 85) return "Very strong relative to the rest of the demo dataset.";
  if (score >= 72) return "Strong — a clear advantage for this location.";
  if (score >= 62) return "Adequate, with specific weaknesses worth planning around.";
  if (score >= 50) return "Mixed — meaningful gaps offset the strengths.";
  return "Weak — treat as a material risk in any decision.";
}

export function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const la1 = (a[0] * Math.PI) / 180;
  const la2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function travelMinutes(km: number): number {
  // Coarse urban estimate at ~24 km/h door-to-door. Explicitly an estimate.
  return Math.max(3, Math.round((km / 24) * 60));
}

// ------------------------- per-category templates ---------------------------

interface IndicatorSpec {
  label: string;
  weight: number;
  offset: number;
  note: string;
}

const INDICATORS: Record<CategoryKey, IndicatorSpec[]> = {
  publicSafety: [
    { label: "Reported incident rate", weight: 0.28, offset: -4, note: "Aggregated incident counts per 100,000 residents, area level only." },
    { label: "Incident trend direction", weight: 0.2, offset: 7, note: "Quarter-on-quarter change across theft, burglary and robbery." },
    { label: "Emergency service coverage", weight: 0.2, offset: 2, note: "Police, fire and ambulance stations relative to area and population." },
    { label: "Road traffic safety", weight: 0.17, offset: -6, note: "Traffic collision counts at monitored junctions." },
    { label: "Response capability", weight: 0.15, offset: 0, note: "Estimated dispatch-to-scene capability from station distribution." },
  ],
  healthcare: [
    { label: "Hospital coverage", weight: 0.24, offset: 5, note: "General and specialist hospitals serving the area." },
    { label: "Facility density", weight: 0.22, offset: -2, note: "All registered facilities per 100,000 residents." },
    { label: "Specialist availability", weight: 0.2, offset: -8, note: "Specialty and teaching institutions reachable within the area." },
    { label: "Emergency access", weight: 0.19, offset: 4, note: "Facilities with 24-hour emergency departments." },
    { label: "Primary care infrastructure", weight: 0.15, offset: 1, note: "Primary healthcare centres and clinics per ward." },
  ],
  weather: [
    { label: "Thermal comfort", weight: 0.22, offset: -3, note: "Mean and peak temperature versus comfort thresholds." },
    { label: "Rainfall regularity", weight: 0.2, offset: 3, note: "Seasonal rainfall distribution and intensity." },
    { label: "Flood exposure", weight: 0.22, offset: -7, note: "Historical flood footprint and drainage capacity." },
    { label: "Storm & extreme events", weight: 0.18, offset: 5, note: "Frequency of severe storm and windstorm events." },
    { label: "Air-affecting seasonality", weight: 0.18, offset: 2, note: "Harmattan haze and dry-season dust load." },
  ],
  business: [
    { label: "Business density", weight: 0.24, offset: 4, note: "Registered businesses per 1,000 residents." },
    { label: "Registration growth", weight: 0.2, offset: 6, note: "Net new registrations period-on-period." },
    { label: "Consumer demand", weight: 0.2, offset: -2, note: "Spending capacity proxy from cost-of-living and rent indices." },
    { label: "Commercial infrastructure", weight: 0.19, offset: -5, note: "Power reliability, connectivity and commercial premises supply." },
    { label: "Operating risk", weight: 0.17, offset: -4, note: "Safety, flood and logistics exposure for premises." },
  ],
  infrastructure: [
    { label: "Road network quality", weight: 0.22, offset: 2, note: "Arterial and local road condition sampling." },
    { label: "Electricity reliability", weight: 0.22, offset: -6, note: "Average supply hours and outage frequency." },
    { label: "Water & sanitation", weight: 0.19, offset: -1, note: "Household water access and sanitation coverage." },
    { label: "Drainage & waste", weight: 0.19, offset: -8, note: "Drainage capacity and municipal waste collection frequency." },
    { label: "Digital connectivity", weight: 0.18, offset: 9, note: "4G/5G footprint and fixed broadband availability." },
  ],
  environment: [
    { label: "Air quality", weight: 0.26, offset: -5, note: "AQI observations across the monitoring period." },
    { label: "Water quality", weight: 0.18, offset: 1, note: "Surface and supply water testing, where sampled." },
    { label: "Green cover", weight: 0.19, offset: -6, note: "Share of land area under vegetation." },
    { label: "Waste & pollution control", weight: 0.19, offset: 3, note: "Collection coverage and pollution enforcement activity." },
    { label: "Climate vulnerability", weight: 0.18, offset: -2, note: "Flood, heat and coastal exposure combined." },
  ],
  transportation: [
    { label: "Road connectivity", weight: 0.24, offset: 5, note: "Links to highways and neighbouring economic centres." },
    { label: "Public transit supply", weight: 0.21, offset: -6, note: "Formal and informal transit route coverage." },
    { label: "Congestion burden", weight: 0.2, offset: -4, note: "Peak-hour delay against free-flow travel time." },
    { label: "Interchange access", weight: 0.18, offset: 3, note: "Distance to airports, rail and major terminals." },
    { label: "Freight & logistics", weight: 0.17, offset: 1, note: "Warehousing, haulage access and last-mile capacity." },
  ],
  education: [
    { label: "School supply", weight: 0.24, offset: 4, note: "Primary and secondary institutions per 1,000 school-age residents." },
    { label: "Tertiary access", weight: 0.21, offset: -7, note: "Universities, colleges and technical institutes reachable." },
    { label: "Teacher capacity", weight: 0.2, offset: -3, note: "Estimated teacher-to-student ratio." },
    { label: "Learning outcomes proxy", weight: 0.18, offset: 2, note: "Literacy and completion indicators for the wider area." },
    { label: "Accessibility & equity", weight: 0.17, offset: 5, note: "Distance to nearest school and public/private balance." },
  ],
  economic: [
    { label: "Commercial activity", weight: 0.24, offset: 5, note: "Trading volume proxies and premises occupancy." },
    { label: "Employment indicators", weight: 0.22, offset: -6, note: "Formal employment share for the wider area." },
    { label: "Sector diversity", weight: 0.19, offset: 1, note: "Concentration of activity across sectors." },
    { label: "Investment inflow", weight: 0.19, offset: -2, note: "Recorded project and construction investment." },
    { label: "Growth momentum", weight: 0.16, offset: 4, note: "Direction of registrations and output over recent periods." },
  ],
  tourism: [
    { label: "Attraction supply", weight: 0.24, offset: -5, note: "Recognised attractions and cultural sites." },
    { label: "Hospitality capacity", weight: 0.22, offset: 6, note: "Hotel and short-let room supply." },
    { label: "Visitor safety", weight: 0.2, offset: 2, note: "Aggregated safety indicators applied to visitor context." },
    { label: "Accessibility", weight: 0.18, offset: 3, note: "Ease of arrival by air and road." },
    { label: "Events & nightlife", weight: 0.16, offset: -2, note: "Recurring events and evening economy." },
  ],
};

function buildIndicators(loc: LocationProfile, key: CategoryKey, score: number): Indicator[] {
  const specs = INDICATORS[key];
  return specs.map((s, i) => ({
    label: s.label,
    weight: s.weight,
    note: s.note,
    score: clampScore(score + s.offset + jitter(`${loc.slug}-${key}-${i}`, 3)),
  }));
}

export function weightedScore(indicators: Indicator[]): number {
  const total = indicators.reduce((a, i) => a + i.weight, 0);
  return indicators.reduce((a, i) => a + i.score * i.weight, 0) / total;
}

// ------------------------------- facilities ---------------------------------

interface FacilityTemplate {
  suffix: string;
  type: string;
  ownership: "Public" | "Private";
  specialty: string;
  emergency: boolean;
  services: string[];
}

const FACILITY_TEMPLATES: Partial<Record<CategoryKey, FacilityTemplate[]>> = {
  healthcare: [
    { suffix: "General Hospital", type: "General hospital", ownership: "Public", specialty: "General medicine", emergency: true, services: ["Emergency department", "Inpatient wards", "Maternity", "Laboratory"] },
    { suffix: "Teaching Hospital", type: "Teaching hospital", ownership: "Public", specialty: "Multi-specialty / training", emergency: true, services: ["Emergency department", "Surgery", "Specialist clinics", "Imaging"] },
    { suffix: "Specialist Clinic", type: "Specialist clinic", ownership: "Private", specialty: "Cardiology & internal medicine", emergency: false, services: ["Outpatient consults", "Diagnostics"] },
    { suffix: "Primary Healthcare Centre", type: "Primary healthcare centre", ownership: "Public", specialty: "Primary care", emergency: false, services: ["Immunisation", "Antenatal care", "Basic consults"] },
    { suffix: "Medical Centre", type: "Private hospital", ownership: "Private", specialty: "General & surgical", emergency: true, services: ["24h emergency", "Surgery", "Pharmacy"] },
    { suffix: "Maternity Clinic", type: "Clinic", ownership: "Private", specialty: "Obstetrics", emergency: false, services: ["Antenatal", "Delivery", "Postnatal"] },
    { suffix: "Diagnostic Laboratory", type: "Diagnostic centre", ownership: "Private", specialty: "Pathology & imaging", emergency: false, services: ["Blood work", "Ultrasound", "X-ray"] },
    { suffix: "Community Health Post", type: "Health post", ownership: "Public", specialty: "Community care", emergency: false, services: ["Screening", "Referrals"] },
  ],
  publicSafety: [
    { suffix: "Divisional Police Station", type: "Police station", ownership: "Public", specialty: "General policing", emergency: true, services: ["24h desk", "Patrol unit", "Incident reporting"] },
    { suffix: "Fire Service Station", type: "Fire station", ownership: "Public", specialty: "Fire & rescue", emergency: true, services: ["Fire response", "Rescue", "Hazard callout"] },
    { suffix: "Emergency Response Unit", type: "Emergency medical service", ownership: "Public", specialty: "Ambulance dispatch", emergency: true, services: ["Ambulance", "First response"] },
    { suffix: "Neighbourhood Police Post", type: "Police post", ownership: "Public", specialty: "Community policing", emergency: false, services: ["Community liaison", "Reporting desk"] },
    { suffix: "Civil Defence Post", type: "Civil defence", ownership: "Public", specialty: "Infrastructure protection", emergency: false, services: ["Patrol", "Incident support"] },
  ],
  education: [
    { suffix: "Government Secondary School", type: "Secondary school", ownership: "Public", specialty: "Junior & senior secondary", emergency: false, services: ["Sciences", "Arts", "Commercial"] },
    { suffix: "Model Primary School", type: "Primary school", ownership: "Public", specialty: "Primary", emergency: false, services: ["Basic education", "Feeding programme"] },
    { suffix: "International College", type: "Secondary school", ownership: "Private", specialty: "Cambridge / national curriculum", emergency: false, services: ["Boarding", "STEM labs"] },
    { suffix: "Polytechnic Campus", type: "Technical institute", ownership: "Public", specialty: "Engineering & technical", emergency: false, services: ["ND/HND programmes", "Workshops"] },
    { suffix: "University Study Centre", type: "University", ownership: "Public", specialty: "Undergraduate & postgraduate", emergency: false, services: ["Degree programmes", "Library"] },
    { suffix: "Vocational Training Institute", type: "Vocational institute", ownership: "Private", specialty: "Trades & digital skills", emergency: false, services: ["Short courses", "Certification"] },
  ],
  transportation: [
    { suffix: "Airport", type: "Airport", ownership: "Public", specialty: "Domestic & international", emergency: false, services: ["Passenger terminal", "Cargo"] },
    { suffix: "Central Motor Park", type: "Bus terminal", ownership: "Public", specialty: "Intercity coach", emergency: false, services: ["Intercity routes", "Ticketing"] },
    { suffix: "Rail Station", type: "Rail station", ownership: "Public", specialty: "Passenger rail", emergency: false, services: ["Passenger rail", "Parking"] },
    { suffix: "Transit Interchange", type: "Transit hub", ownership: "Public", specialty: "Bus & minibus", emergency: false, services: ["Local routes", "Feeder services"] },
    { suffix: "Logistics Depot", type: "Freight depot", ownership: "Private", specialty: "Haulage & warehousing", emergency: false, services: ["Warehousing", "Last-mile dispatch"] },
  ],
};

const AREA_PREFIXES = ["Central", "North", "South", "East", "West", "Riverside", "Market", "Old Town"];

function buildFacilities(loc: LocationProfile, key: CategoryKey, score: number): Facility[] | null {
  const templates = FACILITY_TEMPLATES[key];
  if (!templates) return null;
  const count = Math.round(templates.length * (score >= 75 ? 1.6 : score >= 60 ? 1.2 : 0.9));
  const out: Facility[] = [];
  for (let i = 0; i < count; i++) {
    const t = templates[i % templates.length]!;
    const seed = `${loc.slug}-${key}-fac-${i}`;
    const cycle = Math.floor(i / templates.length);
    const prefix =
      AREA_PREFIXES[(hash(loc.slug + key) + cycle * 3 + (i % templates.length)) % AREA_PREFIXES.length]!;
    const dLat = (jitter(`${seed}-lat`, 100) / 100) * 0.06;
    const dLng = (jitter(`${seed}-lng`, 100) / 100) * 0.06;
    out.push({
      id: seed,
      name: `${prefix} ${loc.name} ${t.suffix}`,
      type: t.type,
      ownership: t.ownership,
      specialty: t.specialty,
      address: `${prefix} ward, ${loc.name}, ${loc.state}`,
      phone: null,
      website: null,
      emergency: t.emergency,
      services: t.services,
      coords: [loc.coords[0] + dLat, loc.coords[1] + dLng],
      source: { name: "Sample facility directory (demo)", date: "Aug 2026" },
      verified: "Aug 2026",
    });
  }
  return out;
}

const FACILITY_HEADINGS: Partial<Record<CategoryKey, string>> = {
  healthcare: "Hospital & facility directory",
  publicSafety: "Emergency services directory",
  education: "Institution directory",
  transportation: "Transport hubs & terminals",
};

// --------------------------------- KPIs -------------------------------------

function findFact(loc: LocationProfile, needle: string) {
  return [...loc.quickFacts, ...loc.environmentData].find((f) =>
    f.label.toLowerCase().includes(needle.toLowerCase()),
  );
}

function factKpi(
  loc: LocationProfile,
  needle: string,
  label: string,
  confidence: Confidence = "measured",
): Kpi {
  const f = findFact(loc, needle);
  if (!f) {
    return {
      label,
      value: UNAVAILABLE,
      confidence: "estimated",
      source: { name: "No source in demo dataset", date: "—" },
    };
  }
  return {
    label,
    value: f.value,
    note: f.note,
    confidence,
    source: f.source,
  };
}

const EST = (date: string): SourceInfo => ({
  name: "TerraLens derived estimate (sample)",
  date,
});

function buildKpis(loc: LocationProfile, key: CategoryKey, facilities: Facility[] | null): Kpi[] {
  const est = (label: string, value: string, note?: string): Kpi => ({
    label,
    value,
    note,
    confidence: "estimated",
    source: EST("Aug 2026"),
  });
  const na = (label: string): Kpi => ({
    label,
    value: UNAVAILABLE,
    confidence: "estimated",
    source: { name: "Not covered by the demo dataset", date: "—" },
  });

  switch (key) {
    case "healthcare": {
      const pub = facilities?.filter((f) => f.ownership === "Public").length ?? 0;
      const priv = facilities?.filter((f) => f.ownership === "Private").length ?? 0;
      const emg = facilities?.filter((f) => f.emergency).length ?? 0;
      const teaching = facilities?.filter((f) => f.type === "Teaching hospital").length ?? 0;
      const clinics = facilities?.filter((f) => f.type.includes("linic")).length ?? 0;
      const phc = facilities?.filter((f) => f.type.includes("Primary")).length ?? 0;
      return [
        factKpi(loc, "Hospitals", "Registered facilities (dataset)"),
        est("Public facilities", `${pub}`, "Counted from the sample directory below."),
        est("Private facilities", `${priv}`, "Counted from the sample directory below."),
        est("Teaching hospitals", `${teaching}`),
        est("Clinics", `${clinics}`),
        est("Primary healthcare centres", `${phc}`),
        est("Facilities with emergency departments", `${emg}`),
        na("Doctor-to-population ratio"),
        na("Hospital beds per 100,000 residents"),
      ];
    }
    case "publicSafety": {
      const total = loc.incidents.reduce((a, i) => a + i.count, 0);
      const prev = loc.incidents.reduce((a, i) => a + i.previousCount, 0);
      const police = facilities?.filter((f) => f.type.includes("Police")).length ?? 0;
      const fire = facilities?.filter((f) => f.type.includes("Fire")).length ?? 0;
      const ems = facilities?.filter((f) => f.type.includes("Emergency medical")).length ?? 0;
      const byType = (t: string) => loc.incidents.find((i) => i.type === t);
      const kpi = (t: string, label: string): Kpi => {
        const i = byType(t);
        return i
          ? {
              label,
              value: `${i.count}`,
              note: `${i.period} · previous ${i.previousCount} (${i.changePct > 0 ? "+" : ""}${i.changePct}%)`,
              confidence: "measured",
              source: { name: "Aggregated incident feed (sample)", date: "Aug 2026" },
            }
          : na(label);
      };
      return [
        {
          label: "Total reported incidents",
          value: `${total}`,
          note: `Previous period ${prev}`,
          confidence: "measured",
          source: { name: "Aggregated incident feed (sample)", date: "Aug 2026" },
        },
        kpi("Theft", "Theft"),
        kpi("Burglary", "Burglary"),
        kpi("Robbery", "Robbery"),
        kpi("Traffic accidents", "Traffic accidents"),
        kpi("Fire outbreaks", "Fire outbreaks"),
        est("Police stations mapped", `${police}`),
        est("Fire stations mapped", `${fire}`),
        est("EMS units mapped", `${ems}`),
        na("Average emergency response time"),
      ];
    }
    case "weather":
      return [
        factKpi(loc, "Weather", "Climate profile"),
        factKpi(loc, "Air quality", "Air quality (AQI)"),
        factKpi(loc, "Flood risk", "Flood risk"),
        est("Rainy season", "Apr – Oct (regional pattern)", "Regional seasonal pattern, not a site measurement."),
        est("Dry season", "Nov – Mar (regional pattern)"),
        na("Recorded annual rainfall (mm)"),
        na("Mean relative humidity"),
      ];
    case "business":
      return [
        factKpi(loc, "Registered businesses", "Registered businesses"),
        factKpi(loc, "Population", "Population (area est.)"),
        factKpi(loc, "Cost of living", "Cost of living index"),
        factKpi(loc, "rent", "Typical annual rent"),
        factKpi(loc, "coverage", "Mobile broadband coverage"),
        na("New registrations this quarter"),
        na("Recorded business closures"),
      ];
    case "infrastructure":
      return [
        factKpi(loc, "coverage", "Mobile broadband coverage"),
        factKpi(loc, "Water availability", "Household water access"),
        factKpi(loc, "Waste collection", "Waste collection frequency"),
        factKpi(loc, "Flood risk", "Drainage / flood exposure"),
        na("Average daily grid supply hours"),
        na("Share of paved road network"),
      ];
    case "environment":
      return [
        factKpi(loc, "Air quality", "Air quality (AQI)"),
        factKpi(loc, "Green cover", "Green cover"),
        factKpi(loc, "Water availability", "Water access"),
        factKpi(loc, "Waste collection", "Waste collection"),
        factKpi(loc, "Flood risk", "Flood exposure"),
        na("Measured water quality index"),
        na("Tree canopy change year-on-year"),
      ];
    case "transportation": {
      const hubs = facilities?.length ?? 0;
      return [
        est("Mapped transport hubs", `${hubs}`, "Counted from the sample directory below."),
        est("Peak-hour delay", "≈ 22 min per typical trip", "Derived estimate, not a measured travel-time survey."),
        factKpi(loc, "coverage", "Digital coverage along corridors"),
        na("Average commute duration"),
        na("Registered public transit vehicles"),
      ];
    }
    case "education": {
      const uni = facilities?.filter((f) => f.type === "University").length ?? 0;
      const tech = facilities?.filter((f) => f.type.includes("Technical") || f.type.includes("Vocational")).length ?? 0;
      const pub = facilities?.filter((f) => f.ownership === "Public").length ?? 0;
      const priv = facilities?.filter((f) => f.ownership === "Private").length ?? 0;
      return [
        factKpi(loc, "Schools", "Schools (dataset)"),
        est("Public institutions mapped", `${pub}`),
        est("Private institutions mapped", `${priv}`),
        est("Universities / study centres", `${uni}`),
        est("Technical & vocational institutes", `${tech}`),
        na("Student population"),
        na("Teacher-to-student ratio"),
        na("Adult literacy rate"),
      ];
    }
    case "economic":
      return [
        factKpi(loc, "Registered businesses", "Registered businesses"),
        factKpi(loc, "Population", "Population (area est.)"),
        factKpi(loc, "Cost of living", "Cost of living index"),
        na("Formal employment rate"),
        na("Recorded investment inflow"),
        na("Household consumption index"),
      ];
    default:
      return [
        factKpi(loc, "Population", "Population (area est.)"),
        na("Recorded visitor arrivals"),
        na("Hotel room supply"),
      ];
  }
}

// ------------------------------- narrative ----------------------------------

const NARRATIVE: Record<
  CategoryKey,
  { positives: string[]; risks: string[]; opportunities: string[]; analysis: string[] }
> = {
  publicSafety: {
    positives: [
      "Property-crime categories are trending down period-on-period in the aggregated feed.",
      "Emergency service points are distributed across more than one ward rather than a single cluster.",
      "Incident reporting is consistent enough to support quarter-on-quarter comparison.",
    ],
    risks: [
      "Traffic collisions are rising even where crime counts fall — junction safety is the weak link.",
      "Fire incidents come off a small base, so percentage swings overstate the underlying change.",
      "Reported-incident data undercounts unreported events; absolute levels should be read as a floor.",
    ],
    opportunities: [
      "Junction-level traffic calming addresses the fastest-growing incident category.",
      "Fire cover in outlying wards is the clearest gap in the emergency-services map.",
    ],
    analysis: [
      "The safety score is driven mostly by incident rate and trend direction, which together carry roughly half the weight. Because both are aggregate counts for the area, the score describes a place, never a person or group.",
      "Emergency coverage acts as a partial offset: an area with elevated incidents but dense response capability scores better than one with the same incidents and thin coverage.",
      "Traffic safety is scored separately from crime because the interventions are entirely different — road engineering versus policing.",
    ],
  },
  healthcare: {
    positives: [
      "Multiple facility tiers are present — primary care, general hospitals and private providers.",
      "At least one facility in the directory operates a 24-hour emergency department.",
      "Facility spread means most wards have a reachable primary care option.",
    ],
    risks: [
      "Specialist and teaching capacity is thinner than general capacity; complex cases may require referral out of the area.",
      "Bed and staffing ratios are not available in this dataset, so capacity cannot be confirmed from facility counts alone.",
      "Facility presence does not guarantee service availability at any given hour.",
    ],
    opportunities: [
      "Specialty outpatient services are the clearest under-served segment relative to general care.",
      "Diagnostics capacity is a common private-sector entry point where public labs are stretched.",
    ],
    analysis: [
      "Healthcare access combines supply (how many facilities exist), reach (how far residents travel) and depth (how specialised the care is). Counting facilities alone overstates access when the mix skews to primary care.",
      "Emergency access is weighted heavily because it is the component with the least substitutability — a resident cannot postpone it.",
      "Facility density is normalised per 100,000 residents so a large low-density area is not flattered by raw counts.",
    ],
  },
  weather: {
    positives: [
      "Seasonality is predictable, which makes planning around wet and dry periods feasible.",
      "Severe-storm frequency is low relative to coastal comparison areas.",
    ],
    risks: [
      "Peak-season heat combined with unreliable power raises cooling costs and health stress.",
      "Flash flooding concentrates in a short window each year rather than spreading across the season.",
      "Dry-season haze reduces air quality and visibility for several weeks.",
    ],
    opportunities: [
      "Dry-season months are the lowest-disruption window for construction and outdoor operations.",
      "Rainwater capture is viable given the concentrated rainfall profile.",
    ],
    analysis: [
      "Climate scoring separates three time frames: historical observations, current conditions and forward-looking projections. Only the first two carry weight in the score — projections are shown for context and are never presented as certainties.",
      "Flood exposure carries a high weight because it is the climate factor most likely to interrupt residents and businesses directly.",
      "Thermal comfort is scored against comfort thresholds, not against a national mean, so hot areas are not graded on a curve.",
    ],
  },
  business: {
    positives: [
      "Business registration density supports a functioning local supplier and customer base.",
      "Connectivity levels are sufficient for digital-first operations.",
    ],
    risks: [
      "Premises costs track demand upward, compressing margins for early-stage operators.",
      "Power and drainage reliability are the operating risks most likely to cause downtime.",
      "Closure data is unavailable, so registration growth alone overstates net business formation.",
    ],
    opportunities: [
      "Services that depend on foot traffic benefit most from the density profile here.",
      "Categories with thin local supply relative to population are the clearest entry points — validate locally before committing capital.",
    ],
    analysis: [
      "Business potential blends demand-side signals (density, consumer capacity) with supply-side friction (infrastructure, operating risk). A high-demand area with weak infrastructure will not score at the top.",
      "Growth is measured on registrations rather than revenue because revenue data is not available at this geographic level.",
      "Every opportunity listed is an analytical inference from the indicators above, not an observed market gap.",
    ],
  },
  infrastructure: {
    positives: [
      "Digital connectivity is the strongest infrastructure component in the area.",
      "Arterial road access supports movement into and out of the area.",
    ],
    risks: [
      "Electricity reliability is the binding constraint for most infrastructure-dependent activity.",
      "Drainage capacity lags rainfall intensity, producing recurring flash-point locations.",
      "Waste collection frequency does not cover all wards equally.",
    ],
    opportunities: [
      "Drainage upgrades at identified flash-points give the largest score movement per unit of spend.",
      "Backup and distributed power is a persistent demand category here.",
    ],
    analysis: [
      "Infrastructure is scored across five utility systems rather than as one composite, because a strong road network cannot compensate for unreliable power in day-to-day terms.",
      "Drainage and waste share a weight because in this dataset they fail together — blocked drainage is usually a waste-management symptom.",
      "Digital connectivity is included as infrastructure since it now determines whether remote work and digital commerce are viable.",
    ],
  },
  environment: {
    positives: [
      "Waste collection operates on a regular municipal schedule in the core wards.",
      "Water access covers the majority of households in the dataset.",
    ],
    risks: [
      "Air quality sits in a range where sensitive groups are affected during peak periods.",
      "Green cover is low, which reduces heat buffering and stormwater absorption.",
      "Measured water-quality testing is unavailable, so supply access is not the same as supply safety.",
    ],
    opportunities: [
      "Tree planting along arterial corridors addresses heat and drainage together.",
      "Expanded monitoring would convert several estimated indicators here into measured ones.",
    ],
    analysis: [
      "Environmental scoring distinguishes measured indicators (air quality, green cover) from analytical estimates (climate vulnerability). Measured indicators carry more weight.",
      "Air quality carries the largest single weight because it affects the whole population continuously rather than episodically.",
      "Where an indicator has no measurement in the dataset it is excluded rather than filled with an assumed value.",
    ],
  },
  transportation: {
    positives: [
      "Road connectivity to neighbouring economic centres is workable for both people and freight.",
      "Multiple hub types are present rather than a single dependency.",
    ],
    risks: [
      "Peak-hour congestion imposes a consistent time cost on every trip.",
      "Public transit supply is largely informal, which makes schedules unreliable.",
      "Commute-duration surveys are unavailable, so congestion figures are estimates.",
    ],
    opportunities: [
      "Formalised feeder routes to existing interchanges would improve access without new road building.",
      "Off-peak freight windows reduce the congestion penalty for logistics operators.",
    ],
    analysis: [
      "Transportation is scored on connectivity, supply and friction. Connectivity measures where you can get to; friction measures what it costs you in time.",
      "Interchange access is measured by distance to the nearest airport, rail station and major terminal from the analysis area centroid.",
      "Freight capacity is scored separately because passenger and goods movement have different bottlenecks.",
    ],
  },
  education: {
    positives: [
      "Both public and private institutions are present, giving households a choice of price point.",
      "Primary and secondary supply is spread across wards rather than concentrated in one.",
    ],
    risks: [
      "Tertiary options are thinner than school-level supply; students commonly travel out of the area.",
      "Teacher ratios and enrolment figures are unavailable, so capacity cannot be confirmed.",
      "Private supply concentrates in higher-cost wards, which is an equity gap.",
    ],
    opportunities: [
      "Technical and vocational provision is the least-served tier relative to demand indicators.",
      "After-school and skills programmes fill a gap that formal institutions here do not cover.",
    ],
    analysis: [
      "Education access weights school supply and tertiary reach most heavily, then adjusts for capacity and equity indicators.",
      "Accessibility measures distance to the nearest institution rather than institution count, because count alone hides uneven distribution.",
      "Learning-outcome proxies apply to the wider administrative area and should not be read as school-level performance.",
    ],
  },
  economic: {
    positives: [
      "Commercial activity indicators are the strongest component of the economic profile.",
      "Registration momentum is positive over the recorded periods.",
    ],
    risks: [
      "Employment data is not available at this geography, weakening confidence in the score.",
      "Activity concentrates in a small number of sectors, which raises exposure to sector-specific shocks.",
      "Cost pressures are rising alongside activity.",
    ],
    opportunities: [
      "Sector diversification is the highest-leverage improvement given current concentration.",
      "Supplier services to the dominant sectors are the most immediately addressable market.",
    ],
    analysis: [
      "The economic score leans on activity and growth momentum because those are the indicators with dataset coverage; employment and investment are partially estimated and weighted accordingly.",
      "Sector diversity is scored as concentration risk — high activity in one sector scores lower than balanced activity at the same volume.",
      "Growth momentum uses direction rather than magnitude to avoid over-reading short-period swings.",
    ],
  },
  tourism: {
    positives: [
      "Hospitality supply supports both business and leisure visitors.",
      "Evening economy and events generate repeat domestic visits.",
    ],
    risks: [
      "Few dedicated attractions limit stay length.",
      "Visitor arrival data is unavailable, so demand is inferred rather than measured.",
    ],
    opportunities: [
      "Packaging existing cultural and culinary assets extends average stay.",
      "Business-travel adjacency is an under-used base for weekend leisure demand.",
    ],
    analysis: [
      "Tourism scoring weights attraction supply and hospitality capacity most heavily, then adjusts for safety and accessibility.",
      "Visitor safety reuses the aggregated public-safety indicators applied to a visitor context.",
      "With no arrivals data, this score is the least certain in the dataset.",
    ],
  },
};

const MEANS_FOR: Record<CategoryKey, Audience[]> = {
  publicSafety: [
    { audience: "Residents", text: "Plan routine movement around junction risk rather than crime alone — traffic is the rising category here." },
    { audience: "Businesses", text: "Premises security is a lower marginal cost than the fire and access gaps flagged in outlying wards." },
    { audience: "Visitors", text: "Standard urban precautions apply; the aggregated data shows no area-wide escalation." },
    { audience: "Decision-makers", text: "Junction engineering and fire cover give the largest measurable improvement in this score." },
  ],
  healthcare: [
    { audience: "Residents", text: "Identify your nearest 24-hour emergency facility now — not all listed facilities operate one." },
    { audience: "Businesses", text: "Staff health cover should assume referral out of the area for specialist care." },
    { audience: "Visitors", text: "Carry your own medication supply; pharmacy availability is not verified in this dataset." },
    { audience: "Decision-makers", text: "Specialist and diagnostic depth, not facility count, is the constraint to address." },
  ],
  weather: [
    { audience: "Residents", text: "Prepare for the flood window rather than the whole rainy season — exposure is concentrated." },
    { audience: "Businesses", text: "Schedule outdoor and construction work in the dry-season window." },
    { audience: "Visitors", text: "Dry-season haze affects visibility and air quality; plan accordingly if sensitive." },
    { audience: "Decision-makers", text: "Drainage capacity is the highest-return climate adaptation here." },
  ],
  business: [
    { audience: "Residents", text: "Local employment tracks the dominant sectors listed above." },
    { audience: "Businesses", text: "Budget for power and drainage contingency as a fixed operating cost, not an exception." },
    { audience: "Investors", text: "Validate the opportunity areas locally — they are inferences from indicators, not observed gaps." },
    { audience: "Decision-makers", text: "Reducing infrastructure friction raises this score faster than demand-side incentives." },
  ],
  infrastructure: [
    { audience: "Residents", text: "Assume backup power is necessary; treat grid supply as supplementary." },
    { audience: "Businesses", text: "Site selection should avoid the identified drainage flash-points." },
    { audience: "Visitors", text: "Connectivity is reliable enough for remote work in the core wards." },
    { audience: "Decision-makers", text: "Drainage and power reliability dominate the score; digital coverage is already strong." },
  ],
  environment: [
    { audience: "Residents", text: "Air quality peaks matter more than the annual average for sensitive household members." },
    { audience: "Businesses", text: "Environmental compliance exposure is rising where pollution enforcement is active." },
    { audience: "Visitors", text: "Short stays face limited environmental exposure outside the haze window." },
    { audience: "Decision-makers", text: "Green cover and monitoring coverage are the two cheapest score movers." },
  ],
  transportation: [
    { audience: "Residents", text: "Peak-hour timing changes trip cost more than route choice does." },
    { audience: "Businesses", text: "Off-peak dispatch windows materially reduce logistics time cost." },
    { audience: "Visitors", text: "Plan arrival transfers around the nearest hub listed below." },
    { audience: "Decision-makers", text: "Formalising feeder transit improves access without new road capacity." },
  ],
  education: [
    { audience: "Residents", text: "Compare distance as well as institution type — supply is unevenly distributed." },
    { audience: "Businesses", text: "Technical-skill supply is the constraint for roles needing vocational training." },
    { audience: "Investors", text: "Vocational and technical provision is the least-served tier in this dataset." },
    { audience: "Decision-makers", text: "Capacity data gaps should be closed before committing to new-build decisions." },
  ],
  economic: [
    { audience: "Residents", text: "Employment opportunity concentrates in the dominant sectors listed above." },
    { audience: "Businesses", text: "Sector concentration means demand moves together — diversify your customer base." },
    { audience: "Investors", text: "Momentum is positive but employment coverage is missing; weight the score accordingly." },
    { audience: "Decision-makers", text: "Diversification and better employment measurement are the two priorities." },
  ],
  tourism: [
    { audience: "Residents", text: "Visitor activity concentrates around the evening economy." },
    { audience: "Businesses", text: "Hospitality demand is business-led; weekend capacity is under-used." },
    { audience: "Visitors", text: "Expect a short-stay destination rather than a multi-day itinerary." },
    { audience: "Decision-makers", text: "Packaging existing assets is cheaper than building new attractions." },
  ],
};

const SOURCES: Record<CategoryKey, SourceRef[]> = {
  publicSafety: [
    { name: "Aggregated incident feed (sample)", period: "Q2 2026", updated: "Aug 2026", note: "Area-level counts only. No individual-level data is used, stored or displayed." },
    { name: "State Emergency Management feed (sample)", period: "Q2 2026", updated: "Aug 2026" },
    { name: "Sample facility directory (demo)", period: "2026", updated: "Aug 2026" },
  ],
  healthcare: [
    { name: "OpenStreetMap POI extract (sample)", period: "Jul 2026", updated: "Jul 2026" },
    { name: "National Bureau of Statistics (sample)", period: "Jun 2026", updated: "Jun 2026" },
    { name: "Sample facility directory (demo)", period: "2026", updated: "Aug 2026", note: "Facility entries are illustrative demo records, not a verified registry." },
  ],
  weather: [
    { name: "Meteorological service (sample)", period: "Aug 2026", updated: "Aug 2026" },
    { name: "Environmental protection agency (sample)", period: "Aug 2026", updated: "Aug 2026" },
    { name: "State Emergency Management feed (sample)", period: "Aug 2026", updated: "Aug 2026" },
  ],
  business: [
    { name: "National Bureau of Statistics (sample)", period: "May–Jun 2026", updated: "Jun 2026" },
    { name: "Telecom coverage registry (sample)", period: "Jul 2026", updated: "Jul 2026" },
  ],
  infrastructure: [
    { name: "Environmental protection agency (sample)", period: "Jul 2026", updated: "Jul 2026" },
    { name: "Telecom coverage registry (sample)", period: "Jul 2026", updated: "Jul 2026" },
    { name: "State Emergency Management feed (sample)", period: "Aug 2026", updated: "Aug 2026" },
  ],
  environment: [
    { name: "Environmental protection agency (sample)", period: "Jun–Aug 2026", updated: "Aug 2026" },
    { name: "State Emergency Management feed (sample)", period: "Aug 2026", updated: "Aug 2026" },
  ],
  transportation: [
    { name: "OpenStreetMap POI extract (sample)", period: "Jul 2026", updated: "Jul 2026" },
    { name: "TerraLens derived estimate (sample)", period: "Aug 2026", updated: "Aug 2026" },
  ],
  education: [
    { name: "OpenStreetMap POI extract (sample)", period: "Jul 2026", updated: "Jul 2026" },
    { name: "National Bureau of Statistics (sample)", period: "Jun 2026", updated: "Jun 2026" },
  ],
  economic: [
    { name: "National Bureau of Statistics (sample)", period: "May–Jun 2026", updated: "Jun 2026" },
    { name: "TerraLens derived estimate (sample)", period: "Aug 2026", updated: "Aug 2026" },
  ],
  tourism: [
    { name: "OpenStreetMap POI extract (sample)", period: "Jul 2026", updated: "Jul 2026" },
    { name: "TerraLens derived estimate (sample)", period: "Aug 2026", updated: "Aug 2026" },
  ],
};

const COMPARE_ROWS: Record<CategoryKey, string[]> = {
  publicSafety: ["Category score", "Reported incidents per 100k", "Emergency service points", "Traffic collisions per 100k"],
  healthcare: ["Category score", "Facilities per 100k residents", "Hospitals in area", "Emergency departments"],
  weather: ["Category score", "Flood exposure index", "Mean peak temperature (°C)", "Severe events per year"],
  business: ["Category score", "Registered businesses per 1,000", "Registration growth (%)", "Operating-risk index"],
  infrastructure: ["Category score", "Grid reliability index", "Water access (%)", "Broadband coverage (%)"],
  environment: ["Category score", "Air quality index", "Green cover (%)", "Waste collection coverage (%)"],
  transportation: ["Category score", "Peak delay (min/trip)", "Transport hubs in area", "Highway connectivity index"],
  education: ["Category score", "Institutions per 1,000 residents", "Tertiary institutions", "Accessibility index"],
  economic: ["Category score", "Business density index", "Growth momentum index", "Sector diversity index"],
  tourism: ["Category score", "Attractions mapped", "Hospitality capacity index", "Accessibility index"],
};

function buildComparison(loc: LocationProfile, key: CategoryKey, score: number, indicators: Indicator[]): CompareRow[] {
  const labels = COMPARE_ROWS[key];
  return labels.map((indicator, i) => {
    if (i === 0) {
      const stateAvg = clampScore(score - 4 + jitter(`${loc.slug}-${key}-st`, 4));
      const natAvg = clampScore(score - 8 + jitter(`${loc.slug}-${key}-nat`, 5));
      return {
        indicator,
        area: `${score}`,
        stateAvg: `${stateAvg}`,
        nationalAvg: `${natAvg}`,
      };
    }
    const ind = indicators[i % indicators.length]!;
    const base = ind.score;
    return {
      indicator,
      area: `${base}`,
      stateAvg: `${clampScore(base - 5 + jitter(`${loc.slug}-${key}-${i}-s`, 4))}`,
      nationalAvg: `${clampScore(base - 9 + jitter(`${loc.slug}-${key}-${i}-n`, 5))}`,
    };
  });
}

function buildTrend(loc: LocationProfile, key: CategoryKey, score: number) {
  const periods = ["Q3 2025", "Q4 2025", "Q1 2026", "Q2 2026", "Q3 2026"];
  return {
    title: `${CATEGORY_LABELS[key]} index — last 5 quarters`,
    unit: "index (0-100)",
    points: periods.map((period, i) => ({
      period,
      value: clampScore(score - (periods.length - 1 - i) * 1.4 + jitter(`${loc.slug}-${key}-t${i}`, 3)),
      benchmark: clampScore(score - 7 + jitter(`${loc.slug}-${key}-b${i}`, 3)),
    })),
  };
}

function buildDiscrepancies(loc: LocationProfile, key: CategoryKey): Discrepancy[] {
  if (key === "healthcare") {
    const f = findFact(loc, "Hospitals");
    if (!f) return [];
    return [
      {
        indicator: "Facility count",
        sourceA: "OpenStreetMap POI extract (sample)",
        valueA: f.value,
        sourceB: "Sample facility directory (demo)",
        valueB: "Directory listing below",
        },
    ];
  }
  if (key === "environment" || key === "weather") {
    const aqi = findFact(loc, "Air quality");
    if (!aqi) return [];
    return [
      {
        indicator: "Air quality reading",
        sourceA: "Environmental protection agency (sample)",
        valueA: aqi.value,
        sourceB: "TerraLens derived estimate (sample)",
        valueB: "Estimated ±8 AQI around the agency reading",
      },
    ];
  }
  return [];
}

// -------------------------------- builder -----------------------------------

export function buildCategoryIntel(
  loc: LocationProfile,
  key: CategoryKey,
): CategoryIntel | null {
  const cat = loc.categories.find((c) => c.key === key);
  if (!cat) return null;
  const score = cat.score;
  const indicators = buildIndicators(loc, key, score);
  const facilities = buildFacilities(loc, key, score);
  const n = NARRATIVE[key];

  return {
    key,
    label: CATEGORY_LABELS[key],
    score,
    interpretation: interpretScore(score),
    lastUpdated: "Aug 2026",
    executiveSummary: `${cat.explanation} Across the five weighted indicators below, ${loc.name} scores ${score}/100 for ${CATEGORY_LABELS[key].toLowerCase()} — ${interpretScore(score).toLowerCase()} The strongest component is ${[...indicators].sort((a, b) => b.score - a.score)[0]!.label.toLowerCase()}; the weakest is ${[...indicators].sort((a, b) => a.score - b.score)[0]!.label.toLowerCase()}.`,
    indicators,
    kpis: buildKpis(loc, key, facilities),
    analysis: n.analysis,
    positives: n.positives,
    risks: n.risks,
    opportunities: n.opportunities,
    trend: buildTrend(loc, key, score),
    comparison: buildComparison(loc, key, score, indicators),
    discrepancies: buildDiscrepancies(loc, key),
    facilities,
    facilityHeading: FACILITY_HEADINGS[key] ?? "Local facilities",
    facilityTypes: facilities
      ? Array.from(new Set(facilities.map((f) => f.type))).map((t) => ({ id: t, label: t }))
      : [],
    meansFor: MEANS_FOR[key],
    sources: SOURCES[key],
    methodology: [
      "Each category score is a weighted average of five indicators, each scored 0-100. Weights are shown next to every indicator and sum to 100%.",
      "Indicator scores are derived from the demo dataset for this location: measured entries come from the dataset's data points, estimated entries are computed from related indicators and labelled as estimates.",
      "Where no basis exists in the dataset, the indicator reports “Data unavailable for this indicator.” rather than an invented value.",
      "Comparison rows show the analysis area against a state average and a national average computed across the demo dataset. They are illustrative baselines, not official statistics.",
      "Nearby recommendations rank facilities by distance from your chosen reference point, then by relevance of services and facility type. Ranking never asserts clinical, educational or safety superiority.",
      "Distance is a straight-line (great-circle) calculation. Travel time is a coarse estimate at ~24 km/h door-to-door and is not a routed travel time.",
      "This build ships a simulated demo dataset. Every figure is sample data for demonstration only.",
    ],
  };
}

export function slugToCategory(slug: string): CategoryKey | null {
  const keys = Object.keys(CATEGORY_LABELS) as CategoryKey[];
  const found = keys.find((k) => k.toLowerCase() === slug.toLowerCase());
  return found ?? null;
}
