/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "mainatural.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "quickchart.io" },
    ],
  },
};

module.exports = nextConfig;
