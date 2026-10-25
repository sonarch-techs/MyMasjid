import { Coordinates } from '@/lib/hooks/useUserLocation';

export interface ExternalMasjid {
  id: string | number;
  name: string;
  locality: string;
  latitude: number;
  longitude: number;
  distanceMeters: number | null;
  distanceKm: number | null;
  formattedBadge: string;
  isDefault: boolean;
  googleMapsQuery?: string;
}

/**
 * Haversine Great-Circle Formula
 * Computes exact geodesic distance in meters between two GPS coordinates
 */
export function calculateHaversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Default Masjids returned ONLY when User GPS is Disabled / Blocked
 * Uses verified real-world coordinates and explicit Google Maps queries
 */
export function getDefaultMasjids(): ExternalMasjid[] {
  return [
    {
      id: 'default-1',
      name: 'Masjid-e-Quba',
      locality: 'Madhapur',
      latitude: 17.4483,
      longitude: 78.3915,
      distanceMeters: null,
      distanceKm: null,
      formattedBadge: 'Madhapur',
      isDefault: true,
      googleMapsQuery: 'Masjid e Quba, Ayyappa Society, Madhapur, Hyderabad',
    },
    {
      id: 'default-2',
      name: 'Noor Masjid',
      locality: 'Borabanda',
      latitude: 17.4535,
      longitude: 78.4130,
      distanceMeters: null,
      distanceKm: null,
      formattedBadge: 'Borabanda',
      isDefault: true,
      googleMapsQuery: 'Noor Masjid, Borabanda, Hyderabad, Telangana 500018',
    },
    {
      id: 'default-3',
      name: 'Makkah Masjid',
      locality: 'Charminar',
      latitude: 17.3603,
      longitude: 78.4734,
      distanceMeters: null,
      distanceKm: null,
      formattedBadge: 'Charminar',
      isDefault: true,
      googleMapsQuery: 'Makkah Masjid, Charminar, Hyderabad, Telangana',
    },
  ];
}

/**
 * Provider 1: Fast Indexed Overpass Query (No slow regex scans)
 */
async function fetchFromOverpass(
  userLat: number,
  userLng: number,
  radiusMeters: number
): Promise<ExternalMasjid[]> {
  const query = `
    [out:json][timeout:8];
    (
      nwr["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${userLat},${userLng});
      nwr["building"="mosque"](around:${radiusMeters},${userLat},${userLng});
    );
    out center tags;
  `;

  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: query,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (!response.ok) continue;
      const data = await response.json();

      return (data.elements || [])
        .map((el: any) => {
          const mLat = el.lat ?? el.center?.lat;
          const mLng = el.lon ?? el.center?.lon;
          const rawName = (
            el.tags?.['name:en'] ||
            el.tags?.name ||
            ''
          ).trim();

          if (!mLat || !mLng || !rawName) return null;

          const distMeters = calculateHaversineMeters(userLat, userLng, mLat, mLng);
          const locality =
            el.tags?.['addr:suburb'] ||
            el.tags?.['addr:neighbourhood'] ||
            el.tags?.['addr:city'] ||
            'Nearby';

          return {
            id: `osm-${el.id}`,
            name: rawName,
            locality,
            latitude: mLat,
            longitude: mLng,
            distanceMeters: distMeters,
            distanceKm: Number((distMeters / 1000).toFixed(2)),
            formattedBadge: formatDistance(distMeters),
            isDefault: false,
          } as ExternalMasjid;
        })
        .filter(Boolean) as ExternalMasjid[];
    } catch {
      // Try next mirror
    }
  }

  return [];
}

/**
 * Provider 2: Photon Komoot Geosearch API (Ultra-fast proximity search around user GPS)
 */
