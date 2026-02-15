/**
 * scoring.ts — Walking Score, Driving Score & Urban Index
 *
 * Simple weighted average approach:
 *   For each category, we define what count = 100% score.
 *   The score is a weighted average of how close each category
 *   is to its 100% target.
 */

import { Amenity, ScoreResult, CategoryCount, AmenityCategory } from '@/types';
import { CATEGORY_CONFIG } from './categories';
import { filterByRadius } from './geo';

// ╔══════════════════════════════════════════════════════════════════╗
// ║                         CONFIG                                  ║
// ╚══════════════════════════════════════════════════════════════════╝

/** Radius for Walking Score (km). ~1 km is a 15 min walk. */
export const WALKING_RADIUS_KM = 1.0;

/** Radius for Driving Score (km). ~5 km is a 10 min drive. */
export const DRIVING_RADIUS_KM = 5.0;

/** Radius for Urban Index density check (km). */
export const URBAN_INDEX_RADIUS_KM = 2.0;

/**
 * WHAT DOES A 100% SCORE LOOK LIKE?
 *
 * For each category, this is the number of amenities needed
 * within the radius to get full marks for that category.
 * Having more than this still counts as 100% (capped).
 *
 *   Example: grocery = 3 for walking means if there are
 *   3 or more grocery stores within 1 km, grocery is 100%.
 */
export const PERFECT_WALKING: Record<AmenityCategory, number> = {
  grocery:       3,
  restaurant:    5,
  cafe:          3,
  park:          2,
  school:        2,
  transit:       3,
  healthcare:    2,
  shopping:      2,
  entertainment: 2,
  other:         0,
};

export const PERFECT_DRIVING: Record<AmenityCategory, number> = {
  grocery:       8,
  restaurant:    15,
  cafe:          10,
  park:          5,
  school:        5,
  transit:       5,
  healthcare:    5,
  shopping:      8,
  entertainment: 5,
  other:         0,
};

/**
 * CATEGORY WEIGHTS
 *
 * How much each category matters to the final score.
 * These come from categories.ts (walkingWeight / drivingWeight).
 *
 * For reference:
 *   grocery:       walking 3, driving 2
 *   restaurant:    walking 2, driving 1.5
 *   cafe:          walking 1.5, driving 1
 *   park:          walking 2, driving 1.5
 *   school:        walking 2, driving 2
 *   transit:       walking 3, driving 1
 *   healthcare:    walking 2, driving 2.5
 *   shopping:      walking 1, driving 1.5
 *   entertainment: walking 1, driving 1.5
 */

/** Urban Index thresholds */
export const URBAN_THRESHOLD = 7.5;
export const SUBURBAN_THRESHOLD = 4.5;

// ╔══════════════════════════════════════════════════════════════════╗
// ║                      SCORING LOGIC                              ║
// ╚══════════════════════════════════════════════════════════════════╝

/**
 * Count amenities per category, return sorted breakdown.
 */
