export interface ExternalMasjid {
  id: string | number;
  name: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  distanceMeters: number;
}

// Calculate distance between two coordinates in kilometers (Haversine formula)
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

// Fetch live masjids near coordinates without any database or API key
export async function fetchNearestMosquesWithoutDb(
  lat: number,
  lng: number,
  radiusMeters = 3000
): Promise<ExternalMasjid[]> {
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lng});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lng});
      relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lng});
    );
    out center;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) throw new Error('Overpass server busy');
    const data = await response.json();

    const list: ExternalMasjid[] = (data.elements || [])
      .map((el: any) => {
        const mLat = el.lat || el.center?.lat;
        const mLng = el.lon || el.center?.lon;
        if (!mLat || !mLng) return null;

        const name =
          el.tags?.name ||
          el.tags?.['name:en'] ||
          el.tags?.['name:ur'] ||
          'Nearby Masjid';

        const distKm = calculateDistanceKm(lat, lng, mLat, mLng);
        return {
          id: el.id,
          name,
          latitude: mLat,
          longitude: mLng,
          distanceKm: distKm,
          distanceMeters: Math.round(distKm * 1000),
        };
      })
      .filter(Boolean)
      .sort((a: ExternalMasjid, b: ExternalMasjid) => a.distanceKm - b.distanceKm);

    return list;
  } catch (error) {
    console.warn('OSM fetch fallback triggered:', error);
    // Safe hardcoded Borabanda / Allapur fallbacks in case Overpass is throttled
    return [
      {
        id: 'fallback-1',
        name: 'Masjid-e-Quba',
        latitude: 17.4492,
        longitude: 78.4078,
        distanceKm: calculateDistanceKm(lat, lng, 17.4492, 78.4078),
        distanceMeters: Math.round(calculateDistanceKm(lat, lng, 17.4492, 78.4078) * 1000),
      },
      {
        id: 'fallback-2',
        name: 'Jama Masjid Borabanda',
        latitude: 17.4481,
        longitude: 78.4065,
        distanceKm: calculateDistanceKm(lat, lng, 17.4481, 78.4065),
        distanceMeters: Math.round(calculateDistanceKm(lat, lng, 17.4481, 78.4065) * 1000),
      },
      {
        id: 'fallback-3',
        name: 'Masjid-e-Bilal',
        latitude: 17.4452,
        longitude: 78.4048,
        distanceKm: calculateDistanceKm(lat, lng, 17.4452, 78.4048),
        distanceMeters: Math.round(calculateDistanceKm(lat, lng, 17.4452, 78.4048) * 1000),
      },
    ].sort((a, b) => a.distanceKm - b.distanceKm);
  }
}