import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { fetchFromBackend, BackendHttpError } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

/**
 * GET /api/inventory/products
 * Lista todos os produtos do inventário com suporte a paginação e busca.
 *
 * POST /api/inventory/products
 * Cria um novo produto no inventário.
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
    if (searchParams.get("search"))
      queryParams.search = searchParams.get("search")!;
    if (searchParams.get("is_active"))
      queryParams.is_active = searchParams.get("is_active")!;

    const result = await fetchFromBackend(
      req,
      "/inventory/product",
      authData.token!,
      { method: "GET", queryParams },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof BackendHttpError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "Erro interno ao buscar produtos." }, { status: 500 });
  }
});

export const POST = auth(async function POST(req) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 },
      );
    }

    const body = await req.json();

    const result = await fetchFromBackend(
      req,
      "/inventory/product",
      authData.token!,
      { method: "POST", body },
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof BackendHttpError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "Erro interno ao criar produto." }, { status: 500 });
  }
});
