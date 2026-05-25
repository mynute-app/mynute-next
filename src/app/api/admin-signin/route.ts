import { NextRequest, NextResponse } from "next/server";
import { encode } from "@auth/core/jwt";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha obrigatorios" }, { status: 400 });
    }

    // Chamar o backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
    const response = await fetch(`${backendUrl}/system-admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 });
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    const token = response.headers.get("X-Auth-Token") ?? data?.token;

    if (!token) {
      return NextResponse.json({ error: "Token nao retornado pelo backend" }, { status: 500 });
    }

    // Criar JWT do NextAuth manualmente
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "";

    const jwtPayload = {
      email,
      name: email.split("@")[0] || "Admin",
      accessToken: token,
      isSystemAdmin: true,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 dias
    };

    const encoded = await encode({
      token: jwtPayload,
      secret,
      salt: "authjs.session-token",
    });

    // Definir o cookie de sessão do NextAuth
    const cookieName = "authjs.session-token";
    const res = NextResponse.json({ ok: true, redirect: "/admin/whatsapp" });
    res.cookies.set(cookieName, encoded, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return res;
  } catch (err: any) {
    console.error("[admin-signin] error:", err?.message);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
