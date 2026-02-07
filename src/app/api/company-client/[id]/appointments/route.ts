import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

/**
 * GET /api/company-client/[id]/appointments
 *
 * Busca agendamentos de um cliente com paginação e filtros.
 *
 * Query Params:
 * - page: número da página (padrão: 1)
 * - page_size: tamanho da página (padrão: 10)
 * - start_date: data inicial DD/MM/YYYY
 * - end_date: data final DD/MM/YYYY
 * - cancelled: filtrar cancelados (true/false)
 * - timezone: timezone (padrão: America/Sao_Paulo)
 */
export const GET = auth(async function GET(req, ctx) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 }
      );
    }

    const { id } = (await ctx.params) as { id: string };

    if (!id) {
      return NextResponse.json(
        { message: "Client ID é obrigatório" },
        { status: 400 }
      );
    }

    const { searchParams } = req.nextUrl;
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("page_size") || "10";
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const cancelled = searchParams.get("cancelled");
    const timezone = searchParams.get("timezone") || "America/Sao_Paulo";

    const queryParams: Record<string, string> = {
      page,
      page_size: pageSize,
      timezone,
    };

    if (startDate) queryParams.start_date = startDate;
    if (endDate) queryParams.end_date = endDate;
    if (cancelled) queryParams.cancelled = cancelled;

    const appointments = await fetchFromBackend(
      req,
      `/company-client/${id}/appointments`,
      authData.token!,
      {
        method: "GET",
        queryParams,
      }
    );

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao buscar agendamentos do cliente:", error);
    return NextResponse.json(
      {
        message: "Erro interno ao buscar agendamentos.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});
