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

    const appointment = await fetchFromBackend(
      req,
      `/appointment/${id}`,
      authData.token!,
      {
        method: "GET",
      },
    );

    return NextResponse.json(appointment, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno ao buscar agendamento.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});

/**
 * DELETE /api/appointment/[id]
 *
 * Deleta um agendamento específico por ID
 *
 * Path Params:
 * - id: ID do agendamento
 */
export const DELETE = auth(async function DELETE(req, ctx) {
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

    await fetchFromBackend(req, `/appointment/${id}`, authData.token!, {
      method: "DELETE",
    });

    return NextResponse.json(
      { message: "Agendamento cancelado com sucesso" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno ao deletar agendamento.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});

/**
 * PATCH /api/appointment/[id]
 *
 * Atualiza um agendamento (funcionário, data/hora)
 *
 * Path Params:
 * - id: ID do agendamento
 *
 * Body:
 * - employee_id: string
 * - start_time: ISO string
 * - end_time: ISO string
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

    const body = await req.json();

    const result = await fetchFromBackend(
      req,
      `/appointment/${id}?email_language=pt`,
      authData.token!,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno ao atualizar agendamento.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});
