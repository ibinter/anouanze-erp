import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PATHNAME_HEADER } from '@/lib/seo';

const PUBLIC_PATHS = ['/', '/tarifs', '/demo', '/contact', '/mentions-legales', '/confidentialite', '/cgu', '/cgs', '/cookies', '/aide', '/licence', '/conditions-commerciales', '/propriete-intellectuelle', '/conditions-sara'];
const AUTH_PATHS = ['/login', '/mot-de-passe-oublie', '/reinitialiser-mot-de-passe'];
const SUPERADMIN_PREFIX = '/superadmin';

/**
 * Propage le chemin demandé aux composants serveur via un en-tête
 * ({@link PATHNAME_HEADER}). Utilisé par le layout racine pour n'émettre les
 * données structurées spécifiques à la landing (FAQPage) que sur « / ».
 */
function withPathname(request: NextRequest, pathname: string) {
  const headers = new Headers(request.headers);
  headers.set(PATHNAME_HEADER, pathname);
  return NextResponse.next({ request: { headers } });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Superadmin area — nécessite role SUPER_ADMIN
  if (pathname.startsWith(SUPERADMIN_PREFIX)) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if ((token as any).role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return withPathname(request, pathname);
  }

  // Pages publiques marketing — accessibles à tous, connecté ou non
  if (PUBLIC_PATHS.includes(pathname)) {
    return withPathname(request, pathname);
  }

  // Pages auth — redirige les connectés vers /dashboard
  if (AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return withPathname(request, pathname);
  }

  // Pages dashboard — nécessite authentification
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/membres') ||
    pathname.startsWith('/projets') ||
    pathname.startsWith('/comptabilite') ||
    pathname.startsWith('/tresorerie') ||
    pathname.startsWith('/budget') ||
    pathname.startsWith('/rh') ||
    pathname.startsWith('/parametres') ||
    pathname.startsWith('/donateurs') ||
    pathname.startsWith('/bailleurs') ||
    pathname.startsWith('/stocks') ||
    pathname.startsWith('/achats') ||
    pathname.startsWith('/documents') ||
    pathname.startsWith('/evenements') ||
    pathname.startsWith('/reporting') ||
    pathname.startsWith('/gouvernance') ||
    pathname.startsWith('/beneficiaires') ||
    pathname.startsWith('/immobilisations') ||
    pathname.startsWith('/audit') ||
    pathname.startsWith('/ia') ||
    pathname.startsWith('/meal') ||
    pathname.startsWith('/profil') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/tickets') ||
    pathname.startsWith('/import') ||
    pathname.startsWith('/paiements') ||
    pathname.startsWith('/aide')
  ) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return withPathname(request, pathname);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|logo|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|css|js)$).*)'],
};
