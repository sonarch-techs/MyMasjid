'use client';

import { useState, useEffect } from 'react';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UserLocationState {
  coords: Coordinates | null;
  loading: boolean;
  error: string | null;
  isPermissionGranted: boolean;
  requestPermission: () => void;
}

// Default fallback location: Madhapur / Borabanda corridor, Hyderabad
const DEFAULT_HYDERABAD_COORDS: Coordinates = {
  latitude: 17.4485,
  longitude: 78.3908,
};

export function useUserLocation(): UserLocationState {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  const requestPermission = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setCoords(DEFAULT_HYDERABAD_COORDS);
      setLoading(false);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsPermissionGranted(true);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable. Using default location.', err.message);
        setError(err.message);
        setCoords(DEFAULT_HYDERABAD_COORDS);
        setIsPermissionGranted(false);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  useEffect(() => {
    requestPermission();
  }, []);

  return {
    coords,
    loading,
    error,
    isPermissionGranted,
    requestPermission,
  };
}