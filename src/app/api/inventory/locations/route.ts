import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { fetchFromBackend, BackendHttpError } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

/**
 * GET /api/inventory/locations
 * Lista os locais de armazenamento do inventário.
 */

export const GET = auth(async function GET(req) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const queryParams: Record<string, string> = {};
    if (searchParams.get("page")) queryParams.page = searchParams.get("page")!;
    if (searchParams.get("page_size"))
      queryParams.page_size = searchParams.get("page_size")!;
    if (searchParams.get("is_active"))
      queryParams.is_active = searchParams.get("is_active")!;

    const result = await fetchFromBackend(
      req,
      "/inventory/location",
      authData.token!,
      { method: "GET", queryParams },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof BackendHttpError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "Erro interno ao buscar locais." }, { status: 500 });
  }
});
