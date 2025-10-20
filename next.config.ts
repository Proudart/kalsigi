import withPWA from 'next-pwa';
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'false'
});

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})({
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000',
          }
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production'
              ? '*'
              : 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,PATCH,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
  reactStrictMode: true,
  output: 'standalone',
  poweredByHeader: false,
  generateEtags: true,
  images: {
    minimumCacheTTL: 31536000,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [{
      protocol: 'https',
      hostname: 'cnn.kadkomi.com',
      pathname: '/**'
    },
    {
      protocol: 'https',
      hostname: 'image.kadkomi.com',
      pathname: '/**'
    },
    {
      protocol: 'https',
      hostname: 'gg.asuracomic.net',
      pathname: '/**'
    }],
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async rewrites() {
    return [{
      source: '/sitemap.xml',
      destination: '/sitemap',
    },
    {
      source: '/komic/:path*',
      destination: 'https://cnn.manhwacall.com/komic/:path*'
    }
    ];
  },
  bundlePagesRouterDependencies: true,
  experimental: {
    // Enable Turbopack for development

    optimizePackageImports: [
      '@tabler/icons-react',
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
      'drizzle-orm',
      'react-hook-form'
    ],
    optimizeCss: true,
  },
   turbopack: {
      // Optional: Configure Turbopack-specific options
      rules: {
        // You can add custom loader rules here if needed
      },
    },
  compress: true,
  webpack: (config, { dev, isServer }) => {
    // Note: This webpack config will be ignored when using Turbopack
    // Keep it for production builds or when Turbopack is disabled
    if (!dev && !isServer) {
      // Only apply custom splitChunks to client-side bundles
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        minimize: true,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            default: false,
            vendors: false,
            // Core React/Next.js
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|next|scheduler)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // UI libraries (Radix)
            ui: {
              name: 'ui',
              chunks: 'async',
              test: /[\\/]node_modules[\\/](@radix-ui)[\\/]/,
              priority: 30,
              enforce: true,
            },
            // Icons - load on demand
            icons: {
              name: 'icons',
              chunks: 'async',
              test: /[\\/]node_modules[\\/](@tabler\/icons-react|lucide-react)[\\/]/,
              priority: 25,
              enforce: true,
            },
            // Utilities
            utils: {
              name: 'utils',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](date-fns|clsx|class-variance-authority|tailwind-merge|use-debounce)[\\/]/,
              priority: 20,
              enforce: true,
            },
            // Auth libraries
            auth: {
              name: 'auth',
              chunks: 'async',
              test: /[\\/]node_modules[\\/](better-auth|oslo)[\\/]/,
              priority: 18,
              enforce: true,
            },
            // Data fetching
            data: {
              name: 'data',
              chunks: 'async',
              test: /[\\/]node_modules[\\/](swr|drizzle-orm)[\\/]/,
              priority: 15,
              enforce: true,
            },
            // Common chunks used across routes
            common: {
              name: 'common',
              minChunks: 3,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
      config.optimization.concatenateModules = true;
      config.optimization.moduleIds = 'deterministic';
    }
    return config;
  }
});

export default withBundleAnalyzer(nextConfig);