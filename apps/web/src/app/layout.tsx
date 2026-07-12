import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased bg-neutral-50 text-neutral-800`}>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
