'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextField,
  Autocomplete,
  CircularProgress,
  InputAdornment,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { AddressResult } from '@/types';

function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as unknown as T;
}

export default function AddressSearch() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setOptions([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setOptions(data.results || []);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchSuggestions(inputValue);
  }, [inputValue, fetchSuggestions]);

  const handleSelect = (
    _: any,
    value: string | AddressResult | null
  ) => {
    if (value && typeof value !== 'string') {
      const params = new URLSearchParams({
        lat: value.lat.toString(),
        lng: value.lng.toString(),
        q: value.display_name,
      });
      router.push(`/address?${params.toString()}`);
    }
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.display_name
      }
      filterOptions={(x) => x}
      inputValue={inputValue}
      onInputChange={(_, value) => setInputValue(value)}
      onChange={handleSelect}
      loading={loading}
      PaperComponent={(props) => (
        <Paper {...props} elevation={8} sx={{ borderRadius: 2, mt: 1 }} />
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Enter a street address..."
          variant="outlined"
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white',
              borderRadius: 3,
              fontSize: '1.1rem',
              py: 0.5,
            },
          }}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={`${option.lat}-${option.lng}`}>
          {option.display_name}
        </li>
      )}
    />
  );
}
