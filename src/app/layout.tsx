import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import ThemeRegistry from '@/components/ThemeRegistry';
import 'mapbox-gl/dist/mapbox-gl.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Map Engine - Address Insights',
  description:
    'Discover walking scores, driving scores, and urban insights for any address.',
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      <body
        className={inter.className}
        style={{
          margin: 0,
          minHeight: '100dvh',
          overscrollBehavior: 'none',
          WebkitTextSizeAdjust: '100%',
        }}
      >
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
