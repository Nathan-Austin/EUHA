/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'YOUR_PROJECT_REF.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'awards.heatawards.eu',
          },
        ],
        destination: 'https://heatawards.eu/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;