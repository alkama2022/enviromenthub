// ---------------------------------------------------------------------------
// Mock environmental intelligence dataset for Nigerian locations.
// ALL figures are simulated sample data for demonstration purposes only.
// ---------------------------------------------------------------------------

export const MOCK_DISCLAIMER =
  "All figures on this page are simulated sample data for demonstration purposes. They do not represent verified real-world measurements.";

export type CategoryKey =
  | "publicSafety"
  | "healthcare"
  | "weather"
  | "business"
  | "infrastructure"
  | "environment"
  | "transportation"
  | "education"
  | "economic"
  | "tourism";

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  publicSafety: "Public Safety",
  healthcare: "Healthcare Access",
  weather: "Weather & Climate",
  business: "Business Potential",
  infrastructure: "Infrastructure",
  environment: "Environment",
  transportation: "Transportation",
  education: "Education",
  economic: "Economic Activity",
  tourism: "Tourism",
};

export const CATEGORY_ORDER: CategoryKey[] = [
  "publicSafety",
  "healthcare",
  "weather",
  "business",
  "infrastructure",
  "environment",
  "transportation",
  "education",
  "economic",
  "tourism",
];

export interface SourceInfo {
  name: string;
  date: string;
}

export interface DataPoint {
  label: string;
  value: string;
  note?: string;
  source: SourceInfo;
}

export interface CategoryScore {
  key: CategoryKey;
  score: number; // 0-100
  explanation: string;
}

export interface IncidentStat {
  type: string;
  count: number;
  previousCount: number;
  period: string;
  changePct: number; // negative = decrease
}

export interface TrendChange {
  label: string;
  metric: string;
  changePct: number;
  reason: string;
  severity: "info" | "warning" | "critical";
}

export interface TwinScore {
  label: string;
  score: number;
  changePct: number; // vs previous period
}

export interface GovRecommendation {
  text: string;
  priority: "high" | "medium" | "low";
}

export interface MonthlyIncidents {
  period: string;
  count: number;
}

export interface LocationProfile {
  slug: string;
  name: string;
  state: string;
  country: string;
  coords: [number, number]; // [lat, lng]
  tagline: string;
  overallScore: number;
  summary: string;
  quickFacts: DataPoint[];
  environmentData: DataPoint[];
  categories: CategoryScore[];
  incidents: IncidentStat[];
  monthlyIncidents: MonthlyIncidents[];
  trends: TrendChange[];
  twin: TwinScore[];
  recommendations: GovRecommendation[];
}

const NBS = (date: string): SourceInfo => ({
  name: "National Bureau of Statistics (sample)",
  date,
});
const SEMA = (date: string): SourceInfo => ({
  name: "State Emergency Management feed (sample)",
  date,
});
const OSM = (date: string): SourceInfo => ({
  name: "OpenStreetMap POI extract (sample)",
  date,
});
const MET = (date: string): SourceInfo => ({
  name: "Meteorological service (sample)",
  date,
});
const ENV = (date: string): SourceInfo => ({
  name: "Environmental protection agency (sample)",
  date,
});
const TEL = (date: string): SourceInfo => ({
  name: "Telecom coverage registry (sample)",
  date,
});

