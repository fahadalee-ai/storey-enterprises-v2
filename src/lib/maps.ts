import { createServerFn } from "@tanstack/react-start";
import { business } from "@/config/business";

export type AddressSuggestion = { id: string; label: string; main: string };
export type ResolvedAddress = { label: string; name: string; lat: number; lng: number };

function mapsKey() {
  return process.env["GOOGLE_MAPS_API_KEY"]?.trim() ?? "";
}

async function mapsGet(path: string, params: Record<string, string>) {
  const key = mapsKey();
  if (!key) return null;
  const url = new URL(`https://maps.googleapis.com${path}`);
  url.searchParams.set("key", key);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) return null;
  return (await response.json()) as { status?: string; error_message?: string; [key: string]: unknown };
}

export const suggestAddresses = createServerFn({ method: "POST" })
  .validator((data: { query: string }) => ({ query: data.query.trim() }))
  .handler(async ({ data }) => {
    if (data.query.length < 3) return { configured: Boolean(mapsKey()), suggestions: [] as AddressSuggestion[] };
    const json = await mapsGet("/maps/api/place/autocomplete/json", {
      input: data.query,
      components: "country:us",
      location: `${business.origin.lat},${business.origin.lng}`,
      radius: "321869",
    });
    if (!json) return { configured: false, suggestions: [] as AddressSuggestion[] };
    const predictions = Array.isArray(json.predictions) ? json.predictions : [];
    const suggestions = predictions.slice(0, 5).flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const row = item as { place_id?: string; description?: string; structured_formatting?: { main_text?: string } };
      if (!row.place_id || !row.description) return [];
      return [{ id: row.place_id, label: row.description, main: row.structured_formatting?.main_text || row.description }];
    });
    return { configured: true, suggestions };
  });

export const placeDetails = createServerFn({ method: "POST" })
  .validator((data: { placeId: string }) => ({ placeId: data.placeId }))
  .handler(async ({ data }) => {
    const json = await mapsGet("/maps/api/place/details/json", {
      place_id: data.placeId,
      fields: "geometry,formatted_address,name",
    });
    return readResolved(json?.result);
  });

export const geocodeAddress = createServerFn({ method: "POST" })
  .validator((data: { address: string }) => ({ address: data.address.trim() }))
  .handler(async ({ data }) => {
    if (data.address.length < 8) return null;
    const json = await mapsGet("/maps/api/geocode/json", { address: data.address, region: "us" });
    const results = Array.isArray(json?.results) ? json.results : [];
    return readResolved(results[0]);
  });

export const drivingDistance = createServerFn({ method: "POST" })
  .validator((data: { originLat: number; originLng: number; destLat: number; destLng: number }) => data)
  .handler(async ({ data }) => {
    const json = await mapsGet("/maps/api/distancematrix/json", {
      origins: `${data.originLat},${data.originLng}`,
      destinations: `${data.destLat},${data.destLng}`,
      units: "imperial",
      mode: "driving",
    });
    const rows = Array.isArray(json?.rows) ? json.rows : [];
    const first = rows[0] as { elements?: Array<{ status?: string; distance?: { value?: number } }> } | undefined;
    const element = first?.elements?.[0];
    const meters = element?.status === "OK" ? element.distance?.value : undefined;
    if (meters == null) return { miles: null as number | null };
    return { miles: Math.max(1, Math.round(meters / 1609.344)) };
  });

function readResolved(value: unknown): ResolvedAddress | null {
  if (!value || typeof value !== "object") return null;
  const row = value as {
    formatted_address?: string;
    name?: string;
    geometry?: { location?: { lat?: number; lng?: number } };
  };
  const lat = row.geometry?.location?.lat;
  const lng = row.geometry?.location?.lng;
  if (lat == null || lng == null || !row.formatted_address) return null;
  return { label: row.formatted_address, name: row.name || "", lat, lng };
}