async function fetchFromPhoton(
  userLat: number,
  userLng: number,
  radiusMeters: number
): Promise<ExternalMasjid[]> {
  try {
    const url = `https://photon.komoot.io/api/?q=masjid&lat=${userLat}&lon=${userLng}&limit=15`;
    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    return (data.features || [])
      .map((f: any, idx: number) => {
        const coords = f.geometry?.coordinates; // [lng, lat]
        const rawName = f.properties?.name?.trim();
        if (!coords || coords.length < 2 || !rawName) return null;

        const mLng = Number(coords[0]);
        const mLat = Number(coords[1]);
        const distMeters = calculateHaversineMeters(userLat, userLng, mLat, mLng);

        if (distMeters > radiusMeters) return null;

        const locality =
          f.properties?.district ||
          f.properties?.locality ||
          f.properties?.city ||
          'Nearby';

        return {
          id: `photon-${f.properties?.osm_id || idx}`,
          name: rawName,
          locality,
          latitude: mLat,
          longitude: mLng,
          distanceMeters: distMeters,
          distanceKm: Number((distMeters / 1000).toFixed(2)),
          formattedBadge: formatDistance(distMeters),
          isDefault: false,
        } as ExternalMasjid;
      })
      .filter(Boolean) as ExternalMasjid[];
  } catch {
    return [];
  }
}

/**
 * Finds the K-Nearest Real Masjids around the user's live GPS location
 */
export async function findKNearestMasjids(
  userLat: number,
  userLng: number,
  radiusMeters = 4500,
  k = 3
): Promise<ExternalMasjid[]> {
  const [overpassResults, photonResults] = await Promise.all([
    fetchFromOverpass(userLat, userLng, radiusMeters),
    fetchFromPhoton(userLat, userLng, radiusMeters),
  ]);

  const combined = [...overpassResults, ...photonResults];

  // Sort strictly by shortest Haversine distance from user GPS
  combined.sort(
    (a, b) => (a.distanceMeters ?? 999999) - (b.distanceMeters ?? 999999)
  );

  // Deduplicate masjids that share the same name or are within 45 meters of each other
  const uniqueMasjids: ExternalMasjid[] = [];
  for (const candidate of combined) {
    const isDuplicate = uniqueMasjids.some((existing) => {
      const sameName =
        existing.name.toLowerCase() === candidate.name.toLowerCase();
      const proximity = calculateHaversineMeters(
        existing.latitude,
        existing.longitude,
        candidate.latitude,
        candidate.longitude
      );
      return sameName || proximity < 45;
    });

    if (!isDuplicate) {
      uniqueMasjids.push(candidate);
    }
    if (uniqueMasjids.length >= k) break;
  }

  return uniqueMasjids;
}

/**
 * Generates an accurate Google Maps Directions URL:
 * - When GPS is enabled: Routes from user's exact GPS coordinates to the nearest masjid's real coordinates
 * - When GPS is disabled: Routes to the verified Default Masjid place query
 */
export function buildMasjidDirectionsUrl(
  userCoords: Coordinates | null,
  masjid: ExternalMasjid | null
): string {
  // Case 1: GPS Enabled + Real Nearest Masjid Selected
  if (userCoords && masjid && !masjid.isDefault) {
    return `https://www.google.com/maps/dir/?api=1&origin=${userCoords.latitude},${userCoords.longitude}&destination=${masjid.latitude},${masjid.longitude}&travelmode=walking`;
  }

  // Case 2: GPS Enabled, but no specific OSM node was found -> Route to closest "Masjid" from user's GPS
  if (userCoords && !masjid) {
    return `https://www.google.com/maps/dir/?api=1&origin=${userCoords.latitude},${userCoords.longitude}&destination=Masjid&travelmode=walking`;
  }

  // Case 3: GPS Disabled + Default Masjid Selected
  if (masjid) {
    const query =
      masjid.googleMapsQuery ||
      `${masjid.name}, ${masjid.locality}, Hyderabad`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=walking`;
  }

  // Fallback general search
  return 'https://www.google.com/maps/search/Masjid+near+me';
}

/**
 * Opens Google Maps showing all nearby masjids around user's GPS (or general search if GPS off)
 */
export function buildLiveNearbyMasjidsUrl(userCoords: Coordinates | null): string {
  if (userCoords) {
    return `https://www.google.com/maps/search/Masjid/@${userCoords.latitude},${userCoords.longitude},16z`;
  }
  return 'https://www.google.com/maps/search/Masjid+in+Hyderabad';
}