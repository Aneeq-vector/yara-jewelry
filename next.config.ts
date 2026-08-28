import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8090',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8090',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pb.yarasl.shop',
        pathname: '/**',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/pb/:path*',
        destination: 'https://pb.yarasl.shop/:path*',
      },
    ];
  },
};

export default nextConfig;
