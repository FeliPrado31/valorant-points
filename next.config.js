/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static optimization for pages that require authentication
  // This prevents build-time issues with pages that make authenticated API calls
  experimental: {
    // Enable modern bundling optimizations
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },



  // Optimize images and assets
  images: {
    domains: ['media.valorant-api.com', 'titles.trackercdn.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Security headers for production
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
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Webpack configuration for better production builds
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Output configuration
  output: 'standalone',

  // Disable x-powered-by header
  poweredByHeader: false,

  // Compress responses
  compress: true,


};

module.exports = nextConfig;
