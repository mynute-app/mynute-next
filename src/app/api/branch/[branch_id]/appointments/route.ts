import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";
import { getAuthDataFromRequest } from "@/utils/decode-jwt";

// GET /api/branch/[branch_id]/appointments
// Retrieve all appointments for a branch with pagination
export const GET = auth(async function GET(req, ctx) {
  try {
    const authData = getAuthDataFromRequest(req);

    if (!authData.isValid) {
      return NextResponse.json(
        { message: authData.error || "Token inválido" },
        { status: 401 }
      );
    }

    const { branch_id } = ctx.params as { branch_id: string };

    if (!branch_id) {
      return NextResponse.json(
        { message: "Branch ID é obrigatório" },
        { status: 400 }
      );
    }

    // Extract query parameters for pagination
    const { searchParams } = req.nextUrl;
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("page_size") || "10";

    const queryParams = {
      page,
      page_size: pageSize,
    };

    const appointments = await fetchFromBackend(
      req,
      `/branch/${branch_id}/appointments`,
      authData.token!,
      {
        method: "GET",
        queryParams,
      }
    );

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao buscar agendamentos da filial:", error);
    return NextResponse.json(
      {
        message: "Erro interno ao buscar agendamentos.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});
