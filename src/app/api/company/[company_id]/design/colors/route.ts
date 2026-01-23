import { NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const PUT = auth(async function PUT(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { company_id } = (await ctx.params) as { company_id: string };
    const body = await req.json();

    const responseData = await fetchFromBackend(
      req,
      `/company/${company_id}/design/colors`,
      token,
      {
        method: "PUT",
        body,
      }
    );

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao atualizar cores da empresa:", error);
    return NextResponse.json(
      { message: "Erro interno ao atualizar cores da empresa" },
      { status: 500 }
    );
  }
});

