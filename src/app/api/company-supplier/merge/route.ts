import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

export const POST = auth(async function POST(req) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { keep_id, delete_id } = body;

    if (!keep_id || !delete_id) {
      return NextResponse.json(
        { message: "keep_id e delete_id são obrigatórios." },
        { status: 400 }
      );
    }

    if (keep_id === delete_id) {
      return NextResponse.json(
        { message: "keep_id e delete_id devem ser diferentes." },
        { status: 400 }
      );
    }

    const result = await fetchFromBackend(
      req,
      "/company-supplier/merge",
      authData.token!,
      {
        method: "POST",
        body: { keep_id, delete_id },
      }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao mesclar fornecedores:", error);
    return NextResponse.json(
      {
        message: "Erro interno ao mesclar fornecedores.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});
