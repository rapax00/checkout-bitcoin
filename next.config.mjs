/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABE_URL,
    SUPABASE_SECRET: process.env.SUPABASE_API_TOKEN,
    SIGNER_KEY: process.env.SIGNER_RANDOM_PRIV_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
