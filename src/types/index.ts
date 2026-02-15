export interface Amenity {
  id: number;
  lat: number;
  lng: number;
  name: string;
  type: string;
  category: AmenityCategory;
  tags: Record<string, string>;
}

export type AmenityCategory =
  | 'grocery'
  | 'restaurant'
  | 'cafe'
  | 'park'
  | 'school'
  | 'transit'
  | 'healthcare'
  | 'shopping'
  | 'entertainment'
  | 'other';

export interface AddressResult {
  display_name: string;
  lat: number;
  lng: number;
  place_name?: string;
}

export interface ScoreResult {
  walkingScore: number;
  drivingScore: number;
  urbanIndex: number;
  urbanLabel: string;
  walkingBreakdown: CategoryCount[];
  drivingBreakdown: CategoryCount[];
}

export interface CategoryCount {
  category: AmenityCategory;
  label: string;
  count: number;
  icon: string;
}

export interface SearchHistoryItem {
  address: string;
  lat: number;
  lng: number;
  timestamp: number;
}
