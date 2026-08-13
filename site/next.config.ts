import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
};

export default nextConfig;
