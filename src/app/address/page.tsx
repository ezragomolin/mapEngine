'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  IconButton,
  AppBar,
  Toolbar,
  Skeleton,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import InsightsMap from '@/components/InsightsMap';
import ScoreCard from '@/components/ScoreCard';
import AmenityBreakdown from '@/components/AmenityBreakdown';
import ShareButton from '@/components/ShareButton';
import {
  WalkingSettingsButton,
  DrivingSettingsButton,
  UrbanSettingsButton,
  WalkingSettings,
  DrivingSettings,
  UrbanSettings,
} from '@/components/ScoreCardSettings';
import { addToHistory } from '@/lib/history';
import {
  computeScores,
  PERFECT_WALKING,
  PERFECT_DRIVING,
  WALKING_RADIUS_KM,
  DRIVING_RADIUS_KM,
} from '@/lib/scoring';
import { Amenity, ScoreResult } from '@/types';

function AddressInsightsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const address = searchParams.get('q') || 'Unknown Address';

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [scores, setScores] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Per-score settings
  const [walkingSettings, setWalkingSettings] = useState<WalkingSettings>({
    radiusKm: WALKING_RADIUS_KM,
    targets: { ...PERFECT_WALKING },
  });
  const [drivingSettings, setDrivingSettings] = useState<DrivingSettings>({
    radiusKm: DRIVING_RADIUS_KM,
    targets: { ...PERFECT_DRIVING },
  });
  const [urbanSettings, setUrbanSettings] = useState<UrbanSettings>({
    radiusKm: 3.0,
    urbanThreshold: 20,
    suburbanThreshold: 10,
  });

  // Ref to always have access to latest amenities (avoids stale closures)
  const amenitiesRef = useRef<Amenity[]>([]);
  // Track the radius we last fetched at so we know when to re-fetch
  const fetchedRadiusRef = useRef<number>(0);

  const recomputeScores = (
    data: Amenity[],
    ws: WalkingSettings,
    ds: DrivingSettings,
    us: UrbanSettings
  ) => {
    if (data.length === 0) return;
    setScores(
      computeScores(data, lat, lng, {
        walkingRadiusKm: ws.radiusKm,
        drivingRadiusKm: ds.radiusKm,
        urbanRadiusKm: us.radiusKm,
        urbanThreshold: us.urbanThreshold,
        suburbanThreshold: us.suburbanThreshold,
        walkingTargets: ws.targets,
        drivingTargets: ds.targets,
      })
    );
  };

  const fetchAmenities = async (
    ws: WalkingSettings,
    ds: DrivingSettings,
    us: UrbanSettings
  ) => {
    const neededRadiusKm = Math.max(ws.radiusKm, ds.radiusKm, us.radiusKm);
    const neededRadiusM = Math.ceil(neededRadiusKm * 1000);

    // Skip re-fetch if we already have data covering this radius
    if (fetchedRadiusRef.current >= neededRadiusM && amenitiesRef.current.length > 0) {
      recomputeScores(amenitiesRef.current, ws, ds, us);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/amenities?lat=${lat}&lng=${lng}&radius=${neededRadiusM}`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch amenities');
      }
      const data = await res.json();
      const fetchedAmenities: Amenity[] = data.amenities || [];
      setAmenities(fetchedAmenities);
      amenitiesRef.current = fetchedAmenities;
      fetchedRadiusRef.current = neededRadiusM;
      recomputeScores(fetchedAmenities, ws, ds, us);
    } catch (err: any) {
      setError(
        err.message || 'Failed to load amenity data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleWalkingSave = (ws: WalkingSettings) => {
    setWalkingSettings(ws);
    fetchAmenities(ws, drivingSettings, urbanSettings);
  };

  const handleDrivingSave = (ds: DrivingSettings) => {
    setDrivingSettings(ds);
    fetchAmenities(walkingSettings, ds, urbanSettings);
  };

  const handleUrbanSave = (us: UrbanSettings) => {
    setUrbanSettings(us);
    fetchAmenities(walkingSettings, drivingSettings, us);
  };

  useEffect(() => {
    if (!lat && !lng) return;

    // Save to search history
    addToHistory({ address, lat, lng });
    fetchAmenities(walkingSettings, drivingSettings, urbanSettings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  if (!lat && !lng) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          Invalid address. Please go back and search again.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push('/')}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap>
              Address Insights
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }} noWrap>
              {address}
            </Typography>
          </Box>
          <ShareButton />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => fetchAmenities(walkingSettings, drivingSettings, urbanSettings)}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Map */}
          <Grid item xs={12} md={8}>
            <InsightsMap
              lat={lat}
              lng={lng}
              amenities={amenities}
              loading={loading}
            />
          </Grid>

          {/* Score Cards */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'row', md: 'column' },
                gap: 1.5,
                height: { md: 500 },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                <ScoreCard
                  title="Walking Score"
                  score={scores?.walkingScore ?? 0}
                  maxScore={100}
                  subtitle={`${walkingSettings.radiusKm.toFixed(1)} km radius`}
                  icon={
                    <DirectionsWalkIcon
                      sx={{ fontSize: 24, color: '#4caf50' }}
                    />
                  }
                  color="#4caf50"
                  loading={loading}
                  settingsSlot={
                    <WalkingSettingsButton
                      settings={walkingSettings}
                      onSave={handleWalkingSave}
                      color="#4caf50"
                    />
                  }
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                <ScoreCard
                  title="Driving Score"
                  score={scores?.drivingScore ?? 0}
                  maxScore={100}
                  subtitle={`${drivingSettings.radiusKm.toFixed(1)} km radius`}
                  icon={
                    <DirectionsCarIcon
                      sx={{ fontSize: 24, color: '#2196f3' }}
                    />
                  }
                  color="#2196f3"
                  loading={loading}
                  settingsSlot={
                    <DrivingSettingsButton
                      settings={drivingSettings}
                      onSave={handleDrivingSave}
                      color="#2196f3"
                    />
                  }
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                <ScoreCard
                  title="Urban Index"
                  score={scores?.urbanIndex ?? 0}
                  label={scores?.urbanLabel}
                  subtitle={`${urbanSettings.radiusKm.toFixed(1)} km radius`}
                  icon={
                    <LocationCityIcon
                      sx={{ fontSize: 24, color: '#ff9800' }}
                    />
                  }
                  color="#ff9800"
                  loading={loading}
                  settingsSlot={
                    <UrbanSettingsButton
                      settings={urbanSettings}
                      onSave={handleUrbanSave}
                      color="#ff9800"
                    />
                  }
                />
              </Box>
            </Box>
          </Grid>

          {/* Amenity Breakdowns */}
          <Grid item xs={12} md={6}>
            <AmenityBreakdown
              title={`Walking Radius (${walkingSettings.radiusKm.toFixed(1)} km)`}
              breakdown={scores?.walkingBreakdown ?? []}
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <AmenityBreakdown
              title={`Driving Radius (${drivingSettings.radiusKm.toFixed(1)} km)`}
              breakdown={scores?.drivingBreakdown ?? []}
              loading={loading}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default function AddressInsightsPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ p: 4 }}>
          <Skeleton variant="rectangular" height={400} />
        </Box>
      }
    >
      <AddressInsightsContent />
    </Suspense>
  );
}
