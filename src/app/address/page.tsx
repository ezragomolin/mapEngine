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
import ScoreSettings from '@/components/ScoreSettings';
import { addToHistory } from '@/lib/history';
import { computeScores, PERFECT_WALKING, PERFECT_DRIVING, CustomTargets } from '@/lib/scoring';
import { Amenity, AmenityCategory, ScoreResult } from '@/types';

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
  const [walkingTargets, setWalkingTargets] = useState<Record<AmenityCategory, number>>({ ...PERFECT_WALKING });
  const [drivingTargets, setDrivingTargets] = useState<Record<AmenityCategory, number>>({ ...PERFECT_DRIVING });

  // Ref to always have access to latest amenities (avoids stale closures)
  const amenitiesRef = useRef<Amenity[]>([]);

  const handleSettingsSave = (
    walking: Record<AmenityCategory, number>,
    driving: Record<AmenityCategory, number>
  ) => {
    setWalkingTargets(walking);
    setDrivingTargets(driving);
    const data = amenitiesRef.current;
    if (data.length > 0) {
      setScores(
        computeScores(data, lat, lng, { walking, driving })
      );
    }
  };

  const fetchAmenities = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/amenities?lat=${lat}&lng=${lng}&radius=5000`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch amenities');
      }
      const data = await res.json();
      const fetchedAmenities: Amenity[] = data.amenities || [];
      setAmenities(fetchedAmenities);
      amenitiesRef.current = fetchedAmenities;
      setScores(computeScores(fetchedAmenities, lat, lng));
    } catch (err: any) {
      setError(
        err.message || 'Failed to load amenity data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!lat && !lng) return;

    // Save to search history
    addToHistory({ address, lat, lng });
    fetchAmenities();
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
          <ScoreSettings
            walkingTargets={walkingTargets}
            drivingTargets={drivingTargets}
            onSave={handleSettingsSave}
          />
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
                onClick={fetchAmenities}
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
            <Grid container spacing={2}>
              <Grid item xs={4} md={12}>
                <ScoreCard
                  title="Walking Score"
                  score={scores?.walkingScore ?? 0}
                  maxScore={100}
                  icon={
                    <DirectionsWalkIcon
                      sx={{ fontSize: 32, color: '#4caf50' }}
                    />
                  }
                  color="#4caf50"
                  loading={loading}
                />
              </Grid>
              <Grid item xs={4} md={12}>
                <ScoreCard
                  title="Driving Score"
                  score={scores?.drivingScore ?? 0}
                  maxScore={100}
                  icon={
                    <DirectionsCarIcon
                      sx={{ fontSize: 32, color: '#2196f3' }}
                    />
                  }
                  color="#2196f3"
                  loading={loading}
                />
              </Grid>
              <Grid item xs={4} md={12}>
                <ScoreCard
                  title="Urban Index"
                  score={scores?.urbanIndex ?? 0}
                  label={scores?.urbanLabel}
                  icon={
                    <LocationCityIcon
                      sx={{ fontSize: 32, color: '#ff9800' }}
                    />
                  }
                  color="#ff9800"
                  loading={loading}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Amenity Breakdowns */}
          <Grid item xs={12} md={6}>
            <AmenityBreakdown
              title="Walking Radius (1 km)"
              breakdown={scores?.walkingBreakdown ?? []}
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <AmenityBreakdown
              title="Driving Radius (5 km)"
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
