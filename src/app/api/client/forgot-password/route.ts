import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body as { email?: string };

    if (!email) {
      return NextResponse.json(
        { error: "Campo 'email' é obrigatório" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/client/reset-password/${encodeURIComponent(email)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.status === 200) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: "Erro ao redefinir senha" };
    }
    return NextResponse.json(errorData, { status: response.status });
  } catch (error) {
    console.error("Erro ao redefinir senha do cliente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
