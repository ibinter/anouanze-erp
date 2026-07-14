import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      nom?: string;
      prenom?: string;
      avatar?: string;
      langue?: string;
      role?: string;
      organisationId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    organisationId?: string;
    role?: string;
    nom?: string;
    prenom?: string;
    avatar?: string;
    langue?: string;
  }
}
