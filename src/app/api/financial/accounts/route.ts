import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";
import { getQueryParams, handleApiError, unauthorized } from "../_utils";

export const GET = auth(async function GET(req) {
  try {
    const authData = getAuthDataFromRequest(req);
    if (!authData.isValid) return unauthorized(authData.error ?? undefined);

    const result = await fetchFromBackend(
      req,
      "/financial/accounts",
      authData.token!,
      { method: "GET", queryParams: getQueryParams(req) },
    );
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Erro ao buscar contas financeiras.");
  }
});

export const POST = auth(async function POST(req) {
  try {
    const authData = getAuthDataFromRequest(req);
    if (!authData.isValid) return unauthorized(authData.error ?? undefined);
    const body = await req.json();

    const result = await fetchFromBackend(req, "/financial/accounts", authData.token!, {
      method: "POST",
      body,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Erro ao criar conta financeira.");
  }
});
