'use client';
import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Typography,
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import { AmenityCategory } from '@/types';
import { CATEGORY_CONFIG } from '@/lib/categories';
import {
  PERFECT_WALKING,
  PERFECT_DRIVING,
} from '@/lib/scoring';

// Categories to show (exclude "other")
const CATEGORIES = (
  Object.keys(CATEGORY_CONFIG) as AmenityCategory[]
).filter((c) => c !== 'other');

interface ScoreSettingsProps {
  walkingTargets: Record<AmenityCategory, number>;
  drivingTargets: Record<AmenityCategory, number>;
  onSave: (
    walking: Record<AmenityCategory, number>,
    driving: Record<AmenityCategory, number>
  ) => void;
}

export default function ScoreSettings({
  walkingTargets,
  drivingTargets,
  onSave,
}: ScoreSettingsProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [walking, setWalking] = useState({ ...walkingTargets });
  const [driving, setDriving] = useState({ ...drivingTargets });

  const handleOpen = () => {
    setWalking({ ...walkingTargets });
    setDriving({ ...drivingTargets });
    setOpen(true);
  };

  const handleSave = () => {
    onSave(walking, driving);
    setOpen(false);
  };

  const handleReset = () => {
    setWalking({ ...PERFECT_WALKING });
    setDriving({ ...PERFECT_DRIVING });
  };

  const current = tab === 0 ? walking : driving;
  const setCurrent = tab === 0 ? setWalking : setDriving;

  const updateValue = (category: AmenityCategory, value: string) => {
    const num = parseInt(value, 10);
    setCurrent((prev) => ({
      ...prev,
      [category]: isNaN(num) || num < 0 ? 0 : num,
    }));
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          color: 'white',
          bgcolor: 'rgba(255,255,255,0.1)',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
          mr: 1,
        }}
        title="Score Settings"
        size="small"
      >
        <TuneIcon />
      </IconButton>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Customize Perfect Scores
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set how many of each amenity you consider a perfect score
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ mb: 2 }}
          >
            <Tab label="Walking (1 km)" />
            <Tab label="Driving (5 km)" />
          </Tabs>

          <Grid container spacing={2}>
            {CATEGORIES.map((category) => {
              const config = CATEGORY_CONFIG[category];
              return (
                <Grid item xs={6} key={category}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontSize="1.2rem">
                      {config.icon}
                    </Typography>
                    <TextField
                      label={config.label}
                      type="number"
                      size="small"
                      value={current[category]}
                      onChange={(e) => updateValue(category, e.target.value)}
                      inputProps={{ min: 0, max: 99 }}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleReset} color="inherit" size="small">
            Reset Defaults
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
