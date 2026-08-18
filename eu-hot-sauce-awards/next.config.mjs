/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // 👈 disable Vercel image optimization
    // remotePatterns disabled: Supabase storage images are no longer used
    // Keeping this commented for easy restore if needed during testing.
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'csweurtdldauwrthqafo.supabase.co',
    //     pathname: '/storage/v1/object/public/**',
    //   },
    // ],
    remotePatterns: [],
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
      {
        // Leftover permalink shape from the old WordPress site — send any
        // stray bookmarks/backlinks to the real archive route.
        source: '/results-2024',
        destination: '/results/2024',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
