import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/uni-one",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
