import { computeScores } from '../scoring';
import { haversineDistance, filterByRadius } from '../geo';
import { Amenity, AmenityCategory } from '@/types';

function makeAmenity(
  lat: number,
  lng: number,
  category: AmenityCategory
): Amenity {
  return {
    id: Math.floor(Math.random() * 100000),
    lat,
    lng,
    name: `Test ${category}`,
    type: category,
    category,
    tags: {},
  };
}

describe('haversineDistance', () => {
  it('should return 0 for the same point', () => {
    expect(haversineDistance(40.7128, -74.006, 40.7128, -74.006)).toBe(0);
  });

  it('should calculate approximate distance between NYC and LA', () => {
    const distance = haversineDistance(40.7128, -74.006, 34.0522, -118.2437);
    expect(distance).toBeGreaterThan(3900);
    expect(distance).toBeLessThan(4000);
  });

  it('should calculate short distances accurately', () => {
    // ~1 degree latitude is about 111 km
    const distance = haversineDistance(40.0, -74.0, 41.0, -74.0);
    expect(distance).toBeGreaterThan(110);
    expect(distance).toBeLessThan(112);
  });
});

describe('filterByRadius', () => {
  const center = { lat: 40.7128, lng: -74.006 };

  it('should include amenities within the radius', () => {
    const amenities = [
      makeAmenity(center.lat + 0.001, center.lng, 'grocery'),
    ];
    const result = filterByRadius(amenities, center.lat, center.lng, 1.0);
    expect(result).toHaveLength(1);
  });

  it('should exclude amenities outside the radius', () => {
    const amenities = [
      makeAmenity(center.lat + 0.1, center.lng, 'grocery'),
    ];
    const result = filterByRadius(amenities, center.lat, center.lng, 1.0);
    expect(result).toHaveLength(0);
  });
});

describe('computeScores', () => {
  const center = { lat: 40.7128, lng: -74.006 };

  it('should return zero scores when no amenities exist', () => {
    const scores = computeScores([], center.lat, center.lng);
    expect(scores.walkingScore).toBe(0);
    expect(scores.drivingScore).toBe(0);
    expect(scores.urbanIndex).toBeGreaterThanOrEqual(1);
    expect(scores.walkingBreakdown).toHaveLength(0);
  });

  it('should compute positive scores with nearby amenities', () => {
    const amenities = [
      makeAmenity(center.lat + 0.002, center.lng, 'grocery'),
      makeAmenity(center.lat + 0.003, center.lng, 'restaurant'),
      makeAmenity(center.lat - 0.002, center.lng, 'cafe'),
      makeAmenity(center.lat, center.lng + 0.002, 'park'),
      makeAmenity(center.lat, center.lng - 0.002, 'transit'),
    ];
    const scores = computeScores(amenities, center.lat, center.lng);
    expect(scores.walkingScore).toBeGreaterThan(0);
    expect(scores.drivingScore).toBeGreaterThan(0);
  });

  it('should produce a higher driving score than walking when amenities are spread out', () => {
    const amenities = [
      makeAmenity(center.lat + 0.027, center.lng, 'grocery'),
      makeAmenity(center.lat + 0.028, center.lng, 'restaurant'),
      makeAmenity(center.lat + 0.029, center.lng, 'healthcare'),
    ];
    const scores = computeScores(amenities, center.lat, center.lng);
    expect(scores.drivingScore).toBeGreaterThan(scores.walkingScore);
  });

  it('should label dense areas as Urban', () => {
    const categories: AmenityCategory[] = [
      'grocery', 'restaurant', 'cafe', 'park',
      'school', 'transit', 'healthcare', 'shopping', 'entertainment',
    ];
    const amenities: Amenity[] = [];
    for (let i = 0; i < 200; i++) {
      const cat = categories[i % categories.length];
      amenities.push(
        makeAmenity(
          center.lat + (Math.random() - 0.5) * 0.01,
          center.lng + (Math.random() - 0.5) * 0.01,
          cat
        )
      );
    }
    const scores = computeScores(amenities, center.lat, center.lng);
    expect(scores.urbanLabel).toBe('Urban');
    expect(scores.urbanIndex).toBeGreaterThanOrEqual(7.5);
  });

  it('should include category breakdowns', () => {
    const amenities = [
      makeAmenity(center.lat + 0.002, center.lng, 'grocery'),
      makeAmenity(center.lat + 0.003, center.lng, 'grocery'),
      makeAmenity(center.lat - 0.001, center.lng, 'restaurant'),
    ];
    const scores = computeScores(amenities, center.lat, center.lng);
    const groceryBreakdown = scores.walkingBreakdown.find(
      (b) => b.category === 'grocery'
    );
    expect(groceryBreakdown).toBeDefined();
    expect(groceryBreakdown!.count).toBe(2);
  });
});
