"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";
import type { GuessMapProps } from "./GuessGlobe";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const MARKER_SIZE = 18;

function GuessMarker({
  position,
  color,
  label,
}: {
  position: { lat: number; lng: number };
  color: string;
  label?: string;
}) {
  return (
    <AdvancedMarker
      position={position}
      anchorLeft="-50%"
      anchorTop="-50%"
    >
      <div
        style={{
          position: "relative",
          width: MARKER_SIZE,
          height: MARKER_SIZE,
        }}
      >
        {label && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "calc(100% + 4px)",
              transform: "translateX(-50%)",
              background: color,
              color: "white",
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 4,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </div>
        )}
        <div
          style={{
            width: MARKER_SIZE,
            height: MARKER_SIZE,
            borderRadius: "50%",
            background: color,
            border: "3px solid white",
            boxSizing: "border-box",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.3)",
          }}
        />
      </div>
    </AdvancedMarker>
  );
}

function ResultLine({
  from,
  to,
}: {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
}) {
  const map = useMap();
  const polyRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;

    polyRef.current = new google.maps.Polyline({
      path: [from, to],
      strokeColor: "#facc15",
      strokeWeight: 6,
      strokeOpacity: 0.9,
      geodesic: true,
      map,
    });

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(from);
    bounds.extend(to);
    map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });

    return () => {
      polyRef.current?.setMap(null);
    };
  }, [map, from, to]);

  return null;
}

function MapClickHandler({
  onGuess,
  disabled,
  setGuess,
}: {
  onGuess: (lat: number, lng: number) => void;
  disabled: boolean;
  setGuess: (pos: { lat: number; lng: number }) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || disabled) return;
    const listener = map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setGuess({ lat, lng });
      onGuess(lat, lng);
    });
    return () => listener.remove();
  }, [map, disabled, onGuess, setGuess]);

  return null;
}

export default function GuessGoogleMap({
  onGuess,
  disabled = false,
  actualLocation,
  guessedLocation,
  externalGuess,
}: GuessMapProps) {
  const [guess, setGuess] = useState<{ lat: number; lng: number } | null>(null);

  // Sync external guess from parent (e.g. when switching views)
  useEffect(() => {
    if (externalGuess) setGuess(externalGuess);
  }, [externalGuess]);

  const stableSetGuess = useCallback(
    (pos: { lat: number; lng: number }) => setGuess(pos),
    []
  );

  const markerPos = guess || guessedLocation;

  return (
    <div className="relative w-full h-full">
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={{ lat: 20, lng: 0 }}
          defaultZoom={2}
          minZoom={2}
          gestureHandling="greedy"
          disableDefaultUI
          zoomControl
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          mapId="echoguessr"
          className="w-full h-full"
          colorScheme="LIGHT"
        >
          <MapClickHandler
            onGuess={onGuess}
            disabled={disabled}
            setGuess={stableSetGuess}
          />

          {markerPos && (
            <GuessMarker
              position={markerPos}
              color="#f97316"
              label={guessedLocation ? "Your Guess" : undefined}
            />
          )}

          {actualLocation && (
            <GuessMarker
              position={actualLocation}
              color="#22c55e"
              label="Actual"
            />
          )}

          {actualLocation && guessedLocation && (
            <ResultLine from={guessedLocation} to={actualLocation} />
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
