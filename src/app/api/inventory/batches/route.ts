import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { fetchFromBackend, BackendHttpError } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

/**
 * GET /api/inventory/batches
 * Returns batches/lots for a product.
 * Query params: product_id (required), status (optional, default: active)
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

    const productId = searchParams.get("product_id");
    if (!productId) {
      return NextResponse.json(
        { message: "product_id é obrigatório" },
        { status: 400 },
      );
    }
    queryParams.product_id = productId;

    const status = searchParams.get("status");
    if (status) queryParams.status = status;

    const result = await fetchFromBackend(
      req,
      "/inventory/batch",
      authData.token!,
      { method: "GET", queryParams },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof BackendHttpError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "Erro interno ao buscar lotes." }, { status: 500 });
  }
});
