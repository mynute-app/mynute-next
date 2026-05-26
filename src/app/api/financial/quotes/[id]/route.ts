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

    const result = await fetchFromBackend(req, `/financial/quotes/${id}`, authData.token!, {
      method: "GET",
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Erro ao buscar orçamento de cliente.");
  }
});

export const PATCH = auth(async function PATCH(req, ctx) {
  try {
    const authData = getAuthDataFromRequest(req);
    if (!authData.isValid) return unauthorized(authData.error ?? undefined);
    const { id } = (await ctx.params) as { id: string };
    const body = await req.json();

    const result = await fetchFromBackend(req, `/financial/quotes/${id}`, authData.token!, {
      method: "PATCH",
      body,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Erro ao atualizar orçamento de cliente.");
  }
});

export const DELETE = auth(async function DELETE(req, ctx) {
  try {
    const authData = getAuthDataFromRequest(req);
    if (!authData.isValid) return unauthorized(authData.error ?? undefined);
    const { id } = (await ctx.params) as { id: string };

    await fetchFromBackend(req, `/financial/quotes/${id}`, authData.token!, {
      method: "DELETE",
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, "Erro ao remover orçamento de cliente.");
  }
});
