import Google from "next-auth/providers/google";
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";

const providers: Provider[] = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
    async profile(profile) {
      console.log("Dados do Google OAuth retornados:", profile);
      return { ...profile };
    },
  }),
  Credentials({
    async authorize(credentials) {
      return { ...credentials };
    },
  }),
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      // Adiciona os campos customizados à sessão
      session.user.id = token.sub as string;
      session.user.email_verified = token.emailVerified as boolean; // Consistência no nome
      session.user.firstName = token.givenName as string;
      session.user.lastName = token.familyName as string;
      return session;
    },
    async jwt({ token, profile }) {
      if (profile) {
        // Adiciona campos do perfil ao token JWT
        token.sub = profile.sub as string;
        token.emailVerified = profile.email_verified;
        token.givenName = profile.given_name;
        token.familyName = profile.family_name;
      }
      return token;
    },
  },
});
