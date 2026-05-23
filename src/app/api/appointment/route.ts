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
          { status: 400 },
        );
      }
    }

    const companyId = req.headers.get("X-Company-ID");

    if (!companyId) {
      return NextResponse.json(
        { error: "X-Company-ID header é obrigatório." },
        { status: 400 },
      );
    }

    // Fazer requisição direta ao backend (rota pública, sem autenticação)
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";

    try {
      const response = await fetch(
        `${backendUrl}/appointment/?email_language=pt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Company-ID": companyId,
          },
          body: JSON.stringify(body),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          {
            error:
              data.description_br ||
              data.description_en ||
              "Erro ao criar agendamento",
            details: data,
          },
          { status: response.status },
        );
      }

      return NextResponse.json(data, { status: 201 });
    } catch (fetchError) {
      // Erro de conexão recusada
      if (
        fetchError instanceof Error &&
        (fetchError as any).cause?.code === "ECONNREFUSED"
      ) {
        const errorMessage = `Não foi possível conectar ao backend em ${backendUrl}. Verifique se o servidor está rodando.`;
        return NextResponse.json(
          {
            error: errorMessage,
            details:
              "Backend não está acessível. Verifique a URL e se o servidor está rodando.",
          },
          { status: 503 },
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
        { status: 500 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
