import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CannaRoute — Cannabis Delivery Platform',
  description:
    'The complete cannabis delivery platform. Real-time logistics, dispensary management, grower transparency, and multi-state compliance — built for every legal market.',
  keywords: [
    'cannabis delivery',
    'dispensary software',
    'cannabis logistics',
    'cannabis delivery platform',
    'cannabis compliance',
    'Michigan cannabis',
    'cannabis SaaS',
  ],
  openGraph: {
    title: 'CannaRoute — Cannabis Delivery Platform',
    description:
      'Real-time delivery logistics, dispensary management, and grower transparency — one platform for every legal state.',
    url: 'https://canna-route.com',
    siteName: 'CannaRoute',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CannaRoute — Cannabis Delivery Platform',
    description: 'The complete cannabis delivery platform for every legal state.',
  },
  metadataBase: new URL('https://canna-route.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
