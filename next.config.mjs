/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Apenas no servidor, incluímos o SQLite
    if (isServer) {
      return config;
    }

    // No cliente, ignoramos o SQLite
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "better-sqlite3": false,
    };

    return config;
  },
  // Outras configurações...
};

export default nextConfig;