import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const POST = auth(async function POST(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id } = ctx.params as {
      employee_id: string;
    };

    const body = await req.json();

    console.log(
      "📦 Body recebido (POST employee work_range):",
      JSON.stringify(body, null, 2)
    );
    console.log("🔍 POST Employee ID:", employee_id);

    const responseData = await fetchFromBackend(
      req,
      `/employee/${employee_id}/work_range`,
      token,
      {
        method: "POST",
        body: body,
      }
    );

    console.log("✅ Sucesso com POST (employee work_range):", responseData);
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao criar employee work_range:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
});
