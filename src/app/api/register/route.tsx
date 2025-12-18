import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();


    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/user?language=pt`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    // ✅ Corrigindo a leitura do corpo da resposta
    const backendText = await backendResponse.text();
    let backendJson;
    try {
      backendJson = JSON.parse(backendText);
    } catch {
      backendJson = backendText;
    }

    if (backendResponse.ok) {
      return NextResponse.json(
        { message: "Usuário cadastrado com sucesso" },
        { status: backendResponse.status }
      );
    }

    // 🚨 Se a senha não atender aos critérios, retorne um erro claro
    if (
      backendResponse.status === 500 &&
      typeof backendJson === "string" &&
      backendJson.includes(
        "password must contain at least one uppercase letter"
      )
    ) {
      return NextResponse.json(
        {
          field: "password",
          message: "A senha deve conter pelo menos uma letra maiúscula.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Erro desconhecido ao registrar.",
        backendResponse: backendJson,
      },
      { status: backendResponse.status }
    );
  } catch (error) {
    console.error("❌ Erro no servidor:", error);
    return NextResponse.json(
      {
        message: "Erro interno no servidor",
        error: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
