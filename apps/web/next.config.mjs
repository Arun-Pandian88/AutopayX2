/** @type {import('next').NextConfig} */
const API_BASE_URL = process.env.API_URL || 'http://127.0.0.1:8000';

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_BASE_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
