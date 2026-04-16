import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export', // MANDATORY for S3/CloudFront deployment
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;