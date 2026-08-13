"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import Link from "next/link";
import { categoryMeta } from "@/lib/categories";

export type Place = {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  createdAt?: string;
  distanceMeters?: number;
  location: { coordinates: [number, number] }; // [lng, lat]
};

const FRESH_WINDOW_MS = 5 * 60 * 1000; // discoveries under 5 minutes old get the "just happened" treatment

function isFresh(place: Place) {
  if (!place.createdAt) return false;
  return Date.now() - new Date(place.createdAt).getTime() < FRESH_WINDOW_MS;
}

function glowIcon(category?: string, fresh?: boolean) {
  const meta = categoryMeta(category || "other");
  return L.divIcon({
    className: `way-marker ${fresh ? "fresh" : ""}`,
    html: `
      ${fresh ? `<div class="way-marker-burst" style="--marker-color:${meta.color}"></div>` : ""}
      <div class="way-marker-ring ${fresh ? "fast" : ""}" style="--marker-color:${meta.color}"></div>
      <div class="way-marker-glow ${fresh ? "fresh" : ""}" style="--marker-color:${meta.color}">
        <div class="way-marker-dot">${meta.emoji}</div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function youAreHereIcon() {
  return L.divIcon({
    className: "way-you-marker",
    html: `<div class="way-you-pulse"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function FitBounds({ places }: { places: Place[] }) {
  const map = useMap();
  useEffect(() => {
    if (places.length === 0) return;
    const bounds = L.latLngBounds(
      places.map((p) => [p.location.coordinates[1], p.location.coordinates[0]] as [number, number])
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [places]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function MapView({
  center,
  places,
  fitToMarkers = false,
}: {
  center?: [number, number];
  places: Place[];
  fitToMarkers?: boolean;
}) {
  const fallbackCenter: [number, number] = center || [26.1445, 91.7362];

  return (
    <MapContainer
      center={fallbackCenter}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      {fitToMarkers ? <FitBounds places={places} /> : center && <Recenter center={center} />}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
      />

      {!fitToMarkers && center && <Marker position={center} icon={youAreHereIcon()} />}

      {places.map((p) => {
        const fresh = isFresh(p);
        return (
          <Marker
            key={p._id}
            position={[p.location.coordinates[1], p.location.coordinates[0]]}
            icon={glowIcon(p.category, fresh)}
          >
            <Popup>
              <div className="place-popup">
                {fresh && <p style={{ color: "#4a6d97", fontWeight: 700, fontSize: 11, margin: "0 0 4px" }}>NEW DISCOVERY</p>}
                <h3>{p.name}</h3>
                {p.category && <p style={{ textTransform: "capitalize" }}>{categoryMeta(p.category).label}</p>}
                {p.distanceMeters !== undefined && (
                  <p style={{ fontWeight: 600 }}>
                    {p.distanceMeters < 1000
                      ? `${Math.round(p.distanceMeters)}m away`
                      : `${(p.distanceMeters / 1000).toFixed(1)}km away`}
                  </p>
                )}
                {p.description && <p>{p.description}</p>}
                <Link href={`/place/${p._id}`} style={{ color: "#a67c3d", fontWeight: 600, fontSize: 13 }}>
                  View discovery →
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
