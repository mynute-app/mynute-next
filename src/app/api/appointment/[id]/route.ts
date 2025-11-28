import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

/**
 * GET /api/appointment/[id]
 *
 * Busca os detalhes de um agendamento específico por ID
 *
 * Path Params:
 * - id: ID do agendamento
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

    const { id } = ctx.params as { id: string };

    if (!id) {
      return NextResponse.json(
        { message: "ID do agendamento é obrigatório" },
        { status: 400 }
      );
    }

    const appointment = await fetchFromBackend(
      req,
      `/appointment/${id}`,
      authData.token!,
      {
        method: "GET",
      }
    );

    return NextResponse.json(appointment, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao buscar detalhes do agendamento:", error);
    return NextResponse.json(
      {
        message: "Erro interno ao buscar agendamento.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});
