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
  permissionStatus: PermissionState | 'unknown';
  requestPermission: () => void;
}

export function useUserLocation(): UserLocationState {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGpsEnabled, setIsGpsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | 'unknown'>('unknown');

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
          setPermissionStatus('denied');
          handleFinalFailure(err);
          return;
        }

        // Stage 2: Fallback to Network Triangulation if satellite GPS timed out indoors
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
        timeout: 8000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    requestPermission();

    // Listen for live changes to browser location permissions
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((status) => {
          setPermissionStatus(status.state);
          
          status.onchange = () => {
            setPermissionStatus(status.state);
            // If user goes to settings and switches to 'granted', auto-fetch GPS!
            if (status.state === 'granted') {
              requestPermission();
            }
          };
        })
        .catch(() => setPermissionStatus('unknown'));
    }
  }, [requestPermission]);

  return {
    coords,
    loading,
    error,
    isGpsEnabled,
    permissionStatus,
    requestPermission,
  };
}