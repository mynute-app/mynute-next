import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { fetchFromBackend, BackendUnauthorizedError, BackendHttpError } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

/**
 * GET /api/appointment/[id]/inventory-usages
 * Retorna todos os usos de inventário de um agendamento.
 */

export const GET = auth(async function GET(req, ctx) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 },
      );
    }

    const { id } = (await ctx.params) as { id: string };

    if (!id) {
      return NextResponse.json(
        { message: "ID do agendamento é obrigatório" },
        { status: 400 },
      );
    }

    const result = await fetchFromBackend(
      req,
      `/appointment/${id}/inventory-usages`,
      authData.token!,
      { method: "GET" },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof BackendUnauthorizedError) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }
    const status = error instanceof BackendHttpError ? error.status : 500;
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao buscar uso de inventário do agendamento" },
      { status },
    );
  }
});
