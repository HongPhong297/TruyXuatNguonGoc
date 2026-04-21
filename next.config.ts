import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cho phép import cytoscape, maplibre trong server components
  serverExternalPackages: ['neo4j-driver'],
  images: {
    remotePatterns: [
      // Supabase Storage images
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;
