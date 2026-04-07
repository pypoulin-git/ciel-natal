export interface CityResult {
  name: string;
  lat: number;
  lon: number;
  display: string;
}

export interface UserLocation {
  lat: number;
  lon: number;
}

// ─── City Search (Nominatim + GeoNames fallback) ─────────────────
// If userLocation is provided, results near the user are prioritized.
// Otherwise, Canada is prioritized first, then global results.
export class CitySearchError extends Error {
  constructor(message: string, public readonly code: "timeout" | "network" | "no_results") {
    super(message);
    this.name = "CitySearchError";
  }
}

function fetchWithTimeout(url: string, headers: Record<string, string>, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { headers, signal: controller.signal }).finally(() => clearTimeout(timer));
}

export async function searchCities(
  query: string,
  userLocation?: UserLocation | null
): Promise<CityResult[]> {
  if (query.length < 2) return [];

  const headers = { "User-Agent": "CielNatal/1.0" };

  // Helper to parse Nominatim results
  const parseNominatim = (
    data: Array<{
      display_name: string;
      lat: string;
      lon: string;
      class: string;
      address?: {
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        state?: string;
        country?: string;
        country_code?: string;
      };
    }>
  ): CityResult[] =>
    data
      .filter((r) => r.class === "place" || r.class === "boundary")
      .map((r) => {
        const name =
          r.address?.city ||
          r.address?.town ||
          r.address?.village ||
          r.address?.municipality ||
          r.display_name.split(",")[0];
        return {
          name,
          lat: parseFloat(r.lat),
          lon: parseFloat(r.lon),
          display: [name, r.address?.state, r.address?.country]
            .filter(Boolean)
            .join(", "),
          _cc: r.address?.country_code?.toLowerCase() || "",
        };
      });

  // Dedup helper
  const dedup = (results: CityResult[]): CityResult[] => {
    const seen = new Set<string>();
    return results.filter((r) => {
      const key = r.display.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Merge without near-duplicates
  const mergeUnique = (
    base: CityResult[],
    extra: CityResult[]
  ): CityResult[] => {
    const merged = [...base];
    for (const m of extra) {
      if (
        !merged.some(
          (r) =>
            Math.abs(r.lat - m.lat) < 0.01 && Math.abs(r.lon - m.lon) < 0.01
        )
      ) {
        merged.push(m);
      }
    }
    return merged;
  };

  // Distance helper for sorting (Haversine approx in km)
  const distKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  try {
    let allResults: CityResult[] = [];

    if (userLocation) {
      // ── Strategy A: user location known → viewbox bias ──
      // Create a ~500km bounding box around user
      const delta = 4.5; // ~500km in degrees
      const viewbox = [
        userLocation.lon - delta,
        userLocation.lat + delta,
        userLocation.lon + delta,
        userLocation.lat - delta,
      ].join(",");

      // 1. Search with viewbox bias (bounded=0 means prefer, not restrict)
      const res = await fetchWithTimeout(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&accept-language=fr&addressdetails=1&featuretype=city&viewbox=${viewbox}&bounded=0`,
        headers
      );
      if (res.ok) {
        allResults = parseNominatim(await res.json());
      }

      // 2. Also search globally if few results
      if (allResults.length < 4) {
        const res2 = await fetchWithTimeout(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&accept-language=fr&addressdetails=1`,
          headers
        );
        if (res2.ok) {
          allResults = mergeUnique(allResults, parseNominatim(await res2.json()));
        }
      }

      // Sort by distance from user
      allResults.sort(
        (a, b) =>
          distKm(userLocation.lat, userLocation.lon, a.lat, a.lon) -
          distKm(userLocation.lat, userLocation.lon, b.lat, b.lon)
      );
    } else {
      // ── Strategy B: no location → Canada first, then global ──

      // 1. Search Canada specifically
      const resCa = await fetchWithTimeout(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=fr&addressdetails=1&featuretype=city&countrycodes=ca`,
        headers
      );
      if (resCa.ok) {
        allResults = parseNominatim(await resCa.json());
      }

      // 2. Global search to fill the rest
      const resGl = await fetchWithTimeout(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&accept-language=fr&addressdetails=1&featuretype=city`,
        headers
      );
      if (resGl.ok) {
        const global = parseNominatim(await resGl.json());
        allResults = mergeUnique(allResults, global);
      }
    }

    // If still few, try without featuretype restriction (villages/hamlets)
    if (allResults.length < 3) {
      const extra = userLocation
        ? `&viewbox=${[
            userLocation.lon - 4.5,
            userLocation.lat + 4.5,
            userLocation.lon + 4.5,
            userLocation.lat - 4.5,
          ].join(",")}&bounded=0`
        : "";
      const res3 = await fetchWithTimeout(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&accept-language=fr&addressdetails=1${extra}`,
        headers
      );
      if (res3.ok) {
        allResults = mergeUnique(allResults, parseNominatim(await res3.json()));
      }
    }

    const final = dedup(allResults).slice(0, 6);
    if (final.length === 0) {
      throw new CitySearchError("No results found", "no_results");
    }
    return final;
  } catch (err) {
    if (err instanceof CitySearchError) throw err;
    const isAbort = err instanceof DOMException && err.name === "AbortError";
    if (isAbort) throw new CitySearchError("Request timed out", "timeout");
    // Nominatim failed — try GeoNames fallback
  }

  // Fallback: GeoNames free API
  try {
    const countryBias = userLocation
      ? ""
      : "&country=CA";
    const res = await fetchWithTimeout(
      `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(query)}&maxRows=6&lang=fr&featureClass=P&username=cielnatal${countryBias}`,
      {}
    );
    if (res.ok) {
      const data = await res.json();
      const results = (data.geonames || []).map(
        (r: {
          name: string;
          lat: string;
          lng: string;
          adminName1?: string;
          countryName?: string;
        }) => ({
          name: r.name,
          lat: parseFloat(r.lat),
          lon: parseFloat(r.lng),
          display: [r.name, r.adminName1, r.countryName]
            .filter(Boolean)
            .join(", "),
        })
      );
      if (results.length === 0) throw new CitySearchError("No results found", "no_results");
      return results;
    }
  } catch (err) {
    if (err instanceof CitySearchError) throw err;
    // Both failed
  }
  throw new CitySearchError("Network error", "network");
}
