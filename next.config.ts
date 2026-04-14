import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Silences the "multiple lockfiles" workspace root warning
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Autoriser next/image à charger les logos depuis Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
