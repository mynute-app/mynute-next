import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    console.log("🔐 Login com código:", { email, code });

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email e código são obrigatórios" },
        { status: 400 }
      );
    }

    const apiUrl = process.env.BACKEND_URL;
    if (!apiUrl) {
      throw new Error("BACKEND_URL não configurada");
    }

    const response = await fetch(`${apiUrl}/client/login-with-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    });

    console.log("📡 Status da resposta:", response.status);

    // Pegar o token do header x-auth-token
    const token = response.headers.get("x-auth-token");
    console.log("🔑 Token recebido:", token ? "Sim" : "Não");

    // Verificar se há conteúdo na resposta
    const text = await response.text();
    console.log("📄 Resposta raw:", text);

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error("❌ Erro ao fazer parse do JSON:", parseError);
      data = {};
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Erro ao fazer login" },
        { status: response.status }
      );
    }

    // Se tiver token no header, adicionar na resposta
    if (token) {
      return NextResponse.json({
        message: "Login realizado com sucesso",
        token,
        client: data.client || {},
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Erro ao fazer login com código:", error);
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 });
  }
}
