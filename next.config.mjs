/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  allowedDevOrigins: ["*.127.0.0.1.nip.io"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "storage.mynute.app",
      },
    ],
  },
};

export default nextConfig;
