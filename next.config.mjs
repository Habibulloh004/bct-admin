/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Image optimization o'chirildi
    domains: ["localhost","q-bit.uz"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "q-bit.uz",
      },
    ],
  },
};

export default nextConfig;
