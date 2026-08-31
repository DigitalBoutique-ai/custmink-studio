import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingExcludes: {
    "*": ["./archive/**"],
  },
};

export default nextConfig;
