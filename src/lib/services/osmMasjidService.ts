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

// Reject roads, bus stops, or localities named "Masjid" (e.g., "Masjid Banda", "Masjid Bus Stop")
const NON_MOSQUE_NAME_REGEX =
  /\b(bus\s*stop|metro|station|banda|road|lane|street|plot|stage|cross|signal|junction)\b/i;

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
 * Fetch wrapper with AbortController timeout so requests never hang
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 4500
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Default Masjids returned ONLY when User GPS is Disabled / Blocked
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
      longitude: 78.413,
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
 * Provider 1: OpenStreetMap Overpass API
 * Queries ONLY nodes and ways (skips heavy relations) for fast sub-second response
 */
async function fetchFromOverpass(
  userLat: number,
  userLng: number,
  radiusMeters: number
): Promise<ExternalMasjid[]> {
  const query = `
    [out:json][timeout:6];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${userLat},${userLng});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${userLat},${userLng});
      node["building"="mosque"](around:${radiusMeters},${userLat},${userLng});
      way["building"="mosque"](around:${radiusMeters},${userLat},${userLng});
    );
    out center tags;
  `.trim();

  const encoded = encodeURIComponent(query);
  const mirrors = [
    `https://overpass-api.de/api/interpreter?data=${encoded}`,
    `https://overpass.kumi.systems/api/interpreter?data=${encoded}`,
  ];

  const fetchMirror = async (url: string): Promise<ExternalMasjid[]> => {
    const response = await fetchWithTimeout(url, {}, 4500);
    if (!response.ok) throw new Error('Overpass HTTP error');
    const data = await response.json();

    const list = (data.elements || [])
      .map((el: any) => {
        const mLat = Number(el.lat ?? el.center?.lat);
        const mLng = Number(el.lon ?? el.center?.lon);
        const tags = el.tags || {};

        // Exclude non-mosque infrastructure
        if (tags.highway || tags.public_transport || tags.place || tags.shop) {
          return null;
        }

        const rawName = (
          tags['name:en'] ||
          tags.name ||
          tags.official_name ||
          tags.alt_name ||
          ''
        ).trim();

        if (
          !Number.isFinite(mLat) ||
          !Number.isFinite(mLng) ||
          !rawName ||
          NON_MOSQUE_NAME_REGEX.test(rawName)
        ) {
          return null;
        }

        const distMeters = calculateHaversineMeters(
          userLat,
          userLng,
          mLat,
          mLng
        );
        if (distMeters > radiusMeters) return null;

        const locality =
          tags['addr:suburb'] ||
          tags['addr:neighbourhood'] ||
          tags['addr:locality'] ||
          tags['addr:city'] ||
          'Hyderabad';

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
          googleMapsQuery: `${rawName}, ${locality}`,
        } as ExternalMasjid;
      })
      .filter(Boolean) as ExternalMasjid[];

    if (list.length === 0) throw new Error('Empty Overpass list');
    return list;
  };

  try {
    return await Promise.any(mirrors.map((url) => fetchMirror(url)));
  } catch {
    return [];
  }
}

/**
 * Provider 2: Bounded Photon Geosearch API
 * Uses a strict &bbox= parameter around the user's GPS and filters for worship/mosque POIs
 */
async function fetchFromPhotonBounded(
  userLat: number,
  userLng: number,
  radiusMeters: number
): Promise<ExternalMasjid[]> {
  try {
    // 0.045 degrees is ~5km around user's coordinates
    const delta = 0.045;
    const bbox = `${userLng - delta},${userLat - delta},${userLng + delta},${userLat + delta}`;

    const urls = [
      `https://photon.komoot.io/api/?q=masjid&lat=${userLat}&lon=${userLng}&bbox=${bbox}&limit=25`,
      `https://photon.komoot.io/api/?q=mosque&lat=${userLat}&lon=${userLng}&bbox=${bbox}&limit=25`,
    ];

    const settled = await Promise.allSettled(
      urls.map((u) => fetchWithTimeout(u, {}, 3500).then((r) => r.json()))
    );

    const features: any[] = [];
    for (const res of settled) {
      if (res.status === 'fulfilled' && Array.isArray(res.value?.features)) {
        features.push(...res.value.features);
      }
    }

    return features
      .map((f: any, idx: number) => {
        const coords = f.geometry?.coordinates; // [lng, lat]
        const props = f.properties || {};
        const rawName = (props.name || '').trim();

        if (!coords || coords.length < 2 || !rawName) return null;

        // Strictly reject roads, bus stops, suburbs, and shops
        const osmKey = (props.osm_key || '').toLowerCase();
        const osmValue = (props.osm_value || '').toLowerCase();

        if (
          osmKey === 'highway' ||
          osmKey === 'place' ||
          osmKey === 'shop' ||
          osmKey === 'landuse' ||
          osmKey === 'public_transport' ||
          NON_MOSQUE_NAME_REGEX.test(rawName)
        ) {
          return null;
        }

        // Must be a place_of_worship, mosque building, or explicitly named Masjid/Mosque
        const isWorshipTag =
          osmValue === 'place_of_worship' ||
          osmValue === 'mosque' ||
          osmKey === 'amenity' ||
          osmKey === 'building';

        if (!isWorshipTag) return null;

        const mLng = Number(coords[0]);
        const mLat = Number(coords[1]);
        if (!Number.isFinite(mLat) || !Number.isFinite(mLng)) return null;

        const distMeters = calculateHaversineMeters(
          userLat,
          userLng,
          mLat,
          mLng
        );
        if (distMeters > radiusMeters) return null;

        const locality =
          props.district ||
          props.locality ||
          props.suburb ||
          props.city ||
          'Hyderabad';

        return {
          id: `photon-${props.osm_id || idx}`,
          name: rawName,
          locality,
          latitude: mLat,
          longitude: mLng,
          distanceMeters: distMeters,
          distanceKm: Number((distMeters / 1000).toFixed(2)),
          formattedBadge: formatDistance(distMeters),
          isDefault: false,
          googleMapsQuery: `${rawName}, ${locality}`,
        } as ExternalMasjid;
      })
      .filter(Boolean) as ExternalMasjid[];
  } catch {
    return [];
  }
}

