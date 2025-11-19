/* eslint-disable @typescript-eslint/no-require-imports */
const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.convex.cloud",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "convex.cloud",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
    ],
  },
  turbopack: {},
};

module.exports = withNextIntl(nextConfig);
