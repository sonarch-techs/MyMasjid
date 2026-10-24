'use client';

import { useState, useEffect } from 'react';

export interface GeoLocationState {
  lat: number;
  lng: number;
  loading: boolean;
  error: string | null;
}

// Default fallback coordinates: Hyderabad center
const DEFAULT_COORDS = { lat: 17.4475, lng: 78.4063 };

export function useGeolocation() {
  const [coords, setCoords] = useState<GeoLocationState>({
    lat: DEFAULT_COORDS.lat,
    lng: DEFAULT_COORDS.lng,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setCoords((prev) => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          loading: false,
          error: null,
        });
      },
      (error) => {
        setCoords({
          lat: DEFAULT_COORDS.lat,
          lng: DEFAULT_COORDS.lng,
          loading: false,
          error: error.message,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return coords;
}