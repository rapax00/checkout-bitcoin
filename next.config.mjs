/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABE_URL,
    SUPABASE_SECRET: process.env.SUPABASE_API_TOKEN,
    SIGNER_KEY: process.env.SIGNER_PRIVATE_KEY,
    ADMIN_KEY: process.env.ADMIN_PUBLIC_KEY,
    TICKET_PRICE: process.env.TICKET_PRICE_ARS,
    PASSWORD: process.env.ADMIN_PASSWORD,
    SENDY_URL: process.env.SENDY_API_URL,
    SENDY_KEY: process.env.SENDY_API_KEY,
    SENDY_LIST: process.env.SENDY_LIST_ID,
    AWS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_KEY: process.env.AWS_SECRET_ACCESS_KEY,
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
