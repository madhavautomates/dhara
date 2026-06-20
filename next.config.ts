import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ohdjqwnxgnskqjhwmvab.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: '*.shopify.com' },
      { protocol: 'https', hostname: 'www.1mg.com' },
      { protocol: 'https', hostname: 'onemg.com' },
      { protocol: 'https', hostname: 'assets.pharmeasy.in' },
      { protocol: 'https', hostname: 'www.netmeds.com' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default nextConfig
