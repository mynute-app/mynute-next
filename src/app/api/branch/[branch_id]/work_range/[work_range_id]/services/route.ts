import { NextResponse } from "next/server";
import { auth } from "../../../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const POST = auth(async function POST(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { branch_id, work_range_id } = (await ctx.params) as {
      branch_id: string;
      work_range_id: string;
    };

    const body = await req.json();

    console.log(
      "📦 Body recebido (POST work_range services):",
      JSON.stringify(body, null, 2)
    );
    console.log("🔍 POST Branch ID:", branch_id);
    console.log("🔍 POST Work Range ID:", work_range_id);

    const responseData = await fetchFromBackend(
      req,
      `/branch/${branch_id}/work_range/${work_range_id}/services`,
      token,
      {
        method: "POST",
        body: body,
      }
    );

    console.log("✅ Sucesso com POST (work_range services):", responseData);
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao adicionar serviços ao work_range:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
});

