import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const requiredFields = [
      "branch_id",
      "client_id",
      "company_id",
      "employee_id",
      "service_id",
      "start_time",
      "time_zone",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Campo obrigatório ausente: ${field}` },
          { status: 400 }
        );
      }
    }

    const companyId = req.headers.get("X-Company-ID");

    if (!companyId) {
      return NextResponse.json(
        { error: "X-Company-ID header é obrigatório." },
        { status: 400 }
      );
    }

    // Fazer requisição direta ao backend (rota pública, sem autenticação)
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";

    console.log("📤 ENVIANDO PARA BACKEND:");
    console.log("URL:", `${backendUrl}/appointment`);
    console.log("Backend URL da env:", process.env.BACKEND_URL);
    console.log("Headers:", {
      "Content-Type": "application/json",
      "X-Company-ID": companyId,
    });
    console.log("Body:", JSON.stringify(body, null, 2));

    try {
      const response = await fetch(`${backendUrl}/appointment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Company-ID": companyId,
        },
        body: JSON.stringify(body),
      });

      console.log("📥 RESPOSTA DO BACKEND:");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);

      const data = await response.json();
      console.log("Data:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error("❌ Erro do backend:", data);
        return NextResponse.json(
          {
            error:
              data.description_br ||
              data.description_en ||
              "Erro ao criar agendamento",
            details: data,
          },
          { status: response.status }
        );
      }

      console.log("✅ Agendamento criado com sucesso!");
      return NextResponse.json(data, { status: 201 });
    } catch (fetchError) {
      console.error("❌ Erro ao fazer fetch para o backend:", fetchError);
      console.error(
        "Stack:",
        fetchError instanceof Error ? fetchError.stack : "N/A"
      );
      console.error(
        "Causa:",
        fetchError instanceof Error ? (fetchError as any).cause : "N/A"
      );

      // Erro de conexão recusada
      if (
        fetchError instanceof Error &&
        (fetchError as any).cause?.code === "ECONNREFUSED"
      ) {
        const errorMessage = `Não foi possível conectar ao backend em ${backendUrl}. Verifique se o servidor está rodando.`;
        console.error("🔴", errorMessage);
        return NextResponse.json(
          {
            error: errorMessage,
            details:
              "Backend não está acessível. Verifique a URL e se o servidor está rodando.",
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          error:
            fetchError instanceof Error
              ? fetchError.message
              : "Erro ao criar agendamento",
          details: "Erro ao comunicar com o backend",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Erro no servidor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
