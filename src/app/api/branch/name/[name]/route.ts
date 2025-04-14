import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";

export const GET = auth(async function GET(req, ctx) {
  try {
    const Authorization = req.auth?.accessToken;

    if (!Authorization) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { name } = ctx.params as { name: string };

    const backendResponse = await fetch(
      `${process.env.BACKEND_URL}/branch/name/${encodeURIComponent(name)}`,
      {
        method: "GET",
        headers: {
          Authorization,
        },
      }
    );

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error("❌ Erro ao buscar filial:", responseData);
      return NextResponse.json(responseData, {
        status: backendResponse.status,
      });
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ Erro interno ao buscar filial:", error);
    return NextResponse.json(
      { message: "Erro interno ao buscar filial" },
      { status: 500 }
    );
  }
});
