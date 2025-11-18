import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = decodeURIComponent(params.email);

    console.log("📧 Enviando código de login para:", email);

    const apiUrl = process.env.BACKEND_URL;
    if (!apiUrl) {
      throw new Error("BACKEND_URL não configurada");
    }

    const response = await fetch(
      `${apiUrl}/client/send-login-code/email/${encodeURIComponent(email)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📡 Status da resposta:", response.status);

    // Verificar se há conteúdo na resposta
    const text = await response.text();
    console.log("📄 Resposta raw:", text);

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error("❌ Erro ao fazer parse do JSON:", parseError);
      data = { message: text || "Resposta vazia do servidor" };
    }

    console.log("✅ Dados parseados:", data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Erro ao enviar código" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Erro ao enviar código de login:", error);
    return NextResponse.json(
      { error: "Erro ao enviar código de verificação" },
      { status: 500 }
    );
  }
}
