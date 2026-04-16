/** @type {import('next').NextConfig} */
const nextConfig = {
  // Žádné external images — privacy-first
  images: {
    unoptimized: true,
  },
  // Supabase SSR potřebuje server components external packages
  experimental: {
    serverComponentsExternalPackages: ['@supabase/ssr'],
  },
  // Žádné telemetry headery
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'no-referrer' },
        { key: 'Permissions-Policy', value: 'geolocation=(), camera=(), microphone=()' },
      ],
    },
  ],
}

export default nextConfig
