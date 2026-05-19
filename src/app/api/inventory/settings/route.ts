import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

/**
 * GET   /api/inventory/settings — Busca configurações do inventário
 * PATCH /api/inventory/settings — Atualiza configurações
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

    const result = await fetchFromBackend(
      req,
      "/inventory/settings",
      authData.token!,
      { method: "GET" },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno ao buscar configurações.",
      },
      { status: 500 },
    );
  }
});

export const PATCH = auth(async function PATCH(req) {
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
      "/inventory/settings",
      authData.token!,
      { method: "PATCH", body },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno ao atualizar configurações.",
      },
      { status: 500 },
    );
  }
});
