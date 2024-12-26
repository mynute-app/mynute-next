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
      address?: string;
      accessToken: string;
      refresh_token: string;
    };
    error?: "RefreshTokenError";
  }

}
declare module "next-auth/jwt" {
  interface JWT {
    access_token: string;
    expires_at: number;
    refresh_token?: string;
    error?: "RefreshTokenError";
  }
}