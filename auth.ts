import Google from "next-auth/providers/google";
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";

const providers: Provider[] = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID!,
    clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    authorization: {
      params: {
        scope: "openid email profile https://www.googleapis.com/auth/calendar",
        access_type: "offline",
        prompt: "consent", // Garante a geração do `refresh_token`
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
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          access_token: account.access_token,
          expires_at: Math.floor(Date.now() / 1000 + (account.expires_in || 0)),
          refresh_token: account.refresh_token,
        };
      } else if (token.expires_at && Date.now() < token.expires_at * 1000) {
        return token;
      } else {
        if (!token.refresh_token) throw new TypeError("Refresh token ausente");

        try {
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: process.env.AUTH_GOOGLE_ID!,
              client_secret: process.env.AUTH_GOOGLE_SECRET!,
              grant_type: "refresh_token",
              refresh_token: token.refresh_token,
            }),
          });

          const refreshedTokens = await response.json();

          if (!response.ok) {
            throw refreshedTokens;
          }

          return {
            ...token,
            access_token: refreshedTokens.access_token,
            expires_at: Math.floor(Date.now() / 1000 + 3 * 60), // 
            refresh_token: refreshedTokens.refresh_token || token.refresh_token, // Preserve o antigo caso não receba um novo
          };
        } catch (error) {
          console.error("Erro ao renovar o token de acesso:", error);
          return {
            ...token,
            error: "RefreshTokenError",
          };
        }
      }
    },
    async session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.email_verified = token.email_verified as boolean;
      session.user.firstName = token.given_name as string;
      session.user.lastName = token.family_name as string;
      session.user.accessToken = token.access_token as string;
      session.error = token.error;

      return session;
    },
  },
});

