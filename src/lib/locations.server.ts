import { supabase } from "@/integrations/supabase/client";
import { LOCATIONS as MOCK, type LocationProfile } from "./locations";

/**
 * Data access layer with Supabase fallback to mock.
 * Tries to fetch from public.locations; if table missing/empty/error, returns mock.
 */
export async function fetchLocations(): Promise<LocationProfile[]> {
  try {
    const { data, error } = await supabase.from("locations" as never).select("*");
    if (error || !data || (Array.isArray(data) && data.length === 0)) return MOCK;
    // Map DB rows back to LocationProfile — data column holds full profile
    const rows = data as unknown as Array<{ slug: string; data: LocationProfile }>;
    if (rows[0]?.data?.slug) return rows.map((r) => r.data);
    return MOCK;
  } catch {
    return MOCK;
  }
}

export async function fetchLocation(slug: string): Promise<LocationProfile | undefined> {
  try {
    const { data, error } = await supabase.from("locations" as never).select("*").eq("slug" as never, slug).maybeSingle();
    if (error || !data) {
      // fallback to mock
      return MOCK.find((l) => l.slug === slug);
    }
    const row = data as unknown as { data: LocationProfile; slug: string };
    if (row?.data?.slug) return row.data;
    return MOCK.find((l) => l.slug === slug);
  } catch {
    return MOCK.find((l) => l.slug === slug);
  }
}

// Seed helper: call once from admin to populate DB from mock (idempotent via upsert)
export async function seedLocationsIfEmpty(): Promise<{ seeded: number }> {
  try {
    const { data } = await supabase.from("locations" as never).select("slug");
    if (Array.isArray(data) && data.length > 0) return { seeded: 0 };
    let count = 0;
    for (const loc of MOCK) {
      const { error } = await supabase.from("locations" as never).upsert({
        slug: loc.slug,
        name: loc.name,
        state: loc.state,
        country: loc.country,
        lat: loc.coords[0],
        lng: loc.coords[1],
        overall_score: loc.overallScore,
        tagline: loc.tagline,
        summary: loc.summary,
        data: loc as unknown as never,
      } as never);
      if (!error) count++;
    }
    return { seeded: count };
  } catch {
    return { seeded: 0 };
  }
}
