import { NextRequest, NextResponse } from 'next/server';
import { Amenity, AmenityCategory } from '@/types';

// Category groups — each group becomes one parallel API call
const CATEGORY_GROUPS: { categories: string; map: AmenityCategory }[] = [
  { categories: 'commercial.supermarket,commercial.convenience', map: 'grocery' },
  { categories: 'catering.restaurant,catering.fast_food', map: 'restaurant' },
  { categories: 'catering.cafe', map: 'cafe' },
  { categories: 'leisure.park,leisure.playground', map: 'park' },
  { categories: 'education.school,education.university,education.library', map: 'school' },
  { categories: 'public_transport', map: 'transit' },
  { categories: 'healthcare.hospital,healthcare.pharmacy,healthcare.clinic_or_praxis', map: 'healthcare' },
  { categories: 'commercial.shopping_mall,commercial.clothing', map: 'shopping' },
  { categories: 'entertainment.cinema,entertainment.culture,sport.fitness,sport.sports_centre', map: 'entertainment' },
];

async function fetchCategory(
  group: { categories: string; map: AmenityCategory },
  lat: string,
  lng: string,
  radius: string,
  apiKey: string
): Promise<Amenity[]> {
  const url = `https://api.geoapify.com/v2/places?categories=${group.categories}&filter=circle:${lng},${lat},${radius}&limit=20&apiKey=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();

  return (data.features || []).map((f: any, i: number) => ({
    id: f.properties.place_id || `${group.map}-${i}`,
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
    name: f.properties.name || f.properties.address_line1 || 'Unknown',
    type: (f.properties.categories?.[0] || 'unknown').split('.').pop(),
    category: group.map,
    tags: { datasource: 'geoapify' },
  }));
}

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get('lat');
  const lng = request.nextUrl.searchParams.get('lng');
  const radius = request.nextUrl.searchParams.get('radius') || '5000';

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Missing lat/lng parameters' },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEOAPIFY_API_KEY is not configured in .env.local' },
      { status: 500 }
    );
  }

  try {
    // Fire all 9 category requests in parallel
    const results = await Promise.all(
      CATEGORY_GROUPS.map((group) =>
        fetchCategory(group, lat, lng, radius, apiKey)
      )
    );

    const amenities = results.flat();

    return NextResponse.json({ amenities });
  } catch (error: any) {
    console.error('Amenities fetch error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch amenities. Please try again.' },
      { status: 502 }
    );
  }
}
