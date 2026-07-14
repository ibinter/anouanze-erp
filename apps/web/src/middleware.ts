import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/tarifs', '/demo', '/contact', '/mentions-legales', '/confidentialite', '/cgu', '/cgs', '/cookies', '/aide', '/licence', '/conditions-commerciales', '/propriete-intellectuelle', '/conditions-sara'];
const AUTH_PATHS = ['/login', '/mot-de-passe-oublie', '/reinitialiser-mot-de-passe'];
const SUPERADMIN_PREFIX = '/superadmin';

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
    return NextResponse.next();
  }

  // Pages publiques marketing — accessibles à tous, connecté ou non
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Pages auth — redirige les connectés vers /dashboard
  if (AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
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
    pathname.startsWith('/aide')
  ) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|logo|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|css|js)$).*)'],
};