export const LOCATIONS: LocationProfile[] = [
  {
    slug: "wuse-2-abuja",
    name: "Wuse 2",
    state: "FCT Abuja",
    country: "Nigeria",
    coords: [9.0765, 7.4686],
    tagline: "Dense central business and nightlife district of the capital.",
    overallScore: 78,
    summary:
      "Wuse 2 scores strongly on business potential, healthcare access and infrastructure, reflecting its role as Abuja's commercial core. Public safety indicators improved over the last two quarters while environment scores are held back by congestion, limited green cover and seasonal drainage flash-points.",
    quickFacts: [
      { label: "Population (district est.)", value: "≈ 182,000", source: NBS("Jun 2026") },
      { label: "Hospitals & clinics", value: "24 facilities", note: "3 general hospitals", source: OSM("Jul 2026") },
      { label: "Schools", value: "61 (public + private)", source: OSM("Jul 2026") },
      { label: "Registered businesses", value: "≈ 9,400", source: NBS("May 2026") },
      { label: "Cost of living index", value: "78 / 100 (high)", source: NBS("Jun 2026") },
      { label: "Avg. 1-bed rent", value: "₦2.8M / year", source: NBS("Jun 2026") },
      { label: "4G/5G coverage", value: "92% of area", source: TEL("Jul 2026") },
    ],
    environmentData: [
      { label: "Weather", value: "31°C avg · dry-season haze Nov–Feb", source: MET("Aug 2026") },
      { label: "Air quality (AQI)", value: "74 — Moderate", source: ENV("Aug 2026") },
      { label: "Water availability", value: "81% household access", note: "municipal + borehole", source: ENV("Jul 2026") },
      { label: "Flood risk", value: "Low–moderate", note: "flash flooding along drainage corridors", source: SEMA("Aug 2026") },
      { label: "Green cover", value: "18% of land area", source: ENV("Jun 2026") },
      { label: "Waste collection", value: "5 days / week municipal", source: ENV("Jul 2026") },
    ],
    categories: [
      { key: "publicSafety", score: 72, explanation: "Aggregated incident reports fell 8% quarter-on-quarter; theft and robbery are trending down, though traffic accidents rose 9% at major junctions." },
      { key: "healthcare", score: 81, explanation: "24 registered facilities within the district, including 3 general hospitals — one of the highest facility densities in the dataset." },
      { key: "weather", score: 68, explanation: "Hot season peaks in March–April; harmattan haze reduces air quality and visibility between November and February." },
      { key: "business", score: 88, explanation: "≈9,400 registered businesses, high foot traffic and strong evening economy support retail, hospitality and professional services." },
      { key: "infrastructure", score: 82, explanation: "Reliable grid power relative to national average, 92% 4G/5G coverage and well-maintained arterial roads." },
      { key: "environment", score: 64, explanation: "Only 18% green cover and recurring drainage flash-points during peak rainfall keep the environment score below the district's other categories." },
      { key: "transportation", score: 76, explanation: "Good arterial road access and ride-hailing availability; congestion at peak hours costs an estimated 22 minutes per trip." },
      { key: "education", score: 79, explanation: "61 schools plus proximity to federal tertiary institutions; strong private-school supply." },
      { key: "economic", score: 85, explanation: "High commercial rents signal strong demand; business registrations grew 6% over the previous period." },
      { key: "tourism", score: 62, explanation: "Restaurants, nightlife and events drive domestic visits, but few dedicated attractions limit international tourism." },
    ],
    incidents: [
      { type: "Theft", count: 142, previousCount: 158, period: "Q2 2026 vs Q1 2026", changePct: -10 },
      { type: "Burglary", count: 38, previousCount: 41, period: "Q2 2026 vs Q1 2026", changePct: -7 },
      { type: "Traffic accidents", count: 96, previousCount: 88, period: "Q2 2026 vs Q1 2026", changePct: 9 },
      { type: "Fire outbreaks", count: 7, previousCount: 5, period: "Q2 2026 vs Q1 2026", changePct: 40 },
      { type: "Robbery", count: 19, previousCount: 24, period: "Q2 2026 vs Q1 2026", changePct: -21 },
    ],
    monthlyIncidents: [
      { period: "Mar", count: 302 },
      { period: "Apr", count: 288 },
      { period: "May", count: 305 },
      { period: "Jun", count: 302 },
      { period: "Jul", count: 276 },
      { period: "Aug", count: 261 },
    ],
    trends: [
      { label: "Flood risk", metric: "flood", changePct: 12, reason: "Recent rainfall + drainage reports + historical flood patterns along the Aminu Kano corridor.", severity: "warning" },
      { label: "Traffic congestion", metric: "transport", changePct: 8, reason: "Increased vehicle registrations and construction diversions on two arterial routes.", severity: "info" },
      { label: "Economic activity", metric: "economic", changePct: 6, reason: "New business registrations and expanded evening-economy trading hours.", severity: "info" },
      { label: "Public safety incidents", metric: "incidents", changePct: -8, reason: "Aggregated incident reports declined across theft, burglary and robbery categories.", severity: "info" },
    ],
    twin: [
      { label: "Population", score: 74, changePct: 2 },
      { label: "Business Potential", score: 88, changePct: 4 },
      { label: "Healthcare", score: 81, changePct: 3 },
      { label: "Infrastructure", score: 82, changePct: 2 },
      { label: "Environment", score: 64, changePct: -3 },
      { label: "Public Safety", score: 72, changePct: 5 },
      { label: "Tourism", score: 62, changePct: 1 },
    ],
    recommendations: [
      { text: "Prioritise drainage inspection along the Aminu Kano corridor before peak rains.", priority: "high" },
      { text: "Expand waste collection frequency in high-density commercial blocks.", priority: "medium" },
      { text: "Optimise traffic signal timing at the two junctions with rising accident counts.", priority: "medium" },
    ],
  },
  {
    slug: "sabon-gari-kano",
    name: "Sabon Gari",
    state: "Kano State",
    country: "Nigeria",
    coords: [12.0022, 8.592],
    tagline: "Historic, densely populated commercial quarter of Kano.",
    overallScore: 61,
    summary:
      "Sabon Gari is one of northern Nigeria's busiest trading quarters — business potential and economic activity score high, but the district faces real pressure on infrastructure, environment and water availability. Market fire incidents and waste accumulation are the fastest-rising risk signals this period.",
    quickFacts: [
      { label: "Population (district est.)", value: "≈ 420,000", source: NBS("Jun 2026") },
      { label: "Hospitals & clinics", value: "14 facilities", source: OSM("Jul 2026") },
      { label: "Schools", value: "88 (public + private)", source: OSM("Jul 2026") },
      { label: "Registered businesses", value: "≈ 22,000", note: "commerce hub", source: NBS("May 2026") },
      { label: "Cost of living index", value: "52 / 100 (moderate)", source: NBS("Jun 2026") },
      { label: "Avg. 1-bed rent", value: "₦950K / year", source: NBS("Jun 2026") },
      { label: "4G coverage", value: "78% of area", source: TEL("Jul 2026") },
    ],
    environmentData: [
      { label: "Weather", value: "34°C avg · extreme heat Mar–May", source: MET("Aug 2026") },
      { label: "Air quality (AQI)", value: "118 — Unhealthy for sensitive groups", note: "dust / harmattan", source: ENV("Aug 2026") },
      { label: "Water availability", value: "63% household access", source: ENV("Jul 2026") },
      { label: "Flood risk", value: "High in wet season", note: "poor drainage capacity", source: SEMA("Aug 2026") },
      { label: "Green cover", value: "7% of land area", source: ENV("Jun 2026") },
      { label: "Waste collection", value: "Irregular (2–3 days / week)", source: ENV("Jul 2026") },
    ],
    categories: [
      { key: "publicSafety", score: 58, explanation: "Theft reports rose 15% and market fire outbreaks rose 83% quarter-on-quarter; robbery and traffic accidents are trending down." },
      { key: "healthcare", score: 55, explanation: "14 facilities serve ≈420,000 residents — roughly one facility per 30,000 people, well below the other dataset locations." },
      { key: "weather", score: 54, explanation: "Sustained extreme heat March–May and heavy harmattan dust reduce outdoor working hours and air quality." },
      { key: "business", score: 82, explanation: "≈22,000 registered businesses and dense market clusters make this one of the strongest commercial environments in the dataset." },
      { key: "infrastructure", score: 52, explanation: "Ageing road surfaces, irregular waste collection and 78% 4G coverage lag the district's commercial intensity." },
      { key: "environment", score: 44, explanation: "7% green cover, AQI 118 during dust season and high wet-season flood risk produce the weakest environment score in the dataset." },
      { key: "transportation", score: 60, explanation: "Strong regional bus links but severe intra-district congestion around market clusters at peak trading hours." },
      { key: "education", score: 58, explanation: "88 schools serve a very large youth population; classroom density is high relative to other locations." },
      { key: "economic", score: 80, explanation: "Wholesale and cross-border trade drive high transaction volumes; low operating costs attract new traders." },
      { key: "tourism", score: 48, explanation: "Cultural heritage and historic market architecture have potential, but visitor infrastructure is limited." },
    ],
    incidents: [
      { type: "Theft", count: 265, previousCount: 230, period: "Q2 2026 vs Q1 2026", changePct: 15 },
      { type: "Burglary", count: 74, previousCount: 70, period: "Q2 2026 vs Q1 2026", changePct: 6 },
      { type: "Traffic accidents", count: 141, previousCount: 152, period: "Q2 2026 vs Q1 2026", changePct: -7 },
      { type: "Fire outbreaks", count: 22, previousCount: 12, period: "Q2 2026 vs Q1 2026", changePct: 83 },
      { type: "Robbery", count: 41, previousCount: 45, period: "Q2 2026 vs Q1 2026", changePct: -9 },
    ],
    monthlyIncidents: [
      { period: "Mar", count: 512 },
      { period: "Apr", count: 498 },
      { period: "May", count: 530 },
      { period: "Jun", count: 543 },
      { period: "Jul", count: 559 },
      { period: "Aug", count: 541 },
    ],
    trends: [
      { label: "Market fire incidents", metric: "incidents", changePct: 83, reason: "Cluster of electrical fires in market rows + ageing wiring + high stocking density.", severity: "critical" },
      { label: "Waste accumulation", metric: "waste", changePct: 19, reason: "Collection frequency has not scaled with trading-volume growth around the market clusters.", severity: "warning" },
      { label: "Economic activity", metric: "economic", changePct: 9, reason: "New wholesale registrations and expanded cross-border trade flows.", severity: "info" },
      { label: "Water availability", metric: "water", changePct: -6, reason: "Borehole yield decline reported during the peak dry months.", severity: "warning" },
    ],
    twin: [
      { label: "Population", score: 88, changePct: 3 },
      { label: "Business Potential", score: 82, changePct: 3 },
      { label: "Healthcare", score: 55, changePct: 1 },
      { label: "Infrastructure", score: 52, changePct: 0 },
      { label: "Environment", score: 44, changePct: -4 },
      { label: "Public Safety", score: 58, changePct: -2 },
      { label: "Tourism", score: 48, changePct: 0 },
    ],
    recommendations: [
      { text: "Run fire-safety audits and wiring inspections across the market clusters immediately.", priority: "high" },
      { text: "Expand waste collection frequency around market clusters to daily pickup.", priority: "high" },
      { text: "Desilt drainage channels before the peak rains to reduce wet-season flooding.", priority: "high" },
      { text: "Rehabilitate community water points with reported yield decline.", priority: "medium" },
    ],
  },
  {
    slug: "ikeja-lagos",
    name: "Ikeja",
    state: "Lagos State",
    country: "Nigeria",
    coords: [6.6018, 3.3515],
    tagline: "Lagos State capital and its mainland commercial engine.",
    overallScore: 74,
    summary:
      "Ikeja combines the strongest economic activity in the dataset with solid healthcare, education and transport links. The dominant risks are environmental: seasonal flooding along low-lying corridors and chronic congestion around the interchange. Flood risk rose 15% this period and is flagged for attention.",
    quickFacts: [
      { label: "Population (district est.)", value: "≈ 390,000", source: NBS("Jun 2026") },
      { label: "Hospitals & clinics", value: "31 facilities", source: OSM("Jul 2026") },
      { label: "Schools", value: "120 (public + private)", source: OSM("Jul 2026") },
      { label: "Registered businesses", value: "≈ 31,000", source: NBS("May 2026") },
      { label: "Cost of living index", value: "84 / 100 (very high)", source: NBS("Jun 2026") },
      { label: "Avg. 1-bed rent", value: "₦3.5M / year", source: NBS("Jun 2026") },
      { label: "4G/5G coverage", value: "94% of area", source: TEL("Jul 2026") },
    ],
    environmentData: [
      { label: "Weather", value: "28°C avg · humid coastal climate", source: MET("Aug 2026") },
      { label: "Air quality (AQI)", value: "88 — Moderate", source: ENV("Aug 2026") },
      { label: "Water availability", value: "74% household access", source: ENV("Jul 2026") },
      { label: "Flood risk", value: "High (Jun–Sep)", note: "low-lying corridors", source: SEMA("Aug 2026") },
      { label: "Green cover", value: "12% of land area", source: ENV("Jun 2026") },
      { label: "Waste collection", value: "6 days / week municipal", source: ENV("Jul 2026") },
    ],
    categories: [
      { key: "publicSafety", score: 62, explanation: "Theft, burglary and robbery all declined, but traffic accidents rose 13% — concentrated around the interchange corridor." },
      { key: "healthcare", score: 76, explanation: "31 facilities including a teaching hospital give strong coverage, though demand pressure keeps waiting times elevated." },
      { key: "weather", score: 62, explanation: "Humid coastal climate with a pronounced rainy season; heat stress is moderate but persistent." },
      { key: "business", score: 90, explanation: "≈31,000 registered businesses, the highest in the dataset, across retail, aviation-linked services and tech." },
      { key: "infrastructure", score: 71, explanation: "94% network coverage and strong road grid; ageing drainage capacity is the main infrastructure gap." },
      { key: "environment", score: 55, explanation: "High flood exposure June–September, limited green cover and moderate AQI drag the score down." },
      { key: "transportation", score: 68, explanation: "Excellent regional connectivity including the airport, offset by severe peak-hour congestion." },
      { key: "education", score: 75, explanation: "120 schools and proximity to major tertiary institutions serve a large student population." },
      { key: "economic", score: 92, explanation: "Strongest economic activity score in the dataset; business registrations grew 7% over the previous period." },
      { key: "tourism", score: 70, explanation: "Business tourism, events and airport proximity drive steady visitor volumes year-round." },
    ],
    incidents: [
      { type: "Theft", count: 388, previousCount: 402, period: "Q2 2026 vs Q1 2026", changePct: -3 },
      { type: "Burglary", count: 96, previousCount: 104, period: "Q2 2026 vs Q1 2026", changePct: -8 },
      { type: "Traffic accidents", count: 214, previousCount: 189, period: "Q2 2026 vs Q1 2026", changePct: 13 },
      { type: "Robbery", count: 58, previousCount: 66, period: "Q2 2026 vs Q1 2026", changePct: -12 },
      { type: "Fire outbreaks", count: 14, previousCount: 11, period: "Q2 2026 vs Q1 2026", changePct: 27 },
    ],
    monthlyIncidents: [
      { period: "Mar", count: 742 },
      { period: "Apr", count: 758 },
      { period: "May", count: 731 },
      { period: "Jun", count: 770 },
      { period: "Jul", count: 782 },
      { period: "Aug", count: 755 },
    ],
    trends: [
      { label: "Flood risk", metric: "flood", changePct: 15, reason: "Heavy seasonal rainfall + drainage capacity limits + historical flood-plain exposure.", severity: "critical" },
      { label: "Traffic congestion", metric: "transport", changePct: 11, reason: "Interchange corridor construction and rising vehicle volumes at peak hours.", severity: "warning" },
      { label: "Business registrations", metric: "economic", changePct: 7, reason: "Continued commercial in-migration from other Lagos districts.", severity: "info" },
      { label: "Air quality", metric: "air", changePct: -3, reason: "Slight improvement following generator-emission enforcement actions.", severity: "info" },
    ],
    twin: [
      { label: "Population", score: 84, changePct: 1 },
      { label: "Business Potential", score: 90, changePct: 3 },
      { label: "Healthcare", score: 76, changePct: 2 },
      { label: "Infrastructure", score: 71, changePct: 1 },
      { label: "Environment", score: 55, changePct: -5 },
      { label: "Public Safety", score: 62, changePct: 3 },
      { label: "Tourism", score: 70, changePct: 2 },
    ],
    recommendations: [
      { text: "Prioritise drainage expansion in the identified flood corridors before September peak.", priority: "high" },
      { text: "Pre-position emergency response units during peak rainfall months.", priority: "high" },
      { text: "Expand traffic management and signal priority around the interchange corridor.", priority: "medium" },
    ],
  },
  {
    slug: "enugu",
    name: "Enugu",
    state: "Enugu State",
    country: "Nigeria",
    coords: [6.5244, 7.5086],
    tagline: "The Coal City — hilly, calm and steadily modernising.",
    overallScore: 69,
    summary:
      "Enugu pairs the dataset's best public-safety trend with a comparatively healthy environment and moderate cost of living. Infrastructure and economic activity lag the larger metros, and gully erosion in the hills is the signature environmental risk, up 9% this period.",
    quickFacts: [
      { label: "Population (metro est.)", value: "≈ 310,000", source: NBS("Jun 2026") },
      { label: "Hospitals & clinics", value: "17 facilities", source: OSM("Jul 2026") },
      { label: "Schools", value: "95 (public + private)", source: OSM("Jul 2026") },
      { label: "Registered businesses", value: "≈ 8,100", source: NBS("May 2026") },
      { label: "Cost of living index", value: "55 / 100 (moderate)", source: NBS("Jun 2026") },
      { label: "Avg. 1-bed rent", value: "₦1.2M / year", source: NBS("Jun 2026") },
      { label: "4G coverage", value: "83% of area", source: TEL("Jul 2026") },
    ],
    environmentData: [
      { label: "Weather", value: "27°C avg · mild highland climate", source: MET("Aug 2026") },
      { label: "Air quality (AQI)", value: "61 — Moderate", note: "best in dataset", source: ENV("Aug 2026") },
      { label: "Water availability", value: "69% household access", source: ENV("Jul 2026") },
      { label: "Flood / erosion risk", value: "Moderate", note: "gully erosion zones on escarpment", source: SEMA("Aug 2026") },
      { label: "Green cover", value: "24% of land area", source: ENV("Jun 2026") },
      { label: "Waste collection", value: "4 days / week municipal", source: ENV("Jul 2026") },
    ],
    categories: [
      { key: "publicSafety", score: 74, explanation: "Best safety trend in the dataset: robbery down 17%, traffic accidents down 10%, with stable low incident volumes." },
      { key: "healthcare", score: 68, explanation: "17 facilities including a teaching hospital; coverage thins toward the outskirts of the metro area." },
      { key: "weather", score: 71, explanation: "Mild highland temperatures and lower heat stress than the northern and coastal locations." },
      { key: "business", score: 66, explanation: "Growing services sector and low operating costs, but smaller consumer market than Lagos, Kano or Abuja." },
      { key: "infrastructure", score: 60, explanation: "Road condition deterioration (+6%) and intermittent water supply hold back otherwise improving infrastructure." },
      { key: "environment", score: 72, explanation: "Best air quality and highest green cover in the dataset, tempered by active gully-erosion corridors." },
      { key: "transportation", score: 62, explanation: "Manageable congestion and improving road links, though hilly terrain slows some corridors." },
      { key: "education", score: 74, explanation: "95 schools plus a major university presence give strong education access." },
      { key: "economic", score: 63, explanation: "Steady 4% growth in economic activity; civil-service and services-led economy." },
      { key: "tourism", score: 66, explanation: "Waterfalls, hills and cultural festivals give genuine tourism appeal with improving visitor facilities." },
    ],
    incidents: [
      { type: "Theft", count: 121, previousCount: 118, period: "Q2 2026 vs Q1 2026", changePct: 3 },
      { type: "Burglary", count: 33, previousCount: 36, period: "Q2 2026 vs Q1 2026", changePct: -8 },
      { type: "Traffic accidents", count: 64, previousCount: 71, period: "Q2 2026 vs Q1 2026", changePct: -10 },
      { type: "Robbery", count: 15, previousCount: 18, period: "Q2 2026 vs Q1 2026", changePct: -17 },
      { type: "Fire outbreaks", count: 6, previousCount: 6, period: "Q2 2026 vs Q1 2026", changePct: 0 },
    ],
    monthlyIncidents: [
      { period: "Mar", count: 236 },
      { period: "Apr", count: 229 },
      { period: "May", count: 244 },
      { period: "Jun", count: 239 },
      { period: "Jul", count: 228 },
      { period: "Aug", count: 219 },
    ],
    trends: [
      { label: "Gully erosion risk", metric: "flood", changePct: 9, reason: "Active erosion corridors on the escarpment + intense runoff events recorded this season.", severity: "warning" },
      { label: "Road condition", metric: "transport", changePct: 6, reason: "Deterioration reported on two arterial corridors feeding the city centre.", severity: "warning" },
      { label: "Economic activity", metric: "economic", changePct: 4, reason: "Growth in services registrations and hospitality openings.", severity: "info" },
      { label: "Public safety incidents", metric: "incidents", changePct: -5, reason: "Aggregated reports declined, continuing a three-quarter downward trend.", severity: "info" },
    ],
    twin: [
      { label: "Population", score: 62, changePct: 1 },
      { label: "Business Potential", score: 66, changePct: 3 },
      { label: "Healthcare", score: 68, changePct: 2 },
      { label: "Infrastructure", score: 60, changePct: -2 },
      { label: "Environment", score: 72, changePct: -2 },
      { label: "Public Safety", score: 74, changePct: 3 },
      { label: "Tourism", score: 66, changePct: 2 },
    ],
    recommendations: [
      { text: "Commission erosion-control works in the identified gully corridors.", priority: "high" },
      { text: "Fund resurfacing of the two deteriorating arterial corridors.", priority: "medium" },
      { text: "Expand primary healthcare coverage toward the metro outskirts.", priority: "medium" },
    ],
  },
  {
    slug: "port-harcourt",
    name: "Port Harcourt",
    state: "Rivers State",
    country: "Nigeria",
    coords: [4.8156, 7.0498],
    tagline: "Garden City and hub of Nigeria's oil economy.",
    overallScore: 66,
    summary:
      "Port Harcourt has strong business potential anchored in the energy sector and good education access, but it carries the dataset's most severe environmental signal: soot-driven air pollution, up 21% this period and flagged critical. Flood risk in waterfront communities is the second major watch item.",
    quickFacts: [
      { label: "Population (metro est.)", value: "≈ 540,000", source: NBS("Jun 2026") },
      { label: "Hospitals & clinics", value: "26 facilities", source: OSM("Jul 2026") },
      { label: "Schools", value: "140 (public + private)", source: OSM("Jul 2026") },
      { label: "Registered businesses", value: "≈ 18,500", source: NBS("May 2026") },
      { label: "Cost of living index", value: "71 / 100 (high)", source: NBS("Jun 2026") },
      { label: "Avg. 1-bed rent", value: "₦1.9M / year", source: NBS("Jun 2026") },
      { label: "4G/5G coverage", value: "88% of area", source: TEL("Jul 2026") },
    ],
    environmentData: [
      { label: "Weather", value: "27°C avg · very humid, long rainy season", source: MET("Aug 2026") },
      { label: "Air quality (AQI)", value: "132 — Unhealthy for sensitive groups", note: "soot / particulates", source: ENV("Aug 2026") },
      { label: "Water availability", value: "66% household access", source: ENV("Jul 2026") },
      { label: "Flood risk", value: "High", note: "waterfront and low-lying communities", source: SEMA("Aug 2026") },
      { label: "Green cover", value: "15% of land area", source: ENV("Jun 2026") },
      { label: "Waste collection", value: "4 days / week municipal", source: ENV("Jul 2026") },
    ],
    categories: [
      { key: "publicSafety", score: 60, explanation: "Theft rose 8% while robbery fell 10%; fire incidents doubled from a small base, concentrated in informal settlements." },
      { key: "healthcare", score: 70, explanation: "26 facilities including specialist centres serving the wider South-South region." },
      { key: "weather", score: 58, explanation: "Very long rainy season and persistent humidity increase flood exposure and limit outdoor activity windows." },
      { key: "business", score: 79, explanation: "Energy-sector demand supports high-value services; operating costs are high but so are margins." },
      { key: "infrastructure", score: 63, explanation: "88% network coverage and good arterial roads; drainage and flood defences lag in waterfront areas." },
      { key: "environment", score: 42, explanation: "Weakest in dataset alongside Sabon Gari: AQI 132 from soot, high flood risk and limited waste coverage." },
      { key: "transportation", score: 61, explanation: "Port and airport connectivity is strong; urban congestion and wet-season road degradation are persistent." },
      { key: "education", score: 71, explanation: "140 schools and multiple universities give the city deep education capacity." },
      { key: "economic", score: 78, explanation: "Oil and gas anchor the economy; activity grew 3% despite environmental headwinds." },
      { key: "tourism", score: 58, explanation: "Cultural festivals and waterfront heritage have appeal, but air quality concerns suppress leisure visits." },
    ],
    incidents: [
      { type: "Theft", count: 298, previousCount: 276, period: "Q2 2026 vs Q1 2026", changePct: 8 },
      { type: "Burglary", count: 88, previousCount: 92, period: "Q2 2026 vs Q1 2026", changePct: -4 },
      { type: "Traffic accidents", count: 132, previousCount: 128, period: "Q2 2026 vs Q1 2026", changePct: 3 },
      { type: "Robbery", count: 64, previousCount: 71, period: "Q2 2026 vs Q1 2026", changePct: -10 },
      { type: "Fire outbreaks", count: 18, previousCount: 9, period: "Q2 2026 vs Q1 2026", changePct: 100 },
    ],
    monthlyIncidents: [
      { period: "Mar", count: 588 },
      { period: "Apr", count: 574 },
      { period: "May", count: 601 },
      { period: "Jun", count: 612 },
      { period: "Jul", count: 590 },
      { period: "Aug", count: 600 },
    ],
    trends: [
      { label: "Air pollution (soot)", metric: "air", changePct: 21, reason: "Rising particulate readings + artisanal refining reports + seasonal atmospheric conditions.", severity: "critical" },
      { label: "Flood risk", metric: "flood", changePct: 10, reason: "Above-average rainfall + tidal influence on waterfront drainage + historical flood patterns.", severity: "warning" },
      { label: "Fire incidents", metric: "incidents", changePct: 100, reason: "Doubled from a small base, concentrated in informal settlements with limited fire-service access.", severity: "critical" },
      { label: "Economic activity", metric: "economic", changePct: 3, reason: "Energy-sector services growth offset by logistics cost increases.", severity: "info" },
    ],
    twin: [
      { label: "Population", score: 82, changePct: 2 },
      { label: "Business Potential", score: 79, changePct: 2 },
      { label: "Healthcare", score: 70, changePct: 2 },
      { label: "Infrastructure", score: 63, changePct: 1 },
      { label: "Environment", score: 42, changePct: -6 },
      { label: "Public Safety", score: 60, changePct: 1 },
      { label: "Tourism", score: 58, changePct: 0 },
    ],
    recommendations: [
      { text: "Scale up air-quality monitoring and enforce against soot emission sources.", priority: "high" },
      { text: "Deploy flood early-warning for waterfront communities ahead of peak rains.", priority: "high" },
      { text: "Increase waste collection frequency and fire-service coverage in informal settlements.", priority: "medium" },
    ],
  },
];

export function getLocation(slug: string): LocationProfile | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}

export function searchLocations(query: string): LocationProfile[] {
  const q = query.trim().toLowerCase();
  if (!q) return LOCATIONS;
  return LOCATIONS.filter(
    (l) =>
      l.name.toLowerCase().includes(q) ||
      l.state.toLowerCase().includes(q) ||
      `${l.name} ${l.state}`.toLowerCase().includes(q),
  );
}

export function scoreTone(score: number): "high" | "mid" | "low" {
  if (score >= 72) return "high";
  if (score >= 55) return "mid";
  return "low";
}
