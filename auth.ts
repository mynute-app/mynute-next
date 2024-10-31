import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth;
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      session.sessionToken = token.accessToken as string;
      console.log("session", token);
      return session;
    },
  },
});
