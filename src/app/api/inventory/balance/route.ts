import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { fetchFromBackend, BackendHttpError } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

/**
 * GET /api/inventory/balance
 * Retorna saldo de estoque por produto/local.
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
    if (searchParams.get("product_id"))
      queryParams.product_id = searchParams.get("product_id")!;
    if (searchParams.get("location_id"))
      queryParams.location_id = searchParams.get("location_id")!;

    const result = await fetchFromBackend(
      req,
      "/inventory/balance",
      authData.token!,
      { method: "GET", queryParams },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof BackendHttpError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "Erro interno ao buscar saldo de estoque." }, { status: 500 });
  }
});
