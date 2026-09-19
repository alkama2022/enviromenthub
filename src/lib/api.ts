import { createServerFn } from "@tanstack/react-start";
import { LOCATIONS, getLocation } from "./locations";
import { PLACES, placesForLocation } from "./places";

// Public read-only API via server functions — complements REST if needed
export const apiListLocations = createServerFn({ method: "GET" }).handler(async () => {
  return LOCATIONS.map((l) => ({ slug: l.slug, name: l.name, state: l.state, coords: l.coords, overallScore: l.overallScore }));
});

export const apiGetLocation = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const slug = (data as { slug?: unknown })?.slug;
    if (typeof slug !== "string" || !slug) throw new Error("slug required");
    return { slug };
  })
  .handler(async ({ data }) => {
    const loc = getLocation(data.slug);
    if (!loc) throw new Error("Location not found");
    return loc;
  });

export const apiPlacesForLocation = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const slug = (data as { slug?: unknown })?.slug;
    if (typeof slug !== "string" || !slug) throw new Error("slug required");
    return { slug };
  })
  .handler(async ({ data }) => {
    return placesForLocation(data.slug);
  });

export const apiAllPlaces = createServerFn({ method: "GET" }).handler(async () => PLACES);
