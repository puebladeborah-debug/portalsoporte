import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['172.3.10.107', '192.168.*.*, 10.*.*.*'],
};

export default nextConfig;
