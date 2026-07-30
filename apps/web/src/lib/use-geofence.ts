import { useCallback, useState } from "react";
import { STORE_COORDINATES, classifyZone, haversineDistanceKm } from "@/lib/geofence";
import type { Coordinates, GeofenceZone } from "@/lib/geofence";

type GeofenceStatus = "idle" | "locating" | "success" | "denied" | "error" | "unsupported";

interface GeofenceState {
  status: GeofenceStatus;
  distanceKm: number | null;
  zone: GeofenceZone;
  coords: Coordinates | null;
  accuracyMeters: number | null;
}

export function useGeofence() {
  const [state, setState] = useState<GeofenceState>({
    status: "idle",
    distanceKm: null,
    zone: "UNKNOWN",
    coords: null,
    accuracyMeters: null
  });

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ status: "unsupported", distanceKm: null, zone: "UNKNOWN", coords: null, accuracyMeters: null });
      return;
    }

    setState((prev) => ({ ...prev, status: "locating" }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = { lat: position.coords.latitude, lng: position.coords.longitude };
        const distanceKm = haversineDistanceKm(STORE_COORDINATES, coords);
        setState({
          status: "success",
          distanceKm,
          zone: classifyZone(distanceKm),
          coords,
          accuracyMeters: position.coords.accuracy
        });
      },
      (error) => {
        setState({
          status: error.code === error.PERMISSION_DENIED ? "denied" : "error",
          distanceKm: null,
          zone: "UNKNOWN",
          coords: null,
          accuracyMeters: null
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { ...state, locate };
}
