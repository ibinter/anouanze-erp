import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';
import PWARegister from '@/components/pwa/PWARegister';
import { ThemeProvider, themeInitScript } from '@/components/theme/ThemeProvider';
import { FaqJsonLd, SiteJsonLd } from '@/components/seo/JsonLd';
import { PATHNAME_HEADER, SITE_NAME, SITE_URL } from '@/lib/seo';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const DEFAULT_TITLE = "ANOUANZÊ ERP — L'ERP des associations et ONG";
const DEFAULT_DESCRIPTION =
  "L'ERP des associations, ONG et organisations à but non lucratif. Conforme SYCEBNL, adapté aux réalités africaines.";

export const metadata: Metadata = {
  // Indispensable pour que les URLs relatives (canonique, opengraph-image…)
  // soient résolues en absolu dans les balises générées.
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: DEFAULT_TITLE,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: ['ERP', 'ONG', 'association', 'SYCEBNL', 'OHADA', 'Afrique', 'gestion'],
  applicationName: SITE_NAME,
  authors: [{ name: 'IBIG SOFT (Intermark Business International Group)', url: 'https://ibigsoft.com' }],
  creator: 'IBIG SOFT (Intermark Business International Group)',
  publisher: 'IBIG SOFT (Intermark Business International Group)',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  // Canonique par défaut : la racine. Chaque page publique la redéfinit dans
  // son propre `metadata` / `generateMetadata`.
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'fr_FR',
    // L'interface est disponible en anglais, mais via le cookie NEXT_LOCALE
    // (pas d'URL /en/…) : on le signale sans inventer d'URL alternative.
    alternateLocale: ['en_US'],
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    // Image fournie par `app/opengraph-image.tsx` (convention Next.js).
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    // Image fournie par `app/twitter-image.tsx`.
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: SITE_NAME,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#146C43',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Locale résolue côté serveur : cookie NEXT_LOCALE → Accept-Language → 'fr'
  const locale = await getLocale();
  const messages = await getMessages();

  // Le balisage FAQPage ne doit apparaître que là où la FAQ est visible :
  // uniquement la landing. Le chemin vient de l'en-tête posé par le middleware.
  const pathname = headers().get(PATHNAME_HEADER);
  const faqItems =
    pathname === '/'
      ? ((await getTranslations('faq')).raw('items') as Array<{ q: string; a: string }>)
      : [];

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} font-sans antialiased bg-neutral-50 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-100`}
      >
        {/* Anti-flash : applique la classe `dark` avant le premier rendu */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />

        {/* Données structurées schema.org — uniquement des faits vérifiables. */}
        <SiteJsonLd />
        <FaqJsonLd items={faqItems} />

        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <Providers>
              {children}
              <Toaster richColors position="top-right" />
              <PWARegister />
            </Providers>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
