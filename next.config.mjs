/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  cacheHandler: process.env.NODE_ENV === 'production' ? './cache-handler.mjs' : undefined,
};

export default nextConfig;
