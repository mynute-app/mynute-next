import NextAuth from "next-auth";
import { ZodError } from "zod";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "@/lib/zod";

export const { handlers, auth, signIn } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async credentials => {
        try {
          const { email, password } = await signInSchema.parseAsync(
            credentials
          );

          console.log("Enviando credenciais para API:", {
            email,
            password,
          });

          const loginUrl = new URL("http://localhost:4000/user/login");
          const requestOptions: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          };

          const response = await fetch(loginUrl.toString(), requestOptions);

          console.log("Resposta da API:", response.status, response.statusText);

          // Logando os headers da resposta
          console.log(
            "Headers da resposta:",
            Object.fromEntries(response.headers)
          );

          if (!response.ok) {
            throw new Error(`Falha ao autenticar. Código: ${response.status}`);
          }

          const token = response.headers.get("Authorization");

          if (!token) {
            console.error(
              "Token não encontrado no cabeçalho:",
              response.headers
            );
            throw new Error("Token não encontrado na resposta.");
          }

          console.log("Token recebido:", token);

          return { email, token };
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

          // ✅ Captura o subdomínio da requisição via header
          const host = req?.headers?.get("host") || "";
          const subdomain = host.split(".")[0];

          if (!subdomain) {
            throw new Error("Subdomínio não identificado na requisição.");
          }

          // ✅ Busca empresa via rota local (proxy)
          const companyRes = await fetch(
            `http://localhost:3000/api/company/subdomain/${subdomain}`,
            { cache: "no-store" }
          );

          if (!companyRes.ok) {
            throw new Error("Empresa não encontrada para o subdomínio.");
          }

          const company = await companyRes.json(); // ✅ Realiza login com X-Company-ID
          const response = await fetch("http://localhost:4000/employee/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Company-ID": company.id,
            },
            body: JSON.stringify({ email, password }),
          });

          console.log(
            "Resposta do employee/login:",
            response.status,
            response.statusText
          );

          // Logando todos os headers da resposta
          console.log("Headers da resposta employee/login:");
          response.headers.forEach((value, key) => {
            console.log(`${key}: ${value}`);
          });

          if (!response.ok) {
            throw new Error(`Falha ao autenticar. Código: ${response.status}`);
          }

          const token = response.headers.get("X-Auth-Token");

          console.log("X-Auth-Token recebido:", token);

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
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("JWT Callback - User token recebido:", user.token);
        token.accessToken = user.token;
        console.log(
          "JWT Callback - Token armazenado no JWT:",
          token.accessToken
        );
      }
      return token;
    },
    async session({ session, token }) {
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
