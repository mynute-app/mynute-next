import NextAuth from "next-auth";
import { ZodError } from "zod";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "@/lib/zod";

export const { handlers, auth, signIn } = NextAuth({
  providers: [
    Credentials({
      id: "employee-login",
      name: "Employee Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, req) => {
        try {
          const { email, password } = await signInSchema.parseAsync(
            credentials
          );

          const host = req?.headers?.get("host") || "";
          const subdomain = host.split(".")[0];

          if (!subdomain) {
            throw new Error("Subdomínio não identificado na requisição.");
          }

          const companyRes = await fetch(
            `${process.env.NEXTAUTH_URL}/api/company/subdomain/${subdomain}`,
            { cache: "no-store" }
          );

          if (!companyRes.ok) {
            throw new Error("Empresa não encontrada para o subdomínio.");
          }

          const company = await companyRes.json();
          const response = await fetch(
            `${process.env.BACKEND_URL}/employee/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Company-ID": company.id,
              },
              body: JSON.stringify({ email, password }),
            }
          );

          response.headers.forEach((value, key) => {
            console.log(`${key}: ${value}`);
          });

          if (!response.ok) {
            throw new Error(`Falha ao autenticar. Código: ${response.status}`);
          }

          const token = response.headers.get("X-Auth-Token");

          if (!token) {
            console.error(
              "Token X-Auth-Token não encontrado nos headers da resposta"
            );
            throw new Error("Token não encontrado na resposta.");
          }

          return {
            email,
            token,
            companyId: company.id,
            subdomain,
          };
        } catch (error) {
          if (error instanceof ZodError) {
            console.error("Erro de validação:", error.errors);
            return null;
          }
          console.error("Erro durante a autenticação:", error);
          return null;
        }
      },
    }),
    Credentials({
      id: "code-login",
      name: "Code Login",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      authorize: async (credentials, req) => {
        try {
          const { email, code } = credentials as {
            email: string;
            code: string;
          };

          if (!email || !code) {
            throw new Error("Email e código são obrigatórios");
          }

          const host = req?.headers?.get("host") || "";
          const subdomain = host.split(".")[0];

          if (!subdomain) {
            throw new Error("Subdomínio não identificado na requisição.");
          }

          const companyRes = await fetch(
            `${process.env.NEXTAUTH_URL}/api/company/subdomain/${subdomain}`,
            { cache: "no-store" }
          );

          if (!companyRes.ok) {
            throw new Error("Empresa não encontrada para o subdomínio.");
          }

          const company = await companyRes.json();

          const response = await fetch(
            `${process.env.BACKEND_URL}/employee/login-with-code`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Company-ID": company.id,
              },
              body: JSON.stringify({ email, code }),
            }
          );

          if (!response.ok) {
            throw new Error(`Código inválido ou expirado`);
          }

          const token = response.headers.get("X-Auth-Token");

          if (!token) {
            console.error(
              "Token X-Auth-Token não encontrado nos headers da resposta"
            );
            throw new Error("Token não encontrado na resposta.");
          }

          return {
            email,
            token,
            companyId: company.id,
            subdomain,
          };
        } catch (error) {
          console.error("Erro durante a autenticação com código:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.accessToken = u.token;
        token.companyId = u.companyId;
        token.subdomain = u.subdomain;
        token.email = u.email ?? token.email;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = (token as any).accessToken;

      session.user = {
        ...session.user,
        email: (token as any).email ?? session.user?.email ?? "",
      } as any;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
