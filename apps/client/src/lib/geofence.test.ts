import { describe, expect, it } from "vitest";
import {
  BASE_FAR_FEE_XAF,
  NEAR_RADIUS_KM,
  PER_KM_RATE_XAF,
  TRANSPORT_FEE_XAF,
  classifyZone,
  estimateTransportFee,
  haversineDistanceKm
} from "@/lib/geofence";

describe("haversineDistanceKm", () => {
  it("is zero for identical points", () => {
    expect(haversineDistanceKm({ lat: 4.05, lng: 9.71 }, { lat: 4.05, lng: 9.71 })).toBeCloseTo(0, 6);
  });

  it("measures roughly 111km per degree of latitude", () => {
    expect(haversineDistanceKm({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(111.19, 1);
  });
});

describe("classifyZone", () => {
  it("is UNKNOWN without a distance", () => {
    expect(classifyZone(null)).toBe("UNKNOWN");
  });

  it("is NEAR up to the radius and FAR beyond it", () => {
    expect(classifyZone(NEAR_RADIUS_KM)).toBe("NEAR");
    expect(classifyZone(NEAR_RADIUS_KM + 0.1)).toBe("FAR");
  });
});

describe("estimateTransportFee", () => {
  it("falls back to the flat fee when the distance is unknown", () => {
    expect(estimateTransportFee(null)).toBe(TRANSPORT_FEE_XAF);
  });

  it("is free within the near radius", () => {
    expect(estimateTransportFee(NEAR_RADIUS_KM)).toBe(0);
  });

  it("charges the base fee plus a per-km rate beyond the radius, rounded to 100 XAF", () => {
    const distance = NEAR_RADIUS_KM + 10;
    const expected = Math.round((BASE_FAR_FEE_XAF + PER_KM_RATE_XAF * 10) / 100) * 100;
    expect(estimateTransportFee(distance)).toBe(expected);
  });
});
