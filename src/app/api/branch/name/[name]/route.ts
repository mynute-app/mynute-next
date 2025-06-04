import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const GET = auth(async function GET(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { name } = ctx.params as { name: string };

    // Busca os dados da filial pelo nome usando fetchFromBackend
    const branchData = await fetchFromBackend(
      req,
      `/branch/name/${encodeURIComponent(name)}`,
      token
    );

    return NextResponse.json(branchData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro interno ao buscar filial:", error);
    return NextResponse.json(
      { message: "Erro interno ao buscar filial" },
      { status: 500 }
    );
  }
});
