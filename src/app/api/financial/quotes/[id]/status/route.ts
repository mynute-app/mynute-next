import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";
import { handleApiError, unauthorized } from "../../../_utils";

export const PATCH = auth(async function PATCH(req, ctx) {
  try {
    const authData = getAuthDataFromRequest(req);
    if (!authData.isValid) return unauthorized(authData.error ?? undefined);
    const { id } = (await ctx.params) as { id: string };
    const body = await req.json();

    const result = await fetchFromBackend(req, `/financial/quotes/${id}/status`, authData.token!, {
      method: "PATCH",
      body,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Erro ao atualizar status do orçamento.");
  }
});
