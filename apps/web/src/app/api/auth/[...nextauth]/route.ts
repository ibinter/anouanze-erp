import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const apiUrl = process.env.API_URL ?? 'http://localhost:4000';
          const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              motDePasse: credentials.password,
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
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.organisationId = (user as any).organisationId;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      (session as any).organisationId = token.organisationId;
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
