import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";
import { handleApiError, unauthorized } from "../../_utils";

export const GET = auth(async function GET(req, ctx) {
  try {
    const authData = getAuthDataFromRequest(req);
    if (!authData.isValid) return unauthorized(authData.error ?? undefined);
    const { id } = (await ctx.params) as { id: string };

    const result = await fetchFromBackend(req, `/financial/transactions/${id}`, authData.token!, {
      method: "GET",
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Erro ao buscar transação financeira.");
  }
});

export const PATCH = auth(async function PATCH(req, ctx) {
  try {
    const authData = getAuthDataFromRequest(req);
    if (!authData.isValid) return unauthorized(authData.error ?? undefined);
    const { id } = (await ctx.params) as { id: string };
    const body = await req.json();

    const result = await fetchFromBackend(req, `/financial/transactions/${id}`, authData.token!, {
      method: "PATCH",
      body,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Erro ao atualizar transação financeira.");
  }
});

export const DELETE = auth(async function DELETE(req, ctx) {
  try {
    const authData = getAuthDataFromRequest(req);
    if (!authData.isValid) return unauthorized(authData.error ?? undefined);
    const { id } = (await ctx.params) as { id: string };

    await fetchFromBackend(req, `/financial/transactions/${id}`, authData.token!, {
      method: "DELETE",
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Erro ao remover transação financeira.");
  }
});
