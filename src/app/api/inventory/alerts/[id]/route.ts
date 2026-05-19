import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

/**
 * PATCH /api/inventory/alerts/[id]
 * Atualiza o status de um alerta (resolver ou ignorar).
 *
 * GET /api/inventory/alerts/[id]
 * Retorna detalhes de um alerta específico.
 */

type RouteContext = { params: Promise<{ id: string }> };

export const GET = auth(async function GET(req, ctx) {
  try {
    const authData = getAuthDataFromRequest(req);
    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 },
      );
    }

    const { id } = await (ctx as RouteContext).params;
    if (!id) {
      return NextResponse.json({ message: "ID do alerta é obrigatório" }, { status: 400 });
    }

    const result = await fetchFromBackend(
      req,
      `/inventory/alert/${id}`,
      authData.token!,
      { method: "GET" },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno ao buscar alerta.",
      },
      { status: 500 },
    );
  }
});

export const PATCH = auth(async function PATCH(req, ctx) {
  try {
    const authData = getAuthDataFromRequest(req);
    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 },
      );
    }

    const { id } = await (ctx as RouteContext).params;
    if (!id) {
      return NextResponse.json({ message: "ID do alerta é obrigatório" }, { status: 400 });
    }

    const body = await req.json();

    const result = await fetchFromBackend(
      req,
      `/inventory/alert/${id}`,
      authData.token!,
      { method: "PATCH", body },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno ao atualizar alerta.",
      },
      { status: 500 },
    );
  }
});
