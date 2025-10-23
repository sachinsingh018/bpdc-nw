import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // experimental: {
  //   ppr: true,
  // },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)', // Match all routes
        headers: [
          {
            key: 'Content-Language',
            value: 'en', // Explicitly declare English
          },
        ],
      },
    ];
  },
};

export default nextConfig;
