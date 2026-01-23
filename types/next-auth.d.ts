import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      email: string;
      name: string;
    } & DefaultSession["user"];
  }

  interface User {
    token: string;
    email: string;
    name: string;
  }
}
