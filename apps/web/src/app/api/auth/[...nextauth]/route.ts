import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const ACCESS_TOKEN_TTL = 15 * 60 * 1000; // 15 min (aligné sur l'API)

function apiBase() {
  return (process.env.API_URL ?? 'http://localhost:4000/api/v1').replace(/\/api\/v1$/, '');
}

// Rafraîchit le token d'accès via le refreshToken (7j)
async function refreshAccessToken(token: any) {
  try {
    const res = await fetch(`${apiBase()}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });
    if (!res.ok) throw new Error('refresh failed');
    const data = await res.json();
    if (!data.accessToken) throw new Error('no accessToken');
    return {
      ...token,
      accessToken: data.accessToken,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_TTL,
      refreshToken: data.refreshToken ?? token.refreshToken,
    };
  } catch {
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
        // Code de double authentification — transmis uniquement si le compte l'exige.
        code: { label: 'Code 2FA', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const apiUrl = (process.env.API_URL ?? 'http://localhost:4000/api/v1').replace(/\/api\/v1$/, '');
          const code = credentials.code?.trim();
          const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              motDePasse: credentials.password,
              // Champ omis pour les comptes sans 2FA : flux strictement inchangé.
              ...(code ? { code } : {}),
            }),
          });

          if (!res.ok) return null;

          const data = await res.json();

          if (!data.accessToken) return null;

          return {
            id: data.user?.id ?? '',
            email: data.user?.email ?? credentials.email,
            name: `${data.user?.prenom ?? ''} ${data.user?.nom ?? ''}`.trim(),
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            organisationId: data.user?.organisationId,
            role: data.user?.role,
            nom: data.user?.nom,
            prenom: data.user?.prenom,
            avatar: data.user?.avatar,
            langue: data.user?.langue ?? 'fr',
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Connexion initiale : on stocke tokens + date d'expiration
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.accessTokenExpires = Date.now() + ACCESS_TOKEN_TTL;
        token.organisationId = (user as any).organisationId;
        token.role = (user as any).role;
        token.nom = (user as any).nom;
        token.prenom = (user as any).prenom;
        token.avatar = (user as any).avatar;
        token.langue = (user as any).langue ?? 'fr';
        return token;
      }

      // Token encore valide (marge de 60s) → on le garde
      const expires = (token as any).accessTokenExpires as number | undefined;
      if (expires && Date.now() < expires - 60 * 1000) {
        return token;
      }

      // Token expiré → refresh via le refreshToken
      if ((token as any).refreshToken) {
        return await refreshAccessToken(token);
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      (session.user as any).id = token.sub;
      (session.user as any).organisationId = token.organisationId;
      (session.user as any).role = token.role;
      (session.user as any).nom = token.nom;
      (session.user as any).prenom = token.prenom;
      (session.user as any).avatar = token.avatar;
      (session.user as any).langue = token.langue ?? 'fr';
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
