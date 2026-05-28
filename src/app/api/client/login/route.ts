import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:4000'}/client/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: "Credenciais inválidas" };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const authToken = response.headers.get("X-Auth-Token");
    const nextResponse = NextResponse.json({ ok: true }, { status: 200 });
    if (authToken) {
      nextResponse.headers.set("X-Auth-Token", authToken);
      nextResponse.cookies.set("client-auth-token", authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }
    return nextResponse;
  } catch (error) {
    console.error("Erro ao fazer login do cliente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
