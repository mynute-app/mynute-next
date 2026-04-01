import { NextRequest, NextResponse } from "next/server";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const serviceId = resolvedParams?.id;

    if (!serviceId) {
      return NextResponse.json(
        { message: "ID do serviço não informado." },
        { status: 400 }
      );
    }

    // Extrair parâmetros da URL
    const { searchParams } = new URL(req.url);
    const timezone = searchParams.get("timezone");
    const dateForwardStart = searchParams.get("date_forward_start");
    const dateForwardEnd = searchParams.get("date_forward_end");
    const clientId = searchParams.get("client_id"); // Opcional

    // Validar parâmetros obrigatórios
    if (!timezone) {
      return NextResponse.json(
        { message: "Timezone é obrigatório." },
        { status: 400 }
      );
    }

    if (!dateForwardStart) {
      return NextResponse.json(
        { message: "date_forward_start é obrigatório." },
        { status: 400 }
      );
    }

    if (!dateForwardEnd) {
      return NextResponse.json(
        { message: "date_forward_end é obrigatório." },
        { status: 400 }
      );
    }

    // Validar se os valores são números válidos
    const startNum = Number(dateForwardStart);
    const endNum = Number(dateForwardEnd);

    if (isNaN(startNum) || isNaN(endNum)) {
      return NextResponse.json(
        {
          message:
            "date_forward_start e date_forward_end devem ser números válidos.",
        },
        { status: 400 }
      );
    }

    // Extrair X-Company-ID do header
    const companyId = req.headers.get("X-Company-ID");

    if (!companyId) {
      return NextResponse.json(
        { message: "X-Company-ID header é obrigatório." },
        { status: 400 }
      );
    }

    try {
      // Construir a URL com parâmetros de query
      const queryParams = new URLSearchParams({
        timezone,
        date_forward_start: dateForwardStart,
        date_forward_end: dateForwardEnd,
      });

      // Adicionar client_id se fornecido
      if (clientId) {
        queryParams.append("client_id", clientId);
      }

      const availability = await fetchFromBackend(
        req,
        `/service/${serviceId}/availability?${queryParams.toString()}`,
        "",
        {
          method: "GET",
          headers: {
            "X-Company-ID": companyId,
          },
          skipCompanyContext: true,
        }
      );

      return NextResponse.json(availability, { status: 200 });
    } catch (fetchError) {
      console.error(
        "❌ Erro ao buscar disponibilidade do serviço:",
        fetchError
      );
      // Retorna estrutura vazia e válida para não crashar a tela
      return NextResponse.json(
        {
          service_id: serviceId,
          available_dates: [],
          employee_info: [],
          branch_info: [],
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("❌ Erro no servidor:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
