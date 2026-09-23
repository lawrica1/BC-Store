"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Coordinates } from "@/lib/geofence";

interface StoreMapProps {
  storeCoords: Coordinates;
  storeLabel: string;
}

export function StoreMap({ storeCoords, storeLabel }: StoreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, { attributionControl: true, zoomControl: true });
    const storePoint = L.latLng(storeCoords.lat, storeCoords.lng);
    map.setView(storePoint, 16);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap contributors © CARTO",
      maxZoom: 19
    }).addTo(map);

    L.circleMarker(storePoint, { radius: 9, color: "#00E5FF", fillColor: "#00E5FF", fillOpacity: 0.9, weight: 2 })
      .addTo(map)
      .bindTooltip(storeLabel, { permanent: true, direction: "top", offset: [0, -10], className: "bc-map-label" });

    const resizeTimer = setTimeout(() => map.invalidateSize(), 100);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
    };
  }, [storeCoords.lat, storeCoords.lng, storeLabel]);

  return <div ref={containerRef} className="h-64 w-full overflow-hidden rounded-2xl border border-buyCyan/20" />;
}
