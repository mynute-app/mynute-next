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

    console.log("📦 Body recebido:", JSON.stringify(body, null, 2));

    if (!body.work_schedule || !body.work_schedule.employee_work_ranges) {
      return NextResponse.json(
        { message: "work_schedule com employee_work_ranges é obrigatório" },
        { status: 400 }
      );
    }

    console.log("🔍 Employee ID:", employee_id);
    console.log(
      "🗓️ Work schedule data:",
      JSON.stringify(body.work_schedule, null, 2)
    );

    const responseData = await fetchFromBackend(
      req,
      `/employee/${employee_id}/work_schedule`,
      token,
      {
        method: "POST",
        body: body.work_schedule,
      }
    );

    console.log("✅ Sucesso com POST:", responseData);
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao processar work_schedule:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
});
