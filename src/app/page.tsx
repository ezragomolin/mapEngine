'use client';
import Image from 'next/image';
import { Box, Container, Typography } from '@mui/material';
import AddressSearch from '@/components/AddressSearch';
import SearchHistory from '@/components/SearchHistory';

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #1565c0 0%, #0d47a1 50%, #004d73 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Container maxWidth="md" sx={{ pt: { xs: 6, md: 10 }, pb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1.5,
            }}
          >
            <Image
              src="/logo.png"
              alt="Map Engine Logo"
              width={320}
              height={180}
              priority
              style={{
                objectFit: 'contain',
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 400,
              mb: 2.5,
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            Discover walkability, drivability, and urban insights for any
            address
          </Typography>
          <AddressSearch />
        </Box>
        <SearchHistory />
      </Container>
    </Box>
  );
}
