import { NextRequest, NextResponse } from "next/server";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = params?.id;

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
      return NextResponse.json(
        {
          error:
            fetchError instanceof Error
              ? fetchError.message
              : "Erro ao buscar disponibilidade do serviço",
        },
        { status: 500 }
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
