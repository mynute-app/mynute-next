import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { fetchFromBackend } from "@/lib/api/fetch-from-backend";

export const GET = auth(async function GET(req, ctx) {
  try {
    const token = req.auth?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { id } = ctx.params as { id: string };

    // Usando fetchFromBackend para buscar dados do funcionário
    const employeeData = await fetchFromBackend(req, `/employee/${id}`, token);

    return NextResponse.json(employeeData, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
});
