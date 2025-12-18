import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = decodeURIComponent(params.email);

    const apiUrl = process.env.BACKEND_URL;
    if (!apiUrl) {
      throw new Error("BACKEND_URL não configurada");
    }

    const backendUrl = `${apiUrl}/client/send-login-code/email/${encodeURIComponent(
      email
    )}?language=pt`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const text = await response.text();

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error("❌ Erro ao fazer parse do JSON:", parseError);
      data = { message: text || "Resposta vazia do servidor" };
    }


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
