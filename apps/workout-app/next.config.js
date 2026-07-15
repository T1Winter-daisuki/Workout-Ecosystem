/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy mọi /api/* sang BE — trình duyệt chỉ thấy domain FE nên cookie
  // httpOnly do BE set trở thành first-party, middleware đọc được (và khỏi cần CORS)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
