"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function RecenterMap({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lon != null) {
      map.setView([lat, lon], 12);
    }
  }, [lat, lon, map]);
  return null;
}

export default function Map({ lat, lon, label }) {
  // Custom Nova-X Brand Marker
  const customIcon = useMemo(() => {
    if (typeof window === "undefined") return null;

    return L.divIcon({
      className: "novax-leaflet-marker",
      html: `
        <div style="width: 40px; height: 50px; cursor: pointer; filter: drop-shadow(0 2px 4px rgba(16, 56, 11, 0.15));">
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Ground contact shadow -->
            <ellipse cx="20" cy="46" rx="9" ry="3" fill="#10380b" opacity="0.25" />

            <!-- Hard offset shadow in Forest Ink -->
            <path d="M22 44C22 44 34 30 34 18C34 9.16 28.63 3 22 3C15.37 3 10 9.16 10 18C10 30 22 44 22 44Z" fill="#10380b" />

            <!-- Main Pin Body in Forest Ink with Parchment outline -->
            <path d="M19 42C19 42 31 28 31 16C31 7.16 25.63 1 19 1C12.37 1 7 7.16 7 16C7 28 19 42 19 42Z" fill="#10380b" stroke="#fefde6" stroke-width="1.5" />

            <!-- Inner Circle in Vivid Marigold Yellow -->
            <circle cx="19" cy="16" r="9" fill="#fce519" stroke="#10380b" stroke-width="1.2" />

            <!-- Nova-X Brand Zap Logo in Forest Ink -->
            <path d="M20 10.5L15 17H19L18 21.5L23 15H19L20 10.5Z" fill="#10380b" stroke="#10380b" stroke-width="0.5" stroke-linejoin="round" />
          </svg>
        </div>
      `,
      iconSize: [40, 50],
      iconAnchor: [19, 44],
      popupAnchor: [0, -42],
    });
  }, []);

  if (lat == null || lon == null) return null;

  return (
    <MapContainer
      center={[lat, lon]}
      zoom={12}
      style={{ height: "100%", width: "100%", background: "#f2ee98" }}
      scrollWheelZoom={false}
    >
      <RecenterMap lat={lat} lon={lon} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lon]} icon={customIcon || undefined}>
        <Popup>
          <div className="font-mono text-xs font-bold text-ink p-1">
            {label ? (
              <div className="text-ink font-extrabold text-sm mb-1">{label}</div>
            ) : null}
            <div className="text-ink/60 text-[11px]">
              {lat}, {lon}
            </div>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
