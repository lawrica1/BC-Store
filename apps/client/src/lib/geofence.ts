export interface Coordinates {
  lat: number;
  lng: number;
}

// Falls back to the real BC Store pin (Plus Code 3P58+JV6 Douala) if NEXT_PUBLIC_STORE_LATITUDE/LONGITUDE aren't set in .env.
const envLat = Number(process.env.NEXT_PUBLIC_STORE_LATITUDE);
const envLng = Number(process.env.NEXT_PUBLIC_STORE_LONGITUDE);

export const STORE_COORDINATES: Coordinates =
  Number.isFinite(envLat) && Number.isFinite(envLng) ? { lat: envLat, lng: envLng } : { lat: 4.059038, lng: 9.717141 };

export const NEAR_RADIUS_KM = 5;

// Beyond this, treat the customer as outside the store's city entirely (shown as a distinct map warning).
export const OUT_OF_TOWN_RADIUS_KM = 30;

// Base dispatch fee once outside NEAR_RADIUS_KM, plus a per-km rate for the extra distance — placeholders, edit here.
export const BASE_FAR_FEE_XAF = 1000;
export const PER_KM_RATE_XAF = 300;

// Fallback fee used when the distance can't be determined (denied/unsupported/error) — treated as "far" by default.
export const TRANSPORT_FEE_XAF = 2000;

export type GeofenceZone = "NEAR" | "FAR" | "UNKNOWN";

export function haversineDistanceKm(a: Coordinates, b: Coordinates) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function classifyZone(distanceKm: number | null): GeofenceZone {
  if (distanceKm === null) return "UNKNOWN";
  return distanceKm <= NEAR_RADIUS_KM ? "NEAR" : "FAR";
}

// Distance-based estimate: free within the radius, then a base dispatch fee plus a per-km rate for the extra
// distance, rounded to the nearest 100 XAF. Falls back to the flat TRANSPORT_FEE_XAF when distance is unknown.
export function estimateTransportFee(distanceKm: number | null) {
  if (distanceKm === null) return TRANSPORT_FEE_XAF;
  if (distanceKm <= NEAR_RADIUS_KM) return 0;

  const extraKm = distanceKm - NEAR_RADIUS_KM;
  const rawFee = BASE_FAR_FEE_XAF + PER_KM_RATE_XAF * extraKm;
  return Math.round(rawFee / 100) * 100;
}
