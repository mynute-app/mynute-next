import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/public/send-company-login-email
 * Envia email com links de login para todas as empresas onde o email está cadastrado.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || !body.email || typeof body.email !== "string" || body.email.trim() === "") {
      return NextResponse.json(
        { error: "Campo 'email' é obrigatório" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/public/send-company-login-email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: body.email.trim() }),
      }
    );

    if (response.status === 200) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: "Erro ao processar resposta do servidor" };
    }
    return NextResponse.json(errorData, { status: response.status });
  } catch (error) {
    console.error("Erro ao enviar email de login:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
