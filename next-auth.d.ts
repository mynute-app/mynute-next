import NextAuth from "next-auth";

// Extendendo os tipos de sessão e token
declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      email: string;
      name: string;
    };
  }

  interface User {
    token: string;
    email: string;
    name: string;
  }
}
