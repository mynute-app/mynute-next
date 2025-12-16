/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/app-local-images/**",
      },
      {
        protocol: "https",
        hostname: "storage.mynute.app",
      },
    ],
  },
};

export default nextConfig;
