import type { NextConfig } from "next";
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

const nextConfig: NextConfig = {
  // Performance optimizations for mobile
  poweredByHeader: false,
  
  // Image optimization for mobile
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Compression
  compress: true,
  
  // Bundle optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side optimizations for mobile
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Optimize for mobile bundle size
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }
    return config;
  },
  
  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    root: '/workspaces/Decision-Timeout/decision-timeout',
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'localhost:3001',
        'localhost:3002', 
        'localhost:3003',
        'glowing-couscous-rqq4vr4r5gx2p44j-3000.app.github.dev',
        'glowing-couscous-rqq4vr4r5gx2p44j-3001.app.github.dev',
        'glowing-couscous-rqq4vr4r5gx2p44j-3002.app.github.dev',
        'glowing-couscous-rqq4vr4r5gx2p44j-3003.app.github.dev',
        '*.app.github.dev'
      ]
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Cache static assets for better mobile performance
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },
};

export default withPWA(nextConfig);
