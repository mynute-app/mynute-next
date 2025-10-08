import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const POST = auth(async function POST(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { branch_id } = ctx.params as {
      branch_id: string;
    };

    const body = await req.json();

    if (!body.work_schedule || !body.work_schedule.branch_work_ranges) {
      return NextResponse.json(
        { message: "work_schedule com branch_work_ranges é obrigatório" },
        { status: 400 }
      );
    }

    const responseData = await fetchFromBackend(
      req,
      `/branch/${branch_id}/work_schedule`,
      token,
      {
        method: "POST",
        body: body.work_schedule,
      }
    );

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao processar work_schedule da branch:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
});

export const GET = auth(async function GET(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { branch_id } = ctx.params as {
      branch_id: string;
    };

    const responseData = await fetchFromBackend(
      req,
      `/branch/${branch_id}/work_schedule`,
      token,
      {
        method: "GET",
      }
    );

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao buscar work_schedule da branch:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
});
