import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/public/check-email?email=X
 * Verifica se o email está cadastrado como cliente e/ou em empresas.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Parâmetro 'email' é obrigatório" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/public/check-email?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Erro ao verificar email:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
