import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

/**
 * GET  /api/inventory/movements — Lista movimentos do inventário
 * POST /api/inventory/movements — Registra um movimento manual
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
    if (searchParams.get("movement_type"))
      queryParams.movement_type = searchParams.get("movement_type")!;

    const result = await fetchFromBackend(
      req,
      "/inventory/movement",
      authData.token!,
      { method: "GET", queryParams },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno ao buscar movimentos.",
      },
      { status: 500 },
    );
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
      "/inventory/movement",
      authData.token!,
      { method: "POST", body },
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno ao registrar movimento.",
      },
      { status: 500 },
    );
  }
});
