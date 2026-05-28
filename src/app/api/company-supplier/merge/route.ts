import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";
import { rateLimit } from "@/lib/rate-limit";

// 10 merge operations/minute per IP — merges are destructive mutations
const checkLimit = rateLimit({ maxRequests: 10, windowMs: 60_000 });

export const POST = auth(async function POST(req) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const rl = checkLimit(ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { message: "Muitas tentativas. Tente novamente em breve." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

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
