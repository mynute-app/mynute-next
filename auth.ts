import Google from "next-auth/providers/google";
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";

const providers: Provider[] = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
    authorization: {
      params: {
        scope: "openid email profile https://www.googleapis.com/auth/calendar",
      },
    },
    async profile(profile) {
      console.log("Dados do Google OAuth retornados:", profile);
      return { ...profile };
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
      session.user.id = token.sub as string;
      session.user.email_verified = token.emailVerified as boolean;
      session.user.firstName = token.givenName as string;
      session.user.lastName = token.familyName as string;
      session.user.accessToken = token.accessToken as string;
      console.log("Sessão atualizada:", session);
      return session;
    },
    async jwt({ token, profile, account }) {
      if (account) {
        console.log(
          "Dados do account (tokens retornados pelo Google):",
          account
        );
        if (account.access_token) {
          token.accessToken = account.access_token;
        }
        if (account.refresh_token) {
          token.refreshToken = account.refresh_token;
        }
      }
      if (profile) {
        console.log("Dados do profile:", profile);
        token.sub = profile.sub as string;
        token.emailVerified = profile.email_verified;
        token.givenName = profile.given_name;
        token.familyName = profile.family_name;
      }
      return token;
    },
  },
});
