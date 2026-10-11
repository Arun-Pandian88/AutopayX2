const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/next.config.ts';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  'const nextConfig: NextConfig = {\n  /* config options here */\n};',
  `const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*'
      }
    ]
  }
};`
);

fs.writeFileSync(file, data);
