/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    if (process.env.API_URL) {
      return [
        {
          source: '/api/external/:path*',
          destination: `${process.env.API_URL}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
