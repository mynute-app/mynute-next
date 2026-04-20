import NextAuth from "next-auth";
import { z, ZodError } from "zod";
import Credentials from "next-auth/providers/credentials";
import { resolveTenantSlugFromRequest } from "@/lib/tenant";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
import { getCompanyByTenantSlug } from "@/lib/tenant-company";

function getTenantFromAuthRequest(
  req: Request,
  credentials?: Partial<Record<string, unknown>>,
) {
  const credentialTenant =
    typeof credentials?.tenant === "string" ? credentials.tenant : null;

  return resolveTenantSlugFromRequest(req, credentialTenant);
}

export const { handlers, auth, signIn } = NextAuth({
  trustHost: true,
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
          const { email, password } = await signInSchema.parseAsync(credentials);
          const tenant = getTenantFromAuthRequest(req, credentials);

          if (!tenant) {
            throw new Error("Tenant nao identificado na requisicao.");
          }

          const companyLookup = await getCompanyByTenantSlug(tenant);

          if (!companyLookup.success) {
            throw new Error("Empresa nao encontrada para o tenant informado.");
          }

          const company = companyLookup.company;
          const response = await fetch(`${process.env.BACKEND_URL}/employee/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Company-ID": company.id,
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            throw new Error(`Falha ao autenticar. Codigo: ${response.status}`);
          }

          const token = response.headers.get("X-Auth-Token");

          if (!token) {
            throw new Error("Token nao encontrado na resposta.");
          }

          const fallbackName = email?.split("@")[0] || "Funcionario";

          return {
            email,
            name: fallbackName,
            token,
            companyId: company.id,
            subdomain: tenant,
            tenant,
          };
        } catch (error) {
          if (error instanceof ZodError) {
            console.error("Erro de validacao:", error.errors);
            return null;
          }
          console.error("Erro durante a autenticacao:", error);
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
            throw new Error("Email e codigo sao obrigatorios");
          }

          const tenant = getTenantFromAuthRequest(req, credentials);

          if (!tenant) {
            throw new Error("Tenant nao identificado na requisicao.");
          }

          const companyLookup = await getCompanyByTenantSlug(tenant);

          if (!companyLookup.success) {
            throw new Error("Empresa nao encontrada para o tenant informado.");
          }

          const company = companyLookup.company;

          const response = await fetch(
            `${process.env.BACKEND_URL}/employee/login-with-code`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Company-ID": company.id,
              },
              body: JSON.stringify({ email, code }),
            },
          );

          if (!response.ok) {
            throw new Error("Codigo invalido ou expirado");
          }

          const token = response.headers.get("X-Auth-Token");

          if (!token) {
            throw new Error("Token nao encontrado na resposta.");
          }

          const fallbackName = email?.split("@")[0] || "Funcionario";

          return {
            email,
            name: fallbackName,
            token,
            companyId: company.id,
            subdomain: tenant,
            tenant,
          };
        } catch (error) {
          console.error("Erro durante a autenticacao com codigo:", error);
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
        token.tenant = u.tenant ?? u.subdomain;
        token.email = u.email ?? token.email;
        token.name = u.name ?? token.name ?? u.email ?? token.email;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = (token as any).accessToken;
      (session as any).tenant = (token as any).tenant ?? (token as any).subdomain;

      session.user = {
        ...session.user,
        email: (token as any).email ?? session.user?.email ?? "",
        name:
          (token as any).name ??
          session.user?.name ??
          (token as any).email ??
          "Funcionario",
      } as any;
      return session;
    },
  },
  pages: {
    signIn: "/auth/employee",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
