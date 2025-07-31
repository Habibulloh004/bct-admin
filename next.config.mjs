/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "q-bit.uz",
        // port: "3000",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