function getCategoryCounts(amenities: Amenity[]): CategoryCount[] {
  const counts: Record<string, number> = {};

  for (const a of amenities) {
    counts[a.category] = (counts[a.category] || 0) + 1;
  }

  return (Object.keys(CATEGORY_CONFIG) as AmenityCategory[])
    .filter((cat) => cat !== 'other' && (counts[cat] || 0) > 0)
    .map((category) => ({
      category,
      label: CATEGORY_CONFIG[category].label,
      count: counts[category] || 0,
      icon: CATEGORY_CONFIG[category].icon,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Weighted Average Score (0–100)
 *
 * How it works:
 *   1. Count amenities in each category
 *   2. For each category, calculate: min(count / perfect, 1)
 *      - This gives a 0 to 1 ratio (capped at 1)
 *   3. Multiply each ratio by its weight
 *   4. Divide total by sum of weights
 *   5. Scale to 0–100
 *
 * Example (walking):
 *   grocery:  found 2, perfect 3 → ratio 0.67, weight 3 → 2.0
 *   transit:  found 4, perfect 3 → ratio 1.0,  weight 3 → 3.0
 *   park:     found 0, perfect 2 → ratio 0.0,  weight 2 → 0.0
 *   ...
 *   total weighted = 5.0 / sum of weights = 15.5 → score = 32
 */
function computeScore(
  amenities: Amenity[],
  mode: 'walking' | 'driving',
  customPerfect?: Record<AmenityCategory, number>
): number {
  // Step 1: Count per category
  const counts: Record<string, number> = {};
  for (const a of amenities) {
    counts[a.category] = (counts[a.category] || 0) + 1;
  }

  const perfect = customPerfect || (mode === 'walking' ? PERFECT_WALKING : PERFECT_DRIVING);

  let totalWeighted = 0;
  let totalWeight = 0;

  for (const [category, config] of Object.entries(CATEGORY_CONFIG)) {
    if (category === 'other') continue;

    const weight = mode === 'walking' ? config.walkingWeight : config.drivingWeight;
    const count = counts[category] || 0;
    const target = perfect[category as AmenityCategory];

    // Step 2: ratio = how close to perfect (0.0 to 1.0)
    // If target is 0, you don't need any → already perfect (1.0)
    const ratio = target > 0 ? Math.min(count / target, 1) : 1;

    // Step 3: weighted contribution
    totalWeighted += ratio * weight;
    totalWeight += weight;
  }

  // Step 4 & 5: weighted average → 0–100
  if (totalWeight === 0) return 0;
  return Math.round((totalWeighted / totalWeight) * 100);
}

/**
 * Urban / Suburban Index (1–10)
 *
 * Simple approach:
 *   1. Count non-park amenities within 3 km
 *   2. >= 20 → Urban, 10–19 → Suburban, < 10 → Rural
 *   3. Index = the raw count of amenities
 */
function computeUrbanIndex(
  amenities: Amenity[],
  centerLat: number,
  centerLng: number
): { index: number; label: string } {
  // Count all non-park amenities within 3 km
  const nearby = filterByRadius(amenities, centerLat, centerLng, 3.0);
  const total = nearby.filter((a) => a.category !== 'park').length;

  let label: string;
  if (total >= 20) label = 'Urban';
  else if (total >= 10) label = 'Suburban';
  else label = 'Rural';

  return { index: total, label };
}

// ╔══════════════════════════════════════════════════════════════════╗
// ║                       MAIN ENTRY POINT                          ║
// ╚══════════════════════════════════════════════════════════════════╝

export interface ScoringOptions {
  walkingRadiusKm?: number;
  drivingRadiusKm?: number;
  urbanRadiusKm?: number;
  urbanThreshold?: number;
  suburbanThreshold?: number;
  walkingTargets?: Record<AmenityCategory, number>;
  drivingTargets?: Record<AmenityCategory, number>;
}

/**
 * Compute all scores for a set of amenities around a center point.
 * Pass options to override radii, thresholds, or perfect-score targets.
 */
export function computeScores(
  amenities: Amenity[],
  centerLat: number,
  centerLng: number,
  options?: ScoringOptions
): ScoreResult {
  const walkRadius = options?.walkingRadiusKm ?? WALKING_RADIUS_KM;
  const driveRadius = options?.drivingRadiusKm ?? DRIVING_RADIUS_KM;
  const urbanRadius = options?.urbanRadiusKm ?? 3.0;
  const urbanThresh = options?.urbanThreshold ?? 20;
  const suburbanThresh = options?.suburbanThreshold ?? 10;

  const walkingAmenities = filterByRadius(amenities, centerLat, centerLng, walkRadius);
  const drivingAmenities = filterByRadius(amenities, centerLat, centerLng, driveRadius);

  // Urban index
  const nearbyUrban = filterByRadius(amenities, centerLat, centerLng, urbanRadius);
  const urbanTotal = nearbyUrban.filter((a) => a.category !== 'park').length;
  let urbanLabel: string;
  if (urbanTotal >= urbanThresh) urbanLabel = 'Urban';
  else if (urbanTotal >= suburbanThresh) urbanLabel = 'Suburban';
  else urbanLabel = 'Rural';

  return {
    walkingScore: computeScore(walkingAmenities, 'walking', options?.walkingTargets),
    drivingScore: computeScore(drivingAmenities, 'driving', options?.drivingTargets),
    urbanIndex: urbanTotal,
    urbanLabel,
    walkingBreakdown: getCategoryCounts(walkingAmenities),
    drivingBreakdown: getCategoryCounts(drivingAmenities),
  };
}
