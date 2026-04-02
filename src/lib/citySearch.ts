export interface CityResult {
  name: string;
  lat: number;
  lon: number;
  display: string;
}

// ─── City Search (Nominatim + GeoNames fallback) ─────────────────
export async function searchCities(query: string): Promise<CityResult[]> {
  if (query.length < 2) return [];

  // Helper to parse Nominatim results
  const parseNominatim = (data: Array<{
    display_name: string; lat: string; lon: string; class: string;
    address?: { city?: string; town?: string; village?: string; municipality?: string; state?: string; country?: string };
  }>): CityResult[] =>
    data
      .filter((r) => r.class === "place" || r.class === "boundary")
      .map((r) => {
        const name = r.address?.city || r.address?.town || r.address?.village || r.address?.municipality || r.display_name.split(",")[0];
        return {
          name,
          lat: parseFloat(r.lat),
          lon: parseFloat(r.lon),
          display: [name, r.address?.state, r.address?.country].filter(Boolean).join(", "),
        };
      });

  try {
    // Primary: broad search with featuretype=city for better ranking
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&accept-language=fr&addressdetails=1&featuretype=city`,
      { headers: { "User-Agent": "CielNatal/1.0" } }
    );
    if (res.ok) {
      const data = await res.json();
      let results = parseNominatim(data);
      // If few results, try without featuretype restriction (catches villages/hamlets)
      if (results.length < 3) {
        const res2 = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&accept-language=fr&addressdetails=1`,
          { headers: { "User-Agent": "CielNatal/1.0" } }
        );
        if (res2.ok) {
          const data2 = await res2.json();
          const more = parseNominatim(data2);
          // Merge, deduplicate by lat/lon proximity
          for (const m of more) {
            if (!results.some((r) => Math.abs(r.lat - m.lat) < 0.01 && Math.abs(r.lon - m.lon) < 0.01)) {
              results.push(m);
            }
          }
        }
      }
      // Deduplicate by name+country
      const seen = new Set<string>();
      results = results.filter((r) => {
        const key = r.display.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return results.slice(0, 6);
    }
  } catch {
    // Nominatim failed, try fallback
  }

  // Fallback: GeoNames free API
  try {
    const res = await fetch(
      `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(query)}&maxRows=6&lang=fr&featureClass=P&username=cielnatal`
    );
    if (res.ok) {
      const data = await res.json();
      return (data.geonames || []).map((r: { name: string; lat: string; lng: string; adminName1?: string; countryName?: string }) => ({
        name: r.name,
        lat: parseFloat(r.lat),
        lon: parseFloat(r.lng),
        display: [r.name, r.adminName1, r.countryName].filter(Boolean).join(", "),
      }));
    }
  } catch {
    // Both failed
  }
  return [];
}
