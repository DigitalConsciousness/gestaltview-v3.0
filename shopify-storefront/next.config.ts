import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  experimental: {
    turbopackLocalPostcssConfig: true,
  },
};

export default nextConfig;
