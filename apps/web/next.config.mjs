import createNextIntlPlugin from 'next-intl/plugin';

// i18n SANS routing par préfixe d'URL : la locale provient du cookie NEXT_LOCALE
// (repli Accept-Language, puis français). Aucune route existante n'est modifiée.
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.anouanze-erp.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3099'] },
  },
};

export default withNextIntl(nextConfig);
