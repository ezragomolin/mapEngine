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
  Grid,
  Slider,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import { AmenityCategory } from '@/types';
import { CATEGORY_CONFIG } from '@/lib/categories';

const CATEGORIES = (
  Object.keys(CATEGORY_CONFIG) as AmenityCategory[]
).filter((c) => c !== 'other');

export interface WalkingSettings {
  radiusKm: number;
  targets: Record<AmenityCategory, number>;
}

export interface DrivingSettings {
  radiusKm: number;
  targets: Record<AmenityCategory, number>;
}

export interface UrbanSettings {
  radiusKm: number;
  urbanThreshold: number;
  suburbanThreshold: number;
}

// ─── Walking Settings Dialog ───────────────────────────────────────

interface WalkingSettingsDialogProps {
  settings: WalkingSettings;
  onSave: (s: WalkingSettings) => void;
  color: string;
}

export function WalkingSettingsButton({
  settings,
  onSave,
  color,
}: WalkingSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [radiusKm, setRadiusKm] = useState(settings.radiusKm);
  const [targets, setTargets] = useState({ ...settings.targets });

  const handleOpen = () => {
    setRadiusKm(settings.radiusKm);
    setTargets({ ...settings.targets });
    setOpen(true);
  };

  const handleSave = () => {
    onSave({ radiusKm, targets });
    setOpen(false);
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        size="small"
        sx={{
          position: 'absolute',
          top: 6,
          right: 6,
          color: 'text.secondary',
          '&:hover': { color, bgcolor: `${color}14` },
        }}
      >
        <TuneIcon fontSize="small" />
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
            Walking Score Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Adjust radius and the amenity counts needed for a perfect score
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Walking Radius: {radiusKm.toFixed(1)} km
            </Typography>
            <Slider
              value={radiusKm}
              onChange={(_, v) => setRadiusKm(v as number)}
              min={0.2}
              max={3}
              step={0.1}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v.toFixed(1)} km`}
              sx={{ color }}
            />
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Amenity Targets (count for 100%)
          </Typography>
          <Grid container spacing={2}>
            {CATEGORIES.map((category) => {
              const config = CATEGORY_CONFIG[category];
              return (
                <Grid item xs={6} key={category}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontSize="1.2rem">{config.icon}</Typography>
                    <TextField
                      label={config.label}
                      type="number"
                      size="small"
                      value={targets[category]}
                      onChange={(e) => {
                        const num = parseInt(e.target.value, 10);
                        setTargets((prev) => ({
                          ...prev,
                          [category]: isNaN(num) || num < 0 ? 0 : num,
                        }));
                      }}
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
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: color, '&:hover': { bgcolor: color } }}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ─── Driving Settings Dialog ───────────────────────────────────────

interface DrivingSettingsDialogProps {
  settings: DrivingSettings;
  onSave: (s: DrivingSettings) => void;
  color: string;
}

export function DrivingSettingsButton({
  settings,
  onSave,
  color,
}: DrivingSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [radiusKm, setRadiusKm] = useState(settings.radiusKm);
  const [targets, setTargets] = useState({ ...settings.targets });

  const handleOpen = () => {
    setRadiusKm(settings.radiusKm);
    setTargets({ ...settings.targets });
    setOpen(true);
  };

  const handleSave = () => {
    onSave({ radiusKm, targets });
    setOpen(false);
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        size="small"
        sx={{
          position: 'absolute',
          top: 6,
          right: 6,
          color: 'text.secondary',
          '&:hover': { color, bgcolor: `${color}14` },
        }}
      >
        <TuneIcon fontSize="small" />
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
            Driving Score Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Adjust radius and the amenity counts needed for a perfect score
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Driving Radius: {radiusKm.toFixed(1)} km
            </Typography>
            <Slider
              value={radiusKm}
              onChange={(_, v) => setRadiusKm(v as number)}
              min={1}
              max={15}
              step={0.5}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v.toFixed(1)} km`}
              sx={{ color }}
            />
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Amenity Targets (count for 100%)
          </Typography>
          <Grid container spacing={2}>
            {CATEGORIES.map((category) => {
              const config = CATEGORY_CONFIG[category];
              return (
                <Grid item xs={6} key={category}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontSize="1.2rem">{config.icon}</Typography>
                    <TextField
                      label={config.label}
                      type="number"
                      size="small"
                      value={targets[category]}
                      onChange={(e) => {
                        const num = parseInt(e.target.value, 10);
                        setTargets((prev) => ({
                          ...prev,
                          [category]: isNaN(num) || num < 0 ? 0 : num,
                        }));
                      }}
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
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: color, '&:hover': { bgcolor: color } }}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ─── Urban Settings Dialog ─────────────────────────────────────────

interface UrbanSettingsDialogProps {
  settings: UrbanSettings;
  onSave: (s: UrbanSettings) => void;
  color: string;
}

export function UrbanSettingsButton({
  settings,
  onSave,
  color,
}: UrbanSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [radiusKm, setRadiusKm] = useState(settings.radiusKm);
  const [urbanThreshold, setUrbanThreshold] = useState(settings.urbanThreshold);
  const [suburbanThreshold, setSuburbanThreshold] = useState(settings.suburbanThreshold);

  const handleOpen = () => {
    setRadiusKm(settings.radiusKm);
    setUrbanThreshold(settings.urbanThreshold);
    setSuburbanThreshold(settings.suburbanThreshold);
    setOpen(true);
  };

  const handleSave = () => {
    onSave({ radiusKm, urbanThreshold, suburbanThreshold });
    setOpen(false);
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        size="small"
        sx={{
          position: 'absolute',
          top: 6,
          right: 6,
          color: 'text.secondary',
          '&:hover': { color, bgcolor: `${color}14` },
        }}
      >
        <TuneIcon fontSize="small" />
      </IconButton>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Urban Index Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Adjust the radius and thresholds for the urban/suburban/rural classification
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Search Radius: {radiusKm.toFixed(1)} km
            </Typography>
            <Slider
              value={radiusKm}
              onChange={(_, v) => setRadiusKm(v as number)}
              min={0.5}
              max={10}
              step={0.5}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v.toFixed(1)} km`}
              sx={{ color }}
            />
          </Box>

          <TextField
            label="Urban threshold (amenities >=)"
            type="number"
            size="small"
            fullWidth
            value={urbanThreshold}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              setUrbanThreshold(isNaN(n) || n < 0 ? 0 : n);
            }}
            inputProps={{ min: 0 }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Suburban threshold (amenities >=)"
            type="number"
            size="small"
            fullWidth
            value={suburbanThreshold}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              setSuburbanThreshold(isNaN(n) || n < 0 ? 0 : n);
            }}
            inputProps={{ min: 0 }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: color, '&:hover': { bgcolor: color } }}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
