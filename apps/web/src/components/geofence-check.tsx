"use client";

import { Suspense, lazy, useEffect } from "react";
import { useLanguage } from "@/components/language-provider";
import { OUT_OF_TOWN_RADIUS_KM, STORE_COORDINATES, NEAR_RADIUS_KM, estimateTransportFee } from "@/lib/geofence";
import type { GeofenceZone } from "@/lib/geofence";
import { formatXaf } from "@/lib/utils";
import { useGeofence } from "@/lib/use-geofence";

const LocationMap = lazy(() => import("@/components/location-map").then((m) => ({ default: m.LocationMap })));

interface GeofenceCheckProps {
  onChange: (zone: GeofenceZone, fee: number) => void;
}

export function GeofenceCheck({ onChange }: GeofenceCheckProps) {
  const { dictionary, locale } = useLanguage();
  const { status, zone, distanceKm, coords, accuracyMeters, locate } = useGeofence();
  const fee = estimateTransportFee(distanceKm);
  const distanceLabel = distanceKm !== null ? distanceKm.toFixed(1) : "";
  const isOutOfTown = distanceKm !== null && distanceKm > OUT_OF_TOWN_RADIUS_KM;

  useEffect(() => {
    onChange(zone, fee);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone, fee]);

  const message =
    status === "locating"
      ? dictionary.geofence.locating
      : status === "success"
        ? zone === "NEAR"
          ? dictionary.geofence.near.replace("{distance}", distanceLabel)
          : dictionary.geofence.far.replace("{distance}", distanceLabel).replace("{fee}", formatXaf(fee, locale))
        : status === "denied"
          ? dictionary.geofence.denied.replace("{fee}", formatXaf(fee, locale))
          : status === "unsupported"
            ? dictionary.geofence.unsupported.replace("{fee}", formatXaf(fee, locale))
            : status === "error"
              ? dictionary.geofence.error.replace("{fee}", formatXaf(fee, locale))
              : dictionary.geofence.unknown.replace("{fee}", formatXaf(fee, locale));

  const tone = status === "success" && zone === "NEAR" ? "text-buyCyan" : "text-serviceOrange";

  return (
    <div className="grid gap-3 rounded-2xl border border-serviceOrange/30 bg-serviceOrange/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-bold text-textMain">{dictionary.repair.transportFeeTitle}</span>
        <button
          type="button"
          onClick={locate}
          disabled={status === "locating"}
          className="rounded-full border border-serviceOrange px-4 py-2 text-xs font-black text-serviceOrange transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
        >
          {dictionary.repair.checkLocation}
        </button>
      </div>
      <p className={`text-sm font-semibold ${tone}`}>{message}</p>
      {isOutOfTown ? <p className="text-sm font-semibold text-serviceOrange">{dictionary.geofence.outOfTown}</p> : null}
      {status === "success" && coords ? (
        <Suspense fallback={<div className="h-64 w-full animate-pulse rounded-2xl border border-borderTech bg-slatePanel/60" />}>
          <LocationMap
            storeCoords={STORE_COORDINATES}
            userCoords={coords}
            userAccuracyMeters={accuracyMeters}
            radiusKm={NEAR_RADIUS_KM}
            storeLabel={dictionary.geofence.mapStoreLabel}
            userLabel={dictionary.geofence.mapUserLabel}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
