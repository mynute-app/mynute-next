import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const GET = auth(async function GET(req, ctx) {
  try {
    const token = req.auth?.accessToken;
    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id } = (await ctx.params) as { employee_id: string };

    const data = await fetchFromBackend(
      req,
      `/employee/${employee_id}/blocked-dates`,
      token,
      { method: "GET" },
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao buscar datas bloqueadas do funcionário:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
});

export const POST = auth(async function POST(req, ctx) {
  try {
    const token = req.auth?.accessToken;
    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { employee_id } = (await ctx.params) as { employee_id: string };
    const body = await req.json();

    const data = await fetchFromBackend(
      req,
      `/employee/${employee_id}/blocked-dates`,
      token,
      { method: "POST", body },
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao criar data bloqueada do funcionário:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
});
