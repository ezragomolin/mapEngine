'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Paper,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaceIcon from '@mui/icons-material/Place';
import { getSearchHistory, clearHistory } from '@/lib/history';
import { SearchHistoryItem } from '@/types';

export default function SearchHistory() {
  const router = useRouter();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  if (history.length === 0) return null;

  const handleClick = (item: SearchHistoryItem) => {
    const params = new URLSearchParams({
      lat: item.lat.toString(),
      lng: item.lng.toString(),
      q: item.address,
    });
    router.push(`/address?${params.toString()}`);
  };

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <Paper sx={{ mt: 4, p: 2, borderRadius: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon color="action" />
          <Typography variant="subtitle1" fontWeight={600}>
            Recent Searches
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={handleClear}
          title="Clear history"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
      <List dense disablePadding>
        {history.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              onClick={() => handleClick(item)}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <PlaceIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.address}
                primaryTypographyProps={{
                  noWrap: true,
                  fontSize: '0.9rem',
                }}
                secondary={new Date(item.timestamp).toLocaleDateString()}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