/**
 * K-Nearest Neighbor (KNN) Algorithm for Real Nearby Masjids
 * 1. Queries Overpass + Bounded Photon around (userLat, userLng)
 * 2. Computes exact Haversine distance d(user, masjid_i)
 * 3. Sorts ascending and deduplicates within 50m to return the top K closest masjids
 */
export async function findKNearestMasjids(
  userLat: number,
  userLng: number,
  radiusMeters = 5000,
  k = 3
): Promise<ExternalMasjid[]> {
  if (!Number.isFinite(userLat) || !Number.isFinite(userLng)) {
    return [];
  }

  const settled = await Promise.allSettled([
    fetchFromOverpass(userLat, userLng, radiusMeters),
    fetchFromPhotonBounded(userLat, userLng, radiusMeters),
  ]);

  const candidates: ExternalMasjid[] = [];
  for (const res of settled) {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      candidates.push(...res.value);
    }
  }

  // Sort strictly by shortest Haversine distance from user's GPS
  candidates.sort(
    (a, b) => (a.distanceMeters ?? 999999) - (b.distanceMeters ?? 999999)
  );

  // Deduplicate identical names or nodes within 50 meters of each other
  const kNearest: ExternalMasjid[] = [];
  for (const candidate of candidates) {
    const isDuplicate = kNearest.some((existing) => {
      const sameName =
        existing.name.toLowerCase() === candidate.name.toLowerCase();
      const proximity = calculateHaversineMeters(
        existing.latitude,
        existing.longitude,
        candidate.latitude,
        candidate.longitude
      );
      return sameName || proximity < 50;
    });

    if (!isDuplicate) {
      kNearest.push(candidate);
    }
    if (kNearest.length >= k) break;
  }

  return kNearest;
}

/**
 * Builds the exact Google Maps Directions URL from the user's location
 * to the K-Nearest Masjid's verified coordinates
 */
export function buildMasjidDirectionsUrl(
  userCoords: Coordinates | null,
  masjid: ExternalMasjid | null
): string {
  // Case 1: GPS Enabled + Real KNN Masjid Selected -> Pin-to-Pin from User GPS to Nearest Masjid GPS
  if (
    userCoords &&
    masjid &&
    !masjid.isDefault &&
    Number.isFinite(masjid.latitude) &&
    Number.isFinite(masjid.longitude)
  ) {
    return `https://www.google.com/maps/dir/?api=1&origin=${userCoords.latitude},${userCoords.longitude}&destination=${masjid.latitude},${masjid.longitude}&travelmode=walking`;
  }

  // Case 2: GPS Disabled + Default Masjid Selected -> Route to verified Masjid query
  if (masjid && masjid.isDefault) {
    const query =
      masjid.googleMapsQuery ||
      `${masjid.name}, ${masjid.locality}, Hyderabad`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}&travelmode=walking`;
  }

  // Case 3: GPS Enabled, fallback if no OSM node returned
  if (userCoords) {
    return `https://www.google.com/maps/search/Masjid/@${userCoords.latitude},${userCoords.longitude},16z`;
  }

  return 'https://www.google.com/maps/search/Masjid+near+me';
}

/**
 * Opens Google Maps showing all nearby masjids centered on user's GPS
 */
export function buildLiveNearbyMasjidsUrl(
  userCoords: Coordinates | null
): string {
  if (userCoords) {
    return `https://www.google.com/maps/search/Masjid/@${userCoords.latitude},${userCoords.longitude},16z`;
  }
  return 'https://www.google.com/maps/search/Masjid+in+Hyderabad';
}