import NextAuth from "next-auth";
import { ZodError } from "zod";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "@/lib/zod";

export const { handlers, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
      },
      authorize: async credentials => {
        try {
          const { email, password, name } = await signInSchema.parseAsync(
            credentials
          );

          console.log("Enviando credenciais para API:", {
            email,
            password,
            name,
          });

          const loginUrl = new URL("http://localhost:3000/auth/login");
          const requestOptions: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
          };

          const response = await fetch(loginUrl.toString(), requestOptions);

          console.log("Resposta da API:", response.status, response.statusText);

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

          return { email, name, token };
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
  
  secret: process.env.NEXTAUTH_SECRET,
});
