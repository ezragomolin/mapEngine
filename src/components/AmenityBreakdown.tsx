'use client';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
} from '@mui/material';
import { CategoryCount } from '@/types';
import { CATEGORY_CONFIG } from '@/lib/categories';

interface AmenityBreakdownProps {
  title: string;
  breakdown: CategoryCount[];
  loading?: boolean;
}

export default function AmenityBreakdown({
  title,
  breakdown,
  loading,
}: AmenityBreakdownProps) {
  const maxCount = Math.max(...breakdown.map((b) => b.count), 1);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {loading ? (
          <Box sx={{ py: 3 }}>
            <LinearProgress />
          </Box>
        ) : breakdown.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            No amenities found in this radius.
          </Typography>
        ) : (
          <Grid container spacing={1}>
            {breakdown.map(({ category, label, count, icon }) => (
              <Grid item xs={12} sm={6} key={category}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 0.5,
                  }}
                >
                  <Typography fontSize="1.2rem">{icon}</Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 0.25,
                      }}
                    >
                      <Typography
                        variant="body2"
                        noWrap
                        fontWeight={500}
                      >
                        {label}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        {count}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / maxCount) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'grey.100',
                        '& .MuiLinearProgress-bar': {
                          bgcolor:
                            CATEGORY_CONFIG[category]?.color ||
                            'grey.400',
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
