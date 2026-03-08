import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

// Add security headers (CSP) with a relaxed dev policy including
// the known inline script hash reported by the browser, and a
// stricter policy for production.
// Disable automatic Content-Security-Policy emission here.
// CSP can be managed later via a stricter, reviewed policy with nonces.
nextConfig.headers = async () => {
  return [];
};

export default nextConfig;
