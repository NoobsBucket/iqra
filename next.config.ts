import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const r2PublicUrl = process.env.R2_PUBLIC_URL?.trim();
const remoteHost = r2PublicUrl ? new URL(r2PublicUrl).hostname : "pub-f22649588203401db882dbadc4d8f184.r2.dev";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: remoteHost,
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
initOpenNextCloudflareForDev();
