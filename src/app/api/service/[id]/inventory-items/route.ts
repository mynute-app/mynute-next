import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

/**
 * GET  /api/service/[id]/inventory-items — Lista itens de inventário do serviço
 * POST /api/service/[id]/inventory-items — Adiciona item de inventário ao serviço
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
        { message: "ID do serviço é obrigatório" },
        { status: 400 },
      );
    }

    const result = await fetchFromBackend(
      req,
      `/service/${id}/inventory-items`,
      authData.token!,
      { method: "GET" },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno ao buscar itens de inventário do serviço.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});

export const POST = auth(async function POST(req, ctx) {
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
        { message: "ID do serviço é obrigatório" },
        { status: 400 },
      );
    }

    const body = await req.json();

    const result = await fetchFromBackend(
      req,
      `/service/${id}/inventory-items`,
      authData.token!,
      { method: "POST", body },
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno ao adicionar item de inventário ao serviço.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});
