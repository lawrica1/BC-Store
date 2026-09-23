"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Coordinates } from "@/lib/geofence";

interface LocationMapProps {
  storeCoords: Coordinates;
  userCoords: Coordinates;
  userAccuracyMeters: number | null;
  radiusKm: number;
  storeLabel: string;
  userLabel: string;
}

export function LocationMap({ storeCoords, userCoords, userAccuracyMeters, radiusKm, storeLabel, userLabel }: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, { attributionControl: true, zoomControl: true });
    mapRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap contributors © CARTO",
      maxZoom: 19
    }).addTo(map);

    const storePoint = L.latLng(storeCoords.lat, storeCoords.lng);
    const userPoint = L.latLng(userCoords.lat, userCoords.lng);

    L.circleMarker(storePoint, { radius: 9, color: "#00E5FF", fillColor: "#00E5FF", fillOpacity: 0.9, weight: 2 })
      .addTo(map)
      .bindTooltip(storeLabel, { permanent: true, direction: "top", offset: [0, -10], className: "bc-map-label" });

    // Accuracy halo around the user's exact reported position, like a standard "you are here" GPS indicator.
    if (userAccuracyMeters && userAccuracyMeters > 0) {
      L.circle(userPoint, {
        radius: userAccuracyMeters,
        color: "#FF6B35",
        weight: 1,
        fillColor: "#FF6B35",
        fillOpacity: 0.12
      }).addTo(map);
    }

    L.circleMarker(userPoint, { radius: 8, color: "#FF6B35", fillColor: "#FF6B35", fillOpacity: 1, weight: 3 })
      .addTo(map)
      .bindTooltip(userLabel, { permanent: true, direction: "top", offset: [0, -10], className: "bc-map-label" });

    L.circle(storePoint, {
      radius: radiusKm * 1000,
      color: "#00E5FF",
      weight: 1,
      dashArray: "4 6",
      fillColor: "#00E5FF",
      fillOpacity: 0.05
    }).addTo(map);

    const bounds = L.latLngBounds([storePoint, userPoint]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });

    const resizeTimer = setTimeout(() => map.invalidateSize(), 100);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      mapRef.current = null;
    };
  }, [storeCoords.lat, storeCoords.lng, userCoords.lat, userCoords.lng, userAccuracyMeters, radiusKm, storeLabel, userLabel]);

  return <div ref={containerRef} className="h-64 w-full overflow-hidden rounded-2xl border border-borderTech" />;
}
