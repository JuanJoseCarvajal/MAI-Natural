/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  outputFileTracingIncludes: { '/products/media/*': ['./assets/product-images/**/*'] },
  async redirects() {
    return Object.entries(require('./lib/product-image-redirects.json')).map(([source, destination]) => ({source, destination, permanent:true}));
  },
  images: { remotePatterns: [{ protocol: "https", hostname: "mainatural.com" }] },
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
    ];
    return [{ source: "/:path*", headers: security },
      ...["account", "dashboard", "admin", "checkout", "login", "register", "forgot-password", "reset-password", "api"].map(route => ({ source: `/${route}/:path*`, headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }))];
  },
};
module.exports = nextConfig;
