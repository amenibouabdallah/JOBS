import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress hydration warnings caused by browser extensions
  // (e.g., password managers, form fillers adding attributes like fdprocessedid)
  reactStrictMode: true,
};

export default nextConfig;
