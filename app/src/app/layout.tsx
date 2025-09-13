import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DutchBasar - Premium NFT Dutch Auctions',
  description: 'Experience the future of NFT minting with dynamic pricing, gas-optimized contracts, and multi-chain support. Built with cutting-edge Web3 technology.',
  keywords: ['NFT', 'Dutch Auction', 'Web3', 'Ethereum', 'ERC-721A', 'Multi-chain'],
  authors: [{ name: 'DutchBasar Team' }],
  openGraph: {
    title: 'DutchBasar - Premium NFT Dutch Auctions',
    description: 'Experience the future of NFT minting with dynamic pricing, gas-optimized contracts, and multi-chain support.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DutchBasar - Premium NFT Dutch Auctions',
    description: 'Experience the future of NFT minting with dynamic pricing, gas-optimized contracts, and multi-chain support.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}