import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';
import PWARegister from '@/components/pwa/PWARegister';
import { ThemeProvider, themeInitScript } from '@/components/theme/ThemeProvider';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | ANOUANZÊ ERP',
    default: 'ANOUANZÊ ERP — L\'ERP des associations et ONG',
  },
  description:
    "L'ERP des associations, ONG et organisations à but non lucratif. Conforme SYCEBNL, adapté aux réalités africaines.",
  keywords: ['ERP', 'ONG', 'association', 'SYCEBNL', 'OHADA', 'Afrique', 'gestion'],
  authors: [{ name: 'IBIG SOFT (Intermark Business International Group)', url: 'https://ibigsoft.com' }],
  creator: 'IBIG SOFT (Intermark Business International Group)',
  robots: 'index, follow',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ANOUANZÊ ERP',
  },
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

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} font-sans antialiased bg-neutral-50 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-100`}
      >
        {/* Anti-flash : applique la classe `dark` avant le premier rendu */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
