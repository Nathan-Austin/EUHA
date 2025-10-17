/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // 👈 disable Vercel image optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'csweurtdldauwrthqafo.supabase.co',
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
