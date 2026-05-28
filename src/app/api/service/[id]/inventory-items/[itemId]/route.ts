import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

/**
 * PATCH  /api/service/[id]/inventory-items/[itemId] — Atualiza item de inventário
 * DELETE /api/service/[id]/inventory-items/[itemId] — Remove item de inventário
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

    const { id, itemId } = (await ctx.params) as { id: string; itemId: string };

    if (!id || !itemId) {
      return NextResponse.json(
        { message: "ID do serviço e ID do item são obrigatórios" },
        { status: 400 },
      );
    }

    const body = await req.json();

    const result = await fetchFromBackend(
      req,
      `/service/${id}/inventory-items/${itemId}`,
      authData.token!,
      { method: "PATCH", body },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno ao atualizar item de inventário.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});

export const DELETE = auth(async function DELETE(req, ctx) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 },
      );
    }

    const { id, itemId } = (await ctx.params) as { id: string; itemId: string };

    if (!id || !itemId) {
      return NextResponse.json(
        { message: "ID do serviço e ID do item são obrigatórios" },
        { status: 400 },
      );
    }

    await fetchFromBackend(
      req,
      `/service/${id}/inventory-items/${itemId}`,
      authData.token!,
      { method: "DELETE" },
    );

    return NextResponse.json(
      { message: "Item de inventário removido com sucesso." },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno ao remover item de inventário.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});
