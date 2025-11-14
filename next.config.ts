import type { NextConfig } from "next";

// Bundle Analyzer Configuration
// Install with: npm install --save-dev @next/bundle-analyzer
// Uncomment the imports below after installation
// import withBundleAnalyzer from '@next/bundle-analyzer'

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Performance optimizations
  experimental: {
    // Enable optimizeCss for production builds
    optimizeCss: true,
  },

  // Production build optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Webpack bundle optimization
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Separate Recharts into its own chunk
            recharts: {
              test: /[\\/]node_modules[\\/](recharts|d3-.*)[\\/]/,
              name: 'recharts',
              priority: 20,
            },
            // Separate tRPC into its own chunk
            trpc: {
              test: /[\\/]node_modules[\\/](@trpc|@tanstack\/react-query)[\\/]/,
              name: 'trpc',
              priority: 15,
            },
            // Separate Supabase into its own chunk
            supabase: {
              test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
              name: 'supabase',
              priority: 15,
            },
            // Default vendor chunk
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }
    return config
  },
};

// Bundle Analyzer wrapper (enable with ANALYZE=true)
// Uncomment after installing @next/bundle-analyzer:
// export default withBundleAnalyzer({
//   enabled: process.env.ANALYZE === 'true',
// })(nextConfig)

export default nextConfig;
