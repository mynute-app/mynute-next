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
      authorize: async credentials => {
        try {
          const { email, password } = await signInSchema.parseAsync(
            credentials
          );

          const loginUrl = new URL("http://localhost:4000/employee/login");
          const response = await fetch(loginUrl.toString(), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Company-ID": "f5180756-82ec-48ea-8326-870c9c4200a4",
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            throw new Error(`Falha ao autenticar. Código: ${response.status}`);
          }

          const token = response.headers.get("X-Auth-Token");

          if (!token) throw new Error("Token não encontrado na resposta.");

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
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
