import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

/**
 * GET /api/employee/[employee_id]/appointments
 *
 * Busca agendamentos de um funcionário com paginação e filtros
 *
 * Query Params:
 * - page: número da página (padrão: 1)
 * - page_size: tamanho da página (padrão: 10)
 * - start_date: data inicial no formato DD/MM/YYYY
 * - end_date: data final no formato DD/MM/YYYY
 * - cancelled: filtrar agendamentos cancelados (true/false)
 * - branch_id: ID da filial para filtrar
 * - service_id: ID do serviço para filtrar
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

    const { employee_id } = ctx.params as { employee_id: string };

    if (!employee_id) {
      return NextResponse.json(
        { message: "Employee ID é obrigatório" },
        { status: 400 }
      );
    }

    // Extract query parameters for pagination and filtering
    const { searchParams } = req.nextUrl;
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("page_size") || "10";
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const cancelled = searchParams.get("cancelled");
    const branchId = searchParams.get("branch_id");
    const serviceId = searchParams.get("service_id");
    const timezone = searchParams.get("timezone") || "America/Sao_Paulo";

    const queryParams: Record<string, string> = {
      page,
      page_size: pageSize,
      timezone,
    };

    // Adicionar parâmetros opcionais apenas se fornecidos
    if (startDate) queryParams.start_date = startDate;
    if (endDate) queryParams.end_date = endDate;
    if (cancelled) queryParams.cancelled = cancelled;
    if (branchId) queryParams.branch_id = branchId;
    if (serviceId) queryParams.service_id = serviceId;

    const appointments = await fetchFromBackend(
      req,
      `/employee/${employee_id}/appointments`,
      authData.token!,
      {
        method: "GET",
        queryParams,
      }
    );

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao buscar agendamentos do funcionário:", error);
    return NextResponse.json(
      {
        message: "Erro interno ao buscar agendamentos.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});
