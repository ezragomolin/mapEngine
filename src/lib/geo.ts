/**
 * geo.ts — Geographic math utilities
 *
 * Contains the Haversine formula and radius-based filtering.
 * These are pure math functions with no scoring logic.
 */

import { Amenity } from '@/types';

/** Earth's mean radius in kilometers */
const EARTH_RADIUS_KM = 6371;

/** Convert degrees to radians */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Haversine Formula
 * -----------------
 * Calculates the great-circle distance between two points on Earth.
 *
 * Formula:
 *   a = sin²(dLat/2) + cos(lat1) * cos(lat2) * sin²(dLng/2)
 *   c = 2 * atan2(sqrt(a), sqrt(1-a))
 *   distance = R * c
 *
 * Where R = 6371 km (Earth's mean radius)
 *
 * @param lat1 - Latitude of point 1 (degrees)
 * @param lng1 - Longitude of point 1 (degrees)
 * @param lat2 - Latitude of point 2 (degrees)
 * @param lng2 - Longitude of point 2 (degrees)
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Filter amenities to only those within a given radius of a center point.
 *
 * @param amenities - Full list of amenities
 * @param centerLat - Center latitude (degrees)
 * @param centerLng - Center longitude (degrees)
 * @param radiusKm  - Maximum distance in kilometers
 * @returns Filtered array of amenities within the radius
 */
export function filterByRadius(
  amenities: Amenity[],
  centerLat: number,
  centerLng: number,
  radiusKm: number
): Amenity[] {
  return amenities.filter(
    (a) => haversineDistance(centerLat, centerLng, a.lat, a.lng) <= radiusKm
  );
}
