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
                ? `https://www.${process.env.site_name}.com` 
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
  i18n: {
    locales: ['en'],
    defaultLocale: 'en'
  },

  images: {
    minimumCacheTTL: 31536000,
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
    }]

  },
  async rewrites() {
    return [{
      source: '/sitemap.xml',
      destination: '/sitemap',
    },
    {
      source: '/komic/:path*',
      destination: 'https://cnn.skaihua.com/komic/:path*'
    }
  ];
  },
  bundlePagesRouterDependencies: true,
  experimental: {
    optimizePackageImports: ['tabler/icons-react','@tabler/icons-react'],
    modern: true,
  },
  compress: true
});



export default MillionLint.next({
  enabled: true,
  rsc: true
})(nextConfig);