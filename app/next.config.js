/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  turbopack: {},
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    domains: ['example.com', 'api.dutchbasar.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  env: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  },
  // Ensure Webpack resolves the '@' alias to the src directory
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

module.exports = nextConfig;