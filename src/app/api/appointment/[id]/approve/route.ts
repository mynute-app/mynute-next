import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

/**
 * PATCH /api/appointment/[id]/approve
 *
 * Aprova um agendamento pelo funcionário responsável.
 * Retorna erro se já aprovado, cancelado ou se houver conflito de horário.
 */
export const PATCH = auth(async function PATCH(req, ctx) {
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
      `/appointment/${id}/approve`,
      authData.token!,
      { method: "PATCH" },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao aprovar agendamento:", error);
    return NextResponse.json(
      {
        message: "Erro interno ao aprovar agendamento.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});
