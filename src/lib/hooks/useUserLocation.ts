'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface UserLocationState {
  coords: Coordinates | null;
  loading: boolean;
  error: string | null;
  isGpsEnabled: boolean;
  requestPermission: () => void;
}

export function useUserLocation(): UserLocationState {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGpsEnabled, setIsGpsEnabled] = useState(false);

  const requestPermission = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setCoords(null);
      setIsGpsEnabled(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const handleSuccess = (position: GeolocationPosition) => {
      setCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: Math.round(position.coords.accuracy),
      });
      setIsGpsEnabled(true);
      setError(null);
      setLoading(false);
    };

    const handleFinalFailure = (err: GeolocationPositionError) => {
      // Do NOT inject fake fallback coordinates when GPS is disabled/unavailable
      setCoords(null);
      setIsGpsEnabled(false);
      setError(err.message || 'Location access disabled');
      setLoading(false);
    };

    // Stage 1: Attempt High-Accuracy GPS lock
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (err) => {
        // If user explicitly denied permission (code 1), stop immediately
        if (err.code === 1) {
          handleFinalFailure(err);
          return;
        }

        // Stage 2: If satellite GPS timed out indoors/on desktop, fallback to Wi-Fi/Network triangulation
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          handleFinalFailure,
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 30000,
      }
    );
  }, []);

  useEffect(() => {
    requestPermission();

    // Automatically react if the user toggles browser location permission
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((status) => {
          status.onchange = () => {
            requestPermission();
          };
        })
        .catch(() => {});
    }
  }, [requestPermission]);

  return {
    coords,
    loading,
    error,
    isGpsEnabled,
    requestPermission,
  };
}