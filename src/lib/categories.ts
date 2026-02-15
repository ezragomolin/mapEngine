/**
 * categories.ts — Amenity category configuration
 *
 * Each category has:
 *   - label:          Display name shown in the UI
 *   - walkingWeight:  How important this category is for the Walking Score
 *   - drivingWeight:  How important this category is for the Driving Score
 *   - color:          Marker color on the map
 *   - icon:           Emoji shown on markers and breakdowns
 *
 * Higher weight = more impact on the score.
 * Weights are relative to each other (e.g., 3 is 3x more impactful than 1).
 */

import { AmenityCategory } from '@/types';

export interface CategoryConfig {
  label: string;
  walkingWeight: number;
  drivingWeight: number;
  color: string;
  icon: string;
}

export const CATEGORY_CONFIG: Record<AmenityCategory, CategoryConfig> = {
  grocery: {
    label: 'Grocery & Supermarket',
    walkingWeight: 3,     // Essential for walkability
    drivingWeight: 2,
    color: '#4caf50',
    icon: '\u{1F6D2}',   // shopping cart
  },
  restaurant: {
    label: 'Restaurant',
    walkingWeight: 2,
    drivingWeight: 1.5,
    color: '#ff9800',
    icon: '\u{1F37D}\u{FE0F}',  // fork and knife
  },
  cafe: {
    label: 'Cafe & Coffee',
    walkingWeight: 1.5,
    drivingWeight: 1,
    color: '#795548',
    icon: '\u{2615}',    // coffee
  },
  park: {
    label: 'Park & Recreation',
    walkingWeight: 2,
    drivingWeight: 1.5,
    color: '#66bb6a',
    icon: '\u{1F333}',   // tree
  },
  school: {
    label: 'Education',
    walkingWeight: 2,
    drivingWeight: 2,
    color: '#42a5f5',
    icon: '\u{1F393}',   // graduation cap
  },
  transit: {
    label: 'Public Transit',
    walkingWeight: 3,     // Critical for walkability
    drivingWeight: 1,     // Less important when driving
    color: '#7e57c2',
    icon: '\u{1F68C}',   // bus
  },
  healthcare: {
    label: 'Healthcare',
    walkingWeight: 2,
    drivingWeight: 2.5,   // More important for drivers (hospitals further out)
    color: '#ef5350',
    icon: '\u{1F3E5}',   // hospital
  },
  shopping: {
    label: 'Shopping',
    walkingWeight: 1,
    drivingWeight: 1.5,
    color: '#ec407a',
    icon: '\u{1F6CD}\u{FE0F}',  // shopping bags
  },
  entertainment: {
    label: 'Entertainment',
    walkingWeight: 1,
    drivingWeight: 1.5,
    color: '#ffa726',
    icon: '\u{1F3AD}',   // performing arts
  },
  other: {
    label: 'Other',
    walkingWeight: 0.5,
    drivingWeight: 0.5,
    color: '#78909c',
    icon: '\u{1F4CD}',   // pin
  },
};
