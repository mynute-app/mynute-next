import { NextRequest, NextResponse } from "next/server";

interface CreateClientRequest {
  email: string;
  name: string;
  surname: string;
  phone: string;
}

/**
 * POST /api/client
 * Cria um novo cliente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("📝 Criando cliente:", body);

    // Fazer POST na API externa
    const response = await fetch(`${process.env.BACKEND_URL}/client`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("📡 Status da API:", response.status);

    if (!response.ok) {
      // Clonar a resposta para poder ler o body de múltiplas formas
      const clonedResponse = response.clone();
      let errorData;

      try {
        errorData = await response.json();
      } catch (parseError) {
        // Se falhar ao parsear JSON, tenta ler como texto
        try {
          const textError = await clonedResponse.text();
          console.log("❌ Erro (texto):", textError);
          errorData = {
            message: textError,
            error: textError,
          };
        } catch (textError) {
          console.log("❌ Erro ao ler resposta");
          errorData = {
            message: "Erro ao processar resposta do servidor",
            error: "Erro ao processar resposta do servidor",
          };
        }
      }

      console.log("❌ Erro da API:", errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const clientData = await response.json();
    console.log("✅ Cliente criado:", clientData);

    return NextResponse.json(clientData, { status: response.status });
  } catch (error) {
    console.error("❌ Erro ao criar cliente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
