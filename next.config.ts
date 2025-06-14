import MillionLint from '@million/lint';

import withPWA from 'next-pwa';


/** @type {import('next').NextConfig} */
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
                ? '*' // This will be replaced with more specific logic below
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
    optimizePackageImports: [
      '@tabler/icons-react',
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      'date-fns',
      'drizzle-orm'
    ],
    optimizeCss: true,
  },
  compress: true,
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Enable tree shaking for production builds
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            default: false,
            vendors: false,
            
            // Vendor chunk for core dependencies
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            
            // UI library chunk
            ui: {
              name: 'ui',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|@heroicons)[\\/]/,
              priority: 30,
              enforce: true,
            },
            
            // Icons chunk
            icons: {
              name: 'icons',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](@tabler\/icons-react|lucide-react|@radix-ui\/react-icons)[\\/]/,
              priority: 25,
              enforce: true,
            },
            
            // Database and auth chunk
            data: {
              name: 'data',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](drizzle-orm|better-auth|pg|postgres|zod)[\\/]/,
              priority: 20,
              enforce: true,
            },
            
            // Utils chunk
            utils: {
              name: 'utils',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](date-fns|clsx|class-variance-authority|tailwind-merge|use-debounce)[\\/]/,
              priority: 15,
              enforce: true,
            },
            
            // Common chunk for shared modules
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };

      // Minimize bundle analyzer output in production
      config.plugins = config.plugins || [];
      
      // Add module concatenation for better tree shaking
      if (!isServer) {
        config.optimization.concatenateModules = true;
      }
    }

    return config;
  }
});



export default(nextConfig);