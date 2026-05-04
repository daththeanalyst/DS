/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@ds/ui", "@ds/tokens"],
  trailingSlash: true,
};

export default nextConfig;
