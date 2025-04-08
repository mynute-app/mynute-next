import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";

export const GET = auth(async function GET(req, ctx) {
  const Authorization = req.auth?.accessToken;

  if (!Authorization) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  const { id } = ctx.params as { id: string };

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/employee/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
});
