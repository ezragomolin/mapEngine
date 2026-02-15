'use client';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material';

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  label?: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
  /** Slot for a settings button rendered in top-right corner */
  settingsSlot?: React.ReactNode;
}

export default function ScoreCard({
  title,
  score,
  maxScore,
  label,
  subtitle,
  icon,
  color,
  loading,
  settingsSlot,
}: ScoreCardProps) {
  return (
    <Card sx={{ height: '100%', position: 'relative' }}>
      {settingsSlot}
      <CardContent
        sx={{
          textAlign: 'center',
          py: 1.5,
          px: 1.5,
          '&:last-child': { pb: 1.5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ mb: 0.25, lineHeight: 1 }}>{icon}</Box>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, fontWeight: 600 }}>
          {title}
        </Typography>
        {loading ? (
          <CircularProgress size={44} sx={{ my: 0.5 }} />
        ) : maxScore ? (
          <Box
            sx={{
              position: 'relative',
              display: 'inline-flex',
              my: 0.25,
              width: 56,
              height: 56,
            }}
          >
            <CircularProgress
              variant="determinate"
              value={(score / maxScore) * 100}
              size={56}
              thickness={3}
              sx={{ color, position: 'absolute', top: 0, left: 0 }}
            />
            <Box
              sx={{
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Typography
                sx={{ fontWeight: 700, color, lineHeight: 1, fontSize: '1.15rem' }}
              >
                {score}
              </Typography>
              <Typography
                sx={{ fontSize: '0.65rem', lineHeight: 1, color: 'text.secondary' }}
              >
                /{maxScore}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color, my: 0.25 }}
          >
            {score}
          </Typography>
        )}
        {label && (
          <Typography
            sx={{ fontWeight: 600, color, lineHeight: 1.2, fontSize: '0.8rem' }}
          >
            {label}
          </Typography>
        )}
        {subtitle && (
          <Typography
            sx={{ fontSize: '0.65rem', color: 'text.secondary', mt: 0.25, lineHeight: 1 }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
