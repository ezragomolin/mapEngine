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
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

export default function ScoreCard({
  title,
  score,
  maxScore,
  label,
  icon,
  color,
  loading,
}: ScoreCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box sx={{ mb: 1 }}>{icon}</Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {loading ? (
          <CircularProgress size={60} sx={{ my: 2 }} />
        ) : maxScore ? (
          <Box
            sx={{ position: 'relative', display: 'inline-flex', my: 1 }}
          >
            <CircularProgress
              variant="determinate"
              value={(score / maxScore) * 100}
              size={80}
              thickness={6}
              sx={{ color }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color, lineHeight: 1 }}
              >
                {score}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                /{maxScore}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, color, my: 1 }}
          >
            {score}
          </Typography>
        )}
        {label && (
          <Typography
            variant="body2"
            sx={{ mt: 1, fontWeight: 600, color }}
          >
            {label}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
