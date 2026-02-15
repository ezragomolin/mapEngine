'use client';
import { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Amenity } from '@/types';
import { CATEGORY_CONFIG } from '@/lib/categories';

interface InsightsMapProps {
  lat: number;
  lng: number;
  amenities: Amenity[];
  loading?: boolean;
}

export default function InsightsMap({
  lat,
  lng,
  amenities,
  loading,
}: InsightsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    import('mapbox-gl').then((mapboxglModule) => {
      const mapboxgl = mapboxglModule.default || mapboxglModule;
      (mapboxgl as any).accessToken = token;

      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [lng, lat],
        zoom: 14,
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Center marker (the searched address)
      const markerEl = document.createElement('div');
      markerEl.style.width = '20px';
      markerEl.style.height = '20px';
      markerEl.style.borderRadius = '50%';
      markerEl.style.backgroundColor = '#1565c0';
      markerEl.style.border = '3px solid white';
      markerEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

      new mapboxgl.Marker({ element: markerEl })
        .setLngLat([lng, lat])
        .addTo(map);

      mapRef.current = map;
      map.on('load', () => setMapLoaded(true));
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  // Add amenity markers when data changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !amenities.length) return;

    import('mapbox-gl').then((mapboxglModule) => {
      const mapboxgl = mapboxglModule.default || mapboxglModule;

      // Remove old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      amenities.forEach((amenity) => {
        const config = CATEGORY_CONFIG[amenity.category];
        const el = document.createElement('div');
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = config.color;
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.2)';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontSize = '12px';
        el.style.cursor = 'pointer';
        el.textContent = config.icon;

        const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(
          `<strong>${amenity.name}</strong><br/><span style="color: ${config.color}">${config.label}</span>`
        );

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([amenity.lng, amenity.lat])
          .setPopup(popup)
          .addTo(mapRef.current);

        markersRef.current.push(marker);
      });
    });
  }, [amenities, mapLoaded]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 350, md: 500 },
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: 'grey.100',
      }}
    >
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {(loading || !mapLoaded) && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.7)',
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
