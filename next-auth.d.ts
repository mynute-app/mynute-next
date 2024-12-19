import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email_verified: boolean;
      firstName?: string;
      lastName?: string;
      email?: string;
      name?: string;
      image?: string;
    };
  }

  interface JWT {
    sub: string;
    email_verified: boolean;
    givenName?: string;
    familyName?: string;
  }
}
